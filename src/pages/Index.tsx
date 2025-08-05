import { useState, useEffect } from 'react';
import { XCircle, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { ScriptureCard } from '@/components/ScriptureCard';
import { ProgressTracker } from '@/components/ProgressTracker';
import PrayerSection from '@/components/PrayerSection';
import PrayerExamples from '@/components/PrayerExamples';
import ScriptureCalendar from '@/components/ScriptureCalendar';
import YearlyReadingPlan from '@/components/YearlyReadingPlan';
import { Button } from '@/components/ui/button';
import { getTodayReading, BibleReading } from '@/data/bibleReadings';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

// Define the structure for scripture items
interface ScriptureItem {
  id: string;
  book: string;
  chapter: number;
  verses: string;
  text: string;
  theme: string;
}

const Index = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todayReading, setTodayReading] = useState<BibleReading | null>(null);
  const [scriptures, setScriptures] = useState<ScriptureItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    currentStreak = 0, 
    totalReadThisMonth = 0, 
    yearProgress = 0, 
    markAsRead, 
    isRead, 
    isLoading: isProgressLoading 
  } = useReadingProgress();
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Function to load today's reading
  const loadReading = async () => {
    console.log('Starting to load reading...');
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching today\'s reading...');
      const reading = await getTodayReading();
      console.log('Received reading:', reading);
      
      if (!reading) {
        throw new Error('No reading data received');
      }
      
      setTodayReading(reading);
      
      // Transform the reading data into the format expected by ScriptureCard
      const formattedScriptures: ScriptureItem[] = [
        {
          id: `ot-${reading.date || 'today'}`,
          book: reading.oldTestament?.book || '',
          chapter: parseInt(reading.oldTestament?.chapter || '1'),
          verses: reading.oldTestament?.verses || '',
          text: reading.oldTestament?.text || '',
          theme: 'พระคัมภีร์เดิม'
        },
        {
          id: `nt-${reading.date || 'today'}`,
          book: reading.newTestament?.book || '',
          chapter: parseInt(reading.newTestament?.chapter || '1'),
          verses: reading.newTestament?.verses || '',
          text: reading.newTestament?.text || '',
          theme: 'พระคัมภีร์ใหม่'
        },
        {
          id: `psalm-${reading.date || 'today'}`,
          book: reading.psalm?.book || '',
          chapter: parseInt(reading.psalm?.chapter || '1'),
          verses: reading.psalm?.verses || '',
          text: reading.psalm?.text || '',
          theme: 'สดุดี'
        }
      ].filter(reading => reading.book && reading.text);
      
      console.log('Formatted scriptures:', formattedScriptures);
      setScriptures(formattedScriptures);
      
      if (formattedScriptures.length === 0) {
        console.warn('No valid scripture entries found');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error loading reading:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: errorMessage,
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      setError(`ไม่สามารถโหลดข้อพระคัมภีร์ได้: ${errorMessage}`);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: `ไม่สามารถโหลดข้อพระคัมภีร์ได้: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load today's reading on component mount
  useEffect(() => {
    console.log('Component mounted, loading reading...');
    const loadData = async () => {
      try {
        await loadReading();
      } catch (error) {
        console.error('Error in loadData effect:', error);
      }
    };
    
    loadData();
    
    // Add a timeout to check if loading is stuck
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('Loading is taking too long, current state:', { isLoading, error, scriptures });
      }
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Handle mark as read
  const handleMarkAsRead = (id: string) => {
    try {
      markAsRead(id);
      toast({
        title: 'บันทึกแล้ว',
        description: 'บันทึกการอ่านเรียบร้อยแล้ว',
      });
    } catch (error) {
      console.error('Error marking as read:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกการอ่านได้ในขณะนี้',
      });
    }
  };

  // Loading state
  if (isLoading || isProgressLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentDate={currentDate} onDateChange={setCurrentDate} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">กำลังโหลดข้อพระคัมภีร์และความคืบหน้าของคุณ...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentDate={currentDate} onDateChange={setCurrentDate} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">เกิดข้อผิดพลาด</h2>
            <p className="text-muted-foreground">{error}</p>
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

 // No readings available or error state
  if (scriptures.length === 0 || !todayReading) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentDate={currentDate} onDateChange={setCurrentDate} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <XCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">
              {error ? 'เกิดข้อผิดพลาด' : 'ไม่พบข้อพระคัมภีร์สำหรับวันนี้'}
            </h2>
            <p className="text-muted-foreground">
              {error || 'กรุณาลองใหม่อีกครั้งในภายหลัง'}
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                โหลดใหม่
              </Button>
              <Button 
                variant="default" 
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  setTimeout(() => loadReading(), 500);
                }}
                className="mt-4"
              >
                ลองอีกครั้ง
              </Button>
            </div>
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
          isLoading={isProgressLoading}
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
            {scriptures.map((scripture) => (
              <ScriptureCard
                key={scripture.id}
                reading={{
                  id: scripture.id,
                  book: scripture.book,
                  chapter: scripture.chapter,
                  verses: scripture.verses,
                  text: scripture.text,
                  theme: scripture.theme
                }}
                isRead={isRead(scripture.id)}
                onMarkAsRead={handleMarkAsRead}
                isLoading={isLoading || isProgressLoading}
              />
            ))}
          </div>
        </div>

        <ScriptureCalendar />
        
        <YearlyReadingPlan />
        
        <PrayerSection />
        <PrayerExamples />
      </main>
    </div>
  );
};

export default Index;