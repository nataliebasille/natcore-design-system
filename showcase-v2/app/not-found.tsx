import Link from "next/link";
import { ArrowLeftIcon } from "./_ui/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <div className="relative select-none">
        <span
          className="text-[12rem] leading-none font-black tracking-tighter text-primary-500/10 tablet:text-[18rem]"
          aria-hidden
        >
          404
        </span>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span className="text-6xl font-black tracking-tighter text-primary-500 tablet:text-8xl">
            404
          </span>
          <span className="text-lg font-semibold text-on-surface-50 tablet:text-xl">
            Page not found
          </span>
        </div>
      </div>

      <p className="max-w-md text-sm leading-relaxed text-on-surface-50/60 tablet:text-base">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have been
        moved. Check the URL or head back to the docs.
      </p>

      <Link
        href="/"
        className="btn-filled/primary inline-flex items-center gap-2 btn-size-lg"
      >
        <ArrowLeftIcon className="size-4" />
        Back to docs
      </Link>
    </div>
  );
}
