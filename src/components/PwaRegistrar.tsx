import { useEffect } from "react";

export function PwaRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    const reg = navigator.serviceWorker.register("/sw.js").catch(() => {});
    return () => { void reg; };
  }, []);
  return null;
}