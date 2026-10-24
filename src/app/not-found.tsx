import Link from "next/link";
export default function NotFound() {
  return (
    <section className="container-shell py-28">
      <p className="eyebrow text-blue">Page not found</p>
      <h1 className="page-heading max-w-2xl">That page isn't here.</h1>
      <p className="body-copy mt-6">
        The games are the main thing on the site.
      </p>
      <Link href="/games" className="button-primary mt-8">
        Go to the games
      </Link>
    </section>
  );
}
