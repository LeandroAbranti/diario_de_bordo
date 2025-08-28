const { query } = require('../config/database');

class Diario {
  // Criar novo diário
  static async criar(dadosDiario) {
    const {
      usuario_id,
      data_registro,
      viatura,
      km_inicial,
      km_final,
      condutor,
      assistentes,
      limpeza_ok,
      cones_quantidade,
      observacoes,
      atividades
    } = dadosDiario;

    const client = require('../config/database').pool;
    const clientConnection = await client.connect();

    try {
      await clientConnection.query('BEGIN');

      // Inserir diário
      const diarioResult = await clientConnection.query(
        `INSERT INTO diarios 
         (usuario_id, data_registro, viatura, km_inicial, km_final, condutor, assistentes, limpeza_ok, cones_quantidade, observacoes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [usuario_id, data_registro, viatura, km_inicial, km_final, condutor, assistentes, limpeza_ok, cones_quantidade, observacoes]
      );

      const diario = diarioResult.rows[0];

      // Inserir atividades se existirem
      if (atividades && atividades.length > 0) {
        for (const atividade of atividades) {
          await clientConnection.query(
            `INSERT INTO atividades (diario_id, descricao, horario_inicio, horario_fim, local, observacoes)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [diario.id, atividade.descricao, atividade.horario_inicio, atividade.horario_fim, atividade.local, atividade.observacoes]
          );
        }
      }

      await clientConnection.query('COMMIT');
      return await this.buscarPorId(diario.id);
    } catch (error) {
      await clientConnection.query('ROLLBACK');
      throw error;
    } finally {
      clientConnection.release();
    }
  }

  // Buscar diário por ID com atividades
  static async buscarPorId(id) {
    const diarioResult = await query(
      'SELECT * FROM diarios WHERE id = $1',
      [id]
    );

    if (diarioResult.rows.length === 0) {
      return null;
    }

    const diario = diarioResult.rows[0];

    // Buscar atividades do diário
    const atividadesResult = await query(
      'SELECT * FROM atividades WHERE diario_id = $1 ORDER BY horario_inicio',
      [id]
    );

    diario.atividades = atividadesResult.rows;
    return diario;
  }

  // Listar diários por usuário
  static async listarPorUsuario(usuario_id, limite = 50, offset = 0) {
    const result = await query(
      `SELECT d.*, COUNT(a.id) as total_atividades
       FROM diarios d
       LEFT JOIN atividades a ON d.id = a.diario_id
       WHERE d.usuario_id = $1
       GROUP BY d.id
       ORDER BY d.data_registro DESC, d.criado_em DESC
       LIMIT $2 OFFSET $3`,
      [usuario_id, limite, offset]
    );

    return result.rows;
  }

  // Buscar diários por data
  static async buscarPorData(usuario_id, data_inicio, data_fim) {
    const result = await query(
      `SELECT d.*, COUNT(a.id) as total_atividades
       FROM diarios d
       LEFT JOIN atividades a ON d.id = a.diario_id
       WHERE d.usuario_id = $1 AND d.data_registro BETWEEN $2 AND $3
       GROUP BY d.id
       ORDER BY d.data_registro DESC`,
      [usuario_id, data_inicio, data_fim]
    );

    return result.rows;
  }

  // Atualizar diário
  static async atualizar(id, dadosAtualizacao) {
    const {
      viatura,
      km_inicial,
      km_final,
      condutor,
      assistentes,
      limpeza_ok,
      cones_quantidade,
      observacoes
    } = dadosAtualizacao;

    const result = await query(
      `UPDATE diarios SET
       viatura = $2,
       km_inicial = $3,
       km_final = $4,
       condutor = $5,
       assistentes = $6,
       limpeza_ok = $7,
       cones_quantidade = $8,
       observacoes = $9,
       atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, viatura, km_inicial, km_final, condutor, assistentes, limpeza_ok, cones_quantidade, observacoes]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return await this.buscarPorId(id);
  }

  // Deletar diário
  static async deletar(id) {
    const result = await query(
      'DELETE FROM diarios WHERE id = $1 RETURNING *',
      [id]
    );

    return result.rows.length > 0;
  }

  // Estatísticas do usuário
  static async obterEstatisticas(usuario_id) {
    const result = await query(
      `SELECT 
         COUNT(*) as total_diarios,
         SUM(km_rodados) as total_km,
         AVG(km_rodados) as media_km,
         COUNT(DISTINCT viatura) as total_viaturas,
         MIN(data_registro) as primeiro_registro,
         MAX(data_registro) as ultimo_registro
       FROM diarios 
       WHERE usuario_id = $1`,
      [usuario_id]
    );

    return result.rows[0];
  }
}

module.exports = Diario;