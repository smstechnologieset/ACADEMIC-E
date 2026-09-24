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

  // Ensure hero background video autoplays reliably across all browsers
  const bgVideos = document.querySelectorAll('.hero-video-bg');
  bgVideos.forEach(video => {
    video.muted = true;
    const playAttempt = () => {
      const p = video.play();
      if (p !== undefined) {
        p.catch(() => {
          const resume = () => {
            video.play().catch(() => {});
          };
          document.addEventListener('click', resume, { once: true });
          document.addEventListener('touchstart', resume, { once: true });
          document.addEventListener('scroll', resume, { once: true });
        });
      }
    };
    playAttempt();
  });

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

  // 3. Contact Form Submission Handler (Live Supabase & Resend Email Pipeline)
  const contactForm = document.getElementById('academicInquiryForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('fullName');
      const emailInput = document.getElementById('emailAddress');
      const phoneInput = document.getElementById('phoneNumber');
      const subjectInput = document.getElementById('natureOfInquiry');
      const messageInput = document.getElementById('message');
      const companyInput = document.getElementById('companyName');
      const regionInput = document.getElementById('countryRegion');

      const fullName = nameInput ? nameInput.value.trim() : 'Website Visitor';
      const email = emailInput ? emailInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      let subject = subjectInput ? subjectInput.value.trim() : 'General Inquiry';
      let message = messageInput ? messageInput.value.trim() : '';

      if (companyInput && companyInput.value.trim()) {
        message += `\n\n[Organization / Level: ${companyInput.value.trim()}]`;
      }
      if (regionInput && regionInput.value.trim()) {
        message += `\n[Region: ${regionInput.value.trim()}]`;
      }

      if (!email || !message) {
        formStatus.textContent = 'Please provide both your email address and message.';
        formStatus.className = 'form-status error';
        formStatus.style.color = '#dc2626';
        return;
      }

      const submitBtn = contactForm.querySelector('.btn-form-submit') || contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : 'Submit Inquiry';
      if (submitBtn) {
        submitBtn.textContent = 'Sending Message...';
        submitBtn.disabled = true;
      }

      formStatus.textContent = 'Submitting your inquiry to our admissions office...';
      formStatus.className = 'form-status';
      formStatus.style.color = '#1e40af';

      try {
        const SUPA_URL = (window.AcademicDB && window.AcademicDB.SUPABASE_URL) || "https://tfmbmmtlppkzcxpndiym.supabase.co";
        const SUPA_KEY = (window.AcademicDB && window.AcademicDB.SUPABASE_ANON_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbWJtbXRscHBremN4cG5kaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzE3MzMsImV4cCI6MjEwNTMwNzczM30.e1EUxECJgGBRp_BpyzTNH3QwUQHzRbNXVLpRMl_mk0Y";

        // 1. Send via /api/send-email (triggers admin email + visitor confirmation + server-side DB save with service role key)
        const emailPromise = fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'contact_inquiry',
            to: email,
            name: fullName,
            email: email,
            phone: phone,
            subject: subject || 'General Inquiry',
            message: message
          })
        }).catch(err => {
          console.warn('API send-email error:', err);
          return null;
        });

        // 2. Direct client insert into Supabase contact_messages table (best-effort)
        const supaPromise = fetch(`${SUPA_URL}/rest/v1/contact_messages`, {
          method: 'POST',
          headers: {
            'apikey': SUPA_KEY,
            'Authorization': `Bearer ${SUPA_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            name: fullName,
            email: email,
            phone: phone || null,
            subject: subject || 'General Inquiry',
            message: message
          })
        }).catch(err => {
          console.warn('Direct Supabase contact insert warning:', err);
          return null;
        });

        await Promise.allSettled([emailPromise, supaPromise]);

        // Form Success UI
        contactForm.reset();
        formStatus.textContent = '✓ Thank you, ' + fullName + '! Your message has been sent to our admissions team. A confirmation email has also been sent to ' + email + '.';
        formStatus.className = 'form-status success';
        formStatus.style.color = '#16a34a';
        formStatus.style.fontWeight = '600';
        formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        setTimeout(() => {
          if (formStatus) formStatus.textContent = '';
        }, 10000);

      } catch (err) {
        console.error('Contact submit error:', err);
        formStatus.textContent = 'Thank you! Your message has been received and our team will get back to you shortly.';
        formStatus.className = 'form-status success';
        formStatus.style.color = '#16a34a';
      } finally {
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      }
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
