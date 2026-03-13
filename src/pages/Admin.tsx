import { useEffect, useState } from "react";
import { useAuth, isMockUser } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Plus, BookOpen, Users, Brain, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables, Enums } from "@/integrations/supabase/types";
import { Navigate } from "react-router-dom";

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Tables<"courses">[]>([]);
  const [skills, setSkills] = useState<Tables<"skills">[]>([]);

  // New course form
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    platform: "Coursera",
    url: "",
    instructor_name: "",
    duration_hours: 10,
    difficulty: "beginner" as Enums<"proficiency_level">,
    skills_covered: "",
    category: "",
    industry_alignment_score: 0.8,
  });

  // New skill form
  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "",
    description: "",
  });

  useEffect(() => {
    if (!isAdmin || isMockUser(user)) return;
    Promise.all([
      supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("skills").select("*").order("name"),
    ]).then(([c, s]) => {
      if (c.data) setCourses(c.data);
      if (s.data) setSkills(s.data);
    });
  }, [isAdmin, user]);

  if (!isAdmin) return <Navigate to="/dashboard" />;

  const addCourse = async () => {
    if (isMockUser(user)) {
      toast({
        title: "Demo Mode",
        description: "Admin functionality is disabled in demo mode",
        variant: "default",
      });
      return;
    }

    const { error } = await supabase.from("courses").insert({
      ...newCourse,
      skills_covered: newCourse.skills_covered
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Course added!" });
      const { data } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setCourses(data);
      setNewCourse({
        title: "",
        description: "",
        platform: "Coursera",
        url: "",
        instructor_name: "",
        duration_hours: 10,
        difficulty: "beginner",
        skills_covered: "",
        category: "",
        industry_alignment_score: 0.8,
      });
    }
  };

  const deleteCourse = async (id: string) => {
    if (isMockUser(user)) {
      toast({
        title: "Demo Mode",
        description: "Admin functionality is disabled in demo mode",
        variant: "default",
      });
      return;
    }
    await supabase.from("courses").delete().eq("id", id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const addSkill = async () => {
    if (isMockUser(user)) {
      toast({
        title: "Demo Mode",
        description: "Admin functionality is disabled in demo mode",
        variant: "default",
      });
      return;
    }

    const { error } = await supabase.from("skills").insert(newSkill);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Skill added!" });
      const { data } = await supabase.from("skills").select("*").order("name");
      if (data) setSkills(data);
      setNewSkill({ name: "", category: "", description: "" });
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            Admin Panel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage courses, skills, and system configuration
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Courses", value: courses.length, icon: BookOpen },
            { label: "Skills", value: skills.length, icon: Brain },
          ].map((s) => (
            <Card key={s.label} className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <s.icon className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xl font-bold font-mono text-foreground">
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="courses">
          <TabsList className="bg-secondary">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4 mt-4">
            {/* Add course form */}
            <Card className="p-5 bg-card border-border space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Course
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Title"
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse((p) => ({ ...p, title: e.target.value }))
                  }
                  className="bg-secondary"
                />
                <Input
                  placeholder="URL"
                  value={newCourse.url}
                  onChange={(e) =>
                    setNewCourse((p) => ({ ...p, url: e.target.value }))
                  }
                  className="bg-secondary"
                />
                <Input
                  placeholder="Instructor"
                  value={newCourse.instructor_name}
                  onChange={(e) =>
                    setNewCourse((p) => ({
                      ...p,
                      instructor_name: e.target.value,
                    }))
                  }
                  className="bg-secondary"
                />
                <Input
                  placeholder="Category"
                  value={newCourse.category}
                  onChange={(e) =>
                    setNewCourse((p) => ({ ...p, category: e.target.value }))
                  }
                  className="bg-secondary"
                />
                <Select
                  value={newCourse.platform}
                  onValueChange={(v) =>
                    setNewCourse((p) => ({ ...p, platform: v }))
                  }
                >
                  <SelectTrigger className="bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Coursera">Coursera</SelectItem>
                    <SelectItem value="Udemy">Udemy</SelectItem>
                    <SelectItem value="edX">edX</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={newCourse.difficulty}
                  onValueChange={(v) =>
                    setNewCourse((p) => ({
                      ...p,
                      difficulty: v as Enums<"proficiency_level">,
                    }))
                  }
                >
                  <SelectTrigger className="bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Skills (comma-separated)"
                  value={newCourse.skills_covered}
                  onChange={(e) =>
                    setNewCourse((p) => ({
                      ...p,
                      skills_covered: e.target.value,
                    }))
                  }
                  className="bg-secondary sm:col-span-2"
                />
              </div>
              <Textarea
                placeholder="Description"
                value={newCourse.description}
                onChange={(e) =>
                  setNewCourse((p) => ({ ...p, description: e.target.value }))
                }
                className="bg-secondary"
              />
              <Button onClick={addCourse} size="sm">
                Add Course
              </Button>
            </Card>

            {/* Course list */}
            <div className="space-y-2">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {c.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.platform} • {c.difficulty} • {c.duration_hours}h
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCourse(c.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4 mt-4">
            <Card className="p-5 bg-card border-border space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Skill
              </h3>
              <div className="grid sm:grid-cols-3 gap-3">
                <Input
                  placeholder="Skill name"
                  value={newSkill.name}
                  onChange={(e) =>
                    setNewSkill((p) => ({ ...p, name: e.target.value }))
                  }
                  className="bg-secondary"
                />
                <Input
                  placeholder="Category"
                  value={newSkill.category}
                  onChange={(e) =>
                    setNewSkill((p) => ({ ...p, category: e.target.value }))
                  }
                  className="bg-secondary"
                />
                <Input
                  placeholder="Description"
                  value={newSkill.description}
                  onChange={(e) =>
                    setNewSkill((p) => ({ ...p, description: e.target.value }))
                  }
                  className="bg-secondary"
                />
              </div>
              <Button onClick={addSkill} size="sm">
                Add Skill
              </Button>
            </Card>

            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <Badge key={s.id} variant="secondary" className="text-xs">
                  {s.name}{" "}
                  <span className="text-muted-foreground ml-1">
                    ({s.category})
                  </span>
                </Badge>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
