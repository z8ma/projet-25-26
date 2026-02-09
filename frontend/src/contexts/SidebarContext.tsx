import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const STORAGE_KEY = 'sidebar-collapsed';

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Default to collapsed (true)
  const [isCollapsed, setIsCollapsedState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Default to true (collapsed) if nothing stored
    return stored === null ? true : stored === 'true';
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  const setIsCollapsed = (value: boolean) => {
    setIsCollapsedState(value);
  };

  const toggleSidebar = () => {
    setIsCollapsedState(prev => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
