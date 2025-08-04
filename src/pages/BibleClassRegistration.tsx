import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, BookOpen, Users, Calendar, MapPin, Phone, Mail } from 'lucide-react';

const BibleClassRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    experience: '',
    motivation: '',
    preferredTime: '',
    preferredDay: '',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      toast({
        variant: "destructive",
        title: "กรุณายอมรับเงื่อนไข",
        description: "กรุณายอมรับเงื่อนไขการลงทะเบียนก่อนดำเนินการต่อ"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "ลงทะเบียนสำเร็จ!",
        description: "เราจะติดต่อกลับภายใน 24 ชั่วโมง"
      });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        age: '',
        experience: '',
        motivation: '',
        preferredTime: '',
        preferredDay: '',
        agreeToTerms: false
      });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้ง"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับสู่หน้าหลัก
            </Button>
            <h1 className="text-2xl font-bold">ลงทะเบียนเรียนคลาสพระคัมภีร์</h1>
          </div>
        </div>
      </header>

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
          <h1 className="text-3xl font-bold text-foreground">ลงทะเบียนเรียนคลาสพระคัมภีร์</h1>
          <p className="text-muted-foreground text-lg">
            ค้นพบข้อพระคัมภีร์ที่ให้กำลังใจและคำแนะนำสำหรับชีวิตประจำวัน
          </p>
        </div>

        {/* Class Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                เกี่ยวกับคลาส
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                คลาสพระคัมภีร์สำหรับผู้ที่ต้องการเรียนรู้และเติบโตในความเชื่อ
                เรียนรู้พระคัมภีร์อย่างลึกซึ้ง พร้อมคำอธิบายและประยุกต์ใช้ในชีวิตประจำวัน
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                กลุ่มเป้าหมาย
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                ผู้ที่ต้องการเรียนรู้พระคัมภีร์ ไม่จำกัดอายุหรือประสบการณ์
                เหมาะสำหรับผู้เริ่มต้นและผู้ที่ต้องการเติบโตในความเชื่อ
                เปิดรับทุกคนที่สนใจ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                ตารางเรียน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                <strong>วันอาทิตย์:</strong> 10:00-11:30 น.<br />
                <strong>วันพุธ:</strong> 19:00-20:30 น.<br />
                <em>(เลือกวันใดวันหนึ่ง)</em>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardHeader>
            <CardTitle className="text-center">📚 เนื้อหาการเรียน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">หัวข้อที่เรียน:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• การอ่านและเข้าใจพระคัมภีร์</li>
                  <li>• ประวัติศาสตร์และภูมิหลังของพระคัมภีร์</li>
                  <li>• การประยุกต์ใช้พระคัมภีร์ในชีวิตประจำวัน</li>
                  <li>• การเติบโตฝ่ายจิตวิญญาณ</li>
                  <li>• การอธิษฐานและการนมัสการ</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">สิ่งที่ได้รับ:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• ความเข้าใจพระคัมภีร์ที่ลึกซึ้ง</li>
                  <li>• เครือข่ายเพื่อนที่เติบโตในความเชื่อ</li>
                  <li>• เอกสารประกอบการเรียน</li>
                  <li>• การสนับสนุนและคำปรึกษา</li>
                  <li>• โอกาสในการรับใช้ในคริสตจักร</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              ลงทะเบียนเรียนคลาสพระคัมภีร์
            </CardTitle>
            <CardDescription>
              กรอกข้อมูลเพื่อลงทะเบียนเรียนคลาสพระคัมภีร์ที่ NexusBangkok Church
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">ชื่อ *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="กรอกชื่อ"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">นามสกุล *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="กรอกนามสกุล"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="กรอกอีเมล"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="กรอกเบอร์โทรศัพท์"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">อายุ *</Label>
                  <Select value={formData.age} onValueChange={(value) => handleInputChange('age', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกช่วงอายุ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-25">18-25 ปี</SelectItem>
                      <SelectItem value="26-35">26-35 ปี</SelectItem>
                      <SelectItem value="36-45">36-45 ปี</SelectItem>
                      <SelectItem value="46-55">46-55 ปี</SelectItem>
                      <SelectItem value="55+">55+ ปี</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">ประสบการณ์การอ่านพระคัมภีร์</Label>
                  <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกประสบการณ์" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">เริ่มต้น (0-1 ปี)</SelectItem>
                      <SelectItem value="intermediate">ปานกลาง (1-5 ปี)</SelectItem>
                      <SelectItem value="advanced">ขั้นสูง (5+ ปี)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preferredDay">วันเรียนที่ต้องการ *</Label>
                  <Select value={formData.preferredDay} onValueChange={(value) => handleInputChange('preferredDay', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกวันเรียน" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">วันอาทิตย์ (10:00-11:30 น.)</SelectItem>
                      <SelectItem value="wednesday">วันพุธ (19:00-20:30 น.)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motivation">แรงจูงใจในการเรียน</Label>
                  <Input
                    id="motivation"
                    value={formData.motivation}
                    onChange={(e) => handleInputChange('motivation', e.target.value)}
                    placeholder="เช่น ต้องการเติบโตในความเชื่อ"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">ข้อมูลเพิ่มเติม</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="กรอกข้อมูลเพิ่มเติมที่ต้องการแจ้ง (ถ้ามี)"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                />
                <Label htmlFor="agreeToTerms" className="text-sm">
                  ฉันยอมรับเงื่อนไขการลงทะเบียนและนโยบายความเป็นส่วนตัว *
                </Label>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'กำลังส่งข้อมูล...' : 'ลงทะเบียนเรียน'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              ข้อมูลติดต่อ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">ที่อยู่</p>
                  <p className="text-sm text-muted-foreground">
                    NexusBangkok Church<br />
                    123/456 ถนนสุขุมวิท<br />
                    แขวงคลองเตย เขตคลองเตย<br />
                    กรุงเทพมหานคร 10110<br />
                    ประเทศไทย
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">เบอร์โทรศัพท์</p>
                  <p className="text-sm text-muted-foreground">
                    +66 2 123 4567<br />
                    +66 81 234 5678<br />
                    (เวลาทำการ: จันทร์-ศุกร์ 9:00-18:00 น.)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">อีเมล</p>
                  <p className="text-sm text-muted-foreground">
                    info@nexusbangkok.org<br />
                    bibleclass@nexusbangkok.org<br />
                    (สำหรับลงทะเบียนเรียนคลาส)
                  </p>
                </div>
              </div>
            </div>
            
            {/* Additional Contact Info */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-3">ข้อมูลเพิ่มเติม</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">เวลาทำการ:</p>
                  <p className="text-muted-foreground">
                    จันทร์-ศุกร์: 9:00-18:00 น.<br />
                    เสาร์-อาทิตย์: 8:00-17:00 น.
                  </p>
                </div>
                <div>
                  <p className="font-medium">การเดินทาง:</p>
                  <p className="text-muted-foreground">
                    BTS: สถานีอโศก<br />
                    MRT: สถานีสุขุมวิท<br />
                    รถเมล์: สาย 2, 25, 73
                  </p>
                </div>
              </div>
              
              {/* Social Media Links */}
              <div className="mt-4 pt-4 border-t">
                <p className="font-medium mb-2">ติดตามเราได้ที่:</p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('https://www.facebook.com/NexusBangkok', '_blank')}
                    className="gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('https://www.youtube.com/@nexusfellowship', '_blank')}
                    className="gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    YouTube
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('https://www.instagram.com/nexusbangkok', '_blank')}
                    className="gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                    </svg>
                    Instagram
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Information */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
          <CardHeader>
            <CardTitle className="text-center">🏛️ บริการของ NexusBangkok Church</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <h4 className="font-semibold mb-2">⛪ การนมัสการ</h4>
                <p className="text-muted-foreground">
                  การนมัสการทุกวันอาทิตย์ เวลา 10:00 น. และ 18:00 น.
                </p>
              </div>
              <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <h4 className="font-semibold mb-2">📖 คลาสพระคัมภีร์</h4>
                <p className="text-muted-foreground">
                  คลาสพระคัมภีร์สำหรับทุกวัย ทุกวันพุธ 19:00 น.
                </p>
              </div>
              <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <h4 className="font-semibold mb-2">👥 กลุ่มเล็ก</h4>
                <p className="text-muted-foreground">
                  กลุ่มเล็กสำหรับการเติบโตฝ่ายจิตวิญญาณ
                </p>
              </div>
              <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <h4 className="font-semibold mb-2">🎵 การนมัสการดนตรี</h4>
                <p className="text-muted-foreground">
                  ทีมนมัสการและดนตรีคริสเตียน
                </p>
              </div>
              <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <h4 className="font-semibold mb-2">🤝 การรับใช้</h4>
                <p className="text-muted-foreground">
                  โอกาสในการรับใช้และช่วยเหลือชุมชน
                </p>
              </div>
              <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <h4 className="font-semibold mb-2">📞 การปรึกษา</h4>
                <p className="text-muted-foreground">
                  การปรึกษาทางจิตวิญญาณและคำแนะนำ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BibleClassRegistration; 