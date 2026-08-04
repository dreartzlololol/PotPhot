import express from 'express';
import cors from 'cors';
import { db } from './db';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Helper for Promisifying SQLite
const runQuery = (query: string, params: any[] = []): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
};

const getQuery = <T>(query: string, params: any[] = []): Promise<T> => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T);
    });
  });
};

const allQuery = <T>(query: string, params: any[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
};

// =======================
// AUTH ENDPOINTS
// =======================

// Register
app.post('/api/auth/register', async (req, res) => {
  const { id, name, phone, email, nationalId } = req.body;

  try {
    // 1. Insert into base users table (everyone gets role: 'all')
    await runQuery(
      `INSERT INTO users (id, role, name, phone, email, nationalId, points) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, 'all', name, phone, email, nationalId, 15]
    );

    // 2. Insert default matching entry in shops table
    const defaultThumbnail = 'https://images.unsplash.com/photo-1493325619176-79116e45187e?auto=format&fit=crop&w=300&q=80';
    await runQuery(
      `INSERT INTO shops (userId, shopEmail, shopName, shopDescription, shopThumbnail, shopAddress, lat, lng, isOpen, category, categoryTh, distance, openStatus, coverImage, videoUrl, gallery, rating, reviewCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, email, name + ' Pottery', 'จำหน่ายกระถางดินเผาคุณภาพและของแต่งสวนคุณภาพจากโพธาราม', defaultThumbnail, '', 
        null, null, 0, 
        'now', 'ร้านเปิดตอนนี้', '2.0 กม.', 'เปิดอยู่ • ปิด 21:00',
        defaultThumbnail,
        '/videos/thai_pot_00001.mp4', JSON.stringify([defaultThumbnail]), 5.0, 0
      ]
    );

    // 3. Insert default matching entry in riders table
    await runQuery(
      `INSERT INTO riders (userId, vehicleType, driversLicense) VALUES (?, ?, ?)`,
      [id, 'Motorcycle', 'ยังไม่ได้ระบุใบขับขี่']
    );

    const fullUser = {
      id,
      role: 'all',
      name,
      phone,
      email,
      nationalId,
      points: 15,
      shopEmail: email,
      shopName: name + ' Pottery',
      shopDescription: 'จำหน่ายกระถางดินเผาคุณภาพและของแต่งสวนคุณภาพจากโพธาราม',
      shopThumbnail: defaultThumbnail,
      shopAddress: '',
      shopLocation: null,
      isOpen: false,
      salesHistory: [],
      vehicleType: 'Motorcycle',
      driversLicense: 'ยังไม่ได้ระบุใบขับขี่'
    };

    res.status(201).json({ message: 'User registered successfully', user: fullUser });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed, email might already exist.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;

  try {
    const dbUser: any = await getQuery(`SELECT * FROM users WHERE email = ?`, [email]);
    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Force role: 'all' to support frontend dashboard switcher
    let fullUser = { ...dbUser, role: 'all' };

    // Fetch shop info (create default if missing for backward compatibility)
    let shopInfo: any = await getQuery(`SELECT * FROM shops WHERE userId = ?`, [dbUser.id]);
    if (!shopInfo) {
      const defaultThumbnail = 'https://images.unsplash.com/photo-1493325619176-79116e45187e?auto=format&fit=crop&w=300&q=80';
      await runQuery(
        `INSERT INTO shops (userId, shopEmail, shopName, shopDescription, shopThumbnail, shopAddress, lat, lng, isOpen, category, categoryTh, distance, openStatus, coverImage, videoUrl, gallery, rating, reviewCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dbUser.id, dbUser.email, dbUser.name + ' Pottery', 'จำหน่ายกระถางดินเผาคุณภาพและของแต่งสวนคุณภาพจากโพธาราม', defaultThumbnail, '', 
          null, null, 0, 
          'now', 'ร้านเปิดตอนนี้', '2.0 กม.', 'เปิดอยู่ • ปิด 21:00',
          defaultThumbnail,
          '/videos/thai_pot_00001.mp4', JSON.stringify([defaultThumbnail]), 5.0, 0
        ]
      );
      shopInfo = await getQuery(`SELECT * FROM shops WHERE userId = ?`, [dbUser.id]);
    }

    const sales = await allQuery(`SELECT * FROM sales WHERE shopId = ?`, [dbUser.id]);
    fullUser = { 
      ...fullUser, 
      ...shopInfo,
      shopLocation: shopInfo.lat && shopInfo.lng ? { lat: shopInfo.lat, lng: shopInfo.lng } : null,
      isOpen: shopInfo.isOpen === 1,
      salesHistory: sales
    };

    // Fetch rider info (create default if missing for backward compatibility)
    let riderInfo: any = await getQuery(`SELECT * FROM riders WHERE userId = ?`, [dbUser.id]);
    if (!riderInfo) {
      await runQuery(
        `INSERT INTO riders (userId, vehicleType, driversLicense) VALUES (?, ?, ?)`,
        [dbUser.id, 'Motorcycle', 'ยังไม่ได้ระบุใบขับขี่']
      );
      riderInfo = await getQuery(`SELECT * FROM riders WHERE userId = ?`, [dbUser.id]);
    }
    fullUser = { ...fullUser, ...riderInfo };

    // Cleanup redundant fields
    delete fullUser.userId;
    delete fullUser.lat;
    delete fullUser.lng;

    res.json({ user: fullUser });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Update rider profile (vehicle & license)
app.put('/api/riders/:id/profile', async (req, res) => {
  const { id } = req.params;
  const { vehicleType, driversLicense } = req.body;

  try {
    await runQuery(
      `UPDATE riders SET vehicleType = ?, driversLicense = ? WHERE userId = ?`,
      [vehicleType, driversLicense, id]
    );
    res.json({ message: 'Rider profile updated' });
  } catch (error) {
    console.error('Update rider profile error:', error);
    res.status(500).json({ error: 'Failed to update rider profile' });
  }
});

// Update points
app.put('/api/users/:id/points', async (req, res) => {
  const { id } = req.params;
  const { points } = req.body;

  try {
    await runQuery(
      `UPDATE users SET points = ? WHERE id = ?`,
      [points, id]
    );
    res.json({ message: 'Points updated successfully', points });
  } catch (error) {
    console.error('Update points error:', error);
    res.status(500).json({ error: 'Failed to update points' });
  }
});



// =======================
// SHOP ENDPOINTS
// =======================

// Update shop status and location
app.put('/api/shops/:id/status', async (req, res) => {
  const { id } = req.params;
  const { isOpen, shopLocation, shopAddress } = req.body;

  try {
    const lat = shopLocation ? shopLocation.lat : null;
    const lng = shopLocation ? shopLocation.lng : null;
    const isOpenInt = isOpen ? 1 : 0;
    const address = shopAddress || '';

    await runQuery(
      `UPDATE shops SET isOpen = ?, lat = ?, lng = ?, shopAddress = ? WHERE userId = ?`,
      [isOpenInt, lat, lng, address, id]
    );

    res.json({ message: 'Shop status updated' });
  } catch (error) {
    console.error('Update shop error:', error);
    res.status(500).json({ error: 'Failed to update shop status' });
  }
});

// Update shop profile (decoration)
app.put('/api/shops/:id/profile', async (req, res) => {
  const { id } = req.params;
  const { shopName, shopDescription, shopThumbnail } = req.body;

  try {
    await runQuery(
      `UPDATE shops SET shopName = ?, shopDescription = ?, shopThumbnail = ? WHERE userId = ?`,
      [shopName, shopDescription, shopThumbnail, id]
    );
    res.json({ message: 'Shop profile updated' });
  } catch (error) {
    console.error('Update shop profile error:', error);
    res.status(500).json({ error: 'Failed to update shop profile' });
  }
});

// Get all shops (both static and registered ones)
app.get('/api/shops', async (req, res) => {
  try {
    const shops = await allQuery(`
      SELECT s.*, u.name as ownerName, u.phone 
      FROM shops s 
      JOIN users u ON s.userId = u.id
    `);
    
    // Format for frontend
    const formattedShops = shops.map((s: any) => {
      let galleryParsed = [];
      try {
        galleryParsed = s.gallery ? JSON.parse(s.gallery) : [];
      } catch (e) {
        galleryParsed = s.gallery ? s.gallery.split(',') : [];
      }

      return {
        ...s,
        id: s.userId,
        shopLocation: s.lat && s.lng ? { lat: s.lat, lng: s.lng } : null,
        isOpen: s.isOpen === 1,
        gallery: galleryParsed,
        reviews: [] // frontend will fetch reviews on demand
      };
    });

    res.json({ shops: formattedShops });
  } catch (error) {
    console.error('Get shops error:', error);
    res.status(500).json({ error: 'Failed to fetch shops' });
  }
});

// =======================
// REVIEW ENDPOINTS
// =======================

// Get reviews for a shop
app.get('/api/shops/:id/reviews', async (req, res) => {
  const { id } = req.params;
  try {
    const reviews = await allQuery(`SELECT * FROM reviews WHERE shopId = ? ORDER BY date DESC, id DESC`, [id]);
    res.json({ reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Submit a new review
app.post('/api/shops/:id/reviews', async (req, res) => {
  const { id } = req.params;
  const { reviewerName, rating, content, potImage } = req.body;
  const reviewId = 'rev-' + Math.random().toString(36).substr(2, 9);
  const date = 'เมื่อครู่';

  try {
    await runQuery(
      `INSERT INTO reviews (id, shopId, reviewerName, rating, date, content, potImage) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [reviewId, id, reviewerName, rating, date, content, potImage || null]
    );

    // Recalculate average rating & review count for the shop
    const stats: any = await getQuery(`
      SELECT COUNT(*) as count, AVG(rating) as avgRating FROM reviews WHERE shopId = ?
    `, [id]);

    const reviewCount = stats.count || 0;
    const avgRating = stats.avgRating ? parseFloat(stats.avgRating.toFixed(1)) : 5.0;

    await runQuery(`
      UPDATE shops SET rating = ?, reviewCount = ? WHERE userId = ?
    `, [avgRating, reviewCount, id]);

    res.status(201).json({ 
      message: 'Review added successfully', 
      review: { id: reviewId, shopId: id, reviewerName, rating, date, content, potImage },
      rating: avgRating,
      reviewCount
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});



// =======================
// PRODUCT ENDPOINTS
// =======================

// Get all products for a shop
app.get('/api/shops/:id/products', async (req, res) => {
  const { id } = req.params;
  try {
    const products = await allQuery(`SELECT * FROM products WHERE shopId = ?`, [id]);
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add a new product
app.post('/api/shops/:id/products', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, imageUrl } = req.body;
  const productId = 'p-' + Math.random().toString(36).substr(2, 9);

  try {
    await runQuery(
      `INSERT INTO products (id, shopId, name, description, price, stock, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [productId, id, name, description, price, stock, imageUrl || '']
    );
    res.status(201).json({ product: { id: productId, shopId: id, name, description, price, stock, imageUrl } });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Update a product
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, imageUrl } = req.body;

  try {
    await runQuery(
      `UPDATE products SET name = ?, description = ?, price = ?, stock = ?, imageUrl = ? WHERE id = ?`,
      [name, description, price, stock, imageUrl || '', id]
    );
    res.json({ message: 'Product updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery(`DELETE FROM products WHERE id = ?`, [id]);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});


// =======================
// ORDER & DELIVERY ENDPOINTS
// =======================

// Place a new order (catalog or custom pot)
app.post('/api/orders', async (req, res) => {
  const { 
    customerId, customerName, customerPhone, 
    shopId, shopName, potName, price, quantity, 
    status, progress, address, potDetails, lat, lng
  } = req.body;
  const orderId = 'ord-' + Math.random().toString(36).substr(2, 9);
  const date = new Date().toISOString().split('T')[0];

  // If coordinates are not provided, generate random coordinates near Photharam center
  const orderLat = lat !== undefined ? lat : (13.685 + (Math.random() - 0.5) * 0.03);
  const orderLng = lng !== undefined ? lng : (99.845 + (Math.random() - 0.5) * 0.03);

  try {
    await runQuery(`
      INSERT INTO orders (
        id, customerId, customerName, customerPhone, 
        shopId, shopName, potName, price, quantity, 
        status, progress, date, address, potDetails, lat, lng
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId, customerId, customerName, customerPhone || '', 
        shopId, shopName, potName, price, quantity || 1, 
        status || 'pending', progress || 0, date, address || '', 
        potDetails ? JSON.stringify(potDetails) : null,
        orderLat, orderLng
      ]
    );
    res.status(201).json({ orderId, message: 'Order placed successfully', lat: orderLat, lng: orderLng });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Fetch orders (filterable by customerId, shopId, or status)
app.get('/api/orders', async (req, res) => {
  const { customerId, shopId, status } = req.query;
  try {
    let query = 'SELECT * FROM orders';
    const params: any[] = [];
    const conditions: string[] = [];

    if (customerId) {
      conditions.push('customerId = ?');
      params.push(customerId);
    }
    if (shopId) {
      // Return both direct orders for this shop AND global pending orders that can be claimed
      conditions.push("(shopId = ? OR (shopId = 'global' AND status = 'pending'))");
      params.push(shopId);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    // Newest orders first
    query += ' ORDER BY date DESC, id DESC';

    const rawOrders = await allQuery(query, params);
    const orders = rawOrders.map((o: any) => ({
      ...o,
      potDetails: o.potDetails ? JSON.parse(o.potDetails) : null
    }));

    res.json({ orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status/progress and assign rider/shop
app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, progress, riderId, riderName, shopId, shopName } = req.body;

  try {
    // 1. Get current order details
    const order: any = await getQuery(`SELECT * FROM orders WHERE id = ?`, [id]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // 2. Build dynamic update query
    const fields: string[] = [];
    const params: any[] = [];

    if (status !== undefined) {
      fields.push('status = ?');
      params.push(status);
    }
    if (progress !== undefined) {
      fields.push('progress = ?');
      params.push(progress);
    }
    if (riderId !== undefined) {
      fields.push('riderId = ?');
      params.push(riderId);
    }
    if (riderName !== undefined) {
      fields.push('riderName = ?');
      params.push(riderName);
    }
    if (shopId !== undefined) {
      fields.push('shopId = ?');
      params.push(shopId);
    }
    if (shopName !== undefined) {
      fields.push('shopName = ?');
      params.push(shopName);
    }

    if (fields.length > 0) {
      params.push(id);
      await runQuery(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, params);
    }

    // 3. If status is updated to 'delivered', log a record in the sales table
    if (status === 'delivered') {
      const saleId = 'sale-' + Math.random().toString(36).substr(2, 9);
      await runQuery(`
        INSERT INTO sales (id, shopId, potName, price, date, customerName)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [saleId, shopId || order.shopId, order.potName, order.price * order.quantity, order.date, order.customerName]);
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});


app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
