import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' });
      } else {
        navigate('/dashboard');
      }
    } else {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast({ title: 'Sign up failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Check your email', description: 'We sent you a verification link.' });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-background grid-pattern">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12">
        <div className="max-w-md space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center glow-primary">
            <Brain className="w-9 h-9 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="text-gradient-primary">NeuroLearn</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            AI-powered recommendation engine for industrial e-learning. 
            Personalized paths, skill gap analysis, and career alignment — all driven by intelligent AI.
          </p>
          <div className="flex gap-3 text-xs font-mono text-muted-foreground">
            <span className="px-2 py-1 rounded bg-secondary">RAG Engine</span>
            <span className="px-2 py-1 rounded bg-secondary">Skill Analysis</span>
            <span className="px-2 py-1 rounded bg-secondary">Adaptive Learning</span>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6 animate-slide-up">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-gradient-primary">NeuroLearn</h1>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isLogin ? 'Sign in to continue learning' : 'Start your AI-powered learning journey'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                placeholder="Full name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="bg-secondary border-border"
              />
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="bg-secondary border-border"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-secondary border-border"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  {isLogin ? 'Sign In' : 'Sign Up'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
