
(function() {
  'use strict';

  // DOM Elements
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('nav');
  const contactForm = document.getElementById('contact-form');
  const navLinks = document.querySelectorAll('.nav__link, .footer__link');
  
  // State
  let isNavOpen = false;

  // Initialize app
  function init() {
    setupMobileNav();
    setupSmoothScrolling();
    setupScrollAnimations();
    setupFormValidation();
    setupAccessibility();
  }

  // Mobile Navigation
  function setupMobileNav() {
    if (!navToggle || !nav) return;

    navToggle.addEventListener('click', toggleNav);
    
    // Close nav when clicking nav links
    nav.addEventListener('click', (e) => {
      if (e.target.classList.contains('nav__link')) {
        closeNav();
      }
    });

    // Close nav on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isNavOpen) {
        closeNav();
        navToggle.focus();
      }
    });

    // Close nav when clicking outside
    document.addEventListener('click', (e) => {
      if (isNavOpen && !nav.contains(e.target) && !navToggle.contains(e.target)) {
        closeNav();
      }
    });
  }

  function toggleNav() {
    isNavOpen = !isNavOpen;
    updateNavState();
  }

  function closeNav() {
    isNavOpen = false;
    updateNavState();
  }

  function updateNavState() {
    navToggle.classList.toggle('nav-toggle--open', isNavOpen);
    nav.classList.toggle('nav--open', isNavOpen);
    navToggle.setAttribute('aria-expanded', isNavOpen);
    
    // Trap focus in mobile nav when open
    if (isNavOpen) {
      trapFocus(nav);
    }
  }

  // Smooth Scrolling
  function setupSmoothScrolling() {
    navLinks.forEach(link => {
      link.addEventListener('click', handleSmoothScroll);
    });
    
    // Hero CTA button
    const heroBtn = document.querySelector('.hero__cta');
    if (heroBtn) {
      heroBtn.addEventListener('click', handleSmoothScroll);
    }
  }

  function handleSmoothScroll(e) {
    const href = e.target.getAttribute('href');
    
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Close mobile nav if open
        if (isNavOpen) {
          closeNav();
        }
      }
    }
  }

  // Scroll Animations
  function setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    
    // Observe sections for fade-in animations
    const animatedElements = document.querySelectorAll('.about, .projects, .skills, .contact, .project-card');
    animatedElements.forEach(el => {
      el.classList.add('fade-in');
      observer.observe(el);
    });
  }

  function handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }

  // Form Validation
  function setupFormValidation() {
    if (!contactForm) return;

    contactForm.addEventListener('submit', handleFormSubmit);
    
    // Real-time validation
    const inputs = contactForm.querySelectorAll('.form-input');
    inputs.forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => clearFieldError(input));
    });
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const message = formData.get('message').trim();
    
    let isValid = true;
    
    // Validate name
    if (!name) {
      showFieldError('name', 'Name is required');
      isValid = false;
    } else if (name.length < 2) {
      showFieldError('name', 'Name must be at least 2 characters');
      isValid = false;
    }
    
    // Validate email
    if (!email) {
      showFieldError('email', 'Email is required');
      isValid = false;
    } else if (!isValidEmail(email)) {
      showFieldError('email', 'Please enter a valid email address');
      isValid = false;
    }
    
    // Validate message
    if (!message) {
      showFieldError('message', 'Message is required');
      isValid = false;
    } else if (message.length < 10) {
      showFieldError('message', 'Message must be at least 10 characters');
      isValid = false;
    }
    
    if (isValid) {
      submitForm(formData);
    }
  }

  function validateField(input) {
    const value = input.value.trim();
    const fieldName = input.name;
    
    clearFieldError(input);
    
    switch (fieldName) {
      case 'name':
        if (!value) {
          showFieldError(fieldName, 'Name is required');
        } else if (value.length < 2) {
          showFieldError(fieldName, 'Name must be at least 2 characters');
        }
        break;
      case 'email':
        if (!value) {
          showFieldError(fieldName, 'Email is required');
        } else if (!isValidEmail(value)) {
          showFieldError(fieldName, 'Please enter a valid email address');
        }
        break;
      case 'message':
        if (!value) {
          showFieldError(fieldName, 'Message is required');
        } else if (value.length < 10) {
          showFieldError(fieldName, 'Message must be at least 10 characters');
        }
        break;
    }
  }

  function showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const inputElement = document.getElementById(fieldName);
    
    if (errorElement && inputElement) {
      errorElement.textContent = message;
      inputElement.classList.add('form-input--error');
      inputElement.setAttribute('aria-describedby', `${fieldName}-error`);
    }
  }

  function clearFieldError(input) {
    const fieldName = input.name;
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    if (errorElement) {
      errorElement.textContent = '';
      input.classList.remove('form-input--error');
      input.removeAttribute('aria-describedby');
    }
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function submitForm(formData) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    contactForm.classList.add('loading');
    
    // Simulate form submission (replace with actual endpoint)
    setTimeout(() => {
      // Reset form
      contactForm.reset();
      
      // Show success message
      showSuccessMessage();
      
      // Reset button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      contactForm.classList.remove('loading');
    }, 2000);
  }

  function showSuccessMessage() {
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.style.cssText = `
      background-color: var(--accent2);
      color: white;
      padding: 1rem;
      border-radius: var(--border-radius);
      margin-bottom: 1rem;
      text-align: center;
      font-weight: 500;
    `;
    successMessage.textContent = 'Thank you! Your message has been sent successfully.';
    
    contactForm.insertBefore(successMessage, contactForm.firstChild);
    
    // Remove success message after 5 seconds
    setTimeout(() => {
      successMessage.remove();
    }, 5000);
  }

  // Accessibility Enhancements
  function setupAccessibility() {
    // Skip to main content link
    addSkipLink();
    
    // Update focus indicators for dynamic content
    updateFocusIndicators();
    
    // Announce page changes for screen readers
    announcePageChanges();
  }

  function addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link sr-only';
    skipLink.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
      background: var(--accent);
      color: white;
      padding: 0.5rem 1rem;
      text-decoration: none;
      transform: translateY(-100%);
      transition: transform 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.transform = 'translateY(0)';
      skipLink.classList.remove('sr-only');
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.transform = 'translateY(-100%)';
      skipLink.classList.add('sr-only');
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main landmark
    const main = document.querySelector('main');
    if (main) {
      main.id = 'main';
    }
  }

  function updateFocusIndicators() {
    // Enhanced focus indicators for interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input, textarea');
    
    interactiveElements.forEach(element => {
      element.addEventListener('focus', () => {
        element.style.outline = '2px solid var(--accent2)';
        element.style.outlineOffset = '2px';
      });
      
      element.addEventListener('blur', () => {
        element.style.outline = '';
        element.style.outlineOffset = '';
      });
    });
  }

  function announcePageChanges() {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
    
    // Announce section changes during navigation
    const sections = document.querySelectorAll('section[id]');
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const sectionTitle = entry.target.querySelector('h2, h1');
          if (sectionTitle) {
            liveRegion.textContent = `Now viewing: ${sectionTitle.textContent}`;
          }
        }
      });
    }, {
      threshold: 0.5
    });
    
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Focus trap utility for modal/nav
  function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    function handleTabKey(e) {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
    
    element.addEventListener('keydown', handleTabKey);
    firstElement.focus();
  }

  // Debounce utility
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Performance optimization: debounced scroll handler
  const debouncedScrollHandler = debounce(() => {
    // Add scroll-based functionality here if needed
  }, 100);

  window.addEventListener('scroll', debouncedScrollHandler);

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();


