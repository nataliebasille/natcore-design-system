import { SourceButton } from '@/components/SourceButton';
import {
  SystemSelectorContainer,
  SystemSelectorContent,
} from '@/components/SystemSelector';
import { CodeExample } from '@/components/CodeExample';

export default async function RadioGroupPage() {
  return (
    <article>
      <h1>
        Radio Group{' '}
        <SourceButton href='https://github.com/nataliebasille/natcore-design-system/blob/main/packages/core/src/themes/components/radio-group.ts' />
      </h1>
      <p>Select a single value from a small set of options</p>
      <SystemSelectorContainer initialSystem='native'>
        <SystemSelectorContent system='native'>
          {/* @ts-expect-error Async Server Component */}
          <CodeExample component='radio-group' system='native' />
        </SystemSelectorContent>
        <SystemSelectorContent system='react'>React</SystemSelectorContent>
      </SystemSelectorContainer>
    </article>
  );
}
