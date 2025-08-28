# 🚗 Diário de Bordo - Sistema de Registro de Atividades

Sistema completo para registro de atividades de viaturas de trânsito com backend Node.js, PostgreSQL e frontend integrado.

## 📋 Funcionalidades

### Backend (API REST)
- ✅ Sistema de autenticação com JWT
- ✅ CRUD completo para diários de bordo
- ✅ Registro de atividades detalhadas
- ✅ Validação de dados e segurança
- ✅ Rate limiting e middlewares de proteção
- ✅ Integração com PostgreSQL

### Frontend
- ✅ Interface moderna com gradientes azul marinho/branco
- ✅ Sistema de login/registro de usuários
- ✅ Formulário multi-etapas intuitivo
- ✅ Validação em tempo real
- ✅ Integração completa com API
- ✅ Design responsivo

### Dados Registrados
- 🚗 **Viatura**: Seleção entre viaturas disponíveis
- 👨‍✈️ **Condutor**: Nome do responsável
- 👥 **Assistentes**: Equipe de apoio (opcional)
- 🛣️ **Quilometragem**: Inicial e final com cálculo automático
- 🧽 **Limpeza**: Status da viatura (OK/Não OK)
- 🚧 **Cones**: Quantidade na viatura (0-8)
- 📋 **Atividades**: Lista detalhada com horários, locais e descrições

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 16+ 
- PostgreSQL 12+
- Git

### 1. Clonar o Repositório
```bash
git clone <url-do-repositorio>
cd diario_de_bordo
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` baseado no `.env.example`:

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:8000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=diario_bordo
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_URL=postgresql://usuario:senha@localhost:5432/diario_bordo

# JWT
JWT_SECRET=seu-jwt-secret-super-seguro

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Upload
MAX_FILE_SIZE=5242880
```

### 4. Configurar Banco de Dados
```bash
# Criar banco de dados PostgreSQL
createdb diario_bordo

# Inicializar tabelas
npm run init-db
```

### 5. Executar em Desenvolvimento
```bash
# Backend (API)
npm run dev

# Frontend (em outro terminal)
python3 -m http.server 8000
# ou
npx serve .
```

## 🌐 Deploy no Render

Para fazer deploy em produção, siga o guia detalhado em [`README-DEPLOY.md`](./README-DEPLOY.md).

### Resumo do Deploy:
1. Criar banco PostgreSQL no Render
2. Criar Web Service conectado ao repositório
3. Configurar variáveis de ambiente
4. Deploy automático via Git
5. Inicializar banco com `node scripts/init-db.js`

## 📁 Estrutura do Projeto

```
diario_de_bordo/
├── config/
│   └── database.js          # Configuração do PostgreSQL
├── middleware/
│   └── auth.js              # Middlewares de autenticação
├── models/
│   ├── Usuario.js           # Model de usuários
│   └── Diario.js            # Model de diários
├── routes/
│   ├── auth.js              # Rotas de autenticação
│   └── diario.js            # Rotas do diário
├── scripts/
│   └── init-db.js           # Script de inicialização do DB
├── diario.html              # Frontend original (PDF)
├── diario-api.html          # Frontend integrado com API
├── server.js                # Servidor Express principal
├── package.json             # Dependências e scripts
├── .env                     # Variáveis de ambiente (não commitado)
├── .gitignore              # Arquivos ignorados pelo Git
├── README.md               # Este arquivo
└── README-DEPLOY.md        # Guia de deploy no Render
```

## 🔧 Scripts Disponíveis

```bash
npm start          # Executar em produção
npm run dev        # Executar em desenvolvimento com nodemon
npm run init-db    # Inicializar banco de dados
npm test           # Executar testes (a implementar)
```

## 🔐 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/verify` - Verificar token
- `GET /api/auth/profile` - Obter perfil
- `PUT /api/auth/profile` - Atualizar perfil
- `PUT /api/auth/password` - Alterar senha
- `POST /api/auth/logout` - Fazer logout

### Diário de Bordo
- `GET /api/diario` - Listar diários do usuário
- `POST /api/diario` - Criar novo diário
- `GET /api/diario/:id` - Obter diário específico
- `PUT /api/diario/:id` - Atualizar diário
- `DELETE /api/diario/:id` - Excluir diário
- `GET /api/diario/periodo/:inicio/:fim` - Buscar por período
- `GET /api/diario/estatisticas` - Obter estatísticas

### Sistema
- `GET /health` - Status da API

## 🛡️ Segurança

- **Autenticação JWT**: Tokens seguros com expiração
- **Rate Limiting**: Proteção contra ataques de força bruta
- **Helmet**: Headers de segurança HTTP
- **CORS**: Configuração adequada para frontend
- **Validação**: Sanitização de dados de entrada
- **Hashing**: Senhas criptografadas com bcrypt

## 🎨 Interface

### Características do Design
- **Esquema de Cores**: Branco e azul marinho com gradientes
- **Responsivo**: Adaptável a diferentes tamanhos de tela
- **Animações**: Transições suaves e efeitos hover
- **UX**: Formulário multi-etapas com validação em tempo real
- **Feedback**: Alertas visuais para ações do usuário

### Arquivos de Interface
- `diario.html`: Versão original com geração de PDF
- `diario-api.html`: Versão integrada com backend (recomendada)

## 🔄 Fluxo de Uso

1. **Registro/Login**: Usuário se autentica no sistema
2. **Seleção de Viatura**: Escolhe a viatura a ser utilizada
3. **Dados Iniciais**: Informa condutor, assistentes e KM inicial
4. **Status da Limpeza**: Avalia condição da viatura
5. **Contagem de Cones**: Registra equipamentos disponíveis
6. **Atividades**: Adiciona atividades realizadas com detalhes
7. **Finalização**: Informa KM final e salva no banco de dados
8. **Confirmação**: Sistema confirma salvamento e limpa formulário

## 🐛 Solução de Problemas

### Erro de Conexão com Banco
- Verifique se PostgreSQL está rodando
- Confirme credenciais no arquivo `.env`
- Teste conexão: `psql -h localhost -U usuario -d diario_bordo`

### Erro de CORS
- Verifique `FRONTEND_URL` no `.env`
- Confirme que frontend está na URL correta

### Token JWT Inválido
- Verifique `JWT_SECRET` no `.env`
- Limpe localStorage do navegador
- Faça login novamente

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do servidor
2. Consulte a documentação da API
3. Teste endpoints com Postman/Insomnia
4. Verifique configurações de ambiente

## 🔄 Próximas Funcionalidades

- [ ] Relatórios em PDF via API
- [ ] Dashboard com estatísticas
- [ ] Notificações por email
- [ ] Backup automático
- [ ] API de integração com outros sistemas
- [ ] App mobile

---

**Desenvolvido com ❤️ para otimizar o registro de atividades de trânsito**