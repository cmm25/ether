export interface GalleryItem {
    id: number;
    src: string;
    alt: string;
    className: string;
    title: string;
    category: 'Wildlife' | 'Adventure' | 'Culture' | 'Landscape';
    description: string;
    story: string;
    location: string;
    timeOfDay: string;
}

export type Category = 'All' | 'Wildlife' | 'Adventure' | 'Culture' | 'Landscape';
