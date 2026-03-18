import React, { useEffect } from "react";
import { useAtom } from "jotai";
import { isOpeningAll } from "../atoms/atoms";

export default function AlertViewer() {
  const [openingall, setOpeningAll] = useAtom(isOpeningAll);

  useEffect(() => {
    if (openingall.opening) {
      const timer = setTimeout(() => {
        setOpeningAll({ opening: false, severity: "success", alerttext: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [openingall.opening, setOpeningAll]);

  if (!openingall.opening) return null;

  const colors = {
    success: "bg-success",
    error: "bg-danger",
    info: "bg-accent",
    warning: "bg-yellow-500",
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9998]">
      <div
        className={`${colors[openingall.severity] || colors.success} text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-3`}
      >
        <span>{openingall.alerttext}</span>
        <button
          onClick={() => setOpeningAll({ opening: false, severity: "success", alerttext: "" })}
          className="text-white/70 hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
