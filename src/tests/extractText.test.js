import { describe, it, expect, vi, beforeEach } from 'vitest'
import { extractText } from '../utils/extractText.js'

// ---------------------------------------------------------------------------
// Helpers — build minimal File objects for each type
// ---------------------------------------------------------------------------
function makeFile(content, name, type) {
  return new File([content], name, { type })
}

// ---------------------------------------------------------------------------
// Mock pdfjs-dist so tests don't need a real PDF binary or a Worker
// ---------------------------------------------------------------------------
vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn(),
  GlobalWorkerOptions: { workerSrc: '' },
}))

// ---------------------------------------------------------------------------
// Mock mammoth so tests don't need a real DOCX binary
// ---------------------------------------------------------------------------
vi.mock('mammoth', () => ({
  default: {
    extractRawText: vi.fn(),
  },
}))

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('extractText', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reads a TXT file as plain text', async () => {
    const file = makeFile('This is the lease agreement text.', 'lease.txt', 'text/plain')
    const result = await extractText(file)
    expect(result).toBe('This is the lease agreement text.')
  })

  it('returns plain text for unknown file types via file.text()', async () => {
    const file = makeFile('Some content', 'doc.unknown', 'application/octet-stream')
    const result = await extractText(file)
    expect(result).toBe('Some content')
  })

  it('calls mammoth for .docx files and returns extracted text', async () => {
    const mammoth = (await import('mammoth')).default
    mammoth.extractRawText.mockResolvedValue({ value: 'Extracted DOCX content.' })

    const file = makeFile('binary', 'lease.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    vi.spyOn(file, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(8))
    const result = await extractText(file)

    expect(mammoth.extractRawText).toHaveBeenCalledOnce()
    expect(result).toBe('Extracted DOCX content.')
  })

  it('calls mammoth for .doc files', async () => {
    const mammoth = (await import('mammoth')).default
    mammoth.extractRawText.mockResolvedValue({ value: 'Extracted DOC content.' })

    const file = makeFile('binary', 'lease.doc', 'application/msword')
    vi.spyOn(file, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(8))
    const result = await extractText(file)

    expect(mammoth.extractRawText).toHaveBeenCalledOnce()
    expect(result).toBe('Extracted DOC content.')
  })

  it('calls PDF.js for .pdf files and joins pages', async () => {
    const pdfjs = await import('pdfjs-dist')
    pdfjs.getDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 2,
        getPage: vi.fn().mockResolvedValue({
          getTextContent: vi.fn().mockResolvedValue({
            // Text must be >= 50 chars total across all pages to pass the
            // scanned-PDF guard in extractFromPdf
            items: [{ str: 'This lease commences January 1 2022 at 555 Market Street. ' }, { str: 'Annual rent is $348,000.' }],
          }),
        }),
      }),
    })

    const file = makeFile('%PDF-1.4', 'lease.pdf', 'application/pdf')
    // jsdom's File.arrayBuffer() may not be fully implemented — stub it so the
    // PDF.js mock chain can run without depending on jsdom Blob internals
    vi.spyOn(file, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(8))

    const result = await extractText(file)

    expect(pdfjs.getDocument).toHaveBeenCalledOnce()
    expect(result).toContain('Annual rent is $348,000.')
  })

  it('returns empty string when PDF text is shorter than 50 chars', async () => {
    const pdfjs = await import('pdfjs-dist')
    pdfjs.getDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 1,
        getPage: vi.fn().mockResolvedValue({
          getTextContent: vi.fn().mockResolvedValue({ items: [{ str: 'tiny' }] }),
        }),
      }),
    })

    const file = makeFile('%PDF-1.4', 'scan.pdf', 'application/pdf')
    vi.spyOn(file, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(8))

    const result = await extractText(file)
    expect(result).toBe('')
  })

  it('returns empty string and does not throw when mammoth errors', async () => {
    const mammoth = (await import('mammoth')).default
    mammoth.extractRawText.mockRejectedValue(new Error('corrupt file'))

    const file = makeFile('binary', 'bad.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    vi.spyOn(file, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(8))
    await expect(extractText(file)).resolves.toBe('')
  })

  it('returns empty string and does not throw when PDF.js errors', async () => {
    const pdfjs = await import('pdfjs-dist')
    pdfjs.getDocument.mockReturnValue({
      promise: Promise.reject(new Error('invalid PDF')),
    })

    const file = makeFile('not a pdf', 'bad.pdf', 'application/pdf')
    vi.spyOn(file, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(8))
    await expect(extractText(file)).resolves.toBe('')
  })
})
