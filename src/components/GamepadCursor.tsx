import React, { useEffect, useState, useRef } from 'react';

export const GamepadCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  const positionRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const requestRef = useRef<number | null>(null);
  const clickCooldownRef = useRef(0);

  const pollGamepad = () => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = Array.from(gamepads).find((g) => g !== null);

    if (gp) {
      const isTetrisActive = !!document.querySelector('.tetris-game-active');
      if (isTetrisActive) {
        if (isVisible) setIsVisible(false);
        requestRef.current = requestAnimationFrame(pollGamepad);
        return;
      }

      if (!isVisible) setIsVisible(true);

      // Xbox Controller mappings:
      // Right Stick X: axis 2
      // Right Stick Y: axis 3
      // LT (Left Trigger): button 6
      // RT (Right Trigger): button 7

      const rightStickX = gp.axes[2];
      const rightStickY = gp.axes[3];
      const deadzone = 0.15;

      let dx = 0;
      let dy = 0;

      if (Math.abs(rightStickX) > deadzone) {
        dx = rightStickX * 12; // Speed factor
      }
      if (Math.abs(rightStickY) > deadzone) {
        dy = rightStickY * 12; // Speed factor
      }

      if (dx !== 0 || dy !== 0) {
        positionRef.current.x = Math.max(0, Math.min(window.innerWidth, positionRef.current.x + dx));
        positionRef.current.y = Math.max(0, Math.min(window.innerHeight, positionRef.current.y + dy));
        setPosition({ x: positionRef.current.x, y: positionRef.current.y });
        
        // Dispatch mousemove for drag/draw support
        const element = document.elementFromPoint(positionRef.current.x, positionRef.current.y);
        if (element) {
          element.dispatchEvent(new MouseEvent('mousemove', {
            view: window, bubbles: true, cancelable: true,
            clientX: positionRef.current.x, clientY: positionRef.current.y,
            button: isClicking ? 0 : -1, buttons: isClicking ? 1 : 0
          }));
        }
      }

      // Scrolling with Left Stick
      const leftStickX = gp.axes[0];
      const leftStickY = gp.axes[1];
      if (Math.abs(leftStickX) > deadzone || Math.abs(leftStickY) > deadzone) {
        const scrollTarget = document.elementFromPoint(positionRef.current.x, positionRef.current.y);
        if (scrollTarget) {
          let el: Element | null = scrollTarget;
          let scrolled = false;
          while (el && el !== document.documentElement) {
            if (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) {
              const prevTop = el.scrollTop;
              const prevLeft = el.scrollLeft;
              el.scrollBy({
                left: Math.abs(leftStickX) > deadzone ? leftStickX * 15 : 0,
                top: Math.abs(leftStickY) > deadzone ? leftStickY * 15 : 0,
              });
              if (el.scrollTop !== prevTop || el.scrollLeft !== prevLeft) {
                scrolled = true;
                break;
              }
            }
            el = el.parentElement;
          }
          if (!scrolled) {
            window.scrollBy({
              left: Math.abs(leftStickX) > deadzone ? leftStickX * 15 : 0,
              top: Math.abs(leftStickY) > deadzone ? leftStickY * 15 : 0,
            });
          }
        }
      }

      // Handle Clicks
      const leftTriggerPressed = gp.buttons[6]?.pressed;
      const rightTriggerPressed = gp.buttons[7]?.pressed;

      const now = Date.now();

      if ((rightTriggerPressed || leftTriggerPressed) && !isClicking && now - clickCooldownRef.current > 100) {
        setIsClicking(true);
        clickCooldownRef.current = now;
        
        // RT = left click (0), LT = right click (2)
        const button = rightTriggerPressed ? 0 : 2;
        simulateMouseEvent('mousedown', positionRef.current.x, positionRef.current.y, button);
      } else if (!leftTriggerPressed && !rightTriggerPressed && isClicking) {
        setIsClicking(false);
        simulateMouseEvent('mouseup', positionRef.current.x, positionRef.current.y, 0);
        simulateMouseEvent('click', positionRef.current.x, positionRef.current.y, 0);
      }
    } else {
      if (isVisible) setIsVisible(false);
    }

    requestRef.current = requestAnimationFrame(pollGamepad);
  };

  const simulateMouseEvent = (type: string, x: number, y: number, button: number) => {
    const element = document.elementFromPoint(x, y);
    if (element) {
      const mouseEventInit = {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        button: button,
        buttons: type === 'mousedown' ? (button === 2 ? 2 : 1) : 0,
      };

      element.dispatchEvent(new MouseEvent(type, mouseEventInit));
    }
  };

  useEffect(() => {
    // Keep window dimensions updated
    const handleResize = () => {
      positionRef.current.x = Math.min(positionRef.current.x, window.innerWidth);
      positionRef.current.y = Math.min(positionRef.current.y, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    requestRef.current = requestAnimationFrame(pollGamepad);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isVisible, isClicking]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: 32,
        height: 32,
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 3 10.5 21 13.5 13.5 21 10.5 3 3" fill="rgba(0,0,0,0.5)"/></svg>')`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        pointerEvents: 'none',
        zIndex: 999999,
        marginLeft: '-4px', // Adjust so the point of the cursor aligns with the actual coordinate
        marginTop: '-4px',
        filter: isClicking ? 'drop-shadow(0px 0px 4px #00e676) scale(0.9)' : 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))',
        transition: 'filter 0.1s',
      }}
    />
  );
};
