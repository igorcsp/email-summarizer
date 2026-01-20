# 📖 Exemplo de Uso

## Cenário de Exemplo

Imagine que você recebe diariamente newsletters de:
- **TechCrunch** (tech@techcrunch.com)
- **The Verge** (newsletter@theverge.com)  
- **Hacker News Digest** (noreply@hndigest.com)

## Configuração no .env

```env
SENDER_EMAILS=tech@techcrunch.com,newsletter@theverge.com,noreply@hndigest.com
DAYS_BACK=1
GEMINI_API_KEY=AIza...
GOOGLE_CLIENT_ID=123...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
```

## Exemplo de Execução

```bash
$ npm start

🚀 Iniciando Email Summarizer...

⚙️  Configurações:
   Remetentes monitorados: tech@techcrunch.com, newsletter@theverge.com, noreply@hndigest.com
   Buscando emails dos últimos 1 dia(s)

📥 Conectando ao Gmail...
📧 Buscando emails com query: (from:tech@techcrunch.com OR from:newsletter@theverge.com OR from:noreply@hndigest.com) after:2026/01/19
📬 Encontrados 5 emails

📨 Emails encontrados:
   1. Google announces major AI breakthrough
      De: tech@techcrunch.com
      Data: Mon, 20 Jan 2026 07:30:00

   2. Apple Vision Pro 2 leaked specs
      De: newsletter@theverge.com
      Data: Mon, 20 Jan 2026 08:15:00

   3. Top HN posts: Rust 2.0, WebGPU, and more
      De: noreply@hndigest.com
      Data: Mon, 20 Jan 2026 06:00:00

   4. Meta's new VR headset hits the market
      De: tech@techcrunch.com
      Data: Mon, 20 Jan 2026 09:00:00

   5. Microsoft's AI chip threatens NVIDIA
      De: newsletter@theverge.com
      Data: Mon, 20 Jan 2026 10:30:00

🤖 Gerando resumo com Gemini AI...
   Processando 1/5: Google announces major AI breakthrough
   Processando 2/5: Apple Vision Pro 2 leaked specs
   Processando 3/5: Top HN posts: Rust 2.0, WebGPU, and more
   Processando 4/5: Meta's new VR headset hits the market
   Processando 5/5: Microsoft's AI chip threatens NVIDIA

================================================================================
📋 RESUMO DOS EMAILS
================================================================================

PRINCIPAIS DESTAQUES DO DIA

🤖 Inteligência Artificial
- Google anuncia avanço significativo em modelos de linguagem, com novo 
  modelo superando GPT-4 em benchmarks de raciocínio
- Microsoft desenvolve chip de IA próprio que pode competir com a NVIDIA, 
  reduzindo custos de infraestrutura

🥽 Realidade Virtual/Aumentada  
- Apple Vision Pro 2 vazado com especificações: tela 4K por olho, bateria 
  de 4 horas, preço reduzido para $2,999
- Meta lança novo headset Quest 4 focado em produtividade profissional

💻 Desenvolvimento
- Rust 2.0 em desenvolvimento com mudanças na sintaxe e melhorias de 
  performance
- WebGPU ganha tração como padrão para gráficos 3D na web

OBSERVAÇÕES FINAIS
Dia marcado por competição acirrada em IA e hardware. Destaque para a 
entrada da Microsoft no mercado de chips de IA, potencialmente disruptiva 
para a dominância da NVIDIA.

================================================================================

💾 Resumo salvo em: resumo-2026-01-20T11-45-30-123Z.txt
```

## Exemplo de Saída Salva

O arquivo `resumo-2026-01-20T11-45-30-123Z.txt` conteria:

```
RESUMO DE EMAILS - 20/01/2026 11:45:30
================================================================================

CONFIGURAÇÃO:
- Remetentes: tech@techcrunch.com, newsletter@theverge.com, noreply@hndigest.com
- Período: Últimos 1 dia(s)
- Total de emails: 5

================================================================================

[Resumo completo do Gemini aqui]

================================================================================

EMAILS PROCESSADOS:

1. Google announces major AI breakthrough
   De: tech@techcrunch.com
   Data: Mon, 20 Jan 2026 07:30:00

2. Apple Vision Pro 2 leaked specs
   De: newsletter@theverge.com
   Data: Mon, 20 Jan 2026 08:15:00

[... restante dos emails]
```

## Execução Agendada

```bash
$ npm run cron

🤖 Email Summarizer - Modo Cron

⚙️  Configurações:
   Remetentes: tech@techcrunch.com, newsletter@theverge.com, noreply@hndigest.com
   Período: Últimos 1 dia(s)
   Agendamento: Diariamente às 9:00 AM
   Cron pattern: 0 9 * * *

🚀 Serviço iniciado! Aguardando próxima execução...
   (Pressione Ctrl+C para parar)

[Às 9:00 AM todos os dias, o resumo será gerado automaticamente]
```

## Casos de Uso Avançados

### 1. Resumo Semanal (Segunda-feira às 9h)

Edite `cron-job.js`:
```javascript
const schedule = '0 9 * * 1'; // Segunda-feira às 9:00
```

E no `.env`:
```env
DAYS_BACK=7
```

### 2. Múltiplas Execuções Diárias

```javascript
const schedule = '0 9,18 * * *'; // 9:00 e 18:00
```

### 3. Executar em Servidor

Use PM2 para manter rodando:
```bash
npm install -g pm2
pm2 start cron-job.js --name email-summarizer
pm2 save
pm2 startup
```

## Dicas

- **Teste primeiro**: Sempre execute `npm start` manualmente antes de agendar
- **Monitore logs**: Verifique os arquivos salvos em `resumos/`
- **Ajuste prompts**: Edite `gemini-summarizer.js` para personalizar os resumos
- **Rate limits**: API gratuita do Gemini tem limites; use delays entre requisições