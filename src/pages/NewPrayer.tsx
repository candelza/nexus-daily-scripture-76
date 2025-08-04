import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Save, BookHeart } from 'lucide-react';

interface CareGroup { id: string; name: string; }

const NewPrayer = () => {
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [careGroups, setCareGroups] = useState<CareGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchCareGroups();
  }, [user]);

  const fetchCareGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('user_care_groups')
        .select('care_groups(id, name)')
        .eq('user_id', user?.id);
      if (error) throw error;
      setCareGroups(data.map((d: any) => ({ id: d.care_groups.id, name: d.care_groups.name })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!title || !content) {
      toast({ title: 'กรุณากรอกข้อมูลให้ครบถ้วน', variant: 'destructive' });
      return;
    }
    if (!user) return;
    try {
      setLoading(true);
      const { error } = await supabase.from('prayer_notes').insert({
        user_id: user.id,
        title,
        content,
        date: new Date().toISOString().split('T')[0],
        is_private: isPrivate,
        care_group_id: selectedGroup || null,
      });
      if (error) throw error;
      toast({ title: 'สำเร็จ', description: 'บันทึกคำอธิษฐานเรียบร้อยแล้ว' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving note:', error);
      toast({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถบันทึกคำอธิษฐานได้', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">เขียนคำอธิษฐาน</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookHeart className="w-5 h-5"/> บันทึกคำอธิษฐาน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">หัวข้อ</Label>
              <Input id="title" value={title} onChange={(e)=>setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">เนื้อหา</Label>
              <Textarea id="content" rows={6} value={content} onChange={(e)=>setContent(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>กลุ่มแคร์ (ไม่บังคับ)</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger><SelectValue placeholder="เลือกกลุ่มแคร์" /></SelectTrigger>
                <SelectContent>
                  {careGroups.map((g)=>(<SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="private" checked={isPrivate} onChange={(e)=>setIsPrivate(e.target.checked)} />
              <Label htmlFor="private">ส่วนตัว</Label>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={loading}><Save className="w-4 h-4 mr-2"/> บันทึก</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NewPrayer;
