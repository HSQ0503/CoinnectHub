import type { Metadata } from "next";
import Image from "next/image";
import { MessageCircle, Coins, Compass } from "lucide-react";
import CoinMascot from "@/components/coin-mascot";
import JoinBanner from "@/components/join-banner";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "Why João Ferla started CoinnectHub, and how it brings financial literacy to teenagers through social media, free games, and middle school workshops.",
};

const workshop = [
  {
    Icon: MessageCircle,
    title: "Start with a question",
    text: "What is a stock, and how do I save for something I want? Students can ask anything, even when the words are new to them.",
  },
  {
    Icon: Coins,
    title: "Use familiar examples",
    text: "We talk about things students already deal with, like saving for a $120 pair of headphones or deciding what to do with $15 this week.",
  },
  {
    Icon: Compass,
    title: "Take the idea with you",
    text: "A workshop is a single visit, so the goal is to leave students with an idea they can use the next time a money decision comes up.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="page-intro">
        <div className="container-shell about-hero-grid">
          <div>
            <p className="eyebrow">Our story</p>
            <h1 className="page-heading">A better start with money</h1>
            <p className="body-copy">
              We believe every young person should get the chance to learn how
              money works, and CoinnectHub grew out of that belief.
            </p>
          </div>
          <div className="about-brand-panel">
            <CoinMascot />
            <p>A little curiosity goes a long way</p>
          </div>
        </div>
      </section>
      <section className="container-shell section-space founder-story">
        <aside className="founder-aside">
          <Image
            src="/joao-ferla.jpg"
            alt="João Ferla, founder of CoinnectHub, smiling outdoors at sunset"
            width={640}
            height={961}
            className="founder-portrait"
            sizes="(max-width: 767px) 260px, 320px"
          />
          <h2>João Ferla</h2>
          <p>Founder of CoinnectHub</p>
        </aside>
        <article className="founder-article">
          <h2 className="sr-only">Why CoinnectHub began</h2>
          <blockquote>
            “I started CoinnectHub because financial literacy felt too important
            to be something teenagers had to learn by accident.”
          </blockquote>
          <p>
            Moving from Brazil to the United States made the gap clearer to me.
            Some students had grown up discussing saving and investing, while
            others had barely been introduced to those ideas.
          </p>
          <p>
            When I shared what I was learning with friends, they were interested
            too. The problem wasn’t a lack of curiosity. Financial literacy is
            an essential life skill, yet it’s often overlooked in school or
            taught in a way that doesn’t feel relevant to teenagers.
          </p>
          <p>
            I began creating short, visual{" "}
            <a
              href="https://www.instagram.com/coinnect.hub/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram posts
              <span className="sr-only"> (opens in a new tab)</span>
            </a>{" "}
            that break down financial topics in language teenagers can
            understand. CoinnectHub later expanded to TikTok, but I wanted to
            reach students beyond social media. Today, we bring financial
            literacy into middle schools through workshops where students can
            ask questions, explore everyday money decisions, and build a
            foundation they can use as they grow up.
          </p>
        </article>
      </section>
      <section className="workshop-section">
        <div className="container-shell section-space">
          <p className="eyebrow">In the classroom</p>
          <h2 className="section-title">What a workshop looks like</h2>
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
