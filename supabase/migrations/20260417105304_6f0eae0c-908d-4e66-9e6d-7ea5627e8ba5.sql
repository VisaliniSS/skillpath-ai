-- 1. Expand profiles with accuracy-driving fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS prior_experience text,
  ADD COLUMN IF NOT EXISTS weekly_hours integer DEFAULT 5,
  ADD COLUMN IF NOT EXISTS preferred_languages text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS target_industry text,
  ADD COLUMN IF NOT EXISTS years_experience integer DEFAULT 0;

-- 2. Chat conversations (AI Career Advisor)
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text DEFAULT 'New conversation',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own conversations" ON public.chat_conversations FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'));
CREATE POLICY "insert own conversations" ON public.chat_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own conversations" ON public.chat_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own conversations" ON public.chat_conversations FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'));
CREATE POLICY "insert own messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete own messages" ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON public.chat_messages(conversation_id, created_at);

-- 3. Quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id uuid REFERENCES public.skills(id) ON DELETE CASCADE,
  title text NOT NULL,
  difficulty proficiency_level DEFAULT 'beginner',
  questions jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view quizzes" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "admins manage quizzes" ON public.quizzes FOR ALL USING (has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES public.skills(id) ON DELETE SET NULL,
  score real NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0,
  answers jsonb DEFAULT '[]',
  feedback text,
  new_proficiency proficiency_level,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'));
CREATE POLICY "insert own attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Industrial projects / case studies
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  domain text NOT NULL,
  difficulty proficiency_level DEFAULT 'intermediate',
  description text,
  problem_statement text,
  dataset_url text,
  skills_required text[] DEFAULT '{}',
  estimated_hours integer DEFAULT 20,
  industry_relevance real DEFAULT 0.8,
  deliverables text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "admins manage projects" ON public.projects FOR ALL USING (has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.user_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','submitted','completed','abandoned')),
  progress integer DEFAULT 0,
  submission_url text,
  notes text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(user_id, project_id)
);
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own user_projects" ON public.user_projects FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'));
CREATE POLICY "insert own user_projects" ON public.user_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own user_projects" ON public.user_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own user_projects" ON public.user_projects FOR DELETE USING (auth.uid() = user_id);

-- 5. Certifications
CREATE TABLE IF NOT EXISTS public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  issuer text DEFAULT 'NeuroLearn',
  category text,
  badge_color text DEFAULT 'primary',
  issued_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own certs" ON public.certifications FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'));
CREATE POLICY "insert own certs" ON public.certifications FOR INSERT WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(),'admin'));

-- 6. Seed industrial projects (4 domains)
INSERT INTO public.projects (title, domain, difficulty, description, problem_statement, skills_required, estimated_hours, industry_relevance, deliverables) VALUES
('Predictive Maintenance for CNC Machines', 'Manufacturing', 'advanced', 'Build an anomaly-detection model on vibration sensor data from CNC machines.', 'Reduce unplanned downtime by predicting bearing failure 48h in advance using time-series sensor streams.', ARRAY['Python','Machine Learning','Time Series','MLOps'], 40, 0.95, ARRAY['Trained model','Monitoring dashboard','Deployment notebook']),
('Digital Twin for Assembly Line', 'Manufacturing', 'advanced', 'Create a digital twin simulating throughput optimization.', 'Model a 12-station line and recommend buffer sizes that maximize OEE.', ARRAY['Python','Simulation','Optimization'], 30, 0.88, ARRAY['Simulation code','Optimization report']),
('Short-Term Load Forecasting', 'Energy', 'intermediate', 'Forecast 24h grid load using weather + historical demand.', 'Predict regional electricity demand within 3% MAPE to support renewable integration.', ARRAY['Python','Time Series','Deep Learning'], 25, 0.92, ARRAY['Forecast model','Backtest report']),
('Solar Farm Output Prediction', 'Energy', 'intermediate', 'Predict PV output from irradiance + weather forecasts.', 'Improve next-day solar generation forecasts to enable better grid bidding.', ARRAY['Python','Machine Learning','IoT'], 22, 0.86, ARRAY['Notebook','API endpoint']),
('Chest X-Ray Pneumonia Classifier', 'Healthcare', 'advanced', 'Train a CNN on chest X-rays to assist radiologists.', 'Detect pneumonia from chest X-rays with >92% sensitivity for triage support.', ARRAY['Python','Deep Learning','Computer Vision','PyTorch'], 35, 0.94, ARRAY['Trained CNN','Grad-CAM visualizations','Clinical report']),
('Clinical Notes NER', 'Healthcare', 'intermediate', 'Extract entities from de-identified clinical notes.', 'Build an NER pipeline for medications, dosages and conditions from discharge summaries.', ARRAY['Python','NLP','Transformers'], 28, 0.85, ARRAY['NER model','Evaluation report']),
('Autonomous Warehouse Robot Perception', 'Robotics', 'advanced', 'Build object detection + SLAM for a warehouse robot.', 'Enable a mobile robot to detect pallets and navigate aisles autonomously using stereo cameras.', ARRAY['Python','Computer Vision','Robotics','Edge AI'], 45, 0.93, ARRAY['Detection model','SLAM module','Demo video']),
('Reinforcement Learning for Drone Landing', 'Robotics', 'advanced', 'Train an RL agent for precision drone landing.', 'Land a quadrotor on a moving platform under wind disturbance using PPO.', ARRAY['Python','Reinforcement Learning','Robotics'], 40, 0.9, ARRAY['Trained policy','Simulation video','Tuning report'])
ON CONFLICT DO NOTHING;