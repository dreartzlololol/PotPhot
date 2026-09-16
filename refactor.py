import re

with open('src/components/PotMiniGame.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
if "useHistory" not in content:
    content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { useHistory } from '../hooks/useHistory';")

# 2. Define PotConfig interface before PotMiniGame
config_interface = """
export interface PotConfig {
  shapeId: string;
  clayId: string;
  glazeId: string;
  decorations: string[];
  potWidth: number;
  potHeight: number;
  rimScale: number;
  baseScale: number;
  potScale: number;
  useCustomClayColor: boolean;
  clayColor1: string;
  clayColor2: string;
  clayGrainLevel: number;
  useCustomGlazeColor: boolean;
  customGlazeColor: string;
  glazeOpacity: number;
  glazeGlossyLevel: number;
  glazeMetallicLevel: number;
  finishType: 'matte' | 'glossy' | 'crackled';
  equippedDecals: EquippedDecal[];
  engravedText: string;
  engravingColor: string;
  custom3DFileData: string | null;
  custom3DFileType: 'stl' | 'obj' | null;
  drawingPaths: DrawingStroke[];
}
"""
if "export interface PotConfig" not in content:
    content = content.replace("export const PotMiniGame: React.FC<PotMiniGameProps> = ({ onComplete, onCancel }) => {", config_interface + "\nexport const PotMiniGame: React.FC<PotMiniGameProps> = ({ onComplete, onCancel }) => {")

# 3. Replace state initialization
state_init_old = """  const [shapeId,     setShapeId]     = useState('round');
  const [clayId,      setClayId]      = useState('terracotta');
  const [glazeId,     setGlazeId]     = useState('none');
  const [decorations, setDecorations] = useState<Set<string>>(new Set());"""
  
state_init_new = """  const { state: config, set: setConfig, undo, redo, canUndo, canRedo } = useHistory<PotConfig>({
    shapeId: 'round',
    clayId: 'terracotta',
    glazeId: 'none',
    decorations: [],
    potWidth: 160,
    potHeight: 180,
    rimScale: 1.0,
    baseScale: 1.0,
    potScale: 1.0,
    useCustomClayColor: false,
    clayColor1: '#E8A070',
    clayColor2: '#CD853F',
    clayGrainLevel: 30,
    useCustomGlazeColor: false,
    customGlazeColor: '#1E5128',
    glazeOpacity: 60,
    glazeGlossyLevel: 80,
    glazeMetallicLevel: 20,
    finishType: 'glossy',
    equippedDecals: [],
    engravedText: '',
    engravingColor: '#FFFFFF',
    custom3DFileData: null,
    custom3DFileType: null,
    drawingPaths: []
  });
  
  // Destructure for easy access
  const { shapeId, clayId, glazeId, decorations, potWidth, potHeight, rimScale, baseScale, potScale, useCustomClayColor, clayColor1, clayColor2, clayGrainLevel, useCustomGlazeColor, customGlazeColor, glazeOpacity, glazeGlossyLevel, glazeMetallicLevel, finishType, equippedDecals, engravedText, engravingColor, custom3DFileData, custom3DFileType, drawingPaths } = config;
  
  // Helper
  const updateConfig = (updates: Partial<PotConfig> | ((prev: PotConfig) => Partial<PotConfig>)) => {
    setConfig(prev => ({ ...prev, ...(typeof updates === 'function' ? updates(prev) : updates) }));
  };
"""

content = content.replace(state_init_old, state_init_new)

# 4. Remove old useStates that are now in config
removals = [
    r"const \[potWidth, setPotWidth\] = useState\(160\);",
    r"const \[potHeight, setPotHeight\] = useState\(180\);",
    r"const \[rimScale, setRimScale\] = useState\(1\.0\);",
    r"const \[baseScale, setBaseScale\] = useState\(1\.0\);",
    r"const \[potScale, setPotScale\] = useState\(1\.0\);",
    r"const \[useCustomClayColor, setUseCustomClayColor\] = useState\(false\);",
    r"const \[clayColor1, setClayColor1\] = useState\('#E8A070'\);",
    r"const \[clayColor2, setClayColor2\] = useState\('#CD853F'\);",
    r"const \[clayGrainLevel, setClayGrainLevel\] = useState\(30\);",
    r"const \[useCustomGlazeColor, setUseCustomGlazeColor\] = useState\(false\);",
    r"const \[customGlazeColor, setUseCustomGlazeColorValue\] = useState\('#1E5128'\);",
    r"const \[glazeOpacity, setGlazeOpacity\] = useState\(60\);",
    r"const \[glazeGlossyLevel, setGlazeGlossyLevel\] = useState\(80\);",
    r"const \[glazeMetallicLevel, setGlazeMetallicLevel\] = useState\(20\);",
    r"const \[finishType, setFinishType\] = useState\<'matte' \| 'glossy' \| 'crackled'\>\('glossy'\);",
    r"const \[equippedDecals, setEquippedDecals\] = useState\<EquippedDecal\[\]\>\(\[\]\);",
    r"const \[engravedText, setEngravedText\] = useState\(''\);",
    r"const \[engravingColor, setEngravingColor\] = useState\('#FFFFFF'\);",
    r"const \[custom3DFileData, setCustom3DFileData\] = useState\<string \| null\>\(null\);",
    r"const \[custom3DFileType, setCustom3DFileType\] = useState\<'stl' \| 'obj' \| null\>\(null\);",
    r"const \[drawingPaths, setDrawingPaths\] = useState\<DrawingStroke\[\]\>\(\[\]\);"
]

for rm in removals:
    content = re.sub(rm + r"\n\s*", "", content)

# 5. Replacements for Setters
setters = {
    "setShapeId": "shapeId",
    "setClayId": "clayId",
    "setGlazeId": "glazeId",
    "setPotWidth": "potWidth",
    "setPotHeight": "potHeight",
    "setRimScale": "rimScale",
    "setBaseScale": "baseScale",
    "setPotScale": "potScale",
    "setUseCustomClayColor": "useCustomClayColor",
    "setClayColor1": "clayColor1",
    "setClayColor2": "clayColor2",
    "setClayGrainLevel": "clayGrainLevel",
    "setUseCustomGlazeColor": "useCustomGlazeColor",
    "setUseCustomGlazeColorValue": "customGlazeColor",
    "setGlazeOpacity": "glazeOpacity",
    "setGlazeGlossyLevel": "glazeGlossyLevel",
    "setGlazeMetallicLevel": "glazeMetallicLevel",
    "setFinishType": "finishType",
    "setEngravedText": "engravedText",
    "setEngravingColor": "engravingColor",
    "setCustom3DFileData": "custom3DFileData",
    "setCustom3DFileType": "custom3DFileType",
}

for setter, key in setters.items():
    # Basic replacements: setter(value) -> updateConfig({ key: value })
    content = re.sub(rf"{setter}\(([^)]+)\)", rf"updateConfig({{ {key}: \1 }})", content)

# Special cases for function setters or specific logic
# equippedDecals
content = re.sub(r"setEquippedDecals\(([^)]+)\)", r"updateConfig({ equippedDecals: \1 })", content)
content = content.replace("updateConfig({ equippedDecals: prev =>", "updateConfig(prev => ({ equippedDecals: ")
content = content.replace("] })", "] }))") # naive fix for prev => array, we'll fix manually if needed.

# drawingPaths
content = re.sub(r"setDrawingPaths\(([^)]+)\)", r"updateConfig({ drawingPaths: \1 })", content)
content = content.replace("updateConfig({ drawingPaths: prev =>", "updateConfig(prev => ({ drawingPaths: ")
content = content.replace("] })", "] }))")

# decorations (was Set, now array)
# const next = new Set(decorations); -> const next = [...decorations];
content = content.replace("const next = new Set(decorations);", "let next = [...decorations];")
content = content.replace("next.add(dId);", "if (!next.includes(dId)) next.push(dId);")
content = content.replace("next.delete(dId);", "next = next.filter(id => id !== dId);")
content = content.replace("setDecorations(next);", "updateConfig({ decorations: next });")
# if (decorations.has(dec.id)) -> if (decorations.includes(dec.id))
content = content.replace("decorations.has(", "decorations.includes(")
# [...decorations] -> decorations
content = content.replace("[...decorations]", "decorations")

# 6. Keyboard events for Undo/Redo
keyboard_effect = """
  // Undo/Redo keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          if (e.shiftKey) {
            if (canRedo) redo();
          } else {
            if (canUndo) undo();
          }
        } else if (e.key === 'y') {
          if (canRedo) redo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);
"""
if "handleKeyDown" not in content:
    content = content.replace("const shape = SHAPES.find", keyboard_effect + "\n  const shape = SHAPES.find")

# 7. UI Buttons for Undo/Redo
ui_buttons = """
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={undo} 
                disabled={!canUndo}
                style={{ background: 'var(--surface-color)', color: canUndo ? 'var(--text-color)' : 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '6px', opacity: canUndo ? 1 : 0.5, cursor: canUndo ? 'pointer' : 'default' }}>
                <RotateCcw size={16} /> <span style={{fontSize: '14px'}}>Undo</span>
              </button>
              <button 
                onClick={redo} 
                disabled={!canRedo}
                style={{ background: 'var(--surface-color)', color: canRedo ? 'var(--text-color)' : 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '6px', opacity: canRedo ? 1 : 0.5, cursor: canRedo ? 'pointer' : 'default' }}>
                <RotateCcw size={16} style={{transform: 'scaleX(-1)'}}/> <span style={{fontSize: '14px'}}>Redo</span>
              </button>
            </div>
"""
# Find top bar left section
if "Undo" not in content:
    content = content.replace("<button onClick={() => triggerExit(onCancel)} className=\"icon-button\">", ui_buttons + "\n            <button onClick={() => triggerExit(onCancel)} className=\"icon-button\">")

with open('src/components/PotMiniGame.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
