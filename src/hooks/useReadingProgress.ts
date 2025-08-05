import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ReadingProgress {
  currentStreak: number;
  totalReadThisMonth: number;
  yearProgress: number;
}

export const useReadingProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ReadingProgress>({
    currentStreak: 0,
    totalReadThisMonth: 0,
    yearProgress: 0
  });
  const [readReadings, setReadReadings] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load progress from Supabase when user changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (user) {
          await loadProgressFromSupabase();
        } else {
          // Reset state when user logs out
          setProgress({
            currentStreak: 0,
            totalReadThisMonth: 0,
            yearProgress: 0
          });
          setReadReadings(new Set());
        }
      } catch (error) {
        console.error('Error loading reading progress:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  const loadProgressFromSupabase = async () => {
    if (!user) return;

    try {
      // Fetch all reading progress for current user
      const { data: progressData, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading progress:', error);
        return;
      }

      const completedReadings = progressData?.filter(p => p.is_completed) || [];
      const readingIds = new Set(completedReadings.map(p => p.reading_id));
      setReadReadings(readingIds);

      // Calculate metrics
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // Count readings this month
      const thisMonthReadings = completedReadings.filter(r => {
        const completedDate = new Date(r.completed_at || r.created_at);
        return completedDate.getMonth() === currentMonth && 
               completedDate.getFullYear() === currentYear;
      });

      // Calculate year progress
      const dayOfYear = Math.floor((currentDate.getTime() - new Date(currentYear, 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const yearProgressPercent = Math.min(100, Math.round((completedReadings.length / dayOfYear) * 100));

      setProgress({
        currentStreak: completedReadings.length, 
        totalReadThisMonth: thisMonthReadings.length,
        yearProgress: yearProgressPercent
      });

    } catch (error) {
      console.error('Error loading progress from Supabase:', error);
    }
  };

  const markAsRead = async (readingId: string) => {
    if (!user) return;

    try {
      const isCurrentlyRead = readReadings.has(readingId);

      if (isCurrentlyRead) {
        // Remove from completed
        const { error } = await supabase
          .from('reading_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('reading_id', readingId);

        if (error) throw error;

        // Update local state
        const newReadReadings = new Set(readReadings);
        newReadReadings.delete(readingId);
        setReadReadings(newReadReadings);
      } else {
        // Check if record exists but not completed
        const { data: existingRecord } = await supabase
          .from('reading_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('reading_id', readingId)
          .single();

        if (existingRecord) {
          // Update existing record
          const { error } = await supabase
            .from('reading_progress')
            .update({
              is_completed: true,
              completed_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('reading_id', readingId);

          if (error) throw error;
        } else {
          // Create new record
          const { error } = await supabase
            .from('reading_progress')
            .insert({
              user_id: user.id,
              reading_id: readingId,
              is_completed: true,
              completed_at: new Date().toISOString()
            });

          if (error) throw error;
        }

        // Update local state
        const newReadReadings = new Set(readReadings);
        newReadReadings.add(readingId);
        setReadReadings(newReadReadings);
      }

      // Reload progress to recalculate metrics
      await loadProgressFromSupabase();

    } catch (error) {
      console.error('Error marking reading:', error);
    }
  };

  const isRead = (readingId: string) => {
    if (isLoading) return false; 
    return readReadings.has(readingId);
  };

  return {
    currentStreak: progress.currentStreak,
    totalReadThisMonth: progress.totalReadThisMonth,
    yearProgress: progress.yearProgress,
    markAsRead,
    isRead,
    isLoading
  };
};