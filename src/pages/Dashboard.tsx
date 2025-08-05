import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProfileManager from '@/components/ProfileManager';
import { 
  LogOut, 
  Home, 
  BookOpen, 
  Heart, 
  TrendingUp, 
  Calendar,
  MessageCircle,
  Target 
} from 'lucide-react';

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

interface ReadingProgress {
  id: string;
  reading_id: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

interface PrayerRequest {
  id: string;
  title: string;
  content: string;
  is_answered: boolean;
  created_at: string;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      setProfile(profileData);

      // Load reading progress
      const { data: progressData, error: progressError } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (progressError) {
        console.error('Error loading reading progress:', progressError);
      } else {
        setReadingProgress(progressData || []);
      }

      // Load prayer requests
      const { data: prayersData, error: prayersError } = await supabase
        .from('prayer_requests')
        .select('id, title, content, is_answered, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (prayersError) {
        console.error('Error loading prayer requests:', prayersError);
      } else {
        setPrayerRequests(prayersData || []);
      }

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลได้"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const completedReadings = readingProgress.filter(r => r.is_completed);
  const totalReadings = readingProgress.length;
  const completionRate = totalReadings > 0 ? (completedReadings.length / totalReadings) * 100 : 0;
  
  // This month's readings
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthReadings = completedReadings.filter(r => {
    const completedDate = new Date(r.completed_at || r.created_at);
    return completedDate.getMonth() === currentMonth && completedDate.getFullYear() === currentYear;
  });

  // Answered prayers
  const answeredPrayers = prayerRequests.filter(p => p.is_answered);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">แดชบอร์ด</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              ยินดีต้อนรับ, {profile?.display_name || user?.email}
            </span>
            <Button variant="outline" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              หน้าหลัก
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เดือนนี้</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{thisMonthReadings.length}</div>
              <p className="text-xs text-muted-foreground">
                ข้อที่อ่านในเดือนนี้
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">คำอธิษฐาน</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{prayerRequests.length}</div>
              <p className="text-xs text-muted-foreground">
                คำอธิษฐานทั้งหมด
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Manager */}
          <div>
            <ProfileManager />
          </div>

          {/* Progress Overview */}
          <div className="space-y-6">
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
                <CardTitle>สถิติคำอธิษฐาน</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">คำอธิษฐานทั้งหมด</span>
                  <span className="font-semibold">{prayerRequests.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">ได้รับการตอบแล้ว</span>
                  <span className="font-semibold text-green-600">{answeredPrayers.length}</span>
                </div>
                {prayerRequests.length > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>อัตราการตอบ</span>
                      <span>{((answeredPrayers.length / prayerRequests.length) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(answeredPrayers.length / prayerRequests.length) * 100} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Reading Activity */}
          <Card>
            <CardHeader>
              <CardTitle>กิจกรรมการอ่านล่าสุด</CardTitle>
            </CardHeader>
            <CardContent>
              {readingProgress.length > 0 ? (
                <div className="space-y-3">
                  {readingProgress.slice(0, 5).map((progress) => (
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

          {/* Recent Prayer Requests */}
          <Card>
            <CardHeader>
              <CardTitle>คำอธิษฐานล่าสุด</CardTitle>
            </CardHeader>
            <CardContent>
              {prayerRequests.length > 0 ? (
                <div className="space-y-3">
                  {prayerRequests.slice(0, 5).map((prayer) => (
                    <div key={prayer.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{prayer.title}</h4>
                        {prayer.is_answered && (
                          <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                            ตอบแล้ว
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {prayer.content}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {new Date(prayer.created_at).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">ยังไม่มีคำอธิษฐาน</p>
                  <Button className="mt-4" onClick={() => navigate('/')}>
                    เขียนคำอธิษฐาน
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;