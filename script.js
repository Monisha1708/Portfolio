const observerOptions = {
  threshold: 0.2,
};

const animateSkillChip = (chip) => {
  if (chip.dataset.animated) return;

  const valueNode = chip.querySelector('.skill-value');
  if (!valueNode) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targetValue = Number.parseInt(chip.dataset.level ?? '0', 10);
  if (Number.isNaN(targetValue)) return;

  if (prefersReducedMotion) {
    chip.style.setProperty('--level', `${targetValue}%`);
    valueNode.textContent = `${targetValue}%`;
    chip.dataset.animated = 'true';
    return;
  }

  const duration = 1200;
  const start = performance.now();

  chip.style.setProperty('--level', `${targetValue}%`);

  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const current = Math.round(progress * targetValue);
    valueNode.textContent = `${current}%`;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      valueNode.textContent = `${targetValue}%`;
      chip.dataset.animated = 'true';
    }
  };

  requestAnimationFrame(update);
};

const animateSkillItem = (item) => {
  if (item.dataset.animated) return;

  const fill = item.querySelector('.skill-item__fill');
  const valueNode = item.querySelector('.skill-item__value');
  if (!fill || !valueNode) return;

  const targetValue = Number.parseInt(item.dataset.level ?? '0', 10);
  if (Number.isNaN(targetValue)) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const applyValue = (value) => {
    fill.style.setProperty('width', `${value}%`);
    valueNode.textContent = `${value}%`;
  };

  if (prefersReducedMotion) {
    applyValue(targetValue);
    item.dataset.animated = 'true';
    return;
  }

  const duration = 1200;
  const start = performance.now();

  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const current = Math.round(progress * targetValue);
    applyValue(current);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      applyValue(targetValue);
      item.dataset.animated = 'true';
    }
  };

  requestAnimationFrame(update);
};

const animateElements = () => {
  const nodes = document.querySelectorAll('[data-animate]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        if (entry.target.classList.contains('skill-chip')) {
          animateSkillChip(entry.target);
        }
        if (entry.target.classList.contains('skill-item')) {
          animateSkillItem(entry.target);
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  nodes.forEach((node) => observer.observe(node));
};

const setupHeaderBehaviour = () => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastScrollY = window.scrollY;

  const handleScroll = () => {
    const currentY = window.scrollY;
    const shouldElevate = currentY > 10;

    header.classList.toggle('elevated', shouldElevate);

    const isScrollingDown = currentY > lastScrollY;
    const hidden = currentY > 150 && isScrollingDown;

    header.classList.toggle('header-hidden', hidden);
    lastScrollY = currentY;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
};

const highlightCurrentNav = () => {
  const links = document.querySelectorAll('.nav-links a');
  const { pathname } = window.location;

  links.forEach((link) => {
    try {
      const url = new URL(link.href);
      const isActive = url.pathname === pathname || (pathname === '/' && url.pathname.endsWith('index.html'));
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    } catch (error) {
      link.setAttribute('aria-current', 'false');
    }
  });
};

const updateFooterYear = () => {
  const footerYear = document.querySelector('#footer-year');
  if (!footerYear) return;

  footerYear.textContent = new Date().getFullYear();
};

const handleContactForm = () => {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const originalLabel = button.textContent;
    const formData = new FormData(form);
    const name = (formData.get('name') ?? '').toString().trim();
    const email = (formData.get('email') ?? '').toString().trim();
    const organization = (formData.get('organization') ?? '').toString().trim();
    const message = (formData.get('message') ?? '').toString().trim();

    const subjectParts = [name ? `Message from ${name}` : 'Portfolio Inquiry'];
    if (organization) subjectParts.push(`(${organization})`);
    const subject = subjectParts.join(' ');

    const bodyLines = [
      name ? `Name: ${name}` : null,
      email ? `Email: ${email}` : null,
      organization ? `Organization: ${organization}` : null,
      '',
      message || 'I would like to connect with you.'
    ].filter(Boolean);

    const mailtoUrl = `mailto:monishaloganathan1708@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

    button.disabled = true;
    button.textContent = 'Opening email client...';

    window.location.href = mailtoUrl;

    setTimeout(() => {
      button.disabled = false;
      button.textContent = originalLabel;
    }, 2000);
  });
};

const initRoleAnimation = () => {
  const roles = ['Web Developer', 'UI/UX Designer'];
  const typingElement = document.querySelector('.typing');
  const cursorElement = document.querySelector('.cursor');
  const dynamicTextElement = document.querySelector('.dynamic-text');
  
  if (!typingElement || !cursorElement) return;
  
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 50; // Faster typing speed (reduced from 150ms)
  let deleteSpeed = 30; // Faster deleting speed (reduced from 50ms)
  let pauseBeforeDelete = 1000; // Shorter pause before deleting (reduced from 2000ms)
  let pauseBeforeType = 300; // Shorter pause before typing next role (reduced from 500ms)
  
  const type = () => {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
      // Faster deletion with slight random variation for more natural feel
      typingElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      
      if (charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        // Add a small random delay before typing next word
        setTimeout(type, pauseBeforeType + Math.random() * 200);
        return;
      }
      
      // Slight random variation in delete speed
      setTimeout(type, deleteSpeed + (Math.random() * 20 - 10));
    } else {
      // Typing with slight random variation for more natural feel
      typingElement.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      
      if (charIndex === currentRole.length) {
        isDeleting = true;
        // Add a small random delay before starting to delete
        setTimeout(type, pauseBeforeDelete + Math.random() * 300);
        return;
      }
      
      // Slight random variation in typing speed
      setTimeout(type, typingSpeed + (Math.random() * 20 - 10));
    }
  };
  
  // Start the animation immediately with a slight delay
  setTimeout(type, 300);
  
  // Add a subtle hover effect
  if (dynamicTextElement) {
    dynamicTextElement.addEventListener('mouseover', () => {
      cursorElement.style.animation = 'none';
      cursorElement.style.transform = 'scale(1.2)';
      cursorElement.style.color = '#a8d8ff';
    });
    
    dynamicTextElement.addEventListener('mouseout', () => {
      cursorElement.style.animation = 'blink 0.7s step-end infinite, pulse 1s infinite alternate';
      cursorElement.style.transform = 'translateY(1px)';
      cursorElement.style.color = '#76c4ff';
    });
  }
};

const init = () => {
  animateElements();
  setupHeaderBehaviour();
  highlightCurrentNav();
  updateFooterYear();
  handleContactForm();
  initRoleAnimation();
};

document.addEventListener('DOMContentLoaded', init);
