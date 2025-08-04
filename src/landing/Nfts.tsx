"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.scss";
import Image, { StaticImageData } from "next/image";
import Lenis from "@studio-freight/lenis";
import { useTransform, useScroll, motion, MotionValue } from "framer-motion";
import { useNFTGallery } from "@/hooks/useRealTimeCampaign";
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

const fallbackImages: StaticImageData[] = [
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

interface NFTItem {
    id: string;
    imageUrl: string;
    title: string;
    tokenId: string;
    winnerAddress: string;
    blockTimestamp: string;
    transactionHash: string;
}

export default function Nfts() {
    const gallery = useRef<HTMLDivElement>(null);
    const [dimension, setDimension] = useState<Dimensions>({
        width: 0,
        height: 0,
    });

    // Get real-time NFT data from pipelines
    const { nfts, isLoading, error } = useNFTGallery(10000); // Poll every 10 seconds

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

    // Convert NFT data to display format
    const nftItems: NFTItem[] = nfts.map((nft) => ({
        id: nft.transaction_hash,
        imageUrl: `https://gateway.pinata.cloud/ipfs/QmYourHashHere/${nft.token_id}`, // You'll need to map this properly
        title: `Campaign Winner #${nft.token_id}`,
        tokenId: nft.token_id,
        winnerAddress: nft.winner_address,
        blockTimestamp: nft.block_timestamp,
        transactionHash: nft.transaction_hash
    }));

    // Use fallback images if no NFTs or still loading
    const displayItems = nftItems.length > 0 ? nftItems : fallbackImages.map((img, index) => ({
        id: `fallback-${index}`,
        imageUrl: img.src,
        title: `Artwork ${index + 1}`,
        tokenId: `${index + 1}`,
        winnerAddress: '',
        blockTimestamp: '',
        transactionHash: ''
    }));

    // Distribute items across 4 columns
    const columns = [
        displayItems.filter((_, i) => i % 4 === 0),
        displayItems.filter((_, i) => i % 4 === 1),
        displayItems.filter((_, i) => i % 4 === 2),
        displayItems.filter((_, i) => i % 4 === 3),
    ];

    return (
        <main className={styles.main}>
            <div className={styles.spacer}></div>
            <div ref={gallery} className={styles.gallery}>
                <NFTColumn items={columns[0]} y={y} />
                <NFTColumn items={columns[1]} y={y2} />
                <NFTColumn items={columns[2]} y={y3} />
                <NFTColumn items={columns[3]} y={y4} />
            </div>
            <div className={styles.spacer}></div>
            
            {/* Real-time status indicator */}
            {!isLoading && nfts.length > 0 && (
                <div className="fixed bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        {nfts.length} Live NFTs
                    </div>
                </div>
            )}
            
            {error && (
                <div className="fixed bottom-4 right-4 bg-red-500/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                    <div className="text-sm">Using fallback images</div>
                </div>
            )}
        </main>
    );
}

type NFTColumnProps = {
    items: NFTItem[];
    y: MotionValue<number>;
};

const NFTColumn: React.FC<NFTColumnProps> = ({ items, y }) => {
    return (
        <motion.div className={styles.column} style={{ y }}>
            {items.map((item) => (
                <div key={item.id} className={styles.imageContainer}>
                    <div className="relative group">
                        <Image
                            src={item.imageUrl.startsWith('http') ? item.imageUrl : fallbackImages[parseInt(item.tokenId) % fallbackImages.length]}
                            alt={item.title}
                            width={300}
                            height={400}
                            style={{ objectFit: "cover", width: "100%", height: "auto" }}
                            className="rounded-lg"
                        />
                        
                        {/* NFT Info Overlay */}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex flex-col justify-end p-4">
                            <div className="text-white">
                                <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                                <p className="text-sm text-gray-300 mb-2">Token #{item.tokenId}</p>
                                {item.winnerAddress && (
                                    <p className="text-xs text-purple-300">
                                        Winner: {item.winnerAddress.slice(0, 6)}...{item.winnerAddress.slice(-4)}
                                    </p>
                                )}
                                {item.blockTimestamp && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        Minted: {new Date(item.blockTimestamp).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            
                            {/* NFT Badge */}
                            <div className="absolute top-3 right-3">
                                <div className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                                    NFT
                                </div>
                            </div>
                            
                            {/* Live indicator for real NFTs */}
                            {item.transactionHash && (
                                <div className="absolute top-3 left-3">
                                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                                        LIVE
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </motion.div>
    );
};
