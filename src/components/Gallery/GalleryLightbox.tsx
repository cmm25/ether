'use client';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Heart, Camera, MapPin } from 'lucide-react';
import { GalleryItem } from '../../types/gallery';
import Image from 'next/image';

interface GalleryLightboxProps {
    item: GalleryItem | null;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
}

const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
    item,
    onClose,
    onNext,
    onPrev
}) => {
    if (!item) return null;

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-black/97 backdrop-blur-lg flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={onClose}
        >
            <motion.button
                className="absolute top-6 right-6 text-white/80 hover:text-white z-20 p-3 hover:bg-white/10 rounded-full transition-colors"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <X className="w-6 h-6" />
            </motion.button>

            <motion.button
                className="absolute left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-20 p-4 hover:bg-white/10 rounded-full transition-colors"
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                whileHover={{ scale: 1.1, x: -4 }}
                whileTap={{ scale: 0.95 }}
            >
                <ChevronLeft className="w-8 h-8" />
            </motion.button>

            <motion.button
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-20 p-4 hover:bg-white/10 rounded-full transition-colors"
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                whileHover={{ scale: 1.1, x: 4 }}
                whileTap={{ scale: 0.95 }}
            >
                <ChevronRight className="w-8 h-8" />
            </motion.button>

            <motion.div
                className="max-w-7xl w-full max-h-[95vh] relative grid lg:grid-cols-5 gap-8"
                initial={{ scale: 0.8, rotateY: -15 }}
                animate={{ scale: 1, rotateY: 0 }}
                exit={{ scale: 0.8, rotateY: 15 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Main Image */}
                <motion.div
                    className="lg:col-span-3 relative"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    <Image
                        src={item.src}
                        alt={item.alt}
                        width={1200}
                        height={800}
                        className="w-full h-full object-cover rounded-xl shadow-2xl max-h-[80vh]"
                    />

                    <motion.div
                        className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <span className="text-xs text-amber-300 tracking-wide font-medium">
                            {item.timeOfDay}
                        </span>
                    </motion.div>
                </motion.div>

                {/* Story Panel */}
                <motion.div
                    className="lg:col-span-2 bg-gradient-to-br from-stone-900/95 to-stone-800/95 backdrop-blur-sm rounded-xl p-8 text-white overflow-y-auto max-h-[80vh]"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <motion.div
                        className="flex items-center space-x-2 mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                        <span className="text-xs uppercase tracking-[0.3em] text-amber-300">
                            {item.category}
                        </span>
                    </motion.div>

                    <motion.h3
                        className="font-serif text-3xl text-white mb-4 tracking-wide leading-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        {item.title}
                    </motion.h3>

                    <motion.div
                        className="flex items-center space-x-2 mb-6 text-amber-200/80"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{item.location}</span>
                    </motion.div>

                    <motion.p
                        className="text-amber-100/90 leading-relaxed text-lg mb-6 font-light"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        {item.story}
                    </motion.p>

                    <motion.div
                        className="border-t border-amber-300/20 pt-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Heart className="w-4 h-4 text-amber-400" />
                                <span className="text-sm text-amber-200/80">Captured moment</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Camera className="w-4 h-4 text-amber-400" />
                                <span className="text-sm text-amber-200/80">Professional wildlife photography</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default GalleryLightbox;
