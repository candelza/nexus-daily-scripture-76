import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ImagePlus, Users, Edit, Trash2, Plus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

import { User } from '@supabase/supabase-js';

interface CareGroupManagerProps {
  user: User;
}

export const CareGroupManager: React.FC<CareGroupManagerProps> = ({ user }) => {
  const [careGroups, setCareGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageFile: null as File | null,
    imagePreview: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCareGroups();
  }, []);

  const fetchCareGroups = async () => {
    try {
      if (!user) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_care_groups')
        .select(`
          id,
          role,
          care_groups:care_group_id (
            id,
            name,
            description,
            image_url,
            created_at
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      setCareGroups(data.map(item => ({
        ...item.care_groups,
        role: item.role
      })) as any);
    } catch (error) {
      console.error('Error fetching care groups:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลกลุ่มแคร์ได้',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    try {

      let imageUrl = '';
      
      // Upload image if exists
      if (formData.imageFile) {
        const fileExt = formData.imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('care-group-images')
          .upload(fileName, formData.imageFile);

        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('care-group-images')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      }

      // Create care group
      const { data: careGroup, error: groupError } = await supabase
        .from('care_groups')
        .insert([
          { 
            name: formData.name,
            description: formData.description,
            image_url: imageUrl,
            created_by: user.id
          }
        ])
        .select()
        .single();

      if (groupError) throw groupError;

      // Add user to care group as leader
      const { error: userGroupError } = await supabase
        .from('user_care_groups')
        .insert([
          {
            user_id: user.id,
            care_group_id: careGroup.id,
            role: 'leader'
          }
        ]);

      if (userGroupError) throw userGroupError;

      toast({
        title: 'สำเร็จ',
        description: 'สร้างกลุ่มแคร์เรียบร้อยแล้ว',
      });

      // Reset form and refresh list
      setFormData({
        name: '',
        description: '',
        imageFile: null,
        imagePreview: ''
      });
      setIsCreating(false);
      fetchCareGroups();
    } catch (error) {
      console.error('Error creating care group:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถสร้างกลุ่มแคร์ได้',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>กำลังโหลดกลุ่มแคร์...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">กลุ่มแคร์ของฉัน</h2>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="w-4 h-4 mr-2" />
          สร้างกลุ่มแคร์ใหม่
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>สร้างกลุ่มแคร์ใหม่</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">ชื่อกลุ่ม</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">คำอธิบาย</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="image">รูปภาพกลุ่ม (ไม่บังคับ)</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-24 h-24 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                    {formData.imagePreview ? (
                      <img 
                        src={formData.imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImagePlus className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Label 
                      htmlFor="image" 
                      className="inline-flex items-center px-4 py-2 border border-input rounded-md text-sm font-medium cursor-pointer hover:bg-accent hover:text-accent-foreground"
                    >
                      <ImagePlus className="w-4 h-4 mr-2" />
                      อัปโหลดรูปภาพ
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreating(false)}
                >
                  ยกเลิก
                </Button>
                <Button type="submit">สร้างกลุ่ม</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {careGroups.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            <Users className="mx-auto h-12 w-12 mb-2" />
            <p>คุณยังไม่มีกลุ่มแคร์</p>
            <p className="text-sm">คลิกที่ปุ่ม "สร้างกลุ่มแคร์ใหม่" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          careGroups.map((group: any) => (
            <Card key={group.id} className="overflow-hidden">
              <div className="h-32 bg-muted relative">
                {group.image_url ? (
                  <img 
                    src={group.image_url} 
                    alt={group.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Users className="w-12 h-12 text-primary" />
                  </div>
                )}
                {group.role === 'leader' && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    ผู้นำกลุ่ม
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{group.name}</CardTitle>
                {group.description && (
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  {group.role === 'leader' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/care-group/${group.id}/manage`)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      จัดการกลุ่ม
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
