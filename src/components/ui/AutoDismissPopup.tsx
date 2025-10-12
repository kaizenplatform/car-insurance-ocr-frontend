"use client"

import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/src/components/ui/button";

interface AutoDismissPopupProps {
  open: boolean;
  duration?: number; // ms
  title?: string;
  description?: string;
  onClose?: () => void;
}

export default function AutoDismissPopup({ open, duration = 3000, title = "完了", description = "処理が完了しました", onClose }: AutoDismissPopupProps) {
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
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <div>
            <Button variant="ghost" onClick={() => { setVisible(false); onClose && onClose(); }}>閉じる</Button>
          </div>
        </div>
        <div className="mt-4 h-3 bg-slate-100 rounded overflow-hidden">
          {duration <= 0 ? (
            // Indeterminate loading (static, no animation)
            <div className="h-full bg-blue-500" style={{ width: `100%` }} />
          ) : (
            // Timed progress (no CSS transition so width updates immediately)
            <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
          )}
        </div>
      </div>
    </div>
  );
}
