import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'
import type { ReportData } from '@/types/report'

const colors = {
  brand: '#0F4C81',
  brandLight: '#E8F0FA',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  neutral900: '#111827',
  neutral700: '#374151',
  neutral500: '#6B7280',
  neutral300: '#D1D5DB',
  neutral100: '#F3F4F6',
  outOfScope: '#EA580C',
  outOfScopeLight: '#FFF7ED',
}

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 38,
    fontSize: 9,
    color: colors.neutral900,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.brand,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  brandLabel: {
    fontSize: 7,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: colors.brand,
  },
  title: {
    marginTop: 2,
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 8,
    color: colors.neutral500,
    maxWidth: 300,
  },
  headerMeta: {
    fontSize: 7,
    color: colors.neutral500,
    textAlign: 'right',
    marginBottom: 2,
  },
  warningBox: {
    marginTop: 2,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.outOfScope,
    backgroundColor: colors.outOfScopeLight,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  warningText: {
    fontSize: 8,
    color: colors.outOfScope,
    lineHeight: 1.4,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: colors.brand,
    marginBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.neutral300,
    paddingBottom: 3,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  card: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 0.5,
    borderColor: colors.neutral300,
    backgroundColor: colors.neutral100,
  },
  cardLabel: {
    fontSize: 6.8,
    color: colors.neutral500,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
  },
  summaryText: {
    fontSize: 8.5,
    color: colors.neutral700,
    lineHeight: 1.5,
  },
  listItem: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 3,
  },
  bullet: {
    color: colors.brand,
    fontSize: 8,
    marginTop: 1,
  },
  listText: {
    fontSize: 8,
    color: colors.neutral700,
    flex: 1,
    lineHeight: 1.4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.brand,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  tableHeaderCell: {
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    lineHeight: 1.35,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.neutral300,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  cellBase: {
    minWidth: 0,
    flexShrink: 1,
    paddingHorizontal: 4,
    paddingVertical: 5,
    borderRightWidth: 0.5,
    borderRightColor: colors.neutral300,
  },
  cellLast: {
    borderRightWidth: 0,
  },
  headerCellBase: {
    minWidth: 0,
    flexShrink: 1,
    paddingHorizontal: 4,
    paddingVertical: 5,
    borderRightWidth: 0.5,
    borderRightColor: '#FFFFFF',
  },
  headerCellLast: {
    borderRightWidth: 0,
  },
  colSeverity: { width: '12%' },
  colCategory: { width: '15%' },
  colDescription: { width: '38%' },
  colRecommendation: { width: '35%' },
  rowText: {
    fontSize: 7.6,
    color: colors.neutral700,
    lineHeight: 1.4,
    flexWrap: 'wrap',
  },
  footer: {
    position: 'absolute',
    left: 38,
    right: 38,
    bottom: 26,
    borderTopWidth: 0.5,
    borderTopColor: colors.neutral300,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 6.5,
    color: colors.neutral500,
  },
  footerBrand: {
    fontSize: 6.5,
    color: colors.brand,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 1,
  },
})

function statusLabel(status: ReportData['governance']['reportStatus']): string {
  if (status === 'laudo_aprovado') return 'Laudo Aprovado'
  if (status === 'laudo_rejeitado') return 'Laudo Rejeitado'
  return 'Pré-laudo pendente'
}

function riskColor(level: ReportData['summary']['riskLevel']): string {
  if (level === 'Baixo') return colors.success
  if (level === 'Médio') return colors.warning
  if (level === 'Alto') return colors.danger
  return colors.danger
}

function priorityColor(priority: 'Alta' | 'Média' | 'Baixa'): string {
  if (priority === 'Alta') return colors.danger
  if (priority === 'Média') return colors.warning
  return colors.success
}

