'use client';
import { motion } from 'framer-motion';
import { Camera, MapPin } from 'lucide-react';
import { GalleryItem as GalleryItemType, Category } from '../../types/gallery';
import { getLayoutClasses } from '../../utils/galleryLayouts';

interface GalleryItemProps {
    item: GalleryItemType;
    index: number;
    onClick: () => void;
    category: Category;
    filteredIndex: number;
}

const GalleryItem: React.FC<GalleryItemProps> = ({
    item,
    onClick,
    category,
    filteredIndex
}) => {
    const layoutClass = category === 'All'
        ? item.className
        : getLayoutClasses(category, filteredIndex, 0);

    return (
        <motion.div
            className={`group relative overflow-hidden cursor-pointer ${layoutClass}`}
            initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
                delay: filteredIndex * 0.1,
                type: "spring",
                stiffness: 100
            }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{
                scale: 1.02,
                transition: { duration: 0.4, ease: "easeOut" }
            }}
            onClick={onClick}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40 z-10" />

            <motion.img
                src={item.src}
                alt={item.alt}
                className="absolute inset-0 h-full w-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-700 z-20" />

            <motion.div
                className="absolute inset-0 flex flex-col justify-end p-4 md:p-8 text-white z-30"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: filteredIndex * 0.1 + 0.3 }}
            >
                <motion.div
                    className="flex items-center space-x-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                    <MapPin className="w-3 h-3 text-amber-300" />
                    <span className="text-xs text-amber-300 tracking-wide">{item.location}</span>
                </motion.div>

                <motion.span
                    className="text-xs uppercase tracking-[0.3em] text-amber-300 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ y: -2 }}
                >
                    {item.category}
                </motion.span>

                <motion.h3
                    className="font-serif text-xl md:text-3xl font-light tracking-wide mb-3 transform group-hover:translate-y-[-4px] transition-transform duration-500"
                    whileHover={{ scale: 1.02 }}
                >
                    {item.title}
                </motion.h3>

                <motion.p
                    className="text-sm text-amber-100/80 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 max-w-md leading-relaxed"
                    transition={{ delay: 0.1 }}
                >
                    {item.description}
                </motion.p>

                <motion.div
                    className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                >
                    <Camera className="w-5 h-5 text-white" />
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default GalleryItem;
