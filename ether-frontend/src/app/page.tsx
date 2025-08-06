"use client";

import { useActiveAccount } from "thirdweb/react";
import AppLayout from "../components/Layout/AppLayout";
import GalleryPage from "../pages/Gallery";
import LandingGallery from "../landing/Gallery";

export default function Home() {
  const account = useActiveAccount();

  if (!account) {
    // Show landing page with ConnectButton until wallet is connected
    return <LandingGallery />;
  }

  // Show main app after authentication
  return (
    <AppLayout>
      <GalleryPage />
    </AppLayout>
  );
}
