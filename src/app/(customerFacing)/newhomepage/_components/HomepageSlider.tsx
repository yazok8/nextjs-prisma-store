"use client";

import { getImageSrc } from '@/lib/imageHelper';
import { Product } from '@prisma/client';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ProductsSliderProps {
  products: Product[];
}

export default function HomepageSlider({products}:ProductsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);

  // Function select slides based on available data
  const selectSlides = (data:Product[]) => {
    if(data.length === 0) return [];
    const numberOfSlides = Math.min(5, data.length);
    return data.slice(0, numberOfSlides);
  }

  const selectedProducts = selectSlides(products);

  // Auto-play functionality
  const stopSliderTimer = useCallback(() => {
    if(slideInterval.current) {
      clearInterval(slideInterval.current);
      slideInterval.current = null;
    }
  },[]);

  const startSliderTimer = useCallback(() => {
    stopSliderTimer();
    slideInterval.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === selectedProducts.length -1 ? 0 : prevIndex + 1));
    }, 5000);
  },[selectedProducts.length,stopSliderTimer]);


  useEffect(() => {
    if (selectedProducts.length > 0) {
      startSliderTimer();
    }
    return () => {
      stopSliderTimer();
    };
  }, [selectedProducts, startSliderTimer, stopSliderTimer]);

  // Navigate to the previous slide
  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? selectedProducts.length - 1 : prevIndex - 1));
  }, [selectedProducts.length]);

  // Navigate to the next slide
  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === selectedProducts.length - 1 ? 0 : prevIndex + 1));
  }, [selectedProducts.length]);

  //Swipe Handlers
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if(touchStart == null || touchEnd == null) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 100;
    if(distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
    setTouchStart(null);
    setTouchEnd(null);
  }

    // Fallback UI for insufficient data
    if (selectedProducts.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-200">
          <p className="text-gray-500">No products to display.</p>
        </div>
      );
    }
  

  return (
    <div className="relative w-full mx-auto bg-teal-50">
    {/* Slider Container */}
    <div
      className="relative w-full h-[300px] md:h-[400px] lg:h-[700px]"
      onMouseEnter={stopSliderTimer}
      onMouseLeave={startSliderTimer}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      {selectedProducts.map((product, index) => (
        <div
          key={product.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out ${
            currentIndex === index ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Slide Content */}
          <div className="flex flex-col md:flex-row w-full h-full">
            {/* Background (Hidden on small screens) */}
            <div className="hidden md:block md:w-1/5 bg-teal-0"></div>

            {/* Image */}
            <div className="w-full h-full md:w-4/5 relative -z-10">
              <Image
                src={getImageSrc(product.imagePath)}
                alt={product.name}
                fill
                style={{ objectFit: "contain" }}
                className="rounded-lg"
                loading="lazy"
                placeholder="blur"
                blurDataURL="/placeholder.webp"
                onError={(e) => {
                  e.currentTarget.src = "/fallback.png";
                  console.error(
                    `Failed to load image for category ID ${product.id}. Using fallback image.`
                  );
                }}
              />
            </div>

            {/* Overlay Text */}
            <div
              className="
                absolute 
                top-1/2 
                -translate-y-1/2 
                z-20 
                bg-white 
                bg-opacity-60 
                p-4 
                rounded-lg
                left-1/4
                transform
                -translate-x-1/2
                w-3/4
                max-w-[30%]
                md:left-40
                md:translate-x-0
                md:max-w-[20%]
              "
            >
              <h2 className="text-xl md:text-2xl font-extrabold">
                {product.name}
              </h2>
              <p className="mt-3 md:mt-5 text-lg">
                Explore more about {product.name}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Dots Navigation */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {selectedProducts.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              console.log(`Dot ${index + 1} clicked`);
              setCurrentIndex(index);
              startSliderTimer();
            }}
            className={`w-3 h-3 rounded-full ${
              currentIndex === index ? "bg-gray-800" : "bg-gray-400"
            } focus:outline-none`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  </div>
  )
}
