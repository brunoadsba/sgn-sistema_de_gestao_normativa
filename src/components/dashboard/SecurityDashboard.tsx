'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Lock, Globe, Zap } from 'lucide-react';

interface SecurityConfig {
  environment: string;
  cors: {
    origin: string[];
    methods: string[];
    allowedHeaders: string[];
    credentials: boolean;
  };
  csp: Record<string, string[]>;
  securityHeaders: Record<string, string>;
  isProduction: boolean;
}

interface SecurityStats {
  rateLimit: {
    totalKeys: number;
    activeLimits: number;
    blockedIPs: number;
  };
  security: {
    environment: string;
    corsOrigins: number;
    cspDirectives: number;
    securityHeaders: number;
  };
  timestamp: string;
}

interface SecurityTest {
  cors: {
    allowedOrigins: number;
    methods: number;
    headers: number;
    credentials: boolean;
  };
  csp: {
    directives: number;
    hasDefaultSrc: boolean;
    hasScriptSrc: boolean;
    hasStyleSrc: boolean;
  };
  rateLimit: {
    totalKeys: number;
    activeLimits: number;
    blockedIPs: number;
  };
  headers: {
    totalHeaders: number;
    hasFrameOptions: boolean;
    hasContentTypeOptions: boolean;
    hasXssProtection: boolean;
  };
}

