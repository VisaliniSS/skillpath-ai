import { useEffect, useState } from "react";
import { useAuth, isMockUser } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, Plus, Trash2, TrendingUp, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables, Enums } from "@/integrations/supabase/types";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const CAREER_BENCHMARKS: Record<string, Record<string, number>> = {
  "AI Engineer": {
    Python: 90,
    "Machine Learning": 95,
    "Deep Learning": 90,
    "Natural Language Processing": 75,
    PyTorch: 80,
    MLOps: 70,
    "Cloud Computing": 65,
    Docker: 60,
  },
  "Data Engineer": {
    Python: 85,
    SQL: 95,
    "Data Engineering": 95,
    "Cloud Computing": 85,
    Docker: 75,
    Kubernetes: 65,
    "Data Visualization": 60,
  },
  "ML Engineer": {
    Python: 90,
    "Machine Learning": 90,
    "Deep Learning": 80,
    MLOps: 90,
    Docker: 80,
    "Cloud Computing": 80,
    Kubernetes: 70,
  },
  "Robotics Engineer": {
    Python: 80,
    "Reinforcement Learning": 85,
    Robotics: 95,
    "Computer Vision": 75,
    "Edge AI": 70,
    IoT: 75,
    "Deep Learning": 65,
  },
  "Industrial AI Specialist": {
    "Machine Learning": 85,
    "Predictive Maintenance": 90,
    IoT: 85,
    "Edge AI": 80,
    Python: 80,
    "Data Visualization": 70,
    "Computer Vision": 65,
  },
};

const profToScore = (p: string) =>
  p === "beginner" ? 33 : p === "intermediate" ? 66 : 100;

