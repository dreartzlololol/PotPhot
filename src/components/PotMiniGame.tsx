import React, { useState } from 'react';
import { Flame, ShoppingCart, RotateCcw, ChevronLeft, ChevronRight, UploadCloud, Trash2 } from 'lucide-react';
import type { CustomPot } from '../pages/PotCollection';
import { ThreeModelViewer, getDecalSVGDataURL } from './ThreeModelViewer';
import { TetrisGame } from './TetrisGame';
import ReactDOM from 'react-dom';



// ─── Data ────────────────────────────────────────────────────────────────────

const SHAPES = [
  { id: 'round',    label: 'ทรงกลมอ้วน',   emoji: '🏺', desc: '฿80+',  borderRadius: '50% 50% 44% 44% / 44% 44% 50% 50%', rimScale: 1.0 },
  { id: 'tall',     label: 'ทรงสูงเพรียว',  emoji: '🪴', desc: '฿90+',  borderRadius: '15% 15% 35% 35% / 10% 10% 40% 40%', rimScale: 1.0 },
  { id: 'wide',     label: 'ทรงปากกว้าง',  emoji: '🪣', desc: '฿100+', borderRadius: '48% 48% 38% 38% / 26% 26% 48% 48%', rimScale: 1.2 },
  { id: 'octagon',  label: 'ทรงแปดเหลี่ยม', emoji: '💎', desc: '฿150+', borderRadius: '20%',                                rimScale: 0.9 },
];

const CLAY_TYPES = [
  { id: 'terracotta', label: 'ดินเผา', emoji: '🟤', baseCost: 80,  gradient: 'radial-gradient(circle at 28% 28%, #E8A070, #CD853F 50%, #8B5A2B)' },
  { id: 'stoneware',  label: 'ดินหิน', emoji: '⚫', baseCost: 150, gradient: 'radial-gradient(circle at 28% 28%, #9E9E9E, #616161 50%, #37474F)' },
  { id: 'porcelain',  label: 'กระเบื้อง', emoji: '⚪', baseCost: 250, gradient: 'radial-gradient(circle at 28% 28%, #FAFAFA, #E0E0E0 50%, #BDBDBD)' },
  { id: 'raku',       label: 'ดินราคุ',  emoji: '🔶', baseCost: 320, gradient: 'radial-gradient(circle at 28% 28%, #FFB74D, #E65100 50%, #8D2200)' },
];

const GLAZES = [
  { id: 'none',       label: 'ไม่เคลือบ', color: 'transparent', cost: 0 },
  { id: 'amber',      label: 'อำพัน',    color: 'rgba(255, 180, 50, 0.55)',  cost: 60 },
  { id: 'cobalt',     label: 'โคบอลท์',  color: 'rgba(25, 80, 200, 0.50)',   cost: 80 },
  { id: 'emerald',    label: 'มรกต',     color: 'rgba(20, 140, 80, 0.55)',   cost: 90 },
  { id: 'ruby',       label: 'ทับทิม',   color: 'rgba(200, 30, 60, 0.50)',   cost: 100 },
  { id: 'smoke',      label: 'ควันไฟ',   color: 'rgba(60, 60, 60, 0.45)',    cost: 70 },
  { id: 'pearl',      label: 'มุก',       color: 'rgba(220, 240, 255, 0.60)', cost: 120 },
  { id: 'gold',       label: 'ทอง',      color: 'rgba(255, 210, 0, 0.55)',   cost: 150 },
];

const DECORATIONS = [
  // Rim decals
  { id: 'rim-gold',     zone: 'body', emoji: '✨', label: 'ขอบทอง',       cost: 80 },
  { id: 'rim-dots',     zone: 'rim',  emoji: '⚪', label: 'ขอบจุดมุก',    cost: 60 },
  { id: 'rim-wave',     zone: 'rim',  emoji: '〰️', label: 'ขอบคลื่น',     cost: 50 },
  { id: 'rim-meander',  zone: 'rim',  emoji: '🏛️', label: 'ขอบลายกรีก',   cost: 70 },
  { id: 'rim-bead-gold',zone: 'rim',  emoji: '🟡', label: 'ขอบลูกปัดทอง', cost: 90 },
  // Body decals (no longer emojis, rendered as high-end vector graphics)
  { id: 'body-dragon',  zone: 'body', emoji: '🐉', label: 'มังกรโบราณ',   cost: 200 },
  { id: 'body-lotus',   zone: 'body', emoji: '🪷', label: 'สัตตบงกช',     cost: 120 },
  { id: 'body-phoenix', zone: 'body', emoji: '🦅', label: 'หงส์เหิน',       cost: 180 },
  { id: 'body-bamboo',  zone: 'body', emoji: '🎋', label: 'กอไผ่คราม',     cost: 90 },
  { id: 'body-star',    zone: 'body', emoji: '⭐', label: 'ประจำยามทอง',  cost: 70 },
  { id: 'body-benjarong', zone: 'body', emoji: '🏵️', label: 'เบญจรงค์',    cost: 250 },
  { id: 'body-kranok-flame', zone: 'body', emoji: '🔥', label: 'ลายกนก',    cost: 150 },
  { id: 'body-koi-pair', zone: 'body', emoji: '🐟', label: 'ปลาคาร์ฟคู่',   cost: 140 },
  { id: 'body-crane-clouds', zone: 'body', emoji: '🕊️', label: 'นกกระเรียน', cost: 160 },
  { id: 'body-cherry-blossom', zone: 'body', emoji: '🌸', label: 'ซากุระ',   cost: 110 },
  // Base decals
  { id: 'base-cloud',   zone: 'base', emoji: '☁️', label: 'เมฆลอย',       cost: 80 },
  { id: 'base-ring',    zone: 'base', emoji: '⭕', label: 'ฐานขอบทอง',    cost: 60 },
  { id: 'base-flame',   zone: 'base', emoji: '🔥', label: 'ลายกนกเปลว',   cost: 90 },
  { id: 'base-water-wave', zone: 'base', emoji: '🌊', label: 'ฐานเกลียวคลื่น', cost: 75 },
];

const CATEGORIES = [
  { id: 'shape', label: 'ทรง / รูปฟอร์ม',   icon: '🏺' },
  { id: 'clay',  label: 'เนื้อดินปั้น',   icon: '🧱' },
  { id: 'glaze', label: 'เคลือบสี', icon: '✨' },
  { id: 'decal', label: 'ลวดลายรอบใบ', icon: '🎨' },
  { id: 'effects', label: 'พื้นผิว / หมุน', icon: '💫' }
];

export interface EquippedDecal {
  id: string;
  decalId: string;
  emoji?: string;
  url?: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  isWrap?: boolean;
}

export interface StrokePoint { x: number; y: number; }
export interface DrawingStroke {
  points: StrokePoint[];
  color: string;
  size: number;
}

// ─── Custom SVG Decal Graphics Component ───────────────────────────────────────

export const DecalGraphic: React.FC<{ decalId: string; size?: number }> = ({ decalId, size = 64 }) => {
  if (decalId === 'body-dragon') {
    return (
      <img 
        src="/chinese_dragon_pattern.png" 
        alt="Dragon Decal" 
        style={{ width: size, height: size, objectFit: 'contain', pointerEvents: 'none' }} 
      />
    );
  }
  return (
    <img 
      src={getDecalSVGDataURL(decalId)} 
      alt="Decal" 
      style={{ width: size, height: size, objectFit: 'contain', pointerEvents: 'none' }} 
    />
  );
};




// ─── Item Card Component ──────────────────────────────────────────────────────

