import type { Metadata } from "next";
import { ArrowUpRight, Instagram, School, Users } from "lucide-react";
import { InvolvementForm } from "@/components/involvement-form";

export const metadata: Metadata = {
  title: "Get involved",
  description:
    "Explore volunteering and school workshops with CoinnectHub. Prepare an inquiry to share when contact details are available.",
};

export default function GetInvolvedPage() {
  return (
    <>
      <section className="page-intro">
        <div className="container-shell">
          <p className="eyebrow">Get involved</p>
          <h1 className="page-heading">
            Help bring money skills
            <br />
            to more students
          </h1>
          <p className="body-copy">
            You can help by volunteering your time and ideas or by inviting us
            into your classroom.
          </p>
        </div>
      </section>
      <section className="container-shell section-space contact-layout">
        <div className="contact-intro">
          <h2>Ways to get involved</h2>
          <div className="contact-option">
            <Users size={26} strokeWidth={1.5} aria-hidden="true" />
            <h3>Volunteer with us</h3>
            <p>
              Interested in volunteering? Tell us how you would like to help,
              whether that is a class visit, design, tutoring, or another skill.
            </p>
          </div>
          <div className="contact-option">
            <School size={26} strokeWidth={1.5} aria-hidden="true" />
            <h3>Host a workshop</h3>
            <p>
              Represent a school or community group? Tell us about your
              students, their grade, and the money questions they are asking.
            </p>
          </div>
          <div className="contact-notice">
            <strong>Contact details are coming soon</strong>
            <p>
              For now, you can prepare and download your inquiry, since this
              page doesn’t send messages yet. In the meantime, you can follow
              our short lessons on Instagram.
            </p>
            <a
              href="https://www.instagram.com/coinnect.hub/"
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              <Instagram size={16} aria-hidden="true" /> @coinnect.hub{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
        <InvolvementForm />
      </section>
    </>
  );
}
