import fs from "node:fs/promises";
import path from "node:path";
import { __unstable__loadDesignSystem } from "tailwindcss";
import { fileURLToPath } from "node:url";
import { DocPage, DocSection } from "@/app/_ui/doc/DocPage";

export default async function ButtonPage() {
  // const css = await fs.readFile(
  //   "../packages/core-v2/dist/components/button.css",
  //   "utf-8",
  // );

  // const x = `
  //   @import 'tailwindcss';
  //   ${css}`;

  // const ds = await __unstable__loadDesignSystem(x, {
  //   base: process.cwd(),
  //   async loadStylesheet(id: string, base: string) {
  //     let resolvedPath: string;

  //     // Handle package imports vs file paths
  //     if (id.startsWith(".") || id.startsWith("/")) {
  //       resolvedPath = path.resolve(base, id);
  //     } else {
  //       // Resolve node_modules packages
  //       try {
  //         const modulePath = await import.meta.resolve?.(id);
  //         resolvedPath = fileURLToPath(modulePath);
  //       } catch {
  //         // Fallback: construct path manually
  //         resolvedPath = path.join(base, "node_modules", id, "index.css");
  //       }
  //     }

  //     const content = await fs.readFile(resolvedPath, "utf-8");
  //     return {
  //       path: resolvedPath,
  //       base: path.dirname(resolvedPath),
  //       content,
  //     };
  //   },
  // });

  // // Get all classes and filter for button-related ones
  // const allClasses = ds.getClassList();
  // const buttonClasses = allClasses.filter(
  //   (entry) => entry[0].startsWith("btn-") || entry[0] === "btn",
  // );

  // // Group button classes by category
  // const buttonInfo = {
  //   base: buttonClasses.filter((c) => c[0] === "btn"),
  //   variants: buttonClasses.filter((c) =>
  //     c[0].match(/^btn-(solid|outline|ghost|ghost-outline)$/),
  //   ),
  //   colors: buttonClasses.filter((c) =>
  //     c[0].match(/^btn-(primary|secondary|success|danger|warning|info)$/),
  //   ),
  //   sizes: buttonClasses.filter((c) => c[0].match(/^btn-size-/)),
  // };

  // // Test dynamic modifiers
  // const dynamicExamples = [
  //   "btn-size-xs",
  //   "btn-size-sm",
  //   "btn-size-md",
  //   "btn-size-lg",
  //   "btn-size-xl",
  //   "btn-size-2xl",
  //   "btn-size-[24px]", // arbitrary value
  // ];

  // // Parse each candidate to see its structure
  // const parsedCandidates = dynamicExamples.map((candidate) => ({
  //   candidate,
  //   parsed: ds.parseCandidate(candidate),
  // }));

  // // Generate CSS for dynamic values
  // const cssForDynamic = ds.candidatesToCss(dynamicExamples);

  return (
    <DocPage
      title="Button"
      description="Composable button utilities: pick a variant, a tone, and a size. Everything else (hover, focus, active) is built in"
    >
      <DocSection title="Playground">
        <div className="card-soft rounded-sm!">
          <div className="card-content">Playground for button</div>
        </div>
      </DocSection>
    </DocPage>
  );
}
