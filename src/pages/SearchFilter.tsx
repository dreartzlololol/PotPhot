import React from 'react';
import { SlidersHorizontal, MapPin, Filter, Trash2, ArrowRight } from 'lucide-react';

export interface FilterState {
  distance: number;
  materials: string[];
  isOpenNow: boolean;
  hasWorkshop: boolean;
  priceRanges: string[];
  sortBy: 'rating' | 'distance' | 'reviews';
}

interface SearchFilterProps {
  filters: FilterState;
  onUpdateFilters: (filters: FilterState) => void;
  onApply: () => void;
}

const MATERIALS = [
  { id: 'terracotta', label: 'ดินอิฐส้มธรรมชาติ 🧱' },
  { id: 'glazed', label: 'เซรามิกเคลือบเงา 🏺' },
  { id: 'dragon-drawn', label: 'ปั้นลายมังกรทอง 🐉' },
  { id: 'bonsai-pot', label: 'กระถางบอนไซจิ๋ว 🌳' },
];

const PRICE_RANGES = [
  { id: 'budget', label: 'ราคาประหยัด (เริ่มต้น 20-50฿)' },
  { id: 'medium', label: 'ราคาปานกลาง (แต่งบ้าน/คาเฟ่)' },
  { id: 'collector', label: 'เกรดสะสมโบราณ (งานประณีต)' },
];

const SORT_OPTIONS = [
  { id: 'rating', label: 'คะแนนรีวิวสูงสุด ⭐' },
  { id: 'distance', label: 'ระยะทางใกล้ที่สุด 📍' },
  { id: 'reviews', label: 'รีวิวเยอะที่สุด 💬' },
];

