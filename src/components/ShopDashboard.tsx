import React, { useState, useEffect, useRef } from 'react';
import type { ShopProfile } from '../types/auth';
import { Store, LogOut, TrendingUp, Package, Clock, MapPin, X, Check, Plus, Edit2, Trash2, Image as ImageIcon, UploadCloud } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons in Vite/Webpack
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Interactive Map Picker Component using raw Leaflet
const MapPicker: React.FC<{
  initialLocation: {lat: number, lng: number} | null,
  onLocationSelect: (loc: {lat: number, lng: number}) => void
}> = ({ initialLocation, onLocationSelect }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map centered on Thailand (Bangkok) if no initial location
    const center: [number, number] = initialLocation ? [initialLocation.lat, initialLocation.lng] : [13.7563, 100.5018];
    const zoom = initialLocation ? 14 : 6;

    const map = L.map(mapContainerRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    if (initialLocation) {
      markerRef.current = L.marker(center).addTo(map);
    }

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng(e.latlng);
      } else {
        markerRef.current = L.marker(e.latlng).addTo(map);
      }
      onLocationSelect({ lat, lng });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const lat = initialLocation?.lat;
  const lng = initialLocation?.lng;

  // React to external location changes (e.g. from address search or geolocation)
  useEffect(() => {
    if (mapInstanceRef.current && lat !== undefined && lng !== undefined) {
      const center: [number, number] = [lat, lng];
      mapInstanceRef.current.setView(center, 14, { animate: true });
      if (markerRef.current) {
        markerRef.current.setLatLng(center);
      } else {
        markerRef.current = L.marker(center).addTo(mapInstanceRef.current);
      }
    }
  }, [lat, lng]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '250px', borderRadius: '12px', zIndex: 1, border: '1px solid rgba(0,0,0,0.1)' }} />;
};

interface Product {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
}

