-- Create table for daily Bible readings
CREATE TABLE public.daily_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  readings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_readings ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to daily readings
CREATE POLICY "Daily readings are publicly readable" 
ON public.daily_readings 
FOR SELECT 
USING (true);

-- Create policy for admin insert/update (for content management)
CREATE POLICY "Admins can manage daily readings" 
ON public.daily_readings 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_daily_readings_updated_at
BEFORE UPDATE ON public.daily_readings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample Thai Bible readings
INSERT INTO public.daily_readings (date, readings) VALUES 
('2025-01-04', '[
  {
    "id": "gen1-1-5",
    "book": "ปฐมกาล",
    "chapter": 1,
    "verses": "1-5",
    "text": "ในปฐมกาลพระเจ้าทรงสร้างฟ้าสวรรค์และแผ่นดิน แผ่นดินยังร้างและว่างเปล่า ความมืดอยู่เหนือน้ำ และวิญญาณของพระเจ้าเสวยอยู่เหนือน้ำ พระเจ้าตรัสว่า จงมีความสว่าง ก็มีความสว่าง พระเจ้าทรงเห็นว่าความสว่างดี พระเจ้าจึงทรงแยกความสว่างออกจากความมืด พระเจ้าทรงเรียกความสว่างว่า วัน และทรงเรียกความมืดว่า คืน มีเวลาเย็นและเวลาเช้า เป็นวันที่หนึ่ง",
    "theme": "การเริ่มต้นใหม่"
  }
]'),
('2025-01-05', '[
  {
    "id": "john1-1-14",
    "book": "ยอห์น",
    "chapter": 1,
    "verses": "1-14",
    "text": "ในปฐมกาลมีพระวจนะ พระวจนะอยู่กับพระเจ้า และพระวจนะคือพระเจ้า พระองค์อยู่กับพระเจ้าในปฐมกาล สรรพสิ่งเกิดมาเพราะพระองค์ และไม่มีสิ่งใดที่เกิดมาโดยไม่เกิดเพราะพระองค์ ในพระองค์มีชีวิต และชีวิตนั้นเป็นความสว่างของมนุษย์ ความสว่างนั้นส่องแสงในความมืด และความมืดมิได้ครอบงำความสว่างนั้น",
    "theme": "พระวจนะผู้ทรงชีวิต"
  }
]'),
('2025-01-06', '[
  {
    "id": "psalm23-1-6",
    "book": "สดุดี",
    "chapter": 23,
    "verses": "1-6",
    "text": "พระเยโฮวาห์ทรงเป็นผู้เลี้ยงของข้าพเจ้า ข้าพเจ้าจะไม่ขาดแคล้น พระองค์ทรงนำข้าพเจ้าไปนอนในทุ่งหญ้าเขียว ทรงนำข้าพเจ้าไปยังน้ำสงบ พระองค์ทรงฟื้นฟูจิตวิญญาณของข้าพเจ้า ทรงนำข้าพเจ้าไปในหนทางแห่งความชอบธรรมเพื่อพระนามของพระองค์",
    "theme": "พระเจ้าผู้ดูแล"
  }
]')