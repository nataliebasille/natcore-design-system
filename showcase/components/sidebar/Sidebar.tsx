import { logo as Logo } from '@natcore/design-system-core';
import { List } from '@natcore/design-system-react';
import { SidebarItem } from './SidebarItem';

export const Sidebar = () => {
  return (
    <>
      <div className='inline-flex mb-4 hover:bg-tertiary-100 cursor-pointer p-3 rounded-md -ml-3'>
        <div className='w-[48px] h-[48px] text-primary font-bold'>
          <Logo />
        </div>
        <span className='ml-1 text-primary text-5xl'>at</span>
        <span className='text-secondary text-5xl'>Core</span>
      </div>
      <List.Container color='primary'>
        <SidebarItem href='/button'>Button</SidebarItem>
      </List.Container>
    </>
  );
};
