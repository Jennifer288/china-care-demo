import Link from "next/link";
export default function NotFound() {
  return (
    <section className="wrap py-24">
      <p className="eyebrow">404</p>
      <h1 className="section-title mt-4">This page could not be found.</h1>
      <Link className="btn mt-8" href="/">
        Return home
      </Link>
    </section>
  );
}
