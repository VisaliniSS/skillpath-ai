import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const INDUSTRY_BENCHMARKS: Record<string, Record<string, number>> = {
  "AI Engineer": { Python: 0.9, "Machine Learning": 0.95, "Deep Learning": 0.9, NLP: 0.75, PyTorch: 0.8, MLOps: 0.7 },
  "Data Engineer": { Python: 0.85, SQL: 0.95, "Data Engineering": 0.95, Cloud: 0.85, Docker: 0.75 },
  "ML Engineer": { Python: 0.9, "Machine Learning": 0.9, "Deep Learning": 0.8, MLOps: 0.9, Docker: 0.8, Cloud: 0.8 },
  "Robotics Engineer": { Python: 0.8, "Reinforcement Learning": 0.85, Robotics: 0.95, "Computer Vision": 0.75, "Edge AI": 0.7 },
  "Industrial AI Specialist": { "Machine Learning": 0.85, "Predictive Maintenance": 0.9, IoT: 0.85, "Edge AI": 0.8 },
};

const PROF_SCORE: Record<string, number> = { beginner: 0.33, intermediate: 0.66, advanced: 1.0 };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user_id } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const [profileRes, skillsRes, coursesRes, ratingsRes, attemptsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user_id).maybeSingle(),
      supabase.from("user_skills").select("*, skills(*)").eq("user_id", user_id),
      supabase.from("courses").select("*").order("industry_alignment_score", { ascending: false }),
      supabase.from("course_ratings").select("*").eq("user_id", user_id),
      supabase.from("quiz_attempts").select("*, skills(name)").eq("user_id", user_id).order("created_at", { ascending: false }).limit(10),
    ]);

    const profile = profileRes.data;
    const userSkills = skillsRes.data || [];
    const courses = coursesRes.data || [];
    const ratings = ratingsRes.data || [];
    const attempts = attemptsRes.data || [];

    const completedCourseIds = new Set(ratings.filter((r: any) => r.completed).map((r: any) => r.course_id));
    const lowRated = new Set(ratings.filter((r: any) => (r.rating ?? 5) <= 2).map((r: any) => r.course_id));

    // ---- Compute deterministic skill-gap map ----
    const goal = profile?.career_goal || "";
    const benchmark = INDUSTRY_BENCHMARKS[goal] || {};
    const userSkillMap: Record<string, number> = {};
    for (const us of userSkills as any[]) {
      const name = us.skills?.name;
      if (name) userSkillMap[name] = PROF_SCORE[us.proficiency] || 0;
    }
    const gapMap: Record<string, number> = {};
    for (const [skill, req] of Object.entries(benchmark)) {
      const cur = userSkillMap[skill] || 0;
      gapMap[skill] = Math.max(0, req - cur);
    }
    const orderedGaps = Object.entries(gapMap).sort((a, b) => b[1] - a[1]);

    // ---- Pre-filter candidate courses (deterministic narrowing) ----
    const candidates = courses
      .filter((c: any) => !completedCourseIds.has(c.id) && !lowRated.has(c.id))
      .map((c: any) => {
        const covers = (c.skills_covered || []) as string[];
        let coverageScore = 0;
        for (const s of covers) coverageScore += gapMap[s] || 0;
        const interestBoost = ((profile?.interests || []) as string[]).some((i: string) =>
          covers.some((s) => s.toLowerCase().includes(i.toLowerCase()))
        ) ? 0.15 : 0;
        const industryBoost = (c.industry_alignment_score || 0) * 0.3;
        const ratingBoost = (c.rating || 0) / 5 * 0.1;
        return { course: c, preScore: coverageScore + interestBoost + industryBoost + ratingBoost };
      })
      .sort((a, b) => b.preScore - a.preScore)
      .slice(0, 25);

    const context = `## Student Profile
- Name: ${profile?.full_name || "N/A"}
- Career Goal: ${goal || "Not set"}
- Target Industry: ${profile?.target_industry || "Not specified"}
- Years of Experience: ${profile?.years_experience ?? 0}
- Prior Experience: ${profile?.prior_experience || "Not provided"}
- Learning Style: ${profile?.learning_style || "mixed"}
- Learning Pace: ${profile?.learning_pace || "moderate"}
- Weekly Study Hours: ${profile?.weekly_hours ?? 5}h
- Interests: ${(profile?.interests || []).join(", ") || "None listed"}
- Preferred Languages: ${(profile?.preferred_languages || []).join(", ") || "Any"}

## Current Skills (proficiency 0-1)
${userSkills.length > 0
  ? userSkills.map((us: any) => `- ${us.skills?.name}: ${us.proficiency} (${(PROF_SCORE[us.proficiency] || 0).toFixed(2)})`).join("\n")
  : "No skills tracked"}

## Recent Quiz Performance
${attempts.length > 0
  ? attempts.slice(0, 5).map((a: any) => `- ${a.skills?.name || "Skill"}: ${a.score}/${a.total_questions}`).join("\n")
  : "No quiz attempts yet"}

## Quantified Skill Gaps (priority order, gap size 0-1)
${orderedGaps.length > 0
  ? orderedGaps.map(([s, g]) => `- ${s}: gap ${g.toFixed(2)} (need ${(benchmark[s] * 100).toFixed(0)}%)`).join("\n")
  : "No specific benchmark — recommend foundational courses for the goal"}

## Completed: ${completedCourseIds.size} | Low-rated (excluded): ${lowRated.size}

## Candidate Courses (already filtered against gaps + interests)
${candidates.map((x, i) =>
  `${i + 1}. [ID:${x.course.id}] "${x.course.title}" | ${x.course.platform} | ${x.course.difficulty} | covers: ${(x.course.skills_covered || []).join(", ")} | rating ${x.course.rating} | industry ${x.course.industry_alignment_score} | ${x.course.duration_hours}h | preScore ${x.preScore.toFixed(2)}`
).join("\n")}`;

    const systemPrompt = `You are NeuroLearn, a senior industrial AI learning architect.
Build the optimal personalized learning path for this student. You MUST:
1. Pick 5-8 courses STRICTLY from the Candidate Courses list (use exact IDs).
2. Respect their weekly hours and learning pace when ordering.
3. Address the highest-priority skill gaps first.
4. Sequence from foundational to advanced — never recommend a course whose prerequisites the student lacks.
5. Boost courses that match their stated interests, target industry, and learning style.
6. For each pick, explain WHY in plain language tied to a specific gap, interest, or career goal.
7. Compute IALPS (Industry-Aligned Learning Path Score) per course as: 0.5*gap_coverage + 0.3*industry_alignment + 0.2*personal_fit, all 0-1.
Return ONLY via the suggest_path tool.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: context },
        ],
        tools: [{
          type: "function",
          function: {
            name: "suggest_path",
            description: "Return the personalized learning path.",
            parameters: {
              type: "object",
              properties: {
                explanation: { type: "string", description: "2-3 paragraphs covering identified gaps, sequencing rationale, and how the path serves their career goal." },
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      course_id: { type: "string" },
                      score: { type: "number" },
                      reason: { type: "string" },
                      skill_gaps_addressed: { type: "array", items: { type: "string" } },
                      ialps_score: { type: "number" },
                      sequence_order: { type: "integer" },
                    },
                    required: ["course_id", "score", "reason", "skill_gaps_addressed", "ialps_score", "sequence_order"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["explanation", "recommendations"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "suggest_path" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      if (aiResponse.status === 429)
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResponse.status === 402)
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add funds." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error: " + aiResponse.status);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call returned by model");

    const parsed = JSON.parse(toolCall.function.arguments);

    // ---- Re-rank pass: enforce candidate validity & deduplicate ----
    const validCourseIds = new Set(candidates.map((x) => x.course.id));
    const seen = new Set<string>();
    const recs = (parsed.recommendations || [])
      .filter((r: any) => validCourseIds.has(r.course_id) && !seen.has(r.course_id) && (seen.add(r.course_id), true))
      .map((r: any, idx: number) => ({
        user_id,
        course_id: r.course_id,
        score: Math.max(0, Math.min(1, r.score || 0)),
        reason: r.reason || "",
        skill_gaps_addressed: r.skill_gaps_addressed || [],
        ialps_score: Math.max(0, Math.min(1, r.ialps_score || 0)),
        sequence_order: r.sequence_order || idx + 1,
        is_active: true,
      }));

    await supabase.from("recommendations").update({ is_active: false }).eq("user_id", user_id);
    if (recs.length > 0) {
      const { error: insertError } = await supabase.from("recommendations").insert(recs);
      if (insertError) console.error("Insert error:", insertError);
    }

    return new Response(JSON.stringify({
      success: true,
      explanation: parsed.explanation || "",
      count: recs.length,
      gaps: orderedGaps.slice(0, 5),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("recommend error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
