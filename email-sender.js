import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export class EmailSender {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });
  }

  async sendSummary(summary, emails, recipient = process.env.EMAIL_RECIPIENT) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient,
      subject: `📧 Resumo de Emails - ${new Date().toLocaleDateString('pt-BR')}`,
      html: `
        <h2>📋 Resumo Diário de Emails</h2>
        <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        <p><strong>Total de emails processados:</strong> ${emails.length}</p>
        
        <hr>
        
        <div style="white-space: pre-wrap; font-family: Arial, sans-serif;">
${summary}
        </div>
        
        <hr>
        
        <h3>📨 Emails Processados:</h3>
        <ul>
${emails.map(email => `
          <li>
            <strong>${email.subject}</strong><br>
            <small>De: ${email.from}</small><br>
            <small>Data: ${email.date}</small>
          </li>
`).join('')}
        </ul>
        
        <hr>
        <p style="color: #666; font-size: 12px;">
          Este é um resumo automático gerado por Email Summarizer
        </p>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email enviado com sucesso!');
      console.log(`   Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error.message);
      return false;
    }
  }
}