export const SearchFilter: React.FC<SearchFilterProps> = ({
  filters,
  onUpdateFilters,
  onApply,
}) => {
  const handleSortChange = (sortBy: 'rating' | 'distance' | 'reviews') => {
    onUpdateFilters({ ...filters, sortBy });
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateFilters({ ...filters, distance: parseFloat(e.target.value) });
  };

  const handleMaterialToggle = (materialId: string) => {
    const isSelected = filters.materials.includes(materialId);
    const newMaterials = isSelected
      ? filters.materials.filter((m) => m !== materialId)
      : [...filters.materials, materialId];
    onUpdateFilters({ ...filters, materials: newMaterials });
  };

  const handlePriceToggle = (priceId: string) => {
    const isSelected = filters.priceRanges.includes(priceId);
    const newPrices = isSelected
      ? filters.priceRanges.filter((p) => p !== priceId)
      : [...filters.priceRanges, priceId];
    onUpdateFilters({ ...filters, priceRanges: newPrices });
  };

  const handleReset = () => {
    onUpdateFilters({
      distance: 10,
      materials: [],
      isOpenNow: false,
      hasWorkshop: false,
      priceRanges: [],
      sortBy: 'rating',
    });
  };

  return (
    <div 
      className="tab-page-container"
      style={{
        padding: '24px 24px 100px 24px',
        maxWidth: '680px',
        margin: '0 auto',
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        overflowY: 'auto',
      }}
    >
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={24} />
          <span>ตัวกรองขั้นสูง</span>
        </h2>
        <button 
          className="gamepad-focusable"
          onClick={handleReset}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--clay)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Trash2 size={16} />
          <span>ล้างตัวกรอง</span>
        </button>
      </div>

      {/* Sorting */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary)' }}>จัดเรียงร้านค้าตาม</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`category-chip gamepad-focusable ${filters.sortBy === opt.id ? 'active' : ''}`}
              onClick={() => handleSortChange(opt.id as 'rating' | 'distance' | 'reviews')}
              style={{ padding: '10px 16px', fontSize: '13px' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Distance Slider */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '15px', color: 'var(--primary)' }}>
          <span>ระยะทางสูงสุด</span>
          <span style={{ color: 'var(--clay-light)' }}>{filters.distance} กม.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MapPin size={18} style={{ color: 'var(--primary-light)' }} />
          <input
            type="range"
            className="gamepad-focusable"
            min="1"
            max="15"
            step="0.5"
            value={filters.distance}
            onChange={handleDistanceChange}
            style={{
              flex: 1,
              height: '6px',
              borderRadius: '3px',
              outline: 'none',
              background: 'var(--primary-glow-strong)',
              accentColor: 'var(--primary-light)',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>

      {/* Materials Selection */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary)' }}>ลวดลาย & วัสดุกระถาง</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {MATERIALS.map((mat) => {
            const isSelected = filters.materials.includes(mat.id);
            return (
              <div
                key={mat.id}
                className="gamepad-focusable"
                onClick={() => handleMaterialToggle(mat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid var(--primary-light)' : '1px solid rgba(30, 81, 40, 0.1)',
                  background: isSelected ? 'var(--primary-glow)' : 'var(--white)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                <div 
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '6px',
                    border: '2px solid var(--primary-light)',
                    marginRight: '12px',
                    background: isSelected ? 'var(--primary-light)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '10px'
                  }}
                >
                  {isSelected && '✓'}
                </div>
                <span>{mat.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Opening & Workshop Switch */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary)' }}>ตัวเลือกพิเศษ</div>
        
        {/* Open Now Toggle */}
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>เปิดบริการอยู่ตอนนี้ ⏰</span>
          <input
            type="checkbox"
            checked={filters.isOpenNow}
            onChange={(e) => onUpdateFilters({ ...filters, isOpenNow: e.target.checked })}
            style={{
              width: '44px',
              height: '24px',
              appearance: 'none',
              backgroundColor: filters.isOpenNow ? 'var(--primary-light)' : 'var(--text-muted)',
              borderRadius: '12px',
              position: 'relative',
              outline: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            className="filter-toggle-switch gamepad-focusable"
          />
        </label>

        {/* Workshop Toggle */}
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderTop: '1px solid rgba(30, 81, 40, 0.06)', paddingTop: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>มีสอนปั้นดินเผา / เวิร์กชอป 🎨</span>
          <input
            type="checkbox"
            checked={filters.hasWorkshop}
            onChange={(e) => onUpdateFilters({ ...filters, hasWorkshop: e.target.checked })}
            style={{
              width: '44px',
              height: '24px',
              appearance: 'none',
              backgroundColor: filters.hasWorkshop ? 'var(--primary-light)' : 'var(--text-muted)',
              borderRadius: '12px',
              position: 'relative',
              outline: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            className="filter-toggle-switch gamepad-focusable"
          />
        </label>
      </div>

      {/* Price Ranges */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary)' }}>ระดับราคาหลัก</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {PRICE_RANGES.map((price) => {
            const isSelected = filters.priceRanges.includes(price.id);
            return (
              <div
                key={price.id}
                className="gamepad-focusable"
                onClick={() => handlePriceToggle(price.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid var(--primary-light)' : '1px solid rgba(30, 81, 40, 0.1)',
                  background: isSelected ? 'var(--primary-glow)' : 'var(--white)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                <div 
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '6px',
                    border: '2px solid var(--primary-light)',
                    marginRight: '12px',
                    background: isSelected ? 'var(--primary-light)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '10px'
                  }}
                >
                  {isSelected && '✓'}
                </div>
                <span>{price.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <button 
        className="premium-btn gamepad-focusable" 
        onClick={onApply}
        style={{
          width: '100%',
          height: '52px',
          justifyContent: 'center',
          fontSize: '15px',
          marginTop: '12px',
          marginBottom: '12px',
          boxShadow: 'var(--glow-green)'
        }}
      >
        <Filter size={16} />
        <span>ประมวลผลตัวกรอง ({SORT_OPTIONS.find(o=>o.id===filters.sortBy)?.label.split(' ')[0]})</span>
        <ArrowRight size={16} />
      </button>

    </div>
  );
};
