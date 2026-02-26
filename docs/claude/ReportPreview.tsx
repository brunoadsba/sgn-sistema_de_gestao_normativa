/**
 * ReportPreview.tsx
 * Preview client-side do PDF usando PDFViewer.
 * Renderiza em tempo real no browser — mesma fidelidade do PDF gerado.
 *
 * 'use client' — Next.js App Router
 */

'use client';

import React, { useState } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { ReportDocument } from './ReportDocument';
import type { ReportData } from '../../types/report';

interface ReportPreviewProps {
  data: ReportData;
  onClose?: () => void;
}

export const ReportPreview = ({ data, onClose }: ReportPreviewProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Exporta via server-side (qualidade máxima + metadados auditáveis).
   * Fallback: PDFDownloadLink (client-side) se o endpoint falhar.
   */
  const handleServerExport = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const { error: msg } = await res.json();
        throw new Error(msg || 'Falha na geração do PDF.');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SGN_${data.meta.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={styles.overlay}>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarInfo}>
          <span style={styles.toolbarTitle}>Preview do Relatório</span>
          <span style={styles.toolbarMeta}>{data.meta.id} · {data.meta.createdAt}</span>
        </div>

        <div style={styles.toolbarActions}>
          {/* Client-side download (fallback instantâneo) */}
          <PDFDownloadLink
            document={<ReportDocument data={data} />}
            fileName={`SGN_${data.meta.id}.pdf`}
            style={styles.btnSecondary}
          >
            {({ loading }) => loading ? 'Preparando...' : '↓ Download rápido'}
          </PDFDownloadLink>

          {/* Server-side export (recomendado) */}
          <button
            onClick={handleServerExport}
            disabled={isGenerating}
            style={isGenerating ? { ...styles.btnPrimary, opacity: 0.6 } : styles.btnPrimary}
          >
            {isGenerating ? 'Gerando...' : '↑ Exportar PDF'}
          </button>

          {onClose && (
            <button onClick={onClose} style={styles.btnClose}>✕</button>
          )}
        </div>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          ⚠ {error} - Use o Download rapido como alternativa.
        </div>
      )}

      {/* PDF Preview */}
      <PDFViewer style={styles.viewer} showToolbar={false}>
        <ReportDocument data={data} />
      </PDFViewer>
    </div>
  );
};

// Estilos inline mínimos (adapte ao seu design system)
const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: '#111827',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 9999,
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    backgroundColor: '#1F2937',
    borderBottom: '1px solid #374151',
    flexShrink: 0,
  },
  toolbarInfo: { display: 'flex', flexDirection: 'column', gap: 2 },
  toolbarTitle: { fontSize: 14, fontWeight: 600, color: '#F9FAFB' },
  toolbarMeta: { fontSize: 11, color: '#9CA3AF' },
  toolbarActions: { display: 'flex', gap: 8, alignItems: 'center' },
  btnPrimary: {
    backgroundColor: '#0F4C81',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '8px 16px',
    fontSize: 13,
    cursor: 'pointer',
    fontWeight: 600,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    color: '#93C5FD',
    border: '1px solid #374151',
    borderRadius: 6,
    padding: '7px 14px',
    fontSize: 13,
    cursor: 'pointer',
    textDecoration: 'none',
  },
  btnClose: {
    backgroundColor: 'transparent',
    color: '#6B7280',
    border: '1px solid #374151',
    borderRadius: 6,
    padding: '7px 12px',
    fontSize: 13,
    cursor: 'pointer',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    padding: '8px 20px',
    fontSize: 13,
    borderBottom: '1px solid #FECACA',
    flexShrink: 0,
  },
  viewer: {
    flex: 1,
    width: '100%',
    border: 'none',
  },
};
