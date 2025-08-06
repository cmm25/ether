"use client";

import Nfts from "./Nfts";
import { ConnectButton } from "thirdweb/react";
import { client } from "../lib/thirdweb";

export default function Gallery() {
    return (
        <>
            <section className="w-full min-h-screen flex flex-col md:flex-row items-stretch bg-[#f8f8ff]">
                <div className="flex-1 hidden md:flex flex-col justify-center px-12 py-20 bg-white order-1 sticky top-0 h-screen border-r-4 border-dashed border-purple-300 shadow-xl z-10">
                    <div className="max-w-lg mx-auto">
                        <h1 className="font-pixelifySans  text-5xl md:text-6xl font-extrabold text-[#2d1e6b] mb-6 leading-tight drop-shadow-lg">
                            NFTs Minted Daily<br />on <span className="text-[#7c3aed]">ETHER.</span>
                        </h1>
                        <p className="font-pixelify text-2xl text-[#5b28b2] mb-10 drop-shadow">
                            Discover, collect, and trade unique digital art on the Ethereum blockchain
                        </p>
                        <ConnectButton client={client} connectButton={{ label: "Connect Wallet" }} />
                    </div>
                </div>
                {/* NFT Gallery: right */}
                <div className="flex-[3] h-screen overflow-y-auto flex items-center justify-center bg-[#f8f8ff] order-2">
                    <Nfts />
                </div>
                {/* For mobile: text above gallery */}
                <div className="md:hidden px-8 py-12 bg-white order-1 border-b-4 border-dashed border-purple-300 shadow-lg z-10">
                    <div className="max-w-lg mx-auto">
                        <h1 className="font-pixelify text-4xl font-extrabold text-[#2d1e6b] mb-4 leading-tight drop-shadow-lg">
                            NFTs Minted Daily on <span className="text-[#7c3aed]">ETHER.</span>
                        </h1>
                        <p className="font-pixelify text-lg text-[#5b28b2] mb-6 drop-shadow">
                            Discover, collect, and trade unique digital art on the Ethereum blockchain
                        </p>
                        <ConnectButton client={client} connectButton={{ label: "Connect Wallet" }} />
                    </div>
                </div>
            </section>
        </>
    );
}

