-- Update group names to include 'กลุ่ม' prefix for consistency
UPDATE public.user_groups 
SET name = 'กลุ่ม' || name
WHERE name IN ('เยาวชน', 'ผู้ใหญ่', 'ผู้สูงอายุ', 'ครอบครัว')
AND name NOT LIKE 'กลุ่ม%';

-- Update existing group memberships to use the new group names
-- This is handled automatically by the foreign key constraint with ON UPDATE CASCADE
