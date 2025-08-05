import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, RefreshCw, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ScriptureReading {
  id: string;
  book: string;
  chapter: number;
  verses: string;
  text: string;
  theme: string;
}

interface DailyScriptures {
  date: string;
  scriptures: ScriptureReading[];
  selectedIndex: number;
}

// Sample Bible books and chapters for random generation
const bibleBooks = [
  // Old Testament
  { name: 'ปฐมกาล', chapters: 50, testament: 'old' },
  { name: 'อพยพ', chapters: 40, testament: 'old' },
  { name: 'เลวีนิติ', chapters: 27, testament: 'old' },
  { name: 'กันดารวิถี', chapters: 36, testament: 'old' },
  { name: 'เฉลยธรรมบัญญัติ', chapters: 34, testament: 'old' },
  { name: 'โยชูวา', chapters: 24, testament: 'old' },
  { name: 'ผู้วินิจฉัย', chapters: 21, testament: 'old' },
  { name: 'รูธ', chapters: 4, testament: 'old' },
  { name: '1 ซามูเอล', chapters: 31, testament: 'old' },
  { name: '2 ซามูเอล', chapters: 24, testament: 'old' },
  { name: 'สดุดี', chapters: 150, testament: 'psalm' },
  { name: 'สุภาษิต', chapters: 31, testament: 'old' },
  { name: 'ปัญญาจารย์', chapters: 12, testament: 'old' },
  { name: 'เพลงซาโลมอน', chapters: 8, testament: 'old' },
  { name: 'อิสยาห์', chapters: 66, testament: 'old' },
  { name: 'เยเรมีย์', chapters: 52, testament: 'old' },
  
  // New Testament
  { name: 'มัทธิว', chapters: 28, testament: 'new' },
  { name: 'มาระโก', chapters: 16, testament: 'new' },
  { name: 'ลูกา', chapters: 24, testament: 'new' },
  { name: 'ยอห์น', chapters: 21, testament: 'new' },
  { name: 'กิจการ', chapters: 28, testament: 'new' },
  { name: 'โรม', chapters: 16, testament: 'new' },
  { name: '1 โครินธ์', chapters: 16, testament: 'new' },
  { name: '2 โครินธ์', chapters: 13, testament: 'new' },
  { name: 'กาลาเทีย', chapters: 6, testament: 'new' },
  { name: 'เอเฟซัส', chapters: 6, testament: 'new' },
  { name: 'ฟีลิปปี', chapters: 4, testament: 'new' },
  { name: 'โคโลสี', chapters: 4, testament: 'new' },
  { name: '1 เธสะโลนิกา', chapters: 5, testament: 'new' },
  { name: '2 เธสะโลนิกา', chapters: 3, testament: 'new' },
  { name: '1 ทิโมธี', chapters: 6, testament: 'new' },
  { name: '2 ทิโมธี', chapters: 4, testament: 'new' },
  { name: 'ทิตัส', chapters: 3, testament: 'new' },
  { name: 'ฟีเลโมน', chapters: 1, testament: 'new' },
  { name: 'ฮีบรู', chapters: 13, testament: 'new' },
  { name: 'ยากอบ', chapters: 5, testament: 'new' },
  { name: '1 เปโตร', chapters: 5, testament: 'new' },
  { name: '2 เปโตร', chapters: 3, testament: 'new' },
  { name: '1 ยอห์น', chapters: 5, testament: 'new' },
  { name: '2 ยอห์น', chapters: 1, testament: 'new' },
  { name: '3 ยอห์น', chapters: 1, testament: 'new' },
  { name: 'ยูดา', chapters: 1, testament: 'new' },
  { name: 'วิวรณ์', chapters: 22, testament: 'new' }
];

const getThemeForTestament = (testament: string): string => {
  switch (testament) {
    case 'old': return 'พระคัมภีร์เดิม';
    case 'new': return 'พระคัมภีร์ใหม่';
    case 'psalm': return 'สดุดี';
    default: return 'พระคัมภีร์';
  }
};

const generateRandomScriptures = (date: string, count: number = 3): ScriptureReading[] => {
  const scriptures: ScriptureReading[] = [];
  const seed = date.split('-').reduce((acc, part) => acc + parseInt(part), 0);
  
  // Ensure we get different types of scriptures
  const testaments = ['old', 'new', 'psalm'];
  
  for (let i = 0; i < count; i++) {
    const testament = testaments[i % testaments.length];
    const availableBooks = bibleBooks.filter(book => book.testament === testament);
    
    if (availableBooks.length === 0) continue;
    
    const bookIndex = (seed + i * 7) % availableBooks.length;
    const book = availableBooks[bookIndex];
    const chapter = ((seed + i * 11) % book.chapters) + 1;
    const verseStart = ((seed + i * 13) % 20) + 1;
    const verseEnd = verseStart + ((seed + i * 17) % 5);
    
    scriptures.push({
      id: `${date}-${i}`,
      book: book.name,
      chapter,
      verses: verseStart === verseEnd ? `${verseStart}` : `${verseStart}-${verseEnd}`,
      text: `นี่คือข้อพระคัมภีร์จาก ${book.name} บทที่ ${chapter} ข้อ ${verseStart === verseEnd ? verseStart : `${verseStart}-${verseEnd}`}`,
      theme: getThemeForTestament(book.testament)
    });
  }
  
  return scriptures;
};

