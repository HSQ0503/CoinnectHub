import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SavingsCalculator from "@/components/savings-calculator";

export const metadata: Metadata = {
  title: "How Long to Buy It?",
  description:
    "Turn something you want into a weekly savings plan. Explore how small changes can bring your goal closer with CoinnectHub’s free calculator.",
};

export default function SavingsPage() {
  return (
    <div className="container-shell py-10 sm:py-14 lg:py-18">
      <Link
        href="/games"
        className="mb-10 inline-flex min-h-11 items-center gap-2 text-sm font-bold underline-offset-4 hover:underline"
      >
        <ArrowLeft size={17} aria-hidden="true" />
        All games & tools
      </Link>
      <div className="mb-10 max-w-3xl sm:mb-12">
        <p className="eyebrow">Make a plan / Savings calculator</p>
        <h1 className="page-heading mt-4">
          How long to <span className="text-blue">buy it?</span>
        </h1>
        <p className="body-copy mt-5 max-w-2xl">
          Something you’ve had your eye on? Give it a price, choose what you can
          save, and see your goal get closer. Every little bit counts.
        </p>
      </div>
      <SavingsCalculator />
      <p className="mt-7 text-sm leading-relaxed text-navy/75">
        All amounts are in US dollars. Your entries stay in this browser session
        and aren’t submitted to CoinnectHub.
      </p>
    </div>
  );
}
