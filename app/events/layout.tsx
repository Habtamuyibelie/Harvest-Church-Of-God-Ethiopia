import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming events at Harvest Church of God Ethiopia in Addis Ababa.",
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
