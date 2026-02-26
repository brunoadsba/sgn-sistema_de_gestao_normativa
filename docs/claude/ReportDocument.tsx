/**
 * ReportDocument.tsx
 * Template único para geração de PDF — roda no browser (preview) e no Node.js (server-side).
 * Dependência: @react-pdf/renderer ^3.x
 *
 * Instalação:
 *   npm install @react-pdf/renderer
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { ReportData, Gap, ActionItem } from '../../types/report';

// ---------------------------------------------------------------------------
// Paleta e design tokens
// ---------------------------------------------------------------------------
const colors = {
  brand: '#0F4C81',
  brandLight: '#E8F0FA',
  success: '#16A34A',
  successLight: '#F0FDF4',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  critical: '#7C3AED',
  criticalLight: '#F5F3FF',
  neutral900: '#111827',
  neutral700: '#374151',
  neutral500: '#6B7280',
  neutral300: '#D1D5DB',
  neutral100: '#F3F4F6',
  white: '#FFFFFF',
  outOfScope: '#EA580C',
  outOfScopeLight: '#FFF7ED',
};

const severityColor: Record<string, string> = {
  Baixa: colors.success,
  Média: colors.warning,
  Alta: colors.danger,
  Crítica: colors.critical,
};

const severityBg: Record<string, string> = {
  Baixa: colors.successLight,
  Média: colors.warningLight,
  Alta: colors.dangerLight,
  Crítica: colors.criticalLight,
};

const riskColor: Record<string, string> = {
  Baixo: colors.success,
  Médio: colors.warning,
  Alto: colors.danger,
  Crítico: colors.critical,
};

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 44,
    backgroundColor: colors.white,
    color: colors.neutral900,
    fontSize: 9,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
    paddingBottom: 14,
    borderBottom: `2pt solid ${colors.brand}`,
  },
  headerLeft: { flexDirection: 'column', gap: 2 },
  brandLabel: { fontSize: 7, color: colors.brand, letterSpacing: 1.5, textTransform: 'uppercase' },
  reportTitle: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: colors.neutral900 },
  documentSubtitle: { fontSize: 8, color: colors.neutral500, marginTop: 2, maxWidth: 320 },
  headerRight: { alignItems: 'flex-end', gap: 2 },
  metaText: { fontSize: 7, color: colors.neutral500 },
  metaHighlight: { fontSize: 7, color: colors.brand, fontFamily: 'Helvetica-Bold' },

  // Scope warning
  scopeWarning: {
    backgroundColor: colors.outOfScopeLight,
    borderLeft: `3pt solid ${colors.outOfScope}`,
    padding: '8 10',
    borderRadius: 3,
    marginBottom: 16,
    flexDirection: 'row',
    gap: 6,
  },
  scopeWarningText: { fontSize: 8, color: colors.outOfScope, flex: 1, lineHeight: 1.5 },
  scopeWarningLabel: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: colors.outOfScope },

  // Section
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.brand,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: `0.5pt solid ${colors.neutral300}`,
  },

  // Score cards row
  scoreRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  scoreCard: {
    flex: 1,
    borderRadius: 4,
    padding: '10 12',
    backgroundColor: colors.neutral100,
    border: `0.5pt solid ${colors.neutral300}`,
  },
  scoreCardLabel: { fontSize: 7, color: colors.neutral500, letterSpacing: 0.5, marginBottom: 4 },
  scoreValue: { fontSize: 22, fontFamily: 'Helvetica-Bold' },
  scoreUnit: { fontSize: 9, color: colors.neutral500, marginTop: 2 },
  scoreOutOfScope: {
    fontSize: 6,
    color: colors.outOfScope,
    marginTop: 4,
    fontFamily: 'Helvetica-Bold',
  },

  // Scope tags
  scopeTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  scopeTag: {
    backgroundColor: colors.brandLight,
    borderRadius: 3,
    padding: '2 6',
  },
  scopeTagText: { fontSize: 7, color: colors.brand, fontFamily: 'Helvetica-Bold' },

  // Bullet lists
  bulletList: { gap: 5 },
  bulletItem: { flexDirection: 'row', gap: 6 },
  bullet: { fontSize: 9, color: colors.brand, marginTop: 0.5 },
  bulletText: { fontSize: 8.5, color: colors.neutral700, flex: 1, lineHeight: 1.5 },

  // Gap matrix
  table: { width: '100%', borderRadius: 4, overflow: 'hidden' },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.brand,
    padding: '6 8',
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: '7 8',
    borderBottom: `0.5pt solid ${colors.neutral300}`,
  },
  tableRowAlt: { backgroundColor: colors.neutral100 },
  tableCell: { fontSize: 8, color: colors.neutral700, lineHeight: 1.5 },

  colSeverity: { width: '12%' },
  colCategory: { width: '15%' },
  colDescription: { width: '38%' },
  colRecommendation: { width: '35%' },

  severityBadge: {
    borderRadius: 3,
    padding: '2 5',
    alignSelf: 'flex-start',
  },
  severityBadgeText: { fontSize: 7, fontFamily: 'Helvetica-Bold' },

  emptyState: {
    backgroundColor: colors.successLight,
    borderRadius: 4,
    padding: '16 20',
    alignItems: 'center',
    border: `0.5pt solid ${colors.neutral300}`,
  },
  emptyStateTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.success,
    marginBottom: 4,
  },
  emptyStateText: { fontSize: 8, color: colors.neutral500, textAlign: 'center' },

  // Action plan
  actionList: { gap: 8 },
  actionItem: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.neutral100,
    borderRadius: 4,
    padding: '8 10',
    border: `0.5pt solid ${colors.neutral300}`,
  },
  actionBadge: {
    borderRadius: 3,
    padding: '2 6',
    alignSelf: 'flex-start',
    minWidth: 36,
    alignItems: 'center',
  },
  actionBadgeText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: colors.white },
  actionContent: { flex: 1 },
  actionId: { fontSize: 7, color: colors.neutral500, marginBottom: 3, fontFamily: 'Helvetica-Bold' },
  actionText: { fontSize: 8.5, color: colors.neutral700, lineHeight: 1.5 },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 44,
    right: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTop: `0.5pt solid ${colors.neutral300}`,
  },
  footerLeft: { flexDirection: 'column', gap: 2 },
  footerText: { fontSize: 6.5, color: colors.neutral500 },
  footerBrand: { fontSize: 6.5, color: colors.brand, fontFamily: 'Helvetica-Bold' },
  pageNumber: { fontSize: 7, color: colors.neutral500 },
});

// ---------------------------------------------------------------------------
// Sub-componentes
// ---------------------------------------------------------------------------

const ReportHeader = ({ data }: { data: ReportData }) => (
  <View style={s.header}>
    <View style={s.headerLeft}>
      <Text style={s.brandLabel}>SGN — Sistema de Gestão Normativa</Text>
      <Text style={s.reportTitle}>Relatório de Conformidade SST</Text>
      <Text style={s.documentSubtitle} numberOfLines={2}>
        {data.summary.documentTitle}
      </Text>
    </View>
    <View style={s.headerRight}>
      <Text style={s.metaText}>Emitido em {data.meta.createdAt}</Text>
      <Text style={s.metaText}>Analista: <Text style={s.metaHighlight}>{data.meta.analyst}</Text></Text>
      <Text style={s.metaText}>ID: <Text style={s.metaHighlight}>{data.meta.id}</Text></Text>
      <Text style={s.metaText}>Versão {data.meta.version}</Text>
    </View>
  </View>
);

const ScopeWarning = ({ warning }: { warning: string }) => (
  <View style={s.scopeWarning}>
    <Text style={s.scopeWarningLabel}>⚠ ATENÇÃO:</Text>
    <Text style={s.scopeWarningText}>{warning}</Text>
  </View>
);

const ExecutiveSummarySection = ({ data }: { data: ReportData }) => {
  const { summary } = data;
  const isOutOfScope = data.meta.scope === 'out_of_scope';

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Resumo Executivo</Text>

      {/* Score cards */}
      <View style={s.scoreRow}>
        {/* Score */}
        <View style={[s.scoreCard, { backgroundColor: isOutOfScope ? colors.outOfScopeLight : colors.successLight }]}>
          <Text style={s.scoreCardLabel}>SCORE GERAL</Text>
          <Text style={[s.scoreValue, { color: isOutOfScope ? colors.outOfScope : colors.success }]}>
            {summary.score}
          </Text>
          <Text style={[s.scoreUnit, { color: isOutOfScope ? colors.outOfScope : colors.neutral500 }]}>/ 100</Text>
          {isOutOfScope && (
            <Text style={s.scoreOutOfScope}>* fora do escopo SST</Text>
          )}
        </View>

        {/* Risco */}
        <View style={[s.scoreCard, { backgroundColor: riskColor[summary.riskLevel] ? `${riskColor[summary.riskLevel]}15` : colors.neutral100 }]}>
          <Text style={s.scoreCardLabel}>NÍVEL DE RISCO</Text>
          <Text style={[s.scoreValue, { color: riskColor[summary.riskLevel] || colors.neutral700, fontSize: 18 }]}>
            {summary.riskLevel}
          </Text>
          {isOutOfScope && (
            <Text style={s.scoreOutOfScope}>* fora do escopo SST</Text>
          )}
        </View>

        {/* Gaps */}
        <View style={s.scoreCard}>
          <Text style={s.scoreCardLabel}>TOTAL DE GAPS</Text>
          <Text style={[s.scoreValue, { color: summary.totalGaps === 0 ? colors.success : colors.danger }]}>
            {summary.totalGaps}
          </Text>
          <Text style={s.scoreUnit}>identificados</Text>
        </View>

        {/* Tipo de doc */}
        <View style={[s.scoreCard, { backgroundColor: colors.brandLight }]}>
          <Text style={s.scoreCardLabel}>TIPO DE DOCUMENTO</Text>
          <Text style={[s.scoreValue, { fontSize: 10, color: colors.brand, marginTop: 4, lineHeight: 1.4 }]}>
            {summary.documentType}
          </Text>
        </View>
      </View>

      {/* Normas analisadas */}
      <View style={s.scopeTagsRow}>
        <Text style={[s.scoreCardLabel, { alignSelf: 'center', marginRight: 4 }]}>NORMAS ANALISADAS:</Text>
        {summary.analysisScope.map((norm) => (
          <View key={norm} style={s.scopeTag}>
            <Text style={s.scopeTagText}>{norm}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const StrengthsSection = ({ data }: { data: ReportData }) => (
  <View style={[s.section, { flexDirection: 'row', gap: 16 }]}>
    {/* Pontos fortes */}
    <View style={{ flex: 1 }}>
      <Text style={s.sectionTitle}>Pontos Fortes</Text>
      <View style={s.bulletList}>
        {data.summary.strengths.map((item, i) => (
          <View key={i} style={s.bulletItem}>
            <Text style={[s.bullet, { color: colors.success }]}>✓</Text>
            <Text style={s.bulletText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>

    {/* Pontos de atenção */}
    <View style={{ flex: 1 }}>
      <Text style={[s.sectionTitle, { color: colors.warning }]}>Pontos de Atenção</Text>
      <View style={s.bulletList}>
        {data.summary.attentionPoints.map((item, i) => (
          <View key={i} style={s.bulletItem}>
            <Text style={[s.bullet, { color: colors.warning }]}>!</Text>
            <Text style={s.bulletText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  </View>
);

const GapsMatrixSection = ({ gaps }: { gaps: Gap[] }) => (
  <View style={s.section}>
    <Text style={s.sectionTitle}>Matriz de Gaps</Text>

    {gaps.length === 0 ? (
      <View style={s.emptyState}>
        <Text style={s.emptyStateTitle}>✓ Nenhum gap identificado</Text>
        <Text style={s.emptyStateText}>
          Nenhuma não-conformidade foi detectada no conteúdo analisado.{'\n'}
          Isso pode indicar conformidade ou ausência de dados SST no documento.
        </Text>
      </View>
    ) : (
      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, s.colSeverity]}>Severidade</Text>
          <Text style={[s.tableHeaderCell, s.colCategory]}>Categoria</Text>
          <Text style={[s.tableHeaderCell, s.colDescription]}>Descrição</Text>
          <Text style={[s.tableHeaderCell, s.colRecommendation]}>Recomendação</Text>
        </View>
        {gaps.map((gap, i) => (
          <View key={gap.id} style={[s.tableRow, i % 2 !== 0 ? s.tableRowAlt : {}]}>
            <View style={[s.colSeverity]}>
              <View style={[s.severityBadge, { backgroundColor: severityBg[gap.severity] }]}>
                <Text style={[s.severityBadgeText, { color: severityColor[gap.severity] }]}>
                  {gap.severity}
                </Text>
              </View>
              {gap.norm && (
                <Text style={[s.tableCell, { fontSize: 7, color: colors.brand, marginTop: 3 }]}>
                  {gap.norm}
                </Text>
              )}
            </View>
            <Text style={[s.tableCell, s.colCategory]}>{gap.category}</Text>
            <Text style={[s.tableCell, s.colDescription]}>{gap.description}</Text>
            <Text style={[s.tableCell, s.colRecommendation]}>{gap.recommendation}</Text>
          </View>
        ))}
      </View>
    )}
  </View>
);

const ActionPlanSection = ({ actions }: { actions: ActionItem[] }) => {
  const priorityColor = { Alta: colors.danger, Média: colors.warning, Baixa: colors.success };

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Plano de Ação</Text>
      <View style={s.actionList}>
        {actions.map((action) => (
          <View key={action.id} style={s.actionItem}>
            <View style={[s.actionBadge, { backgroundColor: priorityColor[action.priority] }]}>
              <Text style={s.actionBadgeText}>{action.priority}</Text>
            </View>
            <View style={s.actionContent}>
              <Text style={s.actionId}>{action.id}{action.deadline ? ` · Prazo: ${action.deadline}` : ''}</Text>
              <Text style={s.actionText}>{action.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const ReportFooter = ({ data }: { data: ReportData }) => (
  <View style={s.footer} fixed>
    <View style={s.footerLeft}>
      <Text style={s.footerBrand}>SGN — Sistema de Gestão Normativa</Text>
      <Text style={s.footerText}>
        Relatório técnico emitido para suporte à auditoria interna SST.{' '}
        Fonte: análise de IA baseada no documento enviado e NRs selecionadas.
      </Text>
      <Text style={s.footerText}>
        Sessão: {data.meta.sessionId} · Versão: {data.meta.version}
      </Text>
    </View>
    <Text
      style={s.pageNumber}
      render={({ pageNumber, totalPages }) => `Página ${pageNumber} / ${totalPages}`}
      fixed
    />
  </View>
);

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export const ReportDocument = ({ data }: { data: ReportData }) => (
  <Document
    title={`SGN — Relatório de Conformidade SST — ${data.meta.id}`}
    author={data.meta.analyst}
    subject="Análise de Conformidade SST — Sistema de Gestão Normativa"
    keywords="SST, NR, conformidade, auditoria, SGN"
    creator="SGN v1"
  >
    <Page size="A4" style={s.page}>
      <ReportHeader data={data} />

      {data.meta.scope === 'out_of_scope' && data.summary.scopeWarning && (
        <ScopeWarning warning={data.summary.scopeWarning} />
      )}

      <ExecutiveSummarySection data={data} />
      <StrengthsSection data={data} />
      <GapsMatrixSection gaps={data.gaps} />
      <ActionPlanSection actions={data.actions} />

      <ReportFooter data={data} />
    </Page>
  </Document>
);
