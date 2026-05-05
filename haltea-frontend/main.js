// Language switching functionality
let currentLanguage = localStorage.getItem('selectedLanguage') || 'fr'; // Default to French, check localStorage

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Initialize language switching
    initializeLanguageSwitching();
    
    // Apply saved language on page load
    if (currentLanguage === 'en') {
        applyLanguage('en');
    }
    
    // Video Action Buttons Functionality (for conciergerie page)
    initializeVideoButtons();
    
    // Photos Carousel Functionality (for realisations page)
    initializePhotosCarousel();
    // Add smooth scrolling to navigation links
    const navLinks = document.querySelectorAll('.nav-link, .footer-nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // If it's an external link or different page, let it navigate normally
            if (href.includes('.html') || href.startsWith('http')) {
                return; // Allow normal navigation
            }
            
            // If it's an anchor link on the same page, prevent default and smooth scroll
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            header.style.backgroundColor = 'rgba(0, 0, 0, 0.98)';
            header.style.backdropFilter = 'blur(20px)';
        } else {
            header.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        }

        // Hide/show header on scroll — but never while focus is inside the header
        // (WCAG 2.4.11 Focus Not Obscured)
        const focusInsideHeader = header.contains(document.activeElement);
        if (!focusInsideHeader && currentScrollY > lastScrollY && currentScrollY > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    });

    // CTA Button animation
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            // Add ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }

    // Service pillars hover effect
    const pillars = document.querySelectorAll('.pillar');
    pillars.forEach(pillar => {
        pillar.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.05)';
        });
        
        pillar.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Language flag switching is initialized via initializeLanguageSwitching()
    // and aria-pressed state is synced in updateFlagPressed().

    // Notification bell animation
    const notification = document.querySelector('.notification');
    if (notification) {
        notification.addEventListener('click', function() {
            this.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                this.style.animation = '';
            }, 500);
        });
    }

    // Hero background image - no parallax effect for stable display

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe service pillars for animation
    pillars.forEach(pillar => {
        pillar.style.opacity = '0';
        pillar.style.transform = 'translateY(30px)';
        pillar.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(pillar);
    });

    // Contact Page Specific Functionality
    // Form input focus effects
    const formInputs = document.querySelectorAll('.form-input, .form-select, .form-textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });

    // Custom checkbox functionality
    const checkboxes = document.querySelectorAll('.checkbox-input');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const customCheckbox = this.nextElementSibling;
            if (this.checked) {
                customCheckbox.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    customCheckbox.style.transform = 'scale(1)';
                }, 200);
            }
        });
    });

    // Contact Form Validation
    const contactForm = document.querySelector('.contact-form');
    const submitButton = document.querySelector('.submit-button-3d');
    
    if (contactForm && submitButton) {
        // Validation rules — error messages localized via getMessage()
        const errorMessages = {
            fr: {
                civilite: 'Veuillez sélectionner votre civilité',
                nom: 'Le nom doit contenir entre 2 et 50 caractères (lettres uniquement)',
                email: 'Veuillez entrer une adresse email valide',
                telephone: 'Format valide : 06 12 34 56 78 ou +33 6 12 34 56 78',
                message: 'Le message doit contenir entre 10 et 1000 caractères',
                consent: 'Vous devez accepter la politique de confidentialité'
            },
            en: {
                civilite: 'Please select a title',
                nom: 'Name must be 2 to 50 characters (letters only)',
                email: 'Please enter a valid email address',
                telephone: 'Valid format: 06 12 34 56 78 or +33 6 12 34 56 78',
                message: 'Message must be between 10 and 1000 characters',
                consent: 'You must accept the privacy policy'
            }
        };
        function getMessage(field) {
            const lang = currentLanguage === 'en' ? 'en' : 'fr';
            return (errorMessages[lang] && errorMessages[lang][field]) || errorMessages.fr[field];
        }
        const validationRules = {
            civilite: { required: true, get message() { return getMessage('civilite'); } },
            nom: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-ZÀ-ÿ\s\-']+$/,
                get message() { return getMessage('nom'); }
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                get message() { return getMessage('email'); }
            },
            telephone: {
                required: true,
                pattern: /^(?:\+33\s?[1-9](?:\s?\d{2}){4}|0[1-9](?:\s?\d{2}){4})$/,
                get message() { return getMessage('telephone'); }
            },
            message: {
                required: true,
                minLength: 10,
                maxLength: 1000,
                get message() { return getMessage('message'); }
            },
            consent: { required: true, get message() { return getMessage('consent'); } }
        };

        // Create error message element
        function createErrorMessage(message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            return errorDiv;
        }

        // Remove existing error messages
        function removeErrorMessages(field) {
            const existingError = field.parentElement.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            field.classList.remove('error');
            field.removeAttribute('aria-invalid');
            field.removeAttribute('aria-describedby');
        }

        // Show error message — wired with aria-describedby + aria-invalid for screen readers
        function showError(field, message) {
            removeErrorMessages(field);
            field.classList.add('error');
            field.setAttribute('aria-invalid', 'true');
            const errorMessage = createErrorMessage(message);
            const errorId = `${field.id || field.name}-error`;
            errorMessage.id = errorId;
            errorMessage.setAttribute('role', 'alert');
            field.setAttribute('aria-describedby', errorId);
            field.parentElement.appendChild(errorMessage);
        }

        // Validate individual field
        function validateField(fieldName, field) {
            const rules = validationRules[fieldName];
            if (!rules) return true;

            const value = field.type === 'checkbox' ? field.checked : field.value.trim();

            // Required validation
            if (rules.required && (!value || value === '')) {
                showError(field, rules.message);
                return false;
            }

            // Skip other validations if field is empty and not required
            if (!value && !rules.required) {
                removeErrorMessages(field);
                return true;
            }

            // Length validation
            if (rules.minLength && value.length < rules.minLength) {
                showError(field, rules.message);
                return false;
            }

            if (rules.maxLength && value.length > rules.maxLength) {
                showError(field, rules.message);
                return false;
            }

            // Pattern validation
            if (rules.pattern && !rules.pattern.test(value)) {
                showError(field, rules.message);
                return false;
            }

            removeErrorMessages(field);
            return true;
        }

        // Phone number formatting function
        function formatPhoneNumber(value) {
            // Remove all non-digit characters except + at the beginning
            let cleaned = value.replace(/[^\d+]/g, '');
            
            // If it starts with +33, format as +33 X XX XX XX XX
            if (cleaned.startsWith('+33')) {
                cleaned = cleaned.substring(3);
                if (cleaned.length > 0) {
                    return '+33 ' + cleaned.replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
                }
                return '+33 ';
            }
            
            // If it starts with 0, format as 0X XX XX XX XX
            if (cleaned.startsWith('0') && cleaned.length > 1) {
                return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
            }
            
            return cleaned;
        }

        // Real-time validation on input
        const formFields = contactForm.querySelectorAll('input, select, textarea');
        formFields.forEach(field => {
            field.addEventListener('blur', function() {
                const fieldName = this.name;
                if (fieldName && validationRules[fieldName]) {
                    validateField(fieldName, this);
                }
            });

            field.addEventListener('input', function() {
                const fieldName = this.name;
                
                // Auto-format phone number
                if (fieldName === 'telephone') {
                    const cursorPosition = this.selectionStart;
                    const formatted = formatPhoneNumber(this.value);
                    this.value = formatted;
                    
                    // Restore cursor position
                    this.setSelectionRange(cursorPosition, cursorPosition);
                }
                
                if (fieldName && validationRules[fieldName] && this.classList.contains('error')) {
                    validateField(fieldName, this);
                }
            });
        });

        // Form submission with validation — bound to the form's submit event
        // so Enter-key submission also goes through validation (WCAG 2.1.1).
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitBtn = submitButton;
            
            let isValid = true;
            const formData = {};

            // Validate all fields
            Object.keys(validationRules).forEach(fieldName => {
                const field = contactForm.querySelector(`[name="${fieldName}"]`);
                console.log(`🔍 Checking field: ${fieldName}`, field);
                if (field) {
                    const fieldValid = validateField(fieldName, field);
                    console.log(`✅ Field ${fieldName} validation result:`, fieldValid);
                    if (!fieldValid) {
                        console.log(`❌ Field ${fieldName} failed validation`);
                        isValid = false;
                    }
                    formData[fieldName] = field.type === 'checkbox' ? field.checked : field.value.trim();
                    console.log(`📝 Field ${fieldName} value:`, formData[fieldName]);
                } else {
                    console.log(`❌ Field ${fieldName} not found in form`);
                    isValid = false;
                }
            });

            if (isValid) {
                // Show loading state
                const originalText = submitBtn.querySelector('.button-text').textContent;
                submitBtn.querySelector('.button-text').textContent = 'ENVOI EN COURS...';
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.7';
                announce('Envoi du message en cours...');

                // Handle contact form submission
                try {
                    console.log('🚀 Form submission started');
                    console.log('📝 Form data:', formData);

                    // Validate required fields
                    if (!formData.nom || !formData.email || !formData.message) {
                        console.log('❌ Validation failed - missing required fields');
                        showGeneralError();
                        submitBtn.querySelector('.button-text').textContent = originalText;
                        submitBtn.disabled = false;
                        submitBtn.style.opacity = '1';
                        return;
                    }

                    // Check consent checkbox
                    const consentCheckbox = document.querySelector('input[name="consent"]');
                    if (!consentCheckbox || !consentCheckbox.checked) {
                        console.log('❌ Validation failed - consent not checked');
                        showGeneralError();
                        submitBtn.querySelector('.button-text').textContent = originalText;
                        submitBtn.disabled = false;
                        submitBtn.style.opacity = '1';
                        return;
                    }
                    
                    console.log('✅ Validation passed');

                    // API base: same-origin by default (backend also serves the frontend).
                    // Override at runtime by setting window.HALTEA_API_BASE on a different host.
                    const API_BASE = (typeof window !== 'undefined' && window.HALTEA_API_BASE) || '';
                    const apiUrl = `${API_BASE}/api/contact`;

                    // The honeypot value is forwarded so the backend can drop bot submissions.
                    const honeypotEl = contactForm.querySelector('input[name="website"]');
                    const apiData = {
                        name: formData.nom,
                        email: formData.email,
                        phone: formData.telephone,
                        message: formData.message,
                        website: honeypotEl ? honeypotEl.value : ''
                    };

                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(apiData)
                    });

                    const result = await response.json().catch(() => ({}));
                    console.log('📥 Response:', response.status, result);

                    if (response.ok && result.success) {
                        showSuccessMessage();
                        contactForm.reset();
                    } else {
                        // Real failure — show retry/mailto fallback rather than a vague banner.
                        showGeneralError({
                            message: result.message,
                            recipient: result.recipient
                        });
                    }

                } catch (error) {
                    console.error('❌ Network/Request error:', error);
                    showGeneralError({ networkError: true });
                } finally {
                    // Reset button
                    submitBtn.querySelector('.button-text').textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                }
            } else {
                // Show general error message
                showGeneralError();
            }
        });

        // Show success message
        function showSuccessMessage() {
            const existingMessage = document.querySelector('.form-message');
            if (existingMessage) existingMessage.remove();

            const successDiv = document.createElement('div');
            successDiv.className = 'form-message success';
            successDiv.setAttribute('role', 'status');
            successDiv.setAttribute('aria-live', 'polite');
            successDiv.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="10" stroke="#4CAF50" stroke-width="2"/>
                </svg>
                <span>Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.</span>
            `;
            
            contactForm.insertBefore(successDiv, contactForm.firstChild);
            announce('Message envoyé avec succès. Nous vous répondrons dans les plus brefs délais.');

            setTimeout(() => {
                successDiv.remove();
            }, 5000);
        }

        // Show general error message — accepts optional context to render an
        // mailto fallback when delivery fails (vs. generic validation errors).
        function showGeneralError(opts = {}) {
            const existingMessage = document.querySelector('.form-message');
            if (existingMessage) existingMessage.remove();

            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-message error';
            errorDiv.setAttribute('role', 'alert');

            // Build via DOM to keep the message safe from injection
            const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            icon.setAttribute('width', '20');
            icon.setAttribute('height', '20');
            icon.setAttribute('viewBox', '0 0 24 24');
            icon.setAttribute('fill', 'none');
            icon.setAttribute('aria-hidden', 'true');
            icon.setAttribute('focusable', 'false');
            icon.innerHTML = '<circle cx="12" cy="12" r="10" stroke="#f44336" stroke-width="2"/><line x1="15" y1="9" x2="9" y2="15" stroke="#f44336" stroke-width="2"/><line x1="9" y1="9" x2="15" y2="15" stroke="#f44336" stroke-width="2"/>';
            errorDiv.appendChild(icon);

            const wrap = document.createElement('span');
            const isDeliveryFailure = opts.networkError || opts.message;
            const recipient = opts.recipient || 'haltea.event@gmail.com';
            const txt = isDeliveryFailure
                ? (opts.message || 'Erreur de connexion au serveur. Veuillez réessayer.')
                : 'Veuillez corriger les erreurs dans le formulaire.';
            wrap.appendChild(document.createTextNode(txt));

            // Add mailto fallback when delivery actually failed
            if (isDeliveryFailure) {
                wrap.appendChild(document.createElement('br'));
                const mailto = document.createElement('a');
                mailto.href = 'mailto:' + recipient;
                mailto.textContent = 'Écrivez-nous directement à ' + recipient;
                mailto.style.color = '#D4AF37';
                mailto.style.textDecoration = 'underline';
                wrap.appendChild(mailto);
            }
            errorDiv.appendChild(wrap);

            contactForm.insertBefore(errorDiv, contactForm.firstChild);
            announce(txt, true);

            // Delivery-failure messages stay until dismissed; validation errors auto-clear.
            if (!isDeliveryFailure) {
                setTimeout(() => { errorDiv.remove(); }, 5000);
            }
        }
    }

    // Observe contact page elements for animation
    const contactElements = document.querySelectorAll('.form-container-3d, .info-container-3d, .contact-info-item-3d');
    contactElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });

    // (legacy .flag-btn duplicate handler removed — language switching is centralised
    //  in initializeLanguageSwitching() against the .flag-button elements.)

    // Notification icon animation for contact page
    const notificationIcon = document.querySelector('.notification-icon');
    if (notificationIcon) {
        notificationIcon.addEventListener('click', function() {
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Notification logic would go here
            console.log('Notification clicked!');
        });
    }
});

// Add CSS for ripple effect and contact page animations
const style = document.createElement('style');
style.textContent = `
    .cta-button, .submit-button-3d {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(212, 175, 55, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .flag.active, .flag-btn.active {
        opacity: 1;
        transform: scale(1.1);
    }
    
    .header {
        transition: transform 0.3s ease, background-color 0.3s ease, backdrop-filter 0.3s ease;
    }
    
    /* Contact page specific animations */
    .form-group.focused .form-label {
        color: #D4AF37;
        transform: translateY(-2px);
    }
    
    .form-group.focused .label-line {
        background: linear-gradient(90deg, #D4AF37, transparent);
    }
`;
document.head.appendChild(style);

// Video Action Buttons Functionality
function initializeVideoButtons() {
    // Découvrir Nos Services Button
    const discoverServicesBtn = document.querySelector('.discover-services');
    if (discoverServicesBtn) {
        discoverServicesBtn.addEventListener('click', function() {
            // Navigate to services page to show our conciergerie services
            window.location.href = 'services.html';
        });
    }

    // À regarder Button
    const watchBtn = document.querySelector('.watch-btn');
    if (watchBtn) {
        watchBtn.addEventListener('click', function() {
            // Redirect directly to YouTube video — noopener for security; user is
            // pre-warned via the button's aria-label that it opens in a new tab.
            const youtubeUrl = 'https://youtu.be/0tTHfQWIiUA';
            window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
        });
    }

    // Partager Button
    const shareBtn = document.querySelector('.share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            const pageTitle = 'PAWEL Concierge - HALTÉA';
            const pageUrl = window.location.href;
            
            // Check if Web Share API is supported
            if (navigator.share) {
                navigator.share({
                    title: pageTitle,
                    text: 'Découvrez notre service de conciergerie de luxe avec PAWEL Concierge',
                    url: pageUrl
                }).catch(err => console.log('Error sharing:', err));
            } else {
                // Fallback: Copy URL to clipboard
                navigator.clipboard.writeText(pageUrl).then(() => {
                    // Show a temporary notification
                    showNotification('Lien copié dans le presse-papiers!');
                }).catch(() => {
                    // Final fallback: show alert
                    alert('Partagez cette page: ' + pageUrl);
                });
            }
        });
    }

    // Helper function to show notifications
    function showNotification(message) {
        announce(message);
        // Create notification element
        const notification = document.createElement('div');
        notification.setAttribute('role', 'status');
        notification.setAttribute('aria-live', 'polite');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #D4AF37;
            color: #000;
            padding: 15px 20px;
            border-radius: 5px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        
        // Add animation CSS if not already added
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Language Switching Functionality
function initializeLanguageSwitching() {
    const flagButtons = document.querySelectorAll('.flag-button');
    flagButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.dataset.lang;
            if (lang === 'en') switchToEnglish();
            else switchToFrench();
        });
    });
    // Sync initial pressed state with currentLanguage
    updateFlagPressed(currentLanguage);
    // Set initial document lang
    document.documentElement.lang = currentLanguage === 'en' ? 'en' : 'fr';
}

function updateFlagPressed(lang) {
    document.querySelectorAll('.flag-button').forEach(btn => {
        btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
    });
}

// Live region announcement helper
function announce(message, assertive = false) {
    const live = document.getElementById('a11y-live');
    if (!live) return;
    live.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
    live.setAttribute('role', assertive ? 'alert' : 'status');
    live.textContent = '';
    setTimeout(() => { live.textContent = message; }, 50);
}

function switchToEnglish() {
    currentLanguage = 'en';
    localStorage.setItem('selectedLanguage', 'en');
    applyLanguage('en');
    showLanguageNotification('Language switched to English');
}

function switchToFrench() {
    currentLanguage = 'fr';
    localStorage.setItem('selectedLanguage', 'fr');
    applyLanguage('fr');
    showLanguageNotification('Langue changée en français');
}

function applyLanguage(language) {
    // Update document language for assistive technology
    document.documentElement.lang = language === 'en' ? 'en' : 'fr';
    // Sync flag pressed state
    updateFlagPressed(language);
    
            // Translate all elements with data-translate attribute
            const translatableElements = document.querySelectorAll('[data-translate]');
            translatableElements.forEach(element => {
                const translationKey = element.getAttribute('data-translate');
                let translatedText;

                if (language === 'en') {
                    translatedText = translations[translationKey];
                } else if (language === 'fr') {
                    translatedText = frenchTranslations[translationKey];
                }

                if (translatedText) {
                    element.textContent = translatedText;
                }
            });

            // Translate all elements with data-translate-placeholder attribute
            const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
            placeholderElements.forEach(element => {
                const translationKey = element.getAttribute('data-translate-placeholder');
                let translatedText;

                if (language === 'en') {
                    translatedText = translations[translationKey];
                } else if (language === 'fr') {
                    translatedText = frenchTranslations[translationKey];
                }

                if (translatedText) {
                    element.placeholder = translatedText;
                }
            });
    
    // Update navigation links
    updateNavigationLinks(language);
    
    // Update page-specific content
    updatePageContent(language);
}

function updateNavigationLinks(language) {
    const navLinks = document.querySelectorAll('.nav-link, .footer-nav-link');
    navLinks.forEach(link => {
        const translationKey = link.getAttribute('data-translate');
        if (translationKey) {
            if (language === 'en') {
                link.textContent = translations[translationKey];
            } else if (language === 'fr') {
                link.textContent = frenchTranslations[translationKey];
            }
        }
    });
}

function updatePageContent(language) {
    // Update specific page content based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (currentPage === 'conciergerie.html') {
        updateConciergerieContent(language);
    } else if (currentPage === 'services.html') {
        updateServicesContent(language);
    } else if (currentPage === 'realisations.html') {
        updateRealisationsContent(language);
    } else if (currentPage === 'contact.html') {
        updateContactContent(language);
    } else {
        updateHomepageContent(language);
    }
}

// Translation object
const translations = {
    // Navigation
    'nav_accueil': 'HOME',
    'nav_conciergerie': 'CONCIERGE',
    'nav_nos_services': 'OUR SERVICES',
    'nav_nos_réalisations': 'OUR REALIZATIONS',
    'nav_contact': 'CONTACT',
    
    // Homepage
    'hero_title': 'WELCOME DIFFERENTLY',
    'hero_subtitle': 'Ultra VIP personal accompaniment for your events',
    'hero_cta': 'DISCOVER',
    'pillar_protocole': 'PROTOCOL',
    'pillar_ultravip': 'ULTRA VIP',
    'pillar_coordination': 'COORDINATION',
    'pillar_elegance': 'ELEGANCE',
    'pillar_discretion': 'DISCRETION',
    'accueil_title': 'PERSONALIZED WELCOME',
    'accueil_description': 'An exceptional service that transforms every encounter into a memorable experience. Our dedicated team orchestrates every detail with precision, elegance and discretion, creating a unique atmosphere for your most prestigious guests.',
    'protocole_title': 'PROTOCOL',
    'protocole_description': 'Our expertise in protocol ensures perfect organization for your events and official ceremonies.',
    'conciergerie_title': 'CONCIERGE',
    'conciergerie_description': 'A dedicated concierge service to meet all your requests with discretion and efficiency.',
    'nos_partenaires_title': 'OUR PARTNERS',
    'ce_que_disent_title': 'WHAT OUR PARTNERS SAY',
    'feature_premium': 'Premium Service',
    'feature_details': 'Attention to Details',
    'feature_excellence': 'Excellence',
    'image_coming': 'Image coming soon',
    'shape_accueil': 'Personalized Welcome',
    'shape_protocole': 'Protocol',
    'shape_vip': 'VIP/UltraVIP',
    'partners_title': 'OUR PARTNERS',
    'testimonials_title': 'WHAT OUR PARTNERS SAY',
    'testimonial_1_text': '"A huge thank you to you Alexandre Nasser! Your attitude and professionalism have been absolutely remarkable."',
    'testimonial_1_author': 'Guillaume Bourdeloux',
    'testimonial_1_role': 'Director of the International Air and Space Show',
    'testimonial_2_text': '"As Protocol Manager of the Show, Alexandre brilliantly managed coordination with elected officials and all protocol procedures, even in the face of unforeseen events and last-minute adjustments. Thank you again for your commitment!"',
    'testimonial_2_author': 'Ferielle Deriche',
    'testimonial_2_role': 'Director of the Real Estate Show',
    'company_name': 'HALTEA',
    
    // Conciergerie page
    'conciergerie_main_title': 'LUXURY CONCIERGE FOR YOUR EVENTS',
    'conciergerie_partnership_intro': 'In exclusive partnership with PAWEL Concierge, HALTEA provides you with an exceptional concierge service, inspired by the greatest palaces. This service brings elegance, responsiveness and refinement to your events.',
    'conciergerie_feature_1_title': 'WELCOME & ORIENTATION',
    'conciergerie_feature_1_desc': 'Hosts and hostesses trained in luxury codes to welcome and guide your guests with elegance.',
    'conciergerie_feature_2_title': 'PALACE-TYPE CONCIERGE',
    'conciergerie_feature_2_desc': 'A real on-site concierge desk: transfers, reservations, personalized recommendations - real-time assistance.',
    'conciergerie_feature_3_title': 'ANIMATION & EXPERIENCE',
    'conciergerie_feature_3_desc': 'Creating a unique atmosphere for your guests. Attentive, balanced and discreet service to enhance your event.',
    'partnership_text': 'This strategic partnership with PAWEL Concierge allows HALTEA to complete its protocol expertise with a concierge service inspired by the most prestigious hotel standards.',
    'discover_services_btn': 'DISCOVER OUR SERVICES',
    'watch_btn': 'Watch',
    'share_btn': 'Share',
    
    // Services page
    'services_title': 'OUR SERVICES',
    'services_description': 'We offer a complete range of services to meet all your needs with excellence and discretion.',
    'equipes_title': 'OUR TEAMS',
    'alexandre_name': 'Alexandre Nasser',
    'alexandre_desc_1': 'Alexandre Nasser is a specialist in welcoming and handling important personalities during events. I manage protocol, guest schedules, transportation, taxis...',
    'alexandre_desc_2': 'A true Swiss army knife, I adapt to the clientele and your specific requests.',
    'alexandre_desc_3': 'Collaborating with HALTEA, I can guide you towards their general reception and luxury concierge services.',
    'illustration_1': 'Illustration 1',
    'illustration_2': 'Illustration 2',
    'illustration_3': 'Illustration 3',
    'illustration_4': 'Illustration 4',
    'role_1': 'Protocol Manager / VIP Clientele',
    'role_2': 'Head Concierge',
    'role_3': 'Qualified Concierge',
    'role_4': 'Bellhops and Groom Staff',
    
    // Realisations page
    'realisations_title': 'OUR REALIZATIONS',
    'realisations_description': 'HALTEA puts its expertise at the service of the largest international events: protocol management, Ultra-VIP accompaniment and reception of official delegations from different countries.',
    'keyphrase_1': 'Protocol & Official Reception',
    'keyphrase_2': 'Ultra VIP & Personalized',
    'keyphrase_3': 'International Delegation',
    'keyphrase_4': 'Diplomatic & Institutional Coordination',
    
    // Contact page
    'contact_title': 'CONTACT',
    'contact_subtitle': 'For any questions or requests, do not hesitate to contact us.',
    'contact_info_title': 'Our coordinates',
    'form_title': 'Title',
    'form_choose': 'Choose..',
    'form_madame': 'Madame',
    'form_monsieur': 'Monsieur',
    'form_name': 'Name',
    'form_name_placeholder': 'First Name',
    'form_email': 'Email',
    'form_email_placeholder': 'Email',
    'form_phone': 'Phone',
    'form_phone_placeholder': 'Phone',
    'form_message': 'Your message',
    'form_message_placeholder': 'Send this message regarding this formula. You accept our privacy policy.',
    'checkbox_text': 'I wish to receive information. I accept our privacy policy.',
    'form_send': 'SEND',
    'team_availability': 'Our team is available Monday to Friday, from 9am to 6pm.<br>You can also write to us via this form, we respond within 24h!'
};

// French translations object
const frenchTranslations = {
    // Navigation
    'nav_accueil': 'ACCUEIL',
    'nav_conciergerie': 'CONCIERGERIE',
    'nav_nos_services': 'NOS SERVICES',
    'nav_nos_réalisations': 'NOS RÉALISATIONS',
    'nav_contact': 'CONTACT',
    
    // Homepage
    'hero_title': 'ACCUEILLIR AUTREMENT',
    'hero_subtitle': 'Accompagnement personnel Ultra VIP au service de vos événements',
    'hero_cta': 'DÉCOUVRIR',
    'pillar_protocole': 'PROTOCOLE',
    'pillar_ultravip': 'ULTRAVIP',
    'pillar_coordination': 'COORDINATION',
    'pillar_elegance': 'ÉLÉGANCE',
    'pillar_discretion': 'DISCRÉTION',
    'accueil_title': 'ACCUEIL PERSONNALISÉ',
    'accueil_description': 'Un service d\'exception qui transforme chaque rencontre en une expérience mémorable. Notre équipe dédiée orchestre chaque détail avec précision, élégance et discretion, créant une atmosphère unique pour vos invités les plus prestigieux.',
    'protocole_title': 'PROTOCOLE',
    'protocole_description': 'Notre expertise en protocole garantit une organisation parfaite pour vos événements et cérémonies officielles.',
    'conciergerie_title': 'CONCIERGERIE',
    'conciergerie_description': 'Un service de conciergerie dédié pour répondre à toutes vos demandes avec discrétion et efficacité.',
    'nos_partenaires_title': 'NOS PARTENAIRES',
    'ce_que_disent_title': 'CE QUE DISENT NOS PARTENAIRES',
    'feature_premium': 'Service Premium',
    'feature_details': 'Attention Détails',
    'feature_excellence': 'Excellence',
    'image_coming': 'Image à venir',
    'shape_accueil': 'Accueil Personnalisé',
    'shape_protocole': 'Protocole',
    'shape_vip': 'VIP/UltraVIP',
    'partners_title': 'NOS PARTENAIRES',
    'testimonials_title': 'CE QUE DISENT NOS PARTENAIRES',
    'testimonial_1_text': '"Un immense merci à toi Alexandre Nasser! Ton attitude et ton professionnalisme ont été absolument remarquable."',
    'testimonial_1_author': 'Guillaume Bourdeloux',
    'testimonial_1_role': 'Directeur du Salon internationale de l\'aeronotiaue et de l\'espace',
    'testimonial_2_text': '"En tant que Responsable Protocole du Salon, Alexandre a su gerer avec brio la coordination avec les élus et toute procie protocole, méme face aux imprévus et ajustements de dernière minute. Merci encore pour ton engagement!"',
    'testimonial_2_author': 'Ferielle Deriche',
    'testimonial_2_role': 'Responsable Protocole du Salon',
    'company_name': 'HALTÉA',
    
    // Conciergerie page
    'conciergerie_main_title': 'CONCIERGERIE DE LUXE POUR VOS ÉVÉNEMENTS',
    'conciergerie_partnership_intro': 'En partenariat exclusif avec PAWEL Concierge, HALTÉA met à votre disposition un service de conciergerie d\'exception, inspiré des plus grands palaces. Cette prestation apporte élégance, réactivité et raffinement à vos événements.',
    'conciergerie_feature_1_title': 'ACCUEIL & ORIENTATION',
    'conciergerie_feature_1_desc': 'Des hôtes et hôtesses formés aux codes du luxe pour accueillir et guider vos invités avec élégance.',
    'conciergerie_feature_2_title': 'CONCIERGERIE TYPE PALACE',
    'conciergerie_feature_2_desc': 'Un véritable bureau de conciergerie sur site : transferts, réservations, recommandations personnalisées - assistance en temps réel.',
    'conciergerie_feature_3_title': 'ANIMATION & EXPÉRIENCE',
    'conciergerie_feature_3_desc': 'Création d\'une atmosphère unique pour vos invités. Service attentif, équilibrant et discret pour sublimer votre événement.',
    'partnership_text': 'Ce partenariat stratégique avec PAWEL Concierge permet à HALTÉA de compléter son savoir-faire protocolaire par une conciergerie, inspirée des standards hôteliers les plus prestigieux.',
    'discover_services_btn': 'DÉCOUVRIR NOS SERVICES',
    'watch_btn': 'À regarder',
    'share_btn': 'Partager',
    
    // Services page
    'services_title': 'NOS SERVICES',
    'services_description': 'Nous vous proposons une gamme complète de services pour répondre à tous vos besoins avec excellence et discrétion.',
    'equipes_title': 'NOS ÉQUIPES',
    'alexandre_name': 'Alexandre Nasser',
    'alexandre_desc_1': 'Alexandre Nasser est spécialiste dans l\'accueil et la prise en charge de personnalités importantes lors d\'événements. Je gère le protocole, l\'agenda des invités, les déplacements, les taxis...',
    'alexandre_desc_2': 'Véritable couteau suisse, je m\'adapte à la clientèle et à vos demandes spécifiques.',
    'alexandre_desc_3': 'Collaborant avec HALTÉA, je peux vous orienter vers leurs services d\'accueil général et de conciergerie de luxe.',
    'illustration_1': 'Illustration 1',
    'illustration_2': 'Illustration 2',
    'illustration_3': 'Illustration 3',
    'illustration_4': 'Illustration 4',
    'role_1': 'Responsable Protocole / Clientèle VIP',
    'role_2': 'Chef Concierge',
    'role_3': 'Concierge qualifié',
    'role_4': 'Chasseurs et Groom Groomettes',
    
    // Realisations page
    'realisations_title': 'NOS RÉALISATIONS',
    'realisations_description': 'HALTÉA met son savoir-faire au service des plus grands événements internationaux : gestion du protocole, accompagnement Ultra-VIP et accueil des délégations officielles de différents pays.',
    'keyphrase_1': 'Protocolé & acceuil officiel',
    'keyphrase_2': 'Ultra VIP & Personnalisé',
    'keyphrase_3': 'Délégation internationale',
    'keyphrase_4': 'Coordination diplomatique & institutionnelle',
    
    // Contact page
    'contact_title': 'CONTACT',
    'contact_subtitle': 'Pour toute question ou demande, n\'hésitez pas à nous joindre.',
    'contact_info_title': 'Nos coordonnées',
    'form_title': 'Civilité',
    'form_choose': 'Choisir..',
    'form_madame': 'Madame',
    'form_monsieur': 'Monsieur',
    'form_name': 'Nom',
    'form_name_placeholder': 'Prénom',
    'form_email': 'Email',
    'form_email_placeholder': 'Email',
    'form_phone': 'Téléphone',
    'form_phone_placeholder': 'Téléphone',
    'form_message': 'Votre message',
    'form_message_placeholder': 'Envoyer ce message concernant cette formule. Vous acceptez notre politique de confidentialité.',
    'checkbox_text': 'Je souhaite recevoir des informations. J\'accepte notre politique de confidentialité.',
    'form_send': 'ENVOYER',
    'team_availability': 'Notre équipe est disponible du lundi au vendredi, de 9h à 18h.<br>Vous pouvez aussi nous écrire via ce formulaire, nous répondons sous 24h !'
};

function updateHomepageContent(language) {
    // Update homepage specific content
}

function updateConciergerieContent(language) {
    // Update conciergerie specific content
}

function updateServicesContent(language) {
    // Update services specific content
}

function updateRealisationsContent(language) {
    // Update realisations specific content
}

function updateContactContent(language) {
    // Update contact specific content
}

function showLanguageNotification(message) {
    showNotification(message);
}

// Photos Carousel Functionality
function initializePhotosCarousel() {
    const photosGrid = document.querySelector('.photos-grid');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const indicators = document.querySelectorAll('.indicator');
    
    if (!photosGrid || !prevBtn || !nextBtn) return;
    
    let currentSet = 0;
    const totalSets = 2; // 2 sets of 3 photos each
    
    function updateCarousel() {
        const translateX = -currentSet * 50; // 50% for each set (since we have 2 sets)
        photosGrid.style.transform = `translateX(${translateX}%)`;

        // Update indicators - both visual class and aria-current for screen readers
        indicators.forEach((indicator, index) => {
            const isActive = index === currentSet;
            indicator.classList.toggle('active', isActive);
            if (isActive) {
                indicator.setAttribute('aria-current', 'true');
            } else {
                indicator.removeAttribute('aria-current');
            }
        });
    }

    function nextSet() {
        currentSet = (currentSet + 1) % totalSets;
        updateCarousel();
    }

    function prevSet() {
        currentSet = (currentSet - 1 + totalSets) % totalSets;
        updateCarousel();
    }

    // Event listeners
    nextBtn.addEventListener('click', nextSet);
    prevBtn.addEventListener('click', prevSet);

    // Indicator clicks
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentSet = index;
            updateCarousel();
        });
    });

    // Keyboard support: Arrow Left / Right while focus is inside the carousel
    const carouselRoot = document.querySelector('.photos-section');
    if (carouselRoot) {
        carouselRoot.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextSet();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevSet();
            }
        });
    }

    // Initialize
    updateCarousel();
}
