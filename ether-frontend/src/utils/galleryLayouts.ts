import { Category } from '../types/gallery';

export const getLayoutClasses = (category: Category, index: number, totalItems: number): string => {
    if (category === 'All') {
        // Use the original className from galleryItems
        return '';
    }
    if (category === 'Wildlife') {
        const layouts = [
            'col-span-3 row-span-4', 'col-span-2 row-span-3', 'col-span-1 row-span-2',
            'col-span-2 row-span-2', 'col-span-1 row-span-3', 'col-span-3 row-span-2',
            'col-span-2 row-span-4', 'col-span-1 row-span-2'
        ];
        return layouts[index % layouts.length];
    }
    if (category === 'Adventure') {
        const layouts = [
            'col-span-4 row-span-3', 'col-span-2 row-span-4', 'col-span-2 row-span-2',
            'col-span-3 row-span-3', 'col-span-1 row-span-2'
        ];
        return layouts[index % layouts.length];
    }
    if (category === 'Culture') {
        const layouts = [
            'col-span-3 row-span-5', 'col-span-3 row-span-3', 'col-span-2 row-span-4',
            'col-span-4 row-span-2', 'col-span-2 row-span-3'
        ];
        return layouts[index % layouts.length];
    }

    if (category === 'Landscape') {
        const layouts = [
            'col-span-6 row-span-3', 'col-span-4 row-span-4', 'col-span-2 row-span-3',
            'col-span-3 row-span-2', 'col-span-1 row-span-2'
        ];
        return layouts[index % layouts.length];
    }

    return 'col-span-1 row-span-1';
};