export default function SkillGap() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [skills, setSkills] = useState<Tables<"skills">[]>([]);
  const [userSkills, setUserSkills] = useState<any[]>([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedProf, setSelectedProf] =
    useState<Enums<"proficiency_level">>("beginner");
  const [selectedGoal, setSelectedGoal] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      if (isMockUser(user)) {
        // Mock data for development
        const mockProfile = {
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

        const mockSkills: Tables<"skills">[] = [
          {
            id: "skill-1",
            name: "JavaScript",
            category: "Programming",
            description: "JavaScript programming language",
            industry_relevance: 0.9,
            created_at: new Date().toISOString(),
          },
          {
            id: "skill-2",
            name: "React",
            category: "Frontend",
            description: "React JavaScript library",
            industry_relevance: 0.95,
            created_at: new Date().toISOString(),
          },
          {
            id: "skill-3",
            name: "Python",
            category: "Programming",
            description: "Python programming language",
            industry_relevance: 0.85,
            created_at: new Date().toISOString(),
          },
          {
            id: "skill-4",
            name: "TypeScript",
            category: "Programming",
            description: "TypeScript programming language",
            industry_relevance: 0.88,
            created_at: new Date().toISOString(),
          },
          {
            id: "skill-5",
            name: "Node.js",
            category: "Backend",
            description: "Node.js runtime environment",
            industry_relevance: 0.82,
            created_at: new Date().toISOString(),
          },
          {
            id: "skill-6",
            name: "SQL",
            category: "Database",
            description: "Structured Query Language",
            industry_relevance: 0.8,
            created_at: new Date().toISOString(),
          },
          {
            id: "skill-7",
            name: "Git",
            category: "Tools",
            description: "Version control system",
            industry_relevance: 0.75,
            created_at: new Date().toISOString(),
          },
          {
            id: "skill-8",
            name: "Docker",
            category: "DevOps",
            description: "Containerization platform",
            industry_relevance: 0.78,
            created_at: new Date().toISOString(),
          },
          {
            id: "skill-9",
            name: "AWS",
            category: "Cloud",
            description: "Amazon Web Services cloud platform",
            industry_relevance: 0.85,
            created_at: new Date().toISOString(),
          },
          {
            id: "skill-10",
            name: "Machine Learning",
            category: "AI/ML",
            description: "Machine learning algorithms and techniques",
            industry_relevance: 0.9,
            created_at: new Date().toISOString(),
          },
          {
            id: "skill-11",
            name: "Data Analysis",
            category: "Data",
            description: "Data analysis and visualization",
            industry_relevance: 0.8,
            created_at: new Date().toISOString(),
          },
          {
            id: "skill-12",
            name: "HTML/CSS",
            category: "Frontend",
            description: "Web markup and styling languages",
            industry_relevance: 0.7,
            created_at: new Date().toISOString(),
          },
          {
            id: "skill-13",
            name: "MongoDB",
            category: "Database",
            description: "NoSQL database system",
            industry_relevance: 0.75,
            created_at: new Date().toISOString(),
          },
          {
            id: "skill-14",
            name: "REST APIs",
            category: "Backend",
            description: "RESTful API design and development",
            industry_relevance: 0.8,
            created_at: new Date().toISOString(),
          },
          {
            id: "skill-15",
            name: "Agile/Scrum",
            category: "Methodology",
            description: "Agile development methodologies",
            industry_relevance: 0.7,
            created_at: new Date().toISOString(),
          },
          {
            id: "skill-16",
            name: "Testing",
            category: "Quality Assurance",
            description: "Software testing and QA practices",
            industry_relevance: 0.75,
            created_at: new Date().toISOString(),
          },
          {
            id: "skill-17",
            name: "Cybersecurity",
            category: "Security",
            description: "Information security and cybersecurity",
            industry_relevance: 0.8,
            created_at: new Date().toISOString(),
          },
          {
            id: "skill-18",
            name: "UI/UX Design",
            category: "Design",
            description: "User interface and user experience design",
            industry_relevance: 0.75,
            created_at: new Date().toISOString(),
          },
          {
            id: "skill-19",
            name: "GraphQL",
            category: "Backend",
            description: "GraphQL query language and API design",
            industry_relevance: 0.7,
            created_at: new Date().toISOString(),
          },
          {
            id: "skill-20",
            name: "Kubernetes",
            category: "DevOps",
            description: "Container orchestration platform",
            industry_relevance: 0.8,
            created_at: new Date().toISOString(),
          },
        ];

        const mockUserSkills = [
          {
            id: "mock-user-skill-1",
            user_id: user.id,
            skill_id: "skill-1",
            proficiency: "intermediate" as const,
            confidence_score: 0.8,
            updated_at: new Date().toISOString(),
            skills: mockSkills[0],
          },
          {
            id: "mock-user-skill-2",
            user_id: user.id,
            skill_id: "skill-2",
            proficiency: "beginner" as const,
            confidence_score: 0.6,
            updated_at: new Date().toISOString(),
            skills: mockSkills[1],
          },
          {
            id: "mock-user-skill-3",
            user_id: user.id,
            skill_id: "skill-12",
            proficiency: "intermediate" as const,
            confidence_score: 0.7,
            updated_at: new Date().toISOString(),
            skills: mockSkills[11], // HTML/CSS
          },
          {
            id: "mock-user-skill-4",
            user_id: user.id,
            skill_id: "skill-7",
            proficiency: "intermediate" as const,
            confidence_score: 0.75,
            updated_at: new Date().toISOString(),
            skills: mockSkills[6], // Git
          },
        ];

        setProfile(mockProfile);
        setSelectedGoal(mockProfile.career_goal || "");
        setSkills(mockSkills);
        setUserSkills(mockUserSkills);
      } else {
        // Real database queries for production
        const [p, s, us] = await Promise.all([
          supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase.from("skills").select("*").order("name"),
          supabase
            .from("user_skills")
            .select("*, skills(*)")
            .eq("user_id", user.id),
        ]);
        if (p.data) {
          setProfile(p.data);
          setSelectedGoal(p.data.career_goal || "");
        }
        if (s.data) setSkills(s.data);
        if (us.data) setUserSkills(us.data);
      }
    };
    fetch();
  }, [user]);

  const addSkill = async () => {
    if (!user || !selectedSkill) return;

    if (isMockUser(user)) {
      // Mock functionality for development
      toast({
        title: "Demo Mode",
        description: "Skill management is disabled in demo mode",
        variant: "default",
      });
      return;
    }

    const { error } = await supabase.from("user_skills").insert({
      user_id: user.id,
      skill_id: selectedSkill,
      proficiency: selectedProf,
    });
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Skill added successfully" });
      const { data } = await supabase
        .from("user_skills")
        .select("*, skills(*)")
        .eq("user_id", user.id);
      if (data) setUserSkills(data);
      setSelectedSkill("");
    }
  };

  const removeSkill = async (id: string) => {
    if (isMockUser(user)) {
      // Mock functionality for development
      toast({
        title: "Demo Mode",
        description: "Skill management is disabled in demo mode",
        variant: "default",
      });
      return;
    }

    await supabase.from("user_skills").delete().eq("id", id);
    setUserSkills((prev) => prev.filter((s) => s.id !== id));
  };

  const saveGoal = async () => {
    if (!user) return;

    if (isMockUser(user)) {
      // Mock functionality for development
      toast({
        title: "Demo Mode",
        description: "Career goal updates are disabled in demo mode",
        variant: "default",
      });
      return;
    }

    await supabase
      .from("profiles")
      .update({ career_goal: selectedGoal })
      .eq("user_id", user.id);
    toast({ title: "Career goal updated" });
  };

  const benchmark = CAREER_BENCHMARKS[selectedGoal] || {};
  const gapData = Object.entries(benchmark).map(([skill, required]) => {
    const userSkill = userSkills.find((us: any) => us.skills?.name === skill);
    const current = userSkill ? profToScore(userSkill.proficiency) : 0;
    return { skill, required, current, gap: Math.max(0, required - current) };
  });

  const radarData = gapData.map((d) => ({
    subject: d.skill,
    current: d.current,
    required: d.required,
  }));

  const existingSkillIds = userSkills.map((us: any) => us.skill_id);
  const availableSkills = skills.filter(
    (s) => !existingSkillIds.includes(s.id),
  );

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="w-6 h-6 text-accent" />
            Skill Gap Analysis
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Compare your skills against industry benchmarks
          </p>
        </div>

        {/* Career goal selector */}
        <Card className="p-5 bg-card border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Career Goal
          </h3>
          <div className="flex gap-3 flex-wrap">
            <Select value={selectedGoal} onValueChange={setSelectedGoal}>
              <SelectTrigger className="w-60 bg-secondary">
                <SelectValue placeholder="Select career goal" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CAREER_BENCHMARKS).map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={saveGoal} variant="outline" size="sm">
              Save Goal
            </Button>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Radar chart */}
          <Card className="p-5 bg-card border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Skills Radar
            </h3>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 10,
                    }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                  />
                  <Radar
                    name="Required"
                    dataKey="required"
                    stroke="hsl(var(--accent))"
                    fill="hsl(var(--accent))"
                    fillOpacity={0.15}
                  />
                  <Radar
                    name="Current"
                    dataKey="current"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-12 text-center">
                Select a career goal to see your skills radar
              </p>
            )}
            <div className="flex gap-4 justify-center text-xs mt-2">
              <span className="flex items-center gap-1">
                <span className="w-3 h-1 bg-primary rounded" /> Current
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-1 bg-accent rounded" /> Required
              </span>
            </div>
          </Card>

          {/* Gap list */}
          <Card className="p-5 bg-card border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-accent" />
              Skill Gaps
            </h3>
            {gapData.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-auto">
                {gapData
                  .sort((a, b) => b.gap - a.gap)
                  .map((d) => (
                    <div key={d.skill} className="flex items-center gap-3">
                      <span className="text-sm text-foreground w-40 truncate">
                        {d.skill}
                      </span>
                      <div className="flex-1 relative bg-secondary rounded-full h-3 overflow-hidden">
                        {/* Required level indicator */}
                        <div
                          className="absolute h-full rounded-full opacity-25"
                          style={{
                            width: `${d.required}%`,
                            background: "hsl(var(--accent))",
                          }}
                        />
                        {/* Current level */}
                        <div
                          className="relative h-full rounded-full transition-all"
                          style={{
                            width: `${d.current}%`,
                            background:
                              d.gap === 0
                                ? "hsl(var(--primary))"
                                : d.gap < 30
                                  ? "hsl(var(--accent))"
                                  : "hsl(var(--destructive))",
                          }}
                        />
                      </div>
                      <div className="text-right w-20">
                        <span className="text-xs font-mono text-muted-foreground">
                          {d.current}/{d.required}
                        </span>
                        {d.gap > 0 && (
                          <span className="text-[10px] font-mono text-destructive block">
                            -{d.gap}% gap
                          </span>
                        )}
                        {d.gap === 0 && (
                          <span className="text-[10px] font-mono text-primary block">
                            ✓ met
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                {userSkills.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border mt-3">
                    ⬇ Add your skills below to see accurate gap analysis
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Select a career goal above
              </p>
            )}
          </Card>
        </div>

        {/* Add skills */}
        <Card className="p-5 bg-card border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Your Skills
          </h3>
          <div className="flex gap-3 flex-wrap mb-4">
            <Select value={selectedSkill} onValueChange={setSelectedSkill}>
              <SelectTrigger className="w-48 bg-secondary">
                <SelectValue placeholder="Select skill" />
              </SelectTrigger>
              <SelectContent>
                {availableSkills.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedProf}
              onValueChange={(v) =>
                setSelectedProf(v as Enums<"proficiency_level">)
              }
            >
              <SelectTrigger className="w-40 bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addSkill} size="sm" className="gap-1">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {userSkills.map((us: any) => (
              <Badge
                key={us.id}
                variant="secondary"
                className="gap-1 pr-1 py-1"
              >
                {us.skills?.name}
                <span className="text-[10px] text-muted-foreground capitalize">
                  ({us.proficiency})
                </span>
                <button
                  onClick={() => removeSkill(us.id)}
                  className="ml-1 hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
