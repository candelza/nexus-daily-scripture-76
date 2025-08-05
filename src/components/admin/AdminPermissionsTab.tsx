import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Settings, Shield, Users, Edit, Save } from 'lucide-react';
import { getAdminUsers, updateAdminRole, AdminUser } from '@/services/adminService';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface RolePermissions {
  role: 'admin' | 'moderator';
  permissions: string[];
}

const availablePermissions: Permission[] = [
  // User Management
  { id: 'view_users', name: 'ดูผู้ใช้งาน', description: 'สามารถดูรายชื่อผู้ใช้งานทั้งหมด', category: 'User Management' },
  { id: 'edit_users', name: 'แก้ไขผู้ใช้งาน', description: 'สามารถแก้ไขข้อมูลผู้ใช้งาน', category: 'User Management' },
  { id: 'delete_users', name: 'ลบผู้ใช้งาน', description: 'สามารถลบผู้ใช้งาน', category: 'User Management' },
  
  // Admin Management
  { id: 'manage_admins', name: 'จัดการ Admin', description: 'สามารถเพิ่ม/ลบ Admin', category: 'Admin Management' },
  { id: 'invite_admins', name: 'เชิญ Admin', description: 'สามารถส่งคำเชิญ Admin ใหม่', category: 'Admin Management' },
  { id: 'change_roles', name: 'เปลี่ยน Role', description: 'สามารถเปลี่ยน Role ของผู้ใช้งาน', category: 'Admin Management' },
  
  // Content Management
  { id: 'manage_prayers', name: 'จัดการคำอธิษฐาน', description: 'สามารถจัดการคำขอการอธิษฐาน', category: 'Content Management' },
  { id: 'manage_topics', name: 'จัดการหัวข้อ', description: 'สามารถจัดการหัวข้อการอธิษฐาน', category: 'Content Management' },
  { id: 'moderate_comments', name: 'ดูแล Comments', description: 'สามารถดูแลและลบ Comments', category: 'Content Management' },
  
  // System Settings
  { id: 'system_settings', name: 'ตั้งค่าระบบ', description: 'สามารถเข้าถึงการตั้งค่าระบบ', category: 'System Settings' },
  { id: 'view_analytics', name: 'ดูสถิติ', description: 'สามารถดูสถิติการใช้งาน', category: 'System Settings' },
];

const defaultRolePermissions: Record<string, RolePermissions> = {
  admin: {
    role: 'admin',
    permissions: availablePermissions.map(p => p.id)
  },
  moderator: {
    role: 'moderator',
    permissions: [
      'view_users',
      'manage_prayers', 
      'manage_topics',
      'moderate_comments',
      'view_analytics'
    ]
  }
};

export default function AdminPermissionsTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [rolePermissions, setRolePermissions] = useState(defaultRolePermissions);
  const [isEditingRole, setIsEditingRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await getAdminUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลผู้ใช้งานได้',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'moderator') => {
    try {
      await updateAdminRole(userId, newRole);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast({
        title: 'อัปเดตสำเร็จ',
        description: 'เปลี่ยน Role ผู้ใช้งานเรียบร้อยแล้ว',
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเปลี่ยน Role ได้',
        variant: 'destructive',
      });
    }
  };

  const toggleRolePermission = (role: string, permissionId: string) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        permissions: prev[role].permissions.includes(permissionId)
          ? prev[role].permissions.filter(p => p !== permissionId)
          : [...prev[role].permissions, permissionId]
      }
    }));
  };

  const saveRolePermissions = (role: string) => {
    // In a real app, this would save to the database
    toast({
      title: 'บันทึกสำเร็จ',
      description: `บันทึกสิทธิ์สำหรับ ${role} เรียบร้อยแล้ว`,
    });
    setIsEditingRole(null);
  };

  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      {/* Role Permissions Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            จัดการสิทธิ์ตาม Role
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(rolePermissions).map(([roleKey, roleData]) => (
            <div key={roleKey} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge variant={roleData.role === 'admin' ? 'default' : 'secondary'}>
                    {roleData.role.toUpperCase()}
                  </Badge>
                  <span className="font-medium">
                    {roleData.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ดูแล'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => 
                    isEditingRole === roleKey 
                      ? saveRolePermissions(roleKey)
                      : setIsEditingRole(roleKey)
                  }
                >
                  {isEditingRole === roleKey ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      บันทึก
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      แก้ไข
                    </>
                  )}
                </Button>
              </div>

              {Object.entries(groupedPermissions).map(([category, permissions]) => (
                <div key={category} className="mb-4">
                  <h4 className="font-medium text-sm mb-2 text-muted-foreground">
                    {category}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{permission.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {permission.description}
                          </div>
                        </div>
                        <Switch
                          checked={roleData.permissions.includes(permission.id)}
                          onCheckedChange={() => toggleRolePermission(roleKey, permission.id)}
                          disabled={isEditingRole !== roleKey}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* User Role Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            จัดการ Role ผู้ใช้งาน
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>อีเมล</TableHead>
                    <TableHead>Role ปัจจุบัน</TableHead>
                    <TableHead>เข้าร่วมเมื่อ</TableHead>
                    <TableHead className="text-right">การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        ไม่พบผู้ใช้งาน Admin
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ดูแล'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString('th-TH')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4 mr-2" />
                                จัดการ
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>จัดการ Role - {user.email}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>เลือก Role</Label>
                                  <div className="flex gap-4 mt-2">
                                    <Button
                                      variant={user.role === 'admin' ? 'default' : 'outline'}
                                      onClick={() => handleRoleChange(user.id, 'admin')}
                                    >
                                      ผู้ดูแลระบบ (Admin)
                                    </Button>
                                    <Button
                                      variant={user.role === 'moderator' ? 'default' : 'outline'}
                                      onClick={() => handleRoleChange(user.id, 'moderator')}
                                    >
                                      ผู้ดูแล (Moderator)
                                    </Button>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label>สิทธิ์ที่จะได้รับ</Label>
                                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                                    {availablePermissions
                                      .filter(p => rolePermissions[user.role].permissions.includes(p.id))
                                      .map(permission => (
                                        <div key={permission.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                                          <Shield className="h-4 w-4 text-green-600" />
                                          <div>
                                            <div className="font-medium text-sm">{permission.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                              {permission.description}
                                            </div>
                                          </div>
                                        </div>
                                      ))
                                    }
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}