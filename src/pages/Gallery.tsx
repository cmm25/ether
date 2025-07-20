"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import CategoryFilter from '../components/Gallery/CategoryFilter';
import GalleryItem from '../components/Gallery/GalleryItem';
import GalleryLightbox from '../components/Gallery/GalleryLightbox';
import { galleryItems } from '../data/galleryData';
import { GalleryItem as GalleryItemType, Category } from '../types/gallery';

const GalleryPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedItem, setSelectedItem] = useState<GalleryItemType | null>(null);

  const filteredItems = selectedCategory === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === selectedCategory);

  const handleNext = useCallback(() => {
    if (!selectedItem) return;
    const currentIndex = galleryItems.findIndex(item => item.id === selectedItem.id);
    const nextIndex = (currentIndex + 1) % galleryItems.length;
    setSelectedItem(galleryItems[nextIndex]);
  }, [selectedItem]);

  const handlePrev = useCallback(() => {
    if (!selectedItem) return;
    const currentIndex = galleryItems.findIndex(item => item.id === selectedItem.id);
    const prevIndex = currentIndex === 0 ? galleryItems.length - 1 : currentIndex - 1;
    setSelectedItem(galleryItems[prevIndex]);
  }, [selectedItem]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedItem) {
        if (e.key === 'Escape') setSelectedItem(null);
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, handleNext, handlePrev]);

  return (
    <div className="bg-black text-white overflow-hidden">
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <main className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div
            className={`grid auto-rows-[200px] gap-4 md:gap-6 ${selectedCategory === 'All'
              ? 'grid-cols-2 md:grid-cols-6'
              : 'grid-cols-1 md:grid-cols-4 lg:grid-cols-6'
              }`}
          >
            {filteredItems.map((item, index) => {
              const filteredIndex = filteredItems.findIndex(filteredItem => filteredItem.id === item.id);
              return (
                <GalleryItem
                  key={`${selectedCategory}-${item.id}`}
                  item={item}
                  index={index}
                  filteredIndex={filteredIndex}
                  category={selectedCategory}
                  onClick={() => setSelectedItem(item)}
                />
              );
            })}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedItem && (
          <GalleryLightbox
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPage;
