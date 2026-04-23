import { useEffect, useRef } from 'react'
import { useTranslation } from '@/lib/use-translation'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { useContextMenuPosition, type ContextMenuAnchor } from '@/hooks/useContextMenuPosition'
import { CopyIcon, PlusCircleIcon } from '@/components/icons'

type ProjectContextMenuProps = {
    isOpen: boolean
    anchor: ContextMenuAnchor | null
    directory: string
    onClose: () => void
    onCreateSession: (directory: string) => void
}

export function ProjectContextMenu({ isOpen, anchor, directory, onClose, onCreateSession }: ProjectContextMenuProps) {
    const { t } = useTranslation()
    const menuRef = useRef<HTMLDivElement | null>(null)
    const placement = useContextMenuPosition(isOpen, anchor, menuRef)
    const { copy } = useCopyToClipboard()

    useEffect(() => {
        if (!isOpen) return

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node
            if (menuRef.current?.contains(target)) return
            onClose()
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose()
        }

        document.addEventListener('pointerdown', handlePointerDown)
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const style: React.CSSProperties = placement
        ? { top: placement.top, left: placement.left, transformOrigin: placement.transformOrigin }
        : { visibility: 'hidden' }

    const handleCopy = () => {
        void copy(directory)
        onClose()
    }

    const handleCreate = () => {
        onClose()
        onCreateSession(directory)
    }

    const itemClassName = 'flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-[var(--app-fg)] transition-colors hover:bg-[var(--app-subtle-bg)] focus-visible:outline-none focus-visible:bg-[var(--app-subtle-bg)]'

    return (
        <div
            ref={menuRef}
            role="menu"
            aria-label={directory}
            className="fixed z-50 min-w-[180px] rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] py-1 shadow-lg animate-menu-pop"
            style={style}
        >
            <button
                type="button"
                role="menuitem"
                onClick={handleCopy}
                className={itemClassName}
            >
                <CopyIcon className="h-4 w-4 text-[var(--app-hint)] shrink-0" />
                {t('sessionList.projectMenu.copyPath')}
            </button>
            <button
                type="button"
                role="menuitem"
                onClick={handleCreate}
                className={itemClassName}
            >
                <PlusCircleIcon className="h-4 w-4 text-[var(--app-hint)] shrink-0" />
                {t('sessionList.projectMenu.createSession')}
            </button>
        </div>
    )
}
