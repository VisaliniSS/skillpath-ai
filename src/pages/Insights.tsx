import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Briefcase, Award, Download, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

// Static-but-realistic industry market data for demonstration
const JOB_MARKET = [
  { role: "AI Engineer", demand: 95, salary: 165, growth: 32 },
  { role: "ML Engineer", demand: 92, salary: 158, growth: 28 },
  { role: "Data Engineer", demand: 88, salary: 142, growth: 24 },
  { role: "Robotics Engineer", demand: 78, salary: 135, growth: 38 },
  { role: "Industrial AI Specialist", demand: 82, salary: 152, growth: 35 },
];

const SKILL_DEMAND = [
  { skill: "Python", demand: 96 },
  { skill: "Machine Learning", demand: 94 },
  { skill: "MLOps", demand: 88 },
  { skill: "Deep Learning", demand: 86 },
  { skill: "Edge AI", demand: 79 },
  { skill: "Computer Vision", demand: 82 },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--muted))"];

export default function Insights() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [recs, setRecs] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [p, s, r, c, pr] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_skills").select("*, skills(name, category)").eq("user_id", user.id),
        supabase.from("recommendations").select("*, courses(*)").eq("user_id", user.id).eq("is_active", true).order("sequence_order"),
        supabase.from("certifications").select("*").eq("user_id", user.id).order("issued_at", { ascending: false }),
        supabase.from("user_projects").select("*, projects(*)").eq("user_id", user.id),
      ]);
      setProfile(p.data); setSkills(s.data || []); setRecs(r.data || []); setCerts(c.data || []); setProjects(pr.data || []);
    })();
  }, [user]);

  const avgIalps = recs.length > 0 ? (recs.reduce((s, r) => s + (r.ialps_score || 0), 0) / recs.length) : 0;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const goal = profile?.career_goal || "AI Engineer";
  const goalRow = JOB_MARKET.find((j) => j.role === goal) || JOB_MARKET[0];

  const skillCategoryData = Object.entries(
    skills.reduce((acc: Record<string, number>, s) => {
      const c = s.skills?.category || "Other";
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const generateResume = () => {
    const lines = [
      `${profile?.full_name || "Student"}`,
      `Target Role: ${profile?.career_goal || "—"} | Industry: ${profile?.target_industry || "—"}`,
      `Experience: ${profile?.years_experience ?? 0} years | ${profile?.weekly_hours ?? 5}h/week study`,
      "",
      "## Summary",
      profile?.bio || profile?.prior_experience || "Aspiring industrial AI practitioner.",
      "",
      "## Skills",
      ...skills.map((s) => `- ${s.skills?.name}: ${s.proficiency}`),
      "",
      "## Active Learning Path",
      ...recs.map((r) => `- ${r.sequence_order}. ${r.courses?.title} (${r.courses?.platform}) — IALPS ${(r.ialps_score * 100).toFixed(0)}%`),
      "",
      "## Capstone Projects",
      ...projects.filter((p) => p.status === "completed").map((p) => `- ${p.projects?.title} [${p.projects?.domain}]`),
      "",
      "## Certifications",
      ...certs.map((c) => `- ${c.title} (${new Date(c.issued_at).toLocaleDateString()})`),
    ].join("\n");
    const blob = new Blob([lines], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "resume.md"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-primary" /></div>
            <div>
              <h1 className="text-2xl font-bold">Insights & Career Intelligence</h1>
              <p className="text-sm text-muted-foreground font-mono">Job market • IALPS analytics • portfolio export</p>
            </div>
          </div>
          <Button onClick={generateResume} variant="outline"><Download className="w-4 h-4 mr-2" />Export Resume</Button>
        </header>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4 bg-card/60 backdrop-blur border-border/60">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Sparkles className="w-3 h-3" />Avg IALPS</div>
            <p className="text-2xl font-bold text-primary mt-1">{(avgIalps * 100).toFixed(0)}%</p>
          </Card>
          <Card className="p-4 bg-card/60 backdrop-blur border-border/60">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Award className="w-3 h-3" />Certifications</div>
            <p className="text-2xl font-bold text-primary mt-1">{certs.length}</p>
          </Card>
          <Card className="p-4 bg-card/60 backdrop-blur border-border/60">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Briefcase className="w-3 h-3" />Capstones done</div>
            <p className="text-2xl font-bold text-primary mt-1">{completedProjects}</p>
          </Card>
          <Card className="p-4 bg-card/60 backdrop-blur border-border/60">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingUp className="w-3 h-3" />Tracked skills</div>
            <p className="text-2xl font-bold text-primary mt-1">{skills.length}</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-5 bg-card/60 backdrop-blur border-border/60">
            <h3 className="font-semibold mb-1">Industry Job Market</h3>
            <p className="text-xs text-muted-foreground mb-3 font-mono">Demand index & median salary (US, $K, indicative)</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={JOB_MARKET}>
                <XAxis dataKey="role" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="demand" fill="hsl(var(--primary))" name="Demand" />
                <Bar dataKey="salary" fill="hsl(var(--accent))" name="Salary $K" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5 bg-card/60 backdrop-blur border-border/60">
            <h3 className="font-semibold mb-1">Top Skill Demand</h3>
            <p className="text-xs text-muted-foreground mb-3 font-mono">Industrial AI hiring signals</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={SKILL_DEMAND} layout="vertical">
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="skill" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} width={100} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="demand" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5 bg-card/60 backdrop-blur border-border/60">
            <h3 className="font-semibold mb-3">Your skills by category</h3>
            {skillCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={skillCategoryData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} label>
                    {skillCategoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground">Add skills to see distribution.</p>}
          </Card>

          <Card className="p-5 bg-card/60 backdrop-blur border-border/60 space-y-3">
            <h3 className="font-semibold">Goal alignment: {goal}</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><p className="text-xs text-muted-foreground">Demand</p><p className="text-xl font-bold text-primary">{goalRow.demand}</p></div>
              <div><p className="text-xs text-muted-foreground">Salary</p><p className="text-xl font-bold text-primary">${goalRow.salary}K</p></div>
              <div><p className="text-xs text-muted-foreground">Growth</p><p className="text-xl font-bold text-primary">+{goalRow.growth}%</p></div>
            </div>
            <p className="text-xs text-muted-foreground">Compared to your current path of {recs.length} courses (avg IALPS {(avgIalps * 100).toFixed(0)}%) — focus on skills tagged in your top recommendations to maximize alignment.</p>
          </Card>
        </div>

        {/* Why these recs */}
        <Card className="p-5 bg-card/60 backdrop-blur border-border/60">
          <h3 className="font-semibold mb-3">Recommendation explainability</h3>
          <div className="space-y-2">
            {recs.length === 0 && <p className="text-sm text-muted-foreground">Generate a learning path first.</p>}
            {recs.map((r) => (
              <div key={r.id} className="p-3 rounded-md border border-border/40 bg-background/30">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm">{r.sequence_order}. {r.courses?.title}</p>
                  <Badge variant="outline">IALPS {(r.ialps_score * 100).toFixed(0)}%</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{r.reason}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(r.skill_gaps_addressed || []).map((g: string) => <Badge key={g} variant="secondary" className="text-xs">↑ {g}</Badge>)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {certs.length > 0 && (
          <Card className="p-5 bg-card/60 backdrop-blur border-border/60">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-primary" />Earned certifications</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {certs.map((c) => (
                <div key={c.id} className="p-3 rounded-md border border-primary/30 bg-primary/5">
                  <p className="font-medium text-sm">{c.title}</p>
                  <p className="text-xs text-muted-foreground font-mono">{c.category} • {new Date(c.issued_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
