"use client";

import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider } from "./providers/theme";

export type DesignSystemProviderProps = ThemeProviderProps;

export const DesignSystemProvider = ({ children, ...props }: DesignSystemProviderProps) => (
  <ThemeProvider {...props}>{children}</ThemeProvider>
);
