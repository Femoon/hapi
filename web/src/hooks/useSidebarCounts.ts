import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'hapi.sidebar.showCounts'

function isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined'
}

function safeGetItem(key: string): string | null {
    if (!isBrowser()) {
        return null
    }
    try {
        return localStorage.getItem(key)
    } catch {
        return null
    }
}

function safeSetItem(key: string, value: string): void {
    if (!isBrowser()) {
        return
    }
    try {
        localStorage.setItem(key, value)
    } catch {
        // Ignore storage errors
    }
}

function safeRemoveItem(key: string): void {
    if (!isBrowser()) {
        return
    }
    try {
        localStorage.removeItem(key)
    } catch {
        // Ignore storage errors
    }
}

function parseShowCounts(raw: string | null): boolean {
    return raw === 'true'
}

function getInitialShowCounts(): boolean {
    return parseShowCounts(safeGetItem(STORAGE_KEY))
}

export function useSidebarCounts(): { showCounts: boolean; setShowCounts: (value: boolean) => void } {
    const [showCounts, setShowCountsState] = useState<boolean>(getInitialShowCounts)

    useEffect(() => {
        if (!isBrowser()) {
            return
        }

        const onStorage = (event: StorageEvent) => {
            if (event.key !== STORAGE_KEY) {
                return
            }
            setShowCountsState(parseShowCounts(event.newValue))
        }

        window.addEventListener('storage', onStorage)
        return () => window.removeEventListener('storage', onStorage)
    }, [])

    const setShowCounts = useCallback((value: boolean) => {
        setShowCountsState(value)
        if (value) {
            safeSetItem(STORAGE_KEY, 'true')
        } else {
            safeRemoveItem(STORAGE_KEY)
        }
    }, [])

    return { showCounts, setShowCounts }
}
