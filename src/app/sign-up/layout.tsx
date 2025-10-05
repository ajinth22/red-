import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Redtune",
  description: "Create your Redtune account and start streaming music. Build playlists, save favorites, and discover new songs.",
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}