import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserPlus, X, Copy, Mail, Trash2 } from 'lucide-react';
import { 
  getAdminUsers, 
  createAdminInvite,
  AdminUser,
  AdminInvite
} from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function AdminUsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'moderator' as 'admin' | 'moderator'
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersData] = await Promise.all([
        getAdminUsers(),
        // In a real app, you would also fetch invites here
        // getAdminInvites()
      ]);
      
      setUsers(usersData);
      // setInvites(invitesData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsInviting(true);
      const { data, error } = await createAdminInvite(inviteData.email, inviteData.role);
      
      if (error) throw error;
      
      if (data) {
        setInvites(prev => [data, ...prev]);
        setInviteData({ email: '', role: 'moderator' });
        
        toast({
          title: 'Invitation Sent',
          description: `An invitation has been sent to ${inviteData.email}`,
        });
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  };

  const copyInviteLink = (token: string) => {
    const inviteLink = `${window.location.origin}/admin/accept-invite?token=${token}`;
    navigator.clipboard.writeText(inviteLink);
    
    toast({
      title: 'Copied!',
      description: 'Invite link copied to clipboard',
    });
  };

  const resendInvite = async (inviteId: string) => {
    // In a real app, implement resend invite logic
    toast({
      title: 'Not Implemented',
      description: 'Resend invite functionality is not implemented yet',
    });
  };

  const revokeInvite = async (inviteId: string) => {
    // In a real app, implement revoke invite logic
    toast({
      title: 'Not Implemented',
      description: 'Revoke invite functionality is not implemented yet',
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Invite Admin</h2>
        <form onSubmit={handleInviteSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Input
              type="email"
              placeholder="Email address"
              value={inviteData.email}
              onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
              required
            />
          </div>
          
          <div className="w-full sm:w-48">
            <Select
              value={inviteData.role}
              onValueChange={(value: 'admin' | 'moderator') => 
                setInviteData({ ...inviteData, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" disabled={isInviting} className="w-full sm:w-auto">
            {isInviting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Send Invite
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Admins</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No admin users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), 'PPP', { locale: th })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {invites.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pending Invitations</h2>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">{invite.email}</TableCell>
                    <TableCell>
                      <Badge variant={invite.role === 'admin' ? 'default' : 'secondary'}>
                        {invite.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(invite.expires_at), 'PPP', { locale: th })}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyInviteLink(invite.token)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => resendInvite(invite.id)}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => revokeInvite(invite.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
