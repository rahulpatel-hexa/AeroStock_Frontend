export const cn = (...classes) => classes.filter(Boolean).join(' ')


export const inputClass = (hasError) =>
  `w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
    hasError
      ? 'border-red-400 focus:ring-red-200'
      : 'border-slate-200 focus:border-[#6c5ce7] focus:ring-[#6c5ce7]/20'
  }`