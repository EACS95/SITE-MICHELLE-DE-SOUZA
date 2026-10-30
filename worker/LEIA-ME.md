# Proteção do formulário contra robôs (Cloudflare Turnstile + Worker)

Como funciona: o site mostra a caixinha "Confirme que você é humano"; ao enviar, a mensagem vai
para um Worker da Cloudflare, que confere a caixinha no servidor e só então repassa ao Zoho.
A URL do Zoho fica guardada no Worker e **sai do HTML do site**.

## 1. Criar o Turnstile (grátis)
1. Crie conta em https://dash.cloudflare.com (grátis).
2. Menu **Turnstile** → **Add widget**.
3. Nome: `Site Michelle`. Domínios: `michelledesouza.com.br` e `www.michelledesouza.com.br`.
4. Modo: **Managed**. Salve.
5. Anote a **Site Key** (pública) e a **Secret Key** (privada, não compartilhe).

## 2. Criar o Worker
1. Menu **Workers & Pages** → **Create** → **Create Worker** → nome `formulario-michelle` → **Deploy**.
2. **Edit code**: apague tudo, cole o conteúdo de `worker/zoho-proxy.js` e **Deploy**.
3. Em **Settings → Variables and Secrets**, adicione como **Secret**:
   - `TURNSTILE_SECRET` = a Secret Key do passo 1
   - `ZOHO_URL` = a URL de envio do Zoho (veja o passo 3)
4. Anote a URL do Worker (algo como `https://formulario-michelle.SEU-USUARIO.workers.dev`).

## 3. Trocar a URL do Zoho (importante)
A URL atual do Zoho já esteve pública no site e os robôs a conhecem. No Zoho Forms,
gere um novo link/permalink do formulário (ou duplique o formulário) e use a **nova** URL
de envio (`.../htmlRecords/submit`) em `ZOHO_URL`. Depois desative o link antigo.

## 4. Ligar no site
Em `js/script.js`, preencha as duas constantes e envie ao GitHub:
- `FORM_ENDPOINT` = URL do Worker
- `TURNSTILE_SITE_KEY` = Site Key

Teste enviando uma mensagem e confira se chega no Zoho.
