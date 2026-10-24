// Registro do token no SUSight-Backend (`POST /me/push-token`, pedido no plano da spec 004).
// Sem EXPO_PUBLIC_API_URL, o token só aparece no log, para usar com o script de push de teste.

export async function sendPushToken(token: string) {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) {
    console.info(`Token de push (backend não configurado): ${token}`);
    return;
  }
  const response = await fetch(`${apiUrl}/me/push-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) throw new Error(`Falha ao registrar o token: ${response.status}`);
}
