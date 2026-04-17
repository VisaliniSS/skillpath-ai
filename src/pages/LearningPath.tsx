import { useState, useEffect } from "react";
import { useAuth, isMockUser } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Loader2,
  Sparkles,
  Clock,
  Star,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

interface RecommendationWithCourse {
  id: string;
  score: number | null;
  reason: string | null;
  skill_gaps_addressed: string[] | null;
  ialps_score: number | null;
  sequence_order: number | null;
  courses: {
    id: string;
    title: string;
    description: string | null;
    platform: string;
    url: string | null;
    duration_hours: number | null;
    difficulty: string | null;
    rating: number | null;
    skills_covered: string[] | null;
    industry_alignment_score: number | null;
  } | null;
}

// Career goal to required skills mapping
const CAREER_SKILLS_MAP: Record<
  string,
  { skill: string; priority: number; level: string }[]
> = {
  "Software Developer": [
    { skill: "JavaScript", priority: 10, level: "intermediate" },
    { skill: "React", priority: 9, level: "intermediate" },
    { skill: "TypeScript", priority: 8, level: "beginner" },
    { skill: "Node.js", priority: 8, level: "intermediate" },
    { skill: "SQL", priority: 7, level: "intermediate" },
    { skill: "Git", priority: 7, level: "intermediate" },
    { skill: "REST APIs", priority: 6, level: "intermediate" },
    { skill: "Docker", priority: 5, level: "beginner" },
  ],
  "Data Scientist": [
    { skill: "Python", priority: 10, level: "intermediate" },
    { skill: "Machine Learning", priority: 9, level: "intermediate" },
    { skill: "Data Analysis", priority: 9, level: "intermediate" },
    { skill: "SQL", priority: 8, level: "intermediate" },
    { skill: "Statistics", priority: 8, level: "intermediate" },
    { skill: "Pandas", priority: 7, level: "intermediate" },
    { skill: "NumPy", priority: 7, level: "intermediate" },
    { skill: "Jupyter", priority: 6, level: "beginner" },
  ],
  "DevOps Engineer": [
    { skill: "Docker", priority: 10, level: "intermediate" },
    { skill: "Kubernetes", priority: 9, level: "intermediate" },
    { skill: "AWS", priority: 9, level: "intermediate" },
    { skill: "Linux", priority: 8, level: "intermediate" },
    { skill: "Python", priority: 7, level: "beginner" },
    { skill: "Git", priority: 7, level: "intermediate" },
    { skill: "CI/CD", priority: 8, level: "intermediate" },
    { skill: "Terraform", priority: 6, level: "beginner" },
  ],
  "Full Stack Developer": [
    { skill: "JavaScript", priority: 10, level: "intermediate" },
    { skill: "React", priority: 9, level: "intermediate" },
    { skill: "Node.js", priority: 9, level: "intermediate" },
    { skill: "TypeScript", priority: 8, level: "intermediate" },
    { skill: "MongoDB", priority: 7, level: "intermediate" },
    { skill: "SQL", priority: 7, level: "intermediate" },
    { skill: "REST APIs", priority: 8, level: "intermediate" },
    { skill: "GraphQL", priority: 6, level: "beginner" },
  ],
  "AI Engineer": [
    { skill: "Python", priority: 10, level: "intermediate" },
    { skill: "Machine Learning", priority: 9, level: "intermediate" },
    { skill: "Deep Learning", priority: 9, level: "intermediate" },
    { skill: "TensorFlow", priority: 8, level: "intermediate" },
    { skill: "PyTorch", priority: 8, level: "intermediate" },
    { skill: "Data Analysis", priority: 7, level: "intermediate" },
    { skill: "Computer Vision", priority: 7, level: "beginner" },
    { skill: "NLP", priority: 6, level: "beginner" },
  ],
};

