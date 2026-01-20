# 📧 Email Summarizer com Gemini AI

Agente inteligente que lê seus emails de newsletters e notícias e gera resumos automáticos usando Gemini AI.

## 🎯 Funcionalidades

- ✅ Conecta com Gmail API para buscar emails específicos
- ✅ Filtra emails por remetente
- ✅ Resume emails usando Gemini 1.5 AI (Flash ou Pro)
- ✅ Gera resumo consolidado de múltiplos emails
- ✅ Salva resumos em arquivos
- ✅ Execução agendada diária com node-cron
- ✅ Suporte a múltiplos remetentes

> **Nota**: O projeto usa `gemini-1.5-flash` por padrão (rápido e gratuito). Veja `MODELOS-GEMINI.md` para trocar para `gemini-1.5-pro`.

## 🚀 Pré-requisitos

1. **Node.js** (v18 ou superior)
2. **Conta Google** com Gmail
3. **Gemini API Key** (gratuita)
4. **Google Cloud Project** com Gmail API habilitada

## 📋 Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Obter Gemini API Key

1. Acesse [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada

### 3. Configurar Gmail API

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Gmail API**:
   - Menu → APIs & Services → Library
   - Procure por "Gmail API"
   - Clique em "Enable"
4. Crie credenciais OAuth 2.0:
   - Menu → APIs & Services → Credentials
   - Clique em "Create Credentials" → "OAuth client ID"
   - Tipo de aplicativo: "Desktop app"
   - Dê um nome (ex: "Email Summarizer")
   - Clique em "Create"
5. Baixe o JSON de credenciais
6. Copie o `client_id` e `client_secret`

### 4. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e preencha:

```env
# Credenciais do Google Cloud (Gmail API)
GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback

# Gemini API Key
GEMINI_API_KEY=sua_gemini_api_key

# Emails dos remetentes (separados por vírgula)
SENDER_EMAILS=newsletter@exemplo.com,noticias@outro.com

# Quantos dias atrás buscar (padrão: 1)
DAYS_BACK=1
```

## 💻 Uso

### Execução Manual (Teste)

Execute uma vez para testar:

```bash
npm start
```

ou

```bash
node index.js
```

Na primeira execução, você será redirecionado para autenticar com sua conta Google. Depois disso, um token será salvo localmente.

### Execução Agendada (Diária)

Para rodar o resumo diariamente de forma automática:

```bash
npm run cron
```

Por padrão, executa **todos os dias às 9:00 AM**.

#### Executar agora + agendar:

```bash
node cron-job.js --now
```

### Personalizar Horário

Edite o arquivo `cron-job.js` e altere a linha:

```javascript
const schedule = '0 9 * * *'; // 9:00 AM todos os dias
```

**Exemplos de padrões cron:**

```
'0 9 * * *'    - Todos os dias às 9:00
'0 18 * * *'   - Todos os dias às 18:00
'0 9 * * 1-5'  - Segunda a sexta às 9:00
'0 */6 * * *'  - A cada 6 horas
'*/30 * * * *' - A cada 30 minutos
```

## 📁 Estrutura do Projeto

```
email-summarizer/
├── package.json           # Dependências e scripts
├── .env.example          # Exemplo de variáveis de ambiente
├── .env                  # Suas credenciais (não commitar!)
├── README.md             # Este arquivo
├── index.js              # Script principal (execução manual)
├── cron-job.js           # Script com agendamento
├── gmail-auth.js         # Autenticação OAuth do Gmail
├── gmail-client.js       # Cliente para buscar emails
├── gemini-summarizer.js  # Integração com Gemini AI
├── token.json            # Token OAuth salvo (gerado automaticamente)
└── resumos/              # Pasta com resumos salvos
    └── resumo-YYYY-MM-DD.txt
```

## 🔒 Segurança

- **Nunca compartilhe** seu arquivo `.env`
- **Não commite** `token.json` no Git
- As credenciais ficam apenas no seu computador
- Revogue acesso em [Google Account Security](https://myaccount.google.com/permissions) se necessário

## 🛠️ Troubleshooting

### Erro de autenticação

Se você receber erro de autenticação:

1. Deletar `token.json`
2. Executar novamente `npm start`
3. Refazer autenticação no navegador

### Nenhum email encontrado

Verifique:
- Os emails em `SENDER_EMAILS` estão corretos
- O valor de `DAYS_BACK` (talvez aumente para 7)
- Se você realmente recebeu emails desses remetentes

### Rate limit do Gemini

Se você processar muitos emails, pode atingir o limite da API gratuita. O código já inclui delays entre requisições para minimizar isso.

## 📊 Exemplo de Saída

```
🚀 Iniciando Email Summarizer...

⚙️  Configurações:
   Remetentes monitorados: newsletter@exemplo.com
   Buscando emails dos últimos 1 dia(s)

📧 Buscando emails com query: (from:newsletter@exemplo.com) after:2026/01/19
📬 Encontrados 3 emails

📨 Emails encontrados:
   1. As principais notícias de tecnologia
      De: newsletter@exemplo.com
      Data: Mon, 20 Jan 2026 08:00:00

🤖 Gerando resumo com Gemini AI...

================================================================================
📋 RESUMO DOS EMAILS
================================================================================

[Resumo gerado pelo Gemini aparece aqui]

================================================================================

💾 Resumo salvo em: resumo-2026-01-20.txt
```

## 🔄 Próximos Passos

Ideias para expandir o projeto:

- [ ] Enviar resumo por email
- [ ] Integrar com Slack/Telegram
- [ ] Dashboard web para visualizar resumos
- [ ] Análise de sentimento
- [ ] Classificação por tópicos/categorias
- [ ] Suporte a múltiplos idiomas
- [ ] Notificações push

## 📝 Licença

MIT

## 🤝 Contribuindo

Sinta-se à vontade para abrir issues e pull requests!

---

Feito usando Node.js, Gmail API e Gemini AI