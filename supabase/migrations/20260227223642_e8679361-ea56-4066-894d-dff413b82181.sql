-- Create capsules table
CREATE TABLE public.capsules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT 'v1.0.0',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('compliant', 'non-compliant', 'warning', 'pending')),
  obligations INTEGER NOT NULL DEFAULT 0,
  last_run TEXT NOT NULL DEFAULT 'never',
  source TEXT NOT NULL DEFAULT '',
  hash TEXT,
  clause TEXT,
  controls JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create evidence table
CREATE TABLE public.evidence_packets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  capsule_name TEXT NOT NULL,
  capsule_id UUID REFERENCES public.capsules(id) ON DELETE SET NULL,
  hash TEXT NOT NULL,
  checks INTEGER NOT NULL DEFAULT 0,
  passed INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'compliant' CHECK (status IN ('compliant', 'non-compliant', 'warning')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity table
CREATE TABLE public.activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event TEXT NOT NULL,
  capsule_name TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'info' CHECK (event_type IN ('success', 'error', 'warning', 'info')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gates table
CREATE TABLE public.gates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pr TEXT NOT NULL,
  repo TEXT NOT NULL,
  capsule_names TEXT[] NOT NULL DEFAULT '{}',
  result TEXT NOT NULL DEFAULT 'pending' CHECK (result IN ('blocked', 'passed', 'warning', 'pending')),
  findings TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_packets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gates ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (hackathon demo - no auth required)
CREATE POLICY "Public read capsules" ON public.capsules FOR SELECT USING (true);
CREATE POLICY "Public insert capsules" ON public.capsules FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update capsules" ON public.capsules FOR UPDATE USING (true);
CREATE POLICY "Public delete capsules" ON public.capsules FOR DELETE USING (true);

CREATE POLICY "Public read evidence" ON public.evidence_packets FOR SELECT USING (true);
CREATE POLICY "Public insert evidence" ON public.evidence_packets FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read activity" ON public.activity FOR SELECT USING (true);
CREATE POLICY "Public insert activity" ON public.activity FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read gates" ON public.gates FOR SELECT USING (true);
CREATE POLICY "Public insert gates" ON public.gates FOR INSERT WITH CHECK (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_capsules_updated_at
  BEFORE UPDATE ON public.capsules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial capsules
INSERT INTO public.capsules (name, version, status, obligations, last_run, source, hash) VALUES
  ('US Data Residency', 'v1.2.0', 'compliant', 3, '2 min ago', 'Contract 4.1 — Acme Corp', 'sha256:a3f8…c21d'),
  ('PII Retention 24mo', 'v1.0.1', 'non-compliant', 2, '14 min ago', 'GDPR Art. 5(1)(e)', 'sha256:b7d2…e44f'),
  ('MFA Enforcement', 'v2.0.0', 'compliant', 1, '5 min ago', 'SOC2 CC6.1', 'sha256:c1e9…f88a'),
  ('Privileged Access Review', 'v1.1.0', 'warning', 4, '1 hr ago', 'Internal Policy P-SEC-007', 'sha256:d4a1…b33c'),
  ('Encryption at Rest', 'v1.0.0', 'compliant', 2, '30 min ago', 'HIPAA 164.312(a)(2)(iv)', 'sha256:e5b2…a99e'),
  ('Vendor Data Processing', 'v0.9.0', 'pending', 5, 'never', 'DPA — CloudVendor Inc.', 'sha256:f6c3…b00f');

-- Seed initial evidence
INSERT INTO public.evidence_packets (capsule_name, hash, checks, passed, status) VALUES
  ('US Data Residency', 'sha256:a3f8…c21d', 12, 12, 'compliant'),
  ('PII Retention 24mo', 'sha256:b7d2…e44f', 8, 6, 'non-compliant'),
  ('MFA Enforcement', 'sha256:c1e9…f88a', 5, 5, 'compliant'),
  ('Privileged Access Review', 'sha256:d4a1…b33c', 15, 13, 'warning');

-- Seed initial activity
INSERT INTO public.activity (event, capsule_name, event_type) VALUES
  ('Capsule check passed', 'US Data Residency', 'success'),
  ('Non-compliance detected', 'PII Retention 24mo', 'error'),
  ('Remediation PR created', 'PII Retention 24mo', 'info'),
  ('Warning: 2 exceptions expiring', 'Privileged Access Review', 'warning'),
  ('Evidence packet generated', 'MFA Enforcement', 'success'),
  ('Capsule v2.0.0 signed and published', 'MFA Enforcement', 'info');

-- Seed initial gates
INSERT INTO public.gates (pr, repo, capsule_names, result, findings) VALUES
  ('PR #247 — Add EU storage account', 'infra/azure-resources', ARRAY['US Data Residency'], 'blocked', 'Resource location westeurope violates US-only constraint'),
  ('PR #245 — Update retention policy', 'compliance/purview-config', ARRAY['PII Retention 24mo'], 'passed', 'All retention labels within 24-month limit'),
  ('PR #243 — Service principal update', 'identity/entra-config', ARRAY['MFA Enforcement', 'Privileged Access Review'], 'warning', 'MFA passed. 1 privileged role missing access review schedule'),
  ('PR #240 — New vendor integration', 'apps/vendor-portal', ARRAY['Vendor Data Processing'], 'pending', 'Capsule awaiting first compliance check run');