// Available courses database
const COURSES_DATABASE: Tables<"courses">[] = [
  {
    id: "course-js-advanced",
    title: "Advanced JavaScript: From Fundamentals to Functional JS",
    description:
      "Master advanced JavaScript concepts including closures, prototypes, async programming, and functional programming patterns.",
    platform: "Udemy",
    url: "https://udemy.com/advanced-js",
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
    instructor_name: null,
    thumbnail_url: null,
    updated_at: new Date().toISOString(),
  },
  {
    id: "course-react-bootcamp",
    title: "Complete React Developer Bootcamp (with Redux, Hooks, GraphQL)",
    description:
      "Learn React from scratch with modern hooks, Redux for state management, and GraphQL for data fetching.",
    platform: "Udemy",
    url: "https://udemy.com/react-bootcamp",
    duration_hours: 40,
    difficulty: "intermediate",
    skills_covered: ["React", "Redux", "Hooks", "GraphQL", "JavaScript"],
    category: "Frontend",
    rating: 4.6,
    enrollment_count: 22000,
    industry_alignment_score: 0.91,
    metadata: {},
    created_at: new Date().toISOString(),
    instructor_name: null,
    thumbnail_url: null,
    updated_at: new Date().toISOString(),
  },
  {
    id: "course-typescript-beginners",
    title: "TypeScript for Beginners",
    description:
      "Learn TypeScript from the ground up. Understand types, interfaces, generics, and how to use TypeScript in React applications.",
    platform: "Coursera",
    url: "https://coursera.com/typescript-beginners",
    duration_hours: 15,
    difficulty: "beginner",
    skills_covered: ["TypeScript", "JavaScript", "Type Safety"],
    category: "Programming",
    rating: 4.5,
    enrollment_count: 8500,
    industry_alignment_score: 0.85,
    metadata: {},
    created_at: new Date().toISOString(),
    instructor_name: null,
    thumbnail_url: null,
    updated_at: new Date().toISOString(),
  },
  {
    id: "course-nodejs-bootcamp",
    title: "Node.js, Express, MongoDB & More: The Complete Bootcamp",
    description:
      "Learn backend development with Node.js, Express, MongoDB, and build real-world applications.",
    platform: "Udemy",
    url: "https://udemy.com/nodejs-bootcamp",
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
    instructor_name: null,
    thumbnail_url: null,
    updated_at: new Date().toISOString(),
  },
  {
    id: "course-docker-kubernetes",
    title: "Docker & Kubernetes: The Complete Guide",
    description:
      "Master containerization with Docker and orchestration with Kubernetes for modern application deployment.",
    platform: "Udemy",
    url: "https://udemy.com/docker-kubernetes",
    duration_hours: 20,
    difficulty: "intermediate",
    skills_covered: ["Docker", "Kubernetes", "Containerization", "DevOps"],
    category: "DevOps",
    rating: 4.6,
    enrollment_count: 12000,
    industry_alignment_score: 0.82,
    metadata: {},
    created_at: new Date().toISOString(),
    instructor_name: null,
    thumbnail_url: null,
    updated_at: new Date().toISOString(),
  },
  {
    id: "course-python-ds-ml",
    title: "Python for Data Science and Machine Learning",
    description:
      "Complete Python bootcamp for data science, machine learning, and AI development.",
    platform: "Udemy",
    url: "https://udemy.com/python-ds-ml",
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
    instructor_name: null,
    thumbnail_url: null,
    updated_at: new Date().toISOString(),
  },
  {
    id: "course-aws-solutions-architect",
    title: "AWS Certified Solutions Architect - Associate",
    description:
      "Complete AWS certification preparation course covering all exam topics and hands-on labs.",
    platform: "A Cloud Guru",
    url: "https://acloudguru.com/aws-solutions-architect",
    duration_hours: 45,
    difficulty: "intermediate",
    skills_covered: ["AWS", "Cloud Computing", "EC2", "S3", "Lambda"],
    category: "Cloud",
    rating: 4.8,
    enrollment_count: 18000,
    industry_alignment_score: 0.92,
    metadata: {},
    created_at: new Date().toISOString(),
    instructor_name: null,
    thumbnail_url: null,
    updated_at: new Date().toISOString(),
  },
  {
    id: "course-sql-bootcamp",
    title: "The Complete SQL Bootcamp",
    description:
      "Learn SQL from basics to advanced queries, database design, and optimization techniques.",
    platform: "Udemy",
    url: "https://udemy.com/sql-bootcamp",
    duration_hours: 12,
    difficulty: "beginner",
    skills_covered: ["SQL", "Database Design", "PostgreSQL", "MySQL"],
    category: "Database",
    rating: 4.6,
    enrollment_count: 9500,
    industry_alignment_score: 0.8,
    metadata: {},
    created_at: new Date().toISOString(),
    instructor_name: null,
    thumbnail_url: null,
    updated_at: new Date().toISOString(),
  },
  {
    id: "course-git-github",
    title: "Git & GitHub Complete Masterclass",
    description:
      "Master version control with Git and collaboration with GitHub for professional development workflows.",
    platform: "Udemy",
    url: "https://udemy.com/git-github-masterclass",
    duration_hours: 8,
    difficulty: "beginner",
    skills_covered: ["Git", "GitHub", "Version Control", "Collaboration"],
    category: "Tools",
    rating: 4.5,
    enrollment_count: 32000,
    industry_alignment_score: 0.75,
    metadata: {},
    created_at: new Date().toISOString(),
    instructor_name: null,
    thumbnail_url: null,
    updated_at: new Date().toISOString(),
  },
  {
    id: "course-ml-tensorflow",
    title: "Machine Learning with TensorFlow",
    description:
      "Learn machine learning fundamentals and TensorFlow implementation for real-world applications.",
    platform: "Coursera",
    url: "https://coursera.com/ml-tensorflow",
    duration_hours: 28,
    difficulty: "intermediate",
    skills_covered: [
      "Machine Learning",
      "TensorFlow",
      "Python",
      "Deep Learning",
    ],
    category: "AI/ML",
    rating: 4.7,
    enrollment_count: 15000,
    industry_alignment_score: 0.88,
    metadata: {},
    created_at: new Date().toISOString(),
    instructor_name: null,
    thumbnail_url: null,
    updated_at: new Date().toISOString(),
  },
  {
    id: "course-react-native",
    title: "React Native - The Complete Guide",
    description:
      "Build native mobile apps for iOS and Android using React Native framework.",
    platform: "Udemy",
    url: "https://udemy.com/react-native-complete-guide",
    duration_hours: 32,
    difficulty: "intermediate",
    skills_covered: [
      "React Native",
      "JavaScript",
      "Mobile Development",
      "React",
    ],
    category: "Mobile",
    rating: 4.6,
    enrollment_count: 18000,
    industry_alignment_score: 0.83,
    metadata: {},
    created_at: new Date().toISOString(),
    instructor_name: null,
    thumbnail_url: null,
    updated_at: new Date().toISOString(),
  },
  {
    id: "course-cybersecurity-fundamentals",
    title: "Cybersecurity Fundamentals",
    description:
      "Learn the basics of cybersecurity, ethical hacking, and security best practices.",
    platform: "Cybrary",
    url: "https://cybrary.com/cybersecurity-fundamentals",
    duration_hours: 20,
    difficulty: "beginner",
    skills_covered: [
      "Cybersecurity",
      "Ethical Hacking",
      "Network Security",
      "Risk Assessment",
    ],
    category: "Security",
    rating: 4.4,
    enrollment_count: 12000,
    industry_alignment_score: 0.78,
    metadata: {},
    created_at: new Date().toISOString(),
    instructor_name: null,
    thumbnail_url: null,
    updated_at: new Date().toISOString(),
  },
];

