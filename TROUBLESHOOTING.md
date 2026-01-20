# 🔧 Guia de Troubleshooting

## Problemas Comuns e Soluções

### 1. Erro: "GEMINI_API_KEY não configurada"

**Causa**: Arquivo `.env` não existe ou está incorreto

**Solução**:
```bash
cp .env.example .env
# Edite .env e adicione sua chave
```

Obtenha a chave em: https://aistudio.google.com/app/apikey

---

### 2. Erro: "invalid_client" no Gmail

**Causa**: Credenciais OAuth incorretas

**Solução**:
1. Verifique se copiou corretamente o `client_id` e `client_secret`
2. Certifique-se que não há espaços extras
3. Recrie as credenciais no Google Cloud Console se necessário

---

### 3. Nenhum email encontrado

**Diagnóstico**:
```bash
# Teste manualmente a busca
node -e "console.log(process.env.SENDER_EMAILS)" 
```

**Soluções**:
- Verifique se os emails em `SENDER_EMAILS` estão exatamente como aparecem no Gmail
- Aumente `DAYS_BACK` para 7 ou 30
- Verifique se você realmente recebeu emails desses remetentes
- Teste com um único remetente primeiro

---

### 4. Erro: "Token has been expired or revoked"

**Causa**: Token OAuth expirado

**Solução**:
```bash
rm token.json
npm start
# Refaça autenticação
```

---

### 5. Erro de autenticação: "localhost refused to connect"

**Causa**: Porta 3000 já está em uso

**Solução**:
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Ou altere a porta em `gmail-auth.js`:
```javascript
.listen(3001, () => { // Mudou de 3000 para 3001
```

---

### 6. Rate limit do Gemini

**Sintomas**: Erro "429 Too Many Requests" ou "Quota exceeded"

**Soluções**:
- API gratuita tem limite de requisições por minuto
- O código já inclui delays de 1 segundo entre emails
- Aumente o delay em `gemini-summarizer.js`:
  ```javascript
  await new Promise(resolve => setTimeout(resolve, 2000)); // 2 segundos
  ```
- Considere API paga para volume alto

---

### 7. Resumo muito genérico ou ruim

**Solução**: Personalize o prompt em `gemini-summarizer.js`

```javascript
const prompt = `
Você é um especialista em tecnologia que resume newsletters.

Analise o email e forneça:
1. Resumo executivo (2-3 frases)
2. Principais pontos técnicos
3. Impacto no mercado
4. Ações recomendadas

Email:
${email.body}
`;
```

---

### 8. Email com muito HTML/formatação

**Causa**: Alguns emails vêm com muito código HTML

**Solução**: O código já tenta extrair texto limpo, mas você pode melhorar:

```javascript
// Em gmail-client.js, adicione após stripHtml:
static cleanText(text) {
  return text
    .replace(/\[.*?\]/g, '') // Remove links [texto](url)
    .replace(/_{2,}/g, '') // Remove underscores múltiplos
    .replace(/\s{3,}/g, '\n\n') // Normaliza espaçamentos
    .trim();
}
```

---

### 9. Cron não está executando

**Diagnóstico**:
```bash
# Verifique se o processo está rodando
ps aux | grep node

# Teste o cron pattern
node -e "const cron = require('node-cron'); console.log(cron.validate('0 9 * * *'));"
```

**Soluções**:
- Verifique se o horário está correto para seu timezone
- Teste com padrão mais frequente: `'*/5 * * * *'` (a cada 5 minutos)
- Use `--now` flag para execução imediata: `node cron-job.js --now`

---

### 10. Erro: "MODULE_NOT_FOUND"

**Causa**: Dependências não instaladas

**Solução**:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### 11. Timezone incorreto no cron

**Problema**: Resumo executando no horário errado

**Solução**: Especifique timezone em `cron-job.js`
```javascript
cron.schedule(schedule, () => {
  executeSummary();
}, {
  scheduled: true,
  timezone: "America/Sao_Paulo" // Altere para seu timezone
});
```

Timezones comuns:
- `America/Sao_Paulo` - Brasília
- `America/New_York` - Nova York
- `Europe/London` - Londres
- `Asia/Tokyo` - Tóquio

---

### 12. Performance lenta

**Otimizações**:

1. **Limitar tamanho do corpo do email**:
```javascript
// Em gemini-summarizer.js
${email.body.substring(0, 5000)} // Limita a 5000 caracteres
```

2. **Processar em paralelo** (cuidado com rate limit):
```javascript
const summaries = await Promise.all(
  emails.map(email => this.summarizeEmail(email))
);
```

3. **Cache de resumos**:
```javascript
// Salvar resumos individuais e reusar
const cacheFile = `cache/${email.id}.json`;
```

---

### 13. Gmail API retorna erro 403

**Causa**: Permissões insuficientes ou app não verificado

**Solução**:
1. Adicione seu email como "Test user" no Google Cloud Console
2. OAuth consent screen → Test users → Add
3. Para produção, submeta para verificação do Google

---

### 14. Resumo não salva em arquivo

**Diagnóstico**:
```bash
# Verifique permissões
ls -la resumos/

# Teste escrita manual
echo "teste" > resumos/teste.txt
```

**Solução**:
```bash
mkdir -p resumos
chmod 755 resumos
```

---

### 15. Processo morre após logout SSH

**Problema**: Cron para quando você desconecta do servidor

**Solução**: Use PM2 ou screen
```bash
# Opção 1: PM2
npm install -g pm2
pm2 start cron-job.js
pm2 save
pm2 startup

# Opção 2: screen
screen -S email-summarizer
npm run cron
# Ctrl+A+D para desanexar
```

---

## Logs e Debug

### Habilitar logs detalhados

Crie arquivo `logger.js`:
```javascript
export function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({ timestamp, level, message, ...data }));
}
```

Use:
```javascript
import { log } from './logger.js';
log('INFO', 'Buscando emails', { count: emails.length });
```

### Salvar logs em arquivo

```javascript
import fs from 'fs/promises';

const logFile = 'app.log';
await fs.appendFile(logFile, `${new Date().toISOString()} - ${message}\n`);
```

---

## Testando Componentes Individualmente

### Testar apenas Gmail
```javascript
// test-gmail.js
import { GmailClient } from './gmail-client.js';

const client = new GmailClient();
const emails = await client.getEmailsFromSenders(['test@example.com'], 7);
console.log(emails);
```

### Testar apenas Gemini
```javascript
// test-gemini.js
import { GeminiSummarizer } from './gemini-summarizer.js';

const summarizer = new GeminiSummarizer();
const result = await summarizer.summarizeEmail({
  subject: 'Test',
  from: 'test@test.com',
  body: 'This is a test email body'
});
console.log(result);
```

---

## Contato e Suporte

Se o problema persistir:
1. Verifique issues no GitHub do projeto
2. Consulte documentação oficial:
   - [Gmail API](https://developers.google.com/gmail/api)
   - [Gemini API](https://ai.google.dev/)
   - [node-cron](https://www.npmjs.com/package/node-cron)