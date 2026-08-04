import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

// Setup database file path
const dbPath = path.resolve('server', 'photpot.sqlite');

// Ensure server directory exists
if (!fs.existsSync(path.resolve('server'))) {
  fs.mkdirSync(path.resolve('server'));
}

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Users table handles base info for ALL roles
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        nationalId TEXT NOT NULL,
        points INTEGER DEFAULT 15
      )
    `);

    // Shops table (extends user)
    db.run(`
      CREATE TABLE IF NOT EXISTS shops (
        userId TEXT PRIMARY KEY,
        shopEmail TEXT NOT NULL,
        shopName TEXT NOT NULL,
        shopDescription TEXT NOT NULL,
        shopThumbnail TEXT,
        shopAddress TEXT,
        lat REAL,
        lng REAL,
        isOpen INTEGER DEFAULT 0,
        category TEXT,
        categoryTh TEXT,
        distance TEXT,
        openStatus TEXT,
        coverImage TEXT,
        videoUrl TEXT,
        gallery TEXT,
        rating REAL DEFAULT 5.0,
        reviewCount INTEGER DEFAULT 0,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Riders table (extends user)
    db.run(`
      CREATE TABLE IF NOT EXISTS riders (
        userId TEXT PRIMARY KEY,
        vehicleType TEXT NOT NULL,
        driversLicense TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Products table
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        shopId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        imageUrl TEXT,
        FOREIGN KEY (shopId) REFERENCES shops(userId)
      )
    `);

    // Sales/Orders table (simplified for mockup)
    db.run(`
      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        shopId TEXT NOT NULL,
        potName TEXT NOT NULL,
        price REAL NOT NULL,
        date TEXT NOT NULL,
        customerName TEXT NOT NULL,
        FOREIGN KEY (shopId) REFERENCES shops(userId)
      )
    `);

    // Dynamic Customer, Shop & Rider Orders Table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customerId TEXT NOT NULL,
        customerName TEXT NOT NULL,
        customerPhone TEXT,
        shopId TEXT NOT NULL,
        shopName TEXT NOT NULL,
        potName TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER DEFAULT 1,
        status TEXT NOT NULL,
        progress INTEGER DEFAULT 0,
        date TEXT NOT NULL,
        address TEXT NOT NULL,
        potDetails TEXT,
        riderId TEXT,
        riderName TEXT,
        lat REAL,
        lng REAL
      )
    `);

    // Reviews Table
    db.run(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        shopId TEXT NOT NULL,
        reviewerName TEXT NOT NULL,
        rating INTEGER NOT NULL,
        date TEXT NOT NULL,
        content TEXT NOT NULL,
        potImage TEXT
      )
    `);

    // Run migrations to add columns in case the database existed previously
    db.run(`ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 15`, () => {});
    db.run(`ALTER TABLE shops ADD COLUMN category TEXT`, () => {});
    db.run(`ALTER TABLE shops ADD COLUMN categoryTh TEXT`, () => {});
    db.run(`ALTER TABLE shops ADD COLUMN distance TEXT`, () => {});
    db.run(`ALTER TABLE shops ADD COLUMN openStatus TEXT`, () => {});
    db.run(`ALTER TABLE shops ADD COLUMN coverImage TEXT`, () => {});
    db.run(`ALTER TABLE shops ADD COLUMN videoUrl TEXT`, () => {});
    db.run(`ALTER TABLE shops ADD COLUMN gallery TEXT`, () => {});
    db.run(`ALTER TABLE shops ADD COLUMN rating REAL DEFAULT 5.0`, () => {});
    db.run(`ALTER TABLE shops ADD COLUMN reviewCount INTEGER DEFAULT 0`, () => {});
    db.run(`ALTER TABLE orders ADD COLUMN lat REAL`, () => {});
    db.run(`ALTER TABLE orders ADD COLUMN lng REAL`, () => {});

    console.log('Database tables initialized.');
    
    // Seed static data
    seedDatabase();
  });
}

