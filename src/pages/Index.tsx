import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ScriptureCard } from '@/components/ScriptureCard';
import { ProgressTracker } from '@/components/ProgressTracker';
import PrayerSection from '@/components/PrayerSection';
import PrayerExamples from '@/components/PrayerExamples';
import { Button } from '@/components/ui/button';
import { getTodayReading, BibleReading } from '@/data/bibleReadings';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

const Index = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todayReading, setTodayReading] = useState<BibleReading | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentStreak, totalReadThisMonth, yearProgress, markAsRead, isRead } = useReadingProgress();
  const { user } = useAuth();
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

  // Convert BibleReading to format expected by ScriptureCard
  const readings = [
    {
      id: `ot-${todayReading.date}`,
      book: todayReading.oldTestament.book,
      chapter: parseInt(todayReading.oldTestament.chapter),
      verses: todayReading.oldTestament.verses,
      text: todayReading.oldTestament.text,
      theme: "พระคัมภีร์เดิม"
    },
    {
      id: `nt-${todayReading.date}`,
      book: todayReading.newTestament.book,
      chapter: parseInt(todayReading.newTestament.chapter),
      verses: todayReading.newTestament.verses,
      text: todayReading.newTestament.text,
      theme: "พระคัมภีร์ใหม่"
    },
    {
      id: `psalm-${todayReading.date}`,
      book: todayReading.psalm.book,
      chapter: parseInt(todayReading.psalm.chapter),
      verses: todayReading.psalm.verses,
      text: todayReading.psalm.text,
      theme: "สดุดี"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header currentDate={currentDate} onDateChange={setCurrentDate} />
      
      {/* User nav */}
      {user && (
        <div className="bg-card border-b">
          <div className="max-w-4xl mx-auto px-4 py-2 flex justify-end gap-2">
            <Link to="/profile" className="inline-block">
              <Button 
                variant="outline" 
                size="sm" 
                className="hover:bg-accent transition-colors"
                type="button"
              >
                👤 โปรไฟล์
              </Button>
            </Link>
          </div>
        </div>
      )}
      
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <ProgressTracker
          currentStreak={currentStreak}
          totalRead={totalReadThisMonth}
          monthlyGoal={30}
          yearProgress={yearProgress}
        />
        
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">ข้อพระคัมภีร์ประจำวัน</h2>
          {readings.map((reading) => (
            <ScriptureCard
              key={reading.id}
              reading={reading}
              isRead={isRead(reading.id)}
              onMarkAsRead={markAsRead}
            />
          ))}
        </div>
        
        <PrayerSection />
        
        <PrayerExamples />
      </main>
    </div>
  );
};

export default Index;