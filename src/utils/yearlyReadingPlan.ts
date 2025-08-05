// Yearly Bible Reading Plan Generator
// This creates a systematic plan to read through the Bible in one year

export interface BibleBook {
  name: string;
  chapters: number;
  testament: 'old' | 'new';
  category: 'law' | 'history' | 'wisdom' | 'prophets' | 'gospels' | 'epistles' | 'apocalyptic';
}

export interface DailyReading {
  day: number;
  date: string;
  oldTestament: {
    book: string;
    chapter: number;
    description?: string;
  };
  newTestament: {
    book: string;
    chapter: number;
    description?: string;
  };
  psalm: {
    chapter: number;
    description?: string;
  };
  proverbs?: {
    chapter: number;
    description?: string;
  };
}

export interface YearlyPlan {
  year: number;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  readings: DailyReading[];
}

const bibleBooks: BibleBook[] = [
  // Old Testament - Law
  { name: 'ปฐมกาล', chapters: 50, testament: 'old', category: 'law' },
  { name: 'อพยพ', chapters: 40, testament: 'old', category: 'law' },
  { name: 'เลวีนิติ', chapters: 27, testament: 'old', category: 'law' },
  { name: 'กันดารวิถี', chapters: 36, testament: 'old', category: 'law' },
  { name: 'เฉลยธรรมบัญญัติ', chapters: 34, testament: 'old', category: 'law' },
  
  // Old Testament - History
  { name: 'โยชูวา', chapters: 24, testament: 'old', category: 'history' },
  { name: 'ผู้วินิจฉัย', chapters: 21, testament: 'old', category: 'history' },
  { name: 'รูธ', chapters: 4, testament: 'old', category: 'history' },
  { name: '1 ซามูเอล', chapters: 31, testament: 'old', category: 'history' },
  { name: '2 ซามูเอล', chapters: 24, testament: 'old', category: 'history' },
  { name: '1 พงศาวดาร', chapters: 29, testament: 'old', category: 'history' },
  { name: '2 พงศาวดาร', chapters: 36, testament: 'old', category: 'history' },
  { name: 'เอสรา', chapters: 10, testament: 'old', category: 'history' },
  { name: 'เนหะมีย์', chapters: 13, testament: 'old', category: 'history' },
  { name: 'เอสเธอร์', chapters: 10, testament: 'old', category: 'history' },
  
  // Old Testament - Wisdom
  { name: 'โยบ', chapters: 42, testament: 'old', category: 'wisdom' },
  { name: 'สดุดี', chapters: 150, testament: 'old', category: 'wisdom' },
  { name: 'สุภาษิต', chapters: 31, testament: 'old', category: 'wisdom' },
  { name: 'ปัญญาจารย์', chapters: 12, testament: 'old', category: 'wisdom' },
  { name: 'เพลงซาโลมอน', chapters: 8, testament: 'old', category: 'wisdom' },
  
  // Old Testament - Prophets
  { name: 'อิสยาห์', chapters: 66, testament: 'old', category: 'prophets' },
  { name: 'เยเรมีย์', chapters: 52, testament: 'old', category: 'prophets' },
  { name: 'เยเรมีย์โครงการ', chapters: 5, testament: 'old', category: 'prophets' },
  { name: 'เอเสเคียล', chapters: 48, testament: 'old', category: 'prophets' },
  { name: 'ดาเนียล', chapters: 12, testament: 'old', category: 'prophets' },
  { name: 'โฮเชยา', chapters: 14, testament: 'old', category: 'prophets' },
  { name: 'โยเอล', chapters: 3, testament: 'old', category: 'prophets' },
  { name: 'อาโมส', chapters: 9, testament: 'old', category: 'prophets' },
  { name: 'โอบาดีย์', chapters: 1, testament: 'old', category: 'prophets' },
  { name: 'โยนาห์', chapters: 4, testament: 'old', category: 'prophets' },
  { name: 'มีคาห์', chapters: 7, testament: 'old', category: 'prophets' },
  { name: 'นาฮูม', chapters: 3, testament: 'old', category: 'prophets' },
  { name: 'ฮาบากุก', chapters: 3, testament: 'old', category: 'prophets' },
  { name: 'เศฟันยาห์', chapters: 3, testament: 'old', category: 'prophets' },
  { name: 'ฮักกัย', chapters: 2, testament: 'old', category: 'prophets' },
  { name: 'เศคาริยาห์', chapters: 14, testament: 'old', category: 'prophets' },
  { name: 'มาลาคี', chapters: 4, testament: 'old', category: 'prophets' },
  
  // New Testament - Gospels
  { name: 'มัทธิว', chapters: 28, testament: 'new', category: 'gospels' },
  { name: 'มาระโก', chapters: 16, testament: 'new', category: 'gospels' },
  { name: 'ลูกา', chapters: 24, testament: 'new', category: 'gospels' },
  { name: 'ยอห์น', chapters: 21, testament: 'new', category: 'gospels' },
  { name: 'กิจการ', chapters: 28, testament: 'new', category: 'history' },
  
  // New Testament - Epistles
  { name: 'โรม', chapters: 16, testament: 'new', category: 'epistles' },
  { name: '1 โครินธ์', chapters: 16, testament: 'new', category: 'epistles' },
  { name: '2 โครินธ์', chapters: 13, testament: 'new', category: 'epistles' },
  { name: 'กาลาเทีย', chapters: 6, testament: 'new', category: 'epistles' },
  { name: 'เอเฟซัส', chapters: 6, testament: 'new', category: 'epistles' },
  { name: 'ฟีลิปปี', chapters: 4, testament: 'new', category: 'epistles' },
  { name: 'โคโลสี', chapters: 4, testament: 'new', category: 'epistles' },
  { name: '1 เธสะโลนิกา', chapters: 5, testament: 'new', category: 'epistles' },
  { name: '2 เธสะโลนิกา', chapters: 3, testament: 'new', category: 'epistles' },
  { name: '1 ทิโมธี', chapters: 6, testament: 'new', category: 'epistles' },
  { name: '2 ทิโมธี', chapters: 4, testament: 'new', category: 'epistles' },
  { name: 'ทิตัส', chapters: 3, testament: 'new', category: 'epistles' },
  { name: 'ฟีเลโมน', chapters: 1, testament: 'new', category: 'epistles' },
  { name: 'ฮีบรู', chapters: 13, testament: 'new', category: 'epistles' },
  { name: 'ยากอบ', chapters: 5, testament: 'new', category: 'epistles' },
  { name: '1 เปโตร', chapters: 5, testament: 'new', category: 'epistles' },
  { name: '2 เปโตร', chapters: 3, testament: 'new', category: 'epistles' },
  { name: '1 ยอห์น', chapters: 5, testament: 'new', category: 'epistles' },
  { name: '2 ยอห์น', chapters: 1, testament: 'new', category: 'epistles' },
  { name: '3 ยอห์น', chapters: 1, testament: 'new', category: 'epistles' },
  { name: 'ยูดา', chapters: 1, testament: 'new', category: 'epistles' },
  
  // New Testament - Apocalyptic
  { name: 'วิวรณ์', chapters: 22, testament: 'new', category: 'apocalyptic' }
];

