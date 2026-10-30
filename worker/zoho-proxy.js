// Cloudflare Worker: confere o Turnstile e só então repassa a mensagem ao Zoho Forms.
// Variáveis (Settings > Variables, como "Secret"): TURNSTILE_SECRET e ZOHO_URL.

const ALLOWED_ORIGINS = [
  'https://michelledesouza.com.br',
  'https://www.michelledesouza.com.br',
];

// Só estes campos seguem para o Zoho; qualquer outro é descartado.
const ZOHO_FIELDS = [
  'Name_First', 'Name_Last', 'Email', 'PhoneNumber_countrycode',
  'Dropdown', 'MultiLine', 'zf_referrer_name', 'zf_redirect_url', 'zc_gad',
];
const MAX_FIELD_LENGTH = 3000;

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function reply(status, body, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response('Forbidden', { status: 403 });
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== 'POST') {
      return reply(405, { ok: false }, origin);
    }

    let form;
    try {
      form = await request.formData();
    } catch (e) {
      return reply(400, { ok: false }, origin);
    }

    // Honeypot: robô que preencheu o campo escondido recebe "ok" falso e nada é enviado.
    if ((form.get('website') || '').toString().trim() !== '') {
      return reply(200, { ok: true }, origin);
    }

    // Verificação do Turnstile no servidor da Cloudflare.
    const token = (form.get('cf-turnstile-response') || '').toString();
    if (!token) return reply(403, { ok: false, error: 'captcha' }, origin);

    const check = new FormData();
    check.append('secret', env.TURNSTILE_SECRET);
    check.append('response', token);
    const ip = request.headers.get('CF-Connecting-IP');
    if (ip) check.append('remoteip', ip);

    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: check,
    });
    const result = await verify.json();
    if (!result.success) return reply(403, { ok: false, error: 'captcha' }, origin);

    // Monta o envio ao Zoho só com os campos permitidos.
    const out = new FormData();
    for (const name of ZOHO_FIELDS) {
      const value = form.get(name);
      if (value !== null) out.append(name, value.toString().slice(0, MAX_FIELD_LENGTH));
    }

    const zoho = await fetch(env.ZOHO_URL, { method: 'POST', body: out, redirect: 'manual' });
    // Zoho responde 200 ou redireciona (3xx) quando aceita; o resto é erro.
    const accepted = zoho.status < 400;
    return reply(accepted ? 200 : 502, { ok: accepted }, origin);
  },
};
