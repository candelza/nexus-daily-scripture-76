import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, UserPlus, Trash2, MoreVertical } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const ManageCareGroup = () => {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    fetchGroupDetails();
    fetchMembers();
  }, [groupId, user]);

  const fetchGroupDetails = async () => {
    const { data, error } = await supabase
      .from('care_groups')
      .select('*')
      .eq('id', groupId)
      .single();
    if (error) console.error('Error fetching group details:', error);
    else setGroup(data);
  };

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_care_groups')
      .select(`
        role,
        profiles:user_id (*)
      `)
      .eq('care_group_id', groupId);

    if (error) {
      console.error('Error fetching members:', error);
      toast({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลสมาชิกได้', variant: 'destructive' });
    } else {
      setMembers(data.map(item => ({ ...item.profiles, role: item.role })));
    }
    setLoading(false);
  };

  const handleInviteMember = async () => {
    if (!inviteEmail) return;
    try {
      const { data: invitedUser, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail)
        .single();

      if (fetchError || !invitedUser) {
        toast({ title: 'Error', description: 'User not found.', variant: 'destructive' });
        return;
      }

      const { error: insertError } = await supabase
        .from('user_care_groups')
        .insert({ user_id: invitedUser.id, care_group_id: groupId, role: 'member' });

      if (insertError) throw insertError;

      toast({ title: 'Success', description: 'Member invited successfully.' });
      fetchMembers();
      setInviteDialogOpen(false);
      setInviteEmail('');
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({ title: 'Error', description: 'Failed to invite member.', variant: 'destructive' });
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const { error } = await supabase
        .from('user_care_groups')
        .delete()
        .match({ user_id: memberId, care_group_id: groupId });

      if (error) throw error;

      toast({ title: 'Success', description: 'Member removed successfully.' });
      fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({ title: 'Error', description: 'Failed to remove member.', variant: 'destructive' });
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      const { error } = await supabase
        .from('user_care_groups')
        .update({ role: newRole })
        .match({ user_id: memberId, care_group_id: groupId });

      if (error) throw error;

      toast({ title: 'Success', description: 'Member role updated.' });
      fetchMembers();
    } catch (error) {
      console.error('Error changing role:', error);
      toast({ title: 'Error', description: 'Failed to change role.', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">กำลังโหลด...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        กลับไปที่แดชบอร์ด
      </Button>

      {group && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">จัดการกลุ่ม: {group.name}</CardTitle>
            <CardDescription>{group.description}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>สมาชิกกลุ่ม</CardTitle>
          <Dialog open={isInviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><UserPlus className="w-4 h-4 mr-2" /> เชิญสมาชิก</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>เชิญสมาชิกใหม่</DialogTitle>
                <DialogDescription>กรอกอีเมลของสมาชิกที่ต้องการเชิญ</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">อีเมล</Label>
                  <Input id="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleInviteMember}>ส่งคำเชิญ</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map(member => (
              <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback>{member.display_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{member.display_name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                  </div>
                </div>
                {member.id !== user.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRoleChange(member.id, member.role === 'leader' ? 'member' : 'leader')}>
                        {member.role === 'leader' ? 'Demote to Member' : 'Promote to Leader'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRemoveMember(member.id)} className="text-destructive">
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageCareGroup;
