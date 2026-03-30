'use client'

/**
 * Exports the analytics page as PDF using window.print() with a dedicated
 * print stylesheet — avoids html2canvas color parsing issues with Tailwind v4.
 */
export async function exportAnalyticsPageAsPDF() {
  // Inject a print-specific stylesheet that overrides Tailwind's lab() colors
  const styleId = '__analytics-print-style__'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      @media print {
        /* Hide everything except analytics content */
        body > * { display: none !important; }
        body > div.flex { display: flex !important; }

        /* Hide sidebar, header, filter bar, export button */
        nav, aside, [data-sidebar], .sticky { display: none !important; }
        button[class*="border-gray-300"] { display: none !important; }

        /* Show only the analytics content */
        [data-tour="analytics-main"] {
          display: block !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Page setup */
        @page {
          size: A4 portrait;
          margin: 15mm 12mm;
        }

        /* Print header */
        body::before {
          content: "CHILL NUMBERS — Análisis Financiero";
          display: block;
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: #1a9e96 !important;
          border-bottom: 3px solid #1a9e96;
          padding-bottom: 8px;
          margin-bottom: 16px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* Ensure colors print */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* Cards */
        .bg-white { background: #fff !important; }
        .bg-gray-50 { background: #f9fafb !important; }
        .bg-green-50 { background: #f0fdf4 !important; }
        .bg-red-50 { background: #fef2f2 !important; }
        .bg-blue-50 { background: #eff6ff !important; }
        .bg-yellow-50 { background: #fefce8 !important; }
        .bg-purple-50 { background: #faf5ff !important; }
        .bg-amber-50 { background: #fffbeb !important; }
        .bg-green-100 { background: #dcfce7 !important; }
        .bg-red-100 { background: #fee2e2 !important; }
        .bg-blue-100 { background: #dbeafe !important; }
        .bg-yellow-100 { background: #fef9c3 !important; }
        .bg-purple-100 { background: #f3e8ff !important; }

        /* Text colors */
        .text-green-600, .text-green-700 { color: #16a34a !important; }
        .text-red-600, .text-red-700 { color: #dc2626 !important; }
        .text-blue-600, .text-blue-700 { color: #2563eb !important; }
        .text-orange-600, .text-orange-700 { color: #ea580c !important; }
        .text-purple-600, .text-purple-700 { color: #9333ea !important; }
        .text-yellow-600, .text-yellow-700 { color: #ca8a04 !important; }
        .text-teal-500, .text-teal-600 { color: #0d9488 !important; }
        .text-gray-900 { color: #111827 !important; }
        .text-gray-700 { color: #374151 !important; }
        .text-gray-500 { color: #6b7280 !important; }

        /* Borders */
        .border-gray-200 { border-color: #e5e7eb !important; }
        .border-amber-200 { border-color: #fde68a !important; }

        /* Prevent page breaks inside cards */
        .bg-white.rounded-lg,
        .bg-white.rounded-xl {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        /* Charts — recharts SVG */
        svg { overflow: visible !important; }

        /* Remove animations */
        * { animation: none !important; transition: none !important; }

        /* Sidebar margin reset */
        .ml-64, .ml-16 { margin-left: 0 !important; }

        /* Hide onboarding tour */
        [class*="z-9999"], [class*="z-50"] { display: none !important; }
      }
    `
    document.head.appendChild(style)
  }

  // Small delay to ensure styles are applied
  await new Promise(r => setTimeout(r, 100))
  window.print()
}
