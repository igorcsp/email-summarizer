import { google } from 'googleapis';
import fs from 'fs/promises';
import http from 'http';
import url from 'url';
import dotenv from 'dotenv';

dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = './token.json';

export class GmailAuthenticator {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback'
    );
  }

  async getAuthenticatedClient() {
    try {
      // Tenta carregar token salvo
      const token = await fs.readFile(TOKEN_PATH, 'utf-8');
      this.oauth2Client.setCredentials(JSON.parse(token));
      return this.oauth2Client;
    } catch (error) {
      // Se não existir token, faz autenticação
      return await this.authenticate();
    }
  }

  async authenticate() {
    return new Promise((resolve, reject) => {
      const authUrl = this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });

      const server = http.createServer(async (req, res) => {
        try {
          if (req.url.indexOf('/oauth2callback') > -1) {
            const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
            const code = qs.get('code');
            
            res.end('Autenticação bem-sucedida! Você pode fechar esta janela.');
            server.close();

            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);
            
            // Salva o token para uso futuro
            await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
            
            resolve(this.oauth2Client);
          }
        } catch (e) {
          reject(e);
        }
      }).listen(3000, () => {
        console.log('🔐 Por favor, acesse o seguinte URL no seu navegador:');
        console.log(`\n${authUrl}\n`);
      });
    });
  }
}