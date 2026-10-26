import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SavingsPlanner from "@/components/savings-planner";

export const metadata: Metadata = {
  title: "Savings planner",
  description:
    "Find out when you can afford your next goal, or how much to save each week to get there by a date, including interest and rising prices.",
};

export default function SavingsPage() {
  return (
    <div className="container-shell game-page">
      <Link href="/games" className="text-link text-navy/65">
        <ArrowLeft size={16} aria-hidden="true" /> All games & tools
      </Link>
      <div className="game-page-heading">
        <p className="eyebrow">Saving & planning</p>
        <h1 className="page-heading">Savings planner</h1>
        <p className="body-copy">
          Tell us what you’re saving for and we’ll work out when you can buy it,
          or how much you need to put away each week to get it by a certain
          date. You can also see how interest and rising prices change the
          plan.
        </p>
      </div>
      <div className="game-experience">
        <SavingsPlanner />
      </div>
      <p className="game-disclaimer">
        Results are estimates that assume you save on schedule and that your
        interest rate stays the same. Nothing you type here leaves your
        browser.
      </p>
    </div>
  );
}
