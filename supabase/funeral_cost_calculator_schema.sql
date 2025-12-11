-- Funeral Cost Calculator Schema
CREATE TABLE IF NOT EXISTS funeral_cost_calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  burial_or_cremation TEXT CHECK (burial_or_cremation IN ('burial', 'cremation')),
  funeral_home_services JSONB DEFAULT '{}'::jsonb,
  burial_costs JSONB DEFAULT '{}'::jsonb,
  cremation_costs JSONB DEFAULT '{}'::jsonb,
  service_addons JSONB DEFAULT '{}'::jsonb,
  venue_and_catering JSONB DEFAULT '{}'::jsonb,
  transportation JSONB DEFAULT '{}'::jsonb,
  legal_and_admin JSONB DEFAULT '{}'::jsonb,
  total_cost NUMERIC(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funeral_cost_calculations_user_id ON funeral_cost_calculations(user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_funeral_cost_calculations_updated_at ON funeral_cost_calculations;
CREATE TRIGGER update_funeral_cost_calculations_updated_at 
    BEFORE UPDATE ON funeral_cost_calculations
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE funeral_cost_calculations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own funeral cost calculations" ON funeral_cost_calculations;
CREATE POLICY "Users can manage own funeral cost calculations" ON funeral_cost_calculations
    FOR ALL
    USING (auth.uid()::text = user_id::text)
    WITH CHECK (auth.uid()::text = user_id::text);

