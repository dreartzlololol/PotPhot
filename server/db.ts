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
        nationalId TEXT NOT NULL
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

    console.log('Database tables initialized.');
  });
}
