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
export const getTodayReading = async (): Promise<BibleReading> => {
  const today = new Date().toISOString().split('T')[0];
  console.log('🔍 [bibleReadings] Fetching reading for date:', today);
  
  try {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    console.log('🔍 [bibleReadings] Supabase client initialized, fetching data...');
    
    const { data, error } = await supabase
      .from('daily_readings')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    console.log('🔍 [bibleReadings] Supabase response:', { 
      hasData: !!data, 
      error: error?.message || 'No error',
      dataKeys: data ? Object.keys(data) : 'No data'
    });

    if (error) {
      console.error('❌ [bibleReadings] Error fetching today reading:', error);
      throw error;
    }

    // If no data for today, return fallback data
    if (!data) {
      console.log('ℹ️ [bibleReadings] No reading found for today, using fallback data');
      const fallbackData: BibleReading = {
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
      console.log('📦 [bibleReadings] Returning fallback data:', fallbackData);
      return fallbackData;
    }

    console.log('📦 [bibleReadings] Raw data received:', JSON.stringify(data, null, 2));
    
    // Ensure we have the expected data structure
    if (!data.readings || typeof data.readings !== 'object') {
      console.warn('⚠️ [bibleReadings] Unexpected data structure, missing readings:', data);
      throw new Error('Invalid data structure received from server');
    }
    
    // Type assertion for the readings object
    const readings = data.readings as {
      oldTestament?: {
        book?: string;
        chapter?: string | number;
        verses?: string;
        text?: string;
      };
      newTestament?: {
        book?: string;
        chapter?: string | number;
        verses?: string;
        text?: string;
      };
      psalm?: {
        book?: string;
        chapter?: string | number;
        verses?: string;
        text?: string;
      };
    };
    const result: BibleReading = {
      id: data.id,
      date: data.date,
      oldTestament: {
        book: readings.oldTestament?.book || 'สุภาษิต',
        chapter: readings.oldTestament?.chapter?.toString() || '3',
        verses: readings.oldTestament?.verses || '5-6',
        text: readings.oldTestament?.text || 'จงวางใจในพระเยโฮวาห์ด้วยสุดใจของเจ้า...'
      },
      newTestament: {
        book: readings.newTestament?.book || 'ยอห์น',
        chapter: readings.newTestament?.chapter?.toString() || '3',
        verses: readings.newTestament?.verses || '16',
        text: readings.newTestament?.text || 'เพราะพระเจ้าทรงรักโลกมาก...'
      },
      psalm: {
        book: readings.psalm?.book || 'สดุดี',
        chapter: readings.psalm?.chapter?.toString() || '23',
        verses: readings.psalm?.verses || '1-6',
        text: readings.psalm?.text || 'พระเยโฮวาห์ทรงเป็นผู้เลี้ยงของข้าพเจ้า...'
      }
    };
    
    console.log('✅ [bibleReadings] Successfully processed reading:', result);
    return result;
  } catch (error) {
    console.error('Error in getTodayReading:', error);
    throw error; // Re-throw to be handled by the component
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