import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface SessionPayload {
  uid: string;
  email: string;
  name?: string | null;
  authProvider: 'email';
  exp: number;
}

const TOKEN_PREFIX = 'cf.';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days

let cachedSecret: string | null = null;

function getSessionSecret(): string {
  if (process.env.AUTH_SESSION_SECRET && process.env.AUTH_SESSION_SECRET.length >= 16) {
    return process.env.AUTH_SESSION_SECRET;
  }
  if (cachedSecret) return cachedSecret;

  let seed = 'charteforge-session-v1';
  try {
    const cfgPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(cfgPath)) {
      seed += fs.readFileSync(cfgPath, 'utf8');
    }
  } catch {
    // Ignore read errors
  }
  cachedSecret = crypto.createHash('sha256').update(seed).digest('hex');
  return cachedSecret;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, storedHash: string | null | undefined): boolean {
  if (!storedHash || !storedHash.startsWith('scrypt$')) return false;
  const parts = storedHash.split('$');
  if (parts.length !== 3) return false;
  const [, salt, originalHex] = parts;
  if (!salt || !originalHex) return false;
  try {
    const derived = crypto.scryptSync(password, salt, 64);
    const original = Buffer.from(originalHex, 'hex');
    if (derived.length !== original.length) return false;
    return crypto.timingSafeEqual(derived, original);
  } catch {
    return false;
  }
}

export function createSessionToken(user: {
  uid: string;
  email: string;
  name?: string | null;
}): string {
  const payload: SessionPayload = {
    uid: user.uid,
    email: user.email,
    name: user.name ?? null,
    authProvider: 'email',
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(encodedPayload)
    .digest('base64url');
  return `${TOKEN_PREFIX}${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  if (!token.startsWith(TOKEN_PREFIX)) return null;
  const raw = token.slice(TOKEN_PREFIX.length);
  const dotIndex = raw.indexOf('.');
  if (dotIndex <= 0) return null;

  const encodedPayload = raw.slice(0, dotIndex);
  const signature = raw.slice(dotIndex + 1);
  if (!encodedPayload || !signature) return null;

  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(encodedPayload)
    .digest('base64url');

  const sigBuf = Buffer.from(signature, 'utf8');
  const expBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as SessionPayload;
    if (!decoded.uid || !decoded.email || !decoded.exp) return null;
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendBrevoVerificationEmail(params: {
  toEmail: string;
  toName?: string | null;
  verifyUrl: string;
}): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'Le service Brevo n’est pas encore configuré (clé BREVO_API_KEY absente). Connectez-vous avec Google ou ajoutez BREVO_API_KEY dans les secrets.'
    );
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim() || 'noreply@charteforge.app';
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || 'CharteForge';
  const recipientName = params.toName?.trim() || params.toEmail;

  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
  <body style="margin:0;padding:32px 16px;background:#F8F9FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0F172A;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:10px;overflow:hidden;">
      <tr>
        <td style="padding:28px 32px;border-bottom:1px solid #E2E8F0;background:#0F172A;color:#FFFFFF;">
          <strong style="font-size:18px;letter-spacing:-0.02em;">CharteForge</strong>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <h1 style="margin:0 0 12px 0;font-size:20px;font-weight:700;color:#0F172A;">Confirmez votre adresse e-mail</h1>
          <p style="margin:0 0 18px 0;font-size:14px;line-height:1.6;color:#475569;">
            Bonjour ${escapeHtml(recipientName)},<br/><br/>
            Cliquez sur le bouton ci-dessous pour valider votre adresse e-mail et activer votre espace CharteForge (Studio, sauvegarde et exports PDF).
          </p>
          <p style="margin:24px 0;">
            <a href="${escapeHtml(params.verifyUrl)}" style="display:inline-block;background:#0F172A;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;">
              Valider mon adresse e-mail
            </a>
          </p>
          <p style="margin:0;font-size:12px;line-height:1.5;color:#64748B;">
            Ce lien expire dans 24 heures. Si vous n’êtes pas à l’origine de cette inscription, ignorez cet e-mail.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: params.toEmail, name: recipientName }],
      subject: 'Confirmez votre adresse e-mail — CharteForge',
      htmlContent,
      textContent: `Bonjour ${recipientName},\n\nValidez votre compte CharteForge en ouvrant ce lien (valable 24h) :\n${params.verifyUrl}\n`,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Brevo API error:', res.status, errText);
    throw new Error(
      `L’envoi de l’e-mail via Brevo a échoué (HTTP ${res.status}). Vérifiez BREVO_API_KEY et BREVO_SENDER_EMAIL.`
    );
  }
}
