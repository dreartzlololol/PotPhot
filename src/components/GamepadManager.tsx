import React, { useEffect, useRef } from 'react';
import type { TabType } from './BottomNav';
import type { Shop } from '../data/shops';

interface GamepadManagerProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  favorites: string[];
  onToggleFavorite: (shopId: string) => void;
  shops: Shop[];
  activeShopId: string | null;
  setActiveShopId: (id: string | null) => void;
  selectedShop: Shop | null;
  setSelectedShop: (shop: Shop | null) => void;
}

const TABS: TabType[] = ['store', 'search', 'pot', 'account', 'settings'];

export const GamepadManager: React.FC<GamepadManagerProps> = ({
  activeTab,
  setActiveTab,
  favorites,
  onToggleFavorite,
  shops,
  activeShopId,
  setActiveShopId,
  selectedShop,
  setSelectedShop,
}) => {
  const requestRef = useRef<number | null>(null);
  
  // Cooldown states to prevent multiple fires on a single button press (in milliseconds)
  const buttonCooldowns = useRef<{ [key: number]: number }>({});
  const focusedIndexRef = useRef<number>(-1);

  const getFocusableElements = () => {
    return Array.from(document.querySelectorAll('.gamepad-focusable')) as HTMLElement[];
  };

  const updateFocus = (elements: HTMLElement[], newIndex: number) => {
    elements.forEach((el, idx) => {
      if (idx === newIndex) {
        el.classList.add('gamepad-focused');
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.focus();
        }
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        el.classList.remove('gamepad-focused');
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.blur();
        }
      }
    });
    focusedIndexRef.current = newIndex;
  };

  useEffect(() => {
    // Clear any existing focus classes when switching tabs
    const elements = getFocusableElements();
    elements.forEach((el) => {
      el.classList.remove('gamepad-focused');
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.blur();
      }
    });
    focusedIndexRef.current = -1;
  }, [activeTab]);

  useEffect(() => {
    // Clear any existing focus classes when opening/closing details panel
    const elements = getFocusableElements();
    elements.forEach((el) => {
      el.classList.remove('gamepad-focused');
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.blur();
      }
    });
    focusedIndexRef.current = -1;
  }, [selectedShop]);

  const pollGamepad = () => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    
    // Find the first connected gamepad
    const gp = Array.from(gamepads).find((g) => g !== null);

    if (gp) {
      const now = Date.now();
      
      const checkCooldown = (btnIndex: number, cooldownTime = 250) => {
        const lastPress = buttonCooldowns.current[btnIndex] || 0;
        if (gp.buttons[btnIndex]?.pressed && now - lastPress > cooldownTime) {
          buttonCooldowns.current[btnIndex] = now;
          return true;
        }
        return false;
      };

      const checkAxisCooldown = (axisKey: number, isPressed: boolean, cooldownTime = 200) => {
        const lastPress = buttonCooldowns.current[axisKey] || 0;
        if (isPressed && now - lastPress > cooldownTime) {
          buttonCooldowns.current[axisKey] = now;
          return true;
        }
        if (!isPressed) {
          buttonCooldowns.current[axisKey] = 0; // instantly reset when stick returned to neutral
        }
        return false;
      };

      // 1. LB / RB bumper: Navigate tabs (Always active)
      if (checkCooldown(5)) { // RB (Next tab)
        const currentIndex = TABS.indexOf(activeTab);
        const nextIndex = (currentIndex + 1) % TABS.length;
        setActiveTab(TABS[nextIndex]);
      }
      if (checkCooldown(4)) { // LB (Previous tab)
        const currentIndex = TABS.indexOf(activeTab);
        const nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
        setActiveTab(TABS[nextIndex]);
      }

      // Check if we are in Map view mode, Tetris active game mode, or Menu Navigation mode
      const isMapMode = activeTab === 'store' && !selectedShop;
      const isTetrisActive = !!document.querySelector('.tetris-game-active');
      const isTetrisPlaying = isTetrisActive && 
                              !document.querySelector('.tetris-game-over-overlay') && 
                              !document.querySelector('.tetris-pause-overlay');

      if (isTetrisPlaying) {
        // --- TETRIS GAME CONTROLS ---
        const axisX = gp.axes[0];
        const axisY = gp.axes[1];
        const stickDeadzone = 0.5;

        const stickLeft = axisX < -stickDeadzone;
        const stickRight = axisX > stickDeadzone;
        const stickDown = axisY > stickDeadzone;

        const leftPressed = gp.buttons[14]?.pressed || stickLeft;
        const rightPressed = gp.buttons[15]?.pressed || stickRight;
        const downPressed = gp.buttons[13]?.pressed || stickDown;
        const upPressed = gp.buttons[12]?.pressed;

        // Move Left / Right (150ms cooldown)
        if (leftPressed && checkAxisCooldown(102, leftPressed, 150)) {
          window.dispatchEvent(new CustomEvent('gamepad-tetris-left'));
        }
        if (rightPressed && checkAxisCooldown(103, rightPressed, 150)) {
          window.dispatchEvent(new CustomEvent('gamepad-tetris-right'));
        }

        // Soft drop (100ms cooldown)
        if (downPressed && checkAxisCooldown(101, downPressed, 100)) {
          window.dispatchEvent(new CustomEvent('gamepad-tetris-down'));
        }

        // Rotate clockwise (D-pad Up or A button)
        const isRotatePressed = upPressed || gp.buttons[0]?.pressed;
        if (isRotatePressed && checkAxisCooldown(100, isRotatePressed, 250)) {
          window.dispatchEvent(new CustomEvent('gamepad-tetris-rotate'));
        }

        // Hard Drop (X Button)
        if (gp.buttons[2]?.pressed && checkCooldown(2, 350)) {
          window.dispatchEvent(new CustomEvent('gamepad-tetris-drop'));
        }

        // Pause Game (B Button)
        if (gp.buttons[1]?.pressed && checkCooldown(1, 350)) {
          window.dispatchEvent(new CustomEvent('gamepad-tetris-pause'));
        }
      } else if (isMapMode) {
        // --- MAP NAVIGATION CONTROLS ---

        // A button (0): Select active shop / Open details
        if (checkCooldown(0)) {
          if (activeShopId) {
            const shop = shops.find((s) => s.id === activeShopId);
            if (shop && !selectedShop) {
              setSelectedShop(shop);
            }
          } else {
            if (shops.length > 0) {
              setActiveShopId(shops[0].id);
            }
          }
        }

        // B button (1): Clear highlighted pin
        if (checkCooldown(1)) {
          if (activeShopId) {
            setActiveShopId(null);
          }
        }

        // X button (2): Toggle Favorite
        if (checkCooldown(2)) {
          if (activeShopId) {
            onToggleFavorite(activeShopId);
          }
        }

        // Left stick / D-pad: Panning camera
        const axisX = gp.axes[0];
        const axisY = gp.axes[1];
        const dpadUp = gp.buttons[12]?.pressed;
        const dpadDown = gp.buttons[13]?.pressed;
        const dpadLeft = gp.buttons[14]?.pressed;
        const dpadRight = gp.buttons[15]?.pressed;

        const deadzone = 0.25;
        let panX = 0;
        let panY = 0;

        if (Math.abs(axisX) > deadzone) panX = axisX;
        if (Math.abs(axisY) > deadzone) panY = axisY;

        if (dpadLeft) panX = -0.8;
        if (dpadRight) panX = 0.8;
        if (dpadUp) panY = -0.8;
        if (dpadDown) panY = 0.8;

        if (panX !== 0 || panY !== 0) {
          window.dispatchEvent(new CustomEvent('gamepad-pan', {
            detail: { x: panX, y: panY }
          }));
        }

        // D-pad Left/Right clicks: Cycle active shop pin highlight
        if (checkCooldown(15, 300)) { // D-pad Right
          cycleActiveShop(1);
        }
        if (checkCooldown(14, 300)) { // D-pad Left
          cycleActiveShop(-1);
        }

        // LT / RT triggers: Zoom map in / out
        if (gp.buttons[6]?.pressed && checkCooldown(6, 350)) { // LT (Zoom out)
          window.dispatchEvent(new CustomEvent('gamepad-zoom', { detail: { direction: 'out' } }));
        }
        if (gp.buttons[7]?.pressed && checkCooldown(7, 350)) { // RT (Zoom in)
          window.dispatchEvent(new CustomEvent('gamepad-zoom', { detail: { direction: 'in' } }));
        }
      } else {
        // --- MENU FOCUS NAVIGATION CONTROLS ---
        const elements = getFocusableElements();

        if (elements.length > 0) {
          // Keep focused index within current elements bounds
          if (focusedIndexRef.current >= elements.length) {
            focusedIndexRef.current = elements.length - 1;
          }

          const focusedElement = focusedIndexRef.current >= 0 ? elements[focusedIndexRef.current] : null;

          const axisX = gp.axes[0];
          const axisY = gp.axes[1];
          const stickDeadzone = 0.5;

          const stickUp = axisY < -stickDeadzone;
          const stickDown = axisY > stickDeadzone;
          const stickLeft = axisX < -stickDeadzone;
          const stickRight = axisX > stickDeadzone;

          const upPressed = gp.buttons[12]?.pressed || stickUp;
          const downPressed = gp.buttons[13]?.pressed || stickDown;
          const leftPressed = gp.buttons[14]?.pressed || stickLeft;
          const rightPressed = gp.buttons[15]?.pressed || stickRight;

          // If focused on range slider, let D-pad left/right adjust its value
          const isSlider = focusedElement?.tagName === 'INPUT' && (focusedElement as HTMLInputElement).type === 'range';

          if (isSlider && (leftPressed || rightPressed)) {
            const isLeftCooldowned = checkAxisCooldown(102, leftPressed, 100);
            const isRightCooldowned = checkAxisCooldown(103, rightPressed, 100);

            if (isLeftCooldowned || isRightCooldowned) {
              const slider = focusedElement as HTMLInputElement;
              const min = parseFloat(slider.min) || 0;
              const max = parseFloat(slider.max) || 100;
              const step = parseFloat(slider.step) || 1;
              let val = parseFloat(slider.value);

              if (leftPressed) {
                val = Math.max(min, val - step);
              } else {
                val = Math.min(max, val + step);
              }

              slider.value = val.toString();
              // Dispatch input & change events for React
              slider.dispatchEvent(new Event('input', { bubbles: true }));
              slider.dispatchEvent(new Event('change', { bubbles: true }));
            }
          } else {
            // Horizontal D-pad clicks: cycle focus index
            const isLeftCooldowned = checkAxisCooldown(102, leftPressed, 180);
            const isRightCooldowned = checkAxisCooldown(103, rightPressed, 180);

            if (isLeftCooldowned) {
              const nextIndex = focusedIndexRef.current === -1 
                ? 0 
                : (focusedIndexRef.current - 1 + elements.length) % elements.length;
              updateFocus(elements, nextIndex);
            }
            if (isRightCooldowned) {
              const nextIndex = focusedIndexRef.current === -1 
                ? 0 
                : (focusedIndexRef.current + 1) % elements.length;
              updateFocus(elements, nextIndex);
            }
          }

          // Vertical D-pad clicks: cycle focus index
          const isUpCooldowned = checkAxisCooldown(100, upPressed, 180);
          const isDownCooldowned = checkAxisCooldown(101, downPressed, 180);

          if (isUpCooldowned) {
            const nextIndex = focusedIndexRef.current === -1 
              ? 0 
              : (focusedIndexRef.current - 1 + elements.length) % elements.length;
            updateFocus(elements, nextIndex);
          }
          if (isDownCooldowned) {
            const nextIndex = focusedIndexRef.current === -1 
              ? 0 
              : (focusedIndexRef.current + 1) % elements.length;
            updateFocus(elements, nextIndex);
          }
        }

        // A button (0): Click or focus the currently highlighted item
        if (checkCooldown(0)) {
          const elements = getFocusableElements();
          if (focusedIndexRef.current >= 0 && focusedIndexRef.current < elements.length) {
            const el = elements[focusedIndexRef.current];
            el.click();
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
              el.focus();
            }
          }
        }

        // B button (1): Back / Close modal drawers
        if (checkCooldown(1)) {
          if (document.querySelector('.tetris-game-active') && document.querySelector('.tetris-pause-overlay')) {
            // If Tetris is paused, B button resumes the game!
            window.dispatchEvent(new CustomEvent('gamepad-tetris-pause'));
          } else if (selectedShop) {
            const closeBtn = document.querySelector('.panel-close-btn') as HTMLElement;
            if (closeBtn) {
              closeBtn.click();
            } else {
              setSelectedShop(null);
            }
          } else {
            // Check if pot collection active designer is open
            const closeButtons = Array.from(document.querySelectorAll('.gamepad-focusable, button'));
            const potClose = closeButtons.find(el => el.textContent === 'ปิด') as HTMLElement;
            if (potClose) {
              potClose.click();
            } else if (activeTab !== 'store') {
              setActiveTab('store'); // navigate back to map view
            }
          }
        }
      }

      // 5. Y button (3): Toggle retractable navigation menu bar (Always active)
      if (checkCooldown(3)) {
        window.dispatchEvent(new CustomEvent('gamepad-toggle-menu'));
      }
    }
    requestRef.current = requestAnimationFrame(pollGamepad);
  };

  const cycleActiveShop = (direction: number) => {
    if (shops.length === 0) return;
    const currentIndex = shops.findIndex((s) => s.id === activeShopId);
    if (currentIndex === -1) {
      setActiveShopId(shops[0].id);
    } else {
      const nextIndex = (currentIndex + direction + shops.length) % shops.length;
      setActiveShopId(shops[nextIndex].id);
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(pollGamepad);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [activeTab, activeShopId, selectedShop, favorites, shops]);

  return null; // non-visual
};
