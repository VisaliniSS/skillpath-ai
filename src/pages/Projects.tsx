import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FlaskConical, Factory, Zap, HeartPulse, Bot, Clock, Target, CheckCircle2, Trophy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const DOMAIN_META: Record<string, { icon: any; color: string }> = {
  Manufacturing: { icon: Factory, color: "text-orange-400" },
  Energy: { icon: Zap, color: "text-yellow-400" },
  Healthcare: { icon: HeartPulse, color: "text-rose-400" },
  Robotics: { icon: Bot, color: "text-cyan-400" },
};

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [enrolled, setEnrolled] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const [p, e] = await Promise.all([
      supabase.from("projects").select("*").order("industry_relevance", { ascending: false }),
      supabase.from("user_projects").select("*, projects(*)").eq("user_id", user.id),
    ]);
    setProjects(p.data || []);
    setEnrolled(e.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const enrolledMap: Record<string, any> = {};
  enrolled.forEach((e) => (enrolledMap[e.project_id] = e));

  const enroll = async (projectId: string) => {
    if (!user) return;
    const { error } = await supabase.from("user_projects").insert({ user_id: user.id, project_id: projectId });
    if (error) toast({ title: "Already enrolled or error", description: error.message, variant: "destructive" });
    else { toast({ title: "Enrolled in case study" }); load(); }
  };

  const updateProgress = async (id: string, progress: number) => {
    const status = progress >= 100 ? "completed" : "in_progress";
    const completed_at = progress >= 100 ? new Date().toISOString() : null;
    await supabase.from("user_projects").update({ progress, status, completed_at }).eq("id", id);
    if (progress >= 100 && user) {
      const proj = enrolled.find((e) => e.id === id);
      await supabase.from("certifications").insert({
        user_id: user.id, title: `${proj?.projects?.title} — Capstone`, category: "Project", badge_color: "primary",
      });
      toast({ title: "Capstone complete!", description: "Certification awarded." });
    }
    load();
  };

  const filtered = filter === "all" ? projects : projects.filter((p) => p.domain === filter);
  const domains = ["all", ...Array.from(new Set(projects.map((p) => p.domain)))];

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"><FlaskConical className="w-5 h-5 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold">Industrial Case Studies</h1>
            <p className="text-sm text-muted-foreground font-mono">Real-world capstones across Manufacturing • Energy • Healthcare • Robotics</p>
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          {domains.map((d) => (
            <Button key={d} variant={filter === d ? "default" : "outline"} size="sm" onClick={() => setFilter(d)}>{d}</Button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((p) => {
              const Meta = DOMAIN_META[p.domain] || { icon: FlaskConical, color: "text-primary" };
              const Icon = Meta.icon;
              const userP = enrolledMap[p.id];
              return (
                <Card key={p.id} className="p-5 bg-card/60 backdrop-blur border-border/60 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${Meta.color}`} />
                      <Badge variant="outline" className="text-xs">{p.domain}</Badge>
                      <Badge variant="outline" className="text-xs">{p.difficulty}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Target className="w-3 h-3" />{(p.industry_relevance * 100).toFixed(0)}%</div>
                  </div>
                  <h3 className="font-semibold text-foreground">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.problem_statement}</p>
                  <div className="flex flex-wrap gap-1">
                    {(p.skills_required || []).map((s: string) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.estimated_hours}h</span>
                    <span>{(p.deliverables || []).length} deliverables</span>
                  </div>
                  {userP ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-mono text-primary">{userP.progress}%</span>
                      </div>
                      <Progress value={userP.progress} className="h-2" />
                      {userP.status === "completed" ? (
                        <div className="flex items-center gap-2 text-sm text-primary"><Trophy className="w-4 h-4" />Capstone completed</div>
                      ) : (
                        <div className="flex gap-2">
                          {[25, 50, 75, 100].map((v) => (
                            <Button key={v} size="sm" variant="outline" onClick={() => updateProgress(userP.id, v)} disabled={userP.progress >= v}>{v}%</Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => enroll(p.id)} className="w-full"><CheckCircle2 className="w-4 h-4 mr-2" />Enroll in case study</Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
