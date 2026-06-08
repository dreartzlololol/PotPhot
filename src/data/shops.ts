export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  date: string;
  content: string;
  potImage?: string;
}

export interface Shop {
  id: string;
  name: string;
  category: 'nearby' | 'popular' | 'handmade' | 'now' | 'garden';
  categoryTh: string;
  description: string;
  rating: number;
  reviewCount: number;
  distance: string;
  lat: number; // Latitude coordinate
  lng: number; // Longitude coordinate
  address: string;
  openStatus: string;
  isOpen: boolean;
  phone: string;
  coverImage: string;
  videoUrl: string;
  gallery: string[];
  reviews: Review[];
}

export const SHOPS_DATA: Shop[] = [
  {
    id: '1',
    name: 'ร้านมังกรเริงร่า (Cheerful Dragon Ceramic)',
    category: 'handmade',
    categoryTh: 'ร้าน handmade',
    description: 'ร้านกระถางดินเผาลายมังกรปั้นมือระดับตำนานของโพธาราม สืบทอดภูมิปัญญามากว่า 3 รุ่น โดดเด่นด้วยลายมังกรจีนนูนต่ำพ่นสีทองวิจิตรสะดุดตา และผิวหม้อดินเคลือบเงาสูตรลับเฉพาะ',
    rating: 4.9,
    reviewCount: 124,
    distance: '1.2 กม.',
    lat: 13.6925,
    lng: 99.8510,
    address: '124 ถ.พิทักษ์พนมมาศ ต.โพธาราม อ.โพธาราม จ.ราชบุรี (ใกล้สถานีรถไฟโพธาราม)',
    openStatus: 'เปิดอยู่ • ปิด 18:00',
    isOpen: true,
    phone: '081-234-5678',
    coverImage: '/background.png',
    videoUrl: '/videos/thai_pot_00001.mp4',
    gallery: [
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&auto=format&fit=crop&q=60'
    ],
    reviews: [
      {
        id: 'r1',
        reviewerName: 'กิตติศักดิ์ สมบูรณ์',
        rating: 5,
        date: '2 วันที่แล้ว',
        content: 'กระถางปั้นดินสีสวยมาก ลายมังกรละเอียดสุด ๆ ซื้อไปตั้งประดับหน้าบ้านแล้วดูเด่นมาก เจ้าของร้านแนะนำวิธีลงดินต้นไม้ให้อย่างละเอียด มีของแถมเป็นกระถางดินเผาใบเล็กด้วยครับ',
        potImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=200&auto=format&fit=crop&q=60'
      },
      {
        id: 'r2',
        reviewerName: 'ณิชาภัทร นุ่มนวล',
        rating: 5,
        date: '1 สัปดาห์ที่แล้ว',
        content: 'ชอบมาสคอตกระถางมังกรของแอพนี้ นำทางมาร้านได้ตรงเป๊ะ กระถางลายมังกรทองสวยจริง ๆ ค่ะ ซื้อฝากญาติผู้ใหญ่ประทับใจทุกคน แนะนำค่ะ'
      }
    ]
  },
  {
    id: '2',
    name: 'สวนบ้านดินโพธิ์ทอง (Cozy Clay Garden)',
    category: 'popular',
    categoryTh: 'ร้านยอดนิยม',
    description: 'แหล่งรวมต้นไม้ฟอกอากาศและกระถางดินเผาทรงเรขาคณิตสไตล์มินิมอล โทนสีเอิร์ธโทน ครีม เทา น้ำตาลทราย เหมาะสำหรับแต่งห้องนอน คอนโด หรือมุมทำงานสไตล์มินิมอลคาเฟ่',
    rating: 4.8,
    reviewCount: 98,
    distance: '2.5 กม.',
    lat: 13.6872,
    lng: 99.8601,
    address: '88 ซอยชื่นอารมณ์ ต.บ้านเลือก อ.โพธาราม จ.ราชบุรี (หลังวัดโพธิ์โสภาราม)',
    openStatus: 'เปิดอยู่ • ปิด 17:30',
    isOpen: true,
    phone: '089-876-5432',
    coverImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80',
    videoUrl: '/videos/thai_pot_00002.mp4',
    gallery: [
      'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=500&auto=format&fit=crop&q=60'
    ],
    reviews: [
      {
        id: 'r3',
        reviewerName: 'แพรวา วิเศษสุด',
        rating: 4,
        date: '3 วันที่แล้ว',
        content: 'กระถางมินิมอลสวยงามเรียบร้อยดีค่ะ ราคาย่อมเยามาก ซื้อมา 5 ใบสีพาสเทลเข้ากับห้องมาก บริการห่อกันกระแทกให้อย่างดีเลยค่ะ'
      }
    ]
  },
  {
    id: '3',
    name: 'เรือนกระถางทำมือคุณปู่ (Grandpa Pottery)',
    category: 'handmade',
    categoryTh: 'ร้าน handmade',
    description: 'สัมผัสบรรยากาศร่มรื่นในสวนมะพร้าวโบราณ เรียนรู้ขั้นตอนการปั้นดินเผาแบบวิถีดั้งเดิม และจำหน่ายกระถางดินดิบ กระถางบอนไซ และของแต่งสวนดีไซน์แอนทีคที่ไม่ซ้ำใคร',
    rating: 4.7,
    reviewCount: 76,
    distance: '3.8 กม.',
    lat: 13.6780,
    lng: 99.8350,
    address: '45 หมู่ 3 ต.คลองตาคต อ.โพธาราม จ.ราชบุรี',
    openStatus: 'ปิดแล้ว • เปิดวันพรุ่งนี้ 08:30',
    isOpen: false,
    phone: '086-111-2222',
    coverImage: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80',
    videoUrl: '/videos/thai_pot_00003.mp4',
    gallery: [
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=500&auto=format&fit=crop&q=60'
    ],
    reviews: [
      {
        id: 'r4',
        reviewerName: 'ประพนธ์ เพียรดี',
        rating: 5,
        date: '2 สัปดาห์ที่แล้ว',
        content: 'คุณปู่น่ารักและใจดีมาก ได้ลองขึ้นแป้นหมุนดินปั้นกระถางเองด้วย สนุกมากครับ กระถางบอนไซที่นี่ดินแกร่งระบายน้ำดีเยี่ยม สมกับที่ปั้นด้วยมือชิ้นต่อชิ้น'
      }
    ]
  },
  {
    id: '4',
    name: 'พฤกษาแฟนตาซี (Pruksa Fantasy)',
    category: 'garden',
    categoryTh: 'ร้านตกแต่งสวน',
    description: 'ศูนย์รวมของตกแต่งสวนสไตล์แฟนตาซีและล้านนาร่วมสมัย รูปปั้นสัตว์เทพนิยาย อ่างน้ำพุหินทรายขัดเงา กระถางบัวหินอ่อน และพรรณไม้ประดับเมืองร้อนฟอร์มสวยหายาก',
    rating: 4.6,
    reviewCount: 54,
    distance: '0.8 กม.',
    lat: 13.7010,
    lng: 99.8465,
    address: '29 ถนนแสงชูโต ต.โพธาราม อ.โพธาราม จ.ราชบุรี',
    openStatus: 'เปิดอยู่ • ปิด 19:00',
    isOpen: true,
    phone: '084-555-6677',
    coverImage: 'https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=800&auto=format&fit=crop&q=80',
    videoUrl: '/videos/thai_pot_00004.mp4',
    gallery: [
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=500&auto=format&fit=crop&q=60'
    ],
    reviews: [
      {
        id: 'r5',
        reviewerName: 'พงศกร เด่นดี',
        rating: 4,
        date: '1 เดือนที่แล้ว',
        content: 'ร้านใหญ่มาก ของแต่งสวนละลานตามาก มีรูปปั้นเทพนิยายอารมณ์เหมือนสวนวิเศษ น้ำพุดินเผาของราชบุรีก็สวยงามดีครับ ราคาสมน้ำสมเนื้อ'
      }
    ]
  },
  {
    id: '5',
    name: 'คาเฟ่กระถางเขียว (Green Pot Cafe & Garden)',
    category: 'now',
    categoryTh: 'ร้านเปิดตอนนี้',
    description: 'คาเฟ่เรือนกระจกบรรยากาศร่มรื่นใต้เงาจามจุรียักษ์ จำหน่ายกาแฟสดออร์แกนิก ของหวานแสนอร่อย และมุมรวมของกระถางดินเผาจิ๋ววาดลายการ์ตูน แฟนตาซีมังกรน้อย และต้นแคคตัสหลากสายพันธุ์',
    rating: 4.9,
    reviewCount: 152,
    distance: '1.5 กม.',
    lat: 13.6550,
    lng: 99.8310,
    address: '9/2 หมู่ 1 ต.เจ็ดเสมียน อ.โพธาราม จ.ราชบุรี (ริมแม่น้ำแม่กลอง)',
    openStatus: 'เปิดอยู่ • ปิด 21:00',
    isOpen: true,
    phone: '083-999-8888',
    coverImage: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&auto=format&fit=crop&q=80',
    videoUrl: '/videos/thai_pot_00001.mp4',
    gallery: [
      'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&auto=format&fit=crop&q=60'
    ],
    reviews: [
      {
        id: 'r6',
        reviewerName: 'จิราภรณ์ รักเรียน',
        rating: 5,
        date: '5 วันที่แล้ว',
        content: 'เค้กมะพร้าวอ่อนอร่อยมากกก! ได้ช้อปต้นไม้น่ารักและกระถางมังกรไซส์จิ๋วกลับบ้านด้วย สวนสวยร่มรื่นริมแม่น้ำ นั่งทำงานชิลล์มาก ๆ แนะนำร้านนี้เลยค่ะ',
        potImage: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=200&auto=format&fit=crop&q=60'
      }
    ]
  }
];
