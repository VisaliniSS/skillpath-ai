import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { user_id, quiz_id, answers } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: quiz } = await supabase.from("quizzes").select("*").eq("id", quiz_id).maybeSingle();
    if (!quiz) throw new Error("Quiz not found");

    const questions = (quiz.questions as any[]) || [];
    let correct = 0;
    const detail: any[] = [];
    questions.forEach((q, i) => {
      const ok = answers[i] === q.correct_index;
      if (ok) correct++;
      detail.push({ question: q.question, your_answer: answers[i], correct_answer: q.correct_index, explanation: q.explanation, ok });
    });

    const score = questions.length > 0 ? correct / questions.length : 0;
    const newProf = score >= 0.85 ? "advanced" : score >= 0.55 ? "intermediate" : "beginner";

    // Adaptive feedback loop: update user_skills
    if (quiz.skill_id) {
      const { data: existing } = await supabase
        .from("user_skills")
        .select("*")
        .eq("user_id", user_id)
        .eq("skill_id", quiz.skill_id)
        .maybeSingle();
      if (existing) {
        await supabase.from("user_skills").update({ proficiency: newProf, confidence_score: score }).eq("id", existing.id);
      } else {
        await supabase.from("user_skills").insert({ user_id, skill_id: quiz.skill_id, proficiency: newProf, confidence_score: score });
      }
    }

    const { data: attempt } = await supabase.from("quiz_attempts").insert({
      user_id, quiz_id, skill_id: quiz.skill_id, score: correct, total_questions: questions.length,
      answers: detail, new_proficiency: newProf,
      feedback: score >= 0.85 ? "Excellent — proficiency upgraded." : score >= 0.55 ? "Solid foundation, keep practicing." : "Foundational gaps detected. Review prerequisites.",
    }).select().single();

    // Award certification on perfect score
    if (score === 1) {
      await supabase.from("certifications").insert({
        user_id, title: `${quiz.title} — Mastery`, category: "Skill Assessment", badge_color: "primary",
      });
    }

    return new Response(JSON.stringify({ attempt, score, correct, total: questions.length, new_proficiency: newProf, detail }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("grade-quiz error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
