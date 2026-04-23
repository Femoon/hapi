import { useCallback, useEffect, useLayoutEffect, useState, type RefObject } from 'react'

export type ContextMenuTrigger = 'mouse' | 'touch'

export type ContextMenuAnchor = {
    clientX: number
    clientY: number
    trigger: ContextMenuTrigger
    /**
     * For touch triggers: the rect of the element that was long-pressed. The
     * menu opens below this rect (or above when bottom overflows) and is
     * horizontally centered on the rect's center. When omitted, falls back to
     * the raw clientX/clientY.
     */
    anchorRect?: DOMRect | null
}

export type ContextMenuPlacement = {
    top: number
    left: number
    transformOrigin: string
}

type Size = { width: number; height: number }

const VIEWPORT_PADDING = 8
const MOUSE_OFFSET = 2
const TOUCH_GAP = 4

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}

export function computeContextMenuPlacement(
    anchor: ContextMenuAnchor,
    menu: Size,
    viewport: Size
): ContextMenuPlacement {
    if (anchor.trigger === 'mouse') {
        const openToRight = anchor.clientX + MOUSE_OFFSET + menu.width + VIEWPORT_PADDING <= viewport.width
        const openBelow = anchor.clientY + MOUSE_OFFSET + menu.height + VIEWPORT_PADDING <= viewport.height

        const left = openToRight
            ? anchor.clientX + MOUSE_OFFSET
            : Math.max(VIEWPORT_PADDING, anchor.clientX - MOUSE_OFFSET - menu.width)

        const top = openBelow
            ? anchor.clientY + MOUSE_OFFSET
            : Math.max(VIEWPORT_PADDING, anchor.clientY - MOUSE_OFFSET - menu.height)

        const vertical = openBelow ? 'top' : 'bottom'
        const horizontal = openToRight ? 'left' : 'right'
        return { top, left, transformOrigin: `${vertical} ${horizontal}` }
    }

    // touch
    const rect = anchor.anchorRect
    const anchorLeft = rect?.left ?? anchor.clientX
    const anchorRight = rect?.right ?? anchor.clientX
    const anchorTop = rect?.top ?? anchor.clientY
    const anchorBottom = rect?.bottom ?? anchor.clientY
    const anchorCenterX = (anchorLeft + anchorRight) / 2

    const openBelow = anchorBottom + TOUCH_GAP + menu.height + VIEWPORT_PADDING <= viewport.height
    const top = openBelow
        ? anchorBottom + TOUCH_GAP
        : Math.max(VIEWPORT_PADDING, anchorTop - TOUCH_GAP - menu.height)

    const rawLeft = anchorCenterX - menu.width / 2
    const left = clamp(rawLeft, VIEWPORT_PADDING, Math.max(VIEWPORT_PADDING, viewport.width - menu.width - VIEWPORT_PADDING))
    const vertical = openBelow ? 'top' : 'bottom'
    return { top, left, transformOrigin: `${vertical} center` }
}

/**
 * Measures the menu element and returns a viewport-aware placement for
 * right-click (mouse) or long-press (touch) triggered menus.
 *
 * Returns null until the menu is mounted and measured, so callers can render
 * the menu offscreen (e.g., visibility: hidden) on the first paint and apply
 * the position on the next.
 */
export function useContextMenuPosition(
    isOpen: boolean,
    anchor: ContextMenuAnchor | null,
    menuRef: RefObject<HTMLElement | null>
): ContextMenuPlacement | null {
    const [placement, setPlacement] = useState<ContextMenuPlacement | null>(null)

    const update = useCallback(() => {
        const el = menuRef.current
        if (!anchor || !el) {
            return
        }
        const rect = el.getBoundingClientRect()
        const next = computeContextMenuPlacement(
            anchor,
            { width: rect.width, height: rect.height },
            { width: window.innerWidth, height: window.innerHeight }
        )
        setPlacement(next)
    }, [anchor, menuRef])

    useLayoutEffect(() => {
        if (!isOpen) {
            setPlacement(null)
            return
        }
        update()
    }, [isOpen, update])

    useEffect(() => {
        if (!isOpen) return
        const onReflow = () => update()
        window.addEventListener('resize', onReflow)
        window.addEventListener('scroll', onReflow, true)
        return () => {
            window.removeEventListener('resize', onReflow)
            window.removeEventListener('scroll', onReflow, true)
        }
    }, [isOpen, update])

    return placement
}
