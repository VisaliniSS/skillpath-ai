import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Clock, Star, Users, Search, ExternalLink } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

export default function Courses() {
  const [courses, setCourses] = useState<Tables<'courses'>[]>([]);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('all');
  const [difficulty, setDifficulty] = useState('all');

  useEffect(() => {
    supabase.from('courses').select('*').order('rating', { ascending: false }).then(({ data }) => {
      if (data) setCourses(data);
    });
  }, []);

  const filtered = courses.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.description?.toLowerCase().includes(search.toLowerCase())) return false;
    if (platform !== 'all' && c.platform !== platform) return false;
    if (difficulty !== 'all' && c.difficulty !== difficulty) return false;
    return true;
  });

  const platforms = [...new Set(courses.map(c => c.platform))];

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Course Catalog
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Browse aggregated courses across platforms</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-secondary" />
          </div>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-36 bg-secondary"><SelectValue placeholder="Platform" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-36 bg-secondary"><SelectValue placeholder="Difficulty" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground font-mono">{filtered.length} courses found</p>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(course => (
            <Card key={course.id} className="p-4 bg-card border-border hover:glow-border transition-all group">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="text-[10px] font-mono">{course.platform}</Badge>
                  <span className="text-xs font-mono text-primary">{((course.industry_alignment_score ?? 0) * 100).toFixed(0)}% IAS</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
                <div className="flex flex-wrap gap-1">
                  {course.skills_covered?.slice(0, 3).map(s => (
                    <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration_hours}h</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent" />{course.rating}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{(course.enrollment_count ?? 0).toLocaleString()}</span>
                  <span className="capitalize">{course.difficulty}</span>
                </div>
                {course.url && (
                  <a href={course.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
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
