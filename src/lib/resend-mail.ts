import { Resend } from "resend";

let resend: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resend) resend = new Resend(key);
  return resend;
}

function fromAddress(): string {
  return process.env.EMAIL_FROM?.trim() || "AIRedesign <onboarding@resend.dev>";
}

const baseUrl = () =>
  process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "http://localhost:3000";

export async function sendMagicLinkEmail(to: string, signInUrl: string) {
  const client = getResend();
  if (!client) {
    console.warn(
      "[resend] RESEND_API_KEY no configurada; no se envía magic link.",
    );
    return;
  }
  await client.emails.send({
    from: fromAddress(),
    to,
    subject: "Tu enlace para entrar a AIRedesign",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h1 style="font-size:20px;font-weight:600">Accede a tu cuenta</h1>
        <p style="color:#555;line-height:1.6">Haz clic en el botón para iniciar sesión de forma segura. El enlace caduca pronto.</p>
        <p><a href="${signInUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:500">Entrar a AIRedesign</a></p>
        <p style="font-size:12px;color:#888">Si no solicitaste este correo, puedes ignorarlo.</p>
      </div>
    `,
  });
}

export async function sendSubscriptionActiveEmail(
  to: string,
  name?: string | null,
) {
  const client = getResend();
  if (!client) return;
  const greeting = name?.trim() ? `Hola ${name},` : "Hola,";
  await client.emails.send({
    from: fromAddress(),
    to,
    subject: "¡Bienvenido a AIRedesign Plus!",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <p>${greeting}</p>
        <p style="line-height:1.6">Tu suscripción <strong>Plus</strong> ya está activa. Tienes acceso a presupuestos detallados, fichas técnicas en PDF y el acompañamiento completo del equipo.</p>
        <p><a href="${baseUrl()}/cuenta" style="color:#111;font-weight:600">Ir a mi cuenta</a></p>
      </div>
    `,
  });
}

export async function sendProposalDeliveredEmail(
  to: string,
  title: string,
  proposalId: string,
  name?: string | null,
) {
  const client = getResend();
  if (!client) return;
  const greeting = name?.trim() ? `Hola ${name},` : "Hola,";
  const link = `${baseUrl()}/cuenta/solicitudes/${proposalId}`;
  await client.emails.send({
    from: fromAddress(),
    to,
    subject: `Tu propuesta está lista: ${title}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <p>${greeting}</p>
        <p style="line-height:1.6">Hemos actualizado tu solicitud <strong>${title}</strong>. Ya puedes revisar los detalles y descargar la ficha técnica si aplica.</p>
        <p><a href="${link}" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:500">Ver solicitud</a></p>
      </div>
    `,
  });
}
