const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Middleware para verificar autenticação
const verificarAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Token de acesso requerido',
        message: 'Forneça um token no header Authorization'
      });
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Token não fornecido corretamente'
      });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário no banco
    const usuario = await Usuario.buscarPorId(decoded.id);
    
    if (!usuario) {
      return res.status(401).json({
        error: 'Usuário não encontrado',
        message: 'Token válido mas usuário não existe'
      });
    }

    // Adicionar dados do usuário à requisição
    req.usuario = usuario;
    req.usuarioId = usuario.id;
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Token malformado ou inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'Faça login novamente'
      });
    }

    return res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao verificar autenticação'
    });
  }
};

// Middleware opcional de autenticação (não bloqueia se não houver token)
const verificarAuthOpcional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.buscarPorId(decoded.id);
    
    if (usuario) {
      req.usuario = usuario;
      req.usuarioId = usuario.id;
    }
    
    next();
  } catch (error) {
    // Em caso de erro, continua sem autenticação
    next();
  }
};

// Middleware para verificar se é admin (exemplo futuro)
const verificarAdmin = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      error: 'Não autenticado',
      message: 'Faça login primeiro'
    });
  }

  // Aqui você pode adicionar lógica para verificar se é admin
  // Por exemplo, verificar um campo 'role' no usuário
  if (req.usuario.role !== 'admin') {
    return res.status(403).json({
      error: 'Acesso negado',
      message: 'Apenas administradores podem acessar este recurso'
    });
  }

  next();
};

// Middleware para validar dados de entrada
const validarDados = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: error.details[0].message,
        details: error.details
      });
    }
    
    next();
  };
};

// Middleware para log de requisições autenticadas
const logAuth = (req, res, next) => {
  if (req.usuario) {
    console.log(`🔐 Usuário autenticado: ${req.usuario.email} - ${req.method} ${req.path}`);
  }
  next();
};

module.exports = {
  verificarAuth,
  verificarAuthOpcional,
  verificarAdmin,
  validarDados,
  logAuth
};