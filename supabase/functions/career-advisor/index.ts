import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user_id, messages } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const [profileRes, skillsRes, recsRes, projectsRes, attemptsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user_id).maybeSingle(),
      supabase.from("user_skills").select("*, skills(name)").eq("user_id", user_id),
      supabase.from("recommendations").select("*, courses(title, platform)").eq("user_id", user_id).eq("is_active", true).order("sequence_order"),
      supabase.from("user_projects").select("*, projects(title, domain)").eq("user_id", user_id),
      supabase.from("quiz_attempts").select("*, skills(name)").eq("user_id", user_id).order("created_at", { ascending: false }).limit(5),
    ]);

    const profile = profileRes.data;
    const skills = (skillsRes.data || []).map((s: any) => `${s.skills?.name} (${s.proficiency})`).join(", ");
    const recs = (recsRes.data || []).slice(0, 5).map((r: any) => `${r.sequence_order}. ${r.courses?.title} on ${r.courses?.platform}`).join("\n");
    const projects = (projectsRes.data || []).map((p: any) => `- ${p.projects?.title} [${p.projects?.domain}] — ${p.status}`).join("\n");
    const attempts = (attemptsRes.data || []).map((a: any) => `- ${a.skills?.name}: ${a.score}/${a.total_questions}`).join("\n");

    const systemPrompt = `You are NeuroLearn Career Advisor, an expert mentor for industrial AI careers.
You have RAG context about THIS specific user. Use it. Be concrete, cite their skills, gaps, and active learning path.
Be concise, structured, and supportive. Use bullet lists and short paragraphs. Recommend specific next actions.

## USER CONTEXT
Name: ${profile?.full_name || "Student"}
Career goal: ${profile?.career_goal || "Not set"}
Target industry: ${profile?.target_industry || "Unspecified"}
Years experience: ${profile?.years_experience ?? 0}
Weekly study hours: ${profile?.weekly_hours ?? 5}
Interests: ${(profile?.interests || []).join(", ") || "None"}
Skills: ${skills || "None tracked"}

Active learning path:
${recs || "No active recommendations"}

Projects:
${projects || "None"}

Recent quiz attempts:
${attempts || "None"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits depleted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("career-advisor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
