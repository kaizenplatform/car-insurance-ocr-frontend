"use client"

import React, { createContext, useContext, useCallback, useState } from "react";
import AutoDismissPopup from "./AutoDismissPopup";

type PopupOptions = {
  title?: string;
  description?: string;
  duration?: number; // ms
  spinner?: boolean;
}

type PopupContextValue = {
  showPopup: (opts?: PopupOptions) => void;
  showLoading: (opts?: Omit<PopupOptions, 'duration'>) => void;
  showCompletion: (opts?: Omit<PopupOptions, 'duration'>) => void;
}

const PopupContext = createContext<PopupContextValue | null>(null);

export function PopupProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<PopupOptions>({});

  const showPopup = useCallback((opts?: PopupOptions) => {
    setOptions(opts || {});
    setOpen(true);
  }, []);

  const showLoading = useCallback((opts?: Omit<PopupOptions, 'duration'>) => {
    setOptions({ ...(opts || {}), duration: 0 });
    setOpen(true);
  }, []);

  const showCompletion = useCallback((opts?: Omit<PopupOptions, 'duration'>) => {
    setOptions({ ...(opts || {}), duration: 2000 });
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <PopupContext.Provider value={{ showPopup, showLoading, showCompletion }}>
      {children}
      <AutoDismissPopup
        open={open}
        duration={options.duration ?? 3000}
        title={options.title ?? "完了"}
        description={options.description ?? "処理が完了しました"}
        spinner={options.spinner ?? false}
        onClose={handleClose}
      />
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const ctx = useContext(PopupContext);
  if (!ctx) throw new Error("usePopup must be used within PopupProvider");
  return ctx;
}

export default PopupProvider;