// Chapter descriptions for context
const chapterDescriptions: Record<string, Record<number, string>> = {
  'ปฐมกาล': {
    1: 'การสร้างโลกและมนุษย์',
    2: 'อีเดนและการสร้างหญิง',
    3: 'การล่วงล้ำและการตกจากสวรรค์',
    6: 'โนอาห์และน้ำท่วมโลก',
    12: 'พระเจ้าเรียกอับราฮัม',
    22: 'พระเจ้าทรงทดสอบอับราฮัม'
  },
  'อพยพ': {
    3: 'พุ่มไผ่ที่ลุกไหม้',
    14: 'การข้ามทะเลแดง',
    20: 'บัญญัติสิบประการ'
  },
  'มัทธิว': {
    5: 'คำสอนบนภูเขา - ความสุขแปดประการ',
    6: 'คำอธิษฐานขององค์พระผู้เป็นเจ้า',
    28: 'การฟื้นคืนพระชนม์และการสั่งใหญ่'
  },
  'ยอห์น': {
    3: 'นิโคเดมัสและการเกิดใหม่',
    14: 'พระเยซูทรงเป็นทาง ความจริง และชีวิต',
    17: 'คำอธิษฐานของมหาปุโรหิต'
  },
  'สดุดี': {
    23: 'องค์พระผู้เป็นเจ้าทรงเป็นผู้เลี้ยงแกะของข้าพเจ้า',
    91: 'ผู้อยู่ในที่กำบังของพระองค์ผู้สูงสุด',
    139: 'พระเจ้าทรงรู้จักและทรงอยู่ทุกแห่ง'
  }
};

