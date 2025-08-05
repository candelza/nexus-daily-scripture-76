import { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';
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
  const { 
    currentStreak, 
    totalReadThisMonth, 
    yearProgress, 
    markAsRead, 
    isRead, 
    isLoading: isProgressLoading 
  } = useReadingProgress();
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

  // Convert BibleReading to format expected by ScriptureCard
  const readings = todayReading ? [
    {
      id: `ot-${todayReading.date}`,
      book: todayReading.oldTestament.book,
      chapter: parseInt(todayReading.oldTestament.chapter) || 1,
      verses: todayReading.oldTestament.verses,
      text: todayReading.oldTestament.text,
      theme: "พระคัมภีร์เดิม"
    },
    {
      id: `nt-${todayReading.date}`,
      book: todayReading.newTestament.book,
      chapter: parseInt(todayReading.newTestament.chapter) || 1,
      verses: todayReading.newTestament.verses,
      text: todayReading.newTestament.text,
      theme: "พระคัมภีร์ใหม่"
    },
    {
      id: `psalm-${todayReading.date}`,
      book: todayReading.psalm.book,
      chapter: parseInt(todayReading.psalm.chapter) || 1,
      verses: todayReading.psalm.verses,
      text: todayReading.psalm.text,
      theme: "สดุดี"
    }
  ].filter(reading => reading.book && reading.text) : []; // Filter out any invalid readings

  if (loading || isProgressLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentDate={currentDate} onDateChange={setCurrentDate} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground">กำลังโหลดข้อพระคัมภีร์และความคืบหน้าของคุณ...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!todayReading || readings.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentDate={currentDate} onDateChange={setCurrentDate} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <XCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">ไม่พบข้อพระคัมภีร์สำหรับวันนี้</h2>
            <p className="text-muted-foreground">กรุณาลองใหม่อีกครั้งในภายหลัง</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              โหลดใหม่
            </Button>
          </div>
        </div>
      </div>
    );
  }



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
          isLoading={loading || isProgressLoading}
        />
        
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-foreground">ข้อพระคัมภีร์ประจำวัน</h2>
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('th-TH', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </span>
          </div>
          
          <div className="space-y-4">
            {readings.map((reading) => (
              <ScriptureCard
                key={reading.id}
                reading={reading}
                isRead={isRead(reading.id)}
                onMarkAsRead={markAsRead}
                isLoading={loading || isProgressLoading}
              />
            ))}
          </div>
        </div>
        
        <PrayerSection />
        
        <PrayerExamples />
      </main>
    </div>
  );
};

export default Index;