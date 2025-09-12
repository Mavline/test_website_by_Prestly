// Main landing page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation
    initSmoothScrolling();
    
    // Add scroll animations
    initScrollAnimations();
    
    // Add particle effect
    createParticleEffect();
});

function scrollToTest() {
    const testSection = document.getElementById('test-section');
    testSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
    });
}

function startTest() {
    window.location.href = 'test.html';
}

function initSmoothScrolling() {
    // Smooth scrolling for all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe all major sections
    document.querySelectorAll('.benefit-card, .testimonial-card, .about-content, .cta-content').forEach(el => {
        observer.observe(el);
    });
}

function createParticleEffect() {
    const hero = document.querySelector('.hero');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(102, 126, 234, 0.3);
            border-radius: 50%;
            pointer-events: none;
            animation: float ${3 + Math.random() * 4}s infinite ease-in-out;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 2}s;
        `;
        hero.appendChild(particle);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
        25% { transform: translateY(-20px) translateX(10px); opacity: 0.7; }
        50% { transform: translateY(-10px) translateX(-10px); opacity: 1; }
        75% { transform: translateY(-30px) translateX(5px); opacity: 0.5; }
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .benefit-card,
    .testimonial-card {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .benefit-card.animate-in,
    .testimonial-card.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .about-content {
        opacity: 0;
        transform: translateX(-30px);
        transition: all 0.8s ease;
    }
    
    .about-content.animate-in {
        opacity: 1;
        transform: translateX(0);
    }
    
    .cta-content {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease;
    }
    
    .cta-content.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Stagger animation for benefit cards */
    .benefit-card:nth-child(1).animate-in { animation-delay: 0.1s; }
    .benefit-card:nth-child(2).animate-in { animation-delay: 0.2s; }
    .benefit-card:nth-child(3).animate-in { animation-delay: 0.3s; }
    
    /* Stagger animation for testimonial cards */
    .testimonial-card:nth-child(1).animate-in { animation-delay: 0.1s; }
    .testimonial-card:nth-child(2).animate-in { animation-delay: 0.2s; }
    .testimonial-card:nth-child(3).animate-in { animation-delay: 0.3s; }
    
    /* Hover effects */
    .hero-title {
        animation: pulse 3s ease-in-out infinite;
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
    
    /* Loading animation for buttons */
    .cta-button.loading {
        position: relative;
        color: transparent;
    }
    
    .cta-button.loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        border: 2px solid transparent;
        border-top: 2px solid white;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
    
    /* Enhanced mobile responsiveness */
    @media (max-width: 480px) {
        .hero-title {
            font-size: 2rem;
            line-height: 1.1;
        }
        
        .hero-subtitle {
            font-size: 1.1rem;
        }
        
        .benefit-card,
        .testimonial-card {
            padding: 2rem 1.5rem;
        }
        
        .about-achievements {
            flex-direction: column;
            gap: 1rem;
        }
        
        .achievement {
            flex-direction: row;
            text-align: left;
        }
        
        .achievement-number {
            margin-right: 1rem;
            margin-bottom: 0;
        }
    }
`;
document.head.appendChild(style);
