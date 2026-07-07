import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from Harvest Church of God Ethiopia — services, events, and church family moments.",
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
