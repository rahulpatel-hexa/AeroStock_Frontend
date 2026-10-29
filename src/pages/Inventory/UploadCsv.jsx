import { useCallback, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Download, FileSpreadsheet, Upload, ArrowLeft } from 'lucide-react'
import Papa from 'papaparse'
import { useImportInventoryItems } from '../../hooks/useInventory'

const MAX_FILE_SIZE = 5 * 1024 * 1024

const REQUIRED_COLUMNS = [
  'trackingType',
  'name',
  'category',
  'partNumber',
  'conditionValue',
  'quantity',
  'currency',
]

const OPTIONAL_COLUMNS = [
  'subcategory',
  'manufacturer',
  'serialNumber',
  'location',
  'purchasePrice',
  'askingPrice',
  'purchaseDate',
  'notes',
]

const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS]

const SAMPLE_ROW = {
  trackingType: 'bulk',
  name: 'Hydraulic Pump Assembly',
  category: 'Hydraulics',
  partNumber: 'HP-4500-A',
  conditionValue: 'Serviceable',
  quantity: '5',
  currency: 'USD',
  subcategory: 'Pumps',
  manufacturer: 'Honeywell',
  serialNumber: '',
  location: 'Bay A-12',
  purchasePrice: '320.00',
  askingPrice: '450.00',
  purchaseDate: '2024-06-15',
  notes: 'Inspected and ready for install',
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
const MAX_ERRORS_SHOWN = 20

const isBlank = (v) => String(v ?? '').trim() === ''

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value
}

const isCsvFile = (file) => {
  const name = file.name?.toLowerCase() ?? ''
  return name.endsWith('.csv') || file.type === 'text/csv' || file.type === 'application/vnd.ms-excel'
}

const validateRows = (rows) => {
  const errors = []

  if (rows.length === 0) {
    errors.push('CSV has no data rows.')
    return errors
  }

  rows.forEach((row, index) => {
    const label = `Row ${index + 2}` // +1 header, +1 for 1-based
    const add = (msg) => errors.push(`${label}: ${msg}`)

    // 1. Tracking type (only bulk allowed for now)
    const trackingType = String(row.trackingType ?? '').trim().toLowerCase()
    if (trackingType === 'serialized') {
      add('Serialized items are not supported yet. Use "bulk".')
    } else if (trackingType !== 'bulk') {
      add('trackingType must be "bulk".')
    }

    // 2. Required text fields
    const requiredText = ['name', 'category', 'partNumber', 'conditionValue']
    requiredText.forEach((field) => {
      if (isBlank(row[field])) add(`${field} is required.`)
    })

    // 3. Quantity: whole number >= 1
    const qtyText = String(row.quantity ?? '').trim()
    const qty = Number(qtyText)
    if (qtyText === '') {
      add('quantity is required.')
    } else if (!Number.isInteger(qty) || qty < 1) {
      add('quantity must be a whole number of 1 or more.')
    }

    // 4. Currency
    const currency = String(row.currency ?? '').trim().toUpperCase()
    if (currency === '') {
      add('currency is required.')
    } else if (!CURRENCIES.includes(currency)) {
      add(`currency "${row.currency}" is not supported.`)
    }

    // 5. Optional prices: number >= 0
    ;['purchasePrice', 'askingPrice'].forEach((field) => {
      const text = String(row[field] ?? '').trim()
      if (text === '') return
      const num = Number(text)
      if (Number.isNaN(num) || num < 0) add(`${field} must be a number of 0 or more.`)
    })

    // 6. Optional date: YYYY-MM-DD
    const date = String(row.purchaseDate ?? '').trim()
    if (date !== '' && !isValidDate(date)) {
      add('purchaseDate must be a valid date in YYYY-MM-DD format.')
    }
  })

  return errors
}

// const validateSerializedRows = (rows) => {
//   const errors = []

//   rows.forEach((row, index) => {
//     const rowLabel = `Row ${index + 2}` // +1 for header row, +1 for 1-based numbering
//     const trackingType = String(row.trackingType ?? '').trim().toLowerCase()

//     if (trackingType !== 'bulk' && trackingType !== 'serialized') {
//       errors.push(`${rowLabel}: Tracking type must be "bulk" or "serialized"`)
//       return
//     }

//     if (trackingType !== 'serialized') return

//     const serialNumber = String(row.serialNumber ?? '').trim()
//     const quantity = Number(String(row.quantity ?? '').trim())

//     if (!serialNumber) {
//       errors.push(`${rowLabel}: Serial number is required for serialized items`)
//     }
//     if (!Number.isInteger(quantity) || quantity !== 1) {
//       errors.push(`${rowLabel}: Serialized item quantity must be 1`)
//     }
//   })

//   return errors
// }