const DressUpItem: React.FC<{
  emoji?: string;
  label: string;
  desc?: string;
  isSelected: boolean;
  onClick: () => void;
  swatch?: string;
  decalId?: string;
}> = ({ emoji, label, desc, isSelected, onClick, swatch, decalId }) => {
  const lastClickRef = React.useRef<number>(0);

  const handleClick = (e: React.SyntheticEvent) => {
    const now = Date.now();
    if (now - lastClickRef.current < 200) {
      e.preventDefault();
      return;
    }
    lastClickRef.current = now;
    onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
    style={{
      width: '72px', minHeight: '84px',
      padding: '8px 4px', borderRadius: '16px', cursor: 'pointer',
      border: isSelected ? '2.5px solid #4E9F3D' : '1.5px solid rgba(30,81,40,0.08)',
      background: isSelected
        ? 'linear-gradient(135deg, rgba(78,159,61,0.15), rgba(78,159,61,0.05))'
        : 'rgba(255,255,255,0.9)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '4px', textAlign: 'center',
      transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      boxShadow: isSelected
        ? '0 4px 16px rgba(78,159,61,0.25), 0 0 0 2px rgba(78,159,61,0.1)'
        : '0 2px 8px rgba(0,0,0,0.04)',
      transform: isSelected ? 'scale(1.08)' : 'scale(1)',
      position: 'relative',
    }}
  >
    {isSelected && (
      <div style={{
        position: 'absolute', top: '-4px', right: '-4px',
        width: '18px', height: '18px', borderRadius: '50%',
        background: '#4E9F3D', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '10px', fontWeight: 800,
        boxShadow: '0 2px 4px rgba(30,81,40,0.3)',
      }}>
        ✓
      </div>
    )}

    {swatch ? (
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        background: swatch,
        border: isSelected ? '2.5px solid #4E9F3D' : '2px solid rgba(0,0,0,0.08)',
        boxShadow: isSelected ? '0 0 0 3px rgba(78,159,61,0.2)' : 'none',
        flexShrink: 0,
      }} />
    ) : decalId ? (
      <div style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <DecalGraphic decalId={decalId} size={36} />
      </div>
    ) : (
      <span style={{ fontSize: '26px', lineHeight: 1 }}>{emoji}</span>
    )}
    <div style={{ fontSize: '10px', fontWeight: 700, color: isSelected ? '#1E5128' : '#2C3E30', lineHeight: 1.2 }}>
      {label}
    </div>
    {desc && (
      <div style={{ fontSize: '9px', color: '#8E5431', fontWeight: 600 }}>{desc}</div>
    )}
  </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface PotMiniGameProps {
  onComplete: (pot: CustomPot, cost: number) => void;
  onCancel: () => void;
}

