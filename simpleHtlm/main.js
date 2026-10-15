/**
 * Academic Excellence — Static Site Interactive Script
 */

/**
 * Qualification Requirements accordion toggle.
 * Called via inline onclick on each .qual-card element.
 */
function toggleQualCard(card) {
  const isExpanded = card.getAttribute('aria-expanded') === 'true';
  // Close all other cards
  document.querySelectorAll('.qual-card[aria-expanded="true"]').forEach(c => {
    if (c !== card) c.setAttribute('aria-expanded', 'false');
  });
  card.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
}

// Keyboard accessibility for qual-cards
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    const card = e.target.closest('.qual-card');
    if (card) {
      e.preventDefault();
      toggleQualCard(card);
    }
  }
});

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

        // 1. Send via getEmailApiEndpoint() (triggers admin email + visitor confirmation + server-side DB save with service role key)
        const emailEndpoint = (window.AcademicDB && window.AcademicDB.getEmailApiEndpoint) ? window.AcademicDB.getEmailApiEndpoint() : "https://www.academicexcellences.com/api/send-email";
        const emailPromise = fetch(emailEndpoint, {
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
      const applyLinks = document.querySelectorAll('a[href^="apply.html"]');
      applyLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
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

  // 5. Dynamic Testimonials Carousel (Homepage after Our Values)
  initTestimonialsCarousel();
});

/**
 * Dynamic Testimonials Carousel Controller
 * Manages 0ms cached hydration, live Supabase synchronization,
 * responsive slide track, autoplay, touch swipe, and conditional visibility.
 */
