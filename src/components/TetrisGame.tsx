import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, RotateCcw, ShieldAlert, Flame, Maximize, Minimize,
  ArrowLeft, ArrowRight, ArrowDown, RotateCw, ChevronsDown 
} from 'lucide-react';

interface TetrisGameProps {
  userPoints: number;
  onAwardPoints: (points: number) => void;
}

const BOARD_COLS = 10;
const BOARD_ROWS = 20;

// Tetromino definitions
const TETROMINOES = {
  I: {
    shape: [[1, 1, 1, 1]],
    colorClass: 'tetris-cell-clay-orange',
    name: 'แท่งดินส้ม'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    colorClass: 'tetris-cell-clay-brown',
    name: 'ดินเหลี่ยมน้ำตาล'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    colorClass: 'tetris-cell-clay-gold',
    name: 'จุกมังกรทอง'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    colorClass: 'tetris-cell-clay-green',
    name: 'หยกหงายซ้าย'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    colorClass: 'tetris-cell-clay-blue',
    name: 'หยกหงายขวา'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    colorClass: 'tetris-cell-clay-purple',
    name: 'มุมขม่วง'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    colorClass: 'tetris-cell-clay-bronze',
    name: 'มุมทองบรอนซ์'
  }
};

type PieceType = keyof typeof TETROMINOES;
const PIECE_TYPES: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

// Create an empty board grid
const createEmptyBoard = () => 
  Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(''));

