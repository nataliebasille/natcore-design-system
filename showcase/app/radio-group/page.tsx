import {
  SystemSelectorContainer,
  SystemSelectorContent,
} from "@/components/SystemSelector";
import { CodeExample } from "@/components/CodeExample";

export default function RadioGroupPage() {
  return (
    <article>
      <h1 className="text-gray-800">Radio Group</h1>
      <p className="mb-7 tracking-wider text-gray-600">
        Select a single value from a small set of options
      </p>
      <SystemSelectorContainer initialSystem="native">
        <SystemSelectorContent system="native">
          {/* @ts-expect-error Async Server Component */}
          <CodeExample component="radio-group" system="native" />
        </SystemSelectorContent>
      </SystemSelectorContainer>
    </article>
  );
}
