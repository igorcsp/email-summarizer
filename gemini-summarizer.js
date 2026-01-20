import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export class GeminiSummarizer {
  constructor(apiKey = process.env.GEMINI_API_KEY) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Usando Gemini 1.5 Flash (rápido e eficiente)
    // Alternativa: 'gemini-1.5-pro' para resultados ainda melhores
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
  }

  /**
   * Resume um único email
   * @param {Object} email - Objeto do email
   * @returns {Promise<string>} Resumo do email
   */
  async summarizeEmail(email) {
    const prompt = `
Você é um assistente que resume emails de newsletters e notícias.

Analise o seguinte email e forneça um resumo conciso e informativo em português:

**Assunto:** ${email.subject}
**De:** ${email.from}
**Data:** ${email.date}

**Conteúdo:**
${email.body.substring(0, 10000)} 

Por favor, forneça:
1. Um resumo dos principais pontos em 3-5 frases
2. Liste os tópicos mais importantes mencionados

Mantenha o resumo objetivo e focado nas informações relevantes.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text || text.trim().length === 0) {
        console.warn('⚠️  Gemini retornou resposta vazia');
        return `Resumo não disponível para: ${email.subject}`;
      }
      
      return text;
    } catch (error) {
      console.error('❌ Erro ao resumir com Gemini:', error.message);
      if (error.message.includes('SAFETY')) {
        return `Erro: Conteúdo bloqueado por filtros de segurança para ${email.subject}`;
      }
      return `Erro ao gerar resumo para ${email.subject}: ${error.message}`;
    }
  }

  /**
   * Resume múltiplos emails e cria um resumo consolidado
   * @param {Array} emails - Array de emails
   * @returns {Promise<string>} Resumo consolidado
   */
  async summarizeMultipleEmails(emails) {
    if (emails.length === 0) {
      return 'Nenhum email encontrado para resumir.';
    }

    console.log(`🤖 Gerando resumo de ${emails.length} email(s)...`);

    // Se for apenas um email, resume diretamente
    if (emails.length === 1) {
      return await this.summarizeEmail(emails[0]);
    }

    // Para múltiplos emails, cria um resumo consolidado
    const emailSummaries = [];
    
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      console.log(`   Processando ${i + 1}/${emails.length}: ${email.subject}`);
      
      const summary = await this.summarizeEmail(email);
      emailSummaries.push({
        subject: email.subject,
        from: email.from,
        summary: summary
      });
      
      // Pequeno delay para evitar rate limiting
      if (i < emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Cria resumo final consolidado
    const consolidatedPrompt = `
Você recebeu os seguintes resumos de emails de newsletters/notícias:

${emailSummaries.map((item, index) => `
**Email ${index + 1}: ${item.subject}**
De: ${item.from}
${item.summary}
`).join('\n---\n')}

Por favor, crie um resumo executivo consolidado em português que:
1. Agrupe os tópicos relacionados
2. Destaque as notícias/informações mais importantes
3. Seja conciso e fácil de ler
4. Mantenha a estrutura organizada

Formato sugerido:
- Principais destaques do dia
- Tópicos por categoria (se aplicável)
- Observações finais
`;

    try {
      const result = await this.model.generateContent(consolidatedPrompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text || text.trim().length === 0) {
        console.warn('⚠️  Gemini retornou resumo consolidado vazio, usando resumos individuais');
        return emailSummaries.map((item, i) => 
          `**${i + 1}. ${item.subject}**\n${item.summary}`
        ).join('\n\n---\n\n');
      }
      
      return text;
    } catch (error) {
      console.error('❌ Erro ao gerar resumo consolidado:', error.message);
      // Retorna resumos individuais em caso de erro
      return emailSummaries.map((item, i) => 
        `**${i + 1}. ${item.subject}**\n${item.summary}`
      ).join('\n\n---\n\n');
    }
  }
}