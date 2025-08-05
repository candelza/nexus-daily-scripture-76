import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, User, Users } from 'lucide-react';

interface Profile {
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  address: string | null;
}

interface UserGroup {
  id: string;
  name: string;
  description: string | null;
}

const ProfileManager = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentGroupId, setCurrentGroupId] = useState<string>('');
  const [displayName, setDisplayName] = useState('');
  const [address, setAddress] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchCurrentGroup();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, email, avatar_url, address')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || '');
        setAddress(data.address || '');
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้"
      });
    }
  };


  const fetchCurrentGroup = async () => {
    try {
      // Get from localStorage for now
      const savedGroup = localStorage.getItem(`user_group_${user?.id}`);
      if (savedGroup) {
        setCurrentGroupId(savedGroup);
      }
    } catch (error: any) {
      console.error('Error fetching current group:', error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "ไฟล์ไม่ถูกต้อง",
          description: "กรุณาเลือกไฟล์รูปภาพเท่านั้น"
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "ไฟล์ใหญ่เกินไป",
          description: "กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB"
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/avatar.${fileExt}`;

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user?.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      
      toast({
        title: "สำเร็จ",
        description: "อัพโหลดรูปโปรไฟล์เรียบร้อยแล้ว"
      });

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพโหลดรูปภาพได้"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          display_name: displayName,
          address: address 
        })
        .eq('user_id', user?.id);

      if (profileError) throw profileError;

      // Store group selection in localStorage for now
      if (currentGroupId) {
        localStorage.setItem(`user_group_${user?.id}`, currentGroupId);
      }

      setProfile(prev => prev ? { 
        ...prev, 
        display_name: displayName,
        address: address 
      } : null);
      
      toast({
        title: "สำเร็จ",
        description: "บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว"
      });

    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้"
      });
    } finally {
      setSaving(false);
    }
  };

  

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          จัดการโปรไฟล์
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="text-lg">
              {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'กำลังอัพโหลด...' : 'เปลี่ยนรูปโปรไฟล์'}
            </Button>
            <p className="text-xs text-muted-foreground">
              รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName">ชื่อที่แสดง</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="กรอกชื่อที่ต้องการแสดง"
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">ที่อยู่</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="กรอกที่อยู่ของคุณ"
          />
        </div>

        {/* Email (Read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email">อีเมล</Label>
          <Input
            id="email"
            value={profile?.email || user?.email || ''}
            disabled
            className="bg-muted cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground">
            อีเมลไม่สามารถแก้ไขได้
          </p>
        </div>

        {/* Group Selection */}
        <div className="space-y-2">
          <Label htmlFor="group" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            กลุ่ม
          </Label>
          <Input
            id="group"
            value={currentGroupId}
            onChange={(e) => setCurrentGroupId(e.target.value)}
            placeholder="พิมพ์ชื่อกลุ่มของคุณ"
          />
          <p className="text-xs text-muted-foreground">
            พิมพ์ชื่อกลุ่มที่คุณต้องการเข้าร่วม
          </p>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSaveProfile}
          disabled={saving}
          className="w-full"
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileManager;