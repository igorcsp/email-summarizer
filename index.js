import dotenv from 'dotenv';
import { GmailClient } from './gmail-client.js';
import { GeminiSummarizer } from './gemini-summarizer.js';
import { EmailSender } from './email-sender.js';

dotenv.config();

async function main() {
  console.log('🚀 Iniciando Email Summarizer...\n');

  // Validação de variáveis de ambiente
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY não configurada no arquivo .env');
    process.exit(1);
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('❌ Credenciais do Google não configuradas no arquivo .env');
    console.error('   Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET');
    process.exit(1);
  }

  if (!process.env.SENDER_EMAILS) {
    console.error('❌ SENDER_EMAILS não configurado no arquivo .env');
    console.error('   Exemplo: SENDER_EMAILS=newsletter@exemplo.com,noticias@outro.com');
    process.exit(1);
  }

  // Configurações
  const senderEmails = process.env.SENDER_EMAILS.split(',').map(e => e.trim());
  const daysBack = parseInt(process.env.DAYS_BACK || '1', 10);

  console.log('⚙️  Configurações:');
  console.log(`   Remetentes monitorados: ${senderEmails.join(', ')}`);
  console.log(`   Buscando emails dos últimos ${daysBack} dia(s)\n`);

  try {
    // Inicializa clientes
    const gmailClient = new GmailClient();
    const geminiSummarizer = new GeminiSummarizer();

    // Busca emails
    console.log('📥 Conectando ao Gmail...');
    const emails = await gmailClient.getEmailsFromSenders(senderEmails, daysBack);

    if (emails.length === 0) {
      console.log('\n✅ Nenhum email novo encontrado.');
      return;
    }

    console.log(`\n📨 Emails encontrados:`);
    emails.forEach((email, index) => {
      console.log(`   ${index + 1}. ${email.subject}`);
      console.log(`      De: ${email.from}`);
      console.log(`      Data: ${email.date}\n`);
    });

    // Gera resumo
    console.log('🤖 Gerando resumo com Gemini AI...\n');
    const summary = await geminiSummarizer.summarizeMultipleEmails(emails);

    // Exibe resultado
    console.log('\n' + '='.repeat(80));
    console.log('📋 RESUMO DOS EMAILS');
    console.log('='.repeat(80) + '\n');
    console.log(summary);
    console.log('\n' + '='.repeat(80));

    // Envia por email
    if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD && process.env.EMAIL_RECIPIENT) {
      console.log('\n📧 Enviando resumo por email...');
      const emailSender = new EmailSender();
      await emailSender.sendSummary(summary, emails);
    } else {
      console.log('\n⚠️  Envio de email não configurado (verifique .env)');
    }

    // Salva em arquivo
    const fs = await import('fs/promises');
    
    // Cria diretório resumos se não existir
    await fs.mkdir('resumos', { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `resumos/resumo-${timestamp}.txt`;
    
    const fileContent = `
RESUMO DE EMAILS - ${new Date().toLocaleString('pt-BR')}
${'='.repeat(80)}

CONFIGURAÇÃO:
- Remetentes: ${senderEmails.join(', ')}
- Período: Últimos ${daysBack} dia(s)
- Total de emails: ${emails.length}

${'='.repeat(80)}

${summary}

${'='.repeat(80)}

EMAILS PROCESSADOS:
${emails.map((email, i) => `
${i + 1}. ${email.subject}
   De: ${email.from}
   Data: ${email.date}
`).join('\n')}
`;

    await fs.writeFile(filename, fileContent);
    console.log(`\n💾 Resumo salvo em: ${filename}`);

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Executa
main();