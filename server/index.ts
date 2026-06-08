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
  const { id, role, name, phone, email, nationalId, shopEmail, shopName, shopDescription, shopThumbnail, vehicleType, driversLicense } = req.body;

  try {
    // 1. Insert into base users table
    await runQuery(
      `INSERT INTO users (id, role, name, phone, email, nationalId) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, role, name, phone, email, nationalId]
    );

    // 2. Insert into role-specific table
    if (role === 'shop') {
      await runQuery(
        `INSERT INTO shops (userId, shopEmail, shopName, shopDescription, shopThumbnail, shopAddress, isOpen) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, shopEmail, shopName, shopDescription, shopThumbnail, '', 0]
      );
    } else if (role === 'rider') {
      await runQuery(
        `INSERT INTO riders (userId, vehicleType, driversLicense) VALUES (?, ?, ?)`,
        [id, vehicleType, driversLicense]
      );
    }

    res.status(201).json({ message: 'User registered successfully', user: req.body });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed, email might already exist.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;

  try {
    const user: any = await getQuery(`SELECT * FROM users WHERE email = ?`, [email]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let fullUser = { ...user };

    if (user.role === 'shop') {
      const shopInfo: any = await getQuery(`SELECT * FROM shops WHERE userId = ?`, [user.id]);
      fullUser = { 
        ...fullUser, 
        ...shopInfo,
        shopLocation: shopInfo.lat && shopInfo.lng ? { lat: shopInfo.lat, lng: shopInfo.lng } : null,
        isOpen: shopInfo.isOpen === 1,
        salesHistory: [] // To be fetched later if needed
      };
      delete fullUser.userId;
      delete fullUser.lat;
      delete fullUser.lng;
    } else if (user.role === 'rider') {
      const riderInfo: any = await getQuery(`SELECT * FROM riders WHERE userId = ?`, [user.id]);
      fullUser = { ...fullUser, ...riderInfo };
      delete fullUser.userId;
    }

    res.json({ user: fullUser });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
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

// Get all open shops (for the map/home page)
app.get('/api/shops', async (req, res) => {
  try {
    const shops = await allQuery(`
      SELECT s.*, u.name as ownerName, u.phone 
      FROM shops s 
      JOIN users u ON s.userId = u.id 
      WHERE s.isOpen = 1
    `);
    
    // Format for frontend
    const formattedShops = shops.map((s: any) => ({
      ...s,
      id: s.userId,
      shopLocation: s.lat && s.lng ? { lat: s.lat, lng: s.lng } : null,
      isOpen: true
    }));

    res.json({ shops: formattedShops });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shops' });
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


app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
