import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function JoinBanner() {
  return (
    <section className="join-section">
      <div className="container-shell join-inner">
        <div>
          <p className="eyebrow">For schools and volunteers</p>
          <h2>
            Bring money conversations
            <br />
            into your classroom
          </h2>
          <p>
            Invite us to your school or volunteer to help students feel more
            comfortable with money.
          </p>
        </div>
        <Link href="/get-involved" className="button-primary">
          Get involved <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
