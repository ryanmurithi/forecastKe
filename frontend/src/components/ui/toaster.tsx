"use client"

import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"

export function Toaster() {
    const { toasts } = useToast()

    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`flex items-start justify-between p-4 rounded-lg shadow-lg border ${t.variant === "destructive"
                            ? "bg-red-600 text-white border-red-700"
                            : "bg-background text-foreground border-border"
                        } animate-in slide-in-from-bottom-5`}
                >
                    <div className="flex flex-col gap-1 pr-6">
                        {t.title && <div className="font-semibold text-sm">{t.title}</div>}
                        {t.description && <div className="text-sm opacity-90">{t.description}</div>}
                    </div>
                </div>
            ))}
        </div>
    )
}
