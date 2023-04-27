import { FC } from 'react';
export const SourceButton: FC<{ href: string }> = ({ href }) => {
  return (
    <a
      className='btn-primary btn-sm btn inline-flex gap-1'
      href={href}
      target='_blank'
    >
      Source
    </a>
  );
};