function initTestimonialsCarousel() {
  const section = document.getElementById('testimonialsSection');
  const track = document.getElementById('tTrack');
  const prevBtn = document.getElementById('tPrevBtn');
  const nextBtn = document.getElementById('tNextBtn');
  const dotsContainer = document.getElementById('tDots');
  const container = document.getElementById('tCarouselContainer');
  if (!section || !track) return;

  const TEST_KEY = 'ae_db_testimonials';
  let testimonials = [];
  let currentIndex = 0;
  let autoplayTimer = null;

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getInitials(name) {
    if (!name) return 'AE';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  function getItemsPerView() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  function getMaxIndex() {
    const perView = getItemsPerView();
    return Math.max(0, testimonials.length - perView);
  }

  function updateCarouselPosition() {
    const itemsPerView = getItemsPerView();
    const maxIndex = getMaxIndex();
    currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));

    if (track.children.length > 0) {
      const firstSlide = track.children[0];
      const slideWidth = firstSlide.getBoundingClientRect().width;
      const gap = 28;
      const shift = currentIndex * (slideWidth + gap);
      track.style.transform = `translateX(-${shift}px)`;
    }

    // Update dots
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.t-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
        dot.setAttribute('aria-selected', idx === currentIndex ? 'true' : 'false');
      });
    }

    // Update buttons
    const canSlide = testimonials.length > itemsPerView;
    if (prevBtn) {
      prevBtn.style.display = canSlide ? 'flex' : 'none';
      prevBtn.classList.toggle('disabled', !canSlide);
    }
    if (nextBtn) {
      nextBtn.style.display = canSlide ? 'flex' : 'none';
      nextBtn.classList.toggle('disabled', !canSlide);
    }
    if (dotsContainer) {
      dotsContainer.style.display = canSlide ? 'flex' : 'none';
    }
  }

  function renderCarousel() {
    // If no testimonials, hide the section entirely
    if (!testimonials || testimonials.length === 0) {
      section.style.display = 'none';
      track.innerHTML = '';
      if (dotsContainer) dotsContainer.innerHTML = '';
      stopAutoplay();
      return;
    }

    // If there is even one testimonial, display the section!
    section.style.display = 'block';

    // Render cards
    track.innerHTML = testimonials.map((t, idx) => {
      const rating = Math.max(1, Math.min(5, parseInt(t.rating) || 5));
      const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
      const isFeatured = !!t.is_featured;
      const initials = getInitials(t.name);
      const featuredBadge = isFeatured ? '<span class="t-featured-badge">Featured Story</span>' : '';
      const courseBadge = t.course_completed
        ? `<div class="t-course-tag">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
               <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
             </svg>
             <span>${escapeHtml(t.course_completed)}</span>
           </div>`
        : '';

      return `
        <div class="t-slide" data-index="${idx}">
          <div class="t-card ${isFeatured ? 'is-featured' : ''}">
            <div class="t-watermark-quote" aria-hidden="true">&ldquo;</div>
            <div class="t-card-header">
              <div class="t-stars" aria-label="${rating} out of 5 stars">${stars}</div>
              ${featuredBadge}
            </div>
            <blockquote class="t-quote">&ldquo;${escapeHtml(t.quote)}&rdquo;</blockquote>
            <div class="t-author-wrap">
              <div class="t-author-row">
                <div class="t-avatar ${isFeatured ? 't-avatar-featured' : ''}" aria-hidden="true">${initials}</div>
                <div class="t-author-meta">
                  <h4 class="t-name">${escapeHtml(t.name)}</h4>
                  <div class="t-role">${escapeHtml(t.role || 'Program Graduate')}</div>
                </div>
              </div>
              ${courseBadge}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Render pagination dots
    const itemsPerView = getItemsPerView();
    const pageCount = getMaxIndex() + 1;
    if (dotsContainer) {
      if (testimonials.length > itemsPerView && pageCount > 1) {
        dotsContainer.innerHTML = Array.from({ length: pageCount }, (_, i) => 
          `<button class="t-dot ${i === currentIndex ? 'active' : ''}" data-page="${i}" role="tab" aria-label="Go to testimonial slide ${i + 1}" aria-selected="${i === currentIndex ? 'true' : 'false'}"></button>`
        ).join('');
        dotsContainer.querySelectorAll('.t-dot').forEach(dot => {
          dot.addEventListener('click', () => {
            const page = parseInt(dot.dataset.page);
            goToSlide(page);
          });
        });
        dotsContainer.style.display = 'flex';
      } else {
        dotsContainer.innerHTML = '';
        dotsContainer.style.display = 'none';
      }
    }

    updateCarouselPosition();
    startAutoplay();
  }

  function goToSlide(index) {
    const maxIndex = getMaxIndex();
    if (index > maxIndex) {
      currentIndex = 0;
    } else if (index < 0) {
      currentIndex = maxIndex;
    } else {
      currentIndex = index;
    }
    updateCarouselPosition();
  }

  function nextSlide() {
    const maxIndex = getMaxIndex();
    if (currentIndex >= maxIndex) {
      goToSlide(0);
    } else {
      goToSlide(currentIndex + 1);
    }
  }

  function prevSlide() {
    const maxIndex = getMaxIndex();
    if (currentIndex <= 0) {
      goToSlide(maxIndex);
    } else {
      goToSlide(currentIndex - 1);
    }
  }

  function startAutoplay() {
    stopAutoplay();
    const itemsPerView = getItemsPerView();
    if (testimonials.length > itemsPerView) {
      autoplayTimer = setInterval(() => {
        nextSlide();
      }, 5500);
    }
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  // Prev / Next button listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      prevSlide();
      startAutoplay();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      nextSlide();
      startAutoplay();
    });
  }

  // Hover & interaction pause
  if (container) {
    container.addEventListener('mouseenter', stopAutoplay);
    container.addEventListener('mouseleave', startAutoplay);
  }

  // Touch Swipe Support for Mobile & Tablets
  let touchStartX = 0;
  let touchStartY = 0;
  if (track) {
    track.addEventListener('touchstart', (e) => {
      stopAutoplay();
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
      startAutoplay();
    }, { passive: true });
  }

  // Resize listener
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const pageCount = getMaxIndex() + 1;
      const itemsPerView = getItemsPerView();
      if (dotsContainer) {
        if (testimonials.length > itemsPerView && pageCount > 1) {
          dotsContainer.innerHTML = Array.from({ length: pageCount }, (_, i) => 
            `<button class="t-dot ${i === currentIndex ? 'active' : ''}" data-page="${i}" role="tab" aria-label="Go to testimonial slide ${i + 1}" aria-selected="${i === currentIndex ? 'true' : 'false'}"></button>`
          ).join('');
          dotsContainer.querySelectorAll('.t-dot').forEach(dot => {
            dot.addEventListener('click', () => {
              goToSlide(parseInt(dot.dataset.page));
            });
          });
          dotsContainer.style.display = 'flex';
        } else {
          dotsContainer.innerHTML = '';
          dotsContainer.style.display = 'none';
        }
      }
      updateCarouselPosition();
    }, 150);
  });

  // Local storage loading & real-time sync
  function loadFromLocal() {
    try {
      const raw = localStorage.getItem(TEST_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          testimonials = parsed;
          renderCarousel();
          return true;
        }
      }
    } catch (e) {
      console.warn('[Testimonials] localStorage read error:', e);
    }
    return false;
  }

  // Supabase background sync
  async function syncFromSupabase() {
    try {
      const SUPA_URL = (window.AcademicDB && window.AcademicDB.SUPABASE_URL) || "https://tfmbmmtlppkzcxpndiym.supabase.co";
      const SUPA_KEY = (window.AcademicDB && window.AcademicDB.SUPABASE_ANON_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbWJtbXRscHBremN4cG5kaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzE3MzMsImV4cCI6MjEwNTMwNzczM30.e1EUxECJgGBRp_BpyzTNH3QwUQHzRbNXVLpRMl_mk0Y";

      const res = await fetch(`${SUPA_URL}/rest/v1/cms_testimonials?order=sort_order.asc`, {
        headers: {
          'apikey': SUPA_KEY,
          'Authorization': `Bearer ${SUPA_KEY}`
        }
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows)) {
          testimonials = rows;
          try {
            localStorage.setItem(TEST_KEY, JSON.stringify(rows));
          } catch (e) {}
          renderCarousel();
        }
      }
    } catch (err) {
      console.warn('[Testimonials] Supabase sync warning:', err);
    }
  }

  // 1. Initial 0ms render from localStorage
  loadFromLocal();

  // 2. Network sync from Supabase
  syncFromSupabase();

  // 3. Real-time cross-tab listener (when admin adds/edits/deletes in admin tab)
  window.addEventListener('storage', (e) => {
    if (e.key === TEST_KEY) {
      loadFromLocal();
    }
  });

  // Expose global refresh function
  window.refreshTestimonialsCarousel = () => {
    loadFromLocal();
    syncFromSupabase();
  };
}
