import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { MusicPlayerProvider } from "@/contexts/MusicPlayerContext";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Redtune - Stream Your Favorite Music",
  description: "Redtune is a modern music streaming platform. Discover, play, and enjoy unlimited music from YouTube. Create playlists, save favorites, and explore new songs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        <MusicPlayerProvider>
          {children}
        </MusicPlayerProvider>
        <Toaster />
        <VisualEditsMessenger />
      </body>
    </html>
  );
}