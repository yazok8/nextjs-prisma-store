"use client";

import { memo } from 'react';

interface SliderDotsProps {
  totalSlides: number;
  currentIndex: number;
  onDotClick: (index: number) => void;
}

const SliderDots = memo(function SliderDots({ totalSlides, currentIndex, onDotClick }: SliderDotsProps) {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
      {Array.from({ length: totalSlides }, (_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className={`w-3 h-3 rounded-full transition-colors ${
            currentIndex === index ? "bg-gray-800" : "bg-gray-400"
          } focus:outline-none hover:bg-gray-600`}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
});

export default SliderDots