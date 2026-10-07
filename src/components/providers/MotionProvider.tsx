"use client";

import { LazyMotion, domMax } from "framer-motion";
import type { ReactNode } from "react";

export function MotionProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <LazyMotion features={domMax}>{children}</LazyMotion>;
}
