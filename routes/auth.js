const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const { verificarAuth, logAuth } = require('../middleware/auth');

// Aplicar log em todas as rotas de auth
router.use(logAuth);

// Registro de novo usuário
router.post('/registro', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Validações básicas
    if (!nome || !email || !senha) {
      return res.status(400).json({
        error: 'Dados obrigatórios',
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({
        error: 'Senha muito curta',
        message: 'A senha deve ter pelo menos 6 caracteres'
      });
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Email inválido',
        message: 'Forneça um email válido'
      });
    }

    const usuario = await Usuario.criar({ nome, email, senha });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    
    if (error.message === 'Email já cadastrado') {
      return res.status(409).json({
        error: 'Email já existe',
        message: 'Este email já está cadastrado'
      });
    }

    res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao criar usuário'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        error: 'Dados obrigatórios',
        message: 'Email e senha são obrigatórios'
      });
    }

    const resultado = await Usuario.autenticar(email, senha);

    res.json({
      message: 'Login realizado com sucesso',
      ...resultado
    });
  } catch (error) {
    console.error('Erro no login:', error);
    
    if (error.message === 'Credenciais inválidas') {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao fazer login'
    });
  }
});

// Verificar token (middleware de verificação)
router.get('/verificar', verificarAuth, (req, res) => {
  res.json({
    message: 'Token válido',
    usuario: req.usuario
  });
});

// Obter perfil do usuário
router.get('/perfil', verificarAuth, (req, res) => {
  res.json({
    usuario: req.usuario
  });
});

// Atualizar perfil
router.put('/perfil', verificarAuth, async (req, res) => {
  try {
    const { nome, email } = req.body;

    if (!nome && !email) {
      return res.status(400).json({
        error: 'Dados obrigatórios',
        message: 'Forneça pelo menos nome ou email para atualizar'
      });
    }

    // Validação de email se fornecido
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Email inválido',
          message: 'Forneça um email válido'
        });
      }
    }

    const usuarioAtualizado = await Usuario.atualizarPerfil(req.usuarioId, { nome, email });

    if (!usuarioAtualizado) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Não foi possível atualizar o perfil'
      });
    }

    res.json({
      message: 'Perfil atualizado com sucesso',
      usuario: usuarioAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    
    if (error.message === 'Email já está em uso') {
      return res.status(409).json({
        error: 'Email já existe',
        message: 'Este email já está sendo usado por outro usuário'
      });
    }

    res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao atualizar perfil'
    });
  }
});

// Alterar senha
router.put('/senha', verificarAuth, async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({
        error: 'Dados obrigatórios',
        message: 'Senha atual e nova senha são obrigatórias'
      });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({
        error: 'Senha muito curta',
        message: 'A nova senha deve ter pelo menos 6 caracteres'
      });
    }

    await Usuario.alterarSenha(req.usuarioId, senhaAtual, novaSenha);

    res.json({
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    
    if (error.message === 'Senha atual incorreta') {
      return res.status(400).json({
        error: 'Senha incorreta',
        message: 'A senha atual está incorreta'
      });
    }

    res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao alterar senha'
    });
  }
});

// Logout (invalidar token - implementação simples)
router.post('/logout', verificarAuth, (req, res) => {
  // Em uma implementação mais robusta, você manteria uma blacklist de tokens
  res.json({
    message: 'Logout realizado com sucesso',
    info: 'Token deve ser removido do cliente'
  });
});

module.exports = router;