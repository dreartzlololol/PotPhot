import React, { useState, useEffect } from 'react';
import type { Shop, Review } from '../data/shops';
import type { UserProfile } from '../types/auth';
import { 
  X, Heart, Share2, MapPin, Clock, Phone, Navigation, 
  Star, Image, MessageCircle, Sparkles, Check 
} from 'lucide-react';

interface ShopDetailProps {
  shop: Shop;
  onClose: () => void;
  onToggleFavorite: (shopId: string) => void;
  isFavorite: boolean;
  onAddReview: (shopId: string, newReview: Review) => void;
  currentUser?: UserProfile | null;
}

// Preset pot images that the user can mock-upload in reviews
const MOCK_POT_PRESETS = [
  { id: 'p1', name: 'กระถางดินเผาดั้งเดิม', url: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=300&auto=format&fit=crop&q=60' },
  { id: 'p2', name: 'กระถางลายมังกรจิ๋ว', url: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=300&auto=format&fit=crop&q=60' },
  { id: 'p3', name: 'กระถางแคคตัสปั้นมือ', url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=300&auto=format&fit=crop&q=60' },
  { id: 'p4', name: 'กระถางแฟนตาซีลวดลายขจี', url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300&auto=format&fit=crop&q=60' },
];

export const ShopDetail: React.FC<ShopDetailProps> = ({
  shop,
  onClose,
  onToggleFavorite,
  isFavorite,
  onAddReview,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'products' | 'custom' | 'reviews'>('info');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  // Review Form State
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [nameInput, setNameInput] = useState<string>('');
  const [contentInput, setContentInput] = useState<string>('');
  const [selectedPresetPot, setSelectedPresetPot] = useState<string | null>(null);
  const [showSuccessBubble, setShowSuccessBubble] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Custom Order Upload States
  const [customPotType, setCustomPotType] = useState<'image' | '3d'>('image');
  const [refFileName, setRefFileName] = useState<string>('');
  const [refFileSize, setRefFileSize] = useState<string>('');
  const [refFilePreview, setRefFilePreview] = useState<string>('');
  const [potSize, setPotSize] = useState<'S' | 'M' | 'L'>('M');
  const [potQuantity, setPotQuantity] = useState<number>(1);
  const [customPotNotes, setCustomPotNotes] = useState<string>('');
  const [customOrderSent, setCustomOrderSent] = useState<boolean>(false);

  // Shop Catalog & Checkout States
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<any | null>(null);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderPlacing, setOrderPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await fetch(`/api/shops/${shop.id}/products`);
        if (res.ok) {
          const data = await res.json();
          setDbProducts(data.products || []);
        }
      } catch (e) {
        console.error('Failed to load products:', e);
      } finally {
        setLoadingProducts(false);
      }
    };

    const loadReviews = async () => {
      setLoadingReviews(true);
      try {
        const res = await fetch(`/api/shops/${shop.id}/reviews`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
        }
      } catch (e) {
        console.error('Failed to load reviews:', e);
      } finally {
        setLoadingReviews(false);
      }
    };

    loadProducts();
    loadReviews();
  }, [shop.id]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('กรุณาเข้าสู่ระบบก่อนดำเนินการสั่งซื้อครับ!');
      return;
    }
    if (!shippingAddress.trim()) {
      alert('กรุณากรอกที่อยู่ในการจัดส่ง');
      return;
    }

    setOrderPlacing(true);
    try {
      const payload = {
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerPhone: currentUser.phone,
        shopId: shop.id,
        shopName: shop.name,
        potName: selectedProductForOrder.name,
        price: selectedProductForOrder.price,
        quantity: checkoutQuantity,
        status: 'pending',
        progress: 0,
        address: shippingAddress,
        potDetails: null
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setOrderSuccess(true);
        setSelectedProductForOrder(null);
        setCheckoutQuantity(1);
        setShippingAddress('');
      } else {
        alert('เกิดข้อผิดพลาดในการส่งใบสั่งซื้อ');
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setOrderPlacing(false);
    }
  };

  const handlePlaceCustomCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('กรุณาเข้าสู่ระบบก่อนดำเนินการสั่งทำครับ!');
      return;
    }
    if (!refFileName) {
      alert('กรุณาอัปโหลดรูปภาพหรือแบบร่างกระถางที่ต้องการสั่งทำ');
      return;
    }

    setOrderPlacing(true);
    try {
      const baseCost = potSize === 'S' ? 250 : potSize === 'M' ? 400 : 650;
      const setupCost = customPotType === '3d' ? 0 : 180;
      const totalEstimatedCost = (baseCost * potQuantity) + setupCost;

      const potDetails = {
        customType: customPotType,
        fileName: refFileName,
        fileSize: refFileSize,
        filePreview: refFilePreview,
        size: potSize,
        notes: customPotNotes
      };

      const payload = {
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerPhone: currentUser.phone,
        shopId: shop.id,
        shopName: shop.name,
        potName: `กระถางสั่งทำพิเศษ (${potSize === 'S' ? 'เล็ก' : potSize === 'M' ? 'กลาง' : 'ใหญ่'})`,
        price: totalEstimatedCost / potQuantity,
        quantity: potQuantity,
        status: 'pending',
        progress: 0,
        address: 'จัดส่งตามที่อยู่บัตรประชาชน: ' + currentUser.nationalId, // Default address note
        potDetails: potDetails
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setCustomOrderSent(true);
        // Reset custom fields
        setRefFileName('');
        setRefFileSize('');
        setRefFilePreview('');
        setCustomPotNotes('');
      } else {
        alert('เกิดข้อผิดพลาดในการส่งใบสั่งทำ');
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setOrderPlacing(false);
    }
  };

  // Handle Review Submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !contentInput.trim()) return;

    const attachedPot = selectedPresetPot 
      ? MOCK_POT_PRESETS.find(p => p.id === selectedPresetPot)?.url 
      : undefined;

    try {
      const response = await fetch(`/api/shops/${shop.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerName: nameInput,
          rating: ratingInput,
          content: contentInput,
          potImage: attachedPot
        })
      });

      if (response.ok) {
        const data = await response.json();
        setReviews((prev) => [data.review, ...prev]);
        onAddReview(shop.id, data.review);

        // Mascot reaction trigger
        const ratingComment = ratingInput === 5 
          ? 'ยอดเยี่ยมไปเลย! น้องมังกรถูกใจรีวิว 5 ดาวของคุณมากครับ 🐉💖' 
          : 'ขอบคุณสำหรับรีวิวนะครับ น้องมังกรจะนำคำแนะนำไปบอกหน้าร้านให้พัฒนาต่อครับ! 🧱✨';
          
        setSuccessMessage(ratingComment);
        setShowSuccessBubble(true);

        // Reset Form
        setNameInput('');
        setContentInput('');
        setSelectedPresetPot(null);
        setRatingInput(5);

        // Hide mascot message after 5 seconds
        setTimeout(() => {
          setShowSuccessBubble(false);
        }, 6000);
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกรีวิว');
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  const handleShare = () => {
    // Web Share API Mock
    const shareText = `ลองแวะดูร้าน "${shop.name}" ในโพธาราม แหล่งกระถางดินเผาและสวนในฝัน! นำทางได้เลยที่ PotPhot 🐉🗺️`;
    if (navigator.share) {
      navigator.share({
        title: shop.name,
        text: shareText,
        url: window.location.href,
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(`${shareText} - ${window.location.href}`);
      alert('คัดลอกลิงก์แชร์ร้านค้าไปยังคลิปบอร์ดแล้ว! 📋✨');
    }
  };

  const handleNavigate = () => {
    alert(`กำลังนำทางไปที่ "${shop.name}"\nพิกัด GPS: ${shop.address}\n\nน้องมังกรขอให้เดินทางปลอดภัยนะคร้าบ! 🚗🌱`);
  };

  return (
    <div className="shop-detail-overlay">
      <div className="shop-detail-panel">
        
        {/* Header Cover Photo Section */}
        <div className="panel-header-hero">
          <video
            src={shop.videoUrl}
            className="panel-hero-img"
            autoPlay
            loop
            muted
            playsInline
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
          <div className="panel-hero-overlay" />
          
          <button 
            className="panel-close-btn gamepad-focusable" 
            onClick={onClose}
            aria-label="Close panel"
          >
            <X size={22} />
          </button>

          <div className="panel-action-buttons">
            <button 
              className={`panel-action-btn gamepad-focusable ${isFavorite ? 'active' : ''}`}
              onClick={() => onToggleFavorite(shop.id)}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button 
              className="panel-action-btn gamepad-focusable" 
              onClick={handleShare}
              title="Share shop"
            >
              <Share2 size={20} />
            </button>
          </div>

          <div className="panel-header-title-box">
            <span className="panel-category-tag">{shop.categoryTh}</span>
            <h2 className="panel-title">{shop.name}</h2>
            <div className="panel-rating-row">
              <Star size={16} fill="currentColor" />
              <span>{shop.rating.toFixed(1)}</span>
              <span>•</span>
              <span>{shop.reviewCount} รีวิว</span>
              <span>•</span>
              <span>ห่าง {shop.distance}</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div 
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(30, 81, 40, 0.1)',
            background: 'var(--white)'
          }}
        >
          <button
            className="gamepad-focusable"
            onClick={() => {
              setActiveTab('info');
              setCustomOrderSent(false);
            }}
            style={{
              flex: 1,
              padding: '14px',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '14px',
              color: activeTab === 'info' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'info' ? '3px solid var(--primary-light)' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            ข้อมูลร้าน
          </button>
          <button
            className="gamepad-focusable"
            onClick={() => {
              setActiveTab('products');
              setCustomOrderSent(false);
              setOrderSuccess(false);
            }}
            style={{
              flex: 1.3,
              padding: '14px',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '14px',
              color: activeTab === 'products' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'products' ? '3px solid var(--primary-light)' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            เลือกซื้อกระถาง 🛍️
          </button>
          <button
            className="gamepad-focusable"
            onClick={() => {
              setActiveTab('custom');
              setCustomOrderSent(false);
            }}
            style={{
              flex: 1.2,
              padding: '14px',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '14px',
              color: activeTab === 'custom' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'custom' ? '3px solid var(--primary-light)' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <span>สั่งปั้นพิเศษ 🎨</span>
          </button>
          <button
            className="gamepad-focusable"
            onClick={() => {
              setActiveTab('reviews');
              setCustomOrderSent(false);
            }}
            style={{
              flex: 1,
              padding: '14px',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '14px',
              color: activeTab === 'reviews' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'reviews' ? '3px solid var(--primary-light)' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            รีวิว ({reviews.length})
          </button>
        </div>

        {/* Scrolling Content Panel */}
        <div className="panel-scroll-content">
          {activeTab === 'info' ? (
            <>
              {/* Shop Description */}
              <div>
                <p 
                  style={{ 
                    fontSize: '15px', 
                    lineHeight: 1.6, 
                    color: 'var(--text-dark)',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {shop.description}
                </p>
              </div>

              {/* Info Grid (Address, hours, phone, etc.) */}
              <div className="panel-info-grid">
                <div className="panel-info-card glass-panel">
                  <div className="panel-info-label">ที่อยู่ร้าน</div>
                  <div className="panel-info-value" style={{ fontSize: '13px', lineHeight: 1.4 }}>
                    <MapPin size={16} style={{ flexShrink: 0 }} />
                    <span>{shop.address.split(' (')[0]}</span>
                  </div>
                </div>

                <div className="panel-info-card glass-panel">
                  <div className="panel-info-label">เวลาเปิดทำการ</div>
                  <div className="panel-info-value" style={{ color: shop.isOpen ? 'var(--primary-light)' : 'var(--clay)' }}>
                    <Clock size={16} />
                    <span>{shop.openStatus.split(' • ')[1]}</span>
                  </div>
                </div>

                <div className="panel-info-card glass-panel" style={{ gridColumn: 'span 2' }}>
                  <div className="panel-info-label">ติดต่อสอบถาม</div>
                  <div className="panel-info-value">
                    <Phone size={16} />
                    <span>{shop.phone}</span>
                  </div>
                </div>

                {/* Big Navigate button */}
                <button className="premium-btn panel-nav-btn gamepad-focusable" onClick={handleNavigate} style={{ flex: 1 }}>
                  <Navigation size={18} fill="currentColor" />
                  <span>นำทางไปร้านนี้</span>
                </button>

                {/* Big Buy/Custom Order Button */}
                <button 
                  className="clay-btn panel-nav-btn gamepad-focusable" 
                  onClick={() => {
                    setActiveTab('custom');
                    setCustomOrderSent(false);
                  }}
                  style={{ 
                    flex: 1, 
                    background: 'linear-gradient(135deg, #E67E22, #D35400)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    borderRadius: '16px',
                    fontWeight: 800,
                    boxShadow: '0 6px 15px rgba(211,84,0,0.3)',
                    border: 'none',
                    cursor: 'pointer',
                    gridColumn: 'span 2',
                  }}
                >
                  <Sparkles size={18} />
                  <span>สั่งทำพิเศษ (ส่งภาพถ่าย / ไฟล์ 3D) 🏺</span>
                </button>
              </div>

              {/* Pot Gallery Section */}
              <div>
                <h3 className="panel-section-title">
                  <Sparkles size={16} className="star-input-btn active" />
                  <span>แกลเลอรีสินค้ากระถางยอดฮิต</span>
                </h3>
                <div className="pot-gallery-grid">
                  {shop.gallery.map((imgUrl, i) => (
                    <div 
                      key={i} 
                      className="gallery-item gamepad-focusable"
                      onClick={() => setSelectedPhoto(imgUrl)}
                      title="คลิกเพื่อขยายดูรูปกระถาง"
                    >
                      <img src={imgUrl} alt={`Pot Gallery ${i + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : activeTab === 'products' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {orderSuccess && (
                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderLeft: '5px solid #2E7D32', background: 'rgba(46,125,50,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2E7D32', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={20} />
                  </div>
                  <h4 style={{ margin: 0, color: '#2E7D32', fontWeight: 700 }}>ส่งใบสั่งซื้อสำเร็จ!</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dark)' }}>คำสั่งซื้อของคุณถูกส่งไปยังหน้าร้านเรียบร้อยแล้ว ติดตามความคืบหน้าได้ในบัญชีของคุณครับ 🐉✨</p>
                  <button onClick={() => setOrderSuccess(false)} style={{ marginTop: '8px', padding: '6px 12px', background: 'white', border: '1px solid #2E7D32', color: '#2E7D32', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    ซื้อกระถางชิ้นอื่นต่อ
                  </button>
                </div>
              )}

              {loadingProducts ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>กำลังโหลดรายการกระถางของทางร้าน...</div>
              ) : dbProducts.length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  📦 ขออภัย ร้านนี้ยังไม่ได้ลงรายการสินค้าไว้ในระบบครับ
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {dbProducts.map(p => (
                    <div key={p.id} className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center', opacity: p.stock === 0 ? 0.7 : 1 }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'rgba(0,0,0,0.05)', overflow: 'hidden', flexShrink: 0 }}>
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>🏺</div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>{p.name}</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)' }}>฿{p.price}</span>
                          <span style={{ fontSize: '11px', color: p.stock === 0 ? '#E63946' : 'var(--text-muted)' }}>สต็อก: {p.stock} ชิ้น</span>
                        </div>
                      </div>
                      <button 
                        disabled={p.stock === 0}
                        onClick={() => {
                          if (!currentUser) {
                            alert('กรุณาเข้าสู่ระบบเป็น "ลูกค้าทั่วไป" ก่อนสั่งซื้อครับ');
                            return;
                          }
                          setSelectedProductForOrder(p);
                          setCheckoutQuantity(1);
                        }}
                        style={{
                          padding: '8px 16px', borderRadius: '10px', border: 'none',
                          background: p.stock === 0 ? 'var(--text-muted)' : 'var(--primary)',
                          color: 'white', fontWeight: 700, fontSize: '12px', cursor: p.stock === 0 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {p.stock === 0 ? 'หมด' : 'สั่งซื้อ'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Checkout Popup Form */}
              {selectedProductForOrder && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                  <div className="glass-panel" style={{ width: '100%', maxWidth: '380px', background: 'white', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>ยืนยันใบสั่งซื้อกระถาง</h3>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '12px' }}>
                      <img src={selectedProductForOrder.imageUrl} alt={selectedProductForOrder.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>{selectedProductForOrder.name}</div>
                        <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px' }}>฿{selectedProductForOrder.price}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>จำนวนสินค้า (ใบ):</label>
                      <input 
                        type="number" min="1" max={selectedProductForOrder.stock}
                        value={checkoutQuantity} 
                        onChange={e => setCheckoutQuantity(Math.min(selectedProductForOrder.stock, Math.max(1, parseInt(e.target.value) || 1)))} 
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>ที่อยู่จัดส่ง:</label>
                      <textarea 
                        required
                        placeholder="กรุณากรอกที่อยู่ในการจัดส่งโดยละเอียด..."
                        value={shippingAddress} 
                        onChange={e => setShippingAddress(e.target.value)} 
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', height: '70px', resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #FFFDF6, #FFF8EC)', border: '1.5px dashed rgba(200,140,50,0.4)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#8E5431' }}>ยอดชำระปลายทาง:</span>
                      <span style={{ fontSize: '18px', fontWeight: 900, color: '#8E5431' }}>฿{(selectedProductForOrder.price * checkoutQuantity).toLocaleString()}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                      <button type="button" onClick={() => setSelectedProductForOrder(null)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'rgba(0,0,0,0.05)', color: 'var(--text-dark)', fontWeight: 600, cursor: 'pointer' }}>ยกเลิก</button>
                      <button type="button" onClick={handlePlaceOrder} disabled={orderPlacing} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}>
                        {orderPlacing ? 'กำลังสั่ง...' : 'ยืนยันสั่งซื้อ 🛒'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'custom' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="glass-panel" style={{ padding: '16px', borderLeft: '5px solid var(--primary-light)' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--primary)' }}>
                  🏺 สั่งซื้อและปั้นกระถางตามแบบของคุณ
                </h4>
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  คุณสามารถส่งรูปแบบสเก็ตช์ รูปถ่ายกระถางจริงที่อยากได้ หรืออัปโหลดไฟล์โมเดล 3 มิติ เพื่อส่งให้หน้าร้านนี้ขึ้นรูปแม่พิมพ์และอบเคลือบให้ตามต้องการ
                </p>
              </div>

              {customOrderSent ? (
                <div 
                  className="glass-panel" 
                  style={{ 
                    padding: '30px 20px', 
                    textAlign: 'center', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '12px',
                    animation: 'bounce-in 0.4s ease',
                  }}
                >
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    background: 'radial-gradient(circle, #81C784, #2E7D32)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', boxShadow: '0 6px 15px rgba(46,125,50,0.25)',
                  }}>
                    <Check size={32} />
                  </div>
                  <h5 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#2E7D32' }}>ส่งใบสั่งทำพิเศษเรียบร้อยแล้ว!</h5>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dark)', lineHeight: 1.5 }}>
                    ทางร้าน <strong>{shop.name}</strong> ได้รับข้อมูลไฟล์และแบบร่างของคุณแล้ว ช่างปั้นจะประเมินราคาพร้อมติดต่อกลับทางเบอร์โทรศัพท์มือถือภายใน 24 ชม.
                  </p>
                  <button 
                    onClick={() => setCustomOrderSent(false)} 
                    className="premium-btn"
                    style={{ padding: '8px 18px', fontSize: '12px', marginTop: '10px' }}
                  >
                    สั่งทำชิ้นใหม่อีกชิ้น
                  </button>
                </div>
              ) : (
                <form 
                  onSubmit={handlePlaceCustomCommission}
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  {/* Selector (Image vs 3D files) */}
                  <div style={{ display: 'flex', background: 'rgba(0,0,0,0.04)', borderRadius: '12px', padding: '3px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomPotType('image');
                        setRefFileName('');
                        setRefFilePreview('');
                      }}
                      style={{
                        flex: 1, padding: '10px', fontSize: '12px', fontWeight: 700, borderRadius: '9px', border: 'none',
                        background: customPotType === 'image' ? 'white' : 'transparent',
                        color: customPotType === 'image' ? 'var(--primary)' : 'var(--text-muted)',
                        boxShadow: customPotType === 'image' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      🖼️ ส่งรูปถ่าย / ภาพสเก็ตช์
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomPotType('3d');
                        setRefFileName('');
                        setRefFilePreview('');
                      }}
                      style={{
                        flex: 1, padding: '10px', fontSize: '12px', fontWeight: 700, borderRadius: '9px', border: 'none',
                        background: customPotType === '3d' ? 'white' : 'transparent',
                        color: customPotType === '3d' ? 'var(--primary)' : 'var(--text-muted)',
                        boxShadow: customPotType === '3d' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      📐 ส่งไฟล์โมเดล 3D (.STL/.OBJ)
                    </button>
                  </div>

                  {/* Drag and Drop File Upload Area */}
                  <div 
                    onClick={() => {
                      if (customPotType === 'image') {
                        setRefFileName('sketch_thai_vintage_pot.png');
                        setRefFileSize('2.4 MB');
                        setRefFilePreview('https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=300&auto=format&fit=crop&q=60');
                      } else {
                        setRefFileName('pottery_3d_polygon.stl');
                        setRefFileSize('18.5 MB');
                        setRefFilePreview('');
                      }
                    }}
                    style={{
                      border: '2px dashed rgba(30,81,40,0.25)',
                      borderRadius: '16px',
                      padding: '24px 16px',
                      textAlign: 'center',
                      background: 'rgba(30,81,40,0.01)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                    }}
                    className="gamepad-focusable"
                  >
                    <div style={{
                      width: '46px', height: '46px', borderRadius: '50%',
                      background: 'rgba(30,81,40,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--primary-light)',
                    }}>
                      <Image size={22} />
                    </div>
                    {refFileName ? (
                      <div style={{ width: '100%' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>{refFileName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ขนาด: {refFileSize} • อัปโหลดแล้ว 100%</div>
                        {refFilePreview && (
                          <img 
                            src={refFilePreview} 
                            alt="Uploaded preview" 
                            style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', marginTop: '10px', border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} 
                          />
                        )}
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRefFileName('');
                            setRefFileSize('');
                            setRefFilePreview('');
                          }}
                          style={{
                            marginTop: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, borderRadius: '8px',
                            border: '1px solid rgba(220,50,50,0.2)', background: '#FFF5F5', color: '#C0392B', cursor: 'pointer',
                          }}
                        >
                          ลบไฟล์ออก
                        </button>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)' }}>
                          {customPotType === 'image' ? 'แตะที่นี่เพื่อเลือกภาพถ่าย / สเก็ตช์' : 'แตะที่นี่เพื่อเลือกไฟล์ 3D (.STL, .OBJ, .GLB)'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          ลากและวางไฟล์ที่นี่ หรือแตะเพื่อเลือกหาไฟล์ในมือถือ/คอมพิวเตอร์
                        </div>
                      </>
                    )}
                  </div>

                  {/* Size selector & Quantity */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>ขนาดกระถาง:</label>
                      <select 
                        value={potSize} 
                        onChange={(e) => setPotSize(e.target.value as any)}
                        style={{
                          width: '100%', height: '42px', borderRadius: '12px', border: '1.5px solid rgba(30,81,40,0.15)',
                          padding: '0 10px', fontSize: '13px', background: 'white', color: 'var(--primary)',
                        }}
                      >
                        <option value="S">ขนาดเล็ก S (กว้าง 4-5 นิ้ว)</option>
                        <option value="M">ขนาดกลาง M (กว้าง 7-8 นิ้ว)</option>
                        <option value="L">ขนาดใหญ่ L (กว้าง 10-12 นิ้ว)</option>
                      </select>
                    </div>

                    <div style={{ width: '100px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>จำนวนปั้น (ใบ):</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="50" 
                        value={potQuantity}
                        onChange={(e) => setPotQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        style={{
                          width: '100%', height: '42px', borderRadius: '12px', border: '1.5px solid rgba(30,81,40,0.15)',
                          padding: '0 10px', fontSize: '13px', textAlign: 'center', color: 'var(--primary)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Special detail notes */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>รายละเอียดเพิ่มเติม:</label>
                    <textarea
                      placeholder="เช่น ต้องการให้สลักชื่อด้านข้างกระถาง, เคลือบสีน้ำตาลอมส้มกึ่งเงากึ่งด้าน, หรือเพิ่มขอบรูระบายน้ำที่ก้นพิเศษ..."
                      value={customPotNotes}
                      onChange={(e) => setCustomPotNotes(e.target.value)}
                      style={{
                        width: '100%', height: '80px', borderRadius: '12px', border: '1.5px solid rgba(30,81,40,0.15)',
                        padding: '10px 12px', fontSize: '13px', fontFamily: 'inherit', outline: 'none',
                      }}
                    />
                  </div>

                  {/* Estimate pricing card */}
                  <div style={{
                    background: 'linear-gradient(135deg, #FFFDF6, #FFF8EC)',
                    border: '1.5px dashed rgba(200,140,50,0.4)',
                    borderRadius: '14px',
                    padding: '14px',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#8E5431', marginBottom: '6px' }}>💰 ประเมินราคาคร่าวๆ สำหรับงานสั่งผลิต</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' }}>
                      <span style={{ color: '#5C6E60' }}>ค่าปั้นขึ้นรูปเดี่ยว ขนาด {potSize} (x{potQuantity} ใบ)</span>
                      <span style={{ fontWeight: 700 }}>฿{((potSize === 'S' ? 250 : potSize === 'M' ? 400 : 650) * potQuantity).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' }}>
                      <span style={{ color: '#5C6E60' }}>ค่าแกะบล็อก / ทำพิมพ์ขึ้นลวดลายพิเศษ</span>
                      <span style={{ fontWeight: 700 }}>{customPotType === '3d' ? '฿0 (มีไฟล์ 3D ให้ร้าน)' : '฿180'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(200,140,50,0.1)' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E5128' }}>รวมประมาณการขั้นต้น</span>
                      <span style={{ fontSize: '18px', fontWeight: 900, color: '#8E5431' }}>
                        ฿{(((potSize === 'S' ? 250 : potSize === 'M' ? 400 : 650) * potQuantity) + (customPotType === '3d' ? 0 : 180)).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Submit button */}
                  <button 
                    type="submit" 
                    className="clay-btn gamepad-focusable"
                    style={{
                      width: '100%', padding: '14px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                      background: 'linear-gradient(135deg, #1E5128, #4E9F3D)', color: 'white', fontWeight: 800, fontSize: '14px',
                      boxShadow: '0 6px 15px rgba(30,81,40,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    }}
                  >
                    ส่งความต้องการสั่งทำพิเศษ 🚀
                  </button>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Community Reviews Section */}
              <div className="reviews-container">
                <h3 className="panel-section-title">
                  <MessageCircle size={18} />
                  <span>รีวิวและรูปกระถางจากคอมมูนิตี้</span>
                </h3>
                
                {loadingReviews ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '20px 0' }}>
                    กำลังโหลดรีวิว... ⏳
                  </p>
                ) : reviews.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '20px 0' }}>
                    ยังไม่มีรีวิวสำหรับร้านนี้ มาร่วมเป็นคนแรกที่รีวิวกันเถอะ! 🌱
                  </p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="review-item glass-panel">
                      <div className="review-item-header">
                        <span className="reviewer-name">{review.reviewerName}</span>
                        <span className="review-date">{review.date}</span>
                      </div>
                      <div className="reviewer-rating">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            fill={i < review.rating ? 'currentColor' : 'none'} 
                            style={{marginRight: 2}}
                          />
                        ))}
                      </div>
                      <p className="review-content">{review.content}</p>
                      
                      {review.potImage && (
                        <div style={{ marginTop: '10px' }}>
                          <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--clay)', marginBottom: '4px' }}>
                            📸 กระถางที่แชร์ในรีวิว:
                          </div>
                          <img 
                            src={review.potImage} 
                            alt="Pot Attachment" 
                            className="review-image-attachment"
                            onClick={() => setSelectedPhoto(review.potImage || null)}
                            style={{ cursor: 'pointer' }}
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add New Review Form */}
              <form className="add-review-form" onSubmit={handleSubmitReview}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} className="star-input-btn active" />
                  <span>เขียนรีวิว & อัปโหลดกระถางโปรดของคุณ</span>
                </div>

                {/* Rating Input */}
                <div className="form-rating-selector">
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>ให้คะแนนร้าน:</span>
                  <div style={{ display: 'flex' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-input-btn gamepad-focusable ${star <= ratingInput ? 'active' : ''}`}
                        onClick={() => setRatingInput(star)}
                      >
                        <Star size={22} fill={star <= ratingInput ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="ชื่อเล่น / ชื่อของคุณ"
                    className="form-textarea gamepad-focusable"
                    style={{ height: '40px', padding: '0 12px' }}
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    required
                  />
                  <textarea
                    placeholder="แบ่งปันประสบการณ์ของคุณกับกระถางของร้านนี้ เช่น การบริการ การออกแบบ ลวดลายกระถาง..."
                    className="form-textarea gamepad-focusable"
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                    required
                  />
                </div>

                {/* Preset Pot Upload Selection */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    <Image size={15} />
                    <span>เลือกกระถางที่ซื้อมาโพสต์ (อัปโหลดจำลอง):</span>
                  </div>
                  <div className="upload-preset-gallery">
                    {MOCK_POT_PRESETS.map((preset) => (
                      <img
                        key={preset.id}
                        src={preset.url}
                        alt={preset.name}
                        title={preset.name}
                        className={`preset-thumbnail gamepad-focusable ${selectedPresetPot === preset.id ? 'selected' : ''}`}
                        onClick={() => setSelectedPresetPot(
                          selectedPresetPot === preset.id ? null : preset.id
                        )}
                      />
                    ))}
                  </div>
                  {selectedPresetPot && (
                    <div style={{ fontSize: '11px', color: 'var(--primary-light)', fontWeight: 600, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Check size={12} />
                      <span>แนบรูป "{MOCK_POT_PRESETS.find(p => p.id === selectedPresetPot)?.name}" แล้ว</span>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button type="submit" className="clay-btn submit-review-btn gamepad-focusable">
                  <span>ส่งรีวิวให้ชาวสวนคนอื่นอ่าน ✨</span>
                </button>
              </form>
            </>
          )}
        </div>

        {/* Mascot Success Bubble overlay */}
        {showSuccessBubble && (
          <div 
            className="glass-panel"
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              padding: '16px',
              borderRadius: '20px',
              border: '2px solid var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              zIndex: 10,
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              background: 'rgba(255, 255, 255, 0.95)',
              animation: 'bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            <img 
              src="/mascot.png" 
              alt="Mascot Congrats" 
              style={{ width: '48px', height: '48px', objectFit: 'contain' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} className="star-input-btn active" />
                <span>แต้มสะสมสวนขึ้นแล้ว! (+10 แต้ม)</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dark)', marginTop: '2px', lineHeight: '1.4' }}>
                {successMessage}
              </div>
            </div>
            <button 
              onClick={() => setShowSuccessBubble(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Full Photo Viewer Modal */}
      {selectedPhoto && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out'
          }}
          onClick={() => setSelectedPhoto(null)}
        >
          <img 
            src={selectedPhoto} 
            alt="Expanded view" 
            style={{ 
              maxWidth: '90%', 
              maxHeight: '90%', 
              objectFit: 'contain', 
              borderRadius: '8px',
              border: '4px solid var(--white)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }} 
          />
          <button 
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              background: 'var(--white)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}
            onClick={() => setSelectedPhoto(null)}
          >
            <X size={24} />
          </button>
        </div>
      )}

    </div>
  );
};
