"use client";

import { cn } from "@/lib/utils/cn";

export default function FormSection({ title, subtitle, icon, children }) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800",
        "shadow-[0_1px_0_#e2e8f0] dark:shadow-[0_1px_0_#1e293b] overflow-hidden"
      )}
    >
      {(title || subtitle) && (
        <div className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 px-4 py-3">
          <div className="flex items-center gap-2">
            {icon && <span className="text-slate-500 dark:text-slate-400">{icon}</span>}
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
              {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

