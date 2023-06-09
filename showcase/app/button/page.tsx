import {
  SelectorContainer,
  SelectorContent,
} from "@/components/ContentSelector";
import { Preview } from "./Preview";

export default function ButtonPage() {
  return (
    <article>
      <h1>Button</h1>

      <p className="mb-7 tracking-wider text-gray-600">
        A customizable button component that comes with different variants,
        sizes, and styles.
      </p>

      <h2>Usage</h2>
      <SelectorContainer>
        <SelectorContent selector="Preview">
          <Preview />
        </SelectorContent>
      </SelectorContainer>
    </article>
  );
}
