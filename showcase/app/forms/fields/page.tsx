import { DocPage, DocSection } from "@/components/doc/DocPage";
import { ExampleContainer } from "@/components/doc/ExampleContainer";

export default function FieldsPage() {
  return (
    <DocPage title="Fields">
      <DocSection title="Demo">
        <ExampleContainer
          html={`<div class="flex flex-col gap-4">
    <input type="text" placeholder="Input" />

    <select>
        <option>Option 1</option>
        <option>Option 2</option>
        <option>Option 3</option>
    </select>

    <textarea placeholder="Textarea"></textarea>
</div>`}
        />
      </DocSection>
    </DocPage>
  );
}
