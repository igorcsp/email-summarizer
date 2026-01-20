import { google } from 'googleapis';
import { GmailAuthenticator } from './gmail-auth.js';

export class GmailClient {
  constructor() {
    this.authenticator = new GmailAuthenticator();
    this.gmail = null;
  }

  async initialize() {
    const auth = await this.authenticator.getAuthenticatedClient();
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  /**
   * Busca emails de remetentes específicos
   * @param {string[]} senderEmails - Array de emails dos remetentes
   * @param {number} daysBack - Quantos dias atrás buscar
   * @returns {Promise<Array>} Array de emails com conteúdo
   */
  async getEmailsFromSenders(senderEmails, daysBack = 1) {
    if (!this.gmail) {
      await this.initialize();
    }

    // Calcula data de corte
    const date = new Date();
    date.setDate(date.getDate() - daysBack);
    const afterDate = date.toISOString().split('T')[0].replace(/-/g, '/');

    // Cria query para buscar emails
    const fromQuery = senderEmails.map(email => `from:${email}`).join(' OR ');
    const query = `(${fromQuery}) after:${afterDate}`;

    console.log(`📧 Buscando emails com query: ${query}`);

    try {
      // Lista mensagens
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 50,
      });

      const messages = response.data.messages || [];
      console.log(`📬 Encontrados ${messages.length} emails`);

      if (messages.length === 0) {
        return [];
      }

      // Busca conteúdo completo de cada email
      const emails = await Promise.all(
        messages.map(message => this.getEmailContent(message.id))
      );

      return emails.filter(email => email !== null);
    } catch (error) {
      console.error('❌ Erro ao buscar emails:', error.message);
      throw error;
    }
  }

  /**
   * Busca conteúdo de um email específico
   * @param {string} messageId - ID da mensagem
   * @returns {Promise<Object>} Objeto com dados do email
   */
  async getEmailContent(messageId) {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      const message = response.data;
      const headers = message.payload.headers;

      // Extrai informações do cabeçalho
      const subject = headers.find(h => h.name === 'Subject')?.value || 'Sem assunto';
      const from = headers.find(h => h.name === 'From')?.value || 'Desconhecido';
      const date = headers.find(h => h.name === 'Date')?.value || '';

      // Extrai corpo do email
      const body = this.extractBody(message.payload);

      return {
        id: messageId,
        subject,
        from,
        date,
        body,
        snippet: message.snippet,
      };
    } catch (error) {
      console.error(`❌ Erro ao buscar email ${messageId}:`, error.message);
      return null;
    }
  }

  /**
   * Extrai corpo do email (texto ou HTML)
   * @param {Object} payload - Payload da mensagem
   * @returns {string} Corpo do email
   */
  extractBody(payload) {
    let body = '';

    if (payload.body && payload.body.data) {
      body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    } else if (payload.parts) {
      // Procura por parte de texto
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body.data) {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          break;
        } else if (part.mimeType === 'text/html' && part.body.data && !body) {
          // Usa HTML se não encontrar texto plano
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.parts) {
          // Recursivo para multipart
          body = this.extractBody(part);
          if (body) break;
        }
      }
    }

    return body;
  }

  /**
   * Limpa HTML tags do conteúdo
   * @param {string} html - String HTML
   * @returns {string} Texto limpo
   */
  static stripHtml(html) {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}