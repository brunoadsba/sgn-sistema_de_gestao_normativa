// Dados estáticos das Normas Regulamentadoras brasileiras de SST
// Fonte: Ministério do Trabalho e Emprego

// PDFs diretos — caminho "normas-regulamentadoras-vigentes"
const URL_BASE_PDF = 'https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/'

// PDFs diretos — caminho "arquivos/normas-regulamentadoras"
const URL_BASE_ARQUIVOS = 'https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/arquivos/normas-regulamentadoras/'

// Portarias SST (caminho alternativo usado por alguns anexos)
const URL_BASE_PORTARIAS = 'https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/seguranca-e-saude-no-trabalho/sst-portarias/2021/'

export interface NormaLocal {
    id: string
    codigo: string
    titulo: string
    descricao: string
    status: 'ativa' | 'revogada'
    categoria: string
    palavrasChave: string[]
    // URL direta do PDF principal da NR no site do MTE — todos confirmados pelo usuário (sessão 17)
    urlOficial: string
    // Anexos opcionais com label e URL individual
    urlAnexos?: { label: string; url: string }[]
}

const normas: NormaLocal[] = [
    {
        id: '1',
        codigo: 'NR-1',
        titulo: 'Disposições Gerais e Gerenciamento de Riscos Ocupacionais',
        descricao: 'Estabelece disposições gerais, campo de aplicação, termos e definições comuns às NRs e diretrizes para o GRO.',
        status: 'ativa',
        categoria: 'Geral',
        palavrasChave: ['gro', 'pgr', 'gerenciamento', 'riscos', 'disposições gerais'],
        urlOficial: `${URL_BASE_PDF}nr-01-atualizada-2025-i-3.pdf`,
    },
    {
        id: '2',
        codigo: 'NR-2',
        titulo: 'Inspeção Prévia (Revogada)',
        descricao: 'Estabelecia a inspeção prévia em estabelecimentos novos. Revogada pela Portaria SEPRT nº 915/2019.',
        status: 'revogada',
        categoria: 'Geral',
        palavrasChave: ['inspeção', 'prévia', 'revogada'],
        urlOficial: `${URL_BASE_ARQUIVOS}nr-02_atualizada_2019.pdf`,
    },
    {
        id: '3',
        codigo: 'NR-3',
        titulo: 'Embargo e Interdição',
        descricao: 'Estabelece diretrizes para embargo e interdição, caracterização de grave e iminente risco.',
        status: 'ativa',
        categoria: 'Fiscalização',
        palavrasChave: ['embargo', 'interdição', 'risco grave', 'iminente'],
        urlOficial: `${URL_BASE_ARQUIVOS}nr-03_atualizada_2019.pdf`,
    },
    {
        id: '4',
        codigo: 'NR-4',
        titulo: 'Serviços Especializados em Segurança e em Medicina do Trabalho (SESMT)',
        descricao: 'Estabelece a obrigatoriedade e dimensionamento do SESMT.',
        status: 'ativa',
        categoria: 'Organização',
        palavrasChave: ['sesmt', 'serviço especializado', 'medicina trabalho'],
        urlOficial: `${URL_BASE_PDF}nr-04-atualizada-2023.pdf`,
    },
    {
        id: '5',
        codigo: 'NR-5',
        titulo: 'Comissão Interna de Prevenção de Acidentes (CIPA)',
        descricao: 'Estabelece a CIPA e sua composição, atribuições e funcionamento.',
        status: 'ativa',
        categoria: 'Organização',
        palavrasChave: ['cipa', 'comissão', 'prevenção', 'acidentes'],
        urlOficial: `${URL_BASE_PDF}NR05atualizada2023.pdf`,
    },
    {
        id: '6',
        codigo: 'NR-6',
        titulo: 'Equipamentos de Proteção Individual (EPI)',
        descricao: 'Estabelece requisitos para seleção, fornecimento, uso e conservação de EPIs.',
        status: 'ativa',
        categoria: 'Proteção',
        palavrasChave: ['epi', 'equipamento proteção', 'individual', 'ca'],
        urlOficial: `${URL_BASE_PDF}nr-06-atualizada-2025-ii.pdf`,
    },
    {
        id: '7',
        codigo: 'NR-7',
        titulo: 'Programa de Controle Médico de Saúde Ocupacional (PCMSO)',
        descricao: 'Estabelece diretrizes para o PCMSO com objetivo de promoção e preservação da saúde dos trabalhadores.',
        status: 'ativa',
        categoria: 'Saúde',
        palavrasChave: ['pcmso', 'saúde ocupacional', 'exame médico', 'aso'],
        urlOficial: `${URL_BASE_PDF}nr-07-atualizada-2022-1.pdf`,
    },
    {
        id: '8',
        codigo: 'NR-8',
        titulo: 'Edificações',
        descricao: 'Estabelece requisitos mínimos para edificações, garantindo segurança e conforto aos trabalhadores.',
        status: 'ativa',
        categoria: 'Infraestrutura',
        palavrasChave: ['edificações', 'construção', 'piso', 'cobertura'],
        urlOficial: `${URL_BASE_ARQUIVOS}nr-08-atualizada-2022.pdf`,
    },
    {
        id: '9',
        codigo: 'NR-9',
        titulo: 'Avaliação e Controle das Exposições Ocupacionais a Agentes Físicos, Químicos e Biológicos',
        descricao: 'Estabelece requisitos para avaliação e controle de exposições ocupacionais.',
        status: 'ativa',
        categoria: 'Higiene',
        palavrasChave: ['exposição', 'agentes', 'físicos', 'químicos', 'biológicos'],
        urlOficial: `${URL_BASE_PDF}nr-09-atualizada-2021.pdf`,
    },
    {
        id: '10',
        codigo: 'NR-10',
        titulo: 'Segurança em Instalações e Serviços em Eletricidade',
        descricao: 'Estabelece requisitos e condições mínimas para segurança em instalações elétricas.',
        status: 'ativa',
        categoria: 'Eletricidade',
        palavrasChave: ['eletricidade', 'instalações elétricas', 'choque', 'arco'],
        urlOficial: `${URL_BASE_ARQUIVOS}nr-10.pdf`,
    },
    {
        id: '11',
        codigo: 'NR-11',
        titulo: 'Transporte, Movimentação, Armazenagem e Manuseio de Materiais',
        descricao: 'Estabelece requisitos de segurança para operação de equipamentos de transporte e movimentação.',
        status: 'ativa',
        categoria: 'Logística',
        palavrasChave: ['transporte', 'movimentação', 'empilhadeira', 'carga'],
        urlOficial: `${URL_BASE_PDF}nr-11-atualizada-2016.pdf`,
        urlAnexos: [
            { label: 'Anexo I — Transporte de Sacas', url: `${URL_BASE_ARQUIVOS}nr-11-anexo-01.pdf` },
        ],
    },
    {
        id: '12',
        codigo: 'NR-12',
        titulo: 'Segurança no Trabalho em Máquinas e Equipamentos',
        descricao: 'Define referências técnicas e medidas de proteção para uso seguro de máquinas e equipamentos.',
        status: 'ativa',
        categoria: 'Máquinas',
        palavrasChave: ['máquinas', 'equipamentos', 'proteção', 'dispositivos segurança'],
        urlOficial: `${URL_BASE_PDF}nr-12-atualizada-2025.pdf`,
    },
    {
        id: '13',
        codigo: 'NR-13',
        titulo: 'Caldeiras, Vasos de Pressão, Tubulações e Tanques Metálicos de Armazenamento',
        descricao: 'Estabelece requisitos de segurança para caldeiras, vasos de pressão e tubulações.',
        status: 'ativa',
        categoria: 'Equipamentos',
        palavrasChave: ['caldeira', 'vaso pressão', 'tubulação', 'tanque'],
        urlOficial: `${URL_BASE_PDF}nr-13-atualizada-2023-b.pdf`,
    },
    {
        id: '14',
        codigo: 'NR-14',
        titulo: 'Fornos',
        descricao: 'Estabelece requisitos para instalação e operação de fornos industriais.',
        status: 'ativa',
        categoria: 'Equipamentos',
        palavrasChave: ['fornos', 'industrial', 'calor'],
        urlOficial: `${URL_BASE_ARQUIVOS}nr-14-atualizada-2022.pdf`,
    },
    {
        id: '15',
        codigo: 'NR-15',
        titulo: 'Atividades e Operações Insalubres',
        descricao: 'Define atividades e operações insalubres, limites de tolerância e adicional de insalubridade.',
        status: 'ativa',
        categoria: 'Insalubridade',
        palavrasChave: ['insalubridade', 'insalubre', 'limite tolerância', 'adicional'],
        urlOficial: `${URL_BASE_PDF}nr-15-atualizada-2025.pdf`,
        urlAnexos: [
            { label: 'Anexo I — Limites de Tolerância para Ruído Contínuo', url: `${URL_BASE_ARQUIVOS}nr-15-anexo-01.pdf` },
            { label: 'Anexo II — Limites de Tolerância para Ruído de Impacto', url: `${URL_BASE_ARQUIVOS}nr-15-anexo-02.pdf` },
            { label: 'Anexo III — Calor (Portaria MTP nº 426/2021)', url: `${URL_BASE_PORTARIAS}portaria-mtp-no-426-anexos-i-vibracao-e-iii-calor-da-nr-09.pdf` },
            { label: 'Anexo IV — Iluminação', url: `${URL_BASE_ARQUIVOS}nr-15-anexo-04.pdf` },
            { label: 'Anexo V — Radiações Ionizantes', url: `${URL_BASE_ARQUIVOS}nr-15-anexo-05.pdf` },
            { label: 'Anexo VI — Trabalho sob Condições Hiperbáricas', url: `${URL_BASE_PDF}nr-15-anexo-6-trabalho-sob-condicoes-hiperbaricas.pdf` },
            { label: 'Anexo VII — Radiações Não Ionizantes', url: `${URL_BASE_ARQUIVOS}nr-15-anexo-07.pdf` },
            { label: 'Anexo VIII — Vibrações (Portaria MTP nº 426/2021)', url: `${URL_BASE_PORTARIAS}portaria-mtp-no-426-anexos-i-vibracao-e-iii-calor-da-nr-09.pdf` },
            { label: 'Anexo IX — Frio', url: `${URL_BASE_ARQUIVOS}nr-15-anexo-09.pdf` },
            { label: 'Anexo X — Umidade', url: `${URL_BASE_ARQUIVOS}nr-15-anexo-10.pdf` },
            { label: 'Anexo XI — Agentes Químicos com Limites de Tolerância', url: `${URL_BASE_ARQUIVOS}nr-15-anexo-11.pdf` },
            { label: 'Anexo XII — Poeiras Minerais', url: `${URL_BASE_ARQUIVOS}nr-15-anexo-12.pdf` },
            { label: 'Anexo XIII — Agentes Químicos', url: `${URL_BASE_ARQUIVOS}nr-15-anexo-13.pdf` },
            { label: 'Anexo XIII-A — Benzeno (atualizado 2022)', url: `${URL_BASE_ARQUIVOS}nr-15-anexo-13a-atualizado-2022-1.pdf` },
            { label: 'Anexo XIV — Agentes Biológicos', url: `${URL_BASE_ARQUIVOS}nr-15-anexo-14.pdf` },
        ],
    },
    {
        id: '16',
        codigo: 'NR-16',
        titulo: 'Atividades e Operações Perigosas',
        descricao: 'Define atividades e operações perigosas e adicional de periculosidade.',
        status: 'ativa',
        categoria: 'Periculosidade',
        palavrasChave: ['periculosidade', 'perigoso', 'explosivo', 'inflamável'],
        urlOficial: `${URL_BASE_PDF}nr-16-atualizada-2025-ii.pdf`,
    },
    {
        id: '17',
        codigo: 'NR-17',
        titulo: 'Ergonomia',
        descricao: 'Estabelece parâmetros para adaptação das condições de trabalho às características dos trabalhadores.',
        status: 'ativa',
        categoria: 'Ergonomia',
        palavrasChave: ['ergonomia', 'postura', 'mobiliário', 'conforto'],
        urlOficial: `${URL_BASE_PDF}nr-17-atualizada-2023.pdf`,
        urlAnexos: [
            { label: 'Anexo I — Trabalho em Checkout (atualizado 2023)', url: `${URL_BASE_PDF}nr-17-anexo-i-checkout-atualizado-2023.pdf` },
            { label: 'Anexo II — Teleatendimento/Telemarketing (atualizado 2023)', url: `${URL_BASE_PDF}nr-17-anexo-ii-teleatendimento-atualizado-2023.pdf` },
        ],
    },
    {
        id: '18',
        codigo: 'NR-18',
        titulo: 'Segurança e Saúde no Trabalho na Indústria da Construção',
        descricao: 'Estabelece diretrizes para implementação de medidas de controle na construção civil.',
        status: 'ativa',
        categoria: 'Construção',
        palavrasChave: ['construção civil', 'obra', 'canteiro', 'pcmat'],
        urlOficial: `${URL_BASE_PDF}nr-18-atualizada-2025-1.pdf`,
    },
    {
        id: '19',
        codigo: 'NR-19',
        titulo: 'Explosivos',
        descricao: 'Estabelece requisitos para depósito, manuseio e transporte de explosivos.',
        status: 'ativa',
        categoria: 'Explosivos',
        palavrasChave: ['explosivos', 'detonação', 'munição'],
        urlOficial: `${URL_BASE_PDF}nr-19-atualizada-2023.pdf`,
    },
    {
        id: '20',
        codigo: 'NR-20',
        titulo: 'Segurança e Saúde no Trabalho com Inflamáveis e Combustíveis',
        descricao: 'Estabelece requisitos para prevenção e controle no trabalho com inflamáveis e combustíveis.',
        status: 'ativa',
        categoria: 'Inflamáveis',
        palavrasChave: ['inflamável', 'combustível', 'posto', 'armazenamento'],
        urlOficial: `${URL_BASE_PDF}nr-20-atualizada-2025.pdf`,
    },
    {
        id: '21',
        codigo: 'NR-21',
        titulo: 'Trabalhos a Céu Aberto',
        descricao: 'Estabelece requisitos para trabalho a céu aberto, proteção contra intempéries.',
        status: 'ativa',
        categoria: 'Ambiente',
        palavrasChave: ['céu aberto', 'intempérie', 'abrigo'],
        urlOficial: `${URL_BASE_ARQUIVOS}nr-21.pdf`,
    },
    {
        id: '22',
        codigo: 'NR-22',
        titulo: 'Segurança e Saúde Ocupacional na Mineração',
        descricao: 'Estabelece requisitos de SST em mineração.',
        status: 'ativa',
        categoria: 'Mineração',
        palavrasChave: ['mineração', 'mina', 'subsolo', 'escavação'],
        urlOficial: `${URL_BASE_PDF}nr-22-atualizada-2024-iii.pdf`,
    },
    {
        id: '23',
        codigo: 'NR-23',
        titulo: 'Proteção Contra Incêndios',
        descricao: 'Estabelece medidas de proteção contra incêndios nos locais de trabalho.',
        status: 'ativa',
        categoria: 'Incêndio',
        palavrasChave: ['incêndio', 'extintor', 'brigada', 'evacuação'],
        urlOficial: `${URL_BASE_ARQUIVOS}nr-23-atualizada-2022.pdf`,
    },
    {
        id: '24',
        codigo: 'NR-24',
        titulo: 'Condições Sanitárias e de Conforto nos Locais de Trabalho',
        descricao: 'Estabelece condições sanitárias e de conforto obrigatórias.',
        status: 'ativa',
        categoria: 'Infraestrutura',
        palavrasChave: ['sanitário', 'vestiário', 'refeitório', 'conforto'],
        urlOficial: `${URL_BASE_ARQUIVOS}nr-24-atualizada-2022.pdf`,
    },
    {
        id: '25',
        codigo: 'NR-25',
        titulo: 'Resíduos Industriais',
        descricao: 'Estabelece medidas para eliminação ou controle de resíduos industriais.',
        status: 'ativa',
        categoria: 'Meio Ambiente',
        palavrasChave: ['resíduos', 'industrial', 'descarte', 'lixo'],
        urlOficial: `${URL_BASE_ARQUIVOS}nr-25-atualizada-2022-1.pdf`,
    },
    {
        id: '26',
        codigo: 'NR-26',
        titulo: 'Sinalização de Segurança',
        descricao: 'Estabelece a padronização de cores e sinalização de segurança.',
        status: 'ativa',
        categoria: 'Sinalização',
        palavrasChave: ['sinalização', 'cores', 'placa', 'fds', 'fispq'],
        urlOficial: `${URL_BASE_ARQUIVOS}nr-26-atualizada-2022.pdf`,
    },
    {
        id: '27',
        codigo: 'NR-27',
        titulo: 'Registro Profissional do Técnico de Segurança (Revogada)',
        descricao: 'Estabelecia o registro profissional do técnico de segurança. Revogada.',
        status: 'revogada',
        categoria: 'Geral',
        palavrasChave: ['registro', 'técnico segurança', 'revogada'],
        urlOficial: `${URL_BASE_ARQUIVOS}nr_27_revogada_2008.pdf`,
    },
    {
        id: '28',
        codigo: 'NR-28',
        titulo: 'Fiscalização e Penalidades',
        descricao: 'Estabelece procedimentos de fiscalização e penalidades pelo descumprimento das NRs.',
        status: 'ativa',
        categoria: 'Fiscalização',
        palavrasChave: ['fiscalização', 'penalidade', 'multa', 'infração'],
        urlOficial: `${URL_BASE_PDF}nr-28-atualizada-2024-i.pdf`,
    },
    {
        id: '29',
        codigo: 'NR-29',
        titulo: 'Norma Regulamentadora de Segurança e Saúde no Trabalho Portuário',
        descricao: 'Estabelece medidas de SST para trabalho portuário.',
        status: 'ativa',
        categoria: 'Portuário',
        palavrasChave: ['portuário', 'porto', 'cais', 'embarque'],
        urlOficial: `${URL_BASE_PDF}nr-29-atualizada-2023.pdf`,
    },
    {
        id: '30',
        codigo: 'NR-30',
        titulo: 'Segurança e Saúde no Trabalho Aquaviário',
        descricao: 'Estabelece medidas de SST para trabalho aquaviário.',
        status: 'ativa',
        categoria: 'Aquaviário',
        palavrasChave: ['aquaviário', 'embarcação', 'navio', 'plataforma'],
        urlOficial: `${URL_BASE_PDF}nr-30-atualizada-2023.pdf`,
    },
    {
        id: '31',
        codigo: 'NR-31',
        titulo: 'Segurança e Saúde no Trabalho na Agricultura, Pecuária, Silvicultura, Exploração Florestal e Aquicultura',
        descricao: 'Estabelece medidas de SST para trabalho rural.',
        status: 'ativa',
        categoria: 'Rural',
        palavrasChave: ['agricultura', 'rural', 'agrotóxico', 'pecuária'],
        urlOficial: `${URL_BASE_PDF}nr-31-atualizada-2024-2.pdf`,
    },
    {
        id: '32',
        codigo: 'NR-32',
        titulo: 'Segurança e Saúde no Trabalho em Serviços de Saúde',
        descricao: 'Estabelece medidas de SST em estabelecimentos de saúde.',
        status: 'ativa',
        categoria: 'Saúde',
        palavrasChave: ['saúde', 'hospital', 'risco biológico', 'perfurocortante'],
        urlOficial: `${URL_BASE_PDF}nr-32-atualizada-2023-1.pdf`,
    },
    {
        id: '33',
        codigo: 'NR-33',
        titulo: 'Segurança e Saúde nos Trabalhos em Espaços Confinados',
        descricao: 'Estabelece requisitos para trabalho em espaços confinados.',
        status: 'ativa',
        categoria: 'Espaço Confinado',
        palavrasChave: ['espaço confinado', 'pet', 'resgate', 'atmosfera'],
        urlOficial: `${URL_BASE_ARQUIVOS}nr-33-atualizada-2022-_retificada.pdf`,
    },
    {
        id: '34',
        codigo: 'NR-34',
        titulo: 'Condições e Meio Ambiente de Trabalho na Indústria da Construção, Reparação e Desmonte Naval',
        descricao: 'Estabelece requisitos de SST na indústria naval.',
        status: 'ativa',
        categoria: 'Naval',
        palavrasChave: ['naval', 'estaleiro', 'construção naval', 'desmonte'],
        urlOficial: `${URL_BASE_PDF}nr-34-atualizada-2023-2.pdf`,
    },
    {
        id: '35',
        codigo: 'NR-35',
        titulo: 'Trabalho em Altura',
        descricao: 'Estabelece requisitos para trabalho em altura acima de 2 metros.',
        status: 'ativa',
        categoria: 'Altura',
        palavrasChave: ['altura', 'queda', 'cinto', 'andaime', 'escada'],
        urlOficial: `${URL_BASE_PDF}nr-35-atualizada-2025-1.pdf`,
    },
    {
        id: '36',
        codigo: 'NR-36',
        titulo: 'Segurança e Saúde no Trabalho em Empresas de Abate e Processamento de Carnes e Derivados',
        descricao: 'Estabelece requisitos de SST na indústria frigorífica.',
        status: 'ativa',
        categoria: 'Frigorífico',
        palavrasChave: ['frigorífico', 'abate', 'carne', 'frio'],
        urlOficial: `${URL_BASE_PDF}nr-36-atualizada-2024-1.pdf`,
    },
    {
        id: '37',
        codigo: 'NR-37',
        titulo: 'Segurança e Saúde em Plataformas de Petróleo',
        descricao: 'Estabelece requisitos de SST em plataformas de petróleo.',
        status: 'ativa',
        categoria: 'Petróleo',
        palavrasChave: ['plataforma', 'petróleo', 'offshore', 'perfuração'],
        urlOficial: 'https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/seguranca-e-saude-no-trabalho/ctpp-nrs/nr-37-atualizada-2023.pdf',
    },
    {
        id: '38',
        codigo: 'NR-38',
        titulo: 'Segurança e Saúde no Trabalho nas Atividades de Limpeza Urbana e Manejo de Resíduos Sólidos',
        descricao: 'Estabelece requisitos de SST em limpeza urbana e manejo de resíduos.',
        status: 'ativa',
        categoria: 'Limpeza Urbana',
        palavrasChave: ['limpeza urbana', 'resíduos sólidos', 'coleta', 'reciclagem'],
        urlOficial: `${URL_BASE_PDF}nr-38-atualizada-2025-3.pdf`,
    },
]

// Funções helper

let normasCache: NormaLocal[] | null = null

export function getNormas(): NormaLocal[] {
    if (!normasCache) {
        normasCache = normas
    }
    return normasCache
}

export function getNormaById(id: string): NormaLocal | undefined {
    return normas.find(n => n.id === id)
}

export function getNormasByIds(ids: string[]): NormaLocal[] {
    return normas.filter(n => ids.includes(n.id))
}

export function searchNormas(query: string): NormaLocal[] {
    const q = query.toLowerCase().trim()
    if (!q) return normas

    return normas.filter(n =>
        n.codigo.toLowerCase().includes(q) ||
        n.titulo.toLowerCase().includes(q) ||
        n.descricao.toLowerCase().includes(q) ||
        n.palavrasChave.some(p => p.includes(q))
    )
}

export function getNormasStats() {
    const ativas = normas.filter(n => n.status === 'ativa')
    const revogadas = normas.filter(n => n.status === 'revogada')

    const categorias = ativas.reduce<Record<string, number>>((acc, n) => {
        acc[n.categoria] = (acc[n.categoria] || 0) + 1
        return acc
    }, {})

    return {
        total: normas.length,
        ativas: ativas.length,
        revogadas: revogadas.length,
        categorias,
    }
}
