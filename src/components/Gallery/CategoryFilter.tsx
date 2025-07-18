'use client';
import { motion } from 'framer-motion';
import { categories } from '../../data/galleryData';
import { Category } from '../../types/gallery';

interface CategoryFilterProps {
    selectedCategory: Category;
    onCategoryChange: (category: Category) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onCategoryChange }) => {
    return (
        <motion.div
            className="sticky top-20 z-40 bg-black/95 backdrop-blur-lg border-b border-stone-700/60 py-8"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center space-x-8">
                    {categories.map((category) => (
                        <motion.button
                            key={category}
                            onClick={() => onCategoryChange(category)}
                            className={`relative px-6 py-3 text-lg font-light tracking-wide transition-all duration-500 ${selectedCategory === category
                                ? 'text-amber-400'
                                : 'text-stone-200 hover:text-amber-400'
                                }`}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {category}
                            {selectedCategory === category && (
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-300"
                                    layoutId="activeCategory"
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                />
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default CategoryFilter;
