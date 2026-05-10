import { type OnAfterSignupHook } from 'wasp/server/auth'

/**
 * Auto-verifica el email del usuario apenas se registra, sin necesidad de
 * que haga click en un link enviado por email.
 *
 * Por qué: quita la dependencia dura de un proveedor de email (SendGrid/SMTP/etc).
 * El registro funciona aunque el envío de email falle (placeholder / sin verificar
 * sender) — el usuario puede loguearse de inmediato.
 *
 * Para activar verificación real en prod: elimina este hook (y su import en
 * main.wasp) y configura un sender real en `emailSender.defaultFrom`.
 */
export const onAfterSignup: OnAfterSignupHook = async ({ providerId, prisma }) => {
  if (providerId.providerName !== 'email') return

  const identity = await prisma.authIdentity.findUnique({
    where: {
      providerName_providerUserId: {
        providerName: providerId.providerName,
        providerUserId: providerId.providerUserId,
      },
    },
  })
  if (!identity) return

  const data = JSON.parse(identity.providerData) as Record<string, unknown>
  if (data.isEmailVerified) return

  data.isEmailVerified = true

  await prisma.authIdentity.update({
    where: {
      providerName_providerUserId: {
        providerName: providerId.providerName,
        providerUserId: providerId.providerUserId,
      },
    },
    data: { providerData: JSON.stringify(data) },
  })
}
