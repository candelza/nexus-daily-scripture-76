import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const { user, signInWithGoogle, signInWithEmail } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<{
    id: string;
    email: string;
    role: 'admin' | 'moderator';
    expires_at: string;
    used_at: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyInvite = async () => {
      if (!token) {
        setError('No invite token provided');
        setLoading(false);
        return;
      }

      try {
        const { data, error: inviteError } = await supabase.rpc('get_invite_by_token', {
        p_token: token,
        p_current_time: new Date().toISOString()
      });

        if (inviteError || !data) {
          throw new Error('Invalid or expired invite');
        }

        setInvite(data);
        setEmail(data.email);
      } catch (err) {
        console.error('Error verifying invite:', err);
        setError('Invalid or expired invite link');
      } finally {
        setLoading(false);
      }
    };

    verifyInvite();
  }, [token]);

  const handleAcceptInvite = async () => {
    if (!invite) return;

    try {
      setIsCompleting(true);
      
      // Mark invite as used
      const { error: updateError } = await supabase
        .from('admin_invites')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invite.id);

      if (updateError) throw updateError;

      // Add user to admin_roles
      const { error: roleError } = await supabase
        .from('admin_roles')
        .insert([{ user_id: user!.id, role: invite.role }]);

      if (roleError) throw roleError;

      toast({
        title: 'Success!',
        description: `You've been added as an ${invite.role}`,
      });

      // Redirect to admin dashboard
      navigate('/admin');
    } catch (err) {
      console.error('Error accepting invite:', err);
      setError('Failed to accept invite. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const assignAdminRole = async () => {
    try {
      // Mark invite as used
      const { error: updateError } = await supabase
        .from('admin_invites')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invite!.id);

      if (updateError) throw updateError;

      // Add user to admin_roles
      const { error: roleError } = await supabase
        .from('admin_roles')
        .insert([{ user_id: user!.id, role: invite!.role }]);

      if (roleError) throw roleError;

      toast({
        title: 'Success!',
        description: `You've been added as an ${invite!.role}`,
      });

      // Redirect to admin dashboard
      navigate('/admin');
    } catch (err) {
      console.error('Error assigning admin role:', err);
      setError('Failed to assign admin role. Please try again.');
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // First check if email matches the invite
      if (email !== invite?.email) {
        setError('Please use the email address that was invited');
        return;
      }
      
      const { error } = await signInWithEmail(email, password);
      if (error) throw error;
      
      await assignAdminRole();
    } catch (error) {
      console.error('Error signing in with email:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await signInWithGoogle();
      if (error) throw error;
      
      // After successful Google sign-in, check if user email matches invite
      if (user?.email !== invite?.email) {
        setError('Please sign in with the email address that was invited');
        await supabase.auth.signOut();
        return;
      }
      
      await assignAdminRole();
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-md">
        <div className="text-center space-y-4">
          <XCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Invite Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Return Home
          </Button>
        </div>
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
            onClick={handleAcceptInvite}
            disabled={isCompleting}
            className="w-full"
          >
            {isCompleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Accept ${invite.role === 'admin' ? 'Admin' : 'Moderator'} Invitation`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
