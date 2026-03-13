import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Clock,
  Star,
  Users,
  Search,
  ExternalLink,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export default function Courses() {
  const [courses, setCourses] = useState<Tables<"courses">[]>([]);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  useEffect(() => {
    // Mock course data for development
    const mockCourses: Tables<"courses">[] = [
      {
        id: "course-1",
        title: "Advanced JavaScript: From Fundamentals to Functional JS",
        description:
          "Master advanced JavaScript concepts including closures, prototypes, async programming, and functional programming patterns.",
        platform: "Udemy",
        url: "https://udemy.com/advanced-js",
        thumbnail_url: null,
        instructor_name: "John Doe",
        duration_hours: 25,
        difficulty: "intermediate",
        skills_covered: [
          "JavaScript",
          "ES6+",
          "Async Programming",
          "Functional Programming",
        ],
        category: "Programming",
        rating: 4.7,
        enrollment_count: 15000,
        industry_alignment_score: 0.88,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "course-2",
        title: "Complete React Developer Bootcamp (with Redux, Hooks, GraphQL)",
        description:
          "Learn React from scratch with modern hooks, Redux for state management, and GraphQL for data fetching.",
        platform: "Udemy",
        url: "https://udemy.com/react-bootcamp",
        thumbnail_url: null,
        instructor_name: "Jane Smith",
        duration_hours: 40,
        difficulty: "intermediate",
        skills_covered: ["React", "Redux", "Hooks", "GraphQL", "JavaScript"],
        category: "Frontend",
        rating: 4.6,
        enrollment_count: 22000,
        industry_alignment_score: 0.91,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "course-3",
        title: "TypeScript for Beginners",
        description:
          "Learn TypeScript from the ground up. Understand types, interfaces, generics, and how to use TypeScript in React applications.",
        platform: "Coursera",
        url: "https://coursera.com/typescript-beginners",
        thumbnail_url: null,
        instructor_name: "Mike Johnson",
        duration_hours: 15,
        difficulty: "beginner",
        skills_covered: ["TypeScript", "JavaScript", "Type Safety"],
        category: "Programming",
        rating: 4.5,
        enrollment_count: 8500,
        industry_alignment_score: 0.85,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "course-4",
        title: "Node.js, Express, MongoDB & More: The Complete Bootcamp",
        description:
          "Learn backend development with Node.js, Express, MongoDB, and build real-world applications.",
        platform: "Udemy",
        url: "https://udemy.com/nodejs-bootcamp",
        thumbnail_url: null,
        instructor_name: "David Wilson",
        duration_hours: 35,
        difficulty: "intermediate",
        skills_covered: [
          "Node.js",
          "Express",
          "MongoDB",
          "REST APIs",
          "JavaScript",
        ],
        category: "Backend",
        rating: 4.8,
        enrollment_count: 30000,
        industry_alignment_score: 0.89,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "course-5",
        title: "Docker & Kubernetes: The Complete Guide",
        description:
          "Master containerization with Docker and orchestration with Kubernetes for modern application deployment.",
        platform: "Udemy",
        url: "https://udemy.com/docker-kubernetes",
        thumbnail_url: null,
        instructor_name: "Sarah Brown",
        duration_hours: 20,
        difficulty: "intermediate",
        skills_covered: ["Docker", "Kubernetes", "Containerization", "DevOps"],
        category: "DevOps",
        rating: 4.6,
        enrollment_count: 12000,
        industry_alignment_score: 0.82,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "course-6",
        title: "Python for Data Science and Machine Learning",
        description:
          "Complete Python bootcamp for data science, machine learning, and AI development.",
        platform: "Udemy",
        url: "https://udemy.com/python-ds-ml",
        thumbnail_url: null,
        instructor_name: "Alex Chen",
        duration_hours: 30,
        difficulty: "intermediate",
        skills_covered: [
          "Python",
          "Data Science",
          "Machine Learning",
          "Pandas",
          "NumPy",
        ],
        category: "Data Science",
        rating: 4.7,
        enrollment_count: 25000,
        industry_alignment_score: 0.9,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "course-7",
        title: "AWS Certified Solutions Architect - Associate",
        description:
          "Complete AWS certification preparation course covering all exam topics and hands-on labs.",
        platform: "A Cloud Guru",
        url: "https://acloudguru.com/aws-solutions-architect",
        thumbnail_url: null,
        instructor_name: "Ryan Kroonenburg",
        duration_hours: 45,
        difficulty: "intermediate",
        skills_covered: ["AWS", "Cloud Computing", "EC2", "S3", "Lambda"],
        category: "Cloud",
        rating: 4.8,
        enrollment_count: 18000,
        industry_alignment_score: 0.92,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "course-8",
        title: "The Complete SQL Bootcamp",
        description:
          "Learn SQL from basics to advanced queries, database design, and optimization techniques.",
        platform: "Udemy",
        url: "https://udemy.com/sql-bootcamp",
        thumbnail_url: null,
        instructor_name: "Jose Portilla",
        duration_hours: 12,
        difficulty: "beginner",
        skills_covered: ["SQL", "Database Design", "PostgreSQL", "MySQL"],
        category: "Database",
        rating: 4.6,
        enrollment_count: 9500,
        industry_alignment_score: 0.8,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "course-9",
        title: "Git & GitHub Complete Masterclass",
        description:
          "Master version control with Git and collaboration with GitHub for professional development workflows.",
        platform: "Udemy",
        url: "https://udemy.com/git-github-masterclass",
        thumbnail_url: null,
        instructor_name: "Jason Taylor",
        duration_hours: 8,
        difficulty: "beginner",
        skills_covered: ["Git", "GitHub", "Version Control", "Collaboration"],
        category: "Tools",
        rating: 4.5,
        enrollment_count: 32000,
        industry_alignment_score: 0.75,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "course-10",
        title: "UI/UX Design Fundamentals",
        description:
          "Learn user interface and user experience design principles, tools, and best practices.",
        platform: "Coursera",
        url: "https://coursera.com/ui-ux-fundamentals",
        thumbnail_url: null,
        instructor_name: "Emma Davis",
        duration_hours: 18,
        difficulty: "beginner",
        skills_covered: ["UI Design", "UX Design", "Figma", "Prototyping"],
        category: "Design",
        rating: 4.4,
        enrollment_count: 11000,
        industry_alignment_score: 0.78,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    setCourses(mockCourses);
  }, []);

  const filtered = courses.filter((c) => {
    if (
      search &&
      !c.title.toLowerCase().includes(search.toLowerCase()) &&
      !c.description?.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (platform !== "all" && c.platform !== platform) return false;
    if (difficulty !== "all" && c.difficulty !== difficulty) return false;
    return true;
  });

  const platforms = [...new Set(courses.map((c) => c.platform))];

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Course Catalog
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse aggregated courses across platforms
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary"
            />
          </div>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-36 bg-secondary">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {platforms.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-36 bg-secondary">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground font-mono">
          {filtered.length} courses found
        </p>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <Card
              key={course.id}
              className="p-4 bg-card border-border hover:glow-border transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {course.platform}
                  </Badge>
                  <span className="text-xs font-mono text-primary">
                    {((course.industry_alignment_score ?? 0) * 100).toFixed(0)}%
                    IAS
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {course.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {course.skills_covered?.slice(0, 3).map((s) => (
                    <Badge key={s} variant="secondary" className="text-[10px]">
                      {s}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {course.duration_hours}h
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-accent" />
                    {course.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {(course.enrollment_count ?? 0).toLocaleString()}
                  </span>
                  <span className="capitalize">{course.difficulty}</span>
                </div>
                {course.url && (
                  <a
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" /> View
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
