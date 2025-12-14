import React, { useLayoutEffect, useMemo, useState } from "react";

import { ViewerContext } from "./ViewerContext";

export type ViewportMetrics = {
  width: number;
  height: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
  centerX: number;
  centerY: number;
  widthRatio: number;
  heightRatio: number;
  centerRatioX: number;
  centerRatioY: number;
};

// eslint-disable-next-line react-refresh/only-export-components
export const DEFAULT_VIEWPORT_METRICS: ViewportMetrics = {
  width: 0,
  height: 0,
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  centerX: 0,
  centerY: 0,
  widthRatio: 0,
  heightRatio: 0,
  centerRatioX: 0,
  centerRatioY: 0,
};

const ViewportLayoutContext = React.createContext<ViewportMetrics>(
  DEFAULT_VIEWPORT_METRICS,
);

function safeViewportDimension(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function computeMetrics(element: HTMLElement): ViewportMetrics {
  const rect = element.getBoundingClientRect();
  const viewportWidth = safeViewportDimension(
    typeof window !== "undefined" ? window.innerWidth : rect.width,
  );
  const viewportHeight = safeViewportDimension(
    typeof window !== "undefined" ? window.innerHeight : rect.height,
  );
  const widthRatio = viewportWidth > 0 ? rect.width / viewportWidth : 0;
  const heightRatio = viewportHeight > 0 ? rect.height / viewportHeight : 0;
  const centerRatioX = viewportWidth > 0 ? (rect.left + rect.width / 2) / viewportWidth : 0;
  const centerRatioY = viewportHeight > 0 ? (rect.top + rect.height / 2) / viewportHeight : 0;
  return {
    width: rect.width,
    height: rect.height,
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
    widthRatio,
    heightRatio,
    centerRatioX,
    centerRatioY,
  };
}

export function ViewportLayoutProvider({
  targetRef,
  children,
}: {
  targetRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
}) {
  const [metrics, setMetrics] = useState<ViewportMetrics>(DEFAULT_VIEWPORT_METRICS);
  const viewer = React.useContext(ViewerContext);

  useLayoutEffect(() => {
    const element = targetRef.current;
    if (!element) {
      return;
    }

    const update = () => {
      setMetrics(computeMetrics(element));
    };

    update();
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(element);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [targetRef]);

  useLayoutEffect(() => {
    if (!viewer) {
      return;
    }
    viewer.mutable.current.viewportMetrics = metrics;
  }, [metrics, viewer]);

  useLayoutEffect(() => {
    const element = targetRef.current;
    if (!element) {
      return;
    }
    element.style.setProperty("--viser-viewport-width-px", `${metrics.width}`);
    element.style.setProperty("--viser-viewport-height-px", `${metrics.height}`);
    element.style.setProperty("--viser-viewport-center-x-px", `${metrics.centerX}`);
    element.style.setProperty("--viser-viewport-center-y-px", `${metrics.centerY}`);
    element.style.setProperty("--viser-viewport-width-ratio", `${metrics.widthRatio}`);
    element.style.setProperty("--viser-viewport-height-ratio", `${metrics.heightRatio}`);
    element.style.setProperty("--viser-viewport-center-x-ratio", `${metrics.centerRatioX}`);
    element.style.setProperty("--viser-viewport-center-y-ratio", `${metrics.centerRatioY}`);
  }, [metrics, targetRef]);

  const contextValue = useMemo(() => metrics, [metrics]);

  return (
    <ViewportLayoutContext.Provider value={contextValue}>
      {children}
    </ViewportLayoutContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useViewportMetrics(): ViewportMetrics {
  return React.useContext(ViewportLayoutContext);
}
