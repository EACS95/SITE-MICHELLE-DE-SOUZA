// =======================
// LÓGICA DO MENU MOBILE
// =======================
const mobileMenuButton = document.querySelector('.mobile-menu-button');
const mobileMenu = document.querySelector('.mobile-menu');

if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        if (mobileMenu) {
            mobileMenu.classList.add('hidden');
        }
    });
});

// =======================
// REVELAÇÃO AO ROLAR A PÁGINA (substitui o animate.css)
// A classe "js-ready" só é adicionada se o JS realmente rodar — sem ela, o
// CSS mantém tudo visível por padrão (ver .reveal em css/style.css).
// =======================
document.documentElement.classList.add('js-ready');

const revealElements = document.querySelectorAll('.reveal');
if (revealElements.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
} else {
    // Sem suporte a IntersectionObserver: mostra tudo direto, sem esperar rolagem.
    revealElements.forEach(el => el.classList.add('reveal-active'));
}

// =======================
// LÓGICA QUE RODA APÓS O CARREGAMENTO DA PÁGINA
// =======================
document.addEventListener('DOMContentLoaded', () => {
    // 2. LÓGICA DO BOTÃO "VOLTAR AO TOPO"
    const backToTopButton = document.getElementById('backToTop');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.remove('opacity-0', 'invisible', 'translate-y-4');
                backToTopButton.classList.add('opacity-100', 'visible', 'translate-y-0');
            } else {
                backToTopButton.classList.remove('opacity-100', 'visible', 'translate-y-0');
                backToTopButton.classList.add('opacity-0', 'invisible', 'translate-y-4');
            }
        });

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 3. LÓGICA DO CONSENTIMENTO DE COOKIES
    const cookieConsent = document.getElementById('cookieConsent');
    const acceptCookies = document.getElementById('acceptCookies');
    if (localStorage.getItem('cookieConsent') === 'accepted') {
        loadElfsightWidget();
    }
    if (cookieConsent && acceptCookies) {
        if (!localStorage.getItem('cookieConsent')) {
            setTimeout(() => {
                cookieConsent.classList.remove('hidden', 'translate-y-full');
                cookieConsent.classList.add('translate-y-0');
            }, 2000);
        }

        acceptCookies.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieConsent.classList.add('translate-y-full');
            setTimeout(() => {
                cookieConsent.classList.add('hidden');
            }, 300);
            loadElfsightWidget();
            // loadGoogleAnalytics();
        });
    }

    // 4. LÓGICA DO MODAL DE AGRADECIMENTO
    // Espera o iframe oculto carregar a resposta do Zoho antes de mostrar "Obrigado",
    // em vez de mostrar a mensagem instantaneamente ao clicar em enviar.
    const form = document.getElementById('form');
    const modal = document.getElementById('thankYouModal');
    const closeModalButton = document.getElementById('closeModalButton');
    const zohoIframe = document.getElementById('zoho_iframe');
    if (form && modal && closeModalButton && zohoIframe) {
        let formWasSubmitted = false;

        // Anti-bot (camadas extras além do honeypot):
        // 1) tempo mínimo entre carregar a página e enviar; 2) exige interação real (teclado/toque/mouse).
        // Isto só barra robôs que usam um navegador de verdade; quem faz POST direto na URL do Zoho
        // precisa ser barrado no próprio Zoho (captcha).
        const formLoadedAt = Date.now();
        let humanInteracted = false;
        ['keydown', 'pointerdown', 'touchstart'].forEach(evt => {
            form.addEventListener(evt, () => { humanInteracted = true; }, { once: true, passive: true });
        });

        // Modo protegido (Cloudflare Turnstile + Worker, ver worker/LEIA-ME.md).
        // Enquanto as duas constantes estiverem vazias, o formulário continua enviando direto ao Zoho.
        const FORM_ENDPOINT = 'https://formulario-michelle.elicassiodesouza.workers.dev';       //URL do Worker, ex.: https://formulario.SEU-USUARIO.workers.dev
        const TURNSTILE_SITE_KEY = '0x4AAAAAAFss0vSKfYuiLfiL';  //"Site key" do Turnstile (pública)
        const protectedMode = Boolean(FORM_ENDPOINT && TURNSTILE_SITE_KEY);
        const formError = document.getElementById('form-error');
        const submitButton = form.querySelector('button[type="submit"]');
        let turnstileWidgetId = null;

        if (protectedMode) {
            form.removeAttribute('action');
            form.removeAttribute('target');
            window.onTurnstileLoad = () => {
                turnstileWidgetId = turnstile.render('#turnstile-box', { sitekey: TURNSTILE_SITE_KEY, language: 'pt-br' });
            };
            const tsScript = document.createElement('script');
            tsScript.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad';
            tsScript.async = true;
            document.head.appendChild(tsScript);
        }

        const showThankYou = () => {
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                modal.querySelector('.transform').classList.remove('scale-95');
            }, 10);
            setTimeout(() => {
                form.reset();
            }, 500);
        };

        const showFormError = (message) => {
            if (!formError) return;
            formError.textContent = message;
            formError.classList.remove('hidden');
        };

        form.addEventListener('submit', async (event) => {
            // Honeypot anti-bot: campo invisível para humanos. Se veio preenchido, é bot — bloqueia o envio.
            const honeypot = document.getElementById('website');
            const tooFast = Date.now() - formLoadedAt < 4000;
            if ((honeypot && honeypot.value.trim() !== '') || tooFast || !humanInteracted) {
                event.preventDefault();
                return;
            }

            if (!protectedMode) {
                formWasSubmitted = true;
                return;
            }

            event.preventDefault();
            if (formError) formError.classList.add('hidden');
            const data = new FormData(form);
            if (!data.get('cf-turnstile-response')) {
                showFormError('Confirme a verificação de segurança antes de enviar.');
                return;
            }
            submitButton.disabled = true;
            try {
                const response = await fetch(FORM_ENDPOINT, { method: 'POST', body: data });
                if (!response.ok) throw new Error('HTTP ' + response.status);
                showThankYou();
            } catch (error) {
                showFormError('Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.');
            } finally {
                submitButton.disabled = false;
                if (turnstileWidgetId !== null) turnstile.reset(turnstileWidgetId);
            }
        });

        zohoIframe.addEventListener('load', () => {
            if (!formWasSubmitted) return; // ignora o load inicial do iframe vazio
            formWasSubmitted = false;
            showThankYou();
        });

        const closeModal = () => {
            modal.classList.add('opacity-0');
            modal.querySelector('.transform').classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        };
        closeModalButton.addEventListener('click', closeModal);

        // Fecha clicando fora do conteúdo do modal
        modal.addEventListener('click', (event) => {
            if (event.target === modal) closeModal();
        });

        // Fecha com a tecla Esc
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
        });
    }

    // 5. LÓGICA DA MÁSCARA DE TELEFONE
    const phoneInput = document.getElementById('phone');
    if (phoneInput && typeof IMask !== 'undefined') {
        const phoneMask = IMask(phoneInput, {
            mask: [
                { mask: '(00) 0000-0000' },
                { mask: '(00) 00000-0000' }
            ],
            dispatch: (appended, dynamicMasked) => {
                const digits = (dynamicMasked.value + appended).replace(/\D/g, '');
                return dynamicMasked.compiledMasks[digits.length > 10 ? 1 : 0];
            }
        });
    }

    // 6. LINKS "CONSULTAR" E TAGS DE SERVIÇO (Áreas de Atuação)
    // Ao clicar em "Direito de Família", "Inventário", "Divórcio" etc., o
    // assunto do formulário já vem selecionado e a mensagem do WhatsApp já
    // menciona o que a pessoa procura — ela não precisa explicar do zero.
    const subjectSelect = document.getElementById('subject');
    const messageField = document.getElementById('message');
    const contactWhatsappLink = document.getElementById('contact-whatsapp-link');

    document.querySelectorAll('.topic-tag').forEach(link => {
        link.addEventListener('click', () => {
            const area = link.getAttribute('data-area');
            const topic = link.getAttribute('data-topic') || area;

            if (subjectSelect && area) {
                subjectSelect.value = area;
            }
            if (messageField && !messageField.value.trim()) {
                messageField.value = `Tenho interesse em: ${topic}.`;
            }
            if (contactWhatsappLink && topic) {
                const text = `Olá Dra. Michelle, gostaria de saber mais sobre ${topic}`;
                contactWhatsappLink.href = `https://wa.me/5561993149693?text=${encodeURIComponent(text)}`;
            }
        });
    });
});

