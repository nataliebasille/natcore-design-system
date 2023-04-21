import { PropsWithChildren } from 'react';

export const Divider: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className='divider'>{children}</div>;
};
