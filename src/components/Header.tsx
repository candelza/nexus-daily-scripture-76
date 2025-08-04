import { Calendar as CalendarIcon, Church, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  children?: React.ReactNode;
}

export const Header = ({ currentDate, onDateChange, children }: HeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();


  const goToToday = () => {
    onDateChange(new Date());
  };

  const { lang } = useLanguage();

  const formatDate = (date: Date) => {
    const locale = lang === 'en' ? 'en-US' : 'th-TH';
    return date.toLocaleDateString(locale, {
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
            <LanguageToggle />
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
        
        <div className="flex items-center justify-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !currentDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDate(currentDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => onDateChange(date || new Date())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
           {children}
        </div>
      </div>
    </header>
  );
};