import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ScriptureCard } from '@/components/ScriptureCard';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getRandomVerseForCard, getMultipleRandomVersesForCards } from '@/data/bibleReadings';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { Shuffle, RefreshCw, Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RandomVerse {
  id: string;
  book: string;
  chapter: number;
  verses: string;
  text: string;
  theme?: string;
}

const RandomVerses = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [randomReadings, setRandomReadings] = useState<RandomVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { markAsRead, isRead } = useReadingProgress();
  const navigate = useNavigate();

  useEffect(() => {
    generateRandomVerses();
  }, []);

  const generateRandomVerses = async () => {
    setIsGenerating(true);
    try {
      // Generate 3 random verses
      const verses = getMultipleRandomVersesForCards(3);
      setRandomReadings(verses);
    } catch (error) {
      console.error('Error generating random verses:', error);
    } finally {
      setIsGenerating(false);
      setLoading(false);
    }
  };

  const generateSingleRandomVerse = async () => {
    setIsGenerating(true);
    try {
      const verse = getRandomVerseForCard();
      setRandomReadings([verse]);
    } catch (error) {
      console.error('Error generating single random verse:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentDate={currentDate} onDateChange={setCurrentDate} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">กำลังโหลดข้อพระคัมภีร์แบบสุ่ม...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header currentDate={currentDate} onDateChange={setCurrentDate} />
      
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Back Button */}
        <div className="flex justify-start">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับสู่หน้าหลัก
          </Button>
        </div>

        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">ข้อพระคัมภีร์แบบสุ่ม</h1>
          <p className="text-muted-foreground text-lg">
            ค้นพบข้อพระคัมภีร์ที่ให้กำลังใจและคำแนะนำสำหรับชีวิตประจำวัน
          </p>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="w-5 h-5" />
              สุ่มข้อพระคัมภีร์
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={generateRandomVerses}
                disabled={isGenerating}
                className="flex-1 gap-2"
                size="lg"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Shuffle className="w-4 h-4" />
                )}
                สุ่มข้อพระคัมภีร์ 3 ข้อ
              </Button>
              <Button 
                onClick={generateSingleRandomVerse}
                disabled={isGenerating}
                variant="outline"
                className="flex-1 gap-2"
                size="lg"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Heart className="w-4 h-4" />
                )}
                สุ่มข้อพระคัมภีร์ 1 ข้อ
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              กดปุ่มเพื่อสุ่มข้อพระคัมภีร์ใหม่ที่ให้กำลังใจและคำแนะนำสำหรับชีวิตประจำวัน
            </p>
          </CardContent>
        </Card>

        {/* Random Verses Display */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">
            ข้อพระคัมภีร์ที่สุ่มได้
          </h2>
          
          {randomReadings.length > 0 ? (
            <div className="space-y-6">
              {randomReadings.map((reading) => (
                <ScriptureCard
                  key={reading.id}
                  reading={reading}
                  isRead={isRead(reading.id)}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Shuffle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  กดปุ่มด้านบนเพื่อเริ่มสุ่มข้อพระคัมภีร์
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Inspiration Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardHeader>
            <CardTitle className="text-center">💡 คำแนะนำ</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              ข้อพระคัมภีร์เหล่านี้ถูกคัดเลือกมาเพื่อให้กำลังใจและคำแนะนำสำหรับชีวิตประจำวัน
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <h4 className="font-semibold mb-2">🕊️ สันติสุข</h4>
                <p className="text-muted-foreground">ค้นหาสันติสุขในพระเจ้า</p>
              </div>
              <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <h4 className="font-semibold mb-2">💪 กำลังใจ</h4>
                <p className="text-muted-foreground">รับกำลังใหม่จากพระเจ้า</p>
              </div>
              <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <h4 className="font-semibold mb-2">🌟 ความหวัง</h4>
                <p className="text-muted-foreground">พบความหวังในพระวจนะ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RandomVerses; 