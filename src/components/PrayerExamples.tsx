import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Users, Loader2, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PrayerWithProfile {
  id: string;
  title: string;
  content: string;
  created_at: string;
  is_answered: boolean;
  user_id: string;
  display_name?: string | null;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    email: string | null;
  } | null;
  like_count?: number;
  comment_count?: number;
  user_has_liked?: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    email: string | null;
  } | null;
}

const PrayerExamples = () => {
  const [prayers, setPrayers] = useState<PrayerWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPrayers();
  }, []);

  const fetchPrayers = async () => {
    try {
      setLoading(true);
      
      // First fetch prayers
      const { data: prayersData, error: prayersError } = await supabase
        .from('prayer_requests')
        .select('id, title, content, created_at, is_answered, user_id, display_name')
        .order('created_at', { ascending: false })
        .limit(6);

      if (prayersError) {
        console.error('Error fetching prayers:', prayersError);
        return;
      }

      if (!prayersData || prayersData.length === 0) {
        setPrayers([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(prayersData.map(p => p.user_id))];
      
      // Fetch profiles for those users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, email')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Fetch like counts and user likes for each prayer
      const prayersWithData = await Promise.all(
        prayersData.map(async (prayer) => {
          // Get like count
          const { count: likeCount } = await supabase
            .from('prayer_likes')
            .select('*', { count: 'exact', head: true })
            .eq('prayer_id', prayer.id);

          // Get comment count
          const { count: commentCount } = await supabase
            .from('prayer_comments')
            .select('*', { count: 'exact', head: true })
            .eq('prayer_id', prayer.id);

          // Check if current user has liked this prayer
          let userHasLiked = false;
          if (user) {
            const { data: userLike } = await supabase
              .from('prayer_likes')
              .select('id')
              .eq('prayer_id', prayer.id)
              .eq('user_id', user.id)
              .single();
            userHasLiked = !!userLike;
          }

          return {
            ...prayer,
            profiles: profilesData?.find(profile => profile.user_id === prayer.user_id) || null,
            like_count: likeCount || 0,
            comment_count: commentCount || 0,
            user_has_liked: userHasLiked
          };
        })
      );

      setPrayers(prayersWithData);
    } catch (error) {
      console.error('Error fetching prayers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (prayerId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "กรุณาเข้าสู่ระบบ",
        description: "เข้าสู่ระบบเพื่อกดไลค์"
      });
      return;
    }

    try {
      const prayer = prayers.find(p => p.id === prayerId);
      if (!prayer) return;

      if (prayer.user_has_liked) {
        // Unlike
        const { error } = await supabase
          .from('prayer_likes')
          .delete()
          .eq('prayer_id', prayerId)
          .eq('user_id', user.id);

        if (error) throw error;

        // Update local state
        setPrayers(prev => prev.map(p => 
          p.id === prayerId 
            ? { ...p, like_count: (p.like_count || 0) - 1, user_has_liked: false }
            : p
        ));
      } else {
        // Like
        const { error } = await supabase
          .from('prayer_likes')
          .insert({ prayer_id: prayerId, user_id: user.id });

        if (error) throw error;

        // Update local state
        setPrayers(prev => prev.map(p => 
          p.id === prayerId 
            ? { ...p, like_count: (p.like_count || 0) + 1, user_has_liked: true }
            : p
        ));
      }
    } catch (error: any) {
      console.error('Error handling like:', error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถกดไลค์ได้"
      });
    }
  };

  const fetchComments = async (prayerId: string) => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('prayer_comments')
        .select('id, content, created_at, user_id')
        .eq('prayer_id', prayerId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      if (!commentsData || commentsData.length === 0) {
        setComments(prev => ({ ...prev, [prayerId]: [] }));
        return;
      }

      // Get user profiles for comments
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, email')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching comment profiles:', profilesError);
      }

      const commentsWithProfiles = commentsData.map(comment => ({
        ...comment,
        profiles: profilesData?.find(profile => profile.user_id === comment.user_id) || null
      }));

      setComments(prev => ({ ...prev, [prayerId]: commentsWithProfiles }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const toggleComments = (prayerId: string) => {
    if (expandedComments === prayerId) {
      setExpandedComments(null);
    } else {
      setExpandedComments(prayerId);
      if (!comments[prayerId]) {
        fetchComments(prayerId);
      }
    }
  };

  const handleSubmitComment = async (prayerId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "กรุณาเข้าสู่ระบบ",
        description: "เข้าสู่ระบบเพื่อแสดงความคิดเห็น"
      });
      return;
    }

    const commentText = newComment[prayerId]?.trim();
    if (!commentText) return;

    try {
      setSubmittingComment(prayerId);

      const { data, error } = await supabase
        .from('prayer_comments')
        .insert({
          prayer_id: prayerId,
          user_id: user.id,
          content: commentText
        })
        .select()
        .single();

      if (error) throw error;

      // Get user profile for the new comment
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, email')
        .eq('user_id', user.id)
        .single();

      const newCommentWithProfile = {
        ...data,
        profiles: profileData
      };

      // Update comments state
      setComments(prev => ({
        ...prev,
        [prayerId]: [...(prev[prayerId] || []), newCommentWithProfile]
      }));

      // Update prayer comment count
      setPrayers(prev => prev.map(p => 
        p.id === prayerId 
          ? { ...p, comment_count: (p.comment_count || 0) + 1 }
          : p
      ));

      // Clear comment input
      setNewComment(prev => ({ ...prev, [prayerId]: '' }));

      toast({
        title: "สำเร็จ",
        description: "แสดงความคิดเห็นเรียบร้อยแล้ว"
      });
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถแสดงความคิดเห็นได้"
      });
    } finally {
      setSubmittingComment(null);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'เมื่อสักครู่';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชั่วโมงที่แล้ว`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} วันที่แล้ว`;
    return date.toLocaleDateString('th-TH');
  };

  const getRandomGroup = () => {
    const groups = ['เยาวชน', 'ผู้ใหญ่', 'ผู้สูงอายุ', 'ครอบครัว'];
    return groups[Math.floor(Math.random() * groups.length)];
  };

  const getGroupColor = (groupName: string) => {
    switch (groupName) {
      case 'เยาวชน':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'ผู้ใหญ่':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'ผู้สูงอายุ':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'ครอบครัว':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">คำอธิษฐานจากชุมชน</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            แบ่งปันคำอธิษฐานและให้กำลังใจซึ่งกันและกัน เราอธิษฐานเพื่อกันและกัน
          </p>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">คำอธิษฐานจากชุมชน</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          แบ่งปันคำอธิษฐานและให้กำลังใจซึ่งกันและกัน เราอธิษฐานเพื่อกันและกัน
        </p>
      </div>

      {prayers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">ยังไม่มีคำอธิษฐานในชุมชน</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prayers.map((prayer) => {
            const groupName = getRandomGroup();
            // Use display_name from prayer if available, otherwise use profile name
            const userName = prayer.display_name || 
                            prayer.profiles?.display_name || 
                            prayer.profiles?.email?.split('@')[0] || 
                            'ผู้ใช้งาน';
            
            return (
              <Card key={prayer.id} className="hover:shadow-lg transition-shadow duration-200 bg-card border border-border">
                <CardContent className="p-6">
                  {/* Header with user info and group */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={prayer.profiles?.avatar_url || ''} alt={userName} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-foreground">{userName}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTimeAgo(prayer.created_at)}
                        </div>
                      </div>
                    </div>
                    <Badge className={`${getGroupColor(groupName)} border-0`}>
                      <Users className="h-3 w-3 mr-1" />
                      {groupName}
                    </Badge>
                  </div>

                  {/* Prayer content */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-lg text-foreground leading-tight">
                      {prayer.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {prayer.content}
                    </p>
                    {prayer.is_answered && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        ได้รับการตอบแล้ว
                      </Badge>
                    )}
                  </div>

                  {/* Interaction buttons */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(prayer.id)}
                      className={`flex items-center gap-1 ${
                        prayer.user_has_liked 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-muted-foreground hover:text-red-500'
                      } transition-colors`}
                    >
                      <Heart 
                        className={`h-4 w-4 ${prayer.user_has_liked ? 'fill-current' : ''}`} 
                      />
                      <span className="text-sm">{prayer.like_count || 0}</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleComments(prayer.id)}
                      className="flex items-center gap-1 text-muted-foreground hover:text-blue-500 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{prayer.comment_count || 0} ตอบกลับ</span>
                    </Button>
                  </div>

                  {/* Comments section */}
                  {expandedComments === prayer.id && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                      {/* Existing comments */}
                      {comments[prayer.id]?.map((comment) => {
                        const commentUserName = comment.profiles?.display_name || 
                                               comment.profiles?.email?.split('@')[0] || 
                                               'ผู้ใช้งาน';
                        return (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={comment.profiles?.avatar_url || ''} alt={commentUserName} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {commentUserName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-muted rounded-lg p-3">
                                <div className="font-semibold text-sm">{commentUserName}</div>
                                <p className="text-sm mt-1">{comment.content}</p>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatTimeAgo(comment.created_at)}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Add comment form */}
                      {user && (
                        <div className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.user_metadata?.avatar_url || ''} alt="You" />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {(user.user_metadata?.name || user.email)?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <Textarea
                              placeholder="แสดงความคิดเห็น..."
                              value={newComment[prayer.id] || ''}
                              onChange={(e) => setNewComment(prev => ({ 
                                ...prev, 
                                [prayer.id]: e.target.value 
                              }))}
                              className="min-h-[80px]"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSubmitComment(prayer.id)}
                              disabled={!newComment[prayer.id]?.trim() || submittingComment === prayer.id}
                              className="flex items-center gap-2"
                            >
                              {submittingComment === prayer.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                              ส่ง
                            </Button>
                          </div>
                        </div>
                      )}

                      {!user && (
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            เข้าสู่ระบบเพื่อแสดงความคิดเห็น
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Call to action */}
      <div className="text-center">
        <p className="text-muted-foreground mb-4">
          ต้องการแบ่งปันคำอธิษฐานของคุณเหรอ?
        </p>
        <div className="text-sm text-muted-foreground">
          เข้าสู่ระบบเพื่อแบ่งปันคำอธิษฐานและให้กำลังใจเพื่อนสมาชิก
        </div>
      </div>
    </div>
  );
};

export default PrayerExamples;