export const generateYearlyReadingPlan = (startDate: Date): YearlyPlan => {
  const year = startDate.getFullYear();
  const endDate = new Date(startDate);
  endDate.setFullYear(year + 1);
  endDate.setDate(endDate.getDate() - 1);
  
  const totalDays = 365; // Standard year plan
  const readings: DailyReading[] = [];
  
  // Calculate total chapters to distribute
  const oldTestamentBooks = bibleBooks.filter(book => book.testament === 'old' && book.name !== 'สดุดี' && book.name !== 'สุภาษิต');
  const newTestamentBooks = bibleBooks.filter(book => book.testament === 'new');
  
  const totalOTChapters = oldTestamentBooks.reduce((sum, book) => sum + book.chapters, 0);
  const totalNTChapters = newTestamentBooks.reduce((sum, book) => sum + book.chapters, 0);
  
  // Distribute chapters across days
  const otChaptersPerDay = Math.ceil(totalOTChapters / totalDays);
  const ntChaptersPerDay = Math.ceil(totalNTChapters / totalDays);
  
  let otBookIndex = 0;
  let otChapterIndex = 1;
  let ntBookIndex = 0;
  let ntChapterIndex = 1;
  
  for (let day = 1; day <= totalDays; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day - 1);
    
    // Old Testament reading
    const otBook = oldTestamentBooks[otBookIndex];
    const otReading = {
      book: otBook.name,
      chapter: otChapterIndex,
      description: chapterDescriptions[otBook.name]?.[otChapterIndex] || `${otBook.name} บทที่ ${otChapterIndex}`
    };
    
    // Advance OT chapter
    otChapterIndex++;
    if (otChapterIndex > otBook.chapters) {
      otBookIndex++;
      otChapterIndex = 1;
      if (otBookIndex >= oldTestamentBooks.length) {
        otBookIndex = 0; // Restart if needed
      }
    }
    
    // New Testament reading
    const ntBook = newTestamentBooks[ntBookIndex];
    const ntReading = {
      book: ntBook.name,
      chapter: ntChapterIndex,
      description: chapterDescriptions[ntBook.name]?.[ntChapterIndex] || `${ntBook.name} บทที่ ${ntChapterIndex}`
    };
    
    // Advance NT chapter
    ntChapterIndex++;
    if (ntChapterIndex > ntBook.chapters) {
      ntBookIndex++;
      ntChapterIndex = 1;
      if (ntBookIndex >= newTestamentBooks.length) {
        ntBookIndex = 0; // Restart if needed
      }
    }
    
    // Psalm reading (cycle through 150 psalms)
    const psalmChapter = ((day - 1) % 150) + 1;
    const psalmReading = {
      chapter: psalmChapter,
      description: chapterDescriptions['สดุดี']?.[psalmChapter] || `สดุดี บทที่ ${psalmChapter}`
    };
    
    // Proverbs reading (31 chapters, cycle monthly)
    const proverbsChapter = ((day - 1) % 31) + 1;
    const proverbsReading = {
      chapter: proverbsChapter,
      description: `สุภาษิต บทที่ ${proverbsChapter} - ปัญญาสำหรับชีวิตประจำวัน`
    };
    
    readings.push({
      day,
      date: currentDate.toISOString().split('T')[0],
      oldTestament: otReading,
      newTestament: ntReading,
      psalm: psalmReading,
      proverbs: proverbsReading
    });
  }
  
  return {
    year,
    startDate,
    endDate,
    totalDays,
    readings
  };
};

export const getReadingForDate = (plan: YearlyPlan, date: Date): DailyReading | null => {
  const dateString = date.toISOString().split('T')[0];
  return plan.readings.find(reading => reading.date === dateString) || null;
};

export const getReadingProgress = (plan: YearlyPlan, completedReadings: string[]): {
  totalReadings: number;
  completedCount: number;
  progressPercentage: number;
  currentStreak: number;
  daysRemaining: number;
} => {
  const totalReadings = plan.readings.length;
  const completedCount = completedReadings.length;
  const progressPercentage = Math.round((completedCount / totalReadings) * 100);
  
  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  for (let i = plan.readings.length - 1; i >= 0; i--) {
    const reading = plan.readings[i];
    if (reading.date > todayString) continue; // Skip future dates
    
    const readingId = `${reading.date}-daily`;
    if (completedReadings.includes(readingId)) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  // Calculate days remaining
  const daysRemaining = Math.max(0, Math.ceil((plan.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  
  return {
    totalReadings,
    completedCount,
    progressPercentage,
    currentStreak,
    daysRemaining
  };
};

export const getBooksRead = (plan: YearlyPlan, completedReadings: string[]): {
  oldTestamentBooks: string[];
  newTestamentBooks: string[];
  totalBooksRead: number;
} => {
  const completedDates = completedReadings.map(id => id.replace('-daily', ''));
  const completedReadingObjects = plan.readings.filter(reading => 
    completedDates.includes(reading.date)
  );
  
  const otBooks = new Set<string>();
  const ntBooks = new Set<string>();
  
  completedReadingObjects.forEach(reading => {
    otBooks.add(reading.oldTestament.book);
    ntBooks.add(reading.newTestament.book);
  });
  
  return {
    oldTestamentBooks: Array.from(otBooks),
    newTestamentBooks: Array.from(ntBooks),
    totalBooksRead: otBooks.size + ntBooks.size
  };
};