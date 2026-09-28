/**
 * GOUTHAMAN K G - PORTFOLIO INTERACTIVITY & 3D SYSTEM
 * Modern Web Architecture: WebGL 3D, Material UI, Fluid Animations & Scroll Effects
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCustomCursor();
  initThreeBackground();
  initScrollProgress();
  initHeaderAndNavSpy();
  initDynamicTyping();
  init3DTiltEffects();
  initScrollReveals();
  initStatCounters();
  initMaterialRipples();
  initProjectFiltering();
  initMaterialFAB();
  initDialogs();
  initClipboardAndContactForm();
  initMobileDrawer();
  updateCurrentYear();
});

/* --------------------------------------------------------------------------
   1. Theme Management (Dark / Light Mode)
   -------------------------------------------------------------------------- */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle?.querySelector('.theme-icon');
  const savedTheme = localStorage.getItem('goutham_theme') || 'dark';

  document.body.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme, themeIcon);

  themeToggle?.addEventListener('click', (e) => {
    createRipple(e);
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('goutham_theme', newTheme);
    updateThemeIcon(newTheme, themeIcon);
    showSnackbar(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'palette');
  });
}

function updateThemeIcon(theme, iconElement) {
  if (!iconElement) return;
  iconElement.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
}

/* --------------------------------------------------------------------------
   2. Desktop Custom Cursor Follower with Spring Physics
   -------------------------------------------------------------------------- */
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const outline = document.getElementById('cursor-outline');
  if (!dot || !outline || window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let outlineX = mouseX;
  let outlineY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function renderCursor() {
    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;
    outline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover detection on interactive items
  const interactives = document.querySelectorAll('a, button, input, textarea, [data-tilt], .segment-btn, .skill-chip');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* --------------------------------------------------------------------------
   3. Interactive 3D WebGL Background (Three.js Constellation & Geometric Depth)
   -------------------------------------------------------------------------- */
function initThreeBackground() {
  const canvas = document.getElementById('three-bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 40;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create circular soft glowing sprite texture to prevent square block rendering
  function createParticleTexture() {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const ctx = pCanvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.25, 'rgba(165, 180, 252, 0.85)');
    gradient.addColorStop(0.6, 'rgba(99, 102, 241, 0.35)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();
    return new THREE.CanvasTexture(pCanvas);
  }

  // Particle Constellation Geometry
  const particleCount = 180;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 110;
    positions[i + 1] = (Math.random() - 0.5) * 90;
    // Push particles deeper into the background so they never get close to the camera as huge blocks
    positions[i + 2] = -Math.random() * 45 - 5;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Small, subtle luminous circular star points
  const pointsMaterial = new THREE.PointsMaterial({
    color: 0xa5b4fc,
    size: 0.45,
    map: createParticleTexture(),
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(geometry, pointsMaterial);
  scene.add(particleSystem);

  // 3D Wireframe Geometric Torus Ring in Background
  const torusGeo = new THREE.TorusGeometry(18, 5, 16, 50);
  const torusMat = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    wireframe: true,
    transparent: true,
    opacity: 0.12
  });
  const torusMesh = new THREE.Mesh(torusGeo, torusMat);
  torusMesh.position.set(24, -10, -15);
  torusMesh.rotation.x = Math.PI / 4;
  scene.add(torusMesh);

  // Floating Icosahedron
  const icoGeo = new THREE.IcosahedronGeometry(12, 1);
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0x8b5cf6,
    wireframe: true,
    transparent: true,
    opacity: 0.1
  });
  const icoMesh = new THREE.Mesh(icoGeo, icoMat);
  icoMesh.position.set(-28, 12, -20);
  scene.add(icoMesh);

  // Mouse Interactivity
  let targetMouseX = 0;
  let targetMouseY = 0;
  let windowHalfX = window.innerWidth / 2;
  let windowHalfY = window.innerHeight / 2;

  window.addEventListener('mousemove', (event) => {
    targetMouseX = (event.clientX - windowHalfX) * 0.0008;
    targetMouseY = (event.clientY - windowHalfY) * 0.0008;
  });

  // Scroll Interaction
  let scrollProgress = 0;
  window.addEventListener('scroll', () => {
    scrollProgress = window.scrollY * 0.001;
  }, { passive: true });

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    particleSystem.rotation.y = elapsedTime * 0.04 + targetMouseX;
    particleSystem.rotation.x = elapsedTime * 0.02 + targetMouseY;

    torusMesh.rotation.x += 0.003;
    torusMesh.rotation.y += 0.005;
    torusMesh.position.y = -10 + Math.sin(elapsedTime * 0.6) * 3 - scrollProgress * 5;

    icoMesh.rotation.x -= 0.004;
    icoMesh.rotation.z += 0.003;
    icoMesh.position.y = 12 + Math.cos(elapsedTime * 0.5) * 2 - scrollProgress * 3;

    camera.position.x += (targetMouseX * 10 - camera.position.x) * 0.05;
    camera.position.y += (-targetMouseY * 10 - camera.position.y) * 0.05;

    renderer.render(scene, camera);
  }
  animate();

  // Resize Listener
  window.addEventListener('resize', () => {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* --------------------------------------------------------------------------
   4. Scroll Progress Bar
   -------------------------------------------------------------------------- */
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) : 0;
    progressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   5. Sticky Header & Scrollspy Navigation with Pill Indicator
   -------------------------------------------------------------------------- */
function initHeaderAndNavSpy() {
  const header = document.getElementById('main-header');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link');
  const indicator = document.getElementById('nav-indicator');
  const sections = document.querySelectorAll('section[id]');

  // Header scroll state
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  // Update Indicator Position to Active Link
  function moveIndicator(targetLink) {
    if (!indicator || !targetLink) return;
    const rect = targetLink.getBoundingClientRect();
    const parentRect = targetLink.closest('.desktop-nav').getBoundingClientRect();
    indicator.style.width = `${rect.width}px`;
    indicator.style.left = `${rect.left - parentRect.left}px`;
    indicator.style.opacity = '1';
  }

  // Scrollspy via IntersectionObserver
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            moveIndicator(link);
          }
        });
      }
    });
  }, {
    rootMargin: '-30% 0px -50% 0px'
  });

  sections.forEach(sec => spyObserver.observe(sec));

  // Hover effect on desktop nav
  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => moveIndicator(link));
  });

  const desktopNav = document.querySelector('.desktop-nav');
  desktopNav?.addEventListener('mouseleave', () => {
    const activeLink = document.querySelector('.desktop-nav .nav-link.active');
    if (activeLink) moveIndicator(activeLink);
  });
}

