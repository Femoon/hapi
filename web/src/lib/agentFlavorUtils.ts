// Re-export from shared package for backwards compatibility
export { isKnownFlavor, supportsModelChange, supportsEffort } from '@hapi/protocol'

// Flavor-family helper not yet in shared — keep here until next migration
export function isCodexFamilyFlavor(flavor?: string | null): boolean {
    return flavor === 'codex' || flavor === 'gemini' || flavor === 'opencode'
}

const FLAVOR_DISPLAY: Record<string, string> = {
    claude: 'Claude',
    codex: 'Codex',
    cursor: 'Cursor',
    gemini: 'Gemini',
    opencode: 'OpenCode',
}

export function getFlavorDisplayLabel(flavor?: string | null): string | null {
    const key = flavor?.trim().toLowerCase()
    if (!key) return null
    return FLAVOR_DISPLAY[key] ?? (key.charAt(0).toUpperCase() + key.slice(1))
}
