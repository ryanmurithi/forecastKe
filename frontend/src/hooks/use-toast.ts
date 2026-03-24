import * as React from "react"

export interface ToastProps {
    id: string
    title?: string
    description?: string
    variant?: "default" | "destructive"
}

const TOAST_EVENT = "forecastke_toast"

export function toast(props: Omit<ToastProps, "id">) {
    const id = Math.random().toString(36).substring(2, 9)
    const event = new CustomEvent(TOAST_EVENT, { detail: { ...props, id } })
    window.dispatchEvent(event)
}

export function useToast() {
    const [toasts, setToasts] = React.useState<ToastProps[]>([])

    React.useEffect(() => {
        const handleToast = (e: Event) => {
            const customEvent = e as CustomEvent<ToastProps>
            setToasts((prev) => [...prev, customEvent.detail])
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== customEvent.detail.id))
            }, 5000)
        }

        window.addEventListener(TOAST_EVENT, handleToast)
        return () => window.removeEventListener(TOAST_EVENT, handleToast)
    }, [])

    return { toast, toasts }
}