/* --------------------------------------------------------------------------
   6. Dynamic Text Typing Animation
   -------------------------------------------------------------------------- */
function initDynamicTyping() {
  const element = document.getElementById('dynamic-typing');
  if (!element) return;

  const roles = [
    'Enterprise ASP.NET MVC & C# Solutions',
    'NBFC, Chitty & NIDHI FinTech Platforms',
    'HRMS, Inventory & Workflow ERP Suites',
    'SQL Server Database & LINQ Architecture',
    'Ticketing & Enterprise Automation Engines'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 70;

  function typeCycle() {
    const currentText = roles[roleIndex];

    if (isDeleting) {
      element.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 35;
    } else {
      element.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 75;
    }

    if (!isDeleting && charIndex === currentText.length) {
      typingSpeed = 2200; // Pause at end of sentence
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 400; // Pause before new word
    }

    setTimeout(typeCycle, typingSpeed);
  }

  typeCycle();
}

/* --------------------------------------------------------------------------
   7. Movement-Based 3D Tilt Card Effect
   -------------------------------------------------------------------------- */
function init3DTiltEffects() {
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  const tiltCards = document.querySelectorAll('[data-tilt]');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

      // Set reflection coordinates
      const mouseXPercent = (x / rect.width) * 100;
      const mouseYPercent = (y / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${mouseXPercent}%`);
      card.style.setProperty('--mouse-y', `${mouseYPercent}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* --------------------------------------------------------------------------
   8. IntersectionObserver Scroll Reveal Animations
   -------------------------------------------------------------------------- */
function initScrollReveals() {
  const reveals = document.querySelectorAll('.reveal-on-scroll');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => revealObserver.observe(el));
}

/* --------------------------------------------------------------------------
   9. Animated Live Stat Counters
   -------------------------------------------------------------------------- */
function initStatCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  let hasAnimated = false;

  const statsSection = document.getElementById('stats');
  if (!statsSection) return;

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        statNumbers.forEach(stat => {
          const target = parseInt(stat.getAttribute('data-target') || '0', 10);
          animateCount(stat, target, 1600);
        });
      }
    });
  }, { threshold: 0.3 });

  countObserver.observe(statsSection);
}

