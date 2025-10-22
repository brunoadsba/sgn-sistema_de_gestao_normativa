'use client';

import { useState, useEffect } from 'react';
import { useHealthCheck, useCacheInvalidation } from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, Zap, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface CacheStats {
  keys: number;
  memory: string;
  connected: boolean;
}

interface HealthData {
  status: string;
  message: string;
  timestamp: string;
  services: {
    database: string;
    api: string;
  };
  performance: {
    duration: string;
  };
}

export function PerformanceDashboard() {
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useHealthCheck();
  const { invalidateNormas, invalidateIA, clearAll } = useCacheInvalidation();

  // Buscar estatísticas do cache
  const fetchCacheStats = async () => {
    try {
      const response = await fetch('/api/cache/stats');
      if (response.ok) {
        const data = await response.json();
        setCacheStats(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas do cache:', error);
    }
  };

  // Limpar cache específico
  const clearCacheByTag = async (tag: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/cache', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'tag', tag }),
      });
      
      if (response.ok) {
        await fetchCacheStats();
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    } finally {
      setLoading(false);
    }
  };

  // Limpar todo o cache
  const clearAllCache = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cache', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'all' }),
      });
      
      if (response.ok) {
        await fetchCacheStats();
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar dados
  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      fetchCacheStats(),
      refetchHealth(),
    ]);
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchCacheStats();
    const interval = setInterval(fetchCacheStats, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
      case 'unhealthy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
      case 'unhealthy':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard de Performance</h2>
          <p className="text-gray-600">Monitoramento em tempo real do sistema</p>
        </div>
        <Button 
          onClick={refreshData} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Health Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
            {healthData && getStatusIcon(healthData.status)}
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(healthData?.status || 'unknown')}>
                {healthData?.status || 'Verificando...'}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {healthData?.message || 'Carregando...'}
            </p>
            {healthData?.performance && (
              <p className="text-xs text-gray-500 mt-1">
                Tempo de resposta: {healthData.performance.duration}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Database Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banco de Dados</CardTitle>
            <Database className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(healthData?.services?.database || 'unknown')}>
                {healthData?.services?.database || 'Verificando...'}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Conexão Supabase
            </p>
          </CardContent>
        </Card>

        {/* Cache Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Redis</CardTitle>
            <Zap className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className={cacheStats?.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {cacheStats?.connected ? 'Conectado' : 'Desconectado'}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {cacheStats ? `${cacheStats.keys} chaves` : 'Carregando...'}
            </p>
            {cacheStats?.memory && (
              <p className="text-xs text-gray-500 mt-1">
                Memória: {cacheStats.memory}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Last Update */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {lastUpdate.toLocaleTimeString('pt-BR')}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              {lastUpdate.toLocaleDateString('pt-BR')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cache Management */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Cache</CardTitle>
          <CardDescription>
            Controle o cache do sistema para otimizar performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => clearCacheByTag('normas')}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Limpar Cache Normas
            </Button>
            
            <Button 
              onClick={() => clearCacheByTag('ia')}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Limpar Cache IA
            </Button>
            
            <Button 
              onClick={clearAllCache}
              disabled={loading}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Limpar Todo Cache
            </Button>
          </div>
          
          {cacheStats && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Estatísticas do Cache</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Chaves:</span>
                  <span className="ml-2 font-medium">{cacheStats.keys}</span>
                </div>
                <div>
                  <span className="text-gray-600">Memória:</span>
                  <span className="ml-2 font-medium">{cacheStats.memory}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2 font-medium">
                    {cacheStats.connected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {healthData && (
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Performance</CardTitle>
            <CardDescription>
              Informações sobre o desempenho do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Tempo de Resposta</h4>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {healthData.performance?.duration || 'N/A'}
                </p>
                <p className="text-sm text-blue-700 mt-1">Health Check</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900">Uptime</h4>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {healthData.status === 'ok' ? '100%' : 'N/A'}
                </p>
                <p className="text-sm text-green-700 mt-1">Disponibilidade</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PerformanceDashboard;
