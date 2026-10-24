import type { Metadata } from "next";
import { ArrowUpRight, Instagram, Mail, School, Users } from "lucide-react";
import { InvolvementForm } from "@/components/involvement-form";

export const metadata: Metadata = {
  title: "Get involved with CoinnectHub",
  description:
    "Volunteer or ask about a middle school workshop. The form downloads a note because CoinnectHub doesn't have a public email yet.",
};

export default function GetInvolvedPage() {
  return (
    <>
      <section className="bg-blue pt-16 pb-16 text-white md:pt-24 md:pb-20">
        <div className="container-shell">
          <p className="eyebrow mb-6 text-white">Contact & get involved</p>
          <h1 className="max-w-4xl text-[clamp(3rem,7vw,6rem)] leading-[1.04] font-extrabold tracking-[-0.055em]">
            Volunteers and schools.
            <br />
            <span className="text-yellow">Email isn't live yet.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed md:text-xl">
            Write the note anyway. You'll download a text file and send it once
            we post a contact address. Instagram is @coinnect.hub if you want
            the short posts first.
          </p>
        </div>
      </section>

      <section className="container-shell grid items-start gap-12 py-16 md:py-24 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <h2 className="mb-8 max-w-md text-3xl leading-tight font-extrabold tracking-tight md:text-4xl">
            Two kinds of notes.
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
                  Say what you'd actually do. A class visit, design, tutoring,
                  something else.
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
                  Tell us the grade and where students get stuck. Saving is the
                  one we hear most.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-navy/20 pt-8">
            <div className="flex items-center gap-3">
              <Mail size={20} strokeWidth={1.6} aria-hidden="true" />
              <h3 className="font-extrabold">No public email yet.</h3>
            </div>
            <p className="mt-3 leading-relaxed text-navy/75">
              Download the note and keep it. We'll add an address before this
              page can send anything on its own.
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
