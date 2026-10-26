import Link from "next/link";
export default function NotFound() {
  return (
    <section className="container-shell py-28">
      <p className="eyebrow text-blue">Page not found</p>
      <h1 className="page-heading max-w-2xl">We couldn’t find that page</h1>
      <p className="body-copy mt-6">
        It may have moved, but the games and tools are a good place to start.
      </p>
      <Link href="/games" className="button-primary mt-8">
        Go to the games
      </Link>
    </section>
  );
}
