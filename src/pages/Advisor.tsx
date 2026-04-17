import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Sparkles, Loader2, Plus, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "@/hooks/use-toast";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What skill should I focus on next?",
  "Compare AI Engineer vs ML Engineer for me",
  "Build a 4-week intensive plan based on my profile",
  "Which of my gaps are most urgent for industry?",
];

export default function Advisor() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    const { data } = await supabase.from("chat_conversations").select("*").order("updated_at", { ascending: false });
    setConversations(data || []);
    if (data?.[0] && !activeConv) {
      setActiveConv(data[0].id);
      loadMessages(data[0].id);
    }
  };

  const loadMessages = async (convId: string) => {
    const { data } = await supabase.from("chat_messages").select("*").eq("conversation_id", convId).order("created_at");
    setMessages((data || []).map((m: any) => ({ role: m.role, content: m.content })));
  };

  const newConversation = async () => {
    if (!user) return;
    const { data } = await supabase.from("chat_conversations").insert({ user_id: user.id, title: "New conversation" }).select().single();
    if (data) {
      setConversations([data, ...conversations]);
      setActiveConv(data.id);
      setMessages([]);
    }
  };

  const deleteConversation = async (id: string) => {
    await supabase.from("chat_conversations").delete().eq("id", id);
    setConversations(conversations.filter((c) => c.id !== id));
    if (activeConv === id) { setActiveConv(null); setMessages([]); }
  };

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || !user || streaming) return;
    setInput("");

    let convId = activeConv;
    if (!convId) {
      const { data } = await supabase.from("chat_conversations").insert({ user_id: user.id, title: content.slice(0, 60) }).select().single();
      if (!data) return;
      convId = data.id;
      setActiveConv(convId);
      setConversations([data, ...conversations]);
    }

    const userMsg: Msg = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    await supabase.from("chat_messages").insert({ conversation_id: convId, user_id: user.id, role: "user", content });
    setStreaming(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/career-advisor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ user_id: user.id, messages: [...messages, userMsg] }),
      });

      if (!resp.ok) {
        if (resp.status === 429) toast({ title: "Rate limit", description: "Please wait and retry.", variant: "destructive" });
        else if (resp.status === 402) toast({ title: "Credits depleted", description: "Add funds in workspace settings.", variant: "destructive" });
        else toast({ title: "Advisor error", variant: "destructive" });
        setStreaming(false);
        return;
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(j);
            const c = p.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch { buf = line + "\n" + buf; break; }
        }
      }

      if (assistantSoFar && convId) {
        await supabase.from("chat_messages").insert({ conversation_id: convId, user_id: user.id, role: "assistant", content: assistantSoFar });
        await supabase.from("chat_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Stream failed", variant: "destructive" });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        <header className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"><MessageSquare className="w-5 h-5 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold">AI Career Advisor</h1>
            <p className="text-sm text-muted-foreground font-mono">RAG-powered • aware of your skills, gaps, and active path</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-[260px_1fr] gap-4 h-[calc(100vh-220px)]">
          <Card className="p-3 bg-card/60 backdrop-blur border-border/60 overflow-y-auto">
            <Button onClick={newConversation} variant="outline" className="w-full mb-3"><Plus className="w-4 h-4 mr-2" />New chat</Button>
            <div className="space-y-1">
              {conversations.map((c) => (
                <div key={c.id} className={`group flex items-center justify-between rounded-md px-2 py-2 text-sm cursor-pointer ${activeConv === c.id ? "bg-primary/10 text-primary" : "hover:bg-secondary"}`} onClick={() => { setActiveConv(c.id); loadMessages(c.id); }}>
                  <span className="truncate flex-1">{c.title}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {conversations.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No conversations yet</p>}
            </div>
          </Card>

          <Card className="flex flex-col bg-card/60 backdrop-blur border-border/60 overflow-hidden">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <Sparkles className="w-10 h-10 text-primary" />
                  <div>
                    <h3 className="font-semibold">Ask anything about your learning journey</h3>
                    <p className="text-sm text-muted-foreground">I have full context on your profile, skills, and recommendations.</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 max-w-2xl w-full">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} onClick={() => send(s)} className="text-left text-sm px-3 py-2 rounded-md border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-lg px-4 py-3 ${m.role === "user" ? "bg-primary/15 text-foreground border border-primary/30" : "bg-secondary/60 text-foreground"}`}>
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {streaming && messages[messages.length - 1]?.role === "user" && (
                <div className="flex"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>
              )}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="p-3 border-t border-border flex gap-2">
              <Input placeholder="Ask your advisor…" value={input} onChange={(e) => setInput(e.target.value)} disabled={streaming} />
              <Button type="submit" disabled={streaming || !input.trim()}><Send className="w-4 h-4" /></Button>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
