/**
 * extractText — client-side document text extraction
 *
 * Extracts readable plain text from PDF, DOCX/DOC, and TXT files so that the
 * n8n webhook receives a `document_text` string rather than a raw base64 blob.
 *
 * Supported formats:
 *   .pdf          → PDF.js (pdfjs-dist) — works on digital PDFs with a text layer
 *   .docx / .doc  → mammoth — converts Word documents to plain text
 *   everything else → File.text() (works perfectly for .txt)
 *
 * Returns '' on any error or when a PDF has no extractable text layer (scanned).
 * Never throws.
 */

// ---------------------------------------------------------------------------
// Internal helpers — use dynamic imports so:
//  a) PDF.js worker setup only runs in the browser (not in Vitest/jsdom)
//  b) vi.mock() can intercept both static and dynamic imports in tests
// ---------------------------------------------------------------------------

async function extractFromPdf(file) {
  const pdfjs = await import('pdfjs-dist')

  // Set the worker URL only in real browser environments — the import.meta.url
  // trick avoids the Vite ?url query which breaks in jsdom test environments.
  if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).href
  }

  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
  const pdf = await loadingTask.promise

  const pageTexts = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    // PDF.js items already include their own trailing whitespace
    const pageText = content.items.map(item => item.str).join('')
    pageTexts.push(pageText)
  }

  const fullText = pageTexts.join('\n\n').trim()
  // A scanned PDF has no text layer — fewer than 50 chars means nothing useful
  // was extracted. Return '' so the caller can warn the user.
  return fullText.length >= 50 ? fullText : ''
}

async function extractFromDocx(file) {
  const mammoth = (await import('mammoth')).default
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value ?? ''
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * @param {File} file
 * @returns {Promise<string>} Extracted plain text, or '' on failure.
 */
export async function extractText(file) {
  const name = (file.name ?? '').toLowerCase()

  try {
    if (name.endsWith('.pdf')) {
      return await extractFromPdf(file)
    }

    if (name.endsWith('.docx') || name.endsWith('.doc')) {
      return await extractFromDocx(file)
    }

    // TXT and any other type — read directly as UTF-8 text
    return await file.text()
  } catch {
    return ''
  }
}
