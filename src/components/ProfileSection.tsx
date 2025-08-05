import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload } from 'lucide-react';

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

interface ProfileSectionProps {
  profile: Profile | null;
  onProfileUpdate: () => void;
}

const ProfileSection = ({ profile, onProfileUpdate }: ProfileSectionProps) => {
  const [uploading, setUploading] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [updating, setUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "อัพโหลดรูปโปรไฟล์สำเร็จ",
        description: "รูปโปรไฟล์ของคุณได้รับการอัพเดตแล้ว"
      });

      onProfileUpdate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัพโหลดรูปโปรไฟล์ได้"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateDisplayName = async () => {
    if (!user) return;

    try {
      setUpdating(true);

      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "อัพเดตชื่อสำเร็จ",
        description: "ชื่อแสดงของคุณได้รับการอัพเดตแล้ว"
      });

      onProfileUpdate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัพเดตชื่อได้"
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>โปรไฟล์ของฉัน</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage 
                src={profile?.avatar_url || ''} 
                alt={profile?.display_name || 'Avatar'} 
              />
              <AvatarFallback className="text-2xl">
                {profile?.display_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="secondary"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
            accept="image/*"
            className="hidden"
          />
          
          <p className="text-sm text-muted-foreground text-center">
            คลิกไอคอนกล้องเพื่อเปลี่ยนรูปโปรไฟล์
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display-name">ชื่อแสดง</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="กรอกชื่อแสดงของคุณ"
            />
          </div>
          
          <div className="space-y-2">
            <Label>อีเมล</Label>
            <Input 
              value={profile?.email || ''} 
              disabled 
              className="bg-muted"
            />
          </div>
          
          <Button 
            onClick={handleUpdateDisplayName}
            disabled={updating || displayName === profile?.display_name}
            className="w-full"
          >
            {updating ? 'กำลังอัพเดต...' : 'อัพเดตชื่อแสดง'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSection;