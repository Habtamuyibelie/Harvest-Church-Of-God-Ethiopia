import { HeartHandshake } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ministries",
  description: "Explore the ministries of Harvest Church of God Ethiopia — children, youth, women, men, and more.",
};

export default function Ministries() {
  const min = [
    { icon:"👶", title:"Children\'s Ministry", desc:"Nurturing the youngest members through Bible stories, songs, and play.", color:"from-gold/20 to-gold/5" },
    { icon:"🧑", title:"Youth Ministry", desc:"Walking alongside teenagers as they build identity and faith.", color:"from-green/20 to-green/5" },
    { icon:"👩", title:"Women\'s Ministry", desc:"A sisterhood of prayer, Bible study, and mutual support.", color:"from-red/20 to-red/5" },
    { icon:"🎵", title:"Worship & Arts", desc:"Leading the congregation in heartfelt, excellent worship.", color:"from-gold/20 to-gold/5" },
    { icon:"✈️", title:"Missions Ministry", desc:"Extending the church\'s reach into underserved communities.", color:"from-green/20 to-green/5" },
    { icon:"🤝", title:"Hospitality Ministry", desc:"Welcoming every guest and member with warmth and care.", color:"from-red/20 to-red/5" },
    { icon:"🙏", title:"Prayer Ministry", desc:"Interceding for our church, city, and nation.", color:"from-blue/20 to-blue/5" },
  ];
  return (
    <div className="text-parchment min-h-screen">
      <section className="relative overflow-hidden py-28 text-center">
        <div className="absolute inset-0 hero-veil" />
        <div className="relative z-10 mx-auto max-w-3xl px-6">
          <p className="eyebrow mb-3 flex items-center justify-center gap-2">
            <HeartHandshake size={13} strokeWidth={2.4} /> Ministries
          </p>
          <p className="font-display text-xl text-sky-500 mb-3">መከር የእግዚአብሔር ቤተ-ክርስቲያን - ኢትዮጲያ</p>
          <h1 className="font-display text-4xl sm:text-5xl text-parchment">
            Find your place <span className="grad-text">to serve.</span>
          </h1>
        </div>
      </section>
      <hr className="divider-grad opacity-60" />
      <section className="mx-auto max-w-7xl px-6 py-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {min.map((m) => (
          <div key={m.title} className={`glass rounded-2xl p-6 hover:border-gold/20 transition-all hover:-translate-y-1 bg-gradient-to-b ${m.color}`}>
            <span className="text-4xl mb-4 block">{m.icon}</span>
            <h2 className="font-display text-lg text-parchment mb-2">{m.title}</h2>
            <p className="text-sm text-parchment/55 leading-relaxed">{m.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
