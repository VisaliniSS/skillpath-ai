import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, UserCog } from "lucide-react";

const CAREER_GOALS = ["AI Engineer", "Data Engineer", "ML Engineer", "Robotics Engineer", "Industrial AI Specialist"];
const INDUSTRIES = ["Manufacturing", "Energy", "Healthcare", "Robotics", "Finance", "Logistics", "Agriculture"];

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    full_name: "", career_goal: "", target_industry: "", learning_style: "mixed",
    learning_pace: "moderate", weekly_hours: 5, years_experience: 0,
    interests: "", preferred_languages: "", prior_experience: "", bio: "",
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (data) {
        setForm({
          full_name: data.full_name || "",
          career_goal: data.career_goal || "",
          target_industry: (data as any).target_industry || "",
          learning_style: data.learning_style || "mixed",
          learning_pace: data.learning_pace || "moderate",
          weekly_hours: (data as any).weekly_hours ?? 5,
          years_experience: (data as any).years_experience ?? 0,
          interests: ((data as any).interests || []).join(", "),
          preferred_languages: ((data as any).preferred_languages || []).join(", "),
          prior_experience: (data as any).prior_experience || "",
          bio: data.bio || "",
        });
      }
      setLoading(false);
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      full_name: form.full_name,
      career_goal: form.career_goal || null,
      target_industry: form.target_industry || null,
      learning_style: form.learning_style,
      learning_pace: form.learning_pace,
      weekly_hours: Number(form.weekly_hours) || 5,
      years_experience: Number(form.years_experience) || 0,
      interests: form.interests.split(",").map((s: string) => s.trim()).filter(Boolean),
      preferred_languages: form.preferred_languages.split(",").map((s: string) => s.trim()).filter(Boolean),
      prior_experience: form.prior_experience || null,
      bio: form.bio || null,
    };
    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "user_id" });
    setSaving(false);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else toast({ title: "Profile updated", description: "Recommendations will use your new context." });
  };

  if (loading) return <Layout><div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div></Layout>;

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl">
        <header className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"><UserCog className="w-5 h-5 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold">Profile & Preferences</h1>
            <p className="text-sm text-muted-foreground font-mono">Sharper signals → sharper recommendations</p>
          </div>
        </header>

        <Card className="p-6 space-y-4 bg-card/60 backdrop-blur border-border/60">
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div><Label>Years of experience</Label><Input type="number" min={0} max={50} value={form.years_experience} onChange={(e) => setForm({ ...form, years_experience: e.target.value })} /></div>
            <div>
              <Label>Career goal</Label>
              <Select value={form.career_goal} onValueChange={(v) => setForm({ ...form, career_goal: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{CAREER_GOALS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Target industry</Label>
              <Select value={form.target_industry} onValueChange={(v) => setForm({ ...form, target_industry: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{INDUSTRIES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Learning style</Label>
              <Select value={form.learning_style} onValueChange={(v) => setForm({ ...form, learning_style: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["visual", "reading", "hands_on", "video", "mixed"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Pace</Label>
              <Select value={form.learning_pace} onValueChange={(v) => setForm({ ...form, learning_pace: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["relaxed", "moderate", "intensive"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Weekly study hours</Label><Input type="number" min={1} max={60} value={form.weekly_hours} onChange={(e) => setForm({ ...form, weekly_hours: e.target.value })} /></div>
            <div><Label>Preferred languages</Label><Input placeholder="Python, SQL" value={form.preferred_languages} onChange={(e) => setForm({ ...form, preferred_languages: e.target.value })} /></div>
          </div>
          <div><Label>Interests (comma separated)</Label><Input placeholder="predictive maintenance, computer vision, edge AI" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} /></div>
          <div><Label>Prior experience</Label><Textarea rows={3} placeholder="Briefly describe past projects, roles, or domains worked in." value={form.prior_experience} onChange={(e) => setForm({ ...form, prior_experience: e.target.value })} /></div>
          <div><Label>Bio</Label><Textarea rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>

          <Button onClick={save} disabled={saving} className="w-full md:w-auto">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save profile
          </Button>
        </Card>
      </div>
    </Layout>
  );
}
