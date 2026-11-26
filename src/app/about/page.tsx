import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

const FAQ = [
  {
    q: "Where does the stock information come from?",
    a: "Each participating pharmacy records its medicines, deliveries, sales and returns in the PharmaLink inventory and point-of-sale system. Every change updates what you see here.",
  },
  {
    q: "Is a medicine guaranteed to be there when I arrive?",
    a: "No. The site shows what the pharmacy last recorded, and stock can sell out in the meantime. For urgent needs, call the pharmacy before you go.",
  },
  {
    q: "Can I order or pay online?",
    a: "No. PharmaLink only shows availability and location. You buy and pay at the pharmacy counter as usual.",
  },
  {
    q: "Why don't I see prices?",
    a: "Each pharmacy sets its own prices. PharmaLink focuses on whether a medicine is available, not on price comparison.",
  },
  {
    q: "What does “Rx” mean?",
    a: "The medicine needs a doctor’s prescription. Bring your prescription to the pharmacy.",
  },
  {
    q: "Does PharmaLink keep my location?",
    a: "No. If you tap “Use my location”, your browser shares it with this page only to sort pharmacies by distance. It is not sent to our database or stored.",
  },
  {
    q: "My pharmacy wants to join. Who do we contact?",
    a: "PharmaLink is in its pilot phase with selected independent pharmacies in Trece Martires City, Tanza and General Trias City. Contact the PharmaLink team at the Lyceum of the Philippines University – Cavite.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">About PharmaLink</h1>
        <p className="text-pretty text-muted-foreground">
          PharmaLink connects the inventories of independent pharmacies in Cavite into one place
          where anyone can check whether a medicine is available nearby, so you can avoid going
          from store to store. It is a Software Engineering project of the College of Computer
          Studies, Lyceum of the Philippines University – Cavite.
        </p>
      </div>
      <dl className="divide-y rounded-xl border bg-card">
        {FAQ.map((item) => (
          <div key={item.q} className="space-y-1 p-5">
            <dt className="font-medium">{item.q}</dt>
            <dd className="text-sm text-muted-foreground">{item.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
