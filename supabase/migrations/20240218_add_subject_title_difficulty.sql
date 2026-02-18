-- Add new columns to problems table
ALTER TABLE problems ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE problems ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE problems ADD COLUMN IF NOT EXISTS difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5);

COMMENT ON COLUMN problems.subject IS '과목 (예: 국어, 영어, 수학)';
COMMENT ON COLUMN problems.title IS '문제 제목';
COMMENT ON COLUMN problems.difficulty IS '난이도 (1-5 별점)';
