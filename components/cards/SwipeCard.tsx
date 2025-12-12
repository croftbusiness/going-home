'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface Card {
  id: string;
  card_type: 'action' | 'affirmation' | 'reflection';
  title: string;
  description: string;
  linked_section: string | null;
  priority: number;
  emotional_weight: 'light' | 'medium' | 'heavy';
}

interface SwipeCardProps {
  card: Card;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  onGoToDashboard: () => void;
  isActive: boolean;
}

export default function SwipeCard({ card, onSwipeRight, onSwipeLeft, onGoToDashboard, isActive }: SwipeCardProps) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);

  const SWIPE_THRESHOLD = 100;
  const ROTATION_FACTOR = 0.1;

  useEffect(() => {
    if (!isActive) {
      setDragOffset({ x: 0, y: 0 });
      setIsDragging(false);
      isAnimatingRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [isActive]);

  const handleStart = (clientX: number, clientY: number) => {
    if (!isActive || isAnimatingRef.current) return;
    setIsDragging(true);
    startPosRef.current = { x: clientX, y: clientY };
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !isActive || isAnimatingRef.current) return;
    
    const deltaX = clientX - startPosRef.current.x;
    const deltaY = clientY - startPosRef.current.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleEnd = () => {
    if (!isDragging || !isActive || isAnimatingRef.current) {
      setIsDragging(false);
      return;
    }
    
    const absX = Math.abs(dragOffset.x);
    const shouldSwipe = absX > SWIPE_THRESHOLD;
    
    if (shouldSwipe) {
      isAnimatingRef.current = true;
      const isRight = dragOffset.x > 0;
      animateOut(isRight, isRight ? onSwipeRight : onSwipeLeft);
    } else {
      springBack();
    }
  };

  const animateOut = (isRight: boolean, callback: () => void) => {
    const targetX = isRight ? window.innerWidth + 200 : -window.innerWidth - 200;
    const startX = dragOffset.x;
    const startTime = Date.now();
    const duration = 250;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentX = startX + (targetX - startX) * ease;
      
      setDragOffset({ x: currentX, y: dragOffset.y * (1 - progress) });
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDragOffset({ x: 0, y: 0 });
        setIsDragging(false);
        isAnimatingRef.current = false;
        animationFrameRef.current = null;
        callback();
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const springBack = () => {
    const startX = dragOffset.x;
    const startY = dragOffset.y;
    const startTime = Date.now();
    const duration = 300;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentX = startX * (1 - ease);
      const currentY = startY * (1 - ease);
      
      setDragOffset({ x: currentX, y: currentY });
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDragOffset({ x: 0, y: 0 });
        setIsDragging(false);
        animationFrameRef.current = null;
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Add global mouse listeners when dragging
  useEffect(() => {
    if (!isDragging || !isActive) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      handleEnd();
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) handleMove(touch.clientX, touch.clientY);
    };

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      handleEnd();
    };

    document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
    document.addEventListener('mouseup', handleGlobalMouseUp, { passive: false });
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd, { passive: false });
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, isActive]);

  const rotation = dragOffset.x * ROTATION_FACTOR;
  const opacity = isDragging ? 1 - Math.abs(dragOffset.x) / 400 : 1;

  return (
    <div
      ref={cardRef}
      className={`absolute inset-0 w-full h-full ${
        isActive ? 'z-10' : 'z-0 opacity-0 pointer-events-none'
      }`}
      style={{
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
        opacity,
        touchAction: 'none',
        willChange: isDragging ? 'transform' : 'auto',
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      <div className="w-full h-full bg-white rounded-2xl shadow-xl border border-gray-200 p-5 flex flex-col">
        {/* Header with skip button */}
        <div className="flex justify-between items-start mb-4">
          <div className="text-xs text-gray-500 font-medium">Today's Card</div>
          <button
            onClick={onGoToDashboard}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Go to Dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Content */}
        <div className="flex-1 flex flex-col justify-center">
          <div className={`text-xl font-bold mb-2 ${
            card.emotional_weight === 'heavy' ? 'text-gray-900' : 
            card.emotional_weight === 'medium' ? 'text-gray-800' : 
            'text-gray-700'
          }`}>
            {card.title}
          </div>
          <div className="text-gray-600 text-sm leading-relaxed mb-4">
            {card.description}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={onSwipeLeft}
            className="flex-1 px-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium active:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <X className="w-4 h-4" />
            Snooze
          </button>
          <button
            onClick={onSwipeRight}
            className={`flex-1 px-3 py-2.5 rounded-xl font-medium active:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm ${
              card.card_type === 'action'
                ? 'bg-[#1DB954] text-white'
                : 'bg-gray-900 text-white'
            }`}
          >
            {card.card_type === 'action' ? (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Got it
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Swipe hint */}
        <div className="text-xs text-gray-400 text-center mt-3">
          Swipe right to {card.card_type === 'action' ? 'continue' : 'acknowledge'} • Swipe left to snooze
        </div>
      </div>
    </div>
  );
}

