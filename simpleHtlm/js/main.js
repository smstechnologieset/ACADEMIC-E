/**
 * Academic Excellence — Static Site Interactive Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header scroll effect
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // 2. Mobile Menu Toggle
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('open');
      toggleBtn.classList.toggle('open');
      const isExpanded = navMenu.classList.contains('open');
      toggleBtn.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when clicking on any link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        toggleBtn.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target) && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        toggleBtn.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 3. Contact Form Submission Handler
  const contactForm = document.getElementById('academicInquiryForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('fullName');
      const emailInput = document.getElementById('emailAddress');

      if (!nameInput.value.trim() || !emailInput.value.trim()) {
        alert('Please provide your name and email address.');
        return;
      }

      const submitBtn = contactForm.querySelector('.btn-form-submit');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'SUBMITTING...';
      submitBtn.disabled = true;

      // Simulate submission
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        contactForm.reset();
        formStatus.textContent = 'Thank you for your inquiry! An Academic Excellence admissions advisor will contact you shortly.';
        formStatus.className = 'form-status success';
        formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 900);
    });
  }

  // 4. Active Pending Payment Session Support for Apply Links
  try {
    const pendingRef = localStorage.getItem('ae_pending_payment_ref');
    if (pendingRef && pendingRef.trim()) {
      const targetPaymentUrl = `payment-instructions.html?ref=${encodeURIComponent(pendingRef.trim())}`;
      
      // Update all navigation and action links pointing to apply.html
      const applyLinks = document.querySelectorAll('a[href^="apply.html"]');
      applyLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        // Skip links that intentionally request a fresh start
        if (href.includes('fresh=1') || href.includes('new=1')) return;

        link.setAttribute('href', targetPaymentUrl);
        if (link.classList.contains('nav-link')) {
          link.title = `Resume Pending Payment (${pendingRef.trim()})`;
        }
      });
    }
  } catch (err) {
    console.warn('Pending payment link check error:', err);
  }
});
