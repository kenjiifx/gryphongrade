-- Create courses table for GryphonGrade
CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  subject TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  credits NUMERIC,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);

-- Create an index on subject for filtering
CREATE INDEX IF NOT EXISTS idx_courses_subject ON courses(subject);

-- Enable Row Level Security (optional, for public read access)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
DROP POLICY IF EXISTS "Allow public read access" ON courses;
CREATE POLICY "Allow public read access" ON courses
  FOR SELECT USING (true);

