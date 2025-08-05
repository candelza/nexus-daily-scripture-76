import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { AdminInvite, UserRole } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface InviteData extends Omit<AdminInvite, 'token' | 'invited_by'> {}

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyInvite = async (token: string) => {
      try {
        const { data, error } = await supabase
          .from('admin_invites')
          .select('*')
          .eq('token', token)
          .is('used_at', null)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (error) throw error;
        if (!data) throw new Error('Invalid or expired invitation');

        setInvite(data as AdminInvite);
        setEmail(data.email);
        setError(null);
      } catch (err) {
        console.error('Error verifying invite:', err);
        setError('ลิงก์เชิญไม่ถูกต้องหรือหมดอายุแล้ว');
      } finally {
        setLoading(false);
      }
    };

    if (!token) {
      setError('ไม่พบลิงก์เชิญ');
      setLoading(false);
    } else {
      verifyInvite(token);
    }
  }, [token]);

  // Handle user state changes
  useEffect(() => {
    if (user && invite) {
      if (user.email === invite.email) {
        assignAdminRole(user.id);
      } else {
        setError(`กรุณาเข้าสู่ระบบด้วยอีเมล: ${invite.email}`);
        supabase.auth.signOut();
      }
    }
  }, [user, invite]);

  const assignAdminRole = async (userId: string) => {
    if (!invite) return;
    
    try {
      const { error: roleError } = await supabase
        .from('admin_roles')
        .insert([
          { 
            user_id: userId, 
            role: invite.role 
          }
        ]);

      if (roleError) throw roleError;

      // Mark invite as used
      const { error: inviteError } = await supabase
        .from('admin_invites')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invite.id);

      if (inviteError) throw inviteError;

      toast({
        title: 'สำเร็จ',
        description: `คุณได้รับการแต่งตั้งเป็น${invite.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ดูแล'}`,
      });

      // Redirect to admin dashboard
      window.location.href = '/admin';
    } catch (err) {
      console.error('Error assigning admin role:', err);
      setError('เกิดข้อผิดพลาดในการแต่งตั้งบทบาท');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    if (email !== invite?.email) {
      setError(`กรุณาใช้อีเมล: ${invite?.email}`);
      return;
    }
    
    try {
      setIsLoggingIn(true);
      const { error } = await signUpWithEmail(email, password);
      if (error) {
        if (error.message.includes('already registered')) {
          setError('อีเมลนี้ได้ลงทะเบียนแล้ว กรุณาลองเข้าสู่ระบบ');
          setIsNewUser(false);
        } else {
          throw error;
        }
      } else {
        // Update user metadata after successful signup
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.auth.updateUser({
            data: { full_name: fullName }
          });
        }
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setError('ไม่สามารถสมัครสมาชิกได้: ' + (error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    if (email !== invite?.email) {
      setError(`กรุณาใช้อีเมล: ${invite?.email}`);
      return;
    }
    
    try {
      setIsLoggingIn(true);
      const { error } = await signInWithEmail(email, password);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setIsNewUser(true);
          setError('ไม่พบผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        } else if (error.message.includes('Email not confirmed')) {
          setError('กรุณายืนยันอีเมลของคุณก่อนเข้าสู่ระบบ');
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ' + (error instanceof Error ? error.message : 'โปรดลองอีกครั้ง'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoggingIn(true);
      await signInWithGoogle();
      // If successful, the user will be redirected or the auth state will update
    } catch (error) {
      console.error('Error signing in with Google:', error);
      const errorMessage = error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ';
      
      if (errorMessage.includes('OAuth account not linked')) {
        setError('บัญชี Google นี้ยังไม่ได้เชื่อมต่อกับบัญชีผู้ใช้');
      } else {
        setError(`ไม่สามารถเข้าสู่ระบบด้วย Google ได้ในขณะนี้: ${errorMessage}`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">กำลังตรวจสอบลิงก์เชิญ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-md flex items-center justify-center min-h-screen">
        <Card className="w-full">
          <CardHeader>
            <div className="text-center space-y-2">
              <XCircle className="h-12 w-12 text-destructive mx-auto" />
              <CardTitle className="text-xl">เกิดข้อผิดพลาด</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">{error}</p>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              กลับหน้าหลัก
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-md">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Accept Admin Invitation</h1>
            <p className="text-muted-foreground">
              Sign in to accept the invitation for <span className="font-medium">{invite?.email}</span>
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <img 
                  src="https://www.google.com/favicon.ico" 
                  alt="Google" 
                  className="h-4 w-4 mr-2" 
                />
              )}
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoggingIn}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoggingIn}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In with Email'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (user.email !== invite?.email) {
    return (
      <div className="container mx-auto p-6 max-w-md">
        <div className="text-center space-y-4">
          <XCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Invitation Error</h1>
          <p className="text-muted-foreground">
            This invitation is for {invite?.email}, but you're signed in as {user.email}.
            Please sign out and sign in with the correct email.
          </p>
          <Button 
            variant="outline" 
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = `/admin/accept-invite?token=${token}`;
            }}
            className="mt-4"
          >
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-md">
      <div className="text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold">Accept Admin Invitation</h1>
        <p className="text-muted-foreground">
          You've been invited to become an <span className="font-medium">{invite.role}</span>.
          Click the button below to accept this invitation.
        </p>
        
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังดำเนินการ...
              </>
            ) : (
              'ยืนยันการเป็นผู้ดูแลระบบ'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
