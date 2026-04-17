import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Loader2, Sparkles, CheckCircle2, XCircle, RotateCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Question = { question: string; options: string[]; correct_index: number; explanation: string };

export default function Quizzes() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<any[]>([]);
  const [skillId, setSkillId] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [generating, setGenerating] = useState(false);
  const [quiz, setQuiz] = useState<any | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [s, h] = await Promise.all([
        supabase.from("skills").select("*").order("name"),
        supabase.from("quiz_attempts").select("*, quizzes(title), skills(name)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      ]);
      setSkills(s.data || []);
      setHistory(h.data || []);
    })();
  }, [user]);

  const generate = async () => {
    if (!skillId) { toast({ title: "Pick a skill first" }); return; }
    setGenerating(true); setQuiz(null); setResult(null); setAnswers([]);
    const { data, error } = await supabase.functions.invoke("generate-quiz", { body: { skill_id: skillId, difficulty } });
    setGenerating(false);
    if (error || data?.error) { toast({ title: "Failed", description: error?.message || data?.error, variant: "destructive" }); return; }
    setQuiz(data.quiz);
    setAnswers(new Array((data.quiz.questions || []).length).fill(-1));
  };

  const submit = async () => {
    if (!user || !quiz) return;
    if (answers.some((a) => a < 0)) { toast({ title: "Answer all questions" }); return; }
    setGrading(true);
    const { data, error } = await supabase.functions.invoke("grade-quiz", { body: { user_id: user.id, quiz_id: quiz.id, answers } });
    setGrading(false);
    if (error) { toast({ title: "Grading failed", variant: "destructive" }); return; }
    setResult(data);
    toast({ title: `Score ${data.correct}/${data.total}`, description: `Proficiency → ${data.new_proficiency}` });
    const { data: h } = await supabase.from("quiz_attempts").select("*, quizzes(title), skills(name)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
    setHistory(h || []);
  };

  const reset = () => { setQuiz(null); setResult(null); setAnswers([]); };

  const questions: Question[] = quiz?.questions || [];

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"><GraduationCap className="w-5 h-5 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold">Adaptive Skill Assessments</h1>
            <p className="text-sm text-muted-foreground font-mono">Quizzes auto-update your proficiency → recommender adapts in real time</p>
          </div>
        </header>

        {!quiz && (
          <Card className="p-6 bg-card/60 backdrop-blur border-border/60 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs uppercase font-mono text-muted-foreground">Skill</label>
                <Select value={skillId} onValueChange={setSkillId}>
                  <SelectTrigger><SelectValue placeholder="Choose a skill" /></SelectTrigger>
                  <SelectContent>{skills.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs uppercase font-mono text-muted-foreground">Difficulty</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["beginner", "intermediate", "advanced"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={generate} disabled={generating || !skillId} className="w-full md:w-auto">
              {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generate AI Quiz
            </Button>
          </Card>
        )}

        {quiz && !result && (
          <Card className="p-6 bg-card/60 backdrop-blur border-border/60 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{quiz.title}</h2>
              <Badge variant="outline">{quiz.difficulty}</Badge>
            </div>
            {questions.map((q, i) => (
              <div key={i} className="space-y-2">
                <p className="font-medium text-sm">Q{i + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, j) => (
                    <button key={j} onClick={() => setAnswers(answers.map((a, idx) => (idx === i ? j : a)))}
                      className={`w-full text-left text-sm px-3 py-2 rounded-md border transition ${answers[i] === j ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/40"}`}>
                      {String.fromCharCode(65 + j)}. {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <Button onClick={submit} disabled={grading}>{grading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Submit</Button>
              <Button variant="ghost" onClick={reset}>Cancel</Button>
            </div>
          </Card>
        )}

        {result && (
          <Card className="p-6 bg-card/60 backdrop-blur border-border/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Score: {result.correct}/{result.total}</h2>
                <p className="text-sm text-muted-foreground">New proficiency: <span className="text-primary font-mono">{result.new_proficiency}</span></p>
              </div>
              <Button onClick={reset}><RotateCw className="w-4 h-4 mr-2" />New quiz</Button>
            </div>
            <div className="space-y-3">
              {result.detail.map((d: any, i: number) => (
                <div key={i} className="p-3 rounded-md border border-border/60 bg-background/40 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    {d.ok ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <XCircle className="w-4 h-4 text-destructive" />}
                    <p className="font-medium">{d.question}</p>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">Correct: option {String.fromCharCode(65 + d.correct_answer)} — {d.explanation}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {history.length > 0 && !quiz && (
          <Card className="p-6 bg-card/60 backdrop-blur border-border/60">
            <h3 className="font-semibold mb-3">Recent attempts</h3>
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between text-sm border-b border-border/40 pb-2">
                  <span>{h.quizzes?.title || h.skills?.name}</span>
                  <span className="font-mono text-primary">{h.score}/{h.total_questions} → {h.new_proficiency}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
