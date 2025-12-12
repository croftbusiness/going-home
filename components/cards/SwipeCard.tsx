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
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 100;
  const ROTATION_FACTOR = 0.1;

  useEffect(() => {
    if (!isActive) {
      setDragOffset({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isActive]);

  const handleStart = (clientX: number, clientY: number) => {
    if (!isActive) return;
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !isActive) return;
    
    const deltaX = clientX - startPos.x;
    const deltaY = clientY - startPos.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleEnd = () => {
    if (!isDragging || !isActive) return;
    
    const absX = Math.abs(dragOffset.x);
    
    if (absX > SWIPE_THRESHOLD) {
      if (dragOffset.x > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    }
    
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
  };

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
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleGlobalMouseUp = () => {
      handleEnd();
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragOffset, startPos]);

  const rotation = dragOffset.x * ROTATION_FACTOR;
  const opacity = isDragging ? 1 - Math.abs(dragOffset.x) / 300 : 1;

  return (
    <div
      ref={cardRef}
      className={`absolute inset-0 w-full h-full transition-transform duration-200 ${
        isActive ? 'z-10' : 'z-0 opacity-0 pointer-events-none'
      }`}
      style={{
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
        opacity,
        touchAction: 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      <div className="w-full h-full bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col">
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
          <div className={`text-2xl font-bold mb-3 ${
            card.emotional_weight === 'heavy' ? 'text-gray-900' : 
            card.emotional_weight === 'medium' ? 'text-gray-800' : 
            'text-gray-700'
          }`}>
            {card.title}
          </div>
          <div className="text-gray-600 text-base leading-relaxed mb-6">
            {card.description}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onSwipeLeft}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Snooze
          </button>
          <button
            onClick={onSwipeRight}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              card.card_type === 'action'
                ? 'bg-[#1DB954] text-white hover:bg-[#1ed760]'
                : 'bg-gray-900 text-white hover:bg-gray-800'
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
        <div className="text-xs text-gray-400 text-center mt-4">
          Swipe right to {card.card_type === 'action' ? 'continue' : 'acknowledge'} • Swipe left to snooze
        </div>
      </div>
    </div>
  );
}

