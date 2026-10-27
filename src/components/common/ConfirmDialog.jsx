import Modal from './Modal'

export default function ConfirmDialog({ open, title, message, isPending, onConfirm, onClose }) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isPending}
          className="rounded-lg bg-red-500 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
        >
          {isPending ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Modal>
  )
}