import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative overflow-hidden min-h-[60vh] flex items-center justify-center px-6 py-24">
      <div className="hero-aurora" aria-hidden />
      <div className="hero-orb hero-orb-1" aria-hidden />
      <div className="hero-grid" aria-hidden />

      <div className="relative text-center fade-up">
        <div
          className="mono text-[7rem] sm:text-[10rem] leading-none font-black select-none gradient-text"
          aria-hidden
        >
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-2 mb-3">
          Page not found
        </h1>
        <p className="opacity-70 max-w-md mx-auto leading-relaxed mb-8">
          This page doesn&apos;t exist — maybe it was moved, renamed, or never
          registered in the theme-kit registry.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            Back to home
          </Link>
          <Link href="/playground" className="btn btn-ghost">
            Open the playground
          </Link>
        </div>
      </div>
    </div>
  );
}
