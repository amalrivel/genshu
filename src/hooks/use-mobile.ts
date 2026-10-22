"use client";

import { useSyncExternalStore } from "react";

const query = "(max-width: 767px)";
const getServerSnapshot = () => false;
const getSnapshot = () => window.matchMedia(query).matches;
function subscribe(onChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