export default function ScriptureCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyScriptures, setDailyScriptures] = useState<DailyScriptures | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDailyScriptures(currentDate);
  }, [currentDate]);

  const loadDailyScriptures = async (date: Date) => {
    setIsLoading(true);
    try {
      const dateString = date.toISOString().split('T')[0];
      
      // Check if we have saved scriptures for this date
      const { data: savedData, error } = await supabase
        .from('daily_scripture_selections')
        .select('*')
        .eq('date', dateString)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading saved scriptures:', error);
      }

      let scriptures: ScriptureReading[];
      let selectedIndex = 0;

      if (savedData) {
        scriptures = savedData.scriptures;
        selectedIndex = savedData.selected_index || 0;
      } else {
        // Generate new random scriptures
        scriptures = generateRandomScriptures(dateString);
        
        // Save to database for consistency
        await supabase
          .from('daily_scripture_selections')
          .upsert({
            date: dateString,
            scriptures,
            selected_index: selectedIndex
          });
      }

      setDailyScriptures({
        date: dateString,
        scriptures,
        selectedIndex
      });
    } catch (error) {
      console.error('Error loading daily scriptures:', error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อพระคัมภีร์ได้"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectScripture = async (index: number) => {
    if (!dailyScriptures) return;

    const updatedScriptures = {
      ...dailyScriptures,
      selectedIndex: index
    };

    setDailyScriptures(updatedScriptures);

    // Save selection to database
    try {
      await supabase
        .from('daily_scripture_selections')
        .upsert({
          date: dailyScriptures.date,
          scriptures: dailyScriptures.scriptures,
          selected_index: index
        });
    } catch (error) {
      console.error('Error saving scripture selection:', error);
    }
  };

  const regenerateScriptures = async () => {
    if (!dailyScriptures) return;

    setIsLoading(true);
    try {
      const newScriptures = generateRandomScriptures(dailyScriptures.date);
      const updatedScriptures = {
        ...dailyScriptures,
        scriptures: newScriptures,
        selectedIndex: 0
      };

      setDailyScriptures(updatedScriptures);

      // Save to database
      await supabase
        .from('daily_scripture_selections')
        .upsert({
          date: dailyScriptures.date,
          scriptures: newScriptures,
          selected_index: 0
        });

      toast({
        title: "สำเร็จ",
        description: "สุ่มข้อพระคัมภีร์ใหม่เรียบร้อยแล้ว"
      });
    } catch (error) {
      console.error('Error regenerating scriptures:', error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสุ่มข้อพระคัมภีร์ใหม่ได้"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          ปฏิทินพระคัมภีร์ประจำวัน
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeDate(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
            วันก่อน
          </Button>
          
          <div className="text-center">
            <div className="font-semibold">{formatDate(currentDate)}</div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeDate(1)}
          >
            วันถัดไป
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : dailyScriptures ? (
          <div className="space-y-4">
            {/* Scripture Options */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">เลือกข้อพระคัมภีร์ (3 ตัวเลือก)</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={regenerateScriptures}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                สุ่มใหม่
              </Button>
            </div>

            <div className="grid gap-3">
              {dailyScriptures.scriptures.map((scripture, index) => (
                <div
                  key={scripture.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    index === dailyScriptures.selectedIndex
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => selectScripture(index)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-medium">
                        {scripture.book} {scripture.chapter}:{scripture.verses}
                      </span>
                    </div>
                    <Badge variant={index === dailyScriptures.selectedIndex ? 'default' : 'secondary'}>
                      {scripture.theme}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {scripture.text}
                  </p>
                  {index === dailyScriptures.selectedIndex && (
                    <div className="mt-2 text-xs text-primary font-medium">
                      ✓ เลือกแล้ว
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Selected Scripture Display */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">ข้อพระคัมภีร์ที่เลือกสำหรับวันนี้</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {dailyScriptures.scriptures[dailyScriptures.selectedIndex]?.book}{' '}
                    {dailyScriptures.scriptures[dailyScriptures.selectedIndex]?.chapter}:
                    {dailyScriptures.scriptures[dailyScriptures.selectedIndex]?.verses}
                  </span>
                  <Badge>
                    {dailyScriptures.scriptures[dailyScriptures.selectedIndex]?.theme}
                  </Badge>
                </div>
                <p className="text-sm">
                  {dailyScriptures.scriptures[dailyScriptures.selectedIndex]?.text}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            ไม่สามารถโหลดข้อพระคัมภีร์ได้
          </div>
        )}
      </CardContent>
    </Card>
  );
}