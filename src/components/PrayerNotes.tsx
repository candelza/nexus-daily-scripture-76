import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Calendar, Edit, Save, X, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type PrayerNote = Database['public']['Tables']['prayer_notes']['Row'] & {
  care_group_name?: string;
};

type CareGroup = Database['public']['Tables']['care_groups']['Row'];

import { User } from '@supabase/supabase-js';

interface PrayerNotesProps {
  user: User;
}

export const PrayerNotes: React.FC<PrayerNotesProps> = ({ user }) => {
  const [notes, setNotes] = useState<PrayerNote[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [editingNote, setEditingNote] = useState<Partial<PrayerNote> | null>(null);
  const [careGroups, setCareGroups] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Generate dates for the past 7 days
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchPrayerNotes();
    fetchCareGroups();
  }, [selectedDate]);

  const fetchPrayerNotes = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // Get notes for the selected date
      const { data, error } = await supabase
        .from('prayer_notes')
        .select(`
          *,
          care_groups:care_group_id (id, name)
        `)
        .eq('date', selectedDate)
        .or(`user_id.eq.${user.id},and(is_private.eq.false,care_group_id.in.(${careGroups.map(g => `"${g.id}"`).join(',')}))`);

      if (error) throw error;

      setNotes((data || []).map(note => ({
        ...note,
        care_group_name: (note.care_groups as any)?.name
      })));
    } catch (error) {
      console.error('Error fetching prayer notes:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดบันทึกการอธิษฐานได้',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCareGroups = async () => {
    if (!user) return;
    try {

      const { data, error } = await supabase
        .from('user_care_groups')
        .select('care_groups(id, name)')
        .eq('user_id', user.id);

      if (error) throw error;

      setCareGroups(data.map((item: any) => ({
        id: item.care_groups.id,
        name: item.care_groups.name
      })));
    } catch (error) {
      console.error('Error fetching care groups:', error);
    }
  };

  const handleSaveNote = async () => {
    if (!editingNote?.title || !editingNote?.content) {
      toast({
        title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        variant: 'destructive',
      });
      return;
    }

    if (!user) return;

    try {
      setLoading(true);

      if (editingNote.id) {
        // Update existing note
        const { error } = await supabase
          .from('prayer_notes')
          .update({
            title: editingNote.title,
            content: editingNote.content,
            is_private: editingNote.is_private,
            care_group_id: editingNote.care_group_id || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingNote.id);

        if (error) throw error;

        toast({
          title: 'บันทึกสำเร็จ',
          description: 'อัปเดตบันทึกการอธิษฐานเรียบร้อยแล้ว',
        });
      } else {
        // Create new note
        const { error } = await supabase
          .from('prayer_notes')
          .insert([
            {
              user_id: user.id,
              title: editingNote.title,
              content: editingNote.content,
              date: selectedDate,
              is_private: editingNote.is_private ?? true,
              care_group_id: editingNote.care_group_id || null
            }
          ]);

        if (error) throw error;

        toast({
          title: 'บันทึกสำเร็จ',
          description: 'เพิ่มบันทึกการอธิษฐานเรียบร้อยแล้ว',
        });
      }

      setEditingNote(null);
      fetchPrayerNotes();
    } catch (error) {
      console.error('Error saving prayer note:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกการอธิษฐานได้',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบันทึกนี้?')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('prayer_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'ลบสำเร็จ',
        description: 'ลบบันทึกการอธิษฐานเรียบร้อยแล้ว',
      });

      fetchPrayerNotes();
    } catch (error) {
      console.error('Error deleting prayer note:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถลบบันทึกการอธิษฐานได้',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayDate = (dateString: string) => {
    return format(parseISO(dateString), 'EEEEที่ d MMMM yyyy', { locale: th });
  };

  if (loading && !editingNote) {
    return <div className="text-center py-8">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">บันทึกการอธิษฐาน</h2>
        <div className="flex items-center gap-2">
          <Select 
            value={selectedDate} 
            onValueChange={setSelectedDate}
          >
            <SelectTrigger className="w-[220px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="เลือกวันที่" />
            </SelectTrigger>
            <SelectContent>
              {dateOptions.map(date => (
                <SelectItem key={date} value={date}>
                  {formatDisplayDate(date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={() => setEditingNote({
              title: '',
              content: '',
              is_private: true,
              date: selectedDate
            })}
          >
            <Edit className="w-4 h-4 mr-2" />
            เพิ่มบันทึก
          </Button>
        </div>
      </div>

      {editingNote ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingNote.id ? 'แก้ไขบันทึก' : 'เพิ่มบันทึกใหม่'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">หัวข้อ</label>
              <input
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editingNote.title || ''}
                onChange={(e) => setEditingNote({...editingNote, title: e.target.value})}
                placeholder="หัวข้อบันทึกการอธิษฐาน"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">เนื้อหา</label>
              <Textarea
                value={editingNote.content || ''}
                onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                placeholder="เขียนคำอธิษฐานของคุณที่นี่..."
                className="min-h-[150px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">การมองเห็น</label>
                <Select
                  value={editingNote.is_private ? 'private' : 'public'}
                  onValueChange={(value) => setEditingNote({
                    ...editingNote,
                    is_private: value === 'private',
                    care_group_id: value === 'group' ? careGroups[0]?.id : null
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกการมองเห็น" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">ส่วนตัวเท่านั้น</SelectItem>
                    <SelectItem value="public">สาธารณะ (ทุกคนในกลุ่มเห็นได้)</SelectItem>
                    {careGroups.length > 0 && (
                      <SelectItem value="group">เฉพาะกลุ่ม</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {editingNote.is_private === false && careGroups.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1">กลุ่มแคร์</label>
                  <Select
                    value={editingNote.care_group_id || ''}
                    onValueChange={(value) => setEditingNote({
                      ...editingNote,
                      care_group_id: value || null
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกกลุ่มแคร์" />
                    </SelectTrigger>
                    <SelectContent>
                      {careGroups.map(group => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setEditingNote(null)}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              ยกเลิก
            </Button>
            <Button 
              onClick={handleSaveNote}
              disabled={loading || !editingNote.title || !editingNote.content}
            >
              <Save className="w-4 h-4 mr-2" />
              บันทึก
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-4">
          {notes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>ไม่มีบันทึกการอธิษฐานสำหรับวันที่ {formatDisplayDate(selectedDate)}</p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => setEditingNote({
                    title: '',
                    content: '',
                    is_private: true,
                    date: selectedDate
                  })}
                >
                  เพิ่มบันทึกใหม่
                </Button>
              </CardContent>
            </Card>
          ) : (
            notes.map((note) => (
              <Card key={note.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setEditingNote(note)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDisplayDate(note.date)}
                    {note.care_group_name && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                        {note.care_group_name}
                      </span>
                    )}
                    {note.is_private && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                        ส่วนตัว
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line">{note.content}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
