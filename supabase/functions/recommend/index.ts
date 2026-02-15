import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user_id } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user context (RAG-style retrieval)
    const [profileRes, skillsRes, coursesRes, ratingsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user_id).maybeSingle(),
      supabase.from("user_skills").select("*, skills(*)").eq("user_id", user_id),
      supabase.from("courses").select("*").order("industry_alignment_score", { ascending: false }),
      supabase.from("course_ratings").select("*").eq("user_id", user_id),
    ]);

    const profile = profileRes.data;
    const userSkills = skillsRes.data || [];
    const courses = coursesRes.data || [];
    const ratings = ratingsRes.data || [];

    const completedCourseIds = ratings.filter(r => r.completed).map(r => r.course_id);

    // Build context for LLM
    const context = `
## Student Profile
- Career Goal: ${profile?.career_goal || "Not set"}
- Learning Style: ${profile?.learning_style || "mixed"}
- Learning Pace: ${profile?.learning_pace || "moderate"}

## Current Skills
${userSkills.length > 0 
  ? userSkills.map((us: any) => `- ${us.skills?.name}: ${us.proficiency} (confidence: ${us.confidence_score})`).join("\n")
  : "No skills tracked yet"}

## Completed Courses
${completedCourseIds.length > 0 ? completedCourseIds.length + " courses completed" : "No courses completed yet"}

## Available Courses (sorted by industry alignment)
${courses.slice(0, 20).map((c: any, i: number) => 
  `${i+1}. [ID:${c.id}] "${c.title}" | Platform: ${c.platform} | Difficulty: ${c.difficulty} | Skills: ${(c.skills_covered || []).join(", ")} | Rating: ${c.rating} | Industry Score: ${c.industry_alignment_score} | Duration: ${c.duration_hours}h`
).join("\n")}

## Industry Benchmarks
- AI Engineer: Python(90%), Machine Learning(95%), Deep Learning(90%), NLP(75%), PyTorch(80%), MLOps(70%)
- Data Engineer: Python(85%), SQL(95%), Data Engineering(95%), Cloud(85%), Docker(75%)
- ML Engineer: Python(90%), ML(90%), Deep Learning(80%), MLOps(90%), Docker(80%), Cloud(80%)
- Robotics Engineer: Python(80%), RL(85%), Robotics(95%), CV(75%), Edge AI(70%)
- Industrial AI Specialist: ML(85%), Predictive Maintenance(90%), IoT(85%), Edge AI(80%)
`;

    const systemPrompt = `You are an AI-powered e-learning recommendation engine for industrial applications. Your job is to analyze a student's profile, current skills, and career goals to recommend the optimal learning path.

You must return a JSON object with this exact structure:
{
  "explanation": "A 2-3 paragraph explanation of your reasoning, covering skill gaps identified, why these courses were chosen, and how they align with the career goal and industry requirements.",
  "recommendations": [
    {
      "course_id": "uuid-from-available-courses",
      "score": 0.0-1.0,
      "reason": "Brief explanation of why this course is recommended",
      "skill_gaps_addressed": ["skill1", "skill2"],
      "ialps_score": 0.0-1.0,
      "sequence_order": 1
    }
  ]
}

Rules:
1. Recommend 5-8 courses in optimal learning sequence
2. IALPS (Industry-Aligned Learning Path Score) considers: skill gap coverage, industry relevance, difficulty progression, and career alignment
3. Start with foundational courses, progress to advanced
4. Only use course IDs from the available courses list
5. Consider the student's current proficiency - don't recommend courses too far below their level
6. Prioritize courses that address the biggest skill gaps for their career goal
7. Return ONLY valid JSON, no markdown formatting`;

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: context },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error: " + aiResponse.status);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    
    if (!content) throw new Error("No content from AI");

    // Parse JSON from response (handle potential markdown wrapping)
    let parsed;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI recommendations");
    }

    // Deactivate old recommendations
    await supabase.from("recommendations").update({ is_active: false }).eq("user_id", user_id);

    // Insert new recommendations
    const validCourseIds = courses.map(c => c.id);
    const recs = (parsed.recommendations || [])
      .filter((r: any) => validCourseIds.includes(r.course_id))
      .map((r: any) => ({
        user_id,
        course_id: r.course_id,
        score: r.score || 0,
        reason: r.reason || "",
        skill_gaps_addressed: r.skill_gaps_addressed || [],
        ialps_score: r.ialps_score || 0,
        sequence_order: r.sequence_order || 0,
        is_active: true,
      }));

    if (recs.length > 0) {
      const { error: insertError } = await supabase.from("recommendations").insert(recs);
      if (insertError) console.error("Insert error:", insertError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      explanation: parsed.explanation || "",
      count: recs.length 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recommend error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