// =======================
// WIDGET DE DEPOIMENTOS (ELFSIGHT) — só carrega após aceite de cookies
// =======================
let elfsightLoaded = false;
function loadElfsightWidget() {
    if (elfsightLoaded || !document.getElementById('elfsight-widget')) return;
    elfsightLoaded = true;

    // A seção "Depoimentos" começa escondida; só aparece quando o widget realmente renderizou algo.
    const widget = document.getElementById('elfsight-widget');
    const section = document.getElementById('depoimentos');
    if (section) {
        let tries = 0;
        const timer = setInterval(() => {
            tries++;
            if (widget.children.length > 0) {
                section.classList.remove('hidden');
                clearInterval(timer);
            } else if (tries > 60) { // desiste após ~30s (widget bloqueado/sem conexão): seção continua escondida
                clearInterval(timer);
            }
        }, 500);
    }

    const script = document.createElement('script');
    script.src = 'https://static.elfsight.com/platform/platform.js';
    script.setAttribute('data-use-service-core', '');
    script.defer = true;
    document.body.appendChild(script);
}

// =======================
// FUNÇÃO AUXILIAR GOOGLE ANALYTICS
// =======================
function loadGoogleAnalytics() {
    const gaId = 'UA-XXXXX-Y'; // Substitua pelo seu ID
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', gaId);
    
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);
}