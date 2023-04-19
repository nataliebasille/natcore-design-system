import { List } from '@natcore/design-system-react';
import { SidebarItem } from './SidebarItem';

export const Sidebar = () => {
  return (
    <List.Container color='primary'>
      <SidebarItem href='/button'>Button</SidebarItem>
    </List.Container>
  );
};