export const TetrisGame: React.FC<TetrisGameProps> = ({ userPoints, onAwardPoints }) => {
  const [board, setBoard] = useState<string[][]>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState({
    shape: TETROMINOES.I.shape,
    colorClass: TETROMINOES.I.colorClass,
    type: 'I' as PieceType,
    x: 3,
    y: 0
  });
  const [nextPiece, setNextPiece] = useState<PieceType>('O');
  
  // Game states
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Fullscreen toggle state & container ref
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement && document.fullscreenElement === containerRef.current);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Mascot bubble response
  const [mascotBubble, setMascotBubble] = useState(
    'สวัสดีครับ! มาลองเล่นเกมตัวต่อดินเผากันเถอะครับ เคลียร์แถวเพื่อสะสมคะแนนปั้นดินสะสมระดับช่างปั้นนะคร้าบ! 🐉🧱'
  );
  const [highlightLineIndices, setHighlightLineIndices] = useState<number[]>([]);

  // Refs for tracking mutable game state in listeners
  const boardRef = useRef(board);
  const currentPieceRef = useRef(currentPiece);
  const isGameOverRef = useRef(isGameOver);
  const isPausedRef = useRef(isPaused);
  const gameStartedRef = useRef(gameStarted);

  // Keep refs updated
  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { currentPieceRef.current = currentPiece; }, [currentPiece]);
  useEffect(() => { isGameOverRef.current = isGameOver; }, [isGameOver]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { gameStartedRef.current = gameStarted; }, [gameStarted]);

  // Generate new random piece
  const getNextPieceType = useCallback((): PieceType => {
    return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
  }, []);

  // Initialize Game
  const resetGame = () => {
    setBoard(createEmptyBoard());
    const initialPieceType = getNextPieceType();
    const nextPieceType = getNextPieceType();
    
    setCurrentPiece({
      shape: TETROMINOES[initialPieceType].shape,
      colorClass: TETROMINOES[initialPieceType].colorClass,
      type: initialPieceType,
      x: Math.floor((BOARD_COLS - TETROMINOES[initialPieceType].shape[0].length) / 2),
      y: 0
    });
    setNextPiece(nextPieceType);
    setScore(0);
    setLines(0);
    setLevel(1);
    setIsGameOver(false);
    setIsPaused(false);
    setGameStarted(true);
    setMascotBubble('เอาล่ะ! เตาอบพร้อมปั้นแล้ว สู้ๆ นะครับพี่ช่างปั้น! 🔥🧱');
  };

  // Collision detection helper
  const checkCollision = useCallback((
    pieceShape: number[][],
    px: number,
    py: number,
    currentBoard: string[][]
  ): boolean => {
    for (let r = 0; r < pieceShape.length; r++) {
      for (let c = 0; c < pieceShape[r].length; c++) {
        if (pieceShape[r][c] !== 0) {
          const nextX = px + c;
          const nextY = py + r;

          // Out of bounds checks
          if (nextX < 0 || nextX >= BOARD_COLS || nextY >= BOARD_ROWS) {
            return true;
          }

          // Colliding with locked block
          if (nextY >= 0 && currentBoard[nextY][nextX] !== '') {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  // Rotate piece matrix clockwise
  const rotatePieceMatrix = (matrix: number[][]): number[][] => {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        rotated[c][rows - 1 - r] = matrix[r][c];
      }
    }
    return rotated;
  };

  // Action: Rotate Piece
  const rotatePiece = useCallback(() => {
    if (!gameStartedRef.current || isGameOverRef.current || isPausedRef.current) return;
    
    const piece = currentPieceRef.current;
    const rotatedShape = rotatePieceMatrix(piece.shape);
    
    // Wall kick simple check
    let targetX = piece.x;
    if (targetX + rotatedShape[0].length > BOARD_COLS) {
      targetX = BOARD_COLS - rotatedShape[0].length;
    }
    if (targetX < 0) {
      targetX = 0;
    }

    if (!checkCollision(rotatedShape, targetX, piece.y, boardRef.current)) {
      setCurrentPiece(prev => ({
        ...prev,
        shape: rotatedShape,
        x: targetX
      }));
    }
  }, [checkCollision]);

  // Action: Move Piece Left/Right
  const movePiece = useCallback((dir: number) => {
    if (!gameStartedRef.current || isGameOverRef.current || isPausedRef.current) return;
    
    const piece = currentPieceRef.current;
    if (!checkCollision(piece.shape, piece.x + dir, piece.y, boardRef.current)) {
      setCurrentPiece(prev => ({
        ...prev,
        x: prev.x + dir
      }));
    }
  }, [checkCollision]);

  // Lock piece to the board grid
  const lockPiece = useCallback((piece: typeof currentPiece, currentBoard: string[][]) => {
    const updatedBoard = currentBoard.map(row => [...row]);
    
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c] !== 0) {
          const boardY = piece.y + r;
          const boardX = piece.x + c;
          if (boardY >= 0 && boardY < BOARD_ROWS) {
            updatedBoard[boardY][boardX] = piece.colorClass;
          }
        }
      }
    }

    // Check for completed rows
    const fullRowIndices: number[] = [];
    for (let r = BOARD_ROWS - 1; r >= 0; r--) {
      if (updatedBoard[r].every(cell => cell !== '')) {
        fullRowIndices.push(r);
      }
    }

    if (fullRowIndices.length > 0) {
      // Set line clear flash indicators
      setHighlightLineIndices(fullRowIndices);

      // Perform line clear calculations after animation
      setTimeout(() => {
        setHighlightLineIndices([]);
        setBoard(prevBoard => {
          let cleanBoard = prevBoard.filter((_, idx) => !fullRowIndices.includes(idx));
          const newRowsNeeded = BOARD_ROWS - cleanBoard.length;
          const blankRows = Array.from({ length: newRowsNeeded }, () => Array(BOARD_COLS).fill(''));
          return [...blankRows, ...cleanBoard];
        });

        // Award points based on count of lines cleared
        let awardedPoints = 0;
        let dialogue = '';
        if (fullRowIndices.length === 1) {
          awardedPoints = 10;
          dialogue = 'ว้าว! เคลียร์แถวดินเผาส้ม 1 แถวสำเร็จ! ดินเรียงตัวประณีต รับเพิ่ม +10 แต้มสะสมครับ 🏺✨';
        } else if (fullRowIndices.length === 2) {
          awardedPoints = 25;
          dialogue = 'สุดยอด! สองแถวพร้อมกัน อุณหภูมิอบดินกำลังฟู่เลยคร้าบ! รับ +25 แต้มครับ! 🧡🔥';
        } else if (fullRowIndices.length === 3) {
          awardedPoints = 50;
          dialogue = 'เก่งมากครับพี่ช่างปั้น! ดึงลายมังกรเคลือบแก้ว 3 แถวเรียงวับวาว รับ +50 แต้ม! 🐲🏆';
        } else if (fullRowIndices.length >= 4) {
          awardedPoints = 100;
          dialogue = 'อู้หูววว!! มังกรทองคำพ่นดินระเบิด 4 แถวรวด! TETRIS โพธารามระเบิดสะท้านทุ่ง! รับ +100 แต้มใหญ่!!! 🐉🔥💫🏆';
        }

        onAwardPoints(awardedPoints);
        setScore(prev => prev + awardedPoints * level);
        setLines(prev => prev + fullRowIndices.length);
        setMascotBubble(dialogue);

        // Level Up check (every 10 lines)
        setLines(prevLines => {
          const nextLines = prevLines + fullRowIndices.length;
          const nextLvl = Math.floor(nextLines / 10) + 1;
          if (nextLvl > level) {
            setLevel(nextLvl);
            setMascotBubble(prev => `ฉลองเลเวลอัพ! ตอนนี้เตาอบเลเวล ${nextLvl} แล้วนะคร้าบ ตัวต่อปั้นรวดเร็วขึ้นแล้ว! 🚀🏺\n${prev}`);
          }
          return prevLines; // setLines handles state internally
        });

      }, 350);

    } else {
      setBoard(updatedBoard);
      
      // Warn user if close to top
      const blocksNearTop = updatedBoard[3].some(cell => cell !== '');
      if (blocksNearTop) {
        setMascotBubble('ระวังนะครับระวัง! ปล่องเตาอบปั้นดินใกล้ล้นสูงท่วมปากทางแล้วนะคร้าบ! 🚨💥');
      }
    }

    // Spawn next piece
    setCurrentPiece(() => {
      const nextType = nextPiece;
      const nextNext = getNextPieceType();
      setNextPiece(nextNext);

      const spawnX = Math.floor((BOARD_COLS - TETROMINOES[nextType].shape[0].length) / 2);
      const spawnPiece = {
        shape: TETROMINOES[nextType].shape,
        colorClass: TETROMINOES[nextType].colorClass,
        type: nextType,
        x: spawnX,
        y: 0
      };

      // Game Over check at spawn
      if (checkCollision(spawnPiece.shape, spawnPiece.x, spawnPiece.y, updatedBoard)) {
        setIsGameOver(true);
        setMascotBubble('โอ๊ะโอ... เตาอบระบายความร้อนไม่ทัน ดินปั้นล้นทะลักปากปล่องเสียแล้ว! กดเริ่มใหม่มาปั้นลุยกันอีกนะ 🐉❌🧱');
      }

      return spawnPiece;
    });
  }, [nextPiece, level, getNextPieceType, checkCollision, onAwardPoints]);

  // Action: Tick gravity drop
  const dropPiece = useCallback(() => {
    if (!gameStartedRef.current || isGameOverRef.current || isPausedRef.current) return;

    const piece = currentPieceRef.current;
    if (!checkCollision(piece.shape, piece.x, piece.y + 1, boardRef.current)) {
      setCurrentPiece(prev => ({
        ...prev,
        y: prev.y + 1
      }));
    } else {
      lockPiece(piece, boardRef.current);
    }
  }, [checkCollision, lockPiece]);

  // Action: Hard Drop (Instantly drop to bottom)
  const hardDropPiece = useCallback(() => {
    if (!gameStartedRef.current || isGameOverRef.current || isPausedRef.current) return;

    const piece = currentPieceRef.current;
    let targetY = piece.y;
    while (!checkCollision(piece.shape, piece.x, targetY + 1, boardRef.current)) {
      targetY++;
    }
    
    const droppedPiece = { ...piece, y: targetY };
    lockPiece(droppedPiece, boardRef.current);
  }, [checkCollision, lockPiece]);

  // Action: Pause Toggle
  const togglePause = useCallback(() => {
    if (!gameStartedRef.current || isGameOverRef.current) return;
    setIsPaused(prev => {
      const nextVal = !prev;
      setMascotBubble(nextVal ? 'เกมหยุดชั่วคราว ดื่มน้ำชาโพธารามรอสักครู่นะครับ 🍵🐉' : 'ลุยแต่งกระถางดินเผากันต่อเลยคร้าบ! 🏺🔥');
      return nextVal;
    });
  }, []);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'a' || e.key === 'ArrowLeft') {
        movePiece(-1);
      } else if (key === 'd' || e.key === 'ArrowRight') {
        movePiece(1);
      } else if (key === 'w' || e.key === 'ArrowUp') {
        rotatePiece();
      } else if (key === 's' || e.key === 'ArrowDown') {
        dropPiece();
      } else if (e.key === ' ') {
        e.preventDefault();
        hardDropPiece();
      } else if (key === 'p' || e.key === 'Escape') {
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePiece, rotatePiece, dropPiece, hardDropPiece, togglePause]);

  // Gamepad Custom Events listeners
  useEffect(() => {
    const handleGamepadLeft = () => movePiece(-1);
    const handleGamepadRight = () => movePiece(1);
    const handleGamepadRotate = () => rotatePiece();
    const handleGamepadDown = () => dropPiece();
    const handleGamepadHardDrop = () => hardDropPiece();
    const handleGamepadPause = () => togglePause();

    window.addEventListener('gamepad-tetris-left', handleGamepadLeft);
    window.addEventListener('gamepad-tetris-right', handleGamepadRight);
    window.addEventListener('gamepad-tetris-rotate', handleGamepadRotate);
    window.addEventListener('gamepad-tetris-down', handleGamepadDown);
    window.addEventListener('gamepad-tetris-drop', handleGamepadHardDrop);
    window.addEventListener('gamepad-tetris-pause', handleGamepadPause);

    return () => {
      window.removeEventListener('gamepad-tetris-left', handleGamepadLeft);
      window.removeEventListener('gamepad-tetris-right', handleGamepadRight);
      window.removeEventListener('gamepad-tetris-rotate', handleGamepadRotate);
      window.removeEventListener('gamepad-tetris-down', handleGamepadDown);
      window.removeEventListener('gamepad-tetris-drop', handleGamepadHardDrop);
      window.removeEventListener('gamepad-tetris-pause', handleGamepadPause);
    };
  }, [movePiece, rotatePiece, dropPiece, hardDropPiece, togglePause]);

  // Gravity Drop Ticker Loop
  useEffect(() => {
    if (!gameStarted || isGameOver || isPaused) return;

    // Drop speed starts at 800ms, decreases by 80ms per level (floor at 120ms)
    const tickRate = Math.max(120, 800 - (level - 1) * 80);
    const ticker = setInterval(dropPiece, tickRate);

    return () => clearInterval(ticker);
  }, [gameStarted, isGameOver, isPaused, level, dropPiece]);

  // Merge current active piece preview on the board to display
  const displayBoard = board.map(row => [...row]);
  
  if (gameStarted && !isGameOver) {
    for (let r = 0; r < currentPiece.shape.length; r++) {
      for (let c = 0; c < currentPiece.shape[r].length; c++) {
        if (currentPiece.shape[r][c] !== 0) {
          const boardY = currentPiece.y + r;
          const boardX = currentPiece.x + c;
          if (boardY >= 0 && boardY < BOARD_ROWS && boardX >= 0 && boardX < BOARD_COLS) {
            displayBoard[boardY][boardX] = currentPiece.colorClass;
          }
        }
      }
    }
  }

  // Next piece preview shape representation
  const renderNextPreview = () => {
    const nextShape = TETROMINOES[nextPiece].shape;
    const nextColorClass = TETROMINOES[nextPiece].colorClass;
    const previewGrid = Array.from({ length: 4 }, () => Array(4).fill(''));
    
    const startRow = Math.floor((4 - nextShape.length) / 2);
    const startCol = Math.floor((4 - nextShape[0].length) / 2);

    for (let r = 0; r < nextShape.length; r++) {
      for (let c = 0; c < nextShape[r].length; c++) {
        if (nextShape[r][c] !== 0) {
          previewGrid[startRow + r][startCol + c] = nextColorClass;
        }
      }
    }

    return previewGrid.map((row, rIdx) => (
      <React.Fragment key={rIdx}>
        {row.map((cell, cIdx) => (
          <div
            key={cIdx}
            className={`tetris-next-cell ${cell ? cell : 'tetris-cell-empty'}`}
          />
        ))}
      </React.Fragment>
    ));
  };

  return (
    <div ref={containerRef} className={`tetris-game-wrapper tetris-game-active ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      
      {/* Mascot Cheers Dialogue overlay bubble */}
      <div 
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '16px 20px',
          borderRadius: '16px',
          background: 'var(--white)',
          border: '1.5px solid var(--primary-light)',
          animation: 'float 4s ease-in-out infinite'
        }}
      >
        <img 
          src="/mascot.png" 
          alt="Cheering Mascot Dragon" 
          style={{ width: '56px', height: '56px', objectFit: 'contain' }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🐉 น้องมังกรนำโชคเชียร์ปั้น:
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-dark)', marginTop: '4px', fontWeight: 600, lineHeight: '1.4' }}>
            {mascotBubble}
          </p>
        </div>
      </div>

      {/* Main Tetris Layout container */}
      <div className="tetris-main-layout">
        
        {/* Gameboard container */}
        <div className="tetris-board-container">
          
          {/* Overlays */}
          {!gameStarted && (
            <div className="tetris-game-over-overlay">
              <Flame size={48} style={{ color: 'var(--gold)', animation: 'float 2s infinite' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)', marginTop: '12px' }}>
                เตาอบตัวต่อมังกรดินเผา
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '6px 0 16px', maxWidth: '200px' }}>
                หมุนแต่งชิ้นส่วนบล็อกดินดิบจัดลงเตาอบดินเผาสะสมแต้มช่างปั้นสวนด่วน!
              </p>
              <button onClick={resetGame} className="premium-btn gamepad-focusable" style={{ padding: '8px 20px', fontSize: '13px' }}>
                <Play size={14} />
                <span>เริ่มเผาอิฐดิน! (Start)</span>
              </button>
            </div>
          )}

          {isGameOver && (
            <div className="tetris-game-over-overlay">
              <ShieldAlert size={48} style={{ color: 'var(--clay)' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--clay)', marginTop: '12px' }}>
                เตาปั้นดินถล่ม! (Game Over)
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '6px 0 16px' }}>
                คะแนนรวมที่คุณทลาย: <strong style={{ color: 'var(--primary)', fontSize: '14px' }}>{score} แต้ม</strong>
              </p>
              <button onClick={resetGame} className="clay-btn gamepad-focusable" style={{ padding: '8px 20px', fontSize: '13px', border: '1px solid var(--clay)' }}>
                <RotateCcw size={14} />
                <span>เปิดเตาอบใหม่! (Restart)</span>
              </button>
            </div>
          )}

          {isPaused && (
            <div className="tetris-pause-overlay">
              <Pause size={32} style={{ color: 'var(--primary)', animation: 'pulse-glow 1.5s infinite' }} />
              <span style={{ marginTop: '8px', fontSize: '14px', color: 'var(--primary)' }}>หยุดเตาอบดินชั่วคราว</span>
            </div>
          )}

          {/* Core Grid Matrix */}
          <div className="tetris-board">
            {displayBoard.map((row, rIdx) => {
              const isClearing = highlightLineIndices.includes(rIdx);
              return row.map((cell, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={`tetris-cell ${
                    isClearing 
                      ? 'tetris-line-clearing' 
                      : cell 
                      ? cell 
                      : 'tetris-cell-empty'
                  }`}
                />
              ));
            })}
          </div>

        </div>

        {/* Sidebar Info Section */}
        <div className="tetris-sidebar">
          
          {/* Next block preview */}
          <div className="tetris-stat-box">
            <span className="tetris-stat-label">ชิ้นถัดไป (Next)</span>
            <div className="tetris-next-preview-board" style={{ marginTop: '10px' }}>
              {renderNextPreview()}
            </div>
          </div>

          {/* Overall Garden Points */}
          <div className="tetris-stat-box">
            <span className="tetris-stat-label">แต้มสวนรวม (Garden Pts)</span>
            <div className="tetris-stat-val" style={{ color: 'var(--primary-light)' }}>
              {userPoints}
            </div>
          </div>

          {/* Scores */}
          <div className="tetris-stat-box">
            <span className="tetris-stat-label">คะแนนช่างปั้น (Score)</span>
            <div className="tetris-stat-val">{score}</div>
          </div>

          {/* Level / Speeds */}
          <div className="tetris-stat-box">
            <span className="tetris-stat-label">เลเวลเตา (Level)</span>
            <div className="tetris-stat-val" style={{ color: 'var(--clay-light)' }}>
              Lv.{level}
            </div>
          </div>

          {/* Cleared Lines count */}
          <div className="tetris-stat-box">
            <span className="tetris-stat-label">แถวที่ทำลาย (Lines)</span>
            <div className="tetris-stat-val">{lines}</div>
          </div>

          {/* Controls Guideline */}
          {gameStarted && !isGameOver && (
            <button 
              className="gamepad-focusable"
              onClick={togglePause}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '12px',
                border: '1px solid rgba(0,0,0,0.06)',
                background: 'var(--white)',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-dark)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginBottom: '8px'
              }}
            >
              {isPaused ? <Play size={14} /> : <Pause size={14} />}
              <span>{isPaused ? 'เล่นต่อ (Resume)' : 'หยุดชั่วคราว (Pause)'}</span>
            </button>
          )}

          <button 
            className="gamepad-focusable"
            onClick={toggleFullscreen}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '12px',
              border: '1px solid rgba(0,0,0,0.06)',
              background: 'var(--white)',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--text-dark)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            <span>{isFullscreen ? 'ย่อหน้าจอ (Exit FS)' : 'ขยายเต็มจอ (Fullscreen)'}</span>
          </button>

        </div>

      </div>

      {/* On-Screen Touch Controller UI for Mobile Phones & Tablets */}
      {gameStarted && !isGameOver && (
        <div className="tetris-mobile-controls-panel glass-panel">
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            📱 <span>แผงปุ่มควบคุมสัมผัสบนมือถือ (Mobile Touch Pad)</span>
          </div>

          <div className="tetris-mobile-btn-grid">
            {/* Move Left */}
            <button 
              type="button"
              className="tetris-touch-btn gamepad-focusable"
              onMouseDown={(e) => { e.preventDefault(); movePiece(-1); }}
              onTouchStart={(e) => { e.preventDefault(); movePiece(-1); }}
              title="เลื่อนไปทางซ้าย"
            >
              <ArrowLeft size={22} />
              <span>ซ้าย ◀</span>
            </button>

            {/* Move Right */}
            <button 
              type="button"
              className="tetris-touch-btn gamepad-focusable"
              onMouseDown={(e) => { e.preventDefault(); movePiece(1); }}
              onTouchStart={(e) => { e.preventDefault(); movePiece(1); }}
              title="เลื่อนไปทางขวา"
            >
              <ArrowRight size={22} />
              <span>ขวา ▶</span>
            </button>

            {/* Rotate */}
            <button 
              type="button"
              className="tetris-touch-btn tetris-touch-btn-primary gamepad-focusable"
              onMouseDown={(e) => { e.preventDefault(); rotatePiece(); }}
              onTouchStart={(e) => { e.preventDefault(); rotatePiece(); }}
              title="หมุนชิ้นส่วนดินเผา"
            >
              <RotateCw size={22} />
              <span>หมุน 🔄</span>
            </button>

            {/* Soft Drop */}
            <button 
              type="button"
              className="tetris-touch-btn gamepad-focusable"
              onMouseDown={(e) => { e.preventDefault(); dropPiece(); }}
              onTouchStart={(e) => { e.preventDefault(); dropPiece(); }}
              title="เร่งบล็อกหล่นลงเร็ว"
            >
              <ArrowDown size={22} />
              <span>ลงเร็ว 🔽</span>
            </button>

            {/* Hard Drop */}
            <button 
              type="button"
              className="tetris-touch-btn tetris-touch-btn-accent gamepad-focusable"
              onMouseDown={(e) => { e.preventDefault(); hardDropPiece(); }}
              onTouchStart={(e) => { e.preventDefault(); hardDropPiece(); }}
              title="ทิ้งลงล่างสุดทันที"
            >
              <ChevronsDown size={22} />
              <span>วางทันที ⏬</span>
            </button>

            {/* Pause / Resume */}
            <button 
              type="button"
              className="tetris-touch-btn gamepad-focusable"
              onMouseDown={(e) => { e.preventDefault(); togglePause(); }}
              onTouchStart={(e) => { e.preventDefault(); togglePause(); }}
              title="หยุดชั่วคราว / เล่นต่อ"
            >
              {isPaused ? <Play size={20} /> : <Pause size={20} />}
              <span>{isPaused ? 'เล่นต่อ ▶' : 'หยุด ⏸'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
