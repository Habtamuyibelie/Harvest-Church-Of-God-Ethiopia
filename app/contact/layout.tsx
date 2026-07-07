import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Harvest Church of God - Ethiopia in Addis Ababa.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
