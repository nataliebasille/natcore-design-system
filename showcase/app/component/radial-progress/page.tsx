import { DocPage, DocSection } from "@/components/doc/DocPage";
import { RadialProgressPlayground } from "./RadialProgressPlayground";

declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}

export default function RadialProgressPage() {
  return (
    <DocPage
      title="Radial progress"
      description="A customizable radial progress component"
    >
      <DocSection title="Playground">
        <RadialProgressPlayground />
      </DocSection>
    </DocPage>
  );
}
