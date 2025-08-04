import { Calendar, Church, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export const Header = ({ currentDate, onDateChange }: HeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const goToPreviousDay = () => {
    const previousDay = new Date(currentDate);
    previousDay.setDate(currentDate.getDate() - 1);
    onDateChange(previousDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    onDateChange(nextDay);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent rounded-lg">
              <Church className="w-6 h-6 text-accent-foreground" />
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-foreground">พระคัมภีร์ประจำปี</h1>
              <p className="text-sm text-muted-foreground">Nexus Church Bangkok</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={goToToday} className="gap-2">
              <Calendar className="w-4 h-4" />
              วันนี้
            </Button>
            {user ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Dashboard
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/auth')}
                className="flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                เข้าสู่ระบบ
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={goToPreviousDay}>
            ← วันก่อน
          </Button>
          <h2 className="text-lg font-semibold text-foreground">
            {formatDate(currentDate)}
          </h2>
          <Button variant="ghost" onClick={goToNextDay}>
            วันถัดไป →
          </Button>
        </div>
      </div>
    </header>
  );
};