export const PotMiniGame: React.FC<PotMiniGameProps> = ({ onComplete, onCancel }) => {
  const [activeCategory, setActiveCategory] = useState('shape');
  const [shapeId,     setShapeId]     = useState('round');
  const [clayId,      setClayId]      = useState('terracotta');
  const [glazeId,     setGlazeId]     = useState('none');
  const [decorations, setDecorations] = useState<Set<string>>(new Set());
  const [potName,     setPotName]     = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [showTetris,  setShowTetris]  = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  React.useEffect(() => {
    requestAnimationFrame(() => {
      setIsMounted(true);
    });
  }, []);

  const triggerExit = (callback: () => void) => {
    setIsExiting(true);
    setTimeout(() => {
      callback();
    }, 400);
  };

  // Sculpting States (pot dimensions & scale)
  const [potWidth, setPotWidth] = useState(160);
  const [potHeight, setPotHeight] = useState(180);
  const [rimScale, setRimScale] = useState(1.0);
  const [baseScale, setBaseScale] = useState(1.0);
  const [potScale, setPotScale] = useState(1.0);
  const [referenceObject, setReferenceObject] = useState<'none' | 'iphone' | 'can' | 'coin'>('none');
  const [refObjectX, setRefObjectX] = useState(0);
  const [refObjectZ, setRefObjectZ] = useState(0);
  const [refObjectRotation, setRefObjectRotation] = useState(0);
  const [showAxes, setShowAxes] = useState(true);

  // Real-time Dimension Calculations
  const realDiameterCm = ((potWidth / 15) * potScale).toFixed(1);
  const realDiameterInch = (((potWidth / 15) * potScale) / 2.54).toFixed(1);
  const realHeightCm = ((potHeight / 10) * potScale).toFixed(1);
  const realHeightInch = (((potHeight / 10) * potScale) / 2.54).toFixed(1);
  const estimatedVolumeLiters = (((Math.PI * Math.pow((potWidth / 30) * potScale, 2) * ((potHeight / 10) * potScale))) / 1000).toFixed(1);

  // Custom Colors States (Dual gradient clay mix)
  const [useCustomClayColor, setUseCustomClayColor] = useState(false);
  const [clayColor1, setClayColor1] = useState('#E8A070');
  const [clayColor2, setClayColor2] = useState('#CD853F');
  const [clayGrainLevel, setClayGrainLevel] = useState(30);

  // Custom Glaze color & properties (transparency, gloss, metal shine)
  const [useCustomGlazeColor, setUseCustomGlazeColor] = useState(false);
  const [customGlazeColor, setUseCustomGlazeColorValue] = useState('#1E5128');
  const [glazeOpacity, setGlazeOpacity] = useState(60);
  const [glazeGlossyLevel, setGlazeGlossyLevel] = useState(80);
  const [glazeMetallicLevel, setGlazeMetallicLevel] = useState(20);

  // Finish Texture & Rotation Speed
  const [finishType, setFinishType] = useState<'matte' | 'glossy' | 'crackled'>('glossy');
  const [spinSpeed, setSpinSpeed] = useState(12);

  // Equipped Decals state for individual layout adjustments
  const [equippedDecals, setEquippedDecals] = useState<EquippedDecal[]>([]);
  const [selectedDecalId, setSelectedDecalId] = useState<string | null>(null);

  // Custom Text Engraving
  const [engravedText, setEngravedText] = useState('');
  const [engravingColor, setEngravingColor] = useState('#FFFFFF');

  const [custom3DFileData, setCustom3DFileData] = useState<string | null>(null);
  const [custom3DFileType, setCustom3DFileType] = useState<'stl' | 'obj' | null>(null);

  // Drawing Mode
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [brushColor, setBrushColor] = useState('#D84315');
  const [brushSize, setBrushSize] = useState(4);
  const [drawingPaths, setDrawingPaths] = useState<DrawingStroke[]>([]);

  const shape = SHAPES.find(s => s.id === shapeId) || SHAPES[0];
  const clay  = CLAY_TYPES.find(c => c.id === clayId)!;
  const glaze = GLAZES.find(g => g.id === glazeId)!;

  // Cost calculation
  const decCost = equippedDecals.reduce((sum, d) => {
    if (d.decalId === 'custom-upload') return sum + 150;
    const decItem = DECORATIONS.find(x => x.id === d.decalId);
    return sum + (decItem?.cost ?? 60);
  }, 0);
  const baseDecCost = [...decorations].reduce((sum, id) => sum + (DECORATIONS.find(d => d.id === id)?.cost ?? 0), 0);

  const customClayCost = useCustomClayColor ? 100 : 0;
  const customGlazeCost = useCustomGlazeColor ? 120 : 0;
  const customTextCost = engravedText ? 50 : 0;
  
  const totalCost = clay.baseCost + glaze.cost + decCost + baseDecCost + customClayCost + customGlazeCost + customTextCost + 80;

  const handleShapeSelect = (sId: string) => {
    setShapeId(sId);
    setBaseScale(1.0);
    if (sId === 'wide') {
      setPotWidth(180);
      setPotHeight(140);
      setRimScale(1.2);
    } else if (sId === 'tall') {
      setPotWidth(120);
      setPotHeight(220);
      setRimScale(0.8);
    } else if (sId === 'round') {
      setPotWidth(160);
      setPotHeight(180);
      setRimScale(1.0);
    } else { // octagon
      setPotWidth(150);
      setPotHeight(160);
      setRimScale(0.9);
    }
  };

  const lastDecalAddedTimeRef = React.useRef<number>(0);

  // Add a new decal to the active list (with 350ms anti-double-trigger guard)
  const addDecalInstance = (decalId: string, emoji?: string, url?: string) => {
    const now = Date.now();
    if (now - lastDecalAddedTimeRef.current < 350) {
      return; // Reject duplicate trigger within 350ms window
    }
    lastDecalAddedTimeRef.current = now;

    const newDec: EquippedDecal = {
      id: `dec-${now}-${Math.random().toString(36).substr(2, 5)}`,
      decalId,
      emoji,
      url,
      x: 0,
      y: 0,
      scale: decalId === 'body-benjarong' ? 1.5 : 1.0,
      rotation: 0,
      isWrap: decalId === 'body-benjarong'
    };
    setEquippedDecals(prev => [...prev, newDec]);
    setSelectedDecalId(newDec.id);
  };

  const handleDecalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('ขนาดรูปภาพต้องไม่เกิน 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        addDecalInstance('custom-upload', undefined, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handle3DModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'stl' && ext !== 'obj') {
        alert('กรุณาอัปโหลดไฟล์นามสกุล .stl หรือ .obj เท่านั้น');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        alert('ขนาดไฟล์โมเดล 3D ต้องไม่เกิน 20MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustom3DFileData(reader.result as string);
        setCustom3DFileType(ext as 'stl' | 'obj');
        setShapeId('custom3d');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTrayDecalClick = (id: string) => {
    const decSpec = DECORATIONS.find(d => d.id === id);
    if (decSpec) {
      if (decSpec.zone === 'rim' || decSpec.zone === 'base') {
        // Keep compat toggling for rim/base
        setDecorations(prev => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      } else {
        // Add individual instance for body decals
        addDecalInstance(decSpec.id, decSpec.emoji);
      }
    }
  };

  const updateSelectedDecalProperty = (id: string, field: keyof EquippedDecal, value: number) => {
    setEquippedDecals(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, [field]: value };
      }
      return d;
    }));
  };

  const updateDecal = (id: string, updates: Partial<EquippedDecal>) => {
    setEquippedDecals(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const removeSelectedDecal = () => {
    if (!selectedDecalId) return;
    setEquippedDecals(prev => prev.filter(d => d.id !== selectedDecalId));
    setSelectedDecalId(null);
  };

  const handleDrawStroke = (x: number, y: number, isNewStroke: boolean) => {
    console.log(`[PotMiniGame] handleDrawStroke: x=${x.toFixed(1)}, y=${y.toFixed(1)}, isNew=${isNewStroke}`);
    setDrawingPaths(prev => {
      const newPaths = [...prev];
      if (isNewStroke || newPaths.length === 0) {
        newPaths.push({ points: [{ x, y }], color: brushColor, size: brushSize });
      } else {
        newPaths[newPaths.length - 1].points.push({ x, y });
      }
      return newPaths;
    });
  };

  const handleFinish = () => {
    const pot: CustomPot & { potDetails?: any } = {
      id: `pot-${Date.now()}`,
      name: potName.trim() || `กระถางปั้นพิเศษ #${Date.now() % 1000}`,
      shape: shapeId === 'round' ? 'classic' : shapeId === 'tall' ? 'modern' : 'octagon',
      shapeTh: shape.label,
      color: useCustomClayColor ? `${clayColor1}_${clayColor2}` : clay.id,
      colorName: useCustomClayColor ? 'สีผสมไล่ระดับพิเศษ' : clay.label,
      pattern: equippedDecals.length > 0 ? 'custom-upload' as any : 'ancient-wave' as any,
      patternTh: equippedDecals.length > 0 ? `แต่งลาย (${equippedDecals.length} ชิ้น)` : 'ไม่มีลายพิเศษ',
      cost: totalCost,
      potDetails: {
        shape: shapeId,
        shapeTh: shape.label,
        clayId,
        glazeId,
        potWidth,
        potHeight,
        rimScale,
        baseScale,
        useCustomClayColor,
        clayColor1,
        clayColor2,
        clayGrainLevel,
        useCustomGlazeColor,
        customGlazeColor,
        glazeOpacity,
        glazeGlossyLevel,
        glazeMetallicLevel,
        finishType,
        spinSpeed,
        engravedText,
        engravingColor,
        equippedDecals
      }
    };
    triggerExit(() => onComplete(pot, totalCost));
  };

  const handleReset = () => {
    setDecorations(new Set());
    setEquippedDecals([]);
    setSelectedDecalId(null);
    setGlazeId('none');
    setShapeId('round');
    setClayId('terracotta');
    setPotWidth(160);
    setPotHeight(180);
    setRimScale(1.0);
    setBaseScale(1.0);
    setUseCustomClayColor(false);
    setUseCustomGlazeColor(false);
    setFinishType('glossy');
    setSpinSpeed(12);
    setEngravedText('');
  };

  const catIdx = CATEGORIES.findIndex(c => c.id === activeCategory);
  const prevCat = () => setActiveCategory(CATEGORIES[(catIdx - 1 + CATEGORIES.length) % CATEGORIES.length].id);
  const nextCat = () => setActiveCategory(CATEGORIES[(catIdx + 1) % CATEGORIES.length].id);

  const selectedDecal = equippedDecals.find(d => d.id === selectedDecalId);

  const renderItems = () => {
    switch (activeCategory) {
      case 'shape':
        return (
          <div className="split-contents" style={{ display: 'contents' }}>
            <div className="left-tray-content" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0', alignItems: 'center' }}>
              {SHAPES.map(s => (
                <DressUpItem
                  key={s.id}
                  emoji={s.emoji}
                  label={s.label}
                  desc={s.desc}
                  isSelected={shapeId === s.id}
                  onClick={() => handleShapeSelect(s.id)}
                />
              ))}

              {/* Custom 3D Shape Model Uploader */}
              <label style={{
                width: '72px', minHeight: '84px',
                padding: '8px 4px', borderRadius: '16px', cursor: 'pointer',
                border: shapeId === 'custom3d' ? '2.5px solid #4E9F3D' : '1.5px solid rgba(30,81,40,0.08)',
                background: shapeId === 'custom3d' ? 'linear-gradient(135deg, rgba(78,159,61,0.15), rgba(78,159,61,0.05))' : 'rgba(255,255,255,0.9)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '4px', textAlign: 'center', flexShrink: 0,
                boxShadow: shapeId === 'custom3d' ? '0 4px 16px rgba(78,159,61,0.25)' : '0 2px 8px rgba(0,0,0,0.04)',
                position: 'relative',
                transition: 'all 0.25s'
              }}>
                {shapeId === 'custom3d' && (
                  <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', borderRadius: '50%', background: '#4E9F3D', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 }}>✓</div>
                )}
                <UploadCloud size={24} style={{ color: '#8E5431' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#1E5128', lineHeight: 1.2 }}>อัปโหลด 3D</span>
                <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>.stl / .obj</span>
                <input 
                  type="file" 
                  accept=".stl,.obj" 
                  onChange={handle3DModelUpload} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
            {/* Sculpting Sliders with Dimension & Scale Controls */}
            <div className="right-properties-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.02)', padding: '14px', borderRadius: '16px', border: '1px solid rgba(30,81,40,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📐 ขนาดมิติและอัตราสเกล (Dimensions & Scale)</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 800, background: 'rgba(244,180,26,0.15)', padding: '2px 8px', borderRadius: '10px' }}>
                  สเกล {potScale.toFixed(2)}x
                </span>
              </div>

              {/* Real-time Dimension Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div style={{ background: 'white', padding: '8px 10px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>เส้นผ่านศูนย์กลาง</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                    {realDiameterInch}" ({realDiameterCm} ซม.)
                  </div>
                </div>
                <div style={{ background: 'white', padding: '8px 10px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>ความสูงกระถาง</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#D84315', marginTop: '2px' }}>
                    {realHeightInch}" ({realHeightCm} ซม.)
                  </div>
                </div>
                <div style={{ background: 'white', padding: '8px 10px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>ปริมาตรดินประมาณ</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#2E7D32', marginTop: '2px' }}>
                    ~{estimatedVolumeLiters} ลิตร
                  </div>
                </div>
              </div>

              {/* Quick Scale Presets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dark)' }}>🔍 เลือกสเกลมาตรฐาน (Scale Presets):</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { label: 'S (0.8x)', scale: 0.8 },
                    { label: 'M (1.0x)', scale: 1.0 },
                    { label: 'L (1.25x)', scale: 1.25 },
                    { label: 'XL (1.5x)', scale: 1.5 },
                    { label: 'XXL (2.0x)', scale: 2.0 },
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setPotScale(p.scale)}
                      style={{
                        flex: 1,
                        padding: '6px 2px',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        borderRadius: '8px',
                        border: potScale === p.scale ? '2px solid var(--primary)' : '1px solid rgba(0,0,0,0.1)',
                        background: potScale === p.scale ? 'var(--primary-glow)' : 'white',
                        color: potScale === p.scale ? 'var(--primary)' : 'var(--text-dark)',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-Life Scale Reference Object Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dark)' }}>📏 วางวัตถุเทียบขนาดในชีวิตจริง (Real-Life Scale Comparison):</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {[
                    { id: 'none', label: '🚫 ไม่แสดง', sub: 'ซ่อนวัตถุ' },
                    { id: 'iphone', label: '📱 iPhone 15', sub: 'สูง 14.7 ซม.' },
                    { id: 'can', label: '🥤 กระป๋องน้ำ', sub: 'สูง 12.3 ซม.' },
                    { id: 'coin', label: '🪙 เหรียญ 10 บาท', sub: 'กว้าง 2.6 ซม.' },
                  ].map(ref => (
                    <button
                      key={ref.id}
                      type="button"
                      onClick={() => setReferenceObject(ref.id as any)}
                      style={{
                        padding: '6px 4px',
                        borderRadius: '10px',
                        border: referenceObject === ref.id ? '2px solid #FF9800' : '1px solid rgba(0,0,0,0.1)',
                        background: referenceObject === ref.id ? 'rgba(255,152,0,0.15)' : 'white',
                        color: referenceObject === ref.id ? '#E65100' : 'var(--text-dark)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 800 }}>{ref.label}</div>
                      <div style={{ fontSize: '9px', opacity: 0.8 }}>{ref.sub}</div>
                    </button>
                  ))}
                </div>

                {/* Reference Object Position Fine-Tuning */}
                {referenceObject !== 'none' && (
                  <div style={{
                    background: 'rgba(255,152,0,0.06)',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,152,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginTop: '4px'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#E65100', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>🎯 ปรับตำแหน่งวัตถุเทียบขนาด:</span>
                      <button 
                        type="button" 
                        onClick={() => { setRefObjectX(0); setRefObjectZ(0); setRefObjectRotation(0); }}
                        style={{ background: 'none', border: 'none', color: '#D84315', fontSize: '10px', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        รีเซ็ตตำแหน่ง
                      </button>
                    </div>

                    {/* X Position Offset Slider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '10px', width: '85px', color: 'var(--text-dark)', fontWeight: 600 }}>↔️ ซ้าย-ขวา (X):</span>
                      <input 
                        type="range" min="-40" max="40" value={refObjectX} 
                        onChange={e => setRefObjectX(Number(e.target.value))} 
                        style={{ flex: 1 }} 
                      />
                      <span style={{ fontSize: '10px', width: '35px', textAlign: 'right', fontWeight: 700 }}>{refObjectX > 0 ? `+${refObjectX}` : refObjectX}</span>
                    </div>

                    {/* Z Position Offset Slider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '10px', width: '85px', color: 'var(--text-dark)', fontWeight: 600 }}>↕️ หน้า-หลัง (Z):</span>
                      <input 
                        type="range" min="-40" max="40" value={refObjectZ} 
                        onChange={e => setRefObjectZ(Number(e.target.value))} 
                        style={{ flex: 1 }} 
                      />
                      <span style={{ fontSize: '10px', width: '35px', textAlign: 'right', fontWeight: 700 }}>{refObjectZ > 0 ? `+${refObjectZ}` : refObjectZ}</span>
                    </div>

                    {/* Rotation Slider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '10px', width: '85px', color: 'var(--text-dark)', fontWeight: 600 }}>🔄 หมุนวัตถุ:</span>
                      <input 
                        type="range" min="-180" max="180" value={refObjectRotation} 
                        onChange={e => setRefObjectRotation(Number(e.target.value))} 
                        style={{ flex: 1 }} 
                      />
                      <span style={{ fontSize: '10px', width: '35px', textAlign: 'right', fontWeight: 700 }}>{refObjectRotation}°</span>
                    </div>
                  </div>
                )}
              </div>

              {/* XYZ Axes Helper Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', background: 'white', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📍 เส้นแกนพิกัด 3D (XYZ Axes & Grid):</span>
                  <span style={{ fontSize: '10px', color: '#FF3344', fontWeight: 800 }}>X (แดง)</span>
                  <span style={{ fontSize: '10px', color: '#33CC44', fontWeight: 800 }}>Y (สูง)</span>
                  <span style={{ fontSize: '10px', color: '#3388FF', fontWeight: 800 }}>Z (ลึก)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAxes(!showAxes)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 800,
                    borderRadius: '8px',
                    border: showAxes ? '1.5px solid #4E9F3D' : '1px solid rgba(0,0,0,0.15)',
                    background: showAxes ? 'var(--primary-glow)' : '#F5F5F5',
                    color: showAxes ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showAxes ? '✓ แสดงแกน XYZ' : '✕ ซ่อนแกน'}
                </button>
              </div>

              {/* Dimension & Sculpting Sliders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', width: '90px', color: 'var(--text-dark)', fontWeight: 600 }}>🔍 อัตราสเกลรวม:</span>
                  <input type="range" min="50" max="200" step="5" value={potScale * 100} onChange={e => setPotScale(Number(e.target.value) / 100)} style={{ flex: 1 }} />
                  <span style={{ fontSize: '11px', width: '45px', textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>{potScale.toFixed(2)}x</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', width: '90px', color: 'var(--text-dark)', fontWeight: 600 }}>📏 กว้าง/เส้นผ่านศูนย์กลาง:</span>
                  <input type="range" min="100" max="220" value={potWidth} onChange={e => setPotWidth(Number(e.target.value))} style={{ flex: 1 }} />
                  <span style={{ fontSize: '11px', width: '45px', textAlign: 'right' }}>{potWidth}px</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', width: '90px', color: 'var(--text-dark)', fontWeight: 600 }}>📐 ความสูงกระถาง:</span>
                  <input type="range" min="100" max="260" value={potHeight} onChange={e => setPotHeight(Number(e.target.value))} style={{ flex: 1 }} />
                  <span style={{ fontSize: '11px', width: '45px', textAlign: 'right' }}>{potHeight}px</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', width: '90px', color: 'var(--text-dark)', fontWeight: 600 }}>⭕ ขนาดขอบปาก:</span>
                  <input type="range" min="70" max="140" value={rimScale * 100} onChange={e => setRimScale(Number(e.target.value) / 100)} style={{ flex: 1 }} />
                  <span style={{ fontSize: '11px', width: '45px', textAlign: 'right' }}>{(rimScale * 100).toFixed(0)}%</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', width: '90px', color: 'var(--text-dark)', fontWeight: 600 }}>🪵 ขนาดกว้างฐาน:</span>
                  <input type="range" min="50" max="150" value={baseScale * 100} onChange={e => setBaseScale(Number(e.target.value) / 100)} style={{ flex: 1 }} />
                  <span style={{ fontSize: '11px', width: '45px', textAlign: 'right' }}>{(baseScale * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'clay':
        return (
          <div className="split-contents" style={{ display: 'contents' }}>
            <div className="left-tray-content" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0' }}>
              {CLAY_TYPES.map(c => (
                <DressUpItem
                  key={c.id}
                  emoji={c.emoji}
                  label={c.label}
                  desc={`฿${c.baseCost}`}
                  isSelected={clayId === c.id && !useCustomClayColor}
                  swatch={c.gradient}
                  onClick={() => {
                    setClayId(c.id);
                    setUseCustomClayColor(false);
                  }}
                />
              ))}
            </div>
            {/* Custom Clay Color Pickers */}
            <div className="right-properties-content" style={{ background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>🟤 ผสมสีเนื้อดินไล่ระดับสีปั้นเอง (+฿100)</span>
                <input 
                  type="checkbox" 
                  checked={useCustomClayColor} 
                  onChange={e => setUseCustomClayColor(e.target.checked)} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
              {useCustomClayColor && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>สีส่วนบน:</span>
                    <input 
                      type="color" 
                      value={clayColor1} 
                      onChange={e => setClayColor1(e.target.value)} 
                      style={{ border: 'none', background: 'transparent', width: '45px', height: '30px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>สีส่วนฐาน:</span>
                    <input 
                      type="color" 
                      value={clayColor2} 
                      onChange={e => setClayColor2(e.target.value)} 
                      style={{ border: 'none', background: 'transparent', width: '45px', height: '30px', cursor: 'pointer' }}
                    />
                  </div>
                  
                  {/* Texture Grain Slider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11px', width: '80px', color: 'var(--text-dark)', fontWeight: 600 }}>ความขรุขระ (Grain):</span>
                    <input 
                      type="range" min="0" max="100" 
                      value={clayGrainLevel} 
                      onChange={e => setClayGrainLevel(Number(e.target.value))} 
                      style={{ flex: 1 }} 
                    />
                    <span style={{ fontSize: '11px', width: '30px', textAlign: 'right' }}>{clayGrainLevel}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'glaze':
        return (
          <div className="split-contents" style={{ display: 'contents' }}>
            <div className="left-tray-content" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0' }}>
              {GLAZES.map(g => (
                <DressUpItem
                  key={g.id}
                  emoji={g.id === 'none' ? '🚫' : '💧'}
                  label={g.label}
                  desc={g.cost === 0 ? 'ฟรี' : `+฿${g.cost}`}
                  isSelected={glazeId === g.id && !useCustomGlazeColor}
                  swatch={g.id === 'none'
                    ? 'repeating-linear-gradient(45deg, #eee 0, #eee 4px, white 4px, white 8px)'
                    : `linear-gradient(135deg, ${g.color.replace(/[\d.]+\)$/, '0.9)')}, ${g.color})`}
                  onClick={() => {
                    setGlazeId(g.id);
                    setUseCustomGlazeColor(false);
                  }}
                />
              ))}
            </div>
            {/* Custom Glaze properties */}
            <div className="right-properties-content" style={{ background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>🎨 ผสมสีและเนื้อเคลือบแก้วเอง (+฿120)</span>
                <input 
                  type="checkbox" 
                  checked={useCustomGlazeColor} 
                  onChange={e => setUseCustomGlazeColor(e.target.checked)} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
              {useCustomGlazeColor && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>สีน้ำยาเคลือบ:</span>
                    <input 
                      type="color" 
                      value={customGlazeColor} 
                      onChange={e => setUseCustomGlazeColorValue(e.target.value)} 
                      style={{ border: 'none', background: 'transparent', width: '45px', height: '30px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '11px', width: '80px', color: 'var(--text-dark)', fontWeight: 600 }}>ความโปร่งแสง:</span>
                    <input 
                      type="range" min="10" max="90" 
                      value={glazeOpacity} 
                      onChange={e => setGlazeOpacity(Number(e.target.value))} 
                      style={{ flex: 1 }} 
                    />
                    <span style={{ fontSize: '11px', width: '30px', textAlign: 'right' }}>{glazeOpacity}%</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11px', width: '85px', color: 'var(--text-dark)', fontWeight: 600 }}>ความเงามัน:</span>
                    <input 
                      type="range" min="0" max="100" 
                      value={glazeGlossyLevel} 
                      onChange={e => setGlazeGlossyLevel(Number(e.target.value))} 
                      style={{ flex: 1 }} 
                    />
                    <span style={{ fontSize: '11px', width: '30px', textAlign: 'right' }}>{glazeGlossyLevel}%</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11px', width: '85px', color: 'var(--text-dark)', fontWeight: 600 }}>สะท้อนโลหะ (Metallic):</span>
                    <input 
                      type="range" min="0" max="100" 
                      value={glazeMetallicLevel} 
                      onChange={e => setGlazeMetallicLevel(Number(e.target.value))} 
                      style={{ flex: 1 }} 
                    />
                    <span style={{ fontSize: '11px', width: '30px', textAlign: 'right' }}>{glazeMetallicLevel}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'decal':
        return (
          <div className="split-contents" style={{ display: 'contents' }}>
            {/* Decal list tray */}
            <div className="left-tray-content" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0' }}>
              {DECORATIONS.map(d => (
                <DressUpItem
                  key={d.id}
                  decalId={d.id}
                  label={d.label}
                  desc={`+฿${d.cost}`}
                  isSelected={false}
                  onClick={() => handleTrayDecalClick(d.id)}
                />
              ))}
            </div>

            {/* Custom Upload Decal & Sliders */}
            <div className="right-properties-content" style={{ background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>🖼️ อัปโหลดลวดลายภาพถ่ายขึ้นกระถาง (+฿150)</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary-light)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                  <UploadCloud size={14} />
                  <span>เลือกรูป</span>
                  <input type="file" accept="image/*" onChange={handleDecalUpload} style={{ display: 'none' }} />
                </label>
              </div>

              {/* Text Engraving */}
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', marginBottom: '6px' }}>✍️ สลักลายอักษรบนกระถาง (+฿50)</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="พิมพ์อักษรสลัก เช่น Siam 2026..." 
                    value={engravedText} 
                    onChange={e => setEngravedText(e.target.value)} 
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '11px', outline: 'none' }}
                  />
                  <input 
                    type="color" 
                    value={engravingColor} 
                    onChange={e => setEngravingColor(e.target.value)} 
                    style={{ border: 'none', background: 'transparent', width: '30px', height: '30px', cursor: 'pointer', flexShrink: 0 }}
                  />
                </div>
              </div>

              {/* Drawing Mode / Freehand Brush */}
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>🖌️ วาดลวดลายอิสระ (Brush Mode)</span>
                  <input 
                    type="checkbox" 
                    checked={isDrawingMode} 
                    onChange={e => setIsDrawingMode(e.target.checked)} 
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
                {isDrawingMode && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.7)', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>สีพู่กัน:</span>
                      <input 
                        type="color" 
                        value={brushColor} 
                        onChange={e => setBrushColor(e.target.value)} 
                        style={{ border: 'none', background: 'transparent', width: '30px', height: '30px', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', width: '60px', color: 'var(--text-muted)' }}>ขนาดหัวแปรง:</span>
                      <input 
                        type="range" min="1" max="20" 
                        value={brushSize} 
                        onChange={e => setBrushSize(Number(e.target.value))} 
                        style={{ flex: 1 }} 
                      />
                      <span style={{ fontSize: '10px', width: '20px', textAlign: 'right' }}>{brushSize}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#4E9F3D', fontWeight: 600, fontStyle: 'italic' }}>
                      👆 ลากเมาส์ / ใช้นิ้ววาดบนกระถางได้เลย!
                    </div>
                  </div>
                )}
              </div>

              {/* Individual Decal Fine-Tuning Controls */}
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px' }}>
                {selectedDecal ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#D84315', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🎯 กำลังแต่งลาย:</span>
                        <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center' }}>
                          {selectedDecal.url ? (
                            <img src={selectedDecal.url} alt="thumbnail" style={{ width: '20px', height: '20px', objectFit: 'cover', borderRadius: '4px' }} />
                          ) : (
                            <DecalGraphic decalId={selectedDecal.decalId} size={24} />
                          )}
                        </div>
                      </span>
                      <button 
                        type="button" 
                        onClick={removeSelectedDecal}
                        style={{ background: '#FF4757', border: 'none', borderRadius: '6px', color: 'white', padding: '4px 8px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                      >
                        <Trash2 size={12} /> ลบลายนี้
                      </button>
                    </div>

                    {/* Hint for dragging */}
                    <div style={{ fontSize: '10.5px', color: '#4E9F3D', fontWeight: 700, background: 'rgba(78,159,61,0.08)', padding: '6px 10px', borderRadius: '6px', borderLeft: '3px solid #4E9F3D' }}>
                      💡 Tip: คุณสามารถคลิก/แตะที่สติ๊กเกอร์บนตัวกระถาง แล้วลากเมาส์ขยับตำแหน่งจัดวางได้โดยตรงเลย!
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '10px', width: '70px', color: 'var(--text-muted)' }}>แนวนอน (X):</span>
                      <input type="range" min="-80" max="80" value={selectedDecal.x} onChange={e => updateSelectedDecalProperty(selectedDecal.id, 'x', Number(e.target.value))} style={{ flex: 1 }} />
                      <span style={{ fontSize: '10px', width: '30px', textAlign: 'right' }}>{selectedDecal.x}px</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '10px', width: '70px', color: 'var(--text-muted)' }}>แนวตั้ง (Y):</span>
                      <input type="range" min="-100" max="100" value={selectedDecal.y} onChange={e => updateSelectedDecalProperty(selectedDecal.id, 'y', Number(e.target.value))} style={{ flex: 1 }} />
                      <span style={{ fontSize: '10px', width: '30px', textAlign: 'right' }}>{selectedDecal.y}px</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '10px', width: '70px', color: 'var(--text-muted)' }}>ขนาดลาย:</span>
                      <input type="range" min="40" max="250" value={selectedDecal.scale * 100} onChange={e => updateSelectedDecalProperty(selectedDecal.id, 'scale', Number(e.target.value) / 100)} style={{ flex: 1 }} />
                      <span style={{ fontSize: '10px', width: '30px', textAlign: 'right' }}>{(selectedDecal.scale * 100).toFixed(0)}%</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '10px', width: '70px', color: 'var(--text-muted)' }}>การหมุน:</span>
                      <input type="range" min="-180" max="180" value={selectedDecal.rotation} onChange={e => updateSelectedDecalProperty(selectedDecal.id, 'rotation', Number(e.target.value))} style={{ flex: 1 }} />
                      <span style={{ fontSize: '10px', width: '30px', textAlign: 'right' }}>{selectedDecal.rotation}°</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0', fontStyle: 'italic' }}>
                    👆 แตะรูปสติ๊กเกอร์ลายบนตัวกระถาง หรือคลิกลากขยับจัดตำแหน่ง เลื่อนขนาด หมุนลายแยกชิ้นตามใจชอบได้เลย!
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      case 'effects':
        return (
          <div className="split-contents" style={{ display: 'contents' }}>
            <div className="left-tray-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '48px', opacity: 0.5 }}>💫</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)' }}>เอฟเฟกต์การหมุน</div>
              <div style={{ fontSize: '12px', padding: '0 20px', lineHeight: 1.6 }}>
                คุณสามารถปรับแต่ง <b>ความเร็วในการหมุน</b> และ <b>พื้นผิวการเคลือบเงา</b> ได้ที่แผงควบคุมด้านขวามือ
              </div>
            </div>
            <div className="right-properties-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>✨ พื้นผิวดินเผาและการสปินแป้นหมุน</div>
            
            {/* Clay Finish */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dark)' }}>เนื้อผิวเคลือบ (Finish Texture):</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {([
                  { id: 'matte', label: 'ด้านธรรมชาติ (Matte)' },
                  { id: 'glossy', label: 'เคลือบเงาวาว (Glossy)' },
                  { id: 'crackled', label: 'ลายครามแก้ว (Crackled)' }
                ] as const).map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFinishType(t.id)}
                    style={{
                      flex: 1, padding: '8px', fontSize: '11px', fontWeight: 700, borderRadius: '8px',
                      border: finishType === t.id ? '2px solid var(--primary)' : '1px solid rgba(0,0,0,0.1)',
                      background: finishType === t.id ? 'rgba(30,81,40,0.05)' : 'white',
                      color: finishType === t.id ? 'var(--primary)' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Turntable Spin Speed */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px' }}>
              <span style={{ fontSize: '11px', width: '120px', fontWeight: 600, color: 'var(--text-dark)' }}>ความเร็วหมุนแท่น:</span>
              <input 
                type="range" min="0" max="30" step="1"
                value={30 - spinSpeed} 
                onChange={e => {
                  const val = Number(e.target.value);
                  setSpinSpeed(val === 30 ? 0 : 30 - val);
                }} 
                style={{ flex: 1 }} 
              />
              <span style={{ fontSize: '11px', width: '60px', textAlign: 'right' }}>
                {spinSpeed === 0 ? 'หยุดหมุน' : `${(30 / spinSpeed).toFixed(1)}x`}
              </span>
            </div>

            {/* Reference Object Position & Rotation */}
            {referenceObject !== 'none' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dark)' }}>ปรับตำแหน่งวัตถุอ้างอิงขนาด:</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '10px', width: '60px', color: 'var(--text-muted)' }}>ซ้าย/ขวา (X):</span>
                  <input type="range" min="-30" max="30" value={refObjectX} onChange={e => setRefObjectX(Number(e.target.value))} style={{ flex: 1 }} />
                  <span style={{ fontSize: '10px', width: '20px', textAlign: 'right' }}>{refObjectX}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '10px', width: '60px', color: 'var(--text-muted)' }}>หน้า/หลัง (Z):</span>
                  <input type="range" min="-30" max="30" value={refObjectZ} onChange={e => setRefObjectZ(Number(e.target.value))} style={{ flex: 1 }} />
                  <span style={{ fontSize: '10px', width: '20px', textAlign: 'right' }}>{refObjectZ}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '10px', width: '60px', color: 'var(--text-muted)' }}>หมุนทิศทาง:</span>
                  <input type="range" min="-180" max="180" value={refObjectRotation} onChange={e => setRefObjectRotation(Number(e.target.value))} style={{ flex: 1 }} />
                  <span style={{ fontSize: '10px', width: '30px', textAlign: 'right' }}>{refObjectRotation}°</span>
                </div>
              </div>
            )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      background: '#FFFDF8',
      boxSizing: 'border-box',
      transform: (isMounted && !isExiting) ? 'translateY(0)' : 'translateY(-100%)',
      transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    }}>

      {/* ── Header bar ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1E5128, #4E9F3D)',
        padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            🎀 แต่งตัวกระถาง
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>
            Pottery Dress Up!
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Tetris Button */}
          <button type="button" onClick={() => setShowTetris(true)} style={{
            background: 'linear-gradient(135deg, #FF6B6B, #EE5253)',
            borderRadius: '10px', padding: '6px 12px',
            fontSize: '12px', fontWeight: 800, color: 'white',
            cursor: 'pointer', border: 'none',
            display: 'flex', alignItems: 'center', gap: '6px',
            boxShadow: '0 2px 8px rgba(238,82,83,0.3)',
          }}>
            🎮 เล่นเกมรอ
          </button>
          
          {/* Cost badge */}
          <div style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA000)',
            borderRadius: '20px', padding: '5px 14px',
            fontSize: '14px', fontWeight: 900, color: 'white',
            boxShadow: '0 2px 8px rgba(255,160,0,0.3)',
          }}>
            ฿{totalCost.toLocaleString()}
          </div>
          <button type="button" onClick={handleReset} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '10px', color: 'white', cursor: 'pointer', padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RotateCcw size={12} /> รีเซ็ต
          </button>
          <button type="button" onClick={() => triggerExit(onCancel)} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '10px', color: 'white', cursor: 'pointer', padding: '6px 12px', fontSize: '12px' }}>
            ✕
          </button>
        </div>
      </div>

      {/* Style sheet for responsive split-screen layout */}
      <style>{`
        .dressup-layout {
          display: grid;
          flex: 1;
          min-height: 0;
          grid-template-columns: 1fr;
          grid-template-rows: auto auto auto auto;
          width: 100%;
          box-sizing: border-box;
        }
        .dressup-stage {
          grid-row: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 0;
          min-width: 0;
          padding: 0;
          background: linear-gradient(180deg, #FFFDF8 0%, #F5F0E8 40%, #EDE4D4 100%);
          position: relative;
          border-bottom: 2px solid rgba(30,81,40,0.06);
          width: 100%;
          box-sizing: border-box;
        }
        .dressup-viewer-container {
          width: 100%;
          height: 340px;
          z-index: 1;
          position: relative;
          overflow: hidden;
        }
        .dressup-controls {
          display: contents; /* Let children flow into the grid */
        }
        /* Mobile layout for children of dressup-controls */
        .category-ribbon { grid-row: 2; }
        .items-tray-container { display: contents; }
        .split-contents { display: contents; }
        .left-tray-content { grid-row: 3; }
        .right-properties-content { grid-row: 4; }
        .receipt-container { grid-row: 5; }

        @media (min-width: 900px) {
          .dressup-layout {
            grid-template-columns: 80px 240px minmax(0, 1fr) 310px;
            grid-template-rows: 1fr auto;
            grid-template-areas:
              "left-ribbon left-tray center right-props"
              "left-ribbon left-tray center right-receipt";
            min-height: 520px;
            background: #f5f5f5; /* Background for side panels */
          }
          .dressup-stage {
            grid-area: center;
            height: 100%;
            min-height: 0;
            min-width: 0;
            border-left: 1px solid rgba(0,0,0,0.1);
            border-right: 1px solid rgba(0,0,0,0.1);
            border-bottom: none;
            padding: 0;
            background: #ECE5DA; /* Darker middle canvas */
          }
          .dressup-viewer-container {
            height: 100%;
            width: 100%;
            overflow: hidden;
          }
          /* Grid placement for children */
          .category-ribbon { 
            grid-area: left-ribbon; 
            border-right: 1px solid rgba(0,0,0,0.05); 
          }
          .cat-nav-btn { display: none !important; }
          .cat-list { 
            flex-direction: column !important; 
            overflow-y: auto !important; 
            padding-top: 16px !important;
            gap: 12px !important;
          }
          .category-ribbon button {
            width: 100%;
            height: 70px;
            border-bottom: none !important;
            border-right: 3px solid transparent;
            justify-content: center;
          }
          .left-tray-content { 
            grid-area: left-tray; overflow-y: auto; padding: 16px; background: white; border-right: 1px solid rgba(0,0,0,0.05);
            flex-wrap: wrap !important;
            align-content: flex-start !important;
            align-items: flex-start !important;
            min-height: 0;
          }
          .right-properties-content { grid-area: right-props; overflow-y: auto; padding: 16px; background: white; border-left: 1px solid rgba(0,0,0,0.05); align-content: start; min-height: 0; }
          .receipt-container { grid-area: right-receipt; border-left: 1px solid rgba(0,0,0,0.05); }
        }
      `}</style>

      {/* ── Dress-up Layout ── */}
      <div className="dressup-layout">

        {/* Pot Mannequin Stage */}
        <div className="dressup-stage">

          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
            background: 'repeating-linear-gradient(90deg, #CD853F 0px, #CD853F 8px, transparent 8px, transparent 16px, #1E5128 16px, #1E5128 24px, transparent 24px, transparent 32px)',
            opacity: 0.3,
          }} />

          {equippedDecals.length > 0 && (
            <div style={{
              position: 'absolute', top: '16px', left: '16px',
              background: 'rgba(30,81,40,0.85)', backdropFilter: 'blur(4px)',
              borderRadius: '20px', padding: '5px 12px',
              fontSize: '12px', fontWeight: 700, color: 'white',
              display: 'flex', alignItems: 'center', gap: '4px',
              zIndex: 10,
            }}>
              🎨 {equippedDecals.length} ลายบนกระถาง
            </div>
          )}

          {/* Current selections summary */}
          <div style={{
            position: 'absolute', top: '16px', right: '16px',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px',
            zIndex: 10,
          }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#8E5431', opacity: 0.7 }}>
              {shape.emoji} {shape.label}
            </div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#8E5431', opacity: 0.7 }}>
              {useCustomClayColor ? '🎨 สีดินผสมเหลือบสองเฉด' : `${clay.emoji} ดิน${clay.label}`}
            </div>
            {(useCustomGlazeColor || glaze.id !== 'none') && (
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#8E5431', opacity: 0.7 }}>
                ✨ {useCustomGlazeColor ? 'สีเคลือบพิเศษ' : `เคลือบ${glaze.label}`}
              </div>
            )}
          </div>

          {/* Real-time Floating 3D Dimension Badge */}
          <div style={{
            position: 'absolute', bottom: '16px', left: '16px',
            background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
            borderRadius: '14px', padding: '6px 14px',
            border: '1.5px solid rgba(78,159,61,0.25)',
            fontSize: '11px', fontWeight: 700, color: '#1E5128',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            display: 'flex', alignItems: 'center', gap: '8px',
            zIndex: 10,
          }}>
            <span>📐 ขนาดจริง: <strong>{realDiameterInch}" × {realHeightInch}"</strong> ({realDiameterCm} × {realHeightCm} ซม.)</span>
            <span style={{ background: '#4E9F3D', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 800 }}>
              Scale {potScale.toFixed(2)}x
            </span>
          </div>

          <div style={{
            position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)',
            width: '240px', height: '120px',
            background: 'radial-gradient(ellipse, rgba(255,247,230,0.6) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {shapeId === 'custom3d' && !custom3DFileData ? (
            <div style={{
              width: '240px', height: '240px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '12px',
              border: '2.5px dashed rgba(142,84,49,0.3)', borderRadius: '24px',
              background: 'rgba(255,255,255,0.6)', padding: '24px', textAlign: 'center',
              boxSizing: 'border-box', margin: '40px auto 20px', zIndex: 1
            }}>
              <UploadCloud size={40} style={{ color: '#8E5431' }} />
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)' }}>รออัปโหลดไฟล์ 3 มิติของคุณ</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>คลิกปุ่ม "อัปโหลด 3D" (.stl / .obj) ด้านล่าง เพื่อดูพรีวิวรูปทรงกระถางเสมือนจริง</div>
            </div>
          ) : (
            <div className="dressup-viewer-container">
              <ThreeModelViewer
                fileData={custom3DFileData}
                fileType={custom3DFileType}
                shapeId={shapeId}
                clayId={clayId}
                potWidth={potWidth}
                potHeight={potHeight}
                rimScale={rimScale}
                baseScale={baseScale}
                potScale={potScale}
                referenceObject={referenceObject}
                refObjectX={refObjectX}
                refObjectZ={refObjectZ}
                refObjectRotation={refObjectRotation}
                showAxes={showAxes}
                useCustomClayColor={useCustomClayColor}
                clayColor1={clayColor1}
                clayColor2={clayColor2}
                clayGrainLevel={clayGrainLevel}
                glazeId={glazeId}
                useCustomGlazeColor={useCustomGlazeColor}
                customGlazeColor={customGlazeColor}
                glazeOpacity={glazeOpacity}
                glazeGlossyLevel={glazeGlossyLevel}
                glazeMetallicLevel={glazeMetallicLevel}
                finishType={finishType}
                spinSpeed={spinSpeed}
                decorations={decorations}
                equippedDecals={equippedDecals}
                selectedDecalId={selectedDecalId}
                onSelectDecal={setSelectedDecalId}
                onUpdateDecal={updateDecal}
                engravedText={engravedText}
                engravingColor={engravingColor}
                isDrawingMode={isDrawingMode}
                drawingPaths={drawingPaths}
                onDrawStroke={handleDrawStroke}
                brushColor={brushColor}
                brushSize={brushSize}
              />
            </div>
          )}
        </div>

        {/* Right Column: Controls */}
        <div className="dressup-controls">

          {/* ── Category Ribbon ── */}
          <div className="category-ribbon" style={{
            display: 'flex', alignItems: 'center', gap: '0',
            background: 'linear-gradient(180deg, #FEFBF4, #FFF8EC)',
            padding: '0',
            borderBottom: '2px solid rgba(30,81,40,0.06)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}>
            <button className="cat-nav-btn" type="button" onClick={prevCat} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '12px 8px', color: '#8E5431', display: 'flex', alignItems: 'center',
            }}>
              <ChevronLeft size={18} />
            </button>
            <div className="cat-list" style={{
              flex: 1, display: 'flex', gap: '0', overflowX: 'auto',
              scrollbarWidth: 'none',
            }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    if (cat.id !== 'decal') setSelectedDecalId(null);
                  }}
                  style={{
                    flex: '1 0 auto', padding: '10px 12px', fontSize: '11px', fontWeight: 700,
                    background: activeCategory === cat.id
                      ? 'linear-gradient(180deg, rgba(78,159,61,0.12), rgba(78,159,61,0.04))'
                      : 'none',
                    border: 'none', cursor: 'pointer',
                    color: activeCategory === cat.id ? '#1E5128' : '#8C9E90',
                    borderBottom: activeCategory === cat.id ? '3px solid #4E9F3D' : '3px solid transparent',
                    transition: 'all 0.2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
            <button className="cat-nav-btn" type="button" onClick={nextCat} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '12px 8px', color: '#8E5431', display: 'flex', alignItems: 'center',
            }}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* ── Items Tray ── */}
          <div className="items-tray-container" style={{
            padding: '0', // moved padding to css grid
            background: 'white',
          }}>
            {renderItems()}
          </div>

          {/* ── Receipt / Finish ── */}
          <div className="receipt-container" style={{ padding: '12px 16px 16px', background: 'white', borderTop: '1px solid rgba(30,81,40,0.06)' }}>
            {!showReceipt ? (
              <button type="button" onClick={() => { setShowReceipt(true); setSelectedDecalId(null); }} style={{
                width: '100%', padding: '14px', borderRadius: '16px', cursor: 'pointer',
                background: 'linear-gradient(135deg, #8E5431, #CD853F)',
                border: 'none', color: 'white', fontWeight: 800, fontSize: '15px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 6px 20px rgba(142,84,49,0.4)',
                transition: 'all 0.3s',
              }}>
                <Flame size={18} /> เข้าเตาอบอบเคลือบดินเผา — ฿{totalCost.toLocaleString()} 🔥
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  placeholder={`ตั้งชื่อให้ผลงานกระถางดินเผาพิเศษของคุณ...`}
                  value={potName}
                  onChange={e => setPotName(e.target.value)}
                  style={{
                    width: '100%', height: '44px', borderRadius: '12px',
                    border: '1.5px solid rgba(30,81,40,0.2)', padding: '0 14px',
                    fontSize: '14px', color: '#2C3E30', outline: 'none', fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />

                {/* Receipt info */}
                <div style={{ background: 'linear-gradient(135deg, #FFFDF6, #FFF8EC)', border: '1.5px dashed rgba(200,140,50,0.4)', borderRadius: '14px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#8E5431', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🏺 ใบเสร็จการจัดแต่งและปั้นกระถาง</span>
                  </div>
                  {[
                    { label: `ค่ารูปทรง (${shape.label})`, cost: 80 },
                    { label: useCustomClayColor ? 'ค่าดินสีปั้นเหลือบไล่โทนผสมเอง' : `ดินเหนียว ${clay.label}`, cost: clay.baseCost + customClayCost },
                    { label: useCustomGlazeColor ? 'ค่าสีและเนื้อเคลือบแก้วประสมเอง' : (glaze.id !== 'none' ? `เคลือบสี ${glaze.label}` : 'ไม่เคลือบสี'), cost: glaze.cost + customGlazeCost },
                    { label: `ลวดลายสติกเกอร์ / ลายประดับ (${equippedDecals.length} ชิ้น)`, cost: decCost },
                    { label: engravedText ? `อักษรสลัก: "${engravedText}"` : null, cost: customTextCost },
                    { label: 'ค่าความร้อนเตาเผาไฟอบร้อน', cost: 80 },
                  ].filter(r => r.label !== null).map(r => (
                    <div key={r!.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0', borderBottom: '1px solid rgba(200,140,50,0.1)' }}>
                      <span style={{ color: '#5C6E60' }}>{r!.label}</span>
                      <span style={{ fontWeight: 700 }}>{r!.cost === 0 ? 'ฟรี' : `฿${r!.cost}`}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#1E5128' }}>ยอดราคารวม</span>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: '#8E5431' }}>฿{totalCost.toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => setShowReceipt(false)} style={{ flex: '0 0 auto', padding: '12px 16px', borderRadius: '14px', border: '1.5px solid rgba(30,81,40,0.15)', background: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '13px', color: '#5C6E60' }}>
                    ← ย้อนกลับ
                  </button>
                  <button type="button" onClick={handleFinish} style={{
                    flex: 1, padding: '14px', borderRadius: '14px', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #1E5128, #4E9F3D)',
                    border: 'none', color: 'white', fontWeight: 800, fontSize: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: '0 6px 20px rgba(30,81,40,0.3)',
                  }}>
                    <ShoppingCart size={16} /> บันทึกและชำระเงิน 🛒
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Tetris Modal Overlay */}
      {showTetris && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <button 
              onClick={() => setShowTetris(false)}
              style={{ position: 'absolute', top: '-40px', right: '0', background: 'none', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer', padding: '8px' }}
            >
              ✕ ปิดมินิเกม
            </button>
            <div style={{ background: 'black', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', overflowY: 'auto' }}>
              <div style={{ color: 'white', textAlign: 'center', marginBottom: '16px', fontSize: '18px', fontWeight: 800 }}>
                🎮 Tetris พักสายตา
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <TetrisGame userPoints={0} onAwardPoints={() => {}} onGameActiveChange={() => {}} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>,
    document.body
  );
};
