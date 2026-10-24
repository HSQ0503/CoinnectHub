import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About CoinnectHub",
  description:
    "Mr. Ferla started CoinnectHub after moving from Brazil to the United States. Workshops now go into middle schools.",
};

const path = [
  { n: "01", label: "Brazil to the United States" },
  { n: "02", label: "Friends were already curious" },
  { n: "03", label: "Instagram, then TikTok" },
  { n: "04", label: "Middle school workshops" },
];

const workshop = [
  {
    n: "01",
    title: "Questions out loud",
    text: "They can ask 'what is a stock?' even if they don't know the word for the thing yet.",
  },
  {
    n: "02",
    title: "A price on the table",
    text: "We use a $120 pair of headphones, or a week with $15 in it.",
  },
  {
    n: "03",
    title: "After we leave",
    text: "One visit. The idea is they can run a similar choice later, on their own.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-[#f5f4f2]">
        <div className="container-shell grid gap-14 py-16 md:py-24 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.7fr)] lg:items-end lg:gap-20">
          <div className="hero-copy">
            <p className="eyebrow text-blue">About CoinnectHub</p>
            <h1 className="display-serif max-w-[17ch] text-[clamp(2.35rem,4.6vw,4.15rem)] leading-[1.08] font-bold tracking-[-0.03em]">
              I started CoinnectHub because financial literacy felt too
              important to be something teenagers had to learn by accident.
            </h1>
            <p className="mt-8 text-sm font-extrabold text-navy">
              Mr. Ferla, founder
            </p>
          </div>

          <ol
            aria-label="How CoinnectHub grew"
            className="grid gap-px overflow-hidden rounded-2xl border border-navy/10 bg-navy/10 sm:grid-cols-2 lg:grid-cols-1"
          >
            {path.map((step) => (
              <li key={step.n} className="flex gap-4 bg-white px-5 py-4">
                <span className="display-serif w-8 shrink-0 text-lg text-blue">
                  {step.n}
                </span>
                <span className="text-sm leading-6 font-extrabold">
                  {step.label}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-shell grid gap-12 py-16 md:py-24 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-20">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <p className="text-sm font-extrabold text-blue">In his words</p>
          <p className="display-serif mt-3 text-5xl leading-[0.95] font-bold tracking-[-0.03em]">
            Mr. Ferla
          </p>
          <p className="mt-4 text-sm leading-6 text-navy">Founder of CoinnectHub</p>
          <div className="mt-6 h-1 w-12 bg-yellow" aria-hidden="true" />
        </aside>

        <article className="max-w-[68ch]">
          <h2 className="sr-only">Why Mr. Ferla started CoinnectHub</h2>
          <div className="space-y-6 text-lg leading-8 text-navy">
            <p>
              I saw it after I moved from Brazil to the United States. Some
              students had grown up talking about saving and investing at home.
              Others had barely heard those words in a class.
            </p>
            <p>
              When I told friends what I was learning, they wanted the same
              explanation.
            </p>
            <p className="display-serif max-w-[14ch] py-4 text-[clamp(2.1rem,4vw,3.35rem)] leading-[1.08] font-bold tracking-[-0.03em]">
              The problem wasn't a lack of curiosity.
            </p>
            <p>
              I think of money skills as a life skill. School still skips them,
              or teaches them like everyone in the room already has a paycheck
              and a brokerage account.
            </p>
            <p>
              I started with short{" "}
              <a
                href="https://www.instagram.com/coinnect.hub/"
                target="_blank"
                rel="noreferrer"
                className="font-extrabold text-blue underline decoration-blue/30 underline-offset-4 hover:decoration-blue"
              >
                Instagram
                <span className="sr-only"> (opens in a new tab)</span>
              </a>{" "}
              posts, pictures and plain words, at @coinnect.hub, because that
              was the fastest way to put a topic in front of people my age.
              TikTok came after. I still wanted a classroom, so now we go into
              middle schools. Students ask questions, try choices like what to
              do with $15 this week, and leave with something they can use
              later.
            </p>
          </div>
        </article>
      </section>

      <section className="bg-navy text-white">
        <div className="container-shell py-16 md:py-24">
          <div className="max-w-2xl">
            <p className="eyebrow text-yellow">In the classroom</p>
            <h2 className="display-serif text-[clamp(2.2rem,4vw,3.5rem)] leading-[1.08] font-bold tracking-[-0.03em]">
              What happens in the room.
            </h2>
          </div>
          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {workshop.map((item) => (
              <li key={item.n} className="border-t border-white/20 pt-6">
                <span className="display-serif text-2xl text-yellow">
                  {item.n}
                </span>
                <h3 className="mt-4 text-xl font-extrabold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-sm text-base leading-7 text-white/85">
                  {item.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="grid md:grid-cols-2">
        <Link
          href="/games"
          className="group flex min-h-64 flex-col justify-between bg-yellow px-6 py-12 transition-colors duration-200 hover:bg-white sm:px-10 md:px-14 md:py-16"
        >
          <p className="text-sm font-extrabold tracking-wide text-navy uppercase">
            For students
          </p>
          <div className="mt-10">
            <h2 className="display-serif text-4xl leading-none font-bold tracking-[-0.03em] md:text-5xl">
              Play a week.
            </h2>
            <p className="mt-4 max-w-sm text-base leading-7 text-navy">
              Five weeks with $10, $15, or $20, plus three fake company
              headlines. Free. No account. No real money.
            </p>
            <span className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold">
              Explore games
              <ArrowUpRight
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </span>
          </div>
        </Link>
        <Link
          href="/get-involved"
          className="group flex min-h-64 flex-col justify-between bg-blue px-6 py-12 text-white transition-colors duration-200 hover:bg-navy sm:px-10 md:px-14 md:py-16"
        >
          <p className="text-sm font-extrabold tracking-wide text-white uppercase">
            For schools and volunteers
          </p>
          <div className="mt-10">
            <h2 className="display-serif text-4xl leading-none font-bold tracking-[-0.03em] md:text-5xl">
              Ask for a visit.
            </h2>
            <p className="mt-4 max-w-sm text-base leading-7 text-white">
              Tell us the grade, or say you want to volunteer. The form
              downloads a note, because we don't have a public email yet.
            </p>
            <span className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-white">
              Get involved
              <ArrowUpRight
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </span>
          </div>
        </Link>
      </section>
    </>
  );
}
