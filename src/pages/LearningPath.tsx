import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Loader2, Sparkles, Clock, Star, ExternalLink, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export default function LearningPath() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<RecommendationWithCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchRecs();
  }, [user]);

  const fetchRecs = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('recommendations')
      .select('*, courses(*)')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('sequence_order');
    if (data) setRecommendations(data as any);
    setLoading(false);
  };

  const generateRecommendations = async () => {
    if (!user) return;
    setGenerating(true);
    setAiExplanation('');

    try {
      const response = await supabase.functions.invoke('recommend', {
        body: { user_id: user.id },
      });

      if (response.error) throw response.error;

      const data = response.data;
      if (data?.explanation) setAiExplanation(data.explanation);
      
      await fetchRecs();
      toast({ title: 'Recommendations generated!', description: 'Your personalized learning path is ready.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to generate recommendations', variant: 'destructive' });
    }
    setGenerating(false);
  };

  const difficultyColor = (d: string | null) => {
    if (d === 'beginner') return 'text-success';
    if (d === 'intermediate') return 'text-accent';
    return 'text-destructive';
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
          <Button onClick={generateRecommendations} disabled={generating} className="gap-2">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            {generating ? 'Generating...' : 'Generate Path'}
          </Button>
        </div>

        {/* AI Explanation */}
        {aiExplanation && (
          <Card className="p-5 bg-primary/5 border-primary/20 glow-border">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-primary mb-2">AI Reasoning</h3>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{aiExplanation}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Path */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : recommendations.length === 0 ? (
          <Card className="p-12 bg-card border-border text-center">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse-glow" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No learning path yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your skills in Skill Gap, then generate your personalized path
            </p>
            <Button onClick={generateRecommendations} disabled={generating}>
              {generating ? 'Generating...' : 'Generate My Path'}
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <Card key={rec.id} className="p-5 bg-card border-border hover:glow-border transition-all animate-slide-up" style={{ animationDelay: `${idx * 80}ms` }}>
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
                        <h3 className="text-base font-semibold text-foreground">{rec.courses?.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-[10px] font-mono">{rec.courses?.platform}</Badge>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{rec.courses?.duration_hours}h</span>
                          <span className={`capitalize font-medium ${difficultyColor(rec.courses?.difficulty ?? null)}`}>{rec.courses?.difficulty}</span>
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent" />{rec.courses?.rating}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-mono font-bold text-primary">{((rec.ialps_score ?? 0) * 100).toFixed(0)}%</p>
                        <p className="text-[10px] text-muted-foreground font-mono">IALPS Score</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">{rec.courses?.description}</p>

                    {/* Why recommended */}
                    {rec.reason && (
                      <div className="p-3 bg-secondary/50 rounded-md">
                        <p className="text-xs font-semibold text-primary mb-1">Why this course?</p>
                        <p className="text-xs text-muted-foreground">{rec.reason}</p>
                      </div>
                    )}

                    {/* Skills addressed */}
                    {rec.skill_gaps_addressed && rec.skill_gaps_addressed.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {rec.skill_gaps_addressed.map(s => (
                          <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                        ))}
                      </div>
                    )}

                    {rec.courses?.url && (
                      <a href={rec.courses.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
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
