import { highlight } from '@/utlls/syntax-highlighter';
import fs from 'fs';
import path from 'path';

const SystemToFileTypeMap = {
  native: 'html',
  react: 'tsx',
} as const;

export const CodeExample = async ({
  component,
  system,
}: {
  component: string;
  system: 'native' | 'react';
}) => {
  const filetype = SystemToFileTypeMap[system];
  console.log(import.meta.url);
  const file = await fs.promises.readFile(
    new URL(
      `../app/${component}/examples/${system}.${filetype}`,
      import.meta.url
    ),
    'utf8'
  );

  return (
    <code
      dangerouslySetInnerHTML={{ __html: highlight(file, { lang: 'native' }) }}
    />
  );
};
