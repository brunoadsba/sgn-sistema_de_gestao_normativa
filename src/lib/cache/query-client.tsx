"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';

// Configuração do React Query
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Tempo de cache padrão
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
      
      // Retry configuration
      retry: (failureCount, error) => {
        // Não retry para erros 4xx (client errors)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as Record<string, unknown>).status;
          if (typeof status === 'number' && status >= 400 && status < 500) {
            return false;
          }
        }
        // Retry até 3 vezes para outros erros
        return failureCount < 3;
      },
      
      // Retry delay com backoff exponencial
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch configuration
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      
      // Network mode
      networkMode: 'online',
    },
    mutations: {
      // Retry mutations apenas uma vez
      retry: 1,
      
      // Retry delay para mutations
      retryDelay: 1000,
    },
  },
});

// Provider do React Query
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}

// Query keys factory
export const queryKeys = {
  // Normas
  normas: {
    all: ['normas'] as const,
    lists: () => [...queryKeys.normas.all, 'list'] as const,
    list: (filters: Record<string, string>) => [...queryKeys.normas.lists(), filters] as const,
    details: () => [...queryKeys.normas.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.normas.details(), id] as const,
    stats: () => [...queryKeys.normas.all, 'stats'] as const,
  },
  
  // IA Analysis
  ia: {
    all: ['ia'] as const,
    analysis: (empresaId: string) => [...queryKeys.ia.all, 'analysis', empresaId] as const,
    results: () => [...queryKeys.ia.all, 'results'] as const,
    result: (id: string) => [...queryKeys.ia.results(), id] as const,
  },
  
  // Health
  health: {
    all: ['health'] as const,
    check: () => [...queryKeys.health.all, 'check'] as const,
  },
  
  // User
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    session: () => [...queryKeys.user.all, 'session'] as const,
  },
} as const;

// Query options factory
export const queryOptions = {
  // Normas queries
  normas: {
    list: (filters: Record<string, string> = {}) => ({
      queryKey: queryKeys.normas.list(filters),
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
    }),
    
    detail: (id: string) => ({
      queryKey: queryKeys.normas.detail(id),
      staleTime: 10 * 60 * 1000, // 10 minutos
      gcTime: 30 * 60 * 1000, // 30 minutos
    }),
    
    stats: () => ({
      queryKey: queryKeys.normas.stats(),
      staleTime: 2 * 60 * 1000, // 2 minutos
      gcTime: 5 * 60 * 1000, // 5 minutos
    }),
  },
  
  // IA queries
  ia: {
    analysis: (empresaId: string) => ({
      queryKey: queryKeys.ia.analysis(empresaId),
      staleTime: 30 * 60 * 1000, // 30 minutos
      gcTime: 60 * 60 * 1000, // 1 hora
    }),
    
    result: (id: string) => ({
      queryKey: queryKeys.ia.result(id),
      staleTime: 60 * 60 * 1000, // 1 hora
      gcTime: 24 * 60 * 60 * 1000, // 24 horas
    }),
  },
  
  // Health queries
  health: {
    check: () => ({
      queryKey: queryKeys.health.check(),
      staleTime: 30 * 1000, // 30 segundos
      gcTime: 60 * 1000, // 1 minuto
      refetchInterval: 60 * 1000, // Refetch a cada minuto
    }),
  },
} as const;

// Mutation options factory
export const mutationOptions = {
  // IA Analysis mutation
  iaAnalysis: {
    onSuccess: (data: unknown) => {
      console.log('Análise de IA concluída:', data);
    },
    onError: (error: Error) => {
      console.error('Erro na análise de IA:', error);
    },
  },
  
  // Generic mutation options
  generic: {
    onError: (error: Error) => {
      console.error('Erro na mutation:', error);
    },
  },
} as const;

// Cache invalidation helpers
export const cacheUtils = {
  // Invalidate normas cache
  invalidateNormas: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.normas.all });
  },
  
  // Invalidate specific norma
  invalidateNorma: (queryClient: QueryClient, id: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.normas.detail(id) });
  },
  
  // Invalidate IA cache
  invalidateIA: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.ia.all });
  },
  
  // Invalidate specific IA analysis
  invalidateIAAnalysis: (queryClient: QueryClient, empresaId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.ia.analysis(empresaId) });
  },
  
  // Clear all cache
  clearAll: (queryClient: QueryClient) => {
    queryClient.clear();
  },
  
  // Prefetch normas list
  prefetchNormas: async (queryClient: QueryClient, filters: Record<string, string> = {}) => {
    await queryClient.prefetchQuery({
      ...queryOptions.normas.list(filters),
      queryFn: async () => {
        const response = await fetch(`/api/normas?${new URLSearchParams(filters)}`);
        if (!response.ok) throw new Error('Failed to fetch normas');
        return response.json();
      },
    });
  },
  
  // Prefetch norma detail
  prefetchNormaDetail: async (queryClient: QueryClient, id: string) => {
    await queryClient.prefetchQuery({
      ...queryOptions.normas.detail(id),
      queryFn: async () => {
        const response = await fetch(`/api/normas/${id}`);
        if (!response.ok) throw new Error('Failed to fetch norma detail');
        return response.json();
      },
    });
  },
} as const;

// Error handling utilities
export const errorUtils = {
  // Check if error is network error
  isNetworkError: (error: unknown): boolean => {
    return error instanceof Error && (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('timeout')
    );
  },
  
  // Check if error is 4xx client error
  isClientError: (error: unknown): boolean => {
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as Record<string, unknown>).status;
      return typeof status === 'number' && status >= 400 && status < 500;
    }
    return false;
  },
  
  // Check if error is 5xx server error
  isServerError: (error: unknown): boolean => {
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as Record<string, unknown>).status;
      return typeof status === 'number' && status >= 500;
    }
    return false;
  },
  
  // Get error message
  getErrorMessage: (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Erro desconhecido';
  },
} as const;

export default createQueryClient;
