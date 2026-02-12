#!/usr/bin/env node

/**
 * Script para criar dados de exemplo via API
 * Requer que o servidor esteja rodando em localhost:3001
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

async function criarDadosExemplo() {
  console.log('Criando dados de exemplo via API...');
  console.log(`URL base: ${BASE_URL}`);

  try {
    // 1. Criar empresa de demonstração
    console.log('\n1. Criando empresa...');
    const empresaRes = await fetch(`${BASE_URL}/api/demo/criar-empresa`, { method: 'POST' });
    const empresaData = await empresaRes.json();
    
    if (!empresaData.success) {
      console.error('Erro ao criar empresa:', empresaData.error);
      return;
    }
    console.log(`Empresa criada: ${empresaData.data.empresa.nome}`);

    // 2. Criar alertas de exemplo
    console.log('\n2. Criando alertas...');
    const alertasRes = await fetch(`${BASE_URL}/api/demo/criar-alertas-exemplo`, { method: 'POST' });
    const alertasData = await alertasRes.json();
    
    if (alertasData.success) {
      console.log(`${alertasData.alertas?.length || 0} alertas criados`);
    }

    console.log('\nDados de exemplo criados com sucesso!');
    console.log(`Dashboard: ${BASE_URL}${empresaData.data.dashboard_url}`);
    console.log(`Empresa: ${BASE_URL}${empresaData.data.empresa_url}`);

  } catch (error) {
    console.error('Erro:', error.message);
    console.error('Verifique se o servidor está rodando em', BASE_URL);
  }
}

criarDadosExemplo();