function animateCount(element, target, duration) {
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    // Smooth easeOutExpo
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    element.textContent = Math.floor(easeProgress * target);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = target;
    }
  }

  requestAnimationFrame(step);
}

/* --------------------------------------------------------------------------
   10. Material Ripple Effect for Interactive Elements
   -------------------------------------------------------------------------- */
function initMaterialRipples() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.ripple-btn');
    if (btn) {
      createRipple(e, btn);
    }
  });
}

function createRipple(event, element) {
  const target = element || event.currentTarget;
  if (!target) return;

  const rect = target.getBoundingClientRect();
  const circle = document.createElement('span');
  const diameter = Math.max(rect.width, rect.height);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - rect.left - radius}px`;
  circle.style.top = `${event.clientY - rect.top - radius}px`;
  circle.classList.add('ripple-effect');

  const existingRipple = target.querySelector('.ripple-effect');
  if (existingRipple) {
    existingRipple.remove();
  }

  target.appendChild(circle);

  setTimeout(() => {
    circle.remove();
  }, 600);
}

/* --------------------------------------------------------------------------
   11. Project Filtering (Segmented Tabs)
   -------------------------------------------------------------------------- */
function initProjectFiltering() {
  const filterButtons = document.querySelectorAll('.segment-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      createRipple(e);
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px) scale(0.96)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   12. Material Floating Action Button (FAB) Speed Dial
   -------------------------------------------------------------------------- */
function initMaterialFAB() {
  const fabContainer = document.getElementById('fab-container');
  const fabMainBtn = document.getElementById('fab-main-btn');
  const fabBackTop = document.getElementById('fab-back-top');

  fabMainBtn?.addEventListener('click', (e) => {
    createRipple(e);
    fabContainer?.classList.toggle('open');
  });

  fabBackTop?.addEventListener('click', (e) => {
    createRipple(e);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fabContainer?.classList.remove('open');
  });

  // Close FAB when clicking outside
  document.addEventListener('click', (e) => {
    if (!fabContainer?.contains(e.target)) {
      fabContainer?.classList.remove('open');
    }
  });
}

/* --------------------------------------------------------------------------
   13. Dialog Modals (Project Deep-Dive & Resume Summary)
   -------------------------------------------------------------------------- */
function initDialogs() {
  // Project Details Dialog
  const projectDialog = document.getElementById('project-dialog');
  const dialogCloseBtn = document.getElementById('dialog-close-btn');
  const dialogActionBtn = document.getElementById('dialog-action-btn');
  const dialogTitle = document.getElementById('dialog-title');
  const dialogCategory = document.getElementById('dialog-category');
  const dialogBody = document.getElementById('dialog-body');

  const projectData = {
    fintech: {
      category: 'FinTech & Core Banking',
      title: 'NBFC, Chitty & NIDHI Banking Platform',
      content: `
        <p>A flagship financial technology portal built for registered Non-Banking Financial Companies (NBFCs), Chitty Funds, and NIDHI banking institutions in Kerala.</p>
        <h4>Core Architecture & Responsibilities</h4>
        <ul>
          <li><strong>Auction Computation Engine:</strong> Automated real-time subscriber dividend algorithms, auction bid discounting, and prize money payouts.</li>
          <li><strong>Multi-Branch Loan Ledgers:</strong> Automated daily interest calculation, EMI repayment schedules, penalty rules, and multi-tier security mortgages.</li>
          <li><strong>API Gateways:</strong> Direct integration with banking payment gateways, automated SMS OTP verification, and secure KYC validation workflows.</li>
          <li><strong>Audit Compliance:</strong> Detailed audit trail logging conforming strictly to financial regulatory accounting standards.</li>
        </ul>
        <h4>Technical Stack</h4>
        <p>ASP.NET MVC, C#, SQL Server, LINQ, HTML5/CSS3, jQuery, RESTful APIs, Visual Studio.</p>
      `
    },
    erp: {
      category: 'Enterprise ERP & HRMS',
      title: 'Enterprise HR Management & Inventory ERP Suite',
      content: `
        <p>An enterprise-grade operational management suite built to streamline internal company workforce workflows and warehouse stock supply chains.</p>
        <h4>System Highlights</h4>
        <ul>
          <li><strong>Workforce Scheduling & Payroll:</strong> Automated biometric attendance synchronization, monthly leave quotas, and automated pay-slip generation.</li>
          <li><strong>Multi-Location Inventory:</strong> Stock ledger tracking inventory movement between multiple branches, automated re-order triggers, and asset valuation.</li>
          <li><strong>Role-Based Access:</strong> Multi-tier permission hierarchy securing administrative financial records from unauthorized access.</li>
        </ul>
        <h4>Technical Stack</h4>
        <p>ASP.NET, C#, SQL Server, LINQ, JavaScript, jQuery, CSS3, Visual Studio.</p>
      `
    },
    ticketing: {
      category: 'Task Operations & Support',
      title: 'Work Management & Ticketing System',
      content: `
        <p>A dedicated work management and task tracking application built to manage customer support requests, SLA turnaround times, and internal technical team dispatching.</p>
        <h4>Core Capabilities</h4>
        <ul>
          <li><strong>SLA Priority Dispatching:</strong> Automated classification and routing of tickets based on urgency, customer tier, and department backlog.</li>
          <li><strong>Lifecycle Tracking:</strong> Transparent status audit log from ticket creation, debugging, QA verification, to resolution closure.</li>
          <li><strong>Team Productivity Metrics:</strong> Granular resolution analytics and engineer workload distribution.</li>
        </ul>
        <h4>Technical Stack</h4>
        <p>ASP.NET MVC, C#, SQL Server, LINQ, JavaScript, jQuery, HTML5.</p>
      `
    },
    automation: {
      category: 'Process Automation & Gateways',
      title: 'Third-Party API Integration & Automation Engine',
      content: `
        <p>Robust backend integration pipelines engineered to connect third-party business services, background automation routines, and data synchronization jobs.</p>
        <h4>Key Implementations</h4>
        <ul>
          <li><strong>Payment & SMS Gateways:</strong> Direct API handshakes with payment providers and SMS notification gateways for real-time customer transactional alerts.</li>
          <li><strong>Batch Automation Routines:</strong> Scheduled background processes for interest calculation, end-of-day reconciliation, and database maintenance.</li>
          <li><strong>Query Optimization:</strong> In-depth SQL indexing and LINQ refactoring to accelerate high-volume transaction processing.</li>
        </ul>
        <h4>Technical Stack</h4>
        <p>C#, ASP.NET Web API, SQL Server, LINQ, REST APIs, Windows/Linux Environments.</p>
      `
    }
  };

  document.querySelectorAll('.project-modal-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      createRipple(e);
      const projectId = trigger.getAttribute('data-project');
      const data = projectData[projectId];
      if (data && projectDialog) {
        dialogCategory.textContent = data.category;
        dialogTitle.textContent = data.title;
        dialogBody.innerHTML = data.content;
        projectDialog.showModal();
      }
    });
  });

  dialogCloseBtn?.addEventListener('click', () => projectDialog?.close());
  dialogActionBtn?.addEventListener('click', () => projectDialog?.close());

  // Close on backdrop click
  projectDialog?.addEventListener('click', (e) => {
    const dialogDimensions = projectDialog.getBoundingClientRect();
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      projectDialog.close();
    }
  });

  // Resume Brief Dialog
  const resumeDialog = document.getElementById('resume-dialog');
  const heroResumeBtn = document.getElementById('hero-resume-btn');
  const resumeCloseBtn = document.getElementById('resume-close-btn');
  const resumeDismissBtn = document.getElementById('resume-dismiss-btn');

  heroResumeBtn?.addEventListener('click', (e) => {
    createRipple(e);
    resumeDialog?.showModal();
  });

  resumeCloseBtn?.addEventListener('click', () => resumeDialog?.close());
  resumeDismissBtn?.addEventListener('click', () => resumeDialog?.close());

  resumeDialog?.addEventListener('click', (e) => {
    const rect = resumeDialog.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      resumeDialog.close();
    }
  });
}

/* --------------------------------------------------------------------------
   14. Clipboard Copy & Contact Form Validation
   -------------------------------------------------------------------------- */
function initClipboardAndContactForm() {
  // Clipboard copy buttons
  document.querySelectorAll('[data-clipboard]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      createRipple(e);
      const textToCopy = btn.getAttribute('data-clipboard');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showSnackbar(`Copied to clipboard: ${textToCopy}`, 'check_circle');
        }).catch(() => {
          showSnackbar('Failed to copy. Please manually select the text.', 'error');
        });
      }
    });
  });

  // Contact form submission
  const contactForm = document.getElementById('contact-form');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    const inputs = contactForm.querySelectorAll('.md-input, .md-textarea');

    inputs.forEach(input => {
      const fieldContainer = input.closest('.md-input-field');
      if (!input.value.trim()) {
        fieldContainer.classList.add('has-error');
        isValid = false;
      } else {
        fieldContainer.classList.remove('has-error');
      }

      // Email format check
      if (input.type === 'email' && input.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value.trim())) {
          fieldContainer.classList.add('has-error');
          isValid = false;
        }
      }
    });

    if (isValid) {
      const submitBtn = contactForm.querySelector('.form-submit-btn');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">sync</span>
        <span>Transmitting...</span>
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        contactForm.reset();
        showSnackbar('Thank you! Your message has been sent to Gouthaman.', 'send');
      }, 1200);
    }
  });

  // Real-time error clearance
  contactForm?.querySelectorAll('.md-input, .md-textarea').forEach(input => {
    input.addEventListener('input', () => {
      const fieldContainer = input.closest('.md-input-field');
      if (input.value.trim()) {
        fieldContainer.classList.remove('has-error');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   15. Mobile Drawer Navigation
   -------------------------------------------------------------------------- */
function initMobileDrawer() {
  const menuToggle = document.getElementById('menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const drawerClose = document.getElementById('drawer-close');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  function openDrawer() {
    drawer?.classList.add('open');
    drawer?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer?.classList.remove('open');
    drawer?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  menuToggle?.addEventListener('click', (e) => {
    createRipple(e);
    openDrawer();
  });

  drawerClose?.addEventListener('click', (e) => {
    createRipple(e);
    closeDrawer();
  });

  drawerBackdrop?.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* --------------------------------------------------------------------------
   16. Material Snackbar / Toast Feedback
   -------------------------------------------------------------------------- */
let snackbarTimeout = null;

function showSnackbar(message, iconName = 'info') {
  const snackbar = document.getElementById('md-snackbar');
  const snackbarText = document.getElementById('snackbar-text');
  const snackbarIcon = document.getElementById('snackbar-icon');

  if (!snackbar || !snackbarText) return;

  snackbarText.textContent = message;
  if (snackbarIcon) snackbarIcon.textContent = iconName;

  snackbar.classList.add('show');

  if (snackbarTimeout) clearTimeout(snackbarTimeout);

  snackbarTimeout = setTimeout(() => {
    snackbar.classList.remove('show');
  }, 3400);
}

/* --------------------------------------------------------------------------
   17. Copyright Year
   -------------------------------------------------------------------------- */
function updateCurrentYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
