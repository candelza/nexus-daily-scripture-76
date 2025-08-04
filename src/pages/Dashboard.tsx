import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, BookOpen, Target, TrendingUp } from 'lucide-react';

interface ReadingProgress {
  id: string;
  reading_id: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

interface Profile {
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, email, avatar_url')
        .eq('user_id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      setProfile(profileData);

      // Fetch reading progress
      const { data: progressData, error: progressError } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (progressError) {
        throw progressError;
      }

      setReadingProgress(progressData || []);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลผู้ใช้ได้"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถออกจากระบบได้"
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const completedReadings = readingProgress.filter(r => r.is_completed);
  const totalReadings = readingProgress.length;
  const completionRate = totalReadings > 0 ? (completedReadings.length / totalReadings) * 100 : 0;
  
  // Calculate streak (simplified)
  const streak = completedReadings.length;
  
  // This month's readings
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthReadings = completedReadings.filter(r => {
    const completedDate = new Date(r.completed_at || r.created_at);
    return completedDate.getMonth() === currentMonth && completedDate.getFullYear() === currentYear;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              ← กลับสู่หน้าหลัก
            </Button>
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              ยินดีต้อนรับ, {profile?.display_name || user.email}
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Readings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ข้อพระคัมภีร์ทั้งหมด</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReadings}</div>
              <p className="text-xs text-muted-foreground">
                ข้อพระคัมภีร์ที่เข้าชม
              </p>
            </CardContent>
          </Card>

          {/* Completed Readings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">อ่านเสร็จแล้ว</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedReadings.length}</div>
              <p className="text-xs text-muted-foreground">
                ข้อพระคัมภีร์ที่อ่านเสร็จ
              </p>
            </CardContent>
          </Card>

          {/* Current Streak */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">สถิติการอ่าน</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streak}</div>
              <p className="text-xs text-muted-foreground">
                ข้อพระคัมภีร์ที่อ่านแล้ว
              </p>
            </CardContent>
          </Card>

          {/* This Month */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เดือนนี้</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{thisMonthReadings.length}</div>
              <p className="text-xs text-muted-foreground">
                ข้อที่อ่านในเดือนนี้
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>ความคืบหน้าการอ่าน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>เปอร์เซ็นต์การอ่าน</span>
                  <span>{completionRate.toFixed(1)}%</span>
                </div>
                <Progress value={completionRate} />
              </div>
              <div className="text-sm text-muted-foreground">
                อ่านเสร็จแล้ว {completedReadings.length} จากทั้งหมด {totalReadings} ข้อ
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลโปรไฟล์</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">ชื่อ:</span> {profile?.display_name || 'ยังไม่ได้ตั้ง'}
                </div>
                <div className="text-sm">
                  <span className="font-medium">อีเมล:</span> {profile?.email || user.email}
                </div>
                <div className="text-sm">
                  <span className="font-medium">สมาชิกตั้งแต่:</span> {new Date(user.created_at).toLocaleDateString('th-TH')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>กิจกรรมล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            {readingProgress.length > 0 ? (
              <div className="space-y-3">
                {readingProgress.slice(0, 10).map((progress) => (
                  <div key={progress.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{progress.reading_id}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(progress.created_at).toLocaleDateString('th-TH')}
                        </div>
                      </div>
                    </div>
                    <Badge variant={progress.is_completed ? "default" : "secondary"}>
                      {progress.is_completed ? "อ่านเสร็จแล้ว" : "เข้าชม"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">ยังไม่มีกิจกรรมการอ่าน</p>
                <Button className="mt-4" onClick={() => navigate('/')}>
                  เริ่มอ่านพระคัมภีร์
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;