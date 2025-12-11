-- Funeral Planning Board Schema
-- Pinterest-style visual planning board for burial/cremation choices

CREATE TABLE IF NOT EXISTS funeral_planning_boards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Casket choices (array of image URLs)
  casket_images JSONB DEFAULT '[]'::jsonb,
  casket_notes TEXT,
  
  -- Urn choices (array of image URLs)
  urn_images JSONB DEFAULT '[]'::jsonb,
  urn_notes TEXT,
  
  -- Flower styles (array of image URLs)
  flower_images JSONB DEFAULT '[]'::jsonb,
  flower_notes TEXT,
  
  -- Color palettes (array of image URLs or color hex codes)
  color_palette_images JSONB DEFAULT '[]'::jsonb,
  color_palette_notes TEXT,
  
  -- Service style inspiration (array of image URLs)
  service_style_images JSONB DEFAULT '[]'::jsonb,
  service_style_notes TEXT,
  
  -- Outfit choices (array of image URLs)
  outfit_images JSONB DEFAULT '[]'::jsonb,
  outfit_notes TEXT,
  
  -- Personal photos (array of image URLs)
  personal_photos JSONB DEFAULT '[]'::jsonb,
  personal_photos_notes TEXT,
  
  -- General notes
  general_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funeral_planning_boards_user_id ON funeral_planning_boards(user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_funeral_planning_boards_updated_at ON funeral_planning_boards;
CREATE TRIGGER update_funeral_planning_boards_updated_at 
    BEFORE UPDATE ON funeral_planning_boards
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE funeral_planning_boards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own funeral planning boards" ON funeral_planning_boards;
CREATE POLICY "Users can manage own funeral planning boards" ON funeral_planning_boards
    FOR ALL
    USING (auth.uid()::text = user_id::text)
    WITH CHECK (auth.uid()::text = user_id::text);

