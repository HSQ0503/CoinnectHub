import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function JoinBanner() {
  return (
    <section className="bg-blue text-white">
      <div className="container-shell flex flex-col items-start justify-between gap-7 py-14 md:flex-row md:items-center md:py-16">
        <div>
          <h2 className="text-3xl font-extrabold tracking-[-0.04em] md:text-4xl">
            Want this in a class?
          </h2>
          <p className="mt-4 max-w-[600px] text-base leading-7 text-white">
            Teachers and volunteers can write a note. We don't have a public
            email yet, so the form downloads a file you can send later.
          </p>
        </div>
        <Link href="/get-involved" className="button-yellow shrink-0">
          Get involved <ArrowUpRight size={18} />
        </Link>
      </div>
    </section>
  );
}
