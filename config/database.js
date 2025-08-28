const { Pool } = require('pg');
require('dotenv').config();

// Configuração do pool de conexões PostgreSQL
// Prioriza POSTGRES_URL do Vercel, depois DATABASE_URL genérica
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Teste de conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao banco PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão com PostgreSQL:', err);
});

// Função para executar queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query executada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Erro na query:', { text, error: error.message });
    throw error;
  }
};

// Função para inicializar as tabelas
const initializeTables = async () => {
  try {
    // Criar tabela de usuários
    await query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        ativo BOOLEAN DEFAULT true,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de diários
    await query(`
      CREATE TABLE IF NOT EXISTS diarios (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        data_registro DATE NOT NULL,
        viatura VARCHAR(100) NOT NULL,
        km_inicial INTEGER NOT NULL,
        km_final INTEGER NOT NULL,
        km_rodados INTEGER GENERATED ALWAYS AS (km_final - km_inicial) STORED,
        condutor VARCHAR(255) NOT NULL,
        assistentes TEXT[],
        limpeza_ok BOOLEAN DEFAULT false,
        cones_quantidade INTEGER DEFAULT 0,
        observacoes TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de atividades
    await query(`
      CREATE TABLE IF NOT EXISTS atividades (
        id SERIAL PRIMARY KEY,
        diario_id INTEGER REFERENCES diarios(id) ON DELETE CASCADE,
        descricao TEXT NOT NULL,
        horario_inicio TIME,
        horario_fim TIME,
        local VARCHAR(255),
        observacoes TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar índices para melhor performance
    await query('CREATE INDEX IF NOT EXISTS idx_diarios_data ON diarios(data_registro)');
    await query('CREATE INDEX IF NOT EXISTS idx_diarios_usuario ON diarios(usuario_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_atividades_diario ON atividades(diario_id)');

    console.log('✅ Tabelas inicializadas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar tabelas:', error);
    throw error;
  }
};

// Função para encerrar conexões
const closePool = async () => {
  try {
    await pool.end();
    console.log('🔌 Pool de conexões encerrado');
  } catch (error) {
    console.error('❌ Erro ao encerrar pool:', error);
  }
};

module.exports = {
  query,
  pool,
  initializeTables,
  closePool
};