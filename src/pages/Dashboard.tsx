import { useEffect, useState } from "react";
import { useAuth, isMockUser } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Target,
  Route,
  TrendingUp,
  Brain,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [userSkills, setUserSkills] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [stats, setStats] = useState({ courses: 0, skills: 0, completed: 0 });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      if (false) {
        // removed
        const mockProfile: Tables<"profiles"> = {
          id: "mock-profile-id",
          user_id: user.id,
          full_name: user.user_metadata?.full_name || "Demo User",
          career_goal: "Software Developer",
          learning_style: "mixed",
          learning_pace: "moderate",
          bio: "Demo user for development testing",
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const mockSkills = [
          {
            id: "mock-skill-1",
            user_id: user.id,
            skill_id: "skill-1",
            proficiency: "intermediate" as const,
            confidence_score: 0.8,
            updated_at: new Date().toISOString(),
            skills: {
              id: "skill-1",
              name: "JavaScript",
              category: "Programming",
              description: "JavaScript programming language",
              industry_relevance: 0.9,
              created_at: new Date().toISOString(),
            },
          },
          {
            id: "mock-skill-2",
            user_id: user.id,
            skill_id: "skill-2",
            proficiency: "beginner" as const,
            confidence_score: 0.6,
            updated_at: new Date().toISOString(),
            skills: {
              id: "skill-2",
              name: "React",
              category: "Frontend",
              description: "React JavaScript library",
              industry_relevance: 0.95,
              created_at: new Date().toISOString(),
            },
          },
        ];

        const mockRecommendations = [
          {
            id: "mock-rec-1",
            user_id: user.id,
            course_id: "course-1",
            score: 0.85,
            reason: "Based on your JavaScript skills",
            skill_gaps_addressed: ["Advanced JavaScript", "React Patterns"],
            ialps_score: 0.9,
            sequence_order: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            courses: {
              id: "course-1",
              title: "Advanced JavaScript Concepts",
              description: "Master advanced JavaScript concepts and patterns",
              platform: "Udemy",
              url: "https://example.com",
              thumbnail_url: null,
              instructor_name: "John Doe",
              duration_hours: 20,
              difficulty: "intermediate" as const,
              skills_covered: ["JavaScript", "ES6+", "Async Programming"],
              category: "Programming",
              rating: 4.5,
              enrollment_count: 15000,
              industry_alignment_score: 0.88,
              metadata: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
        ];

        setProfile(mockProfile);
        setUserSkills(mockSkills);
        setRecommendations(mockRecommendations);
        setStats({
          courses: mockRecommendations.length,
          skills: mockSkills.length,
          completed: 0,
        });
      } else {
        // Real database queries for production
        const [profileRes, skillsRes, recsRes, ratingsRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("user_skills")
            .select("*, skills(*)")
            .eq("user_id", user.id),
          supabase
            .from("recommendations")
            .select("*, courses(*)")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .order("sequence_order")
            .limit(5),
          supabase.from("course_ratings").select("*").eq("user_id", user.id),
        ]);

        if (profileRes.data) setProfile(profileRes.data);
        if (skillsRes.data) setUserSkills(skillsRes.data);
        if (recsRes.data) setRecommendations(recsRes.data);

        const completedCount =
          ratingsRes.data?.filter((r) => r.completed).length ?? 0;
        setStats({
          courses: recsRes.data?.length ?? 0,
          skills: skillsRes.data?.length ?? 0,
          completed: completedCount,
        });
      }
    };

    fetchData();
  }, [user]);

  const statCards = [
    {
      label: "Recommended",
      value: stats.courses,
      icon: BookOpen,
      color: "text-primary",
    },
    {
      label: "Skills Tracked",
      value: stats.skills,
      icon: Target,
      color: "text-accent",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: TrendingUp,
      color: "text-success",
    },
  ];

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome,{" "}
              <span className="text-gradient-primary">
                {profile?.full_name || "Learner"}
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-mono">
              {profile?.career_goal
                ? `Goal: ${profile.career_goal}`
                : "Set your career goal to get personalized recommendations"}
            </p>
          </div>
          <Link to="/learning-path">
            <Button className="gap-2">
              <Brain className="w-4 h-4" />
              Get AI Recommendations
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCards.map((s) => (
            <Card
              key={s.label}
              className="p-4 bg-card border-border hover:glow-border transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono text-foreground">
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Skills overview */}
        <Card className="p-5 bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              Your Skills
            </h2>
            <Link
              to="/skill-gap"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View Analysis <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {userSkills.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No skills tracked yet. Visit Skill Gap to add your skills.
            </p>
          ) : (
            <div className="grid gap-3">
              {userSkills.slice(0, 6).map((us: any) => (
                <div key={us.id} className="flex items-center gap-3">
                  <span className="text-sm text-foreground w-32 truncate">
                    {us.skills?.name}
                  </span>
                  <Progress
                    value={
                      us.proficiency === "beginner"
                        ? 33
                        : us.proficiency === "intermediate"
                          ? 66
                          : 100
                    }
                    className="flex-1 h-2"
                  />
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono capitalize"
                  >
                    {us.proficiency}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top recommendations */}
        <Card className="p-5 bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              Top Recommendations
            </h2>
            <Link
              to="/learning-path"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Full Path <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {recommendations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Generate your personalized learning path to see recommendations.
            </p>
          ) : (
            <div className="grid gap-3">
              {recommendations.map((rec: any) => (
                <div
                  key={rec.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-all"
                >
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center font-mono text-primary text-sm font-bold">
                    {rec.sequence_order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {rec.courses?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {rec.courses?.platform} • {rec.courses?.duration_hours}h
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-primary">
                      {(rec.ialps_score * 100).toFixed(0)}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">IALPS</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
