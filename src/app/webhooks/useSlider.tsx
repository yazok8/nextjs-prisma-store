"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSliderProps {
  totalSlides: number;
  autoPlayInterval?: number;
}

export function useSlider({ totalSlides, autoPlayInterval = 5000 }: UseSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);
  const minSwipeDistance = 100;

  const stopSliderTimer = useCallback(() => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
      slideInterval.current = null;
    }
  }, []);

  const startSliderTimer = useCallback(() => {
    stopSliderTimer();
    if (totalSlides > 1) {
      slideInterval.current = setInterval(() => {
        setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
      }, autoPlayInterval);
    }
  }, [totalSlides, autoPlayInterval, stopSliderTimer]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  }, [totalSlides]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStart === null || touchEnd === null) return;
    
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) >= minSwipeDistance) {
      distance > 0 ? nextSlide() : prevSlide();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, nextSlide, prevSlide]);

  useEffect(() => {
    startSliderTimer();
    return stopSliderTimer;
  }, [startSliderTimer, stopSliderTimer]);

  return {
    currentIndex,
    setCurrentIndex,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    startSliderTimer,
    stopSliderTimer,
  };
}