export default function LearningPath() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<
    RecommendationWithCourse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [userProfile, setUserProfile] = useState<Tables<"profiles"> | null>(
    null,
  );
  const [userSkills, setUserSkills] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (!user || !userProfile) return;
    fetchRecs();
  }, [user, userProfile]);

  const fetchUserData = async () => {
    if (!user) return;

    if (isMockUser(user)) {
      // Mock user data for development
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

      const mockUserSkills = [
        {
          id: "mock-user-skill-1",
          user_id: user.id,
          skill_id: "skill-1",
          proficiency: "intermediate" as const,
          confidence_score: 0.8,
          skills: { name: "JavaScript" },
        },
        {
          id: "mock-user-skill-2",
          user_id: user.id,
          skill_id: "skill-2",
          proficiency: "beginner" as const,
          confidence_score: 0.6,
          skills: { name: "React" },
        },
        {
          id: "mock-user-skill-3",
          user_id: user.id,
          skill_id: "skill-7",
          proficiency: "intermediate" as const,
          confidence_score: 0.75,
          skills: { name: "Git" },
        },
      ];

      setUserProfile(mockProfile);
      setUserSkills(mockUserSkills);
    } else {
      // Real database queries for production
      const [profileRes, skillsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("user_skills")
          .select("*, skills(*)")
          .eq("user_id", user.id),
      ]);

      if (profileRes.data) setUserProfile(profileRes.data);
      if (skillsRes.data) setUserSkills(skillsRes.data);
    }
  };

  const generateSkillBasedRecommendations = (
    careerGoal: string,
    currentSkills: any[],
  ): RecommendationWithCourse[] => {
    const requiredSkills = CAREER_SKILLS_MAP[careerGoal] || [];
    const userSkillNames = currentSkills
      .map((us) => us.skills?.name)
      .filter(Boolean);
    const userSkillLevels = currentSkills.reduce(
      (acc, us) => {
        acc[us.skills?.name] = us.proficiency;
        return acc;
      },
      {} as Record<string, string>,
    );

    // Calculate skill gaps
    const skillGaps = requiredSkills
      .filter((req) => {
        const userLevel = userSkillLevels[req.skill];
        if (!userLevel) return true; // Skill not possessed
        const userScore =
          userLevel === "beginner" ? 1 : userLevel === "intermediate" ? 2 : 3;
        const requiredScore =
          req.level === "beginner" ? 1 : req.level === "intermediate" ? 2 : 3;
        return userScore < requiredScore; // Skill level too low
      })
      .sort((a, b) => b.priority - a.priority); // Sort by priority

    // Find matching courses
    const recommendations: RecommendationWithCourse[] = [];
    let sequenceOrder = 1;

    for (const gap of skillGaps.slice(0, 5)) {
      // Limit to 5 recommendations
      const matchingCourses = COURSES_DATABASE.filter((course) =>
        course.skills_covered?.some(
          (skill) =>
            skill.toLowerCase().includes(gap.skill.toLowerCase()) ||
            gap.skill.toLowerCase().includes(skill.toLowerCase()),
        ),
      ).sort(
        (a, b) =>
          (b.industry_alignment_score || 0) - (a.industry_alignment_score || 0),
      );

      if (matchingCourses.length > 0) {
        const course = matchingCourses[0];
        const skillGapsAddressed =
          course.skills_covered?.filter((skill) =>
            skillGaps.some(
              (gap) =>
                skill.toLowerCase().includes(gap.skill.toLowerCase()) ||
                gap.skill.toLowerCase().includes(skill.toLowerCase()),
            ),
          ) || [];

        recommendations.push({
          id: `rec-${sequenceOrder}`,
          score: 0.8 + Math.random() * 0.2, // Random score between 0.8-1.0
          reason: `Addresses ${gap.skill} gap for ${careerGoal} career path`,
          skill_gaps_addressed: skillGapsAddressed,
          ialps_score: course.industry_alignment_score,
          sequence_order: sequenceOrder,
          courses: course,
        });
        sequenceOrder++;
      }
    }

    // If no specific matches, add some general foundational courses
    if (recommendations.length === 0) {
      const foundationalCourses = COURSES_DATABASE.filter(
        (course) => course.difficulty === "beginner",
      ).slice(0, 3);

      foundationalCourses.forEach((course, index) => {
        recommendations.push({
          id: `rec-foundation-${index + 1}`,
          score: 0.7 + Math.random() * 0.2,
          reason: `Foundational course to build your ${careerGoal} skills`,
          skill_gaps_addressed: course.skills_covered?.slice(0, 2) || [],
          ialps_score: course.industry_alignment_score,
          sequence_order: index + 1,
          courses: course,
        });
      });
    }

    return recommendations;
  };

  const generateAIExplanation = (
    careerGoal: string,
    currentSkills: any[],
    recommendations: RecommendationWithCourse[],
  ): string => {
    const skillNames = currentSkills.map((us) => us.skills?.name).join(", ");
    const courseTitles = recommendations
      .map((r) => r.courses?.title)
      .join(", ");

    return `AI Analysis Complete! 🎯

Based on your career goal of becoming a **${careerGoal}**, I've analyzed your current skills: ${skillNames || "none identified"}.

**Key Findings:**
• Your learning path focuses on bridging critical skill gaps
• Courses are sequenced for optimal knowledge building
• Each recommendation addresses specific competencies needed for ${careerGoal}

**Recommended Learning Sequence:**
${recommendations
  .map((rec, index) => `${index + 1}. ${rec.courses?.title} - ${rec.reason}`)
  .join("\n")}

This personalized curriculum will take you from your current skill level to ${careerGoal} proficiency. Start with the first course and progress sequentially for the best results!`;
  };

  const fetchRecs = async () => {
    if (!user || !userProfile) return;
    setLoading(true);

    if (isMockUser(user)) {
      const dynamicRecs = generateSkillBasedRecommendations(
        userProfile.career_goal || "Software Developer",
        userSkills,
      );
      setRecommendations(dynamicRecs);
      setAiExplanation(
        generateAIExplanation(
          userProfile.career_goal || "Software Developer",
          userSkills,
          dynamicRecs,
        ),
      );
    } else {
      // Real database queries for production
      const { data } = await supabase
        .from("recommendations")
        .select("*, courses(*)")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("sequence_order");
      if (data) setRecommendations(data as any);
    }

    setLoading(false);
  };

  const generateRecommendations = async () => {
    if (!user || !userProfile) return;
    setGenerating(true);
    setAiExplanation("");

    if (isMockUser(user)) {
      // Dynamic generation based on user profile and skills
      setTimeout(() => {
        const dynamicRecs = generateSkillBasedRecommendations(
          userProfile.career_goal || "Software Developer",
          userSkills,
        );

        setRecommendations(dynamicRecs);
        setAiExplanation(
          generateAIExplanation(
            userProfile.career_goal || "Software Developer",
            userSkills,
            dynamicRecs,
          ),
        );

        setGenerating(false);
        toast({
          title: "AI Recommendations Generated!",
          description: `Personalized learning path created for ${userProfile.career_goal || "your career goal"}.`,
        });
      }, 2000);
    } else {
      // Real Supabase function call for production
      try {
        const response = await supabase.functions.invoke("recommend", {
          body: { user_id: user.id },
        });

        if (response.error) throw response.error;

        const data = response.data;
        if (data?.explanation) setAiExplanation(data.explanation);

        await fetchRecs();
        toast({
          title: "Recommendations generated!",
          description: "Your personalized learning path is ready.",
        });
      } catch (e: any) {
        toast({
          title: "Error",
          description: e.message || "Failed to generate recommendations",
          variant: "destructive",
        });
      }
      setGenerating(false);
    }
  };

  const difficultyColor = (d: string | null) => {
    if (d === "beginner") return "text-success";
    if (d === "intermediate") return "text-accent";
    return "text-destructive";
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              AI Learning Path
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Personalized course sequence powered by RAG + skill gap analysis
            </p>
          </div>
          <Button
            onClick={generateRecommendations}
            disabled={generating}
            className="gap-2"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
            {generating ? "Generating..." : "Generate Path"}
          </Button>
        </div>

        {/* AI Explanation */}
        {aiExplanation && (
          <Card className="p-5 bg-primary/5 border-primary/20 glow-border">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-primary mb-2">
                  AI Reasoning
                </h3>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {aiExplanation}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Path */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : recommendations.length === 0 ? (
          <Card className="p-12 bg-card border-border text-center">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse-glow" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No learning path yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your skills in Skill Gap, then generate your personalized path
            </p>
            <Button onClick={generateRecommendations} disabled={generating}>
              {generating ? "Generating..." : "Generate My Path"}
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <Card
                key={rec.id}
                className="p-5 bg-card border-border hover:glow-border transition-all animate-slide-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex gap-4">
                  {/* Sequence number */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-mono text-primary font-bold">
                      {rec.sequence_order}
                    </div>
                    {idx < recommendations.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-2" />
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">
                          {rec.courses?.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono"
                          >
                            {rec.courses?.platform}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {rec.courses?.duration_hours}h
                          </span>
                          <span
                            className={`capitalize font-medium ${difficultyColor(rec.courses?.difficulty ?? null)}`}
                          >
                            {rec.courses?.difficulty}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-accent" />
                            {rec.courses?.rating}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-mono font-bold text-primary">
                          {((rec.ialps_score ?? 0) * 100).toFixed(0)}%
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          IALPS Score
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {rec.courses?.description}
                    </p>

                    {/* Why recommended */}
                    {rec.reason && (
                      <div className="p-3 bg-secondary/50 rounded-md">
                        <p className="text-xs font-semibold text-primary mb-1">
                          Why this course?
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {rec.reason}
                        </p>
                      </div>
                    )}

                    {/* Skills addressed */}
                    {rec.skill_gaps_addressed &&
                      rec.skill_gaps_addressed.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {rec.skill_gaps_addressed.map((s) => (
                            <Badge
                              key={s}
                              variant="secondary"
                              className="text-[10px]"
                            >
                              {s}
                            </Badge>
                          ))}
                        </div>
                      )}

                    {rec.courses?.url && (
                      <a
                        href={rec.courses.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> View Course
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
