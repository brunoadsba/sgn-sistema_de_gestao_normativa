import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, queryOptions, mutationOptions, cacheUtils } from '../lib/cache/query-client';
import { AnaliseConformidadeRequest, AnaliseConformidadeResponse } from '@/types/ia';

// Hook para buscar normas
export function useNormas(filters: Record<string, any> = {}) {
  return useQuery({
    ...queryOptions.normas.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      
      const response = await fetch(`/api/normas?${params}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar normas: ${response.statusText}`);
      }
      return response.json();
    },
  });
}

// Hook para buscar detalhes de uma norma
export function useNormaDetail(id: string) {
  return useQuery({
    ...queryOptions.normas.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/normas/${id}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar norma: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!id,
  });
}

// Hook para buscar estatísticas das normas
export function useNormasStats() {
  return useQuery({
    ...queryOptions.normas.stats(),
    queryFn: async () => {
      const response = await fetch('/api/normas/stats');
      if (!response.ok) {
        throw new Error(`Erro ao buscar estatísticas: ${response.statusText}`);
      }
      return response.json();
    },
  });
}

// Hook para análise de IA
export function useIAAnalysis(empresaId: string) {
  return useQuery({
    ...queryOptions.ia.analysis(empresaId),
    queryFn: async () => {
      const response = await fetch(`/api/ia/analisar-conformidade?empresaId=${empresaId}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar análise de IA: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!empresaId,
  });
}

// Hook para executar análise de IA
export function useExecuteIAAnalysis() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: AnaliseConformidadeRequest): Promise<AnaliseConformidadeResponse> => {
      const response = await fetch('/api/ia/analisar-conformidade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro na análise de IA: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      cacheUtils.invalidateIAAnalysis(queryClient, variables.empresaId);
      
      // Update cache with new result
      queryClient.setQueryData(
        queryKeys.ia.result(data.id || 'latest'),
        data
      );
      
      console.log('✅ Análise de IA concluída com sucesso');
    },
    onError: (error) => {
      console.error('❌ Erro na análise de IA:', error);
    },
  });
}

// Hook para health check
export function useHealthCheck() {
  return useQuery({
    ...queryOptions.health.check(),
    queryFn: async () => {
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error(`Health check falhou: ${response.statusText}`);
      }
      return response.json();
    },
  });
}

// Hook para buscar resultado específico de IA
export function useIAResult(id: string) {
  return useQuery({
    ...queryOptions.ia.result(id),
    queryFn: async () => {
      const response = await fetch(`/api/ia/resultado/${id}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar resultado: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!id,
  });
}

// Hook para invalidar cache
export function useCacheInvalidation() {
  const queryClient = useQueryClient();
  
  return {
    invalidateNormas: () => cacheUtils.invalidateNormas(queryClient),
    invalidateNorma: (id: string) => cacheUtils.invalidateNorma(queryClient, id),
    invalidateIA: () => cacheUtils.invalidateIA(queryClient),
    invalidateIAAnalysis: (empresaId: string) => cacheUtils.invalidateIAAnalysis(queryClient, empresaId),
    clearAll: () => cacheUtils.clearAll(queryClient),
  };
}

// Hook para prefetch de dados
export function usePrefetch() {
  const queryClient = useQueryClient();
  
  return {
    prefetchNormas: (filters: Record<string, any> = {}) => 
      cacheUtils.prefetchNormas(queryClient, filters),
    prefetchNormaDetail: (id: string) => 
      cacheUtils.prefetchNormaDetail(queryClient, id),
  };
}

// Hook para buscar múltiplas normas em paralelo
export function useMultipleNormas(ids: string[]) {
  return useQuery({
    queryKey: [...queryKeys.normas.all, 'multiple', ids],
    queryFn: async () => {
      const promises = ids.map(id => 
        fetch(`/api/normas/${id}`).then(res => {
          if (!res.ok) throw new Error(`Erro ao buscar norma ${id}`);
          return res.json();
        })
      );
      
      return Promise.all(promises);
    },
    enabled: ids.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  });
}

// Hook para buscar normas com paginação
export function useNormasPaginated(page: number = 1, limit: number = 10, filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: [...queryKeys.normas.list(filters), 'paginated', { page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => 
            value !== undefined && value !== null && value !== ''
          )
        ),
      });
      
      const response = await fetch(`/api/normas?${params}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar normas paginadas: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar normas por categoria
export function useNormasByCategory(category: string) {
  return useQuery({
    queryKey: [...queryKeys.normas.all, 'category', category],
    queryFn: async () => {
      const response = await fetch(`/api/normas?categoria=${category}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar normas por categoria: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!category,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  });
}

// Hook para buscar normas por status
export function useNormasByStatus(status: 'ativa' | 'revogada' | 'todas' = 'todas') {
  return useQuery({
    queryKey: [...queryKeys.normas.all, 'status', status],
    queryFn: async () => {
      const response = await fetch(`/api/normas?status=${status}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar normas por status: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar normas com busca textual
export function useNormasSearch(searchTerm: string) {
  return useQuery({
    queryKey: [...queryKeys.normas.all, 'search', searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/normas?search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar normas: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: searchTerm.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para estatísticas avançadas
export function useAdvancedStats() {
  return useQuery({
    queryKey: [...queryKeys.normas.all, 'advanced-stats'],
    queryFn: async () => {
      const response = await fetch('/api/normas/advanced-stats');
      if (!response.ok) {
        throw new Error(`Erro ao buscar estatísticas avançadas: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  });
}

// Hook para histórico de análises de IA
export function useIAnalysisHistory(empresaId: string) {
  return useQuery({
    queryKey: [...queryKeys.ia.all, 'history', empresaId],
    queryFn: async () => {
      const response = await fetch(`/api/ia/historico?empresaId=${empresaId}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar histórico: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!empresaId,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  });
}

export default {
  useNormas,
  useNormaDetail,
  useNormasStats,
  useIAAnalysis,
  useExecuteIAAnalysis,
  useHealthCheck,
  useIAResult,
  useCacheInvalidation,
  usePrefetch,
  useMultipleNormas,
  useNormasPaginated,
  useNormasByCategory,
  useNormasByStatus,
  useNormasSearch,
  useAdvancedStats,
  useIAnalysisHistory,
};
