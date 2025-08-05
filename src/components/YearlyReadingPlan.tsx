import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, BookOpen, CheckCircle, Clock, Target, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateYearlyReadingPlan, getReadingForDate, getReadingProgress, getBooksRead, YearlyPlan, DailyReading } from '@/utils/yearlyReadingPlan';

interface YearlyReadingPlanProps {
  onReadingComplete?: (readingId: string) => void;
}

export default function YearlyReadingPlan({ onReadingComplete }: YearlyReadingPlanProps) {
  const [plan, setPlan] = useState<YearlyPlan | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todayReading, setTodayReading] = useState<DailyReading | null>(null);
  const [completedReadings, setCompletedReadings] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    initializePlan();
  }, []);

  useEffect(() => {
    if (plan) {
      const reading = getReadingForDate(plan, currentDate);
      setTodayReading(reading);
    }
  }, [plan, currentDate]);

  const initializePlan = async () => {
    try {
      setIsLoading(true);
      
      // Generate plan starting from January 1st of current year
      const startDate = new Date();
      startDate.setMonth(0, 1); // January 1st
      const yearlyPlan = generateYearlyReadingPlan(startDate);
      setPlan(yearlyPlan);

      if (user) {
        await loadCompletedReadings();
      }
    } catch (error) {
      console.error('Error initializing yearly reading plan:', error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดแผนการอ่านประจำปีได้"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompletedReadings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('reading_id')
        .eq('user_id', user.id)
        .eq('is_completed', true);

      if (error) throw error;

      const completedIds = data?.map(item => item.reading_id) || [];
      setCompletedReadings(completedIds);
    } catch (error) {
      console.error('Error loading completed readings:', error);
    }
  };

  const markReadingComplete = async (readingId: string) => {
    if (!user || !plan) return;

    try {
      const isCompleted = completedReadings.includes(readingId);
      
      if (isCompleted) {
        // Remove completion
        const { error } = await supabase
          .from('reading_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('reading_id', readingId);

        if (error) throw error;

        setCompletedReadings(prev => prev.filter(id => id !== readingId));
        
        toast({
          title: "ยกเลิกการทำเครื่องหมาย",
          description: "ยกเลิกการทำเครื่องหมายว่าอ่านแล้ว"
        });
      } else {
        // Mark as completed
        const { error } = await supabase
          .from('reading_progress')
          .upsert({
            user_id: user.id,
            reading_id: readingId,
            is_completed: true,
            completed_at: new Date().toISOString()
          });

        if (error) throw error;

        setCompletedReadings(prev => [...prev, readingId]);
        
        toast({
          title: "ยินดีด้วย! 🎉",
          description: "บันทึกการอ่านเรียบร้อยแล้ว"
        });

        if (onReadingComplete) {
          onReadingComplete(readingId);
        }
      }
    } catch (error) {
      console.error('Error updating reading progress:', error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการอ่านได้"
      });
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">ไม่สามารถโหลดแผนการอ่านได้</p>
        </CardContent>
      </Card>
    );
  }

  const progress = getReadingProgress(plan, completedReadings);
  const booksRead = getBooksRead(plan, completedReadings);
  const todayReadingId = todayReading ? `${todayReading.date}-daily` : '';
  const isReadingCompleted = completedReadings.includes(todayReadingId);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            แผนการอ่านพระคัมภีร์ครบ 1 ปี
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{progress.progressPercentage}%</div>
              <div className="text-sm text-muted-foreground">ความคืบหน้า</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{progress.completedCount}</div>
              <div className="text-sm text-muted-foreground">วันที่อ่านแล้ว</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{progress.currentStreak}</div>
              <div className="text-sm text-muted-foreground">วันติดต่อกัน</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{booksRead.totalBooksRead}</div>
              <div className="text-sm text-muted-foreground">เล่มที่อ่านแล้ว</div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>ความคืบหน้าในปีนี้</span>
              <span>{progress.completedCount}/{progress.totalReadings} วัน</span>
            </div>
            <Progress value={progress.progressPercentage} className="h-2" />
          </div>

          {progress.daysRemaining > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              เหลืออีก {progress.daysRemaining} วัน จนจบปี
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Reading */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            การอ่านประจำวัน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <div className="font-semibold">
                {currentDate.toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </div>
              {currentDate.toDateString() !== new Date().toDateString() && (
                <Button variant="ghost" size="sm" onClick={goToToday} className="mt-1">
                  กลับสู่วันนี้
                </Button>
              )}
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

          {todayReading ? (
            <div className="space-y-4">
              {/* Reading Sections */}
              <div className="grid gap-4">
                {/* Old Testament */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-medium">พระคัมภีร์เดิม</span>
                    </div>
                    <Badge variant="secondary">เดิม</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold">
                      {todayReading.oldTestament.book} บทที่ {todayReading.oldTestament.chapter}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {todayReading.oldTestament.description}
                    </div>
                  </div>
                </div>

                {/* New Testament */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-medium">พระคัมภีร์ใหม่</span>
                    </div>
                    <Badge variant="default">ใหม่</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold">
                      {todayReading.newTestament.book} บทที่ {todayReading.newTestament.chapter}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {todayReading.newTestament.description}
                    </div>
                  </div>
                </div>

                {/* Psalm */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-medium">สดุดี</span>
                    </div>
                    <Badge variant="outline">บทเพลง</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold">
                      สดุดี บทที่ {todayReading.psalm.chapter}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {todayReading.psalm.description}
                    </div>
                  </div>
                </div>

                {/* Proverbs */}
                {todayReading.proverbs && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span className="font-medium">สุภาษิต</span>
                      </div>
                      <Badge variant="outline">ปัญญา</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold">
                        สุภาษิต บทที่ {todayReading.proverbs.chapter}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {todayReading.proverbs.description}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mark as Read Button */}
              {user && (
                <Button
                  onClick={() => markReadingComplete(todayReadingId)}
                  className={`w-full ${
                    isReadingCompleted 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  {isReadingCompleted ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      อ่านแล้ว ✓
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      ทำเครื่องหมายว่าอ่านแล้ว
                    </>
                  )}
                </Button>
              )}

              {!user && (
                <div className="text-center p-4 border rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">
                    เข้าสู่ระบบเพื่อติดตามความคืบหน้าการอ่าน
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              ไม่มีการอ่านสำหรับวันนี้
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Badge */}
      {progress.progressPercentage >= 100 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="text-center py-8">
            <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-yellow-800 mb-2">
              ยินดีด้วย! คุณอ่านพระคัมภีร์ครบ 1 ปีแล้ว! 🎉
            </h3>
            <p className="text-yellow-700">
              คุณได้อ่านพระคัมภีร์ครบทั้งปีเรียบร้อยแล้ว เป็นความสำเร็จที่น่าภาคภูมิใจมาก!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}