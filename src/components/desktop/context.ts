"use client";

import { createContext } from "react";

export const ScrollContainerContext = createContext<
  HTMLDivElement | null | undefined
>(undefined);

export const SiteLaunchContext = createContext(0);
