"use client";

import {
  type FC,
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

const SidebarContext = createContext({
  isOpened: false,
  toggle: () => void 0,
});

export const useSidebar = () => useContext(SidebarContext);

export const SidebarContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isOpened, setIsOpened] = useState(false);

  const toggle = useCallback(() => {
    setIsOpened((open) => !open);
    return void 0;
  }, []);

  return (
    <SidebarContext.Provider value={{ isOpened, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
};
