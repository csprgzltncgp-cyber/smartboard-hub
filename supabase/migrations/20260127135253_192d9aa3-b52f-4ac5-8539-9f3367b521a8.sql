-- Add expert_type enum
CREATE TYPE expert_type AS ENUM ('individual', 'company');

-- Add company-related fields to experts table
ALTER TABLE experts 
ADD COLUMN expert_type expert_type NOT NULL DEFAULT 'individual',
ADD COLUMN company_name TEXT,
ADD COLUMN tax_number TEXT,
ADD COLUMN company_registration_number TEXT,
ADD COLUMN company_address TEXT,
ADD COLUMN company_city TEXT,
ADD COLUMN company_postal_code TEXT,
ADD COLUMN company_country_id UUID REFERENCES countries(id),
ADD COLUMN billing_name TEXT,
ADD COLUMN billing_address TEXT,
ADD COLUMN billing_city TEXT,
ADD COLUMN billing_postal_code TEXT,
ADD COLUMN billing_country_id UUID REFERENCES countries(id),
ADD COLUMN billing_email TEXT,
ADD COLUMN billing_tax_number TEXT;

-- Create team members table
CREATE TABLE expert_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_prefix TEXT,
  phone_number TEXT,
  is_team_leader BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'hu',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Team member professional data (like expert_data)
CREATE TABLE team_member_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES expert_team_members(id) ON DELETE CASCADE UNIQUE,
  city_id UUID REFERENCES cities(id),
  post_code TEXT,
  street TEXT,
  street_suffix TEXT,
  house_number TEXT,
  native_language TEXT,
  min_inprogress_cases INTEGER DEFAULT 0,
  max_inprogress_cases INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Team member countries
CREATE TABLE team_member_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES expert_team_members(id) ON DELETE CASCADE,
  country_id UUID NOT NULL REFERENCES countries(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_member_id, country_id)
);

-- Team member cities
CREATE TABLE team_member_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES expert_team_members(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES cities(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_member_id, city_id)
);

-- Team member permissions
CREATE TABLE team_member_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES expert_team_members(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_member_id, permission_id)
);

-- Team member specializations
CREATE TABLE team_member_specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES expert_team_members(id) ON DELETE CASCADE,
  specialization_id UUID NOT NULL REFERENCES specializations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_member_id, specialization_id)
);

-- Team member language skills
CREATE TABLE team_member_language_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES expert_team_members(id) ON DELETE CASCADE,
  language_skill_id UUID NOT NULL REFERENCES language_skills(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_member_id, language_skill_id)
);

-- Team member files
CREATE TABLE team_member_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES expert_team_members(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE expert_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member_language_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for all tables
CREATE POLICY "Allow all operations on expert_team_members" ON expert_team_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on team_member_data" ON team_member_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on team_member_countries" ON team_member_countries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on team_member_cities" ON team_member_cities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on team_member_permissions" ON team_member_permissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on team_member_specializations" ON team_member_specializations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on team_member_language_skills" ON team_member_language_skills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on team_member_files" ON team_member_files FOR ALL USING (true) WITH CHECK (true);

-- Add updated_at triggers
CREATE TRIGGER update_expert_team_members_updated_at BEFORE UPDATE ON expert_team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_member_data_updated_at BEFORE UPDATE ON team_member_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();