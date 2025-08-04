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

// Random Bible verses collection
const randomVerses = [
  {
    book: "ยอห์น",
    chapter: "3",
    verses: "16",
    text: "เพราะพระเจ้าทรงรักโลกมากถึงกับทรงประทานพระบุตรองค์เดียวของพระองค์ เพื่อใครก็ตามที่เชื่อในพระบุตรนั้นจะไม่พินาศ แต่มีชีวิตนิรันดร์",
    theme: "ความรักของพระเจ้า"
  },
  {
    book: "สดุดี",
    chapter: "23",
    verses: "1-6",
    text: "พระเยโฮวาห์ทรงเป็นผู้เลี้ยงของข้าพเจ้า ข้าพเจ้าจะไม่ขาดแคลน พระองค์ทรงให้ข้าพเจ้านอนในลานหญ้าเขียว ทรงพาข้าพเจ้าไปยังน้ำสงบ",
    theme: "การดูแลของพระเจ้า"
  },
  {
    book: "สุภาษิต",
    chapter: "3",
    verses: "5-6",
    text: "จงวางใจในพระเยโฮวาห์ด้วยสุดใจของเจ้า และอย่าพึ่งความเข้าใจของเจ้าเอง ในทุกทางของเจ้าจงยอมรับพระองค์ และพระองค์จะทรงกระทำให้ทางของเจ้าเรียบ",
    theme: "การวางใจในพระเจ้า"
  },
  {
    book: "ฟีลิปปี",
    chapter: "4",
    verses: "6-7",
    text: "อย่าทุกข์ร้อนในสิ่งใดเลย แต่จงทูลพระเจ้าทุกสิ่งด้วยการอธิษฐาน การวิงวอน และการขอบพระคุณ และสันติสุขของพระเจ้าซึ่งเกินความเข้าใจ จะคุ้มครองจิตใจและความคิดของท่านในพระเยซูคริสต์",
    theme: "สันติสุขในพระเจ้า"
  },
  {
    book: "โรม",
    chapter: "8",
    verses: "28",
    text: "และเรารู้ว่า พระเจ้าทรงช่วยคนที่รักพระองค์ให้เกิดผลดีในทุกสิ่ง คือคนทั้งปวงที่พระองค์ได้ทรงเรียกตามพระประสงค์ของพระองค์",
    theme: "พระประสงค์ของพระเจ้า"
  },
  {
    book: "มัทธิว",
    chapter: "11",
    verses: "28-30",
    text: "จงมาหาเราเถิด ท่านทั้งหลายผู้เหนื่อยและแบกภาระหนัก และเราจะให้ท่านทั้งหลายได้พัก จงเอาแอกของเราแบกไว้ และเรียนจากเราเถิด เพราะเราสุภาพและใจอ่อนน้อม และจิตใจของท่านทั้งหลายจะได้พัก",
    theme: "การพักผ่อนในพระเยซู"
  },
  {
    book: "สดุดี",
    chapter: "46",
    verses: "1",
    text: "พระเจ้าทรงเป็นที่ลี้ภัยและกำลังของเรา เป็นผู้ช่วยในยามทุกข์ร้อนเสมอ",
    theme: "ที่ลี้ภัยในพระเจ้า"
  },
  {
    book: "อิสยาห์",
    chapter: "40",
    verses: "31",
    text: "แต่คนทั้งหลายที่รอคอยพระเยโฮวาห์จะได้กำลังใหม่ เขาจะบินขึ้นด้วยปีกเหมือนนกอินทรี เขาจะวิ่งและไม่เหนื่อย เขาจะเดินและไม่อ่อนเปลี้ย",
    theme: "กำลังใหม่จากพระเจ้า"
  },
  {
    book: "ยอห์น",
    chapter: "14",
    verses: "6",
    text: "พระเยซูตรัสกับเขาว่า เราเป็นทางนั้น เป็นความจริง และเป็นชีวิต ไม่มีผู้ใดมาถึงพระบิดาได้นอกจากทางเรา",
    theme: "ทางแห่งความรอด"
  },
  {
    book: "สดุดี",
    chapter: "119",
    verses: "105",
    text: "พระวจนะของพระองค์เป็นโคมไฟสำหรับเท้าของข้าพเจ้า และเป็นแสงสว่างสำหรับทางของข้าพเจ้า",
    theme: "พระวจนะเป็นแสงสว่าง"
  },
  {
    book: "ยากอบ",
    chapter: "1",
    verses: "5",
    text: "ถ้าผู้ใดในพวกท่านขาดสติปัญญา ก็ให้ผู้นั้นทูลขอจากพระเจ้าผู้ทรงประทานให้แก่ทุกคนอย่างเหลือล้นและไม่ทรงตำหนิ และจะทรงประทานให้แก่ผู้นั้น",
    theme: "ขอสติปัญญาจากพระเจ้า"
  },
  {
    book: "สดุดี",
    chapter: "27",
    verses: "1",
    text: "พระเยโฮวาห์ทรงเป็นความสว่างและความรอดของข้าพเจ้า ข้าพเจ้าจะกลัวผู้ใดเล่า พระเยโฮวาห์ทรงเป็นป้อมปราการแห่งชีวิตของข้าพเจ้า ข้าพเจ้าจะคร้ามกลัวผู้ใดเล่า",
    theme: "พระเจ้าเป็นความสว่าง"
  },
  {
    book: "โคโลสี",
    chapter: "3",
    verses: "23",
    text: "ไม่ว่าท่านจะทำสิ่งใด จงทำด้วยสุดใจของท่าน เหมือนทำถวายองค์พระผู้เป็นเจ้า ไม่ใช่ทำถวายมนุษย์",
    theme: "ทำเพื่อพระเจ้า"
  },
  {
    book: "สดุดี",
    chapter: "19",
    verses: "14",
    text: "ขอให้ถ้อยคำจากปากของข้าพเจ้า และการรำพึงในใจของข้าพเจ้า เป็นที่พอพระทัยพระองค์ โอ ข้าแต่พระเยโฮวาห์ ผู้ทรงเป็นศิลาและผู้ไถ่ของข้าพเจ้า",
    theme: "ถ้อยคำที่พอพระทัย"
  },
  {
    book: "1 เปโตร",
    chapter: "5",
    verses: "7",
    text: "จงมอบความกังวลทั้งสิ้นของท่านไว้กับพระองค์ เพราะพระองค์ทรงห่วงใยท่าน",
    theme: "มอบความกังวลให้พระเจ้า"
  },
  {
    book: "2 โครินธ์",
    chapter: "12",
    verses: "9",
    text: "และพระองค์ตรัสกับข้าพเจ้าว่า พระคุณของเราก็เพียงพอสำหรับเจ้า เพราะอำนาจของเราจะสำแดงเด่นชัดในความอ่อนแอ",
    theme: "พระคุณของพระเจ้า"
  },
  {
    book: "สดุดี",
    chapter: "37",
    verses: "4",
    text: "จงยินดีในพระเยโฮวาห์ และพระองค์จะประทานตามที่ใจของเจ้าปรารถนา",
    theme: "ยินดีในพระเจ้า"
  },
  {
    book: "ยอห์น",
    chapter: "16",
    verses: "33",
    text: "เราได้กล่าวสิ่งเหล่านี้กับท่านทั้งหลายแล้ว เพื่อท่านจะได้มีสันติสุขในเรา ในโลกนี้ท่านจะมีความทุกข์ยาก แต่จงมีใจกล้าหาญเถิด เราได้ชนะโลกแล้ว",
    theme: "สันติสุขในพระเยซู"
  },
  {
    book: "สดุดี",
    chapter: "34",
    verses: "8",
    text: "จงชิมและดูเถิด พระเยโฮวาห์ทรงเป็นผู้ดี ธรรมิกชนผู้อาศัยในพระองค์ก็เป็นสุข",
    theme: "ชิมและดูพระเจ้า"
  },
  {
    book: "โรม",
    chapter: "12",
    verses: "2",
    text: "อย่าประพฤติตามอย่างคนในยุคนี้ แต่จงรับการเปลี่ยนแปลงจิตใจ แล้วจึงรับการเปลี่ยนแปลงใหม่ เพื่อท่านจะได้ทราบน้ำพระทัยของพระเจ้าว่าประเสริฐ ถูกต้อง และเป็นที่พอพระทัยอย่างไร",
    theme: "การเปลี่ยนแปลงจิตใจ"
  },
  {
    book: "สดุดี",
    chapter: "51",
    verses: "10",
    text: "ขอทรงสร้างใจที่บริสุทธิ์ในตัวข้าพเจ้า โอ ข้าแต่พระเจ้า และขอทรงสร้างวิญญาณใหม่ในตัวข้าพเจ้า",
    theme: "ใจที่บริสุทธิ์"
  },
  {
    book: "กาลาเทีย",
    chapter: "5",
    verses: "22-23",
    text: "แต่ผลของพระวิญญาณคือความรัก ความชื่นชมยินดี สันติสุข ความอดทน ความกรุณา ความดี ความเชื่อ ความสุภาพ ความรู้จักบังคับตน",
    theme: "ผลของพระวิญญาณ"
  },
  {
    book: "สดุดี",
    chapter: "139",
    verses: "14",
    text: "ข้าพเจ้าขอบพระคุณพระองค์ เพราะข้าพเจ้าได้รับการสร้างอย่างน่าพิศวง การกระทำของพระองค์น่าพิศวง และจิตใจของข้าพเจ้ารู้จักดี",
    theme: "การสร้างอย่างน่าพิศวง"
  },
  {
    book: "เอเฟซัส",
    chapter: "2",
    verses: "10",
    text: "เพราะว่าเราเป็นฝีพระหัตถ์ของพระองค์ สร้างขึ้นในพระเยซูคริสต์เพื่อการดี ซึ่งพระเจ้าได้ทรงเตรียมไว้ล่วงหน้าเพื่อให้เราดำเนินในนั้น",
    theme: "ฝีพระหัตถ์ของพระเจ้า"
  },
  {
    book: "สดุดี",
    chapter: "145",
    verses: "18",
    text: "พระเยโฮวาห์ทรงอยู่ใกล้คนทั้งปวงที่ร้องทูลพระองค์ ทรงอยู่ใกล้คนทั้งปวงที่ร้องทูลพระองค์ด้วยความจริง",
    theme: "พระเจ้าทรงอยู่ใกล้"
  },
  {
    book: "1 ยอห์น",
    chapter: "4",
    verses: "18",
    text: "ความรักไม่มีความกลัว แต่ความรักที่สมบูรณ์นั้นขับไล่ความกลัวออกไป เพราะความกลัวเกี่ยวข้องกับการลงโทษ และผู้ที่กลัวนั้นยังไม่สมบูรณ์ในความรัก",
    theme: "ความรักขับไล่ความกลัว"
  }
];

// Get a random Bible verse
export const getRandomVerse = (): BibleReading => {
  const randomIndex = Math.floor(Math.random() * randomVerses.length);
  const verse = randomVerses[randomIndex];
  
  return {
    id: `random-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    oldTestament: {
      book: "สุภาษิต",
      chapter: "3",
      verses: "5-6",
      text: "จงวางใจในพระเยโฮวาห์ด้วยสุดใจของเจ้า และอย่าพึ่งความเข้าใจของเจ้าเอง ในทุกทางของเจ้าจงยอมรับพระองค์ และพระองค์จะทรงกระทำให้ทางของเจ้าเรียบ"
    },
    newTestament: {
      book: verse.book,
      chapter: verse.chapter,
      verses: verse.verses,
      text: verse.text
    },
    psalm: {
      book: "สดุดี",
      chapter: "23",
      verses: "1-6",
      text: "พระเยโฮวาห์ทรงเป็นผู้เลี้ยงของข้าพเจ้า ข้าพเจ้าจะไม่ขาดแคลน พระองค์ทรงให้ข้าพเจ้านอนในลานหญ้าเขียว ทรงพาข้าพเจ้าไปยังน้ำสงบ"
    }
  };
};

// Get multiple random verses
export const getMultipleRandomVerses = (count: number = 3): BibleReading[] => {
  const verses: BibleReading[] = [];
  const usedIndices = new Set<number>();
  
  for (let i = 0; i < count; i++) {
    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * randomVerses.length);
    } while (usedIndices.has(randomIndex));
    
    usedIndices.add(randomIndex);
    const verse = randomVerses[randomIndex];
    
    verses.push({
      id: `random-${Date.now()}-${i}`,
      date: new Date().toISOString().split('T')[0],
      oldTestament: {
        book: "สุภาษิต",
        chapter: "3",
        verses: "5-6",
        text: "จงวางใจในพระเยโฮวาห์ด้วยสุดใจของเจ้า และอย่าพึ่งความเข้าใจของเจ้าเอง ในทุกทางของเจ้าจงยอมรับพระองค์ และพระองค์จะทรงกระทำให้ทางของเจ้าเรียบ"
      },
      newTestament: {
        book: verse.book,
        chapter: verse.chapter,
        verses: verse.verses,
        text: verse.text
      },
      psalm: {
        book: "สดุดี",
        chapter: "23",
        verses: "1-6",
        text: "พระเยโฮวาห์ทรงเป็นผู้เลี้ยงของข้าพเจ้า ข้าพเจ้าจะไม่ขาดแคลน พระองค์ทรงให้ข้าพเจ้านอนในลานหญ้าเขียว ทรงพาข้าพเจ้าไปยังน้ำสงบ"
      }
    });
  }
  
  return verses;
};

// Get a single random verse in the format expected by ScriptureCard
export const getRandomVerseForCard = () => {
  const randomIndex = Math.floor(Math.random() * randomVerses.length);
  const verse = randomVerses[randomIndex];
  
  return {
    id: `random-verse-${Date.now()}`,
    book: verse.book,
    chapter: parseInt(verse.chapter),
    verses: verse.verses,
    text: verse.text,
    theme: verse.theme
  };
};

// Get multiple random verses in the format expected by ScriptureCard
export const getMultipleRandomVersesForCards = (count: number = 3) => {
  const verses = [];
  const usedIndices = new Set<number>();
  
  for (let i = 0; i < count; i++) {
    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * randomVerses.length);
    } while (usedIndices.has(randomIndex));
    
    usedIndices.add(randomIndex);
    const verse = randomVerses[randomIndex];
    
    verses.push({
      id: `random-verse-${Date.now()}-${i}`,
      book: verse.book,
      chapter: parseInt(verse.chapter),
      verses: verse.verses,
      text: verse.text,
      theme: verse.theme
    });
  }
  
  return verses;
};