const express = require('express');
const router = express.Router();
const Diario = require('../models/Diario');

// Criar novo diário
router.post('/', async (req, res) => {
  try {
    const {
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
    } = req.body;

    // Validações básicas
    if (!data_registro || !viatura || km_inicial === undefined || km_final === undefined || !condutor) {
      return res.status(400).json({
        error: 'Dados obrigatórios',
        message: 'Data, viatura, KM inicial, KM final e condutor são obrigatórios'
      });
    }

    // Validar KMs
    if (km_final < km_inicial) {
      return res.status(400).json({
        error: 'KM inválido',
        message: 'KM final deve ser maior ou igual ao KM inicial'
      });
    }

    // Validar data
    const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dataRegex.test(data_registro)) {
      return res.status(400).json({
        error: 'Data inválida',
        message: 'Data deve estar no formato YYYY-MM-DD'
      });
    }

    const dadosDiario = {
      usuario_id: 1, // ID padrão para sistema sem autenticação
      data_registro,
      viatura,
      km_inicial: parseInt(km_inicial),
      km_final: parseInt(km_final),
      condutor,
      assistentes: assistentes || [],
      limpeza_ok: Boolean(limpeza_ok),
      cones_quantidade: parseInt(cones_quantidade) || 0,
      observacoes: observacoes || '',
      atividades: atividades || []
    };

    const diario = await Diario.criar(dadosDiario);

    res.status(201).json({
      message: 'Diário criado com sucesso',
      diario
    });
  } catch (error) {
    console.error('Erro ao criar diário:', error);
    res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao criar diário de bordo'
    });
  }
});

// Listar diários do usuário
router.get('/', async (req, res) => {
  try {
    const { limite = 50, pagina = 1 } = req.query;
    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    const diarios = await Diario.listarPorUsuario(
      1, // ID padrão
      parseInt(limite),
      offset
    );

    res.json({
      diarios,
      paginacao: {
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total: diarios.length
      }
    });
  } catch (error) {
    console.error('Erro ao listar diários:', error);
    res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao buscar diários'
    });
  }
});

// Buscar diário por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'ID deve ser um número'
      });
    }

    const diario = await Diario.buscarPorId(parseInt(id));

    if (!diario) {
      return res.status(404).json({
        error: 'Diário não encontrado',
        message: 'Diário não existe ou não pertence ao usuário'
      });
    }

    // Sistema sem autenticação - permitir acesso a todos os diários

    res.json({ diario });
  } catch (error) {
    console.error('Erro ao buscar diário:', error);
    res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao buscar diário'
    });
  }
});

// Buscar diários por período
router.get('/periodo/:inicio/:fim', async (req, res) => {
  try {
    const { inicio, fim } = req.params;

    // Validar formato das datas
    const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dataRegex.test(inicio) || !dataRegex.test(fim)) {
      return res.status(400).json({
        error: 'Data inválida',
        message: 'Datas devem estar no formato YYYY-MM-DD'
      });
    }

    const diarios = await Diario.buscarPorData(1, inicio, fim); // ID padrão

    res.json({
      diarios,
      periodo: { inicio, fim },
      total: diarios.length
    });
  } catch (error) {
    console.error('Erro ao buscar diários por período:', error);
    res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao buscar diários por período'
    });
  }
});

// Atualizar diário
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      viatura,
      km_inicial,
      km_final,
      condutor,
      assistentes,
      limpeza_ok,
      cones_quantidade,
      observacoes
    } = req.body;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'ID deve ser um número'
      });
    }

    // Verificar se o diário existe
    const diarioExistente = await Diario.buscarPorId(parseInt(id));
    if (!diarioExistente) {
      return res.status(404).json({
        error: 'Diário não encontrado',
        message: 'Diário não existe'
      });
    }

    // Validar KMs se fornecidos
    if (km_inicial !== undefined && km_final !== undefined && km_final < km_inicial) {
      return res.status(400).json({
        error: 'KM inválido',
        message: 'KM final deve ser maior ou igual ao KM inicial'
      });
    }

    const dadosAtualizacao = {
      viatura,
      km_inicial: km_inicial !== undefined ? parseInt(km_inicial) : undefined,
      km_final: km_final !== undefined ? parseInt(km_final) : undefined,
      condutor,
      assistentes,
      limpeza_ok: limpeza_ok !== undefined ? Boolean(limpeza_ok) : undefined,
      cones_quantidade: cones_quantidade !== undefined ? parseInt(cones_quantidade) : undefined,
      observacoes
    };

    // Remover campos undefined
    Object.keys(dadosAtualizacao).forEach(key => {
      if (dadosAtualizacao[key] === undefined) {
        delete dadosAtualizacao[key];
      }
    });

    const diarioAtualizado = await Diario.atualizar(parseInt(id), dadosAtualizacao);

    res.json({
      message: 'Diário atualizado com sucesso',
      diario: diarioAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar diário:', error);
    res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao atualizar diário'
    });
  }
});

// Deletar diário
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'ID deve ser um número'
      });
    }

    // Verificar se o diário existe
    const diarioExistente = await Diario.buscarPorId(parseInt(id));
    if (!diarioExistente) {
      return res.status(404).json({
        error: 'Diário não encontrado',
        message: 'Diário não existe'
      });
    }

    const deletado = await Diario.deletar(parseInt(id));

    if (!deletado) {
      return res.status(404).json({
        error: 'Erro ao deletar',
        message: 'Não foi possível deletar o diário'
      });
    }

    res.json({
      message: 'Diário deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar diário:', error);
    res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao deletar diário'
    });
  }
});

// Obter estatísticas do usuário
router.get('/stats/resumo', async (req, res) => {
  try {
    const estatisticas = await Diario.obterEstatisticas(1); // ID padrão

    res.json({
      estatisticas: {
        total_diarios: parseInt(estatisticas.total_diarios) || 0,
        total_km: parseInt(estatisticas.total_km) || 0,
        media_km: parseFloat(estatisticas.media_km) || 0,
        total_viaturas: parseInt(estatisticas.total_viaturas) || 0,
        primeiro_registro: estatisticas.primeiro_registro,
        ultimo_registro: estatisticas.ultimo_registro
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao obter estatísticas'
    });
  }
});

module.exports = router;