import { supabase } from '@/integrations/supabase/client';

export interface BibleReading {
  id: string;
  date: string;
  oldTestament: {
    book: string;
    chapter: string;
    verses: string;
    text: string;
  };
  newTestament: {
    book: string;
    chapter: string;
    verses: string;
    text: string;
  };
  psalm: {
    book: string;
    chapter: string;
    verses: string;
    text: string;
  };
}

export interface DailyReading {
  date: string;
  readings: {
    id: string;
    book: string;
    chapter: number;
    verses: string;
    text: string;
    theme?: string;
  }[];
}

// Get today's reading from Supabase
export const getTodayReading = async (): Promise<BibleReading | null> => {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const { data, error } = await supabase
      .from('daily_readings')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    if (error) {
      console.error('Error fetching today reading:', error);
      return null;
    }

    if (!data) {
      // Return fallback data if no data found for today
      return {
        id: 'fallback',
        date: today,
        oldTestament: {
          book: "สุภาษิต",
          chapter: "3",
          verses: "5-6",
          text: "จงวางใจในพระเยโฮวาห์ด้วยสุดใจของเจ้า และอย่าพึ่งความเข้าใจของเจ้าเอง ในทุกทางของเจ้าจงยอมรับพระองค์ และพระองค์จะทรงกระทำให้ทางของเจ้าเรียบ"
        },
        newTestament: {
          book: "ยอห์น",
          chapter: "3",
          verses: "16",
          text: "เพราะพระเจ้าทรงรักโลกมากถึงกับทรงประทานพระบุตรองค์เดียวของพระองค์ เพื่อใครก็ตามที่เชื่อในพระบุตรนั้นจะไม่พินาศ แต่มีชีวิตนิรันดร์"
        },
        psalm: {
          book: "สดุดี",
          chapter: "23",
          verses: "1-6",
          text: "พระเยโฮวาห์ทรงเป็นผู้เลี้ยงของข้าพเจ้า ข้าพเจ้าจะไม่ขาดแคลน พระองค์ทรงให้ข้าพเจ้านอนในลานหญ้าเขียว ทรงพาข้าพเจ้าไปยังน้ำสงบ"
        }
      };
    }

    const readings = data.readings as any;
    return {
      id: data.id,
      date: data.date,
      oldTestament: readings.oldTestament,
      newTestament: readings.newTestament,
      psalm: readings.psalm
    };
  } catch (error) {
    console.error('Error in getTodayReading:', error);
    return null;
  }
};

// Get reading for a specific date from Supabase (for backward compatibility)
export const getReadingForDate = async (date: Date): Promise<DailyReading | null> => {
  const dateString = date.toISOString().split('T')[0];
  
  try {
    // Try to get reading from database first
    const { data, error } = await supabase
      .from('daily_readings')
      .select('*')
      .eq('date', dateString)
      .maybeSingle();

    if (data && !error) {
      // Convert new format to old format for backward compatibility
      const reading = data.readings as any;
      return {
        date: dateString,
        readings: [
          {
            id: `ot-${dateString}`,
            book: reading.oldTestament.book,
            chapter: parseInt(reading.oldTestament.chapter),
            verses: reading.oldTestament.verses,
            text: reading.oldTestament.text,
            theme: "พระคัมภีร์เดิม"
          },
          {
            id: `nt-${dateString}`,
            book: reading.newTestament.book,
            chapter: parseInt(reading.newTestament.chapter),
            verses: reading.newTestament.verses,
            text: reading.newTestament.text,
            theme: "พระคัมภีร์ใหม่"
          },
          {
            id: `psalm-${dateString}`,
            book: reading.psalm.book,
            chapter: parseInt(reading.psalm.chapter),
            verses: reading.psalm.verses,
            text: reading.psalm.text,
            theme: "สดุดี"
          }
        ]
      };
    }

    // If no specific reading found, generate a default one
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    const readings = [
      {
        id: `psalm-${((dayOfYear - 1) % 150) + 1}-daily`,
        book: "สดุดี",
        chapter: ((dayOfYear - 1) % 150) + 1,
        verses: "1-6",
        text: `นี่คือข้อพระคัมภีร์จากสดุดี บทที่ ${((dayOfYear - 1) % 150) + 1} สำหรับการอ่านประจำวัน กรุณาเปิดพระคัมภีร์และอ่านข้อพระคัมภีร์เต็มๆ เพื่อการเติบโตฝ่ายจิตวิญญาณ`,
        theme: "การสรรเสริญพระเจ้า"
      },
      {
        id: `proverbs-${((dayOfYear - 1) % 31) + 1}-daily`,
        book: "สุภาษิต",
        chapter: ((dayOfYear - 1) % 31) + 1,
        verses: "1-10",
        text: `นี่คือข้อพระคัมภีร์จากสุภาษิต บทที่ ${((dayOfYear - 1) % 31) + 1} สำหรับการอ่านประจำวัน กรุณาเปิดพระคัมภีร์และอ่านข้อพระคัมภีร์เต็มๆ เพื่อการเติบโตฝ่ายจิตวิญญาณ`,
        theme: "ปัญญาในการดำเนินชีวิต"
      }
    ];

    return {
      date: dateString,
      readings
    };

  } catch (error) {
    console.error('Error fetching reading from Supabase:', error);
    
    // Fallback to generated reading
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      date: dateString,
      readings: [
        {
          id: `psalm-${((dayOfYear - 1) % 150) + 1}-daily`,
          book: "สดุดี",
          chapter: ((dayOfYear - 1) % 150) + 1,
          verses: "1-6",
          text: `นี่คือข้อพระคัมภีร์จากสดุดี บทที่ ${((dayOfYear - 1) % 150) + 1} สำหรับการอ่านประจำวัน กรุณาเปิดพระคัมภีร์และอ่านข้อพระคัมภีร์เต็มๆ เพื่อการเติบโตฝ่ายจิตวิญญาณ`,
          theme: "การสรรเสริญพระเจ้า"
        }
      ]
    };
  }
};