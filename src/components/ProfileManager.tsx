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

interface GroupMembership {
  id: string;
  group_id: string;
  user_groups: UserGroup;
}

const ProfileManager = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [availableGroups, setAvailableGroups] = useState<UserGroup[]>([]);
  const [userGroups, setUserGroups] = useState<GroupMembership[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [customGroupName, setCustomGroupName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAvailableGroups();
      fetchUserGroups();
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
        setEmail(data.email || user?.email || '');
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


  const fetchAvailableGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('user_groups')
        .select('*')
        .order('name');

      if (error) throw error;
      setAvailableGroups(data || []);
    } catch (error: any) {
      console.error('Error fetching available groups:', error);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('group_memberships')
        .select(`
          id,
          group_id,
          user_groups:group_id (
            id,
            name,
            description
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      setUserGroups(data || []);
    } catch (error: any) {
      console.error('Error fetching user groups:', error);
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
          email: email,
          address: address 
        })
        .eq('user_id', user?.id);

      if (profileError) throw profileError;

      // Handle group membership
      if (selectedGroupId) {
        // Check if user is already in this group
        const existingMembership = userGroups.find(ug => ug.group_id === selectedGroupId);
        
        if (!existingMembership) {
          const { error: membershipError } = await supabase
            .from('group_memberships')
            .insert({
              user_id: user?.id,
              group_id: selectedGroupId
            });

          if (membershipError) throw membershipError;
        }
      }

      // Handle custom group creation
      if (customGroupName.trim()) {
        // Check if group already exists
        const existingGroup = availableGroups.find(g => 
          g.name.toLowerCase() === customGroupName.trim().toLowerCase()
        );

        let groupId = existingGroup?.id;

        if (!existingGroup) {
          // Create new group
          const { data: newGroup, error: groupError } = await supabase
            .from('user_groups')
            .insert({
              name: customGroupName.trim(),
              description: `กลุ่มที่สร้างโดย ${displayName || email}`
            })
            .select()
            .single();

          if (groupError) throw groupError;
          groupId = newGroup.id;
        }

        if (groupId) {
          // Join the group
          const existingMembership = userGroups.find(ug => ug.group_id === groupId);
          
          if (!existingMembership) {
            const { error: membershipError } = await supabase
              .from('group_memberships')
              .insert({
                user_id: user?.id,
                group_id: groupId
              });

            if (membershipError) throw membershipError;
          }
        }
      }

      setProfile(prev => prev ? { 
        ...prev, 
        display_name: displayName,
        email: email,
        address: address 
      } : null);

      // Refresh data
      await fetchAvailableGroups();
      await fetchUserGroups();
      
      // Clear form fields
      setSelectedGroupId('');
      setCustomGroupName('');
      
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

  const handleLeaveGroup = async (membershipId: string) => {
    try {
      const { error } = await supabase
        .from('group_memberships')
        .delete()
        .eq('id', membershipId);

      if (error) throw error;

      await fetchUserGroups();
      
      toast({
        title: "สำเร็จ",
        description: "ออกจากกลุ่มเรียบร้อยแล้ว"
      });
    } catch (error: any) {
      console.error('Error leaving group:', error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถออกจากกลุ่มได้"
      });
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

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">อีเมล</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="กรอกอีเมลของคุณ"
          />
          <p className="text-xs text-muted-foreground">
            อีเมลที่ใช้สำหรับการติดต่อ
          </p>
        </div>

        {/* Current Groups */}
        {userGroups.length > 0 && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              กลุ่มที่เข้าร่วมแล้ว
            </Label>
            <div className="space-y-2">
              {userGroups.map((membership) => (
                <div key={membership.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{membership.user_groups.name}</div>
                    {membership.user_groups.description && (
                      <div className="text-sm text-muted-foreground">
                        {membership.user_groups.description}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLeaveGroup(membership.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    ออก
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Join Existing Group */}
        <div className="space-y-2">
          <Label htmlFor="selectGroup" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            เข้าร่วมกลุ่มที่มีอยู่
          </Label>
          <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกกลุ่มที่ต้องการเข้าร่วม" />
            </SelectTrigger>
            <SelectContent>
              {availableGroups
                .filter(group => !userGroups.some(ug => ug.group_id === group.id))
                .map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    <div>
                      <div className="font-medium">{group.name}</div>
                      {group.description && (
                        <div className="text-sm text-muted-foreground">
                          {group.description}
                        </div>
                      )}
                    </div>
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>

        {/* Create New Group */}
        <div className="space-y-2">
          <Label htmlFor="customGroup" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            สร้างกลุ่มใหม่
          </Label>
          <Input
            id="customGroup"
            value={customGroupName}
            onChange={(e) => setCustomGroupName(e.target.value)}
            placeholder="พิมพ์ชื่อกลุ่มใหม่ที่ต้องการสร้าง"
          />
          <p className="text-xs text-muted-foreground">
            หากไม่มีกลุ่มที่ต้องการ สามารถสร้างกลุ่มใหม่ได้
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