"use client";

import { ThemeProvider } from "next-themes";
import { PaletteProvider } from "@/components/providers/PaletteProvider";
import { MotionProvider } from "@/components/providers/MotionProvider";

export function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
    >
      <PaletteProvider>
        <MotionProvider>{children}</MotionProvider>
      </PaletteProvider>
    </ThemeProvider>
  );
}
