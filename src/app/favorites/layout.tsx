import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liked Songs - Redtune",
  description: "Your liked songs collection on Redtune. Access all your favorite tracks in one place.",
};

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}