import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, UserMinus } from 'lucide-react';

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

const GroupSection = () => {
  const [availableGroups, setAvailableGroups] = useState<UserGroup[]>([]);
  const [userGroups, setUserGroups] = useState<GroupMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadGroups();
      loadUserGroups();
    }
  }, [user]);

  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('user_groups')
        .select('*')
        .eq('is_public', true)
        .order('name');

      if (error) throw error;
      setAvailableGroups(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดกลุ่มได้"
      });
    }
  };

  const loadUserGroups = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('group_memberships')
        .select(`
          *,
          user_groups (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setUserGroups(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดกลุ่มของคุณได้"
      });
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async () => {
    if (!user || !selectedGroupId) return;

    try {
      setJoining(true);

      // Check if already a member
      const isAlreadyMember = userGroups.some(
        membership => membership.group_id === selectedGroupId
      );

      if (isAlreadyMember) {
        toast({
          variant: "destructive",
          title: "คุณเป็นสมาชิกของกลุ่มนี้อยู่แล้ว"
        });
        return;
      }

      const { error } = await supabase
        .from('group_memberships')
        .insert({
          user_id: user.id,
          group_id: selectedGroupId
        });

      if (error) throw error;

      toast({
        title: "เข้าร่วมกลุ่มสำเร็จ",
        description: "คุณได้เข้าร่วมกลุ่มแล้ว"
      });

      setSelectedGroupId('');
      loadUserGroups();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถเข้าร่วมกลุ่มได้"
      });
    } finally {
      setJoining(false);
    }
  };

  const leaveGroup = async (membershipId: string, groupName: string) => {
    try {
      const { error } = await supabase
        .from('group_memberships')
        .delete()
        .eq('id', membershipId);

      if (error) throw error;

      toast({
        title: "ออกจากกลุ่มสำเร็จ",
        description: `คุณได้ออกจากกลุ่ม "${groupName}" แล้ว`
      });

      loadUserGroups();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถออกจากกลุ่มได้"
      });
    }
  };

  const getAvailableGroupsToJoin = () => {
    const joinedGroupIds = userGroups.map(membership => membership.group_id);
    return availableGroups.filter(group => !joinedGroupIds.includes(group.id));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            กลุ่มของฉัน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">กำลังโหลด...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          กลุ่มของฉัน
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Join new group */}
        <div className="space-y-2">
          <Label>เข้าร่วมกลุ่มใหม่</Label>
          <div className="flex gap-2">
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกกลุ่มที่ต้องการเข้าร่วม" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableGroupsToJoin().map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    <div>
                      <div className="font-medium">{group.name}</div>
                      {group.description && (
                        <div className="text-xs text-muted-foreground">
                          {group.description}
                        </div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={joinGroup}
              disabled={joining || !selectedGroupId}
              size="sm"
            >
              {joining ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Current groups */}
        <div className="space-y-2">
          <Label>กลุ่มที่เข้าร่วม</Label>
          {userGroups.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              คุณยังไม่ได้เข้าร่วมกลุ่มใดๆ
            </p>
          ) : (
            <div className="space-y-2">
              {userGroups.map((membership) => (
                <div
                  key={membership.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{membership.user_groups.name}</div>
                    {membership.user_groups.description && (
                      <div className="text-xs text-muted-foreground">
                        {membership.user_groups.description}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => leaveGroup(membership.id, membership.user_groups.name)}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupSection;