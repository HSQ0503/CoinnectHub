import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Camera,
  Coins,
  MessageCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About CoinnectHub",
  description:
    "Meet the idea behind CoinnectHub: making financial literacy approachable for the next generation.",
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-blue pt-16 pb-18 text-white md:pt-24 md:pb-24">
        <div className="container-shell">
          <p className="eyebrow mb-6 text-white">Our purpose</p>
          <h1 className="max-w-4xl text-[clamp(2.8rem,6.8vw,6rem)] leading-[1.04] font-extrabold tracking-[-0.055em]">
            Money is part of life.
            <br />
            <span className="text-yellow">Learning it should be, too.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed md:text-xl">
            CoinnectHub is a nonprofit helping young people understand money,
            ask better questions, and practice making financial decisions.
          </p>
        </div>
      </section>

      <section className="container-shell grid gap-10 py-18 md:grid-cols-[0.85fr_1.15fr] md:gap-20 md:py-24">
        <div>
          <p className="eyebrow mb-4">Why we exist</p>
          <h2 className="text-3xl leading-tight font-extrabold tracking-tight md:text-[2.75rem]">
            A place to start.
            <br />
            Room to get curious.
          </h2>
        </div>
        <div className="space-y-6 text-lg leading-relaxed text-navy/80">
          <p>
            Saving for something you want. Understanding a price change. Making
            sense of a stock market headline. These are real questions, and you
            don’t need to know all the terminology to start exploring them.
          </p>
          <p>
            We’re building a welcoming place for teens to learn the basics of
            finance and economics. Our approach is simple: explain an idea
            clearly, give you a chance to try it, and help you understand what
            happens.
          </p>
        </div>
      </section>

      <section className="border-y border-navy/15">
        <div className="container-shell grid gap-10 py-14 md:grid-cols-3 md:gap-12">
          <div>
            <BookOpen
              className="mb-5 size-8 text-navy"
              strokeWidth={1.6}
              aria-hidden="true"
            />
            <h3 className="mb-3 text-xl font-extrabold">
              Start with the everyday
            </h3>
            <p className="leading-relaxed text-navy/75">
              Use familiar choices to make the bigger concepts easier to
              understand.
            </p>
          </div>
          <div>
            <Coins
              className="mb-5 size-8 text-navy"
              strokeWidth={1.6}
              aria-hidden="true"
            />
            <h3 className="mb-3 text-xl font-extrabold">Learn by trying</h3>
            <p className="leading-relaxed text-navy/75">
              Change a savings goal or weigh a fictional headline. See the idea
              in action.
            </p>
          </div>
          <div>
            <MessageCircle
              className="mb-5 size-8 text-navy"
              strokeWidth={1.6}
              aria-hidden="true"
            />
            <h3 className="mb-3 text-xl font-extrabold">
              Leave room for questions
            </h3>
            <p className="leading-relaxed text-navy/75">
              Money decisions have tradeoffs. We explain the reasoning,
              including the uncertainty.
            </p>
          </div>
        </div>
      </section>

      <section className="container-shell grid items-center gap-10 py-18 md:grid-cols-2 md:gap-20 md:py-24">
        <div className="relative flex aspect-[5/4] flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-navy bg-yellow">
          <div className="flex size-24 items-center justify-center rounded-full border-2 border-navy bg-white">
            <Camera className="size-10" strokeWidth={1.4} aria-hidden="true" />
          </div>
          <p className="mt-6 text-xl font-extrabold">Photo coming soon</p>
          <p className="mt-2 text-sm text-navy/75">Mr. Ferla, Founder</p>
          <div
            aria-hidden="true"
            className="absolute right-0 bottom-0 left-0 h-4 border-t-2 border-navy bg-white"
          />
        </div>
        <div>
          <p className="eyebrow mb-4">Meet the founder</p>
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
            Mr. Ferla
          </h2>
          <p className="mb-6 text-lg leading-relaxed text-navy/80">
            The person behind CoinnectHub and its mission to make financial
            education more approachable for young people.
          </p>
          <div className="border-l-4 border-yellow pl-5">
            <p className="font-bold">His story is coming soon.</p>
            <p className="mt-2 leading-relaxed text-navy/75">
              We’ll share Mr. Ferla’s biography and the story of why he started
              CoinnectHub here.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-yellow py-14 md:py-18">
        <div className="container-shell flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              See what learning can look like.
            </h2>
            <p className="mt-4 text-lg text-navy/80">
              Start with a savings goal. Stay for the questions it sparks.
            </p>
          </div>
          <Link href="/games" className="button-primary shrink-0">
            Explore the games <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
