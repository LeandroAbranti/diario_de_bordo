# Deploy do Diário de Bordo no Render

Este guia explica como fazer o deploy do backend Node.js com PostgreSQL no Render.

## 1. Preparação do Projeto

### Instalar Dependências
```bash
npm install
```

### Testar Localmente (Opcional)
```bash
# Configurar variáveis de ambiente no .env
npm run dev
```

## 2. Configuração no Render

### 2.1 Criar Banco PostgreSQL

1. Acesse [render.com](https://render.com) e faça login
2. Clique em "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `diario-bordo-db`
   - **Database**: `diario_bordo`
   - **User**: `diario_user`
   - **Region**: escolha a mais próxima
   - **PostgreSQL Version**: 15 (recomendado)
   - **Plan**: Free (para testes)

4. Após criação, anote as informações de conexão:
   - **Internal Database URL**: para conexão do backend
   - **External Database URL**: para administração externa

### 2.2 Criar Web Service

1. No Render, clique em "New +" → "Web Service"
2. Conecte seu repositório GitHub/GitLab
3. Configure:
   - **Name**: `diario-bordo-api`
   - **Environment**: `Node`
   - **Region**: mesma do banco
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 2.3 Configurar Variáveis de Ambiente

No painel do Web Service, vá em "Environment" e adicione:

```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://seu-dominio.com
DB_HOST=seu-host-postgres
DB_PORT=5432
DB_NAME=diario_bordo
DB_USER=diario_user
DB_PASSWORD=sua-senha-postgres
DB_URL=sua-database-url-interna
JWT_SECRET=seu-jwt-secret-super-seguro
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
RENDER_EXTERNAL_URL=https://seu-app.onrender.com
```

**⚠️ Importante**: 
- Use a **Internal Database URL** para `DB_URL`
- Gere um `JWT_SECRET` forte (ex: usando `openssl rand -base64 32`)
- Substitua `seu-dominio.com` pela URL do seu frontend

## 3. Deploy e Inicialização

### 3.1 Deploy Automático
O Render fará deploy automaticamente quando você fizer push para a branch configurada.

### 3.2 Inicializar Banco de Dados
Após o primeiro deploy bem-sucedido:

1. No painel do Web Service, vá em "Shell"
2. Execute o comando de inicialização:
```bash
node scripts/init-db.js
```

### 3.3 Verificar Funcionamento
Acesse as rotas de teste:
- `https://seu-app.onrender.com/health` - Status da API
- `https://seu-app.onrender.com/api/auth/register` - Endpoint de registro

## 4. Configuração do Frontend

No arquivo `diario.html`, atualize a URL da API:

```javascript
// Substituir localhost pela URL do Render
const API_BASE_URL = 'https://seu-app.onrender.com/api';
```

## 5. Monitoramento

### Logs
- Acesse os logs em tempo real no painel do Render
- Use `console.log` para debug (visível nos logs)

### Métricas
- CPU, Memória e Rede disponíveis no dashboard
- Alertas automáticos para falhas

### Backup do Banco
- Render faz backup automático do PostgreSQL
- Para backup manual, use a External Database URL

## 6. Solução de Problemas

### Erro de Conexão com Banco
- Verifique se `DB_URL` está usando a Internal Database URL
- Confirme que o banco PostgreSQL está ativo

### Erro 503 Service Unavailable
- Verifique os logs para erros de inicialização
- Confirme que `PORT=10000` está configurado

### CORS Errors
- Verifique se `FRONTEND_URL` está correto
- Teste com `*` temporariamente para debug

### Rate Limiting
- Ajuste `RATE_LIMIT_MAX_REQUESTS` se necessário
- Monitore logs para requests bloqueados

## 7. Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Inicializar banco local
node scripts/init-db.js

# Verificar sintaxe
npm run lint

# Testes (se implementados)
npm test
```

## 8. Estrutura de URLs

### Backend (Render)
- Base: `https://seu-app.onrender.com`
- Health: `/health`
- Auth: `/api/auth/*`
- Diário: `/api/diario/*`

### Frontend
- Pode ser hospedado em GitHub Pages, Netlify, Vercel, etc.
- Deve apontar para a URL do backend no Render

---

**📝 Notas Importantes:**
- O plano gratuito do Render tem limitações de CPU e pode "dormir" após inatividade
- Para produção, considere planos pagos para melhor performance
- Mantenha sempre backups dos dados importantes
- Use HTTPS em produção (Render fornece automaticamente)