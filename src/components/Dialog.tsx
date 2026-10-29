import { useEffect, useRef, type ReactNode } from 'react'

/** 原生 <dialog>：自帶遮罩、Esc 關閉、焦點鎖定 */
export default function Dialog({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog?.open) dialog?.showModal()
    if (!open && dialog?.open) dialog.close()
  }, [open])

  return (
    <dialog ref={ref} onClose={onClose}>
      {children}
    </dialog>
  )
}
