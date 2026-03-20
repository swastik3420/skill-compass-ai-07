
-- Create companies table
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  industry text,
  size text,
  website text,
  logo_url text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can view own profile" ON public.companies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Companies can insert own profile" ON public.companies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Companies can update own profile" ON public.companies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view companies" ON public.companies FOR SELECT TO anon, authenticated USING (true);

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create job_listings table
CREATE TABLE public.job_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  location text,
  job_type text DEFAULT 'full-time',
  salary_min integer,
  salary_max integer,
  skills_required text[] DEFAULT '{}',
  experience_level text,
  is_active boolean NOT NULL DEFAULT true,
  applications_count integer NOT NULL DEFAULT 0,
  views_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can manage own listings" ON public.job_listings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = job_listings.company_id AND user_id = auth.uid())
);
CREATE POLICY "Anyone can view active listings" ON public.job_listings FOR SELECT USING (is_active = true);

CREATE TRIGGER update_job_listings_updated_at BEFORE UPDATE ON public.job_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create job_applications table
CREATE TABLE public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.job_listings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(job_id, user_id)
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications" ON public.job_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert applications" ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Companies can view applications for their jobs" ON public.job_applications FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.job_listings jl
    JOIN public.companies c ON c.id = jl.company_id
    WHERE jl.id = job_applications.job_id AND c.user_id = auth.uid()
  )
);
CREATE POLICY "Companies can update application status" ON public.job_applications FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.job_listings jl
    JOIN public.companies c ON c.id = jl.company_id
    WHERE jl.id = job_applications.job_id AND c.user_id = auth.uid()
  )
);
