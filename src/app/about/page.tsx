import type { Metadata } from "next";
import { MessageCircle, Coins, Compass } from "lucide-react";
import CoinMascot from "@/components/coin-mascot";
import JoinBanner from "@/components/join-banner";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "Why CoinnectHub brings financial literacy to young people through free games, conversations, and middle school workshops.",
};

const workshop = [
  {
    Icon: MessageCircle,
    title: "Start with a question",
    text: "What is a stock? How do I save for something I want? There is room to ask, even when the words are new.",
  },
  {
    Icon: Coins,
    title: "Make it familiar",
    text: "A $120 pair of headphones. A week with $15 in it. We use everyday choices to make money concepts concrete.",
  },
  {
    Icon: Compass,
    title: "Take the idea with you",
    text: "A workshop is one visit. The aim is to leave students with an idea they can use when the next choice comes along.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="page-intro">
        <div className="container-shell about-hero-grid">
          <div>
            <p className="eyebrow">Our story</p>
            <h1 className="page-heading">
              A better start
              <br />
              with money.
            </h1>
            <p className="body-copy">
              Financial literacy should be something every young person gets to
              learn. CoinnectHub began with that belief.
            </p>
          </div>
          <div className="about-brand-panel">
            <CoinMascot />
            <p>A little curiosity goes a long way.</p>
          </div>
        </div>
      </section>
      <section className="container-shell section-space founder-story">
        <aside className="founder-aside">
          <div className="founder-monogram" aria-hidden="true">
            F.
          </div>
          <h2>Mr. Ferla</h2>
          <p>Founder of CoinnectHub</p>
        </aside>
        <article className="founder-article">
          <h2 className="sr-only">Why CoinnectHub began</h2>
          <blockquote>
            “I started CoinnectHub because financial literacy felt too important
            to be something teenagers had to learn by accident.”
          </blockquote>
          <p>
            I saw it after I moved from Brazil to the United States. Some
            students had grown up talking about saving and investing at home.
            Others had barely heard those words in a class.
          </p>
          <p>
            When I told friends what I was learning, they wanted the same
            explanation. The problem wasn’t a lack of curiosity.
          </p>
          <p>
            I think of money skills as a life skill. School still skips them, or
            teaches them like everyone in the room already has a paycheck and a
            brokerage account.
          </p>
          <p>
            I started with short{" "}
            <a
              href="https://www.instagram.com/coinnect.hub/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram posts
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            , pictures and plain words, at @coinnect.hub, because that was the
            fastest way to put a topic in front of people my age. TikTok came
            after.
          </p>
          <p>
            I still wanted a classroom, so now we go into middle schools.
            Students ask questions, try choices like what to do with $15 this
            week, and leave with something they can use later.
          </p>
        </article>
      </section>
      <section className="workshop-section">
        <div className="container-shell section-space">
          <p className="eyebrow">In the classroom</p>
          <h2 className="section-title">
            Good questions.
            <br />
            Everyday examples.
          </h2>
          <ul className="workshop-grid">
            {workshop.map(({ Icon, title, text }) => (
              <li key={title}>
                <Icon size={27} strokeWidth={1.5} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <JoinBanner />
    </>
  );
}
