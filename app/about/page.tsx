import Image from "next/image";
import { Info } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Harvest Church of God - Ethiopia — our story, beliefs, and leadership in Addis Ababa.",
};
const pastors = [
    {
      name: "Bishop Hiruy Tsige",
      role: "Bishop",
      image: "/images/bishop_photo.png",
    },
    {
      name: "Doctor Mekbib",
      role: "General Manager",
      image: "/images/logo.jpg",
    },
    {
      name: "Pastor Abebe Alemu",
      role: "Youth Pastor",
      image: "/images/logo.jpg",
    },
  ]; 
export default function About() {
  return (
    <div className="text-parchment">
      {/* Hero */}
      <section className="relative overflow-hidden py-28">
        <div className="absolute inset-0 hero-veil" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <p className="eyebrow mb-3 flex items-center justify-center gap-2">
            <Info size={13} strokeWidth={2.4} /> About Us
          </p>
          <p className="font-display text-xl text-sky-500 mb-3">
            መከር የእግዚአብሔር ቤተ-ክርስቲያን - ኢትዮጲያ
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-parchment">
            Planted in Ethiopia,<br /><span className="grad-text">growing for God's glory.</span>
          </h1>
        </div>
      </section>

      <hr className="divider-grad opacity-60" />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-parchment/65 leading-relaxed text-lg">
          Harvest Church of God Ethiopia began with a small gathering of believers in Addis Ababa committed to prayer, the study of Scripture, and serving one another. Over the years, that gathering has grown into a multi-generational church family devoted to worship, discipleship, and outreach across the region.
        </p>
      </section>

      {/* Mission / Vision */}
      <section className="bg-surface/60 py-20">
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 gap-6">
          {[
            { label: "Mission", accent: "from-gold to-gold/20", title: "To evangelize and disciple every person through love, mercy, and discipleship.", body: "We exist to evangelize and disciple every person by demonstrating the love of Christ, extending mercy to those in need, and nurturing believers through intentional discipleship." },
            { label: "Vision", accent: "from-blue to-blue/20", title: "We desire to see a nation discipled, holistically healthy, and flourishing.", body: "We envision a nation that is discipled, holistically healthy, and flourishing—where individuals, families, and communities are transformed through the Gospel of Jesus Christ." },
          ].map(c => (
            <div key={c.label} className="glass rounded-2xl p-8 relative overflow-hidden">
              <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${c.accent}`} />
              <p className="eyebrow mb-3">{c.label}</p>
              <h2 className="font-display text-2xl text-parchment mb-4">{c.title}</h2>
              <p className="text-parchment/60 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <p className="eyebrow mb-2">What We Believe</p>
        <h2 className="font-display text-3xl text-parchment mb-10">Our core values</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: "❤️", title: "Love", desc: "We demonstrate Christ's unconditional love by serving God and caring for one another." },
            { icon: "🤝", title: "Mercy", desc: "We extend compassion, forgiveness, and practical support to those in need, reflecting the mercy of Christ." },
            { icon: "📖", title: "Discipleship", desc: "We are committed to making disciples through biblical teaching, spiritual growth, and mentoring." },
            { icon: "🌱", title: "Stewardship", desc: "We faithfully manage the gifts, talents, time, and resources God has entrusted to us for His glory and the advancement of His Kingdom." },
          ].map(v => (
            <div key={v.title} className="glass rounded-2xl p-6 hover:border-gold/20 transition-colors">
              <span className="text-3xl mb-3 block">{v.icon}</span>
              <h3 className="font-display text-lg text-parchment mb-2">{v.title}</h3>
              <p className="text-sm text-parchment/55 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      


       {/* Leadership */}
      <section className="bg-surface/60 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="eyebrow mb-2">Leadership</p>

          <h2 className="font-display text-3xl text-parchment mb-3">
            Our Pastors
          </h2>

          <p className="max-w-2xl text-muted-foreground mb-10">
            Meet the spiritual leaders who faithfully serve Harvest Church of God
            Ethiopia through preaching, discipleship, prayer, and pastoral care.
          </p>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {pastors.map((pastor) => (
              <div
                key={pastor.name}
                className="glass rounded-2xl overflow-hidden shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={pastor.image}
                    alt={pastor.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-6 text-center">
                  <h3 className="font-display text-xl text-parchment">
                    {pastor.name}
                  </h3>

                  <p className="mt-1 text-gold font-medium">
                    {pastor.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>




      
    </div>
    
  );
  
}
