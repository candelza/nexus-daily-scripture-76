import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Users, BookHeart, Edit, Save } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CareGroupManager } from '@/components/CareGroupManager';
import { PrayerNotes } from '@/components/PrayerNotes';

interface Profile {
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('prayer');
  const [quickPrayer, setQuickPrayer] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      fetchUserProfile(); // Refresh profile to show new avatar
      toast({ title: 'สำเร็จ', description: 'อัปเดตรูปโปรไฟล์เรียบร้อยแล้ว' });
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถอัปเดตรูปโปรไฟล์ได้', variant: 'destructive' });
    }
  };

  const handleQuickPrayerSubmit = async () => {
    if (!user || !quickPrayer.trim()) return;
    try {
      const { error } = await supabase.from('prayer_notes').insert({
        user_id: user.id,
        title: 'คำอธิษฐานด่วน',
        content: quickPrayer,
        date: new Date().toISOString().split('T')[0],
        is_private: true,
      });

      if (error) throw error;

      toast({ title: 'สำเร็จ', description: 'บันทึกคำอธิษฐานเรียบร้อยแล้ว' });
      setQuickPrayer('');
      // Optionally, refetch prayer notes if they are displayed on the dashboard
    } catch (error) {
      console.error('Error saving quick prayer:', error);
      toast({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถบันทึกคำอธิษฐานได้', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถออกจากระบบได้',
        variant: 'destructive',
      });
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">แดชบอร์ด</h1>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar>
                <AvatarImage src={profile?.avatar_url} alt={profile?.display_name} />
                <AvatarFallback>{profile?.display_name?.[0]}</AvatarFallback>
              </Avatar>
              <Label htmlFor="avatar-upload" className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit className="w-4 h-4" />
              </Label>
              <Input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <span className="text-sm text-muted-foreground">
              {profile?.display_name || 'ผู้ใช้'}
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>คำอธิษฐานด่วน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="พิมพ์คำอธิษฐานของคุณที่นี่..."
                value={quickPrayer}
                onChange={(e) => setQuickPrayer(e.target.value)}
              />
              <Button onClick={handleQuickPrayerSubmit} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                บันทึกคำอธิษฐาน
              </Button>
            </CardContent>
          </Card>
          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="prayer" className="flex items-center gap-2">
                  <BookHeart className="w-4 h-4" />
                  บันทึกคำอธิษฐาน
                </TabsTrigger>
                <TabsTrigger value="care-group" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  กลุ่มแคร์
                </TabsTrigger>
              </TabsList>
              <TabsContent value="prayer">
                {user && <PrayerNotes user={user} />}
              </TabsContent>
              <TabsContent value="care-group">
                {user && <CareGroupManager user={user} />}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;