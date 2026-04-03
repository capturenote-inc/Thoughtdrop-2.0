"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";

interface BreadcrumbSegment {
  id: string;
  name: string;
}

interface BreadcrumbContextType {
  segments: BreadcrumbSegment[];
  setSegments: (segments: BreadcrumbSegment[]) => void;
  /** Navigate to a breadcrumb index. -1 = root. */
  navigateTo: (index: number) => void;
  /** Register the navigation callback from the stream view */
  setNavigator: (fn: (index: number) => void) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType>({
  segments: [],
  setSegments: () => {},
  navigateTo: () => {},
  setNavigator: () => {},
});

export function useBreadcrumbContext() {
  return useContext(BreadcrumbContext);
}

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [segments, setSegmentsState] = useState<BreadcrumbSegment[]>([]);
  const navigatorRef = useRef<(index: number) => void>(() => {});

  const setSegments = useCallback((s: BreadcrumbSegment[]) => setSegmentsState(s), []);

  const navigateTo = useCallback((index: number) => {
    navigatorRef.current(index);
  }, []);

  const setNavigator = useCallback((fn: (index: number) => void) => {
    navigatorRef.current = fn;
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ segments, setSegments, navigateTo, setNavigator }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}
