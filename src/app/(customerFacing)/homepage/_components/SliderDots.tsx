// components/SliderDots.tsx

"use client";

import React from 'react';

interface SliderDotsProps {
  totalSlides: number;
  currentIndex: number;
  onDotClick: (index: number) => void;
}

export function SliderDots({ totalSlides, currentIndex, onDotClick }: SliderDotsProps) {
  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 flex space-x-2">
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={index}
          className={`w-3 h-3 rounded-full focus:outline-none ${
            currentIndex === index ? 'bg-blue-500' : 'bg-gray-300'
          }`}
          onClick={() => onDotClick(index)}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
}
