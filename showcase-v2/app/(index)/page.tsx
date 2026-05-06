import { ArrowRightIcon } from "@/ui/icons";
import { ComponentsIcon } from "@/ui/icons/components";
import { GuidelinesIcon } from "@/ui/icons/guidelines";
import { TokenIcon } from "@/ui/icons/token";
import { Overline } from "@/ui/layout/overline";
import { PALETTE } from "@nataliebasille/css-engine";
import { twMerge } from "tailwind-merge";

const BG_COLORS: Record<(typeof PALETTE)[number], string> = {
  primary: "bg-primary-500",
  secondary: "bg-secondary-500",
  accent: "bg-accent-500",
  surface: "bg-surface-500",
  success: "bg-success-500",
  danger: "bg-danger-500",
  disabled: "bg-disabled-500",
};

export default function Home() {
  return (
    <article>
      <h1>
        <span>Natcore</span>
        <br />
        <span className="text-(--tone-current-fg)/70">Design System</span>
      </h1>

      <p className="max-w-lg">
        A CSS-first design system built to survive different stacks. Tokens,
        utilities, and component styles applied through class names — if your
        product renders HTML, Natcore can style it.
      </p>

      <div className="divider my-8" />

      <div className="flex flex-col">
        <Overline>Principles</Overline>

        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2 tablet:gap-4 desktop:grid-cols-4">
          <InfoCard
            icon={
              <span className="inline-block aspect-square text-xs">01</span>
            }
            title="Stack agnostic"
            description="The core is CSS. If your product renders HTML, Natcore can style it."
          />

          <InfoCard
            icon={
              <span className="inline-block aspect-square text-xs">02</span>
            }
            title="Composable"
            description="Build UI by composing utilities and tokens — not one-off custom CSS."
          />
          <InfoCard
            icon={
              <span className="inline-block aspect-square text-xs">03</span>
            }
            title="Consistent"
            description="Modifiers express intent. Scan markup and understand it without reading implementation."
          />
          <InfoCard
            icon={
              <span className="inline-block aspect-square text-xs">04</span>
            }
            title="Themeable"
            description="Same HTML renders under any theme. Switch with a single data attribute."
          />
        </div>
      </div>

      <div className="divider my-8" />

      <div className="flex flex-col">
        <Overline>Explore</Overline>

        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2 tablet:gap-4 desktop:grid-cols-3">
          <InfoCard
            icon={<TokenIcon className="h-4 w-4" />}
            title="Token"
            description="Color, spacing, typography, radii, shadow, and motion as CSS variables"
            href="nowhere right now"
          />
          <InfoCard
            icon={<ComponentsIcon className="h-4 w-4" />}
            title="Components"
            description="Everything you need to build consistent interfaces"
          />
          <InfoCard
            icon={<GuidelinesIcon className="h-4 w-4" />}
            title="Guidelines"
            description="Variants, tones, naming conventions, and theming rules"
          />
        </div>
      </div>

      <div className="divider my-8" />

      <div className="">
        <Overline>Core Tokens</Overline>

        <div className="flex flex-wrap gap-3">
          {PALETTE.map((color) => (
            <div
              key={color}
              className="badge-soft/surface flex items-center rounded-lg px-3 py-1.5"
            >
              <span
                className={twMerge(
                  BG_COLORS[color],
                  `mr-2 inline-block h-3 w-3 rounded-sm`,
                )}
              ></span>
              {color}
            </div>
          ))}
        </div>
      </div>

      <div className="divider my-8" />

      <div className="flex">
        <button className="ml-auto flex btn-outline items-center gap-2 btn-size-sm">
          Installation guide <ArrowRightIcon className="size-3" />
        </button>
      </div>
    </article>
  );
}

function InfoCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
}) {
  return (
    <div className={twMerge("card card-soft/surface", href && "card-hover")}>
      <div data-slot="content" className="flex flex-col gap-1 tablet:gap-2">
        <span className="flex items-center gap-2">
          <span className="inline-flex aspect-square size-7 items-center justify-center rounded-md bg-surface-50 text-on-surface-50">
            {icon}
          </span>
          {title}
        </span>
        <span className="flex-1 text-xs/relaxed text-(--tone-current-fg)/70">
          {description}
        </span>

        {href && (
          <a className="mt-4 flex items-center-safe gap-1 text-xs tracking-wider uppercase">
            Explore <ArrowRightIcon className="size-3" />
          </a>
        )}
      </div>
    </div>
  );
}
