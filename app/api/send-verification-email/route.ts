import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { email, verificationLink, userName } = await request.json();

    // Configuração do transporte de email (exemplo com Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "lidermadeirasgravatai@gmail.com", // seu email
        pass: "lsnr xtig loec qmcf", // sua senha de app do Gmail
      },
    });

    if (!email || !verificationLink || !userName) {
      return NextResponse.json(
        { error: "Dados obrigatórios não fornecidos" },
        { status: 400 }
      );
    }

    // Template do email
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificação de Email</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #4F46E5;
          }
          .content {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #4F46E5;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #4338CA;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
          .warning {
            background-color: #FEF3C7;
            border: 1px solid #F59E0B;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Sua Empresa</div>
          </div>
          
          <div class="content">
            <h2>Olá, ${userName}!</h2>
            
            <p>Obrigado por se cadastrar! Para completar seu registro e ativar sua conta, você precisa verificar seu endereço de email.</p>
            
            <p>Clique no botão abaixo para verificar seu email:</p>
            
            <div style="text-align: center;text-color: white;">
              <a href="${verificationLink}" class="button">Verificar Email</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong> Este link expira em 24 horas. Se você não conseguir clicar no botão, copie e cole o link abaixo no seu navegador:
            </div>
            
            <p style="word-break: break-all; font-size: 12px; color: #666;">
              ${verificationLink}
            </p>
            
            <p>Se você não criou uma conta conosco, pode ignorar este email.</p>
            
            <p>Atenciosamente,<br>Equipe Sua Empresa</p>
          </div>
          
          <div class="footer">
            <p>Este é um email automático, não responda a esta mensagem.</p>
            <p>© 2025 Sua Empresa. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Opções do email
    const mailOptions = {
      from: {
        name: "Lider Madeiras",
        address: "Lider Madeiras <lidermadeirasgravatai@gmail.com>",
      },
      to: email,
      subject: "Verificação de Email - Sua Empresa",
      html: htmlTemplate,
      // Versão em texto simples para clientes que não suportam HTML
      text: `
        Olá, ${userName}!
        
        Obrigado por se cadastrar! Para completar seu registro e ativar sua conta, você precisa verificar seu endereço de email.
        
        Clique no link abaixo para verificar seu email:
        ${verificationLink}
        
        Este link expira em 24 horas.
        
        Se você não criou uma conta conosco, pode ignorar este email.
        
        Atenciosamente,
        Equipe Sua Empresa
      `,
    };

    // Enviar email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return NextResponse.json(
      { error: "Erro ao enviar email de verificação" },
      { status: 500 }
    );
  }
}
