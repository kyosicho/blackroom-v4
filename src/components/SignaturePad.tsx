import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, Edit2 } from 'lucide-react';

interface SignaturePadProps {
  onSign: (dataUrl: string) => void;
  onClear: () => void;
  height?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSign, onClear, height = 'h-48' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        // 이미 서명이 있는 경우 데이터를 임시 저장
        const tempImage = canvas.toDataURL();

        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        
        ctx.strokeStyle = '#ee2b5b';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 리사이즈 후 기존 서명 복구 (비율 유지 시도)
        const img = new Image();
        img.src = tempImage;
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
      setHasSigned(true);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        onSign(canvas.toDataURL('image/png'));
      }
    }
  };

  const clearCanvas = (e: React.MouseEvent) => {
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setHasSigned(false);
      onClear();
    }
  };

  return (
    <div className={`relative ${height} w-full rounded-2xl border-2 border-dashed border-primary/30 bg-white shadow-inner overflow-hidden cursor-crosshair`}>
      {!hasSigned && (
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 pointer-events-none">
          <Edit2 className="size-10 text-primary mb-2" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Sign Here</span>
        </div>
      )}
      <canvas 
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="absolute inset-0 w-full h-full touch-none"
      />
      {hasSigned && (
        <button 
          onClick={clearCanvas}
          className="absolute bottom-2 right-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-primary transition-colors shadow-sm active:scale-95"
          title="서명 지우기"
        >
          <RotateCcw className="size-4" />
        </button>
      )}
    </div>
  );
};

export default SignaturePad;
