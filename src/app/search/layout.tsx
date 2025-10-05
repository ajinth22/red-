import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search - Redtune",
  description: "Search for your favorite songs and artists on Redtune. Discover millions of tracks from YouTube.",
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}