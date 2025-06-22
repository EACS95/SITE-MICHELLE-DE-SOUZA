// =======================
// LÓGICA DO MENU MOBILE
// =======================
const mobileMenuButton = document.querySelector('.mobile-menu-button');
const mobileMenu = document.querySelector('.mobile-menu');

if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        mobileMenu.classList.toggle('animate__fadeIn');
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
// LÓGICA DAS ANIMAÇÕES DE ROLAGEM
// =======================
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.animate__animated');
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (elementPosition < windowHeight - 100) {
            // Adiciona a classe apenas se ela ainda não foi adicionada para evitar re-animação
            if (!element.classList.contains('start-animation')) {
                element.classList.add('start-animation');
            }
        }
    });
};

window.addEventListener('scroll', animateOnScroll);

// =======================
// LÓGICA QUE RODA APÓS O CARREGAMENTO DA PÁGINA
// =======================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Executa a animação para elementos já visíveis no carregamento
    animateOnScroll();

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
            // loadGoogleAnalytics(); 
        });
    }

    // 4. LÓGICA DO MODAL DE AGRADECIMENTO
    const form = document.getElementById('form');
    const modal = document.getElementById('thankYouModal');
    const closeModalButton = document.getElementById('closeModalButton');
    if (form && modal && closeModalButton) {
        form.addEventListener('submit', () => {
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                modal.querySelector('.transform').classList.remove('scale-95');
            }, 10);
            setTimeout(() => {
                form.reset();
            }, 500);
        });

        const closeModal = () => {
            modal.classList.add('opacity-0');
            modal.querySelector('.transform').classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        };
        closeModalButton.addEventListener('click', closeModal);
    }

    // 5. LÓGICA DA MÁSCARA DE TELEFONE
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        const phoneMask = IMask(phoneInput, {
            mask: '(00) 00000-0000'
        });
    }
});

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