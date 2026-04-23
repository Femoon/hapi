import { describe, it, expect } from 'vitest'
import { computeContextMenuPlacement, type ContextMenuAnchor } from './useContextMenuPosition'

const viewport = { width: 1000, height: 800 }
const menu = { width: 200, height: 150 }

function mouseAnchor(x: number, y: number): ContextMenuAnchor {
    return { clientX: x, clientY: y, trigger: 'mouse' }
}

function fakeRect(top: number, left: number, width: number, height: number): DOMRect {
    return {
        top,
        left,
        right: left + width,
        bottom: top + height,
        width,
        height,
        x: left,
        y: top,
        toJSON: () => ({}),
    } as DOMRect
}

describe('computeContextMenuPlacement (mouse)', () => {
    it('anchors top-left to cursor + 2px when there is room right and below', () => {
        const p = computeContextMenuPlacement(mouseAnchor(100, 100), menu, viewport)
        expect(p.left).toBe(102)
        expect(p.top).toBe(102)
        expect(p.transformOrigin).toBe('top left')
    })

    it('flips to the left when cursor is too close to the right edge', () => {
        const p = computeContextMenuPlacement(mouseAnchor(950, 100), menu, viewport)
        // 950 + 2 + 200 + 8 = 1160 > 1000 → flip: left = 950 - 2 - 200 = 748
        expect(p.left).toBe(748)
        expect(p.top).toBe(102)
        expect(p.transformOrigin).toBe('top right')
    })

    it('flips upward when cursor is too close to the bottom edge', () => {
        const p = computeContextMenuPlacement(mouseAnchor(100, 750), menu, viewport)
        // 750 + 2 + 150 + 8 = 910 > 800 → flip: top = 750 - 2 - 150 = 598
        expect(p.left).toBe(102)
        expect(p.top).toBe(598)
        expect(p.transformOrigin).toBe('bottom left')
    })

    it('flips both axes when cursor is near the bottom-right corner', () => {
        const p = computeContextMenuPlacement(mouseAnchor(950, 750), menu, viewport)
        expect(p.left).toBe(748)
        expect(p.top).toBe(598)
        expect(p.transformOrigin).toBe('bottom right')
    })

    it('clamps to viewport padding when the flipped edge would still overflow', () => {
        // Near (1, 1) with menu bigger than cursor-to-origin: flipped left = 1 - 2 - 200 = -201
        // clamp to VIEWPORT_PADDING (8)
        const p = computeContextMenuPlacement(mouseAnchor(1, 1), { width: 200, height: 150 }, { width: 150, height: 100 })
        expect(p.left).toBe(8)
        expect(p.top).toBe(8)
    })
})

describe('computeContextMenuPlacement (touch)', () => {
    it('opens below the anchor rect, centered on its horizontal midpoint', () => {
        const anchor: ContextMenuAnchor = {
            clientX: 0,
            clientY: 0,
            trigger: 'touch',
            anchorRect: fakeRect(200, 300, 160, 40),
        }
        const p = computeContextMenuPlacement(anchor, menu, viewport)
        // bottom = 240, top = 240 + 4 = 244
        // center = 380, left = 380 - 100 = 280
        expect(p.top).toBe(244)
        expect(p.left).toBe(280)
        expect(p.transformOrigin).toBe('top center')
    })

    it('opens above when there is no room below', () => {
        const anchor: ContextMenuAnchor = {
            clientX: 0,
            clientY: 0,
            trigger: 'touch',
            anchorRect: fakeRect(700, 300, 160, 40),
        }
        const p = computeContextMenuPlacement(anchor, menu, viewport)
        // bottom = 740, below would need 740+4+150+8 = 902 > 800 → flip
        // top edge = 700 - 4 - 150 = 546
        expect(p.top).toBe(546)
        expect(p.transformOrigin).toBe('bottom center')
    })

    it('clamps to horizontal viewport padding when the anchor is near the left edge', () => {
        const anchor: ContextMenuAnchor = {
            clientX: 0,
            clientY: 0,
            trigger: 'touch',
            anchorRect: fakeRect(200, 0, 60, 40),
        }
        const p = computeContextMenuPlacement(anchor, menu, viewport)
        // center = 30, raw left = -70 → clamp to 8
        expect(p.left).toBe(8)
    })

    it('falls back to clientX/clientY when no anchorRect is provided', () => {
        const anchor: ContextMenuAnchor = {
            clientX: 400,
            clientY: 200,
            trigger: 'touch',
        }
        const p = computeContextMenuPlacement(anchor, menu, viewport)
        // anchorLeft = anchorRight = 400, centerX = 400, left = 300
        // anchorBottom = 200, top = 204
        expect(p.left).toBe(300)
        expect(p.top).toBe(204)
    })
})
