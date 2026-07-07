import { Facebook, Youtube, Send, Instagram, Music2, Twitter } from "lucide-react";

/**
 * Edit these to your real profile URLs. Set a link to "" to hide it
 * from the footer automatically.
 */
export const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/HarvestChurchOfGodEthiopia", Icon: Facebook },
  { label: "YouTube",  href: "https://www.youtube.com/@harvestchurchofgodethiopia", Icon: Youtube },
  { label: "Telegram", href: "https://web.telegram.org/k/#-1370621699",         Icon: Send },
  { label: "Instagram",href: "https://instagram.com/harvestchurchethiopia",Icon: Instagram },
  { label: "TikTok",   href: "https://tiktok.com/@harvestchurchethiopia",  Icon: Music2 },
    { label: "Twitter",   href: "https://x.com/HARVESTCOG?s=20",  Icon: Twitter },
].filter((s) => s.href);
