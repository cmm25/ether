"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.scss";
import Image, { StaticImageData } from "next/image";
import Lenis from "@studio-freight/lenis";
import { useTransform, useScroll, motion, MotionValue } from "framer-motion";
import {
    img1,
    img2,
    img3,
    img4,
    img5,
    img6,
    img7,
    img8,
    img9,
    img10,
    img11,
    img12,
} from "@/assets";

const images: StaticImageData[] = [
    img1,
    img2,
    img3,
    img4,
    img5,
    img6,
    img7,
    img8,
    img9,
    img10,
    img11,
    img12,
];

type Dimensions = {
    width: number;
    height: number;
};

export default function Nfts() {
    const gallery = useRef<HTMLDivElement>(null);
    const [dimension, setDimension] = useState<Dimensions>({
        width: 0,
        height: 0,
    });

    const { scrollYProgress } = useScroll({
        target: gallery,
        offset: ["start end", "end start"],
    });

    const { height } = dimension;
    const y = useTransform(scrollYProgress, [0, 1], [0, height * 2]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, height * 3.3]);
    const y3 = useTransform(scrollYProgress, [0, 1], [0, height * 1.25]);
    const y4 = useTransform(scrollYProgress, [0, 1], [0, height * 3]);

    useEffect(() => {
        const lenis = new Lenis();

        const raf = (time: number) => {
            lenis.raf(time);
            requestAnimationFrame(raf);
        };

        const resize = () => {
            setDimension({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener("resize", resize);
        requestAnimationFrame(raf);
        resize();

        return () => {
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <main className={styles.main}>
            <div className={styles.spacer}></div>
            <div ref={gallery} className={styles.gallery}>
                <Column images={[images[0], images[1], images[2]]} y={y} />
                <Column images={[images[3], images[4], images[5]]} y={y2} />
                <Column images={[images[6], images[7], images[8]]} y={y3} />
                <Column images={[images[9], images[10], images[11]]} y={y4} />
            </div>
            <div className={styles.spacer}></div>
        </main>
    );
}

type ColumnProps = {
    images: StaticImageData[];
    y: MotionValue<number>;
};

const Column: React.FC<ColumnProps> = ({ images, y }) => {
    return (
        <motion.div className={styles.column} style={{ y }}>
            {images.map((src, i) => (
                <div key={i} className={styles.imageContainer}>
                    <Image
                        src={src}
                        alt={`image ${i + 1}`}
                        width={300}
                        height={400}
                        style={{ objectFit: "cover", width: "100%", height: "auto" }}
                    />
                </div>
            ))}
        </motion.div>
    );
};
