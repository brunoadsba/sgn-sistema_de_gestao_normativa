/**
 * reportService.ts
 * Serviço de geração de PDF server-side.
 * Usa @react-pdf/renderer no Node.js — mesmo template do frontend.
 *
 * Instalação:
 *   npm install @react-pdf/renderer react react-dom
 */

import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { ReportDocument } from '../components/report/ReportDocument';
import type { ReportData } from '../types/report';

export interface GeneratePdfResult {
  buffer: Buffer;
  filename: string;
  contentType: 'application/pdf';
}

/**
 * Gera o PDF a partir dos dados do relatório.
 * Retorna um Buffer pronto para ser enviado como resposta HTTP.
 */
export async function generateReportPdf(data: ReportData): Promise<GeneratePdfResult> {
  const element = React.createElement(ReportDocument, { data });
  const buffer = await renderToBuffer(element);

  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const filename = `SGN_Relatorio_${data.meta.id}_${date}.pdf`;

  return {
    buffer: Buffer.from(buffer),
    filename,
    contentType: 'application/pdf',
  };
}
