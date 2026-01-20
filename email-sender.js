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
    // Converte markdown do summary para HTML básico
    const summaryHtml = summary
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')  // **texto** -> <strong>
      .replace(/\n\n/g, '</p><p>')  // Parágrafos
      .replace(/\n/g, '<br>')  // Quebras de linha
      .replace(/^- (.+)$/gm, '<li>$1</li>');  // Listas
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient,
      subject: `📧 Resumo de Emails - ${new Date().toLocaleDateString('pt-BR')}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">📋 Resumo Diário de Emails</h2>
          <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          <p><strong>Total de emails processados:</strong> ${emails.length}</p>
          
          <hr style="border: 1px solid #ddd; margin: 20px 0;">
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #2c3e50;">📝 Resumo:</h3>
            <p>${summaryHtml}</p>
          </div>
          
          <hr style="border: 1px solid #ddd; margin: 20px 0;">
          
          <h3 style="color: #2c3e50;">📨 Emails Processados:</h3>
          <ul style="list-style: none; padding: 0;">
${emails.map(email => `
            <li style="background: #fff; margin-bottom: 10px; padding: 15px; border-left: 4px solid #3498db; border-radius: 3px;">
              <strong style="color: #2c3e50; font-size: 16px;">${email.subject}</strong><br>
              <small style="color: #7f8c8d;">De: ${email.from}</small><br>
              <small style="color: #95a5a6;">Data: ${email.date}</small>
            </li>
`).join('')}
          </ul>
          
          <hr style="border: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #95a5a6; font-size: 12px; text-align: center;">
            Este é um resumo automático gerado por Email Summarizer
          </p>
        </div>
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