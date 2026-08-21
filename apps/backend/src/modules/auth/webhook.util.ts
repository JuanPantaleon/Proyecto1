import { createHmac, timingSafeEqual } from 'crypto';
import { UnauthorizedException } from '@nestjs/common';

/**
 * Verifica la firma Svix de un webhook de Clerk SIN dependencias externas.
 * - Decodifica la clave (formato `whsec_<base64>`).
 * - Reconstruye el mensaje firmado: `${svixId}.${svixTimestamp}.${rawBody}`.
 * - Compara el HMAC-SHA256 con las firmas provistas (comparación constante).
 * - Rechaza si la cabecera de firma falta o está fuera de la ventana de 5 min.
 */
export function verifyClerkWebhook(
  rawBody: Buffer | string,
  headers: Record<string, any>,
  secret: string,
): void {
  const svixId = headers['svix-id'] as string | undefined;
  const svixTimestamp = headers['svix-timestamp'] as string | undefined;
  const svixSignature = headers['svix-signature'] as string | undefined;

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new UnauthorizedException('Faltan cabeceras de firma del webhook');
  }

  const rawKey = secret.startsWith('whsec_') ? secret.slice(6) : secret;
  const key = Buffer.from(rawKey, 'base64');

  const bodyStr = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;
  const signedContent = `${svixId}.${svixTimestamp}.${bodyStr}`;
  const expected = createHmac('sha256', key).update(signedContent).digest('hex');

  const provided = svixSignature
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.includes('=') ? s.split('=')[1] : s));

  const valid = provided.some((sig) => {
    if (sig.length !== expected.length) return false;
    try {
      return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    } catch {
      return false;
    }
  });

  if (!valid) throw new UnauthorizedException('Firma del webhook inválida');

  const now = Math.floor(Date.now() / 1000);
  const ts = Number(svixTimestamp);
  if (!Number.isFinite(ts) || Math.abs(now - ts) > 300) {
    throw new UnauthorizedException('Webhook fuera de la ventana de tiempo permitida');
  }
}
