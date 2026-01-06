import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASSWORD,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  trustedOrigins: [process.env.APP_URL!],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp:true,
    autoSignInAfterVerification:true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

      try {
        const info = await transporter.sendMail({
          from: `"MY-PRISMA-APP" <${process.env.APP_USER}>`,
          to: user.email, // Send to the actual user
          subject: "Verify Your Email Address",
          text: `Please verify your email address by clicking this link: ${verificationUrl}`,
          html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">MY-PRISMA-APP</h1>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">Verify Your Email Address</h2>
                    
                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                      Hello${user.name ? ` ${user.name}` : ""},
                    </p>
                    
                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                      Thank you for registering with MY-PRISMA-APP! To complete your registration and access all features, please verify your email address by clicking the button below.
                    </p>
                    
                    <!-- Button -->
                    <table role="presentation" style="margin: 30px 0; width: 100%;">
                      <tr>
                        <td align="center">
                          <a href="${verificationUrl}" 
                             style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                            Verify Email Address
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                      Or copy and paste this link into your browser:
                    </p>
                    
                    <p style="margin: 0 0 20px 0; padding: 12px; background-color: #f8f9fa; border-left: 4px solid #667eea; color: #333333; font-size: 14px; word-break: break-all; border-radius: 4px;">
                      ${verificationUrl}
                    </p>
                    
                    <p style="margin: 20px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                      <strong>Note:</strong> This verification link will expire in 24 hours for security purposes.
                    </p>
                  </td>
                </tr>
                
                <!-- Divider -->
                <tr>
                  <td style="padding: 0 40px;">
                    <div style="border-top: 1px solid #e0e0e0;"></div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px; line-height: 1.6;">
                      If you didn't create an account with MY-PRISMA-APP, you can safely ignore this email.
                    </p>
                    
                    <p style="margin: 0; color: #999999; font-size: 12px;">
                      © 2026 MY-PRISMA-APP. All rights reserved.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
        });
        console.log("Message sent:", info.messageId);

      } catch (error) {
        console.log(error);
        throw error
      }

    },
  },
  
   socialProviders: {
        google: { 
            prompt:"select_account consent",
            accessType:"offline",

            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
});
