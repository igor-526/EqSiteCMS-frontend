"use client";

import { useEffect, useRef, useState } from "react";

// Capture before AntD moves focus into the portal. Entity changes retain the
// same session; only closing/unmounting the session restores its opener.
export function useConfirmationFocusReturn(enabled: boolean) {
  const [opener] = useState(() => {
    const element = globalThis.document?.activeElement;
    return element && element instanceof HTMLElement ? element : null;
  });
  const active = useRef(true);

  useEffect(() => {
    if (!enabled) return;
    active.current = true;
    return () => {
      active.current = false;
      queueMicrotask(() => {
        // Ignore StrictMode's simulated cleanup and removed/disabled triggers.
        if (!active.current && opener?.isConnected && !opener.matches(":disabled")) {
          opener.focus({ preventScroll: true });
        }
      });
    };
  }, [enabled, opener]);
}
