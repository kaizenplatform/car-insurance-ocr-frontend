"use client"

import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/src/components/ui/button";

interface AutoDismissPopupProps {
  open: boolean;
  duration?: number; // ms
  title?: string;
  description?: string;
  spinner?: boolean;
  onClose?: () => void;
}

export default function AutoDismissPopup({ open, duration = 3000, title = "完了", description = "処理が完了しました", spinner = false, onClose }: AutoDismissPopupProps) {
  const [visible, setVisible] = useState(open);
  const [progress, setProgress] = useState(100);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    setVisible(open);
    setProgress(100);
    startRef.current = null;

    if (!open) return;

    // If duration is <= 0, treat as indeterminate loading state (no auto-dismiss)
    if (duration <= 0) {
      setProgress(100);
      return;
    }

    const tick = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const ratio = Math.min(1, elapsed / duration);
      setProgress(100 - ratio * 100);
      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setVisible(false);
        onClose && onClose();
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [open, duration, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => { setVisible(false); onClose && onClose(); }} />
      <div className="relative z-10 w-[min(560px,90%)] bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6">
        {/* thin progress bar positioned slightly above the popup (outside) */}
        <div className="absolute -top-1 left-0 w-full flex">
          <div className="w-full overflow-hidden rounded-t-md">
            <div className="h-0.5 bg-slate-100">
              <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <div>
            <Button variant="ghost" onClick={() => { setVisible(false); onClose && onClose(); }}>閉じる</Button>
          </div>
        </div>
        <div className="mt-4">
          {duration <= 0 && spinner ? (
            // Circular spinner for indeterminate loading (pop-step) — now animated
            <div className="flex justify-center py-4">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : (
            // For timed popups we keep the thin progress bar above the popup; inside can be empty or show a small spacer
            <div className="h-2" />
          )}
        </div>
      </div>
    </div>
  );
}