const downloadTemplate = () => {
  const header = ALL_COLUMNS.join(',')
  const row = ALL_COLUMNS.map((col) => {
    const value = SAMPLE_ROW[col] ?? ''
    return value.includes(',') || value.includes('"') ? `"${value.replace(/"/g, '""')}"` : value
  }).join(',')
  const blob = new Blob([`${header}\n${row}\n`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'inventory-template.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export default function UploadCsv() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const importMutation = useImportInventoryItems()
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')
  const [rowErrors, setRowErrors] = useState([])
  const [success, setSuccess] = useState('')
  const [parsedRows, setParsedRows] = useState(null)

  const handleFile = useCallback((file) => {
    setError('')
    setRowErrors([])
    setSuccess('')
    setParsedRows(null)
    setSelectedFile(null)
    setFileName('')

    if (!file) return

    if (!isCsvFile(file)) {
      setError('Only .csv files are allowed.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File must be 5 MB or smaller.')
      return
    }

    setFileName(file.name)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.replace(/^\uFEFF/, '').trim(),
      complete: (results) => {
        if (results.errors?.length) {
          setError(results.errors[0]?.message || 'Failed to parse CSV.')
          return
        }

        const fields = (results.meta?.fields ?? []).map((f) => f.replace(/^\uFEFF/, '').trim())
        const missing = REQUIRED_COLUMNS.filter((col) => !fields.includes(col))

        if (missing.length > 0) {
          setError(`Missing required column(s): ${missing.join(', ')}`)
          return
        }

        const rows = results.data ?? []
        const validationErrors = validateRows(rows)
        if (validationErrors.length > 0) {
          setRowErrors(validationErrors)
          setError(
            `${validationErrors.length} validation error${validationErrors.length === 1 ? '' : 's'} found. Fix the CSV and upload again.`
          )
          return
        }

        setSelectedFile(file)
        setParsedRows(rows)
        setSuccess(`Parsed ${rows.length} row${rows.length === 1 ? '' : 's'} successfully. Ready to import.`)
      },
      error: (err) => {
        setError(err?.message || 'Failed to parse CSV.')
      },
    })
  }, [])

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    handleFile(file)
  }

  const onImport = async () => {
    if (!selectedFile || importMutation.isPending) return
    try {
      await importMutation.mutateAsync(selectedFile)
      navigate('/inventory')
    } catch {
      // Error toast handled by useImportInventoryItems
    }
  }

  return (
    <div>
      <Link
        to="/inventory"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[#6c5ce7]"
      >
        <ArrowLeft size={16} /> Back to Inventory
      </Link>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Upload CSV</h1>
          <p className="mt-1 text-sm text-slate-500">
            Import inventory items from a CSV file.
          </p>
        </div>
        {/* <button
          type="button"
          onClick={() => navigate('/inventory')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <ChevronLeft className="size-4 text-slate-400" />
          Back to Inventory
        </button> */}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">CSV File</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              .csv only, max 5 MB. Required headers must match the template.
            </p>
          </div>
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6c5ce7] hover:text-[#5b4bd6]"
          >
            <Download className="size-4" />
            Download template
          </button>
        </div>

        <div
          onDragEnter={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            setDragging(false)
          }}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 transition-colors ${dragging
            ? 'border-[#6c5ce7] bg-[#6c5ce7]/5'
            : 'border-slate-200 bg-slate-50/50'
            }`}
        >
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#e9e6fb] text-[#6c5ce7]">
            <Upload className="size-5" />
          </div>
          <p className="text-sm font-medium text-slate-700">
            Drag and drop your CSV here
          </p>
          <p className="mt-1 text-xs text-slate-500">or</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-3 cursor-pointer rounded-xl bg-[#6c5ce7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5b4bd6]"
          >
            Browse file
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>

        {fileName && (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <FileSpreadsheet className="size-4 text-[#6c5ce7]" />
            <span className="font-medium">{fileName}</span>
            {parsedRows != null && (
              <span className="text-slate-400">· {parsedRows.length} rows</span>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <p className="font-medium">{error}</p>
            {rowErrors.length > 0 && (
              <ul className="mt-2 max-h-48 list-disc space-y-1 overflow-y-auto pl-5">
                {rowErrors.slice(0, MAX_ERRORS_SHOWN).map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
                {rowErrors.length > MAX_ERRORS_SHOWN && (
                  <li>...and {rowErrors.length - MAX_ERRORS_SHOWN} more</li>
                )}
              </ul>
            )}
          </div>
        )}

        {success && (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </p>
        )}

        {selectedFile && parsedRows != null && (
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={onImport}
              disabled={importMutation.isPending}
              className="rounded-xl bg-[#6c5ce7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5b4bd6] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {importMutation.isPending ? 'Importing…' : 'Import'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
