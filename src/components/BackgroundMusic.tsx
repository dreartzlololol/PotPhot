import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface BackgroundMusicProps {
  isPlaying?: boolean;
}

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ isPlaying = false }) => {
  const [isMuted, setIsMuted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [originUrl, setOriginUrl] = useState('');

  useEffect(() => {
    // Dynamically retrieve origin to authorize YouTube JS API calls
    setOriginUrl(window.location.origin);
  }, []);

  // Send postMessage to control YouTube iframe playback when isPlaying or isMuted changes
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    if (isPlaying && !isMuted) {
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: [] }), '*');
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [50] }), '*');
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
    } else {
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [] }), '*');
    }
  }, [isPlaying, isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <>
      {/* Hidden YouTube IFrame Player with JS API enabled */}
      {originUrl && (
        <iframe
          ref={iframeRef}
          width="1"
          height="1"
          src={`https://www.youtube.com/embed/2GMGvAhzySs?autoplay=${isPlaying ? 1 : 0}&loop=1&playlist=2GMGvAhzySs&mute=${isPlaying && !isMuted ? 0 : 1}&enablejsapi=1&origin=${encodeURIComponent(originUrl)}`}
          title="Tetris Background Music"
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
        />
      )}

      {/* Floating sound control button - Only visible when in Tetris section */}
      {isPlaying && (
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
          title="เปิด/ปิดเพลงประกอบเกม Tetris (Mute/Unmute)"
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
      )}
    </>
  );
};
