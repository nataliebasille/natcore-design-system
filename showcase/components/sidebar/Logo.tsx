'use client';

import { useRouter } from 'next/navigation';
import { logo as LogoSVG } from '@natcore/design-system-core';
export const Logo = () => {
  const router = useRouter();
  return (
    <div
      className='inline-flex hover:bg-tertiary-100 cursor-pointer p-3 rounded-md -ml-3'
      onClick={() => router.push('/')}
    >
      <div className='w-[48px] h-[48px] text-primary font-bold'>
        <LogoSVG />
      </div>
      <span className='ml-1 text-primary text-5xl'>at</span>
      <span className='text-secondary text-5xl'>Core</span>
    </div>
  );
};
