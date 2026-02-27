// Custom Cursor Implementation
const cursorGlow = document.querySelector('.cursor-glow');
const interactables = document.querySelectorAll('a, button, .project-card, .social-icon');

document.addEventListener('mousemove', (e) => {
    // Offset by half of cursor glow width/height (150px) to center it
    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top = `${e.clientY}px`;
});

// Cursor Hover Effects
interactables.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorGlow.style.transform = 'translate(-50%, -50%) scale(1.5)';
        cursorGlow.style.background = 'radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, transparent 70%)';
    });
    
    el.addEventListener('mouseleave', () => {
        cursorGlow.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorGlow.style.background = 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)';
    });
});

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Scroll Reveal Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Apply initial styles and observer to sections and cards
const revealElements = document.querySelectorAll('.glass-card, .section-title');
revealElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(50px)';
    el.style.transition = `all 0.8s cubic-bezier(0.25, 1, 0.5, 1) ${index * 0.1}s`;
    observer.observe(el);
});

// Glitch Text Effect logic
const glitchText = document.querySelector('.glitch');
setInterval(() => {
    glitchText.style.textShadow = `
        2px 0 #ff00c1, 
        -2px 0 #00fff9
    `;
    setTimeout(() => {
        glitchText.style.textShadow = 'none';
    }, 100);
}, 3000);
