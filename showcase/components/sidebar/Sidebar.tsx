import { List, Divider } from "@natcore/design-system-react";
import { SidebarItem } from "./SidebarItem";
import { Logo } from "./Logo";

export const Sidebar = () => {
  return (
    <>
      <Logo />
      <Divider />
      <div className="text-secondary-800 mb-4 font-bold uppercase tracking-wider">
        Components
      </div>
      <List.Container color="primary">
        <SidebarItem href="/button">Button</SidebarItem>
        <SidebarItem href="/divider">Divider</SidebarItem>
        <SidebarItem href="/layer">Layer</SidebarItem>
        <SidebarItem href="/list">List</SidebarItem>
        <SidebarItem href="/radio-group">Radio Group</SidebarItem>
      </List.Container>
    </>
  );
};
