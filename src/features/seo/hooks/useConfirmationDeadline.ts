"use client";

import { useEffect, useRef, useState } from "react";

const MILLISECONDS_PER_SECOND = 1000;
const COUNTDOWN_TICK_MS = 100;

// One mounted confirmation = one deadline. The modal keys this lifetime by entity.
export function useConfirmationDeadline({ delayMs, pending, disabled, onConfirm }: {
  delayMs: number;
  pending: boolean;
  disabled: boolean;
  onConfirm: () => void | Promise<void>;
}) {
  const [deadline] = useState(() => Date.now() + delayMs);
  const [remaining, setRemaining] = useState(() => Math.ceil(delayMs / MILLISECONDS_PER_SECOND));
  const active = useRef(true);
  const submitting = useRef(false);
  const current = useRef({ pending, disabled, onConfirm });
  current.current = { pending, disabled, onConfirm };

  useEffect(() => {
    active.current = true;
    const timer = window.setInterval(() => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / MILLISECONDS_PER_SECOND));
      setRemaining(seconds);
      if (seconds === 0) window.clearInterval(timer);
    }, COUNTDOWN_TICK_MS);
    return () => {
      active.current = false;
      window.clearInterval(timer);
    };
  }, [deadline]);

  const confirm = async () => {
    if (!active.current || Date.now() < deadline || submitting.current) return;
    if (current.current.pending || current.current.disabled) return;
    submitting.current = true;
    try {
      await current.current.onConfirm();
    } finally {
      submitting.current = false;
    }
  };

  return { remaining, confirm };
}
