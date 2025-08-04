import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Calendar } from "lucide-react";

interface ProgressTrackerProps {
  currentStreak: number;
  totalRead: number;
  monthlyGoal: number;
  yearProgress: number;
}

export const ProgressTracker = ({ 
  currentStreak, 
  totalRead, 
  monthlyGoal, 
  yearProgress 
}: ProgressTrackerProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6 text-foreground flex items-center gap-2">
        <Target className="w-5 h-5 text-accent" />
        ความคืบหนา้การอ่าน
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="p-4 bg-progress/10 rounded-lg mb-3">
            <Trophy className="w-8 h-8 text-progress mx-auto" />
          </div>
          <div className="text-2xl font-bold text-progress">{currentStreak}</div>
          <div className="text-sm text-muted-foreground">วันติดต่อกัน</div>
        </div>
        
        <div className="text-center">
          <div className="p-4 bg-accent/10 rounded-lg mb-3">
            <Calendar className="w-8 h-8 text-accent mx-auto" />
          </div>
          <div className="text-2xl font-bold text-accent">{totalRead}/{monthlyGoal}</div>
          <div className="text-sm text-muted-foreground">เป้าหมายเดือนนี้</div>
        </div>
        
        <div className="text-center">
          <div className="mb-3">
            <div className="text-2xl font-bold text-foreground">{yearProgress}%</div>
            <div className="text-sm text-muted-foreground mb-2">ความคืบหน้าปีนี้</div>
            <Progress value={yearProgress} className="w-full" />
          </div>
        </div>
      </div>
    </Card>
  );
};