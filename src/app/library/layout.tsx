import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Library - Redtune",
  description: "Access your music library on Redtune. View recently played songs and manage your playlists.",
};

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}