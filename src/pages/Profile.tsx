import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Save, Users } from 'lucide-react';

interface CareGroup {
  id: string;
  name: string;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [careGroups, setCareGroups] = useState<CareGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(undefined);
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
      fetchProfile();
      fetchCareGroups();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setDisplayName(data.display_name || '');
      setAvatarUrl(data.avatar_url || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถโหลดโปรไฟล์ได้', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCareGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('care_groups')
        .select('id, name');
      if (error) throw error;
      setCareGroups(data);
      // fetch user current group
      const { data: ucg } = await supabase
        .from('user_care_groups')
        .select('care_group_id')
        .eq('user_id', user?.id)
        .single();
      if (ucg) setSelectedGroup(ucg.care_group_id);
    } catch (error) {
      console.error('Error fetching care groups:', error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setLoading(true);
      let uploadedAvatarUrl = avatarUrl;

      if (avatarFile) {
        const fileName = `${user.id}/${Date.now()}-${avatarFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        uploadedAvatarUrl = publicUrl;
      }

      // Update profile name & avatar
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ display_name: displayName, avatar_url: uploadedAvatarUrl })
        .eq('id', user.id);
      if (profileError) throw profileError;

      // Update care group selection (simple: ensure single membership)
      if (selectedGroup) {
        // upsert into user_care_groups
        await supabase.from('user_care_groups').upsert({
          user_id: user.id,
          care_group_id: selectedGroup,
          role: 'member',
        }, { onConflict: 'user_id' });
      }

      toast({ title: 'สำเร็จ', description: 'บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว' });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถบันทึกข้อมูลได้', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <h1 className="text-2xl font-bold">ข้อมูลส่วนตัว</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" /> แก้ไขข้อมูลส่วนตัว
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback>{displayName?.[0]}</AvatarFallback>
                </Avatar>
                <Label htmlFor="avatar-upload" className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit className="w-4 h-4" />
                </Label>
                <Input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">ชื่อที่แสดง</Label>
                  <Input id="display-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>กลุ่มแคร์</Label>
                  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกกลุ่มแคร์" />
                    </SelectTrigger>
                    <SelectContent>
                      {careGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={loading}>
                <Save className="w-4 h-4 mr-2" /> บันทึกข้อมูล
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