const ShopProducts: React.FC<{ shopId: string }> = ({ shopId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [imageInputType, setImageInputType] = useState<'file' | 'url'>('file');

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/shops/${shopId}/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [shopId]);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice(0);
    setStock(0);
    setImageUrl('');
    setImageInputType('file');
    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price);
    setStock(p.stock);
    setImageUrl(p.imageUrl);
    setImageInputType(p.imageUrl && p.imageUrl.startsWith('http') ? 'url' : 'file');
    setShowModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('ขนาดรูปภาพต้องไม่เกิน 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name) return alert('กรุณากรอกชื่อสินค้า');
    if (price < 0 || stock < 0) return alert('ราคาและจำนวนสต็อกต้องไม่ติดลบ');
    
    const payload = { name, description, price, stock, imageUrl };
    try {
      if (editingProduct) {
        await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch(`/api/shops/${shopId}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบสินค้านี้?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>จัดการสินค้าของร้าน</h3>
        <button onClick={openAddModal} style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={16} /> เพิ่มสินค้า
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
        {products.map(p => (
          <div key={p.id} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', opacity: p.stock === 0 ? 0.7 : 1 }}>
            {p.stock === 0 && (
              <div style={{ position: 'absolute', top: '24px', right: '24px', background: '#E63946', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, zIndex: 2 }}>
                หมดสต็อก
              </div>
            )}
            <div style={{ width: '100%', height: '150px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: p.stock === 0 ? 'grayscale(0.8)' : 'none' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><Package size={40} /></div>
              )}
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-dark)' }}>{p.name}</h4>
              <div style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 600 }}>฿{p.price}</div>
              <div style={{ fontSize: '12px', color: p.stock === 0 ? '#E63946' : 'var(--text-muted)', fontWeight: p.stock === 0 ? 700 : 400 }}>
                สต็อก: {p.stock} ชิ้น
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
              <button onClick={() => openEditModal(p)} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'rgba(30,81,40,0.1)', color: 'var(--primary)', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                <Edit2 size={14} /> แก้ไข
              </button>
              <button onClick={() => handleDelete(p.id)} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'rgba(230,57,70,0.1)', color: '#E63946', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                <Trash2 size={14} /> ลบ
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            ยังไม่มีสินค้าในร้านของคุณ
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', background: 'white', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>{editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>ชื่อสินค้า</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>รายละเอียด</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: 0 }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>ราคา (บาท)</label>
                <input type="number" min="0" value={price} onChange={e => setPrice(Number(e.target.value))} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: 0 }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>จำนวนในสต็อก</label>
                <input type="number" min="0" value={stock} onChange={e => setStock(Number(e.target.value))} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>รูปภาพสินค้า</label>
                
                {/* Segmented Control */}
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', padding: '4px', width: '140px' }}>
                  <div onClick={() => setImageInputType('file')} style={{ flex: 1, textAlign: 'center', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, background: imageInputType === 'file' ? 'white' : 'transparent', color: imageInputType === 'file' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: imageInputType === 'file' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>
                    ไฟล์
                  </div>
                  <div onClick={() => setImageInputType('url')} style={{ flex: 1, textAlign: 'center', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, background: imageInputType === 'url' ? 'white' : 'transparent', color: imageInputType === 'url' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: imageInputType === 'url' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>
                    ลิงก์
                  </div>
                </div>
              </div>
              
              {imageInputType === 'file' ? (
                <div style={{ position: 'relative', width: '100%', height: '100px', border: '2px dashed rgba(30,81,40,0.2)', borderRadius: '12px', background: 'rgba(30,81,40,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30,81,40,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(30,81,40,0.02)'}>
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 2 }} />
                  {imageUrl && imageUrl.startsWith('data:image') ? (
                    <img src={imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain', zIndex: 1 }} />
                  ) : (
                    <>
                      <UploadCloud size={24} color="var(--primary)" style={{ marginBottom: '8px' }} />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>คลิกเพื่ออัปโหลดรูปภาพ</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>รองรับ JPG, PNG (สูงสุด 2MB)</span>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {imageUrl && imageUrl.startsWith('http') ? (
                      <img src={imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <ImageIcon size={20} color="var(--text-muted)" />
                    )}
                  </div>
                  <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.05)', color: 'var(--text-dark)', border: 'none', fontWeight: 600, cursor: 'pointer' }}>ยกเลิก</button>
              <button onClick={handleSave} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ShopSettings: React.FC<{ user: ShopProfile, onUpdateUser: (user: ShopProfile) => void }> = ({ user, onUpdateUser }) => {
  const [shopName, setShopName] = useState(user.shopName);
  const [shopDescription, setShopDescription] = useState(user.shopDescription);
  const [shopThumbnail, setShopThumbnail] = useState(user.shopThumbnail || '');
  const [imageInputType, setImageInputType] = useState<'file' | 'url'>('file');
  const [isSaving, setIsSaving] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('ขนาดรูปภาพต้องไม่เกิน 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setShopThumbnail(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!shopName) return alert('กรุณากรอกชื่อร้าน');
    setIsSaving(true);
    try {
      const res = await fetch(`/api/shops/${user.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopName, shopDescription, shopThumbnail })
      });
      if (res.ok) {
        onUpdateUser({ ...user, shopName, shopDescription, shopThumbnail });
        alert('อัปเดตข้อมูลร้านค้าเรียบร้อยแล้ว');
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (err) {
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>ตั้งค่าร้านค้า / ตกแต่งร้านค้า</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>ชื่อร้าน</label>
        <input type="text" value={shopName} onChange={e => setShopName(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>คำอธิบายร้านค้า</label>
        <textarea value={shopDescription} onChange={e => setShopDescription(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', resize: 'vertical', minHeight: '80px' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>รูปโปรไฟล์ร้านค้า (Thumbnail)</label>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', padding: '4px', width: '140px' }}>
            <div onClick={() => setImageInputType('file')} style={{ flex: 1, textAlign: 'center', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, background: imageInputType === 'file' ? 'white' : 'transparent', color: imageInputType === 'file' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: imageInputType === 'file' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>
              ไฟล์
            </div>
            <div onClick={() => setImageInputType('url')} style={{ flex: 1, textAlign: 'center', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, background: imageInputType === 'url' ? 'white' : 'transparent', color: imageInputType === 'url' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: imageInputType === 'url' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>
              ลิงก์
            </div>
          </div>
        </div>

        {imageInputType === 'file' ? (
          <div style={{ position: 'relative', width: '100%', height: '120px', border: '2px dashed rgba(30,81,40,0.2)', borderRadius: '12px', background: 'rgba(30,81,40,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30,81,40,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(30,81,40,0.02)'}>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 2 }} />
            {shopThumbnail && shopThumbnail.startsWith('data:image') ? (
              <img src={shopThumbnail} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain', zIndex: 1 }} />
            ) : (
              <>
                <UploadCloud size={24} color="var(--primary)" style={{ marginBottom: '8px' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>คลิกเพื่ออัปโหลดรูปโปรไฟล์</span>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {shopThumbnail && shopThumbnail.startsWith('http') ? (
                <img src={shopThumbnail} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <ImageIcon size={20} color="var(--text-muted)" />
              )}
            </div>
            <input type="text" value={shopThumbnail} onChange={e => setShopThumbnail(e.target.value)} placeholder="https://..." style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }} />
          </div>
        )}
      </div>

      <button 
        onClick={handleSave} 
        disabled={isSaving}
        style={{ marginTop: '8px', padding: '14px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, fontSize: '16px', cursor: isSaving ? 'not-allowed' : 'pointer' }}
      >
        {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
      </button>
    </div>
  );
};

interface ShopDashboardProps {
  user: ShopProfile;
  onLogout: () => void;
  onUpdateUser: (user: ShopProfile) => void;
}

export const ShopDashboard: React.FC<ShopDashboardProps> = ({ user, onLogout, onUpdateUser }) => {
  const [showMapModal, setShowMapModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'settings'>('overview');
  const [tempLocation, setTempLocation] = useState<{lat: number, lng: number} | null>(null);
  const [tempAddress, setTempAddress] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const salesHistory = user.salesHistory || [
    { id: '1', potName: 'กระถางดินเผาลายมังกร (ใหญ่)', price: 350, date: '2023-10-25', customerName: 'สมปอง รักดี' },
    { id: '2', potName: 'กระถางทรงกระบอก (กลาง)', price: 120, date: '2023-10-26', customerName: 'มาลี สวยงาม' },
    { id: '3', potName: 'กระถางบอนไซ', price: 250, date: '2023-10-27', customerName: 'ธนาธร ปลูกต้นไม้' },
  ];

  const totalRevenue = salesHistory.reduce((acc, sale) => acc + sale.price, 0);

  const handleOpenShopClick = () => {
    setShowMapModal(true);
    setTempLocation(user.shopLocation || null);
    setTempAddress(user.shopAddress || '');
  };

  const handleMapClick = (loc: {lat: number, lng: number}) => {
    setTempLocation(loc);
  };

  const handleSearchAddress = async () => {
    if (!tempAddress) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(tempAddress)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setTempLocation({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      } else {
        alert('ค้นหาไม่พบพิกัด กรุณาลองเปลี่ยนคำค้นหา หรือปักหมุดเองบนแผนที่');
      }
    } catch (error) {
      console.error('Error searching address:', error);
      alert('เกิดข้อผิดพลาดในการค้นหา');
    } finally {
      setIsSearching(false);
    }
  };

  const handleGetMyLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTempLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setIsLocating(false);
        },
        (error) => {
          console.error(error);
          alert('ไม่สามารถดึงตำแหน่งได้ กรุณาอนุญาตการเข้าถึงตำแหน่งในเบราว์เซอร์');
          setIsLocating(false);
        }
      );
    } else {
      alert('เบราว์เซอร์ของคุณไม่รองรับฟีเจอร์การดึงตำแหน่ง');
      setIsLocating(false);
    }
  };

  const handleConfirmLocation = async () => {
    if (!tempLocation) return alert('กรุณาปักหมุดตำแหน่งร้านบนแผนที่');
    try {
      const res = await fetch(`/api/shops/${user.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: true, shopLocation: tempLocation, shopAddress: tempAddress })
      });
      if (res.ok) {
        onUpdateUser({ ...user, isOpen: true, shopLocation: tempLocation, shopAddress: tempAddress });
        setShowMapModal(false);
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกพิกัด');
      }
    } catch (err) {
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  const handleToggleShopStatus = async () => {
    const newStatus = !user.isOpen;
    try {
      const res = await fetch(`/api/shops/${user.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: newStatus, shopLocation: user.shopLocation, shopAddress: user.shopAddress })
      });
      if (res.ok) {
        onUpdateUser({ ...user, isOpen: newStatus });
      } else {
        alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
      }
    } catch (err) {
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Store size={24} />
          <span>แดชบอร์ดร้านค้า</span>
        </h2>
        <button 
          onClick={onLogout}
          style={{ background: 'none', border: 'none', color: '#E63946', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, cursor: 'pointer' }}
        >
          <LogOut size={18} />
          <span>ออกจากระบบ</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', borderBottom: '2px solid rgba(0,0,0,0.05)', marginBottom: '8px' }}>
        <button 
          onClick={() => setActiveTab('overview')} 
          style={{ padding: '8px 16px', border: 'none', background: 'none', borderBottom: activeTab === 'overview' ? '3px solid var(--primary)' : '3px solid transparent', fontWeight: 700, color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '15px', transition: 'all 0.2s' }}
        >
          ภาพรวมร้าน
        </button>
        <button 
          onClick={() => setActiveTab('products')} 
          style={{ padding: '8px 16px', border: 'none', background: 'none', borderBottom: activeTab === 'products' ? '3px solid var(--primary)' : '3px solid transparent', fontWeight: 700, color: activeTab === 'products' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '15px', transition: 'all 0.2s' }}
        >
          จัดการสินค้า
        </button>
        <button 
          onClick={() => setActiveTab('settings')} 
          style={{ padding: '8px 16px', border: 'none', background: 'none', borderBottom: activeTab === 'settings' ? '3px solid var(--primary)' : '3px solid transparent', fontWeight: 700, color: activeTab === 'settings' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '15px', transition: 'all 0.2s' }}
        >
          ตกแต่งร้านค้า
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <img 
              src={user.shopThumbnail || 'https://images.unsplash.com/photo-1493325619176-79116e45187e?auto=format&fit=crop&w=300&q=80'} 
              alt="Shop" 
              style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} 
            />
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>{user.shopName}</h3>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                ผู้ดูแล: {user.name} ({user.phone})<br/>
                อีเมลเจ้าของ: {user.email}<br/>
                อีเมลร้าน: {user.shopEmail}<br/>
                รหัสบัตรประชาชน: {user.nationalId}<br/>
                {user.shopAddress && <span>ที่อยู่: {user.shopAddress}</span>}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
            <div style={{ 
              padding: '6px 12px', 
              borderRadius: '20px', 
              fontSize: '12px', 
              fontWeight: 700,
              background: user.isOpen ? 'rgba(30, 81, 40, 0.1)' : 'rgba(0,0,0,0.05)',
              color: user.isOpen ? 'var(--primary)' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: user.isOpen ? 'var(--primary)' : 'var(--text-muted)' }} />
              {user.isOpen ? 'กำลังเปิดร้าน' : 'ปิดร้านอยู่'}
            </div>

            {user.shopLocation ? (
              <button 
                onClick={handleToggleShopStatus}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '8px', 
                  background: user.isOpen ? '#E63946' : 'var(--primary)', 
                  color: 'white', 
                  border: 'none', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                {user.isOpen ? 'ปิดร้าน' : 'เปิดร้านอีกครั้ง'}
              </button>
            ) : (
              <button 
                onClick={handleOpenShopClick}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '8px', 
                  background: 'var(--primary)', 
                  color: 'white', 
                  border: 'none', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '13px'
                }}
              >
                <MapPin size={16} /> ตั้งค่าเปิดร้าน
              </button>
            )}
          </div>
        </div>
        
        <p style={{ fontSize: '14px', color: 'var(--text-dark)', lineHeight: 1.5, background: 'rgba(255,255,255,0.5)', padding: '12px', borderRadius: '8px' }}>
          {user.shopDescription}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '16px', background: 'var(--white)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
              <TrendingUp size={16} color="var(--primary)" /> รายได้รวม
            </div>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary-light)', marginTop: '8px' }}>฿{totalRevenue}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '16px', background: 'var(--white)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
              <Package size={16} color="var(--gold)" /> ขายแล้ว
            </div>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary-light)', marginTop: '8px' }}>{salesHistory.length} ชิ้น</span>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} />
          <span>ประวัติการขายล่าสุด (Log History)</span>
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {salesHistory.map((sale) => (
            <div key={sale.id} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-dark)' }}>{sale.potName}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>ลูกค้า: {sale.customerName} • {sale.date}</div>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-light)' }}>
                +฿{sale.price}
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}

      {activeTab === 'products' && (
        <ShopProducts shopId={user.id} />
      )}

      {activeTab === 'settings' && (
        <ShopSettings user={user} onUpdateUser={onUpdateUser} />
      )}

      {/* Map Modal */}
      {showMapModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ 
            width: '100%', 
            maxWidth: '500px', 
            background: 'white', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden'
          }}>
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>เลือกที่ตั้งร้านของคุณ</h3>
              <button onClick={() => setShowMapModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>คลิกที่แผนที่เพื่อปักหมุดตำแหน่งร้านกระถางของคุณ เพื่อให้ลูกค้าและไรเดอร์ค้นหาเจอได้ง่าย</p>
              
              <MapPicker 
                initialLocation={tempLocation} 
                onLocationSelect={handleMapClick} 
              />

              {tempLocation && (
                <div style={{ fontSize: '12px', color: 'var(--primary)', textAlign: 'center', background: 'rgba(30,81,40,0.1)', padding: '8px', borderRadius: '8px' }}>
                  พิกัดที่เลือก: {tempLocation.lat.toFixed(6)}, {tempLocation.lng.toFixed(6)}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>รายละเอียดที่อยู่ (เช่น บ้านเลขที่, ซอย)</label>
                <textarea 
                  value={tempAddress} 
                  onChange={e => setTempAddress(e.target.value)} 
                  placeholder="เช่น 123/45 ซ.สวนงาม ถ.ต้นไม้..."
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none', resize: 'vertical', minHeight: '60px' }}
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button 
                    onClick={handleSearchAddress}
                    disabled={isSearching || !tempAddress}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--primary-light)', color: 'white', border: 'none', cursor: (isSearching || !tempAddress) ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600 }}
                  >
                    {isSearching ? 'กำลังค้นหา...' : 'ค้นหาพิกัดจากที่อยู่'}
                  </button>
                  <button 
                    onClick={handleGetMyLocation}
                    disabled={isLocating}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--gold)', color: 'white', border: 'none', cursor: isLocating ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600 }}
                  >
                    {isLocating ? 'กำลังค้นหา...' : 'ใช้ตำแหน่งปัจจุบัน'}
                  </button>
                </div>
              </div>

              <button 
                onClick={handleConfirmLocation}
                style={{ 
                  padding: '14px', 
                  borderRadius: '12px', 
                  background: 'var(--primary)', 
                  color: 'white', 
                  border: 'none', 
                  fontWeight: 700, 
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Check size={18} /> ยืนยันการเปิดร้าน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
