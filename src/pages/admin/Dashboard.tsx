import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { checkAdminAccess, checkIsAdmin, getAdminUsers, createAdminInvite, AdminUser } from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Users, BookOpen, UserPlus, Shield } from 'lucide-react';
import AdminUsersTab from '@/components/admin/AdminUsersTab';
import PrayerTopicsTab from '@/components/admin/PrayerTopicsTab';
import AdminPermissionsTab from '@/components/admin/AdminPermissionsTab';

export default function AdminDashboard() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('prayer-topics');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        const [access, admin] = await Promise.all([
          checkAdminAccess(),
          checkIsAdmin()
        ]);
        
        setHasAccess(access);
        setIsAdmin(admin);
        
        if (!access) {
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to access the admin dashboard.',
            variant: 'destructive'
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Error verifying admin access:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while verifying your access.',
          variant: 'destructive'
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAccess();
  }, [navigate, toast]);

  if (isLoading || hasAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>
      
      <Tabs 
        defaultValue="prayer-topics" 
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-2xl mb-6">
          <TabsTrigger value="prayer-topics" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Prayer Topics</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin-users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Admin Users</span>
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Permissions</span>
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="prayer-topics">
          <PrayerTopicsTab />
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="admin-users">
            <AdminUsersTab />
          </TabsContent>
        )}
        
        {isAdmin && (
          <TabsContent value="permissions">
            <AdminPermissionsTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
