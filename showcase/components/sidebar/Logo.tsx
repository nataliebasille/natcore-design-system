'use client';

import { useRouter } from 'next/navigation';
import { logo as LogoSVG } from '@natcore/design-system-core';
export const Logo = () => {
  const router = useRouter();
  return (
    <div
      className='-ml-3 inline-flex cursor-pointer rounded-md p-3 hover:bg-tertiary-100'
      onClick={() => router.push('/')}
    >
      <div className='h-[48px] w-[48px] font-bold text-primary'>
        <LogoSVG />
      </div>
      <span className='ml-1 text-5xl text-primary'>at</span>
      <span className='text-5xl text-secondary'>Core</span>
    </div>
  );
};
