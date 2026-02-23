// Tipos de documento SST disponíveis para análise de conformidade
export interface TipoDocumento {
  value: string
  label: string
  group: string
  icon: string
  cor: string
}

export const GRUPOS_DOCUMENTO = [
  'Normas Regulamentadoras',
  'Leis Federais',
  'Leis Estaduais',
  'Leis Municipais',
  'Documentos Obrigatórios',
  'Outros Documentos',
] as const

export const TIPOS_DOCUMENTO: TipoDocumento[] = [
  // NORMAS REGULAMENTADORAS
  { value: 'NR-1', label: 'NR-1 GRO - Programa de Gerenciamento de Riscos Ocupacionais (PGR)', group: 'Normas Regulamentadoras', icon: '📋', cor: 'bg-blue-100 text-blue-800' },
  { value: 'NR-3', label: 'NR-3 - Embargo e Interdição', group: 'Normas Regulamentadoras', icon: '🚫', cor: 'bg-red-100 text-red-800' },
  { value: 'NR-4', label: 'NR-4 - Serviços Especializados em Segurança e em Medicina do Trabalho', group: 'Normas Regulamentadoras', icon: '🏥', cor: 'bg-green-100 text-green-800' },
  { value: 'NR-5', label: 'NR-5 - Comissão Interna de Prevenção de Acidentes e Assédio', group: 'Normas Regulamentadoras', icon: '👥', cor: 'bg-purple-100 text-purple-800' },
  { value: 'NR-6', label: 'NR-6 - Equipamento de Proteção Individual - EPI', group: 'Normas Regulamentadoras', icon: '🦺', cor: 'bg-orange-100 text-orange-800' },
  { value: 'NR-7', label: 'NR-7 - Programa de Controle Médico de Saúde Ocupacional', group: 'Normas Regulamentadoras', icon: '🏥', cor: 'bg-green-100 text-green-800' },
  { value: 'NR-8', label: 'NR-8 - Edificações', group: 'Normas Regulamentadoras', icon: '🏢', cor: 'bg-gray-100 text-gray-800' },
  { value: 'NR-9', label: 'NR-9 - Avaliação e Controle das Exposições Ocupacionais', group: 'Normas Regulamentadoras', icon: '🧪', cor: 'bg-yellow-100 text-yellow-800' },
  { value: 'NR-10', label: 'NR-10 - Segurança em Instalações e Serviços em Eletricidade', group: 'Normas Regulamentadoras', icon: '⚡', cor: 'bg-yellow-100 text-yellow-800' },
  { value: 'NR-11', label: 'NR-11 - Transporte, Movimentação e Manuseio de Materiais', group: 'Normas Regulamentadoras', icon: '🚛', cor: 'bg-blue-100 text-blue-800' },
  { value: 'NR-12', label: 'NR-12 - Segurança no Trabalho em Máquinas e Equipamentos', group: 'Normas Regulamentadoras', icon: '⚙️', cor: 'bg-gray-100 text-gray-800' },
  { value: 'NR-13', label: 'NR-13 - Caldeiras, Vasos de Pressão e Tubulações', group: 'Normas Regulamentadoras', icon: '🔥', cor: 'bg-red-100 text-red-800' },
  { value: 'NR-14', label: 'NR-14 - Fornos', group: 'Normas Regulamentadoras', icon: '🔥', cor: 'bg-red-100 text-red-800' },
  { value: 'NR-15', label: 'NR-15 - Atividades e Operações Insalubres', group: 'Normas Regulamentadoras', icon: '⚠️', cor: 'bg-orange-100 text-orange-800' },
  { value: 'NR-16', label: 'NR-16 - Atividades e Operações Perigosas', group: 'Normas Regulamentadoras', icon: '🚨', cor: 'bg-red-100 text-red-800' },
  { value: 'NR-17', label: 'NR-17 - Ergonomia', group: 'Normas Regulamentadoras', icon: '🪑', cor: 'bg-green-100 text-green-800' },
  { value: 'NR-18', label: 'NR-18 - Segurança na Indústria da Construção', group: 'Normas Regulamentadoras', icon: '🏗️', cor: 'bg-orange-100 text-orange-800' },
  { value: 'NR-19', label: 'NR-19 - Explosivos', group: 'Normas Regulamentadoras', icon: '💥', cor: 'bg-red-100 text-red-800' },
  { value: 'NR-20', label: 'NR-20 - Segurança com Inflamáveis e Combustíveis', group: 'Normas Regulamentadoras', icon: '🔥', cor: 'bg-red-100 text-red-800' },
  { value: 'NR-21', label: 'NR-21 - Trabalhos a Céu Aberto', group: 'Normas Regulamentadoras', icon: '☀️', cor: 'bg-yellow-100 text-yellow-800' },
  { value: 'NR-22', label: 'NR-22 - Segurança Ocupacional na Mineração', group: 'Normas Regulamentadoras', icon: '⛏️', cor: 'bg-gray-100 text-gray-800' },
  { value: 'NR-23', label: 'NR-23 - Proteção Contra Incêndios', group: 'Normas Regulamentadoras', icon: '🚒', cor: 'bg-red-100 text-red-800' },
  { value: 'NR-24', label: 'NR-24 - Condições Sanitárias nos Locais de Trabalho', group: 'Normas Regulamentadoras', icon: '🚿', cor: 'bg-blue-100 text-blue-800' },
  { value: 'NR-25', label: 'NR-25 - Resíduos Industriais', group: 'Normas Regulamentadoras', icon: '♻️', cor: 'bg-green-100 text-green-800' },
  { value: 'NR-26', label: 'NR-26 - Sinalização de Segurança', group: 'Normas Regulamentadoras', icon: '🚦', cor: 'bg-yellow-100 text-yellow-800' },
  { value: 'NR-28', label: 'NR-28 - Fiscalização e Penalidades', group: 'Normas Regulamentadoras', icon: '⚖️', cor: 'bg-purple-100 text-purple-800' },
  { value: 'NR-29', label: 'NR-29 - Segurança no Trabalho Portuário', group: 'Normas Regulamentadoras', icon: '🚢', cor: 'bg-blue-100 text-blue-800' },
  { value: 'NR-30', label: 'NR-30 - Segurança no Trabalho Aquaviário', group: 'Normas Regulamentadoras', icon: '⛵', cor: 'bg-blue-100 text-blue-800' },
  { value: 'NR-31', label: 'NR-31 - Segurança na Agricultura e Pecuária', group: 'Normas Regulamentadoras', icon: '🌾', cor: 'bg-green-100 text-green-800' },
  { value: 'NR-32', label: 'NR-32 - Segurança em Serviços de Saúde', group: 'Normas Regulamentadoras', icon: '🏥', cor: 'bg-green-100 text-green-800' },
  { value: 'NR-33', label: 'NR-33 - Segurança em Espaços Confinados', group: 'Normas Regulamentadoras', icon: '🔒', cor: 'bg-gray-100 text-gray-800' },
  { value: 'NR-34', label: 'NR-34 - Construção e Reparação Naval', group: 'Normas Regulamentadoras', icon: '🚢', cor: 'bg-blue-100 text-blue-800' },
  { value: 'NR-35', label: 'NR-35 - Trabalho em Altura', group: 'Normas Regulamentadoras', icon: '🏗️', cor: 'bg-orange-100 text-orange-800' },
  { value: 'NR-36', label: 'NR-36 - Abate e Processamento de Carnes', group: 'Normas Regulamentadoras', icon: '🥩', cor: 'bg-red-100 text-red-800' },
  { value: 'NR-37', label: 'NR-37 - Segurança em Plataformas de Petróleo', group: 'Normas Regulamentadoras', icon: '🛢️', cor: 'bg-gray-100 text-gray-800' },

  // LEIS FEDERAIS
  { value: 'LEI-FEDERAL-8213', label: 'Lei Federal 8.213/91 - Planos de Benefícios da Previdência Social', group: 'Leis Federais', icon: '📜', cor: 'bg-blue-100 text-blue-800' },
  { value: 'LEI-FEDERAL-6514', label: 'Lei Federal 6.514/77 - Segurança e Medicina do Trabalho', group: 'Leis Federais', icon: '📜', cor: 'bg-blue-100 text-blue-800' },
  { value: 'LEI-FEDERAL-11705', label: 'Lei Federal 11.705/08 - Lei Seca', group: 'Leis Federais', icon: '📜', cor: 'bg-blue-100 text-blue-800' },
  { value: 'LEI-FEDERAL-12967', label: 'Lei Federal 12.967/14 - Política Nacional de SST', group: 'Leis Federais', icon: '📜', cor: 'bg-blue-100 text-blue-800' },
  { value: 'LEI-ESTADUAL', label: 'Lei Estadual - Segurança e Saúde no Trabalho', group: 'Leis Estaduais', icon: '🏛️', cor: 'bg-green-100 text-green-800' },
  { value: 'LEI-MUNICIPAL', label: 'Lei Municipal - Segurança e Saúde no Trabalho', group: 'Leis Municipais', icon: '🏛️', cor: 'bg-purple-100 text-purple-800' },

  // DOCUMENTOS OBRIGATÓRIOS
  { value: 'PGR', label: 'PGR - Programa de Gerenciamento de Riscos Ocupacionais (NR-1 GRO)', group: 'Documentos Obrigatórios', icon: '📋', cor: 'bg-blue-100 text-blue-800' },
  { value: 'NR-1-GRO', label: 'NR-1 GRO - Gerenciamento de Riscos Ocupacionais', group: 'Documentos Obrigatórios', icon: '📋', cor: 'bg-blue-100 text-blue-800' },
  { value: 'PCMSO', label: 'PCMSO - Programa de Controle Médico de Saúde Ocupacional', group: 'Documentos Obrigatórios', icon: '🏥', cor: 'bg-green-100 text-green-800' },
  { value: 'ASO', label: 'ASO - Atestado de Saúde Ocupacional', group: 'Documentos Obrigatórios', icon: '📋', cor: 'bg-blue-100 text-blue-800' },
  { value: 'CAT', label: 'CAT - Comunicação de Acidente de Trabalho', group: 'Documentos Obrigatórios', icon: '🚨', cor: 'bg-red-100 text-red-800' },
  { value: 'LTCAT', label: 'LTCAT - Laudo Técnico das Condições Ambientais', group: 'Documentos Obrigatórios', icon: '📄', cor: 'bg-yellow-100 text-yellow-800' },
  { value: 'PPRA', label: 'PPRA - Programa de Prevenção de Riscos Ambientais (Legado)', group: 'Documentos Obrigatórios', icon: '📋', cor: 'bg-gray-100 text-gray-600' },
  { value: 'PPP', label: 'PPP - Perfil Profissiográfico Previdenciário', group: 'Documentos Obrigatórios', icon: '👤', cor: 'bg-purple-100 text-purple-800' },

  // OUTROS DOCUMENTOS
  { value: 'CERTIFICADO-TREINAMENTO', label: 'Certificado de Treinamento', group: 'Outros Documentos', icon: '🎓', cor: 'bg-green-100 text-green-800' },
  { value: 'FDS', label: 'FDS - Ficha com Dados de Segurança', group: 'Outros Documentos', icon: '📄', cor: 'bg-gray-100 text-gray-800' },
  { value: 'FICHA-EPI', label: 'Ficha de Controle de EPI', group: 'Outros Documentos', icon: '🦺', cor: 'bg-orange-100 text-orange-800' },
  { value: 'MANUAL-INSTRUCAO', label: 'Manual de Instrução de Trabalho', group: 'Outros Documentos', icon: '📖', cor: 'bg-blue-100 text-blue-800' },
  { value: 'PROCEDIMENTO-SEGURANCA', label: 'Procedimento de Segurança', group: 'Outros Documentos', icon: '📋', cor: 'bg-red-100 text-red-800' },
  { value: 'POLITICA-SST', label: 'Política de Segurança e Saúde no Trabalho', group: 'Outros Documentos', icon: '📜', cor: 'bg-purple-100 text-purple-800' },
  { value: 'RELATORIO-AUDITORIA', label: 'Relatório de Auditoria SST', group: 'Outros Documentos', icon: '📊', cor: 'bg-gray-100 text-gray-800' },
  { value: 'ANALISE-RISCO', label: 'Análise de Risco', group: 'Outros Documentos', icon: '⚠️', cor: 'bg-orange-100 text-orange-800' },
  { value: 'PLANO-EMERGENCIA', label: 'Plano de Emergência', group: 'Outros Documentos', icon: '🚨', cor: 'bg-red-100 text-red-800' },
  { value: 'OUTRO', label: 'Outro Documento SST', group: 'Outros Documentos', icon: '📄', cor: 'bg-gray-100 text-gray-800' },
]
