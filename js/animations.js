// ===== ANIMATIONS MODULE =====
// Handles scroll animations, element animations, and visual effects

const Animations = {
    settings: {
        animationsEnabled: true,
        observerThreshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    },

    // Initialize animations
    init() {
        this.loadSettings();
        this.initScrollAnimations();
        this.initCounterAnimations();
        this.initHoverEffects();
        this.initProgressAnimations();

        // Add loaded class to body after small delay
        setTimeout(() => {
            document.body.classList.add('animations-ready');
        }, 100);
    },

    // Load animation settings
    loadSettings() {
        const settings = Storage.getSettings();
        this.settings.animationsEnabled = settings.animationsEnabled !== false;
    },

    // Intersection Observer for scroll animations
    initScrollAnimations() {
        if (!this.settings.animationsEnabled) return;

        const observerOptions = {
            threshold: this.settings.observerThreshold,
            rootMargin: this.settings.rootMargin
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = el.dataset.delay || 0;

                    setTimeout(() => {
                        el.classList.add('visible');
                    }, parseInt(delay));

                    // Unobserve after animation
                    observer.unobserve(el);
                }
            });
        }, observerOptions);

        // Observe all elements with animate-on-scroll class
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    },

    // Animate counters (numbers that count up)
    initCounterAnimations() {
        if (!this.settings.animationsEnabled) return;

        const counters = document.querySelectorAll('[data-counter]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    },

    // Animate a single counter
    animateCounter(element) {
        const target = parseInt(element.dataset.counter);
        const duration = parseInt(element.dataset.duration) || 1000;
        const start = 0;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * easeOut);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };

        requestAnimationFrame(updateCounter);
    },

    // Initialize progress bar animations
    initProgressAnimations() {
        if (!this.settings.animationsEnabled) return;

        const progressBars = document.querySelectorAll('.progress-fill, .progress-circle, .progress-fill-bar');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateProgressBar(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        progressBars.forEach(bar => observer.observe(bar));
    },

    // Animate progress bar
    animateProgressBar(element) {
        const targetWidth = element.dataset.targetWidth;
        if (targetWidth) {
            element.style.width = targetWidth + '%';
            element.classList.add('animated');
        } else if (element.classList.contains('progress-circle')) {
            const circumference = 2 * Math.PI * 90; // radius = 90
            const offset = circumference - (parseFloat(element.dataset.progress) / 100) * circumference;
            element.style.strokeDashoffset = offset;
            element.classList.add('animated');
        }
    },

    // Initialize hover effects
    initHoverEffects() {
        // Add ripple effect to buttons
        document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.createRipple(e);
            });
        });
    },

    // Create ripple effect
    createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
        `;

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    },

    // Flash effect for card updates
    flashCard(cardElement, color = 'var(--success)') {
        const originalBg = cardElement.style.background;
        cardElement.style.transition = 'background 0.3s ease';

        cardElement.style.background = color;
        setTimeout(() => {
            cardElement.style.background = originalBg;
        }, 300);
    },

    // Celebration animation (confetti effect)
    celebrate(targetElement) {
        if (!this.settings.animationsEnabled) return;

        const rect = targetElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-particle';
            confetti.style.cssText = `
                position: fixed;
                left: ${centerX}px;
                top: ${centerY}px;
                width: 10px;
                height: 10px;
                background: ${this.getRandomColor()};
                border-radius: 2px;
                pointer-events: none;
                z-index: 9999;
                animation: confetti-fall 1s ease-out forwards;
                animation-delay: ${Math.random() * 0.5}s;
            `;
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 1500);
        }
    },

    // Get random color for confetti
    getRandomColor() {
        const colors = [
            '#2ecc71', '#3498db', '#9b59b6', '#e74c3c',
            '#f39c12', '#1abc9c', '#e67e22', '#34495e'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    // Smooth scroll to element
    scrollToElement(selector, offset = 0) {
        const element = document.querySelector(selector);
        if (element) {
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
                top: elementPosition - offset,
                behavior: 'smooth'
            });
        }
    },

    // Pulse animation on element
    pulseElement(element, duration = 600) {
        element.style.animation = 'pulse ' + duration + 'ms ease';
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    },

    // Add loading state to button
    setButtonLoading(button, loading = true) {
        if (loading) {
            const originalText = button.innerHTML;
            button.dataset.originalText = originalText;
            button.innerHTML = '<span class="spinner"></span>';
            button.disabled = true;
        } else {
            button.innerHTML = button.dataset.originalText;
            button.disabled = false;
        }
    },

    // Shake animation for error
    shakeElement(element) {
        element.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    },

    // Refresh all animations (call after DOM update)
    refresh() {
        this.initScrollAnimations();
        this.initCounterAnimations();
        this.initProgressAnimations();
    }
};

// Add CSS for confetti animation dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        0% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg);
        }
        100% {
            opacity: 0;
            transform: translate(${Math.random() * 200 - 100}px, 300px) rotate(720deg);
        }
    }

    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);
