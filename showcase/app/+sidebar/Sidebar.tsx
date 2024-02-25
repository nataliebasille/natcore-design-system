import { List, Divider } from "@natcore/design-system-react";
import { SidebarItem } from "./SidebarItem";
import { Logo } from "./Logo";

export const Sidebar = () => {
  return (
    <>
      <Logo />
      <Divider />
      <div className="text-secondary-800 mb-2 font-bold uppercase tracking-wider">
        Components
      </div>
      <List.Container color="primary">
        <SidebarItem href="/component/button">Button</SidebarItem>
        <SidebarItem href="/component/card">Card</SidebarItem>
        <SidebarItem href="/component/divider">Divider</SidebarItem>
        {/* <SidebarItem href="/component/layer">Layer</SidebarItem> */}
        <SidebarItem href="/component/list">List</SidebarItem>
        <SidebarItem href="/component/radio-group">Radio Group</SidebarItem>
        <SidebarItem href="/component/switch">Toggle</SidebarItem>
        <SidebarItem href="/component/tabs">Tabs</SidebarItem>
      </List.Container>

      <div className="text-secondary-800 mb-2 mt-8 font-bold uppercase tracking-wider">
        Forms
      </div>

      <List.Container color="primary">
        <SidebarItem href="/form/fields">Fields</SidebarItem>
        <SidebarItem href="/form/form-controls">Form controls</SidebarItem>
      </List.Container>
    </>
  );
};
