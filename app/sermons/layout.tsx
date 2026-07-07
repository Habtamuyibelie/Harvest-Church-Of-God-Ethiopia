import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sermons",
  description: "Watch sermons from Harvest Church of God Ethiopia.",
};

export default function SermonsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
