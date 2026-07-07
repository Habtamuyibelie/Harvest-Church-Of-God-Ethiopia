import { HandHeart, Landmark, Smartphone } from "lucide-react";

const accounts = [
  {
    Icon: Landmark,
    title: "Bank Transfer",
    bank: "Commercial Bank of Ethiopia",
    accountName: "Harvest Church of God — Ethiopia",
    accountNumber: "1000-XXXX-XXXX",
  },
  {
    Icon: Smartphone,
    title: "TeleBirr",
    bank: "TeleBirr Mobile Money",
    accountName: "Harvest Church of God — Ethiopia",
    accountNumber: "+251 91 234 5678",
  },
];

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Give",
  description: "Support the ministry of Harvest Church of God Ethiopia — give via bank transfer or TeleBirr.",
};

export default function Donate() {
  return (
    <div className="text-parchment min-h-screen">
      <section className="relative overflow-hidden py-28 text-center">
        <div className="absolute inset-0 hero-veil" />
        <div className="relative z-10 mx-auto max-w-3xl px-10">
          <p className="eyebrow mb-3 flex items-center justify-center gap-2">
            <HandHeart size={16} strokeWidth={4} /> Give
          </p>
          <p className="font-display text-xl text-sky-500 mb-3">መከር የእግዚአብሔር ቤተ-ክርስቲያን - ኢትዮጲያ</p>
          <h1 className="font-display text-4xl sm:text-5xl text-parchment">
            Your generosity <span className="grad-text">grows the harvest.</span>
          </h1>
        </div>
      </section>
      <hr className="divider-grad opacity-60" />
      <section className="mx-auto max-w-3xl px-6 py-20">
        <p className="eyebrow mb-5 text-center">Ways to Give</p>
        <h2 className="font-display text-2xl sm:text-3xl text-parchment text-center mb-12">
          Give directly using either option below
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {accounts.map((a) => (
            <div key={a.title} className="glass rounded-2xl p-7">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold mb-5">
                <a.Icon size={22} strokeWidth={2} />
              </span>
              <h3 className="font-display text-xl text-parchment mb-4">{a.title}</h3>
              <dl className="space-y-2.5 text-sm">
                <div className="flex flex-col">
                  <dt className="text-[0.7rem] uppercase tracking-wider text-gold font-semibold">
                    {a.title === "TeleBirr" ? "Service" : "Bank"}
                  </dt>
                  <dd className="text-parchment/75">{a.bank}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-[0.7rem] uppercase tracking-wider text-gold font-semibold">Account Name</dt>
                  <dd className="text-parchment/75">{a.accountName}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-[0.7rem] uppercase tracking-wider text-gold font-semibold">
                    {a.title === "TeleBirr" ? "Phone Number" : "Account Number"}
                  </dt>
                  <dd className="text-parchment font-semibold tracking-wide">{a.accountNumber}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-parchment/45 mt-10 leading-relaxed">
          After giving, feel free to reach out on the <a href="/contact" className="text-gold hover:text-gold/80 underline underline-offset-2">Contact</a> page
          so we can confirm and thank you personally.
        </p>
      </section>
    </div>
  );
}
