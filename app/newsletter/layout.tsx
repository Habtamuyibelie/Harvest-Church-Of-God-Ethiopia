import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Newsletter",
  description: "Read past newsletters and subscribe for updates from Harvest Church of God Ethiopia.",
};

export default function NewsletterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