function seedDatabase() {
  db.get("SELECT COUNT(*) as count FROM users WHERE id = '1'", (err, row: any) => {
    if (err) {
      console.error('Error checking seed status:', err);
      return;
    }

    if (row && row.count > 0) {
      console.log('Database already seeded.');
      return;
    }

    console.log('Seeding default shops, products, and reviews...');

    const shopsSeed = [
      {
        id: '1',
        name: 'สมชาย รักดี (Shop 1 Owner)',
        phone: '081-234-5678',
        email: 'shop1@photpot.com',
        nationalId: '1-1111-11111-11-1',
        shopEmail: 'shop1@photpot.com',
        shopName: 'ร้านมังกรเริงร่า (Cheerful Dragon Ceramic)',
        category: 'handmade',
        categoryTh: 'ร้าน handmade',
        description: 'ร้านกระถางดินเผาลายมังกรปั้นมือระดับตำนานของโพธาราม สืบทอดภูมิปัญญามากว่า 3 รุ่น โดดเด่นด้วยลายมังกรจีนนูนต่ำพ่นสีทองวิจิตรสะดุดตา และผิวหม้อดินเคลือบเงาสูตรลับเฉพาะ',
        rating: 4.9,
        reviewCount: 2,
        distance: '1.2 กม.',
        lat: 13.6925,
        lng: 99.8510,
        address: '124 ถ.พิทักษ์พนมมาศ ต.โพธาราม อ.โพธาราม จ.ราชบุรี (ใกล้สถานีรถไฟโพธาราม)',
        openStatus: 'เปิดอยู่ • ปิด 18:00',
        isOpen: 1,
        coverImage: '/background.png',
        videoUrl: '/videos/thai_pot_00001.mp4',
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&auto=format&fit=crop&q=60'
        ])
      },
      {
        id: '2',
        name: 'มาลี สวยงาม (Shop 2 Owner)',
        phone: '089-876-5432',
        email: 'shop2@photpot.com',
        nationalId: '2-2222-22222-22-2',
        shopEmail: 'shop2@photpot.com',
        shopName: 'สวนบ้านดินโพธิ์ทอง (Cozy Clay Garden)',
        category: 'popular',
        categoryTh: 'ร้านยอดนิยม',
        description: 'แหล่งรวมต้นไม้ฟอกอากาศและกระถางดินเผาทรงเรขาคณิตสไตล์มินิมอล โทนสีเอิร์ธโทน ครีม เทา น้ำตาลทราย เหมาะสำหรับแต่งห้องนอน คอนโด หรือมุมทำงานสไตล์มินิมอลคาเฟ่',
        rating: 4.8,
        reviewCount: 1,
        distance: '2.5 กม.',
        lat: 13.6872,
        lng: 99.8601,
        address: '88 ซอยชื่นอารมณ์ ต.บ้านเลือก อ.โพธาราม จ.ราชบุรี (หลังวัดโพธิ์โสภาราม)',
        openStatus: 'เปิดอยู่ • ปิด 17:30',
        isOpen: 1,
        coverImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80',
        videoUrl: '/videos/thai_pot_00002.mp4',
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=500&auto=format&fit=crop&q=60'
        ])
      },
      {
        id: '3',
        name: 'ตาชู ปั้นกระถาง (Shop 3 Owner)',
        phone: '086-111-2222',
        email: 'shop3@photpot.com',
        nationalId: '3-3333-33333-33-3',
        shopEmail: 'shop3@photpot.com',
        shopName: 'เรือนกระถางทำมือคุณปู่ (Grandpa Pottery)',
        category: 'handmade',
        categoryTh: 'ร้าน handmade',
        description: 'สัมผัสบรรยากาศร่มรื่นในสวนมะพร้าวโบราณ เรียนรู้ขั้นตอนการปั้นดินเผาแบบวิถีดั้งเดิม และจำหน่ายกระถางดินดิบ กระถางบอนไซ และของแต่งสวนดีไซน์แอนทีคที่ไม่ซ้ำใคร',
        rating: 4.7,
        reviewCount: 1,
        distance: '3.8 กม.',
        lat: 13.6780,
        lng: 99.8350,
        address: '45 หมู่ 3 ต.คลองตาคต อ.โพธาราม จ.ราชบุรี',
        openStatus: 'ปิดแล้ว • เปิดวันพรุ่งนี้ 08:30',
        isOpen: 0,
        coverImage: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80',
        videoUrl: '/videos/thai_pot_00003.mp4',
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=500&auto=format&fit=crop&q=60'
        ])
      },
      {
        id: '4',
        name: 'ธนาการ ค้าขาย (Shop 4 Owner)',
        phone: '084-555-6677',
        email: 'shop4@photpot.com',
        nationalId: '4-4444-44444-44-4',
        shopEmail: 'shop4@photpot.com',
        shopName: 'พฤกษาแฟนตาซี (Pruksa Fantasy)',
        category: 'garden',
        categoryTh: 'ร้านตกแต่งสวน',
        description: 'ศูนย์รวมของตกแต่งสวนสไตล์แฟนตาซีและล้านนาร่วมสมัย รูปปั้นสัตว์เทพนิยาย อ่างน้ำพุหินทรายขัดเงา กระถางบัวหินอ่อน และพรรณไม้ประดับเมืองร้อนฟอร์มสวยหายาก',
        rating: 4.6,
        reviewCount: 1,
        distance: '0.8 กม.',
        lat: 13.7010,
        lng: 99.8465,
        address: '29 ถนนแสงชูโต ต.โพธาราม อ.โพธาราม จ.ราชบุรี',
        openStatus: 'เปิดอยู่ • ปิด 19:00',
        isOpen: 1,
        coverImage: 'https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=800&auto=format&fit=crop&q=80',
        videoUrl: '/videos/thai_pot_00004.mp4',
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=500&auto=format&fit=crop&q=60'
        ])
      },
      {
        id: '5',
        name: 'จิราพร หวานเจี๊ยบ (Shop 5 Owner)',
        phone: '083-999-8888',
        email: 'shop5@photpot.com',
        nationalId: '5-5555-55555-55-5',
        shopEmail: 'shop5@photpot.com',
        shopName: 'คาเฟ่กระถางเขียว (Green Pot Cafe & Garden)',
        category: 'now',
        categoryTh: 'ร้านเปิดตอนนี้',
        description: 'คาเฟ่เรือนกระจกบรรยากาศร่มรื่นใต้เงาจามจุรียักษ์ จำหน่ายกาแฟสดออร์แกนิก ของหวานแสนอร่อย และมุมรวมของกระถางดินเผาจิ๋ววาดลายการ์ตูน แฟนตาซีมังกรน้อย และต้นแคคตัสหลากสายพันธุ์',
        rating: 4.9,
        reviewCount: 1,
        distance: '1.5 กม.',
        lat: 13.6550,
        lng: 99.8310,
        address: '9/2 หมู่ 1 ต.เจ็ดเสมียน อ.โพธาราม จ.ราชบุรี (ริมแม่น้ำแม่กลอง)',
        openStatus: 'เปิดอยู่ • ปิด 21:00',
        isOpen: 1,
        coverImage: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&auto=format&fit=crop&q=80',
        videoUrl: '/videos/thai_pot_00001.mp4',
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&auto=format&fit=crop&q=60'
        ])
      }
    ];

    const productsSeed = [
      { id: 'p1-1', name: 'กระถางดินเผาลายมังกร (เล็ก)', description: 'กระถางดินเผาลายมังกรปั้นมืองานละเอียด ขนาด 4 นิ้ว', price: 90, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=300&auto=format&fit=crop&q=60' },
      { id: 'p1-2', name: 'กระถางดินเผาลายมังกร (ใหญ่)', description: 'กระถางดินเผาลายมังกรสีทองคำหรูหรา ขนาด 10 นิ้ว', price: 350, stock: 8, imageUrl: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=300&auto=format&fit=crop&q=60' },
      { id: 'p1-3', name: 'กระถางมินิมอลทรงเรขาคณิต', description: 'กระถางปั้นดินเผาสไตล์มินิมอลโทนพาสเทลเรียบง่าย', price: 120, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=300&auto=format&fit=crop&q=60' }
    ];

    const reviewsSeed = [
      // Shop 1 reviews
      { id: 'r1-1', shopId: '1', reviewerName: 'กิตติศักดิ์ สมบูรณ์', rating: 5, date: '2 วันที่แล้ว', content: 'กระถางปั้นดินสีสวยมาก ลายมังกรละเอียดสุด ๆ ซื้อไปตั้งประดับหน้าบ้านแล้วดูเด่นมาก เจ้าของร้านแนะนำวิธีลงดินต้นไม้ให้อย่างละเอียด มีของแถมเป็นกระถางดินเผาใบเล็กด้วยครับ', potImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=200&auto=format&fit=crop&q=60' },
      { id: 'r1-2', shopId: '1', reviewerName: 'ณิชาภัทร นุ่มนวล', rating: 5, date: '1 สัปดาห์ที่แล้ว', content: 'ชอบมาสคอตกระถางมังกรของแอพนี้ นำทางมาร้านได้ตรงเป๊ะ กระถางลายมังกรทองสวยจริง ๆ ค่ะ ซื้อฝากญาติผู้ใหญ่ประทับใจทุกคน แนะนำค่ะ', potImage: '' },
      // Shop 2 reviews
      { id: 'r2-1', shopId: '2', reviewerName: 'แพรวา วิเศษสุด', rating: 4, date: '3 วันที่แล้ว', content: 'กระถางมินิมอลสวยงามเรียบร้อยดีค่ะ ราคาย่อมเยามาก ซื้อมา 5 ใบสีพาสเทลเข้ากับห้องมาก บริการห่อกันกระแทกให้อย่างดีเลยค่ะ', potImage: '' },
      // Shop 3 reviews
      { id: 'r3-1', shopId: '3', reviewerName: 'ประพนธ์ เพียรดี', rating: 5, date: '2 สัปดาห์ที่แล้ว', content: 'คุณปู่น่ารักและใจดีมาก ได้ลองขึ้นแป้นหมุนดินปั้นกระถางเองด้วย สนุกมากครับ กระถางบอนไซที่นี่ดินแกร่งระบายน้ำดีเยี่ยม สมกับที่ปั้นด้วยมือชิ้นต่อชิ้น', potImage: '' },
      // Shop 4 reviews
      { id: 'r4-1', shopId: '4', reviewerName: 'พงศกร เด่นดี', rating: 4, date: '1 เดือนที่แล้ว', content: 'ร้านใหญ่มาก ของแต่งสวนละลานตามาก มีรูปปั้นเทพนิยายอารมณ์เหมือนสวนวิเศษ น้ำพุดินเผาของราชบุรีก็สวยงามดีครับ ราคาสมน้ำสมเนื้อ', potImage: '' },
      // Shop 5 reviews
      { id: 'r5-1', shopId: '5', reviewerName: 'จิราภรณ์ รักเรียน', rating: 5, date: '5 วันที่แล้ว', content: 'เค้กมะพร้าวอ่อนอร่อยมากกก! ได้ช้อปต้นไม้น่ารักและกระถางมังกรไซส์จิ๋วกลับบ้านด้วย สวนสวยร่มรื่นริมแม่น้ำ นั่งทำงานชิลล์มาก ๆ แนะนำร้านนี้เลยค่ะ', potImage: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=200&auto=format&fit=crop&q=60' }
    ];

    // Begin Seeding
    db.serialize(() => {
      // 1. Seed users & shops
      for (const shop of shopsSeed) {
        db.run(
          `INSERT INTO users (id, role, name, phone, email, nationalId, points) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [shop.id, 'shop', shop.name, shop.phone, shop.email, shop.nationalId, 15]
        );
        db.run(
          `INSERT INTO shops (userId, shopEmail, shopName, shopDescription, shopThumbnail, shopAddress, lat, lng, isOpen, category, categoryTh, distance, openStatus, coverImage, videoUrl, gallery, rating, reviewCount)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            shop.id, shop.shopEmail, shop.shopName, shop.description, shop.coverImage, shop.address,
            shop.lat, shop.lng, shop.isOpen, shop.category, shop.categoryTh, shop.distance, shop.openStatus,
            shop.coverImage, shop.videoUrl, shop.gallery, shop.rating, shop.reviewCount
          ]
        );
      }

      // 2. Seed products (each shop gets the default 3 products)
      for (const shop of shopsSeed) {
        for (const prod of productsSeed) {
          const uniqueProdId = `${shop.id}-${prod.id}`;
          db.run(
            `INSERT INTO products (id, shopId, name, description, price, stock, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [uniqueProdId, shop.id, prod.name, prod.description, prod.price, prod.stock, prod.imageUrl]
          );
        }
      }

      // 3. Seed reviews
      for (const rev of reviewsSeed) {
        db.run(
          `INSERT INTO reviews (id, shopId, reviewerName, rating, date, content, potImage) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [rev.id, rev.shopId, rev.reviewerName, rev.rating, rev.date, rev.content, rev.potImage || null]
        );
      }

      console.log('Database seeded successfully.');
    });
  });
}
