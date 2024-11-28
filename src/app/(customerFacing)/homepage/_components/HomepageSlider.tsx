"use client";

import { useSlider } from '@/app/webhooks/useSlider';
import { Product } from '@prisma/client';
import { useCallback, useMemo } from 'react';
import SlideContent from './SlideContent';
import SliderDots from './SliderDots';

interface ProductsSliderProps {
  products: Product[];
}

export default function HomepageSlider({ products }: ProductsSliderProps) {
  const selectedProducts = useMemo(() => {
    if (products.length === 0) return [];
    const numberOfSlides = Math.min(5, products.length);
    return products.slice(0, numberOfSlides);
  }, [products]);

  const {
    currentIndex,
    setCurrentIndex,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    startSliderTimer,
    stopSliderTimer,
  } = useSlider({ totalSlides: selectedProducts.length });

  const handleDotClick = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      startSliderTimer();
    },
    [setCurrentIndex, startSliderTimer]
  );

  if (selectedProducts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-200">
        <p className="text-gray-500">No products to display.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full mx-auto">
      <div
        className="relative w-full aspect-w-16 aspect-h-9"
        onMouseEnter={stopSliderTimer}
        onMouseLeave={startSliderTimer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {selectedProducts.map((product, index) => (
          <SlideContent
            key={product.id}
            product={product}
            isActive={currentIndex === index}
          />
        ))}
      </div>

      <SliderDots
        totalSlides={selectedProducts.length}
        currentIndex={currentIndex}
        onDotClick={handleDotClick}
      />
    </div>
  );
}