export function ReportDocument({ data }: { data: ReportData }) {
  return (
    <Document
      title={`SGN - Relatório SST - ${data.meta.id}`}
      author={data.meta.analyst}
      subject="Análise de Conformidade SST"
      keywords="SST, SGN, conformidade, NR, auditoria"
      creator="SGN"
    >
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.brandLabel}>SGN - Sistema de Gestão Normativa</Text>
            <Text style={s.title}>Relatório Técnico de Conformidade SST</Text>
            <Text style={s.subtitle}>{data.summary.documentTitle}</Text>
          </View>
          <View>
            <Text style={s.headerMeta}>{data.meta.createdAt}</Text>
            <Text style={s.headerMeta}>ID: {data.meta.id}</Text>
            <Text style={s.headerMeta}>Analista: {data.meta.analyst}</Text>
            <Text style={s.headerMeta}>Versão: {data.meta.version}</Text>
          </View>
        </View>

        {data.meta.scope === 'out_of_scope' && data.summary.scopeWarning && (
          <View style={s.warningBox}>
            <Text style={s.warningText}>{data.summary.scopeWarning}</Text>
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>Resumo Executivo</Text>
          <View style={s.cardsRow}>
            <View style={s.card}>
              <Text style={s.cardLabel}>Score</Text>
              <Text style={[s.cardValue, { color: colors.success }]}>{data.summary.score}</Text>
            </View>
            <View style={s.card}>
              <Text style={s.cardLabel}>Risco</Text>
              <Text style={[s.cardValue, { fontSize: 12, color: riskColor(data.summary.riskLevel) }]}>
                {data.summary.riskLevel}
              </Text>
            </View>
            <View style={s.card}>
              <Text style={s.cardLabel}>Gaps</Text>
              <Text style={[s.cardValue, { color: data.summary.totalGaps > 0 ? colors.danger : colors.success }]}>
                {data.summary.totalGaps}
              </Text>
            </View>
            <View style={[s.card, { backgroundColor: colors.brandLight }]}>
              <Text style={s.cardLabel}>Status Legal</Text>
              <Text style={[s.cardValue, { fontSize: 10, color: colors.brand }]}>
                {data.summary.legalStatus || statusLabel(data.governance.reportStatus)}
              </Text>
            </View>
          </View>
          <Text style={s.summaryText}>
            Confiança: {data.summary.confidenceScore}/100 ({data.summary.confidenceClass.replace('confianca_', '')})
          </Text>
          {data.governance.alertasConfiabilidade.length > 0 && (
            <Text style={[s.summaryText, { color: colors.warning }]}>
              Alertas: {data.governance.alertasConfiabilidade.join(' | ')}
            </Text>
          )}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Pontos Fortes e Atenção</Text>
          {data.summary.strengths.map((item, idx) => (
            <View key={`st-${idx}`} style={s.listItem}>
              <Text style={s.bullet}>•</Text>
              <Text style={s.listText}>{item}</Text>
            </View>
          ))}
          {data.summary.attentionPoints.map((item, idx) => (
            <View key={`at-${idx}`} style={s.listItem}>
              <Text style={[s.bullet, { color: colors.warning }]}>!</Text>
              <Text style={s.listText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Matriz de Gaps</Text>
          <View style={s.tableHeader}>
            <View style={[s.headerCellBase, s.colSeverity]}>
              <Text style={s.tableHeaderCell}>Severidade</Text>
            </View>
            <View style={[s.headerCellBase, s.colCategory]}>
              <Text style={s.tableHeaderCell}>Categoria</Text>
            </View>
            <View style={[s.headerCellBase, s.colDescription]}>
              <Text style={s.tableHeaderCell}>Descrição</Text>
            </View>
            <View style={[s.headerCellBase, s.colRecommendation, s.headerCellLast]}>
              <Text style={s.tableHeaderCell}>Recomendação</Text>
            </View>
          </View>
          {data.gaps.length === 0 ? (
            <View style={s.tableRow}>
              <Text style={s.rowText}>Nenhum gap identificado.</Text>
            </View>
          ) : (
            data.gaps.map((gap) => (
              <View key={gap.id} style={s.tableRow}>
                <View style={[s.cellBase, s.colSeverity]}>
                  <Text style={s.rowText}>{gap.severity}</Text>
                </View>
                <View style={[s.cellBase, s.colCategory]}>
                  <Text style={s.rowText}>{gap.category}</Text>
                </View>
                <View style={[s.cellBase, s.colDescription]}>
                  <Text style={s.rowText}>
                    {gap.description}
                    {gap.norm ? ` (${gap.norm})` : ''}
                  </Text>
                </View>
                <View style={[s.cellBase, s.colRecommendation, s.cellLast]}>
                  <Text style={s.rowText}>{gap.recommendation}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Plano de Ação</Text>
          {data.actions.map((action) => (
            <View key={action.id} style={s.listItem}>
              <Text style={[s.bullet, { color: priorityColor(action.priority) }]}>•</Text>
              <Text style={s.listText}>
                [{action.priority}] {action.description}
                {action.responsible ? ` | Responsável: ${action.responsible}` : ''}
                {action.deadline ? ` | Prazo: ${action.deadline}` : ''}
              </Text>
            </View>
          ))}
        </View>

        <View style={s.footer} fixed>
          <View>
            <Text style={s.footerBrand}>SGN - Sistema de Gestão Normativa</Text>
            <Text style={s.footerText}>
              Relatório técnico para suporte à auditoria SST.
            </Text>
            <Text style={s.footerText}>
              Sessão: {data.meta.sessionId}
            </Text>
          </View>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber}/${totalPages}`}
            fixed
          />
        </View>
      </Page>
    </Document>
  )
}

export default ReportDocument
