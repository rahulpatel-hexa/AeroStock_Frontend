export default function FormField({ label, required, error, children, className = '' }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold text-slate-500">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  )
}