export function SecurityDashboard() {
  const [config, setConfig] = useState<SecurityConfig | null>(null);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [testResults, setTestResults] = useState<SecurityTest | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Buscar configuração de segurança
  const fetchSecurityConfig = async () => {
    try {
      const response = await fetch('/api/security/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data.data.config);
      }
    } catch (error) {
      console.error('Erro ao buscar configuração de segurança:', error);
    }
  };

  // Buscar estatísticas de segurança
  const fetchSecurityStats = async () => {
    try {
      const response = await fetch('/api/security/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas de segurança:', error);
    }
  };

  // Executar teste de segurança
  const runSecurityTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/security/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: 'all' }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResults(data.data.tests);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Erro ao executar teste de segurança:', error);
    } finally {
      setLoading(false);
    }
  };

  // Resetar rate limit
  const resetRateLimit = async (ip: string) => {
    try {
      const response = await fetch('/api/security/rate-limit/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, prefix: 'rate_limit' }),
      });
      
      if (response.ok) {
        await fetchSecurityStats();
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Erro ao resetar rate limit:', error);
    }
  };

  useEffect(() => {
    fetchSecurityConfig();
    fetchSecurityStats();
    const interval = setInterval(() => {
      fetchSecurityStats();
    }, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  const getSecurityScore = () => {
    if (!testResults) return 0;
    
    let score = 0;
    let total = 0;
    
    // CORS Score
    if (testResults.cors) {
      total += 4;
      if (testResults.cors.allowedOrigins > 0) score += 1;
      if (testResults.cors.methods > 0) score += 1;
      if (testResults.cors.headers > 0) score += 1;
      if (testResults.cors.credentials) score += 1;
    }
    
    // CSP Score
    if (testResults.csp) {
      total += 4;
      if (testResults.csp.directives > 0) score += 1;
      if (testResults.csp.hasDefaultSrc) score += 1;
      if (testResults.csp.hasScriptSrc) score += 1;
      if (testResults.csp.hasStyleSrc) score += 1;
    }
    
    // Headers Score
    if (testResults.headers) {
      total += 4;
      if (testResults.headers.totalHeaders > 0) score += 1;
      if (testResults.headers.hasFrameOptions) score += 1;
      if (testResults.headers.hasContentTypeOptions) score += 1;
      if (testResults.headers.hasXssProtection) score += 1;
    }
    
    return total > 0 ? Math.round((score / total) * 100) : 0;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard de Segurança</h2>
          <p className="text-gray-600">Monitoramento e configuração de segurança</p>
        </div>
        <Button 
          onClick={() => {
            fetchSecurityConfig();
            fetchSecurityStats();
            runSecurityTest();
          }}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Security Score */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Score de Segurança
            </CardTitle>
            <CardDescription>
              Avaliação geral das configurações de segurança
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getScoreIcon(getSecurityScore())}
                <Badge className={getScoreColor(getSecurityScore())}>
                  {getSecurityScore()}%
                </Badge>
                <span className="text-sm text-gray-600">
                  {getSecurityScore() >= 90 ? 'Excelente' : 
                   getSecurityScore() >= 70 ? 'Bom' : 'Necessita Melhorias'}
                </span>
              </div>
              <Button onClick={runSecurityTest} disabled={loading} variant="outline">
                Executar Teste
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CORS Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CORS</CardTitle>
            <Globe className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className={config?.cors.origin.length ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {config?.cors.origin.length ? 'Configurado' : 'Não Configurado'}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {config?.cors.origin.length || 0} origens permitidas
            </p>
            {testResults?.cors && (
              <p className="text-xs text-gray-500 mt-1">
                {testResults.cors.methods} métodos, {testResults.cors.headers} headers
              </p>
            )}
          </CardContent>
        </Card>

        {/* CSP Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CSP</CardTitle>
            <Shield className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className={config?.csp ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {config?.csp ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {Object.keys(config?.csp || {}).length} diretivas
            </p>
            {testResults?.csp && (
              <p className="text-xs text-gray-500 mt-1">
                {testResults.csp.directives} configuradas
              </p>
            )}
          </CardContent>
        </Card>

        {/* Rate Limiting Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limiting</CardTitle>
            <Zap className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className={stats?.rateLimit.totalKeys ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {stats?.rateLimit.totalKeys ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {stats?.rateLimit.activeLimits || 0} limites ativos
            </p>
            {stats?.rateLimit.blockedIPs && (
              <p className="text-xs text-red-500 mt-1">
                {stats.rateLimit.blockedIPs} IPs bloqueados
              </p>
            )}
          </CardContent>
        </Card>

        {/* Security Headers Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Headers</CardTitle>
            <Lock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className={config?.securityHeaders ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {config?.securityHeaders ? 'Configurados' : 'Não Configurados'}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {Object.keys(config?.securityHeaders || {}).length} headers
            </p>
            {testResults?.headers && (
              <p className="text-xs text-gray-500 mt-1">
                {testResults.headers.totalHeaders} aplicados
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rate Limiting Management */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento de Rate Limiting</CardTitle>
            <CardDescription>
              Controle de limites de requisições e IPs bloqueados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Total de Chaves</h4>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {stats.rateLimit.totalKeys}
                </p>
                <p className="text-sm text-blue-700 mt-1">Chaves de rate limiting</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900">Limites Ativos</h4>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {stats.rateLimit.activeLimits}
                </p>
                <p className="text-sm text-green-700 mt-1">IPs com limites</p>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-900">IPs Bloqueados</h4>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  {stats.rateLimit.blockedIPs}
                </p>
                <p className="text-sm text-red-700 mt-1">IPs temporariamente bloqueados</p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Resetar Rate Limit</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Digite o IP para resetar"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  id="reset-ip"
                />
                <Button 
                  onClick={() => {
                    const input = document.getElementById('reset-ip') as HTMLInputElement;
                    if (input.value) {
                      resetRateLimit(input.value);
                      input.value = '';
                    }
                  }}
                  variant="outline"
                >
                  Resetar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Environment Info */}
      {config && (
        <Card>
          <CardHeader>
            <CardTitle>Informações do Ambiente</CardTitle>
            <CardDescription>
              Configurações atuais de segurança por ambiente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Ambiente</h4>
                <p className="text-lg font-bold text-gray-600 mt-2">
                  {config.environment}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {config.isProduction ? 'Produção' : 'Desenvolvimento'}
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Última Atualização</h4>
                <p className="text-lg font-bold text-gray-600 mt-2">
                  {lastUpdate.toLocaleTimeString('pt-BR')}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {lastUpdate.toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SecurityDashboard;
