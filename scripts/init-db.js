const { initializeTables, closePool, executeQuery } = require('../config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Script para inicializar o banco de dados
async function inicializarBanco() {
  console.log('🚀 Iniciando configuração do banco de dados...');
  
  try {
    // Inicializar tabelas
    await initializeTables();
    
    // Criar usuário padrão para sistema sem autenticação
    console.log('👤 Criando usuário padrão...');
    const senhaHash = await bcrypt.hash('sistema123', 10);
    
    await executeQuery(`
        INSERT INTO usuarios (id, nome, email, senha_hash, ativo, criado_em, atualizado_em)
        VALUES (1, 'Sistema Diário', 'sistema@diario.local', $1, true, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
    `, [senhaHash]);
    
    console.log('✅ Banco de dados configurado com sucesso!');
    console.log('👤 Usuário padrão criado (ID: 1)');
    console.log('📋 Tabelas criadas:');
    console.log('   - usuarios (id, nome, email, senha_hash, ativo, criado_em, atualizado_em)');
    console.log('   - diarios (id, usuario_id, data_registro, viatura, km_inicial, km_final, km_rodados, condutor, assistentes, limpeza_ok, cones_quantidade, observacoes, criado_em, atualizado_em)');
    console.log('   - atividades (id, diario_id, descricao, horario_inicio, horario_fim, local, observacoes, criado_em)');
    console.log('📊 Índices criados para otimização de consultas');
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
    process.exit(1);
  } finally {
    await closePool();
    console.log('🔌 Conexões encerradas');
    process.exit(0);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  inicializarBanco();
}

module.exports = { inicializarBanco };