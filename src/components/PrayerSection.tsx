import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Users, User, Clock } from 'lucide-react';

const PrayerSection = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [currentGroup, setCurrentGroup] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();

  const timeOptions = [
    { value: 'morning', label: 'เช้า (6:00-12:00)' },
    { value: 'afternoon', label: 'บ่าย (12:00-18:00)' },
    { value: 'evening', label: 'เย็น (18:00-22:00)' },
    { value: 'night', label: 'กลางคืน (22:00-6:00)' },
    { value: 'anytime', label: 'ตลอดเวลา' }
  ];

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, email')
        .eq('user_id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
      } else if (profileData) {
        setProfile(profileData);
        setDisplayName(profileData.display_name || '');
      }

          // Load user's group membership with group details
      const { data: groupData, error: groupError } = await supabase
        .from('group_memberships')
        .select(`
          id,
          user_groups!inner(
            id,
            name,
            description
          )
        `)
        .eq('user_id', user?.id)
        .single();

      if (groupError && groupError.code !== 'PGRST116') {
        console.error('Error loading group:', groupError);
        setCurrentGroup('ยังไม่ได้เลือกกลุ่ม');
      } else if (groupData?.user_groups?.name) {
        setCurrentGroup(groupData.user_groups.name);
        // Store the group name in local storage for quick access
        localStorage.setItem(`user_group_${user?.id}`, groupData.user_groups.name);
      } else {
        setCurrentGroup('ยังไม่ได้เลือกกลุ่ม');
        // Clear any previously stored group
        localStorage.removeItem(`user_group_${user?.id}`);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const getGroupColor = (groupName: string) => {
    // Normalize group name by removing 'กลุ่ม' prefix for consistency
    const normalizedGroupName = groupName.replace(/^กลุ่ม/, '');
    
    // Create a consistent color based on the group name
    const groupColors: {[key: string]: string} = {
      'เยาวชน': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'ผู้ใหญ่': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'ผู้สูงอายุ': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'ครอบครัว': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    };
    
    // Return the matching color or a default one
    return groupColors[normalizedGroupName] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      
      // Use displayName if provided, otherwise use profile display_name or email
      const finalDisplayName = displayName.trim() || 
                              profile?.display_name || 
                              profile?.email || 
                              user.email || 
                              'ผู้ใช้งาน';
      
      const { error } = await supabase
        .from('prayer_requests')
        .insert({
          user_id: user.id,
          title: title.trim(),
          content: content.trim(),
          display_name: finalDisplayName
        });

      if (error) throw error;

      toast({
        title: "บันทึกคำอธิษฐานสำเร็จ",
        description: "คำอธิษฐานของคุณได้รับการบันทึกแล้ว"
      });

      // Clear form
      setTitle('');
      setContent('');
      // Reset display name to profile default
      setDisplayName(profile?.display_name || '');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถบันทึกคำอธิษฐานได้"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">คำอธิษฐาน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              กรุณาเข้าสู่ระบบเพื่อบันทึกคำอธิษฐานของคุณ
            </p>
            <Link to="/auth">
              <Button>เข้าสู่ระบบ</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">คำอธิษฐาน</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Info Section */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile?.avatar_url || ''} alt="โปรไฟล์" />
              <AvatarFallback className="bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-semibold text-foreground">
                {profile?.display_name || profile?.email || user.email || 'ผู้ใช้งาน'}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${getGroupColor(currentGroup)} border-0 text-xs`}>
                  <Users className="h-3 w-3 mr-1" />
                  {currentGroup}
                </Badge>
              </div>
            </div>
          </div>
          
          {!currentGroup || currentGroup === 'ยังไม่ได้เลือกกลุ่ม' ? (
            <div className="text-sm text-muted-foreground bg-background rounded p-2 border">
              💡 <strong>แนะนำ:</strong> ไปที่ <Link to="/profile" className="text-primary hover:underline">ตั้งค่าโปรไฟล์</Link> เพื่อเลือกกลุ่มของคุณ
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              กลุ่ม: <span className="font-medium text-foreground">{currentGroup}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name Override */}
          <div className="space-y-2">
            <Label htmlFor="display-name">ชื่อที่ต้องการแสดงในคำอธิษฐาน (ถ้าต้องการเปลี่ยน)</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="ชื่อที่แสดงในคำอธิษฐาน"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              ถ้าไม่กรอก จะใช้ชื่อจากโปรไฟล์: {profile?.display_name || profile?.email || user.email}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prayer-title">หัวข้อ</Label>
            <Input
              id="prayer-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="หัวข้อคำอธิษฐาน"
              required
              maxLength={100}
            />
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              เวลาที่ต้องการให้อธิษฐาน
            </Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกช่วงเวลา" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTime && (
              <p className="text-xs text-muted-foreground">
                ช่วงเวลาที่เลือก: {timeOptions.find(opt => opt.value === selectedTime)?.label}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prayer-content">เนื้อหาคำอธิษฐาน</Label>
            <Textarea
              id="prayer-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="เขียนคำอธิษฐานของคุณที่นี่..."
              required
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {content.length}/1000 ตัวอักษร
            </p>
          </div>
          
          <Button 
            type="submit" 
            disabled={loading || !title.trim() || !content.trim()}
            className="w-full"
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึกคำอธิษฐาน'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PrayerSection;