import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

export default function DataTable({
  columns,
  data = [],
  isLoading = false,
  isError = false,
  errorMessage = 'Something went wrong',
  emptyText = 'No data found',
  onRowClick,
  minWidth = 640, // jis module me zyada columns hon wahan badhao (jaise 1000)
  getRowId, // optional: (row) => row._id  (agar id field ka naam alag ho)
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: { size: undefined }, // bina size wale columns auto rahenge
    ...(getRowId ? { getRowId } : {}),
  })


  const colCount = columns.length
  const showRows = !isLoading && !isError && data.length > 0

  return (
    <>
      {/* ===== Desktop (lg and up): table ===== */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full table-fixed text-left text-sm" style={{ minWidth }}>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr
                key={hg.id}
                className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400"
              >
                {hg.headers.map((h) => {
                  const size = h.column.columnDef.size
                  const align = h.column.columnDef.meta?.align
                  return (
                    <th
                      key={h.id}
                      style={size ? { width: size } : undefined}
                      className={`px-4 py-3 font-semibold first:pl-6 last:pr-6 ${
                        align === 'right' ? 'text-right' : ''
                      }`}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={colCount} className="px-6 py-10 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            )}

            {isError && (
              <tr>
                <td colSpan={colCount} className="px-6 py-10 text-center text-red-500">
                  {errorMessage}
                </td>
              </tr>
            )}

            {!isLoading && !isError && data.length === 0 && (
              <tr>
                <td colSpan={colCount} className="px-6 py-10 text-center text-slate-500">
                  {emptyText}
                </td>
              </tr>
            )}

            {showRows &&
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={`border-b border-slate-50 last:border-0 hover:bg-slate-50/80 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta
                    return (
                      <td
                        key={cell.id}
                        onClick={meta?.stopRowClick ? (e) => e.stopPropagation() : undefined}
                        className={`px-4 py-3.5 first:pl-6 last:pr-6 ${
                          meta?.align === 'right' ? 'text-right' : ''
                        } ${meta?.noTruncate ? '' : 'truncate'}`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    )
                  })}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ===== Mobile / Tablet (below lg): cards ===== */}
      <div className="lg:hidden">
        {isLoading && <p className="px-4 py-10 text-center text-slate-500">Loading...</p>}
        {isError && <p className="px-4 py-10 text-center text-red-500">{errorMessage}</p>}
        {!isLoading && !isError && data.length === 0 && (
          <p className="px-4 py-10 text-center text-slate-500">{emptyText}</p>
        )}

        {showRows && (
          <div className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={`space-y-3 px-4 py-4 ${
                  onRowClick ? 'cursor-pointer active:bg-slate-50' : ''
                }`}
              >
                {row.getVisibleCells().map((cell) => {
                  const col = cell.column.columnDef
                  const meta = col.meta

                  // is column ko mobile par chhupana hai
                  if (meta?.hideOnMobile) return null

                  const label =
                    meta?.mobileLabel ?? (typeof col.header === 'string' ? col.header : '')
                  const isActions = meta?.isActions === true

                  return (
                    <div
                      key={cell.id}
                      onClick={meta?.stopRowClick ? (e) => e.stopPropagation() : undefined}
                      className={`flex gap-3 text-sm ${
                        isActions
                          ? 'items-center justify-end border-t border-slate-100 pt-3'
                          : 'items-center justify-between'
                      }`}
                    >
                      {!isActions && (
                        <span className="shrink-0 text-xs font-semibold uppercase text-slate-400">
                          {label}
                        </span>
                      )}
                      <span className="min-w-0 break-words text-right">
                        {flexRender(col.cell, cell.getContext())}
                      </span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}