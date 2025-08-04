import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock data ตัวอย่าง
const mockMembers = [
  {
    id: 1,
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    email: 'somchai@example.com',
    phone: '0812345678',
    age: '26-35',
    experience: 'beginner',
    preferredDay: 'sunday',
    registeredAt: '2024-06-10',
  },
  {
    id: 2,
    firstName: 'วิภา',
    lastName: 'สุขใจ',
    email: 'wipa@example.com',
    phone: '0898765432',
    age: '36-45',
    experience: 'intermediate',
    preferredDay: 'wednesday',
    registeredAt: '2024-06-11',
  },
];

const Members = () => {
  const [members, setMembers] = useState(mockMembers);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}> <ArrowLeft className="w-4 h-4 mr-2" /> กลับสู่หน้าหลัก </Button>
            <h1 className="text-2xl font-bold">จัดการสมาชิกคลาสพระคัมภีร์</h1>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              รายชื่อสมาชิกที่ลงทะเบียนเรียนคลาส
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อ</TableHead>
                  <TableHead>นามสกุล</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead>เบอร์โทร</TableHead>
                  <TableHead>อายุ</TableHead>
                  <TableHead>ประสบการณ์</TableHead>
                  <TableHead>วันเรียน</TableHead>
                  <TableHead>วันที่ลงทะเบียน</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.firstName}</TableCell>
                    <TableCell>{m.lastName}</TableCell>
                    <TableCell>{m.email}</TableCell>
                    <TableCell>{m.phone}</TableCell>
                    <TableCell>{m.age}</TableCell>
                    <TableCell>{m.experience === 'beginner' ? 'เริ่มต้น' : m.experience === 'intermediate' ? 'ปานกลาง' : 'ขั้นสูง'}</TableCell>
                    <TableCell>{m.preferredDay === 'sunday' ? 'อาทิตย์' : 'พุธ'}</TableCell>
                    <TableCell>{m.registeredAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {members.length === 0 && (
              <div className="text-center text-muted-foreground py-8">ยังไม่มีสมาชิกลงทะเบียน</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Members;