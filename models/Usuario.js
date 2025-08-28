const { query } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class Usuario {
  // Criar novo usuário
  static async criar(dadosUsuario) {
    const { nome, email, senha } = dadosUsuario;

    // Verificar se email já existe
    const usuarioExistente = await this.buscarPorEmail(email);
    if (usuarioExistente) {
      throw new Error('Email já cadastrado');
    }

    // Hash da senha
    const saltRounds = 12;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    const result = await query(
      `INSERT INTO usuarios (nome, email, senha_hash)
       VALUES ($1, $2, $3)
       RETURNING id, nome, email, ativo, criado_em`,
      [nome, email, senhaHash]
    );

    return result.rows[0];
  }

  // Buscar usuário por email
  static async buscarPorEmail(email) {
    const result = await query(
      'SELECT * FROM usuarios WHERE email = $1 AND ativo = true',
      [email]
    );

    return result.rows[0] || null;
  }

  // Buscar usuário por ID
  static async buscarPorId(id) {
    const result = await query(
      'SELECT id, nome, email, ativo, criado_em, atualizado_em FROM usuarios WHERE id = $1 AND ativo = true',
      [id]
    );

    return result.rows[0] || null;
  }

  // Autenticar usuário
  static async autenticar(email, senha) {
    const usuario = await this.buscarPorEmail(email);
    if (!usuario) {
      throw new Error('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email,
        nome: usuario.nome 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Retornar dados do usuário sem a senha
    const { senha_hash, ...usuarioSemSenha } = usuario;
    return {
      usuario: usuarioSemSenha,
      token
    };
  }

  // Verificar token JWT
  static async verificarToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const usuario = await this.buscarPorId(decoded.id);
      
      if (!usuario) {
        throw new Error('Usuário não encontrado');
      }

      return usuario;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  // Atualizar perfil do usuário
  static async atualizarPerfil(id, dadosAtualizacao) {
    const { nome, email } = dadosAtualizacao;

    // Verificar se o novo email já existe (se foi alterado)
    if (email) {
      const usuarioAtual = await this.buscarPorId(id);
      if (usuarioAtual.email !== email) {
        const emailExistente = await this.buscarPorEmail(email);
        if (emailExistente) {
          throw new Error('Email já está em uso');
        }
      }
    }

    const result = await query(
      `UPDATE usuarios SET
       nome = COALESCE($2, nome),
       email = COALESCE($3, email),
       atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $1 AND ativo = true
       RETURNING id, nome, email, ativo, criado_em, atualizado_em`,
      [id, nome, email]
    );

    return result.rows[0] || null;
  }

  // Alterar senha
  static async alterarSenha(id, senhaAtual, novaSenha) {
    const usuario = await query(
      'SELECT senha_hash FROM usuarios WHERE id = $1 AND ativo = true',
      [id]
    );

    if (usuario.rows.length === 0) {
      throw new Error('Usuário não encontrado');
    }

    const senhaValida = await bcrypt.compare(senhaAtual, usuario.rows[0].senha_hash);
    if (!senhaValida) {
      throw new Error('Senha atual incorreta');
    }

    const saltRounds = 12;
    const novaSenhaHash = await bcrypt.hash(novaSenha, saltRounds);

    await query(
      `UPDATE usuarios SET
       senha_hash = $2,
       atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id, novaSenhaHash]
    );

    return true;
  }

  // Desativar usuário (soft delete)
  static async desativar(id) {
    const result = await query(
      `UPDATE usuarios SET
       ativo = false,
       atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    return result.rows.length > 0;
  }

  // Listar todos os usuários (admin)
  static async listarTodos(limite = 50, offset = 0) {
    const result = await query(
      `SELECT id, nome, email, ativo, criado_em, atualizado_em
       FROM usuarios
       ORDER BY criado_em DESC
       LIMIT $1 OFFSET $2`,
      [limite, offset]
    );

    return result.rows;
  }
}

module.exports = Usuario;