export type UserRole = 'customer' | 'shop' | 'rider';

export interface UserBase {
  id: string;
  role: UserRole;
  name: string;
  phone: string;
  email: string;
  nationalId: string;
}

export interface CustomerProfile extends UserBase {
  role: 'customer';
}

export interface SaleRecord {
  id: string;
  potName: string;
  price: number;
  date: string;
  customerName: string;
}

export interface ShopProfile extends UserBase {
  role: 'shop';
  shopEmail: string;
  shopName: string;
  shopDescription: string;
  shopThumbnail: string; // URL or base64
  salesHistory: SaleRecord[];
  shopLocation?: { lat: number, lng: number } | null;
  shopAddress?: string;
  isOpen?: boolean;
}

export interface RiderProfile extends UserBase {
  role: 'rider';
  vehicleType: string;
  driversLicense: string;
}

export type UserProfile = CustomerProfile | ShopProfile | RiderProfile;

