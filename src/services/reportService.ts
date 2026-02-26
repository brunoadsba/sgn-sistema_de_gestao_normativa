import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'
import ReportDocument from '@/components/report/ReportDocument'
import type { ReportData } from '@/types/report'

export interface GeneratePdfResult {
  buffer: Buffer
  filename: string
  contentType: 'application/pdf'
}

export async function generateReportPdf(data: ReportData): Promise<GeneratePdfResult> {
  const element = React.createElement(ReportDocument, { data }) as unknown as React.ReactElement<DocumentProps>
  const rendered = await renderToBuffer(element)
  const buffer = Buffer.isBuffer(rendered) ? rendered : Buffer.from(rendered)

  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const filename = `SGN_Relatorio_${data.meta.id}_${date}.pdf`

  return {
    buffer,
    filename,
    contentType: 'application/pdf',
  }
}
