        // Mobile Menu Toggle
        const mobileMenuButton = document.querySelector('.mobile-menu-button');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('animate__fadeIn');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });

        // Back to Top Button
        const backToTopButton = document.getElementById('backToTop');
        
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

        // Contact Form Submission
        function sendMessage(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Basic validation
            if (!name || !email || !phone || !subject || !message) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }
            
            // Format WhatsApp message
            const whatsappMessage = `Olá Dra. Michelle, sou ${name}.\nAssunto: ${subject}\nMensagem: ${message}\nTelefone: ${phone}\nEmail: ${email}`;
            const encodedMessage = encodeURIComponent(whatsappMessage);
            
            // Open WhatsApp with pre-filled message
            window.open(`https://wa.me/5561993149693?text=${encodedMessage}`, '_blank');
            
            // Reset form
            document.getElementById('contactForm').reset();
            
            // Show success message
            alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        }

        // Scroll animations
        const animateOnScroll = () => {
            const elements = document.querySelectorAll('.animate__animated');
            
            elements.forEach(element => {
                const elementPosition = element.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (elementPosition < windowHeight - 100) {
                    const animationClass = element.classList[1];
                    element.classList.add(animationClass);
                }
            });
        };
        
        window.addEventListener('scroll', animateOnScroll);
        window.addEventListener('load', animateOnScroll);

        // Cookie Consent
        document.addEventListener('DOMContentLoaded', function() {
            const cookieConsent = document.getElementById('cookieConsent');
            const acceptCookies = document.getElementById('acceptCookies');
            
            if (!localStorage.getItem('cookieConsent')) {
                setTimeout(() => {
                    cookieConsent.classList.remove('hidden');
                    cookieConsent.classList.remove('translate-y-full');
                    cookieConsent.classList.add('translate-y-0');
                }, 2000);
            }
            
            acceptCookies.addEventListener('click', function() {
                localStorage.setItem('cookieConsent', 'accepted');
                cookieConsent.classList.add('translate-y-full');
                
                setTimeout(() => {
                    cookieConsent.classList.add('hidden');
                }, 300);
                
                // Here you would load your analytics scripts
                // Example: loadGoogleAnalytics();
            });
        });
        
        // Example analytics function (replace with your actual tracking ID)
        function loadGoogleAnalytics() {
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'UA-XXXXX-Y');
            
            const script = document.createElement('script');
            script.src = 'https://www.googletagmanager.com/gtag/js?id=UA-XXXXX-Y';
            document.head.appendChild(script);
        }
    