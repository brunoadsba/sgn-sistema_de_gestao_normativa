import { dividirDocumentoEmChunks } from '@/lib/ia/chunking';
import { consolidarResultadosIncrementais } from '@/lib/ia/consolidacao-incremental';

function criarTextoGrande(blocos: number): string {
  return Array.from({ length: blocos }, (_, idx) =>
    `SECAO ${idx + 1}\n${'conteudo tecnico '.repeat(200)}\n`
  ).join('\n');
}

describe('processamento incremental', () => {
  it('deve dividir documento em chunks com overlap e metadados', () => {
    const documento = criarTextoGrande(400);
    const chunks = dividirDocumentoEmChunks(documento, {
      chunkSize: 20_000,
      overlapSize: 2_000,
      minChunkSize: 3_000,
    });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].indice).toBe(1);
    expect(chunks[0].totalChunks).toBe(chunks.length);
    expect(chunks[1].inicioOffset).toBeLessThan(chunks[0].fimOffset);
    expect(chunks.every((chunk) => chunk.chunkId.startsWith('doc-chunk-'))).toBe(true);
  });

  it('deve consolidar gaps duplicados mantendo maior severidade', () => {
    const chunk1 = {
      chunkId: 'doc-chunk-001-a',
      indice: 1,
      totalChunks: 2,
      inicioOffset: 0,
      fimOffset: 100,
      tamanhoCaracteres: 100,
      conteudo: 'trecho 1',
    };
    const chunk2 = {
      chunkId: 'doc-chunk-002-b',
      indice: 2,
      totalChunks: 2,
      inicioOffset: 80,
      fimOffset: 180,
      tamanhoCaracteres: 100,
      conteudo: 'trecho 2',
    };

    const baseResultado = {
      nivelRisco: 'medio' as const,
      resumo: 'resumo',
      pontosPositivos: ['ok'],
      pontosAtencao: ['atencao'],
      proximosPassos: ['acao'],
      timestamp: new Date().toISOString(),
      modeloUsado: 'llama',
      tempoProcessamento: 1000,
    };

    const consolidado = consolidarResultadosIncrementais(
      [
        {
          chunk: chunk1,
          tempoMs: 200,
          resultado: {
            ...baseResultado,
            score: 80,
            gaps: [
              {
                id: 'gap-epi',
                descricao: 'Falta de EPI em area molhada',
                severidade: 'media',
                categoria: 'EPI',
                recomendacao: 'Fornecer EPI',
                prazo: '15 dias',
                evidencias: [
                  {
                    chunkId: 'nr-06:chunk-001',
                    normaCodigo: 'NR-6',
                    secao: '6.1',
                    conteudo: 'texto',
                    score: 0.8,
                    fonte: 'local',
                  },
                ],
              },
            ],
          },
        },
        {
          chunk: chunk2,
          tempoMs: 300,
          resultado: {
            ...baseResultado,
            score: 70,
            gaps: [
              {
                id: 'gap-epi-2',
                descricao: 'Falta de EPI em area molhada',
                severidade: 'critica',
                categoria: 'EPI',
                recomendacao: 'Paralisar atividade ate regularizacao',
                prazo: 'imediato',
                evidencias: [
                  {
                    chunkId: 'nr-06:chunk-002',
                    normaCodigo: 'NR-6',
                    secao: '6.2',
                    conteudo: 'texto',
                    score: 0.9,
                    fonte: 'local',
                  },
                ],
              },
            ],
          },
        },
      ],
      {
        timestamp: new Date().toISOString(),
        modeloUsado: 'llama',
        tempoProcessamento: 900,
      }
    );

    expect(consolidado.gaps).toHaveLength(1);
    expect(consolidado.gaps[0].severidade).toBe('critica');
    expect(consolidado.metadadosProcessamento?.totalChunksProcessados).toBe(2);
    expect(consolidado.metadadosProcessamento?.truncamentoEvitado).toBe(true);
  });

  it('deve retornar array vazio ao enviar texto vazio', () => {
    const chunks = dividirDocumentoEmChunks('');
    expect(chunks).toEqual([]);
  });

  it('deve retornar array com 1 chunk se documento for menor que o chunkSize', () => {
    const documento = 'Documento super pequeno de uma linha.';
    const chunks = dividirDocumentoEmChunks(documento, { chunkSize: 20000 });
    expect(chunks.length).toBe(1);
    expect(chunks[0].totalChunks).toBe(1);
    expect(chunks[0].conteudo).toBe(documento);
  });

  it('deve lidar sem erro com overlap maior que tamanho de chunk', () => {
    const documento = criarTextoGrande(10);

    // Testamos com overlap maior que o chunkSize para verificar se o cursor não trava
    const chunks = dividirDocumentoEmChunks(documento, {
      chunkSize: 100,
      overlapSize: 200,
      minChunkSize: 50,
    });

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].conteudo.length).toBeGreaterThan(0);
  });

  it('deve processar e preservar caracteres unicode/emojis sem quebra', () => {
    const unicodeText = '👩‍🚀 Trabalho em espaço confinado é perigoso! ☢️ Água suja 🌊 com tensão de 220V ⚡';
    const chunks = dividirDocumentoEmChunks(unicodeText, { chunkSize: 300 });
    expect(chunks[0].conteudo).toContain('👩‍🚀');
    expect(chunks[0].conteudo).toContain('☢️');
    expect(chunks[0].conteudo).toContain('⚡');
  });

  it('deve processar grandes quantidades de texto (~1MB) rapidamente sem timeout', () => {
    // 1MB string
    const string1MB = 'a'.repeat(1024 * 1024);
    const tsInicio = Date.now();
    const chunks = dividirDocumentoEmChunks(string1MB, { chunkSize: 100000, minChunkSize: 50000, overlapSize: 10000 });
    const elapsed = Date.now() - tsInicio;

    expect(chunks.length).toBeGreaterThan(5);
    expect(elapsed).toBeLessThan(1500); // Demanda velocidade razoável (< 1.5s pra 1MB puro em chunks)
  });
});
