"use client";

import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { SliderDots } from './SliderDots';

interface ContentSliderProps {
  children: ReactNode;
  autoPlayInterval?: number;
  className?: string;
}

export function GenericSlider({
  children,
  autoPlayInterval = 5000,
  className = '',
}: ContentSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const childrenArray = React.Children.toArray(children);
  
  // Create a wrapped array with cloned elements for infinite effect
  const wrappedChildren = [
    childrenArray[childrenArray.length - 1],
    ...childrenArray,
    childrenArray[0],
  ];

  const handleTransitionEnd = useCallback(() => {
    setIsTransitioning(false);
    
    // Jump to the first/last slide without transition
    if (currentIndex >= childrenArray.length) {
      setCurrentIndex(0);
    } else if (currentIndex < 0) {
      setCurrentIndex(childrenArray.length - 1);
    }
  }, [currentIndex, childrenArray.length]);

  const startSliderTimer = useCallback(() => {
    if (childrenArray.length <= 1) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }, autoPlayInterval);

    return timer;
  }, [childrenArray.length, autoPlayInterval]);

  useEffect(() => {
    const timer = startSliderTimer();
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [startSliderTimer]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    setIsTransitioning(true);
    if (isLeftSwipe) {
      setCurrentIndex((prev) => prev + 1);
    } else if (isRightSwipe) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleDotClick = useCallback((index: number) => {
    setIsTransitioning(true);
    setCurrentIndex(index);
  }, []);

  if (childrenArray.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted">
        <p className="text-muted-foreground">No content to display.</p>
      </div>
    );
  }

  // Calculate the actual translation considering the wrapped slides
  const translateX = -(currentIndex + 1) * 100;

  return (
    <>
      <div
        className={`relative w-full overflow-hidden ${className}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex"
          style={{
            transform: `translateX(${translateX}%)`,
            transition: isTransitioning ? 'transform 500ms ease-in-out' : 'none',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {wrappedChildren.map((child, index) => (
            <div key={index} className="w-full flex-shrink-0">
              {child}
            </div>
          ))}
        </div>
      </div>
      {childrenArray.length > 1 && (
        <SliderDots
          totalSlides={childrenArray.length}
          currentIndex={currentIndex < 0 ? childrenArray.length - 1 : currentIndex % childrenArray.length}
          onDotClick={handleDotClick}
        />
      )}
    </>
  );
}