const VERSES = [
  {
    book: "ยอห์น 3:16",
    text: "เพราะว่าพระเจ้าทรงรักโลก จนได้ทรงประทานพระบุตรองค์เดียวของพระองค์ เพื่อผู้ใดที่เชื่อในพระองค์จะไม่พินาศ แต่มีชีวิตนิรันดร์",
    explanation: "ข้อนี้แสดงถึงความรักอันยิ่งใหญ่ของพระเจ้าที่มีต่อมนุษย์ทุกคน"
  },
  // Add more verses here
];

export const getRandomVerses = (count = 3) => {
  const shuffled = [...VERSES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
