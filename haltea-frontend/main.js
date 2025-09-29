// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
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

        // Hide/show header on scroll
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
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

    // Language flag switching
    const flags = document.querySelectorAll('.flag');
    flags.forEach(flag => {
        flag.addEventListener('click', function() {
            // Remove active class from all flags
            flags.forEach(f => f.classList.remove('active'));
            // Add active class to clicked flag
            this.classList.add('active');
        });
    });

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

    // Parallax effect for hero background
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroBackground = document.querySelector('.hero-background');
        if (heroBackground) {
            heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

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
        // Validation rules
        const validationRules = {
            civilite: {
                required: true,
                message: 'Veuillez sélectionner votre civilité'
            },
            nom: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-ZÀ-ÿ\s\-']+$/,
                message: 'Le nom doit contenir entre 2 et 50 caractères (lettres uniquement)'
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Veuillez entrer une adresse email valide'
            },
            telephone: {
                required: true,
                pattern: /^(?:\+33\s?[1-9](?:\s?\d{2}){4}|0[1-9](?:\s?\d{2}){4})$/,
                message: 'Format valide : 06 12 34 56 78 ou +33 6 12 34 56 78'
            },
            message: {
                required: true,
                minLength: 10,
                maxLength: 1000,
                message: 'Le message doit contenir entre 10 et 1000 caractères'
            },
            consent: {
                required: true,
                message: 'Vous devez accepter la politique de confidentialité'
            }
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
        }

        // Show error message
        function showError(field, message) {
            removeErrorMessages(field);
            field.classList.add('error');
            const errorMessage = createErrorMessage(message);
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

        // Form submission with validation
        submitButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            let isValid = true;
            const formData = {};

            // Validate all fields
            Object.keys(validationRules).forEach(fieldName => {
                const field = contactForm.querySelector(`[name="${fieldName}"]`);
                if (field) {
                    const fieldValid = validateField(fieldName, field);
                    if (!fieldValid) {
                        isValid = false;
                    }
                    formData[fieldName] = field.type === 'checkbox' ? field.checked : field.value.trim();
                }
            });

            if (isValid) {
                // Show loading state
                const originalText = this.querySelector('.button-text').textContent;
                this.querySelector('.button-text').textContent = 'ENVOI EN COURS...';
                this.disabled = true;
                this.style.opacity = '0.7';

                // Create ripple effect
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);

                // Simulate form submission (replace with actual submission logic)
                setTimeout(() => {
                    console.log('Form submitted successfully!', formData);
                    
                    // Show success message
                    showSuccessMessage();
                    
                    // Reset form
                    contactForm.reset();
                    
                    // Reset button
                    this.querySelector('.button-text').textContent = originalText;
                    this.disabled = false;
                    this.style.opacity = '1';
                    
                }, 2000);
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
            successDiv.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="10" stroke="#4CAF50" stroke-width="2"/>
                </svg>
                <span>Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.</span>
            `;
            
            contactForm.insertBefore(successDiv, contactForm.firstChild);
            
            setTimeout(() => {
                successDiv.remove();
            }, 5000);
        }

        // Show general error message
        function showGeneralError() {
            const existingMessage = document.querySelector('.form-message');
            if (existingMessage) existingMessage.remove();

            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-message error';
            errorDiv.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#f44336" stroke-width="2"/>
                    <line x1="15" y1="9" x2="9" y2="15" stroke="#f44336" stroke-width="2"/>
                    <line x1="9" y1="9" x2="15" y2="15" stroke="#f44336" stroke-width="2"/>
                </svg>
                <span>Veuillez corriger les erreurs dans le formulaire.</span>
            `;
            
            contactForm.insertBefore(errorDiv, contactForm.firstChild);
            
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
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

    // Language flag switching for contact page
    const flagButtons = document.querySelectorAll('.flag-btn');
    flagButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            flagButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Language switching logic would go here
            const lang = this.dataset.lang;
            console.log('Language switched to:', lang);
        });
    });

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
