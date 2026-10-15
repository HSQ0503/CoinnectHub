import type { Metadata } from "next";
import { ArrowUpRight, Instagram, Mail, School, Users } from "lucide-react";
import { InvolvementForm } from "@/components/involvement-form";

export const metadata: Metadata = {
  title: "Get involved with CoinnectHub",
  description:
    "Explore volunteering and school or community partnerships with CoinnectHub.",
};

export default function GetInvolvedPage() {
  return (
    <>
      <section className="bg-blue pt-16 pb-16 text-white md:pt-24 md:pb-20">
        <div className="container-shell">
          <p className="eyebrow mb-6 text-white">Contact & get involved</p>
          <h1 className="max-w-4xl text-[clamp(3rem,7vw,6rem)] leading-[1.04] font-extrabold tracking-[-0.055em]">
            A little of your time.
            <br />
            <span className="text-yellow">A lot to pass on.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed md:text-xl">
            Help make financial learning more approachable. We’d love to hear
            from adults, educators, and organizations who share that purpose.
          </p>
        </div>
      </section>

      <section className="container-shell grid items-start gap-12 py-16 md:py-24 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <h2 className="mb-8 max-w-md text-3xl leading-tight font-extrabold tracking-tight md:text-4xl">
            Good things start with a conversation.
          </h2>
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-navy bg-yellow">
                <Users size={23} strokeWidth={1.6} aria-hidden="true" />
              </div>
              <div>
                <h3 className="mb-2 text-lg font-extrabold">
                  Interested in volunteering?
                </h3>
                <p className="leading-relaxed text-navy/75">
                  Tell us what you enjoy doing and how you’d like to contribute
                  to financial education.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-navy bg-white">
                <School size={23} strokeWidth={1.6} aria-hidden="true" />
              </div>
              <div>
                <h3 className="mb-2 text-lg font-extrabold">
                  Represent a school or community?
                </h3>
                <p className="leading-relaxed text-navy/75">
                  Share the needs of your learners and your ideas for bringing
                  financial learning to them.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-navy/20 pt-8">
            <div className="flex items-center gap-3">
              <Mail size={20} strokeWidth={1.6} aria-hidden="true" />
              <h3 className="font-extrabold">Contact details coming soon.</h3>
            </div>
            <p className="mt-3 leading-relaxed text-navy/75">
              We’re getting this space ready. You can prepare and download an
              inquiry now to send once our contact information is available.
            </p>
            <a
              href="https://www.instagram.com/coinnect.hub/"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex min-h-11 items-center gap-3 font-bold underline-offset-4 hover:underline"
            >
              <Instagram size={20} aria-hidden="true" />
              @coinnect.hub
              <ArrowUpRight size={17} aria-hidden="true" />
              <span className="sr-only">on Instagram (opens in a new tab)</span>
            </a>
          </div>
        </div>

        <InvolvementForm />
      </section>
    </>
  );
}
