import Link from "next/link";
export default function NotFound() {
  return (
    <section className="container-shell py-28">
      <p className="eyebrow text-blue">Page not found</p>
      <h1 className="page-heading max-w-2xl">Let’s get you back on track.</h1>
      <p className="body-copy mt-6">
        This page may have moved. There’s still plenty to explore.
      </p>
      <Link href="/games" className="button-primary mt-8">
        Explore games & tools
      </Link>
    </section>
  );
}
