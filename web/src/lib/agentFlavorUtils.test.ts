import { describe, it, expect } from 'vitest'
import { getFlavorDisplayLabel, isCodexFamilyFlavor } from './agentFlavorUtils'

describe('getFlavorDisplayLabel', () => {
    it('returns branded names for known flavors', () => {
        expect(getFlavorDisplayLabel('claude')).toBe('Claude')
        expect(getFlavorDisplayLabel('codex')).toBe('Codex')
        expect(getFlavorDisplayLabel('cursor')).toBe('Cursor')
        expect(getFlavorDisplayLabel('gemini')).toBe('Gemini')
        expect(getFlavorDisplayLabel('opencode')).toBe('OpenCode')
    })

    it('is case-insensitive and trims whitespace', () => {
        expect(getFlavorDisplayLabel('  Claude  ')).toBe('Claude')
        expect(getFlavorDisplayLabel('OPENCODE')).toBe('OpenCode')
    })

    it('falls back to title-case for unknown flavors', () => {
        expect(getFlavorDisplayLabel('newagent')).toBe('Newagent')
    })

    it('returns null for null, undefined, and empty input', () => {
        expect(getFlavorDisplayLabel(null)).toBeNull()
        expect(getFlavorDisplayLabel(undefined)).toBeNull()
        expect(getFlavorDisplayLabel('')).toBeNull()
        expect(getFlavorDisplayLabel('   ')).toBeNull()
    })
})

describe('isCodexFamilyFlavor', () => {
    it('matches codex, gemini, opencode', () => {
        expect(isCodexFamilyFlavor('codex')).toBe(true)
        expect(isCodexFamilyFlavor('gemini')).toBe(true)
        expect(isCodexFamilyFlavor('opencode')).toBe(true)
    })

    it('does not match claude, cursor, nullish', () => {
        expect(isCodexFamilyFlavor('claude')).toBe(false)
        expect(isCodexFamilyFlavor('cursor')).toBe(false)
        expect(isCodexFamilyFlavor(null)).toBe(false)
        expect(isCodexFamilyFlavor(undefined)).toBe(false)
    })
})
