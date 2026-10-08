/**
 * Academic Excellence — Client-Side Page Content CMS Engine
 * Provides instant 0ms localStorage hydration with live Supabase REST synchronization
 * and real-time cross-tab updates.
 */

(function () {
  const CMS_STORAGE_KEY = "ae_cms_page_content";
  const SUPA_URL = "https://tfmbmmtlppkzcxpndiym.supabase.co";
  const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbWJtbXRscHBremN4cG5kaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzE3MzMsImV4cCI6MjEwNTMwNzczM30.e1EUxECJgGBRp_BpyzTNH3QwUQHzRbNXVLpRMl_mk0Y";

  const DEFAULT_CMS_CONTENT = {
    home: {
      // 1. Hero Section
      hero_badge: "The Pathway to Success",
      hero_title: "Academic Excellence",
      hero_subtitle: "Transforming Lives Through Education, Skills Development, and Workforce Readiness.expand equitable access to internationally recognized education, workforce development, and career advancement opportunities for Ethiopian learners.",
      hero_btn_explore: "Explore All Programs",
      hero_btn_apply: "Apply For Intake →",

      // 2. Editorial Statement & Mosaic
      overview_headline: "Empowering People. Expanding Opportunity. Transforming Futures.",
      overview_body_1: "Operating through strategic partnerships with global educational institutions and philanthropic organizations, Academic Excellence serves as a bridge connecting Ethiopian students, graduates, professionals, entrepreneurs, public servants, and underserved communities with world-class learning opportunities designed to prepare them for success in the modern global economy.",
      overview_body_2: "Through a combination of advanced learning technologies, scholarship support, digital learning platforms, career services, and workforce development programs.",
      overview_photo_1: "assets/campus.jpg",
      overview_photo_2: "assets/students.jpg",

      // Impact Strip
      stat_1: "Accredited Programs",
      stat_2: "Learning Resources",
      stat_3: "Fast-Track Completion",
      stat_4: "Subsidized & Flexible",

      // 3. Cityscape Panorama Card
      panorama_title: "Empowering Ethiopia Through Education",
      panorama_desc_1: "As part of its commitment to social and economic development in Ethiopia, Academic Excellence has launched initiatives aimed at expanding access to quality education and workforce training.",
      panorama_desc_2: "These initiatives help make world-class, career-focused education accessible and affordable, supporting Ethiopia's vision for economic growth, innovation, and sustainable development while creating pathways to meaningful employment and lifelong learning.",

      // 4. About & Mission / Vision Cards
      about_title: "About Academic Excellence",
      about_desc: "Academic Excellence is a transformative educational initiative established to expand equitable access to internationally recognized education, workforce development, and career advancement opportunities for Ethiopian learners, students, graduates, professionals, entrepreneurs, public servants, and underserved communities.",
      mission_title: "Our Mission",
      mission_desc: "To expand access to affordable internationally recognized education and workforce training opportunities that equip Ethiopian learners with the skills, competencies, and credentials needed to succeed in an increasingly digital and knowledge-driven world.",
      vision_title: "Our Vision",
      vision_desc: "To make U.S. quality higher education more accessible to turn educational aspirations into achievable opportunities, and to ensure that the benefits of education extend beyond the individual to families, communities, and the nation.",

      // 5. Qualification Requirements ("Who can apply ?")
      eligibility_title: "Who can apply ?",
      eligibility_desc: "The Academic Excellence program is designed to support learners and professionals who meet the eligibility criteria. Review the requirements below to see if you qualify.",
      qual_1_title: "High School Graduation",
      qual_1_desc: "Hold a valid High School Graduation certificate with a national examination score of 250 and above, or equivalent qualification as applicable.",
      qual_2_title: "Higher Education Qualification",
      qual_2_desc: "Holders of Bachelor's, Master's, or other recognized higher education qualifications are eligible.",
      qual_3_title: "Job Seekers, Professionals & Civil Servants",
      qual_3_desc: "Recent graduates, working professionals, and career transitioners seeking in-demand skills.",
      qual_4_title: "Open to All Sectors and Fields",
      qual_4_desc: "There are no limitations based on industry or sector. Applicants from any field qualify.",

      // 6. Featured Programs Header
      programs_title: "Academic Programs",
      programs_subtitle: "Structured 24-week pathways certified in collaboration with University in New York and delivered via the enterprise Skillsoft Percipio platform.",

      // 7. Values Section
      values_title: "Our Values",
      values_desc: "Our foundation is built upon a strong commitment to integrity, excellence, inclusivity, and social responsibility. We believe that education is not only a pathway to individual success but also a powerful catalyst for positive societal transformation.",

      // 8. Bottom Admissions CTA
      cta_title: "Join Academic Excellence",
      cta_desc: "At Academic Excellence, we do not simply facilitate education — we facilitate possibilities, transform aspirations into opportunities, and invest in Ethiopia's future. Whether you are a recent graduate, working professional, government employee, or entrepreneur, we invite you to take the next step.",
      cta_photo: "assets/join-us.jpg"
    },
    about: {
      // 1. Hero
      hero_badge: "The Pathway to Success • In Collaboration with International Partners & University in New York",
      hero_title: "Transforming Lives Through Global Education, Skills Development, and Workforce Readiness",
      hero_subtitle: "Academic Excellence is a transformative educational initiative established to expand equitable access to internationally recognized education, workforce development, and career advancement opportunities for Ethiopian learners.",

      // 2. Founding Purpose & Commitment
      purpose_eyebrow: "Our Purpose & Commitment",
      purpose_heading: "Education as a Force for Transformation",
      purpose_lead: "Operating through strategic partnerships with global educational institutions and philanthropic organizations, Academic Excellence serves as a bridge connecting Ethiopian students, graduates, professionals, entrepreneurs, public servants, and underserved communities with world-class learning opportunities designed to prepare them for success in the modern global economy.",
      purpose_body: "At Academic Excellence, our mission is grounded in a strong and unwavering commitment to integrity, academic rigor, inclusivity, and social responsibility. We open doors by facilitating subsidized education, supporting learners in identifying suitable academic pathways, and building partnerships that ensure financial circumstances do not prevent talented and motivated individuals from reaching their full potential.",
      purpose_photo: "assets/campus.jpg",

      // 3. Mission & Motto
      mission_title: "Expanding Opportunities & Workforce Competencies",
      mission_desc: "To expand access to affordable, internationally recognized education and workforce training opportunities that equip Ethiopian learners with the practical skills, technical competencies, and credentials needed to succeed in an increasingly digital and knowledge-driven world.",
      motto_title: "“Empowering People. Expanding Opportunity. Transforming Futures.”",
      motto_desc: "Our motto reflects our unwavering dedication to empowering individuals and communities through continuous learning. By delivering globally relevant educational programs, we build the skilled human capital necessary for Ethiopia’s long-term economic prosperity.",

      // 4. Strategic Delivery Ecosystem
      ecosystem_heading: "Empowering Ethiopia's Future Workforce",
      ecosystem_desc: "Through subsidized learning programs, Ethiopian youth, professionals, and entrepreneurs gain direct access to specialized skill-based curricula developed by Skillsoft Percipio and certified by the University in New York. These initiatives help make world-class, career-focused education accessible and affordable, supporting Ethiopia's vision for sustainable development.",

      // 5. Leadership & Advisory Council Section
      show_advisory_section: false,
      advisory_title: "Leadership and Academic Advisory Council",
      advisory_desc: "Leadership and Board Advisors play a crucial role in providing strategic guidance, academic expertise, and institutional oversight to build a sustainable bridge between Ethiopian talent and global education.",
      advisor_1_name: "Director of Academic Affairs",
      advisor_1_role: "Curriculum Alignment & Institutional Liaison",
      advisor_1_bio: "Provides strategic oversight over curriculum quality, faculty mentoring, and university accreditation with our U.S. institutional partners.",
      advisor_2_name: "Head of Digital Learning",
      advisor_2_role: "Skillsoft Percipio & Technology Delivery",
      advisor_2_bio: "Directs the integration of AI-driven personalized learning, hands-on lab environments, and mobile digital campus operations.",
      advisor_3_name: "Director of Workforce Partnerships",
      advisor_3_role: "Industry Relations & Student Placement",
      advisor_3_bio: "Connects graduates with employers, government bodies, and international enterprises seeking certified talent in management and IT.",

      // 6. Join Our Community CTA
      join_us_title: "Join Our Academic Community",
      join_us_desc: "Whether you are entering the workforce, seeking career advancement, or transitioning into a high-demand field, our flexible online learning programs provide the tools and international credentials needed for success.",
      join_us_photo: "assets/join-us.jpg"
    },
    courses: {
      // 1. Hero
      hero_badge: "Curriculum • Certified with University in New York",
      hero_title: "Academic Programs",
      hero_subtitle: "Job-Ready Global Learning Programs through our partnership with the University in New York, USA. Over 120 programs in high-demand fields, delivered via Skillsoft Percipio — providing students and professionals with affordable, career-focused learning opportunities.",

      // 2. Video Showcase / Methodology
      showcase_eyebrow: "Interactive Learning in Action",
      showcase_title: "How Your Performance Is Evaluated",
      showcase_lead: "Certificates are earned through genuine mastery, not passive attendance. Our programs integrate continuous milestones across the 24-week pathway to ensure learners possess both conceptual foundation and practical execution capability.",

      // 3. Accreditation Callout Banner
      cert_badge: "University Accreditation",
      cert_title: "Dual-Certified U.S. University Credentials & Merit Badges",
      cert_desc: "All 24-week programs award credentials certified in collaboration with the University in New York, enterprise Skillsoft Percipio digital badges, and eligibility for the GPA 3.6+ Merit Badge recognition.",
      cert_btn: "View Honors & Badges →"
    },
    credentials: {
      // 1. Hero
      hero_badge: "Global Standards • University in New York Collaboration",
      hero_title: "Certifications & Honors",
      hero_subtitle: "Graduate with internationally recognized U.S. university credentials and enterprise Skillsoft Percipio digital badges designed to validate your expertise, empower your career advancement, and open doors across the global digital economy.",

      // 2. Pathway Header & Toggles
      pathway_title: "Recognition for students",
      pathway_desc: "Each successfully completed 24-week program awards graduates two distinct, verifiable credentials that validate both academic rigor and real-world workplace competence.",
      show_university_card: false,
      show_percipio_card: false,
      show_assessment_box: false,
      show_verification_grid: false,

      // Card texts
      uni_card_title: "University in New York Diploma",
      uni_card_desc: "Issued in formal collaboration with the University in New York, USA. This credential certifies comprehensive curriculum completion adhering to rigorous North American higher education standards.",
      percipio_card_title: "Skillsoft Percipio Digital Credential",
      percipio_card_desc: "Delivered through the enterprise Skillsoft Percipio platform. Provides cryptographically secure, shareable digital badges that verify specific skills, lab proficiencies, and hours of learning.",

      // 3. Evaluation Section
      eval_title: "How Your Performance Is Evaluated",
      eval_lead: "Certificates are earned through genuine mastery, not passive attendance. Our programs integrate continuous milestones across the 24-week pathway to ensure learners possess both conceptual foundation and practical execution capability.",

      // 4. Merit System
      merit_title: "The Merit Recognition System",
      merit_desc: "Academic Excellence is committed to celebrating exceptional academic performance. Learners who demonstrate exemplary dedication and achieve superior scores are awarded prestigious honors.",
      tier1_title: "Certificate of Completion",
      tier1_desc: "Awarded to all candidates who successfully complete all 4 module phases, required readings, interactive labs, and achieve passing marks across all assessments.",
      tier2_title: "Merit Badge Recognition",
      tier2_desc: "Students who achieve a cumulative GPA of 3.6 or higher (90% and above) are eligible for the prestigious Merit Badge, formally recognizing outstanding academic performance.",
      tier3_title: "Medallion of Merit",
      tier3_desc: "The highest academic distinction conferred by Academic Excellence. Reserved for learners achieving a final aggregate score of 95% and above across their entire 24-week qualification.",

      // 5. Verification Grid Header
      verify_title: "Authentic, Verifiable Credentials",
      verify_desc: "Every diploma and badge issued is protected by digital verification standards that guarantee credibility for employers and educational institutions worldwide.",

      // 6. Bottom CTA
      cta_title: "Earn Your University Credential",
      cta_desc: "Take the definitive leap in your career. Applications for the upcoming 2026 intake are open with subsidized tuition availability for qualified candidates across Ethiopia.",
      cta_photo: "assets/join-us.jpg"
    },
    contact: {
      // 1. Hero
      hero_title: "Contact Us",
      hero_subtitle: "Thank you for your interest in Academic Excellence. Whether you are seeking admission into our accredited diploma programs, have inquiries about our U.S. curriculum and Skillsoft platform, or wish to explore institutional partnerships, our team is here to assist you.",

      // 2. Info Particulars
      info_heading: "Contact Academic Excellence",
      info_desc: "If you are interested in exploring academic partnership opportunities, corporate sponsorship, or collaborating with Academic Excellence to empower Ethiopian professionals with global credentials, please reach out to our team.",
      email: "academicexcellenceco@gmail.com",
      phone: "+251 11 555 2345",
      address: "Addis Ababa, Ethiopia",
      hours: "Monday – Friday: 8:30 AM – 5:30 PM (EAT)",

      // 3. Inquiries Form Header
      form_heading: "General Inquiries",
      form_desc: "For general inquiries please contact us using the form below:"
    }
  };

  // Helper to deep merge objects
  function deepMerge(target, source) {
    if (!source || typeof source !== "object") return target;
    const output = Object.assign({}, target);
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        output[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        output[key] = source[key];
      }
    });
    return output;
  }

  // Get cached CMS content
  function getCachedContent() {
    try {
      const raw = localStorage.getItem(CMS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return deepMerge(DEFAULT_CMS_CONTENT, parsed);
      }
    } catch (e) {
      console.warn("CMS storage parse error:", e);
    }
    return DEFAULT_CMS_CONTENT;
  }

  // Save CMS content
  function saveCachedContent(content) {
    try {
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(content));
    } catch (e) {
      console.error("Failed to write CMS content to localStorage:", e);
    }
  }

  // Resolve property from dot-notation path like "about.hero_title"
  function resolveValue(obj, path) {
    if (!obj || !path) return undefined;
    const parts = path.split(".");
    let curr = obj;
    for (const part of parts) {
      if (curr === undefined || curr === null) return undefined;
      curr = curr[part];
    }
    return curr;
  }

  // Hydrate DOM elements marked with data-cms attributes
  function hydrateDOM(content) {
    if (!content) content = getCachedContent();

    // 1. Text elements
    document.querySelectorAll("[data-cms-text]").forEach(el => {
      const key = el.getAttribute("data-cms-text");
      const val = resolveValue(content, key);
      if (val !== undefined && val !== null && String(val).trim() !== "") {
        el.textContent = val;
      }
    });

    // 2. HTML elements
    document.querySelectorAll("[data-cms-html]").forEach(el => {
      const key = el.getAttribute("data-cms-html");
      const val = resolveValue(content, key);
      if (val !== undefined && val !== null && String(val).trim() !== "") {
        el.innerHTML = val;
      }
    });

    // 3. Image & Video source elements
    document.querySelectorAll("[data-cms-src]").forEach(el => {
      const key = el.getAttribute("data-cms-src");
      const val = resolveValue(content, key);
      if (val && String(val).trim() !== "") {
        if (el.tagName.toLowerCase() === "img") {
          el.src = val;
        } else if (el.tagName.toLowerCase() === "video") {
          el.poster = val;
        } else {
          el.style.backgroundImage = `url("${val}")`;
        }
      }
    });

    // 4. Section visibility toggles
    document.querySelectorAll("[data-cms-section]").forEach(el => {
      const key = el.getAttribute("data-cms-section");
      const val = resolveValue(content, key);
      if (val === false) {
        el.style.display = "none";
      } else if (val === true) {
        el.style.display = "";
      }
    });
  }

  // Asynchronously sync with Supabase site_settings table via direct REST
  async function syncFromSupabase() {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/site_settings?key=eq.page_content&select=key,value,updated_at`, {
        headers: {
          "apikey": SUPA_KEY,
          "Authorization": `Bearer ${SUPA_KEY}`
        }
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0 && rows[0].value) {
          const remoteContent = typeof rows[0].value === "string" ? JSON.parse(rows[0].value) : rows[0].value;
          const localContent = getCachedContent();

          // Timestamp check: never overwrite newer local edits with older remote content
          const localTime = localContent._updated_at ? new Date(localContent._updated_at).getTime() : 0;
          const remoteTime = (remoteContent._updated_at || rows[0].updated_at) ? new Date(remoteContent._updated_at || rows[0].updated_at).getTime() : 0;

          if (remoteTime >= localTime || localTime === 0) {
            const merged = deepMerge(DEFAULT_CMS_CONTENT, remoteContent);
            saveCachedContent(merged);
            hydrateDOM(merged);
            try {
              window.dispatchEvent(new CustomEvent("ae_cms_synced", { detail: merged }));
            } catch (_) {}
          }
        }
      }
    } catch (err) {
      console.warn("Supabase CMS fetch error:", err);
    }
  }

  // Publish / Save CMS content to Supabase and LocalStorage
  async function publishContent(updatedContent) {
    const cached = getCachedContent();
    const fullContent = deepMerge(cached, updatedContent);
    const nowIso = new Date().toISOString();
    fullContent._updated_at = nowIso;

    // 1. Immediately save to LocalStorage and update DOM in current tab
    saveCachedContent(fullContent);
    hydrateDOM(fullContent);

    // 2. Broadcast across open tabs immediately
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("ae_cms_sync");
        bc.postMessage({ type: "CMS_UPDATED", content: fullContent });
      }
    } catch (_) {}

    // 3. Upsert to Supabase site_settings table
    let token = SUPA_KEY;
    if (window.AdminService && typeof window.AdminService.getValidToken === "function") {
      try {
        const userToken = await window.AdminService.getValidToken();
        if (userToken) {
          token = userToken;
        }
      } catch (e) {
        token = SUPA_KEY;
      }
    }

    try {
      // Step A: Check if page_content row already exists in site_settings
      const checkRes = await fetch(`${SUPA_URL}/rest/v1/site_settings?key=eq.page_content&select=key`, {
        headers: {
          "apikey": SUPA_KEY,
          "Authorization": `Bearer ${token}`
        }
      });
      const existing = checkRes.ok ? await checkRes.json() : [];

      let saveRes;
      if (existing && existing.length > 0) {
        // PATCH existing row
        saveRes = await fetch(`${SUPA_URL}/rest/v1/site_settings?key=eq.page_content`, {
          method: "PATCH",
          headers: {
            "apikey": SUPA_KEY,
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
          },
          body: JSON.stringify({
            value: JSON.stringify(fullContent),
            updated_at: nowIso
          })
        });
      } else {
        // POST new row
        saveRes = await fetch(`${SUPA_URL}/rest/v1/site_settings`, {
          method: "POST",
          headers: {
            "apikey": SUPA_KEY,
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=representation"
          },
          body: JSON.stringify({
            key: "page_content",
            value: JSON.stringify(fullContent),
            updated_at: nowIso
          })
        });
      }

      if (!saveRes.ok) {
        const errTxt = await saveRes.text();
        console.warn("Remote CMS upsert warning:", errTxt);
        return { success: false, error: errTxt };
      }
    } catch (e) {
      console.warn("Remote CMS publish failed:", e);
      return { success: false, error: e.message };
    }

    return { success: true };
  }

  // Cross-tab real-time sync listeners
  if (typeof BroadcastChannel !== "undefined") {
    try {
      const bc = new BroadcastChannel("ae_cms_sync");
      bc.onmessage = (ev) => {
        if (ev.data && ev.data.type === "CMS_UPDATED" && ev.data.content) {
          saveCachedContent(ev.data.content);
          hydrateDOM(ev.data.content);
        }
      };
    } catch (_) {}
  }
  window.addEventListener("storage", (e) => {
    if (e.key === CMS_STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        hydrateDOM(parsed);
      } catch (_) {}
    }
  });

  // Expose global AcademicCMS API
  window.AcademicCMS = {
    DEFAULT_CONTENT: DEFAULT_CMS_CONTENT,
    getContent: getCachedContent,
    saveContent: publishContent,
    hydrate: hydrateDOM,
    syncRemote: syncFromSupabase
  };

  // Run instant hydration on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      hydrateDOM();
      syncFromSupabase();
    });
  } else {
    hydrateDOM();
    syncFromSupabase();
  }
})();
