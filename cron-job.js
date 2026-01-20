import cron from 'node-cron';
import dotenv from 'dotenv';
import { GmailClient } from './gmail-client.js';
import { GeminiSummarizer } from './gemini-summarizer.js';
import { EmailSender } from './email-sender.js';
import fs from 'fs/promises';

dotenv.config();

/**
 * Função principal que será executada pelo cron
 */
async function executeSummary() {
  const startTime = new Date();
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🕐 Execução iniciada em: ${startTime.toLocaleString('pt-BR')}`);
  console.log('='.repeat(80) + '\n');

  try {
    // Configurações
    const senderEmails = process.env.SENDER_EMAILS.split(',').map(e => e.trim());
    const daysBack = parseInt(process.env.DAYS_BACK || '1', 10);

    // Inicializa clientes
    const gmailClient = new GmailClient();
    const geminiSummarizer = new GeminiSummarizer();

    // Busca emails
    const emails = await gmailClient.getEmailsFromSenders(senderEmails, daysBack);

    if (emails.length === 0) {
      console.log('✅ Nenhum email novo encontrado.');
      return;
    }

    console.log(`📨 Processando ${emails.length} email(s)...`);

    // Gera resumo
    console.log('🤖 Chamando Gemini para gerar resumo...');
    const summary = await geminiSummarizer.summarizeMultipleEmails(emails);
    console.log(`✅ Resumo gerado (${summary.length} caracteres)`);
    
    // Debug: mostra preview do resumo
    console.log('📝 Preview do resumo:');
    console.log(summary.substring(0, 200) + '...');

    // Envia por email
    if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD && process.env.EMAIL_RECIPIENT) {
      console.log('📧 Enviando resumo por email...');
      const emailSender = new EmailSender();
      await emailSender.sendSummary(summary, emails);
    }

    // Salva resultado
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `resumos/resumo-${timestamp}.txt`;
    
    // Cria diretório se não existir
    await fs.mkdir('resumos', { recursive: true });

    const fileContent = `
RESUMO DIÁRIO DE EMAILS
${new Date().toLocaleString('pt-BR')}
${'='.repeat(80)}

${summary}

${'='.repeat(80)}

EMAILS PROCESSADOS: ${emails.length}
${emails.map((email, i) => `
${i + 1}. ${email.subject}
   De: ${email.from}
   Data: ${email.date}
`).join('\n')}
`;

    await fs.writeFile(filename, fileContent);
    
    const endTime = new Date();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`\n✅ Resumo gerado com sucesso!`);
    console.log(`💾 Arquivo salvo: ${filename}`);
    console.log(`⏱️  Tempo de execução: ${duration}s`);
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ Erro durante execução:', error.message);
    console.error(error.stack);
  }
}

/**
 * Configura o agendamento com node-cron
 */
function setupCronJob() {
  console.log('🤖 Email Summarizer - Modo Cron\n');
  console.log('⚙️  Configurações:');
  console.log(`   Remetentes: ${process.env.SENDER_EMAILS}`);
  console.log(`   Período: Últimos ${process.env.DAYS_BACK || 1} dia(s)`);
  
  // Agenda para executar todos os dias às 9:00
  // Formato: segundo minuto hora dia mês dia-da-semana
  const schedule = '0 7 * * *'; // 9:00 AM todos os dias
  
  console.log(`   Agendamento: Diariamente às 9:00 AM`);
  console.log(`   Cron pattern: ${schedule}\n`);
  console.log('🚀 Serviço iniciado! Aguardando próxima execução...');
  console.log('   (Pressione Ctrl+C para parar)\n');

  // Cria o job
  const job = cron.schedule(schedule, () => {
    executeSummary();
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  });

  // Executa imediatamente na primeira vez (opcional)
  const runImmediately = process.argv.includes('--now');
  if (runImmediately) {
    console.log('🏃 Executando imediatamente (flag --now detectada)...\n');
    executeSummary();
  }

  // Mantém o processo rodando
  process.on('SIGINT', () => {
    console.log('\n\n⏹️  Parando serviço...');
    job.stop();
    process.exit(0);
  });
}

// Validação
if (!process.env.GEMINI_API_KEY || !process.env.GOOGLE_CLIENT_ID || !process.env.SENDER_EMAILS) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  console.error('   Verifique seu arquivo .env');
  process.exit(1);
}

// Inicia
setupCronJob();