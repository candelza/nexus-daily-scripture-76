import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ScriptureReading {
  id: string;
  book: string;
  chapter: number | string; // Updated to accept both number and string
  verses: string;
  text: string;
  theme?: string;
}

interface ScriptureCardProps {
  reading: ScriptureReading;
  isRead: boolean;
  onMarkAsRead: (id: string) => void;
  isLoading?: boolean;
}

export const ScriptureCard = ({ 
  reading, 
  isRead, 
  onMarkAsRead, 
  isLoading = false 
}: ScriptureCardProps) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 w-full">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-16 w-full" />
      </Card>
    );
  }
  return (
    <Card className="p-6 transition-all duration-200 hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isRead ? 'bg-green-100' : 'bg-blue-100'}`}>
            <BookOpen className={`w-5 h-5 ${isRead ? 'text-progress' : 'text-accent-foreground'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">
              {reading.book} {reading.chapter}:{reading.verses}
            </h3>
            {reading.theme && (
              <Badge variant="secondary" className="mt-1">
                {reading.theme}
              </Badge>
            )}
          </div>
        </div>
        <Button
          variant={isRead ? "default" : "outline"}
          size="sm"
          onClick={() => onMarkAsRead(reading.id)}
          className="gap-2"
        >
          <Heart className={`w-4 h-4 ${isRead ? 'fill-current' : ''}`} />
          {isRead ? 'อ่านแล้ว' : 'ทำเครื่องหมาย'}
        </Button>
      </div>
      
      <div className="prose prose-lg max-w-none">
        <blockquote className="border-l-4 border-scripture pl-6 py-4 bg-scripture/5 rounded-r-lg">
          <p className="text-foreground leading-relaxed text-lg italic">
            "{reading.text}"
          </p>
        </blockquote>
      </div>
    </Card>
  );
};