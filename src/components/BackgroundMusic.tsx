import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export const BackgroundMusic: React.FC = () => {
  const [isMuted, setIsMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [originUrl, setOriginUrl] = useState('');

  useEffect(() => {
    // Dynamically retrieve origin to authorize YouTube JS API calls
    setOriginUrl(window.location.origin);
  }, []);

  const toggleMute = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    if (isMuted) {
      // Unmute, set volume, and play
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: [] }), '*');
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [50] }), '*');
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
      setIsMuted(false);
    } else {
      // Mute
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [] }), '*');
      setIsMuted(true);
    }
  };

  return (
    <>
      {/* Hidden YouTube IFrame Player with visibility hacks to prevent browser suspending */}
      {originUrl && (
        <iframe
          ref={iframeRef}
          width="1"
          height="1"
          src={`https://www.youtube.com/embed/2GMGvAhzySs?autoplay=1&loop=1&playlist=2GMGvAhzySs&mute=1&enablejsapi=1&origin=${encodeURIComponent(originUrl)}`}
          title="Background Music"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
            opacity: 0,
            pointerEvents: 'none',
            zIndex: -9999
          }}
        ></iframe>
      )}

      {/* Floating sound control button */}
      <button
        onClick={toggleMute}
        className="gamepad-focusable"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 3000,
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'var(--white)',
          border: '1.5px solid var(--primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: 'var(--card-shadow)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        title="เปิด/ปิดเพลงประกอบสุดอบอุ่น (Mute/Unmute)"
      >
        {isMuted ? (
          <VolumeX size={18} style={{ color: 'var(--text-muted)' }} />
        ) : (
          <Volume2 
            size={18} 
            style={{ 
              color: 'var(--primary-light)', 
              animation: 'float 2.5s ease-in-out infinite' 
            }} 
          />
        )}
      </button>
    </>
  );
};
