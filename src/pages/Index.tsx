import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ScriptureCard } from '@/components/ScriptureCard';
import { BibleVerseSearch } from '@/components/BibleVerseSearch';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getTodayReading, BibleReading } from '@/data/bibleReadings';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { Shuffle, Calendar, BookOpen, GraduationCap, Play, BookHeart, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todayReading, setTodayReading] = useState<BibleReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<BibleReading | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { currentStreak, totalReadThisMonth, yearProgress, markAsRead, isRead } = useReadingProgress();
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadReading = async () => {
      setLoading(true);
      try {
        const reading = await getTodayReading();
        setTodayReading(reading);
      } catch (error) {
        console.error('Error loading reading:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadReading();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentDate={currentDate} onDateChange={setCurrentDate} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">กำลังโหลดข้อพระคัมภีร์...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchResults(null);
      return;
    }
    
    setIsSearching(true);
    try {
      // In a real app, you would call your API to search for verses
      // const results = await searchBibleVerses(query);
      // setSearchResults(results);
      
      // For demo purposes, we'll just show a loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
          // Mock search results with a unique ID
      setSearchResults({
        id: `search-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        oldTestament: {
          book: 'สดุดี',
          chapter: '119',
          verses: '105',
          text: 'พระวจนะของพระองค์เป็นโคมสำหรับเท้าของข้าพระองค์ และเป็นความสว่างแก่ทางของข้าพระองค์',
        },
        newTestament: {
          book: 'มัทธิว',
          chapter: '7',
          verses: '7-8',
          text: 'จงขอแล้วจะได้ จงหาแล้วจะพบ จงเคาะแล้วจะเปิดให้แก่ท่าน เพราะว่าทุกคนที่ขอก็ได้รับ ทุกคนที่แสวงหาก็พบ และทุกคนที่เคาะก็จะเปิดให้',
        },
        psalm: {
          book: 'สุภาษิต',
          chapter: '3',
          verses: '5-6',
          text: 'จงวางใจในพระยาห์เวห์ด้วยสุดใจของท่าน และอย่าพึ่งพาความรอบรู้ของตนเอง จงยอมรับรู้พระองค์ในทุกทางของท่าน และพระองค์จะทรงกระทำให้วิถีของท่านราบรื่น',
        },
      });
    } catch (error) {
      console.error('Error searching verses:', error);
    } finally {
      setIsSearching(false);
    }
  };

  if (!todayReading) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentDate={currentDate} onDateChange={setCurrentDate} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">ไม่พบข้อพระคัมภีร์สำหรับวันนี้</p>
          </div>
        </div>
      </div>
    );
  }

  // Get readings to display (search results or today's readings)
  const displayReadings = searchResults || todayReading;
  
  if (!displayReadings) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentDate={currentDate} onDateChange={setCurrentDate}>
          <BibleVerseSearch onSearch={handleSearch} isLoading={isSearching} />
        </Header>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">ไม่พบข้อพระคัมภีร์</p>
        </div>
      </div>
    );
  }

  // Convert BibleReading to format expected by ScriptureCard
  const readings = [
    {
      id: `ot-${displayReadings.date}`,
      book: displayReadings.oldTestament.book,
      chapter: parseInt(displayReadings.oldTestament.chapter),
      verses: displayReadings.oldTestament.verses,
      text: displayReadings.oldTestament.text,
      theme: searchResults ? 'ผลการค้นหา' : 'พระคัมภีร์เดิม'
    },
    {
      id: `nt-${displayReadings.date}`,
      book: displayReadings.newTestament.book,
      chapter: parseInt(displayReadings.newTestament.chapter),
      verses: displayReadings.newTestament.verses,
      text: displayReadings.newTestament.text,
      theme: searchResults ? '' : 'พระคัมภีร์ใหม่'
    },
    {
      id: `psalm-${displayReadings.date}`,
      book: displayReadings.psalm.book,
      chapter: parseInt(displayReadings.psalm.chapter),
      verses: displayReadings.psalm.verses,
      text: displayReadings.psalm.text,
      theme: searchResults ? '' : 'สดุดี'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header currentDate={currentDate} onDateChange={setCurrentDate}>
        <BibleVerseSearch onSearch={handleSearch} isLoading={isSearching} />
      </Header>
      
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">


        {/* YouTube Section */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-red-500" />
              NexusBangkok Church - วิดีโอล่าสุด
            </CardTitle>
            <CardDescription>
              ติดตามข่าวสารและคำเทศนาล่าสุดจาก NexusBangkok Church
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full rounded-lg"
                src="https://www.youtube.com/embed/?listType=user_uploads&list=nexusfellowship&index=1"
                title="NexusBangkok Church - วิดีโอล่าสุด"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="mt-4 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                ติดตามคำเทศนาและข่าวสารล่าสุดจาก NexusBangkok Church
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => window.open('https://www.youtube.com/@nexusfellowship', '_blank')}
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  ดูช่อง YouTube ทั้งหมด
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open('https://www.youtube.com/@nexusfellowship/videos', '_blank')}
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  วิดีโอทั้งหมด
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              ตัวเลือกการใช้งาน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                onClick={() => navigate('/prayer/new')}
                className="h-16 gap-3"
                size="lg"
              >
                <BookHeart className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">เขียนคำอธิษฐาน</div>
                  <div className="text-sm opacity-80">สร้างบันทึกคำอธิษฐานใหม่</div>
                </div>
              </Button>
              <Button 
                onClick={() => navigate('/random')}
                className="h-16 gap-3"
                size="lg"
              >
                <Shuffle className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">ข้อพระคัมภีร์แบบสุ่ม</div>
                  <div className="text-sm opacity-80">ค้นพบข้อพระคัมภีร์ใหม่</div>
                </div>
              </Button>
              <Button 
                onClick={() => navigate('/bible-class')}
                variant="outline"
                className="h-16 gap-3"
                size="lg"
              >
                <GraduationCap className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">ลงทะเบียนเรียนคลาส</div>
                  <div className="text-sm opacity-80">เรียนพระคัมภีร์ที่ NexusBangkok</div>
                </div>
              </Button>
              <Button 
                onClick={() => navigate('/profile')}
                variant="outline"
                className="h-16 gap-3"
                size="lg"
              >
                <User className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">ข้อมูลส่วนตัว</div>
                  <div className="text-sm opacity-80">แก้ไขโปรไฟล์</div>
                </div>
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="h-16 gap-3"
                size="lg"
              >
                <Calendar className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">Dashboard</div>
                  <div className="text-sm opacity-80">ดูสถิติการอ่าน</div>
                </div>
              </Button>
              <Button 
                 onClick={() => navigate('/profile')}
                 variant="outline"
                 className="h-16 gap-3"
                 size="lg"
              >
                 <User className="w-5 h-5" />
                 <div className="text-left">
                   <div className="font-semibold">ข้อมูลส่วนตัว</div>
                   <div className="text-sm opacity-80">แก้ไขโปรไฟล์</div>
                 </div>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Calendar UI */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              ปฏิทินการอ่านพระคัมภีร์ประจำปี (เดือนนี้)
            </CardTitle>
            <CardDescription>เลือกวันที่เพื่อดูข้อพระคัมภีร์ประจำวันนั้น</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(31)].map((_, i) => {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
                const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
                const dayName = dayNames[date.getDay()];
                const isSelected = date.getDate() === currentDate.getDate();
                const readingId = `ot-${date.toISOString().split('T')[0]}`;
                return (
                  <button
                    key={i}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-150 text-xs
                      ${isSelected ? 'bg-primary text-white border-primary' : 'bg-muted text-foreground border-muted'}
                      hover:bg-primary/10`}
                    onClick={() => setCurrentDate(date)}
                  >
                    <span className="font-bold">{i + 1}</span>
                    <span className="text-[10px] text-muted-foreground">{dayName}</span>
                    <span className="mt-1">
                      {isRead(readingId)
                        ? <span title="อ่านแล้ว">✅</span>
                        : <span title="ยังไม่ได้อ่าน">⭕</span>
                      }
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">ข้อพระคัมภีร์ประจำปี</h2>
          {readings.map((reading) => (
            <ScriptureCard
              key={reading.id}
              reading={reading}
              isRead={isRead(reading.id)}
              onMarkAsRead={markAsRead}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;