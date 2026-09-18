/* ================================================================
   SCRIPT.JS — Murasolimaran E | AI Portfolio
   Professional Architecture — No hardcoded keys

   EmailJS keys loaded dynamically from /api/config (backend)
   Telegram + Google Sheet keys stay fully hidden in .env

   Sections:
   1.  Config Loader  (EmailJS keys from backend)
   2.  Toast Notification System
   3.  Navbar + Back-To-Top + Active Nav Link
   4.  Hamburger Mobile Menu
   5.  Custom Cursor
   6.  Typing Text Effect
   7.  Contact Form  → /api/contact + EmailJS
   8.  Certificate Popup + Image Security
================================================================ */

"use strict";

/* ================================================================
   1. EMAILJS CONFIG — Loaded from backend /api/config
      Never hardcoded in frontend
================================================================ */
let EMAILJS_PUBLIC_KEY  = "";
let EMAILJS_SERVICE_ID  = "";
let EMAILJS_TEMPLATE_ID = "";
let EMAILJS_AUTOREPLY_TEMPLATE_ID = "";

let _configLoaded  = false;   /* true once fetch completes */
let _configPromise = null;    /* reuse same promise everywhere */

async function loadEmailConfig() {
  try {
    const res = await fetch("/api/config");
    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await res.json();

    EMAILJS_PUBLIC_KEY  = data.publicKey  || "";
    EMAILJS_SERVICE_ID  = data.serviceId  || "";
    EMAILJS_TEMPLATE_ID = data.templateId || "";
    EMAILJS_AUTOREPLY_TEMPLATE_ID =data.autoReplyTemplateId || "";

    /* Init EmailJS as soon as keys arrive */
    if (typeof emailjs !== "undefined" && EMAILJS_PUBLIC_KEY) {
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }

  } catch (err) {
    console.warn("EmailJS config load failed:", err.message);
  } finally {
    _configLoaded = true;   /* always mark done, even on error */
  }
}

/* Start loading immediately — page load time == fetch time */
_configPromise = loadEmailConfig();

/* ================================================================
   2. TOAST NOTIFICATION SYSTEM
   Usage: showToast("message", "success" | "error")
================================================================ */
(function injectToastStyles() {
  if (document.getElementById("_toast_styles")) return;
  const s = document.createElement("style");
  s.id = "_toast_styles";
  s.textContent = `
    .toast-wrap {
      position:fixed; top:20px; right:20px; z-index:99999;
      display:flex; flex-direction:column; gap:10px;
    }
    .toast {
      display:flex; align-items:center; gap:12px;
      min-width:280px; max-width:380px;
      padding:14px 18px; border-radius:8px;
      color:#fff; font-family:'Exo 2',sans-serif;
      font-size:0.88rem; font-weight:600;
      box-shadow:0 6px 24px rgba(0,0,0,0.4);
      transform:translateX(115%);
      transition:transform 0.4s cubic-bezier(0.68,-0.55,0.265,1.55);
    }
    .toast.show          { transform:translateX(0); }
    .toast-success       { background:#10b981; border-left:4px solid #047857; }
    .toast-error         { background:#ef4444; border-left:4px solid #b91c1c; }
    .toast-info          { background:#3b82f6; border-left:4px solid #1d4ed8; }
    .toast i             { font-size:1.1rem; flex-shrink:0; }
  `;
  document.head.appendChild(s);
})();

function showToast(message, type) {
  type = type || "success";

  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }

  const t   = document.createElement("div");
  t.className = "toast toast-" + type;

  const icons = {
    success : '<i class="fa-solid fa-circle-check"></i>',
    error   : '<i class="fa-solid fa-circle-exclamation"></i>',
    info    : '<i class="fa-solid fa-circle-info"></i>'
  };
  t.innerHTML = (icons[type] || icons.info) + " <span>" + message + "</span>";
  wrap.appendChild(t);

  /* Double rAF: guarantees CSS transition fires after paint */
  requestAnimationFrame(() =>
    requestAnimationFrame(() => t.classList.add("show"))
  );

  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 450);
  }, 4500);
}

/* ================================================================
   3. NAVBAR SLIM + BACK TO TOP + ACTIVE NAV LINK
================================================================ */
const navbar   = document.getElementById("navbar");
const bttBtn   = document.getElementById("btt");
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", function () {

  /* Slim navbar after 60px */
  if (navbar) navbar.classList.toggle("slim", window.scrollY > 60);

  /* Show / hide back-to-top button */
  if (bttBtn) bttBtn.classList.toggle("show", window.scrollY > 400);

  /* Highlight active nav link */
  let cur = "";
  sections.forEach(function (s) {
    if (window.scrollY >= s.offsetTop - 130) cur = s.id;
  });
  navLinks.forEach(function (a) {
    a.classList.toggle("active", a.getAttribute("href") === "#" + cur);
  });

}, { passive: true });

/* ================================================================
   4. HAMBURGER MOBILE MENU
================================================================ */
const burger = document.getElementById("burger");
const mobNav = document.getElementById("mobNav");

if (burger && mobNav) {
  burger.addEventListener("click", function () {
    burger.classList.toggle("open");
    mobNav.classList.toggle("open");
  });
  mobNav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      burger.classList.remove("open");
      mobNav.classList.remove("open");
    });
  });
}

/* ================================================================
   5. CUSTOM CURSOR (smooth 0.12 lerp follow)
================================================================ */
const cursorEl = document.querySelector(".cursor");
if (cursorEl) {
  let mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener("mousemove", function (e) {
    mx = e.clientX;
    my = e.clientY;
  });
  (function moveCursor() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    cursorEl.style.left = cx + "px";
    cursorEl.style.top  = cy + "px";
    requestAnimationFrame(moveCursor);
  })();
}

/* ================================================================
   5A. PROFILE HUD PARALLAX — decorative, lightweight, motion-safe
================================================================ */
const profileHud = document.getElementById("profileHud");
const reduceHudMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (profileHud && !reduceHudMotion.matches) {
  let hudFrame = 0;
  let hudX = 0;
  let hudY = 0;

  profileHud.addEventListener("pointermove", function (e) {
    const rect = profileHud.getBoundingClientRect();
    hudX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    hudY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    if (hudFrame) return;
    hudFrame = requestAnimationFrame(function () {
      profileHud.style.setProperty("--hud-outer-x", (hudX * 5).toFixed(2) + "px");
      profileHud.style.setProperty("--hud-outer-y", (hudY * 5).toFixed(2) + "px");
      profileHud.style.setProperty("--hud-inner-x", (hudX * 2.5).toFixed(2) + "px");
      profileHud.style.setProperty("--hud-inner-y", (hudY * 2.5).toFixed(2) + "px");
      hudFrame = 0;
    });
  });

  profileHud.addEventListener("pointerleave", function () {
    profileHud.style.setProperty("--hud-outer-x", "0px");
    profileHud.style.setProperty("--hud-outer-y", "0px");
    profileHud.style.setProperty("--hud-inner-x", "0px");
    profileHud.style.setProperty("--hud-inner-y", "0px");
  });
}

/* ================================================================
   5B. ABOUT PORTRAIT PARALLAX — decorative and motion-safe
================================================================ */
const aboutPortrait = document.getElementById("aboutPortrait");

if (aboutPortrait && !reduceHudMotion.matches) {
  let aboutFrame = 0;
  let aboutX = 0;
  let aboutY = 0;

  aboutPortrait.addEventListener("pointermove", function (e) {
    const rect = aboutPortrait.getBoundingClientRect();
    aboutX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    aboutY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    if (aboutFrame) return;
    aboutFrame = requestAnimationFrame(function () {
      aboutPortrait.style.setProperty("--about-back-x", (aboutX * 6).toFixed(2) + "px");
      aboutPortrait.style.setProperty("--about-back-y", (aboutY * 6).toFixed(2) + "px");
      aboutPortrait.style.setProperty("--about-ribbon-x", (aboutX * 8).toFixed(2) + "px");
      aboutPortrait.style.setProperty("--about-ribbon-y", (aboutY * 8).toFixed(2) + "px");
      aboutPortrait.style.setProperty("--about-photo-x", (aboutX * 2).toFixed(2) + "px");
      aboutPortrait.style.setProperty("--about-photo-y", (aboutY * 2).toFixed(2) + "px");
      aboutFrame = 0;
    });
  });

  aboutPortrait.addEventListener("pointerleave", function () {
    ["back", "ribbon", "photo"].forEach(function (layer) {
      aboutPortrait.style.setProperty("--about-" + layer + "-x", "0px");
      aboutPortrait.style.setProperty("--about-" + layer + "-y", "0px");
    });
  });
}

/* ================================================================
   5C. BEYOND CODE ENTRANCE — one-time, lightweight reveal
================================================================ */
const beyondCards = document.querySelectorAll(".beyond-card");

if (beyondCards.length) {
  if (reduceHudMotion.matches || !("IntersectionObserver" in window)) {
    beyondCards.forEach(function (card) { card.classList.add("reveal"); });
  } else {
    const beyondObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("reveal");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    beyondCards.forEach(function (card) { beyondObserver.observe(card); });
  }
}
const revealElements = document.querySelectorAll(".reveal");

if (revealElements.length) {
  if (
    typeof reduceHudMotion !== "undefined" &&
    reduceHudMotion.matches
  ) {
    revealElements.forEach(el => {
      el.classList.add("reveal-active");
    });
  } else if ("IntersectionObserver" in window) {

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) return;

          entry.target.classList.add("reveal-active");

          observer.unobserve(entry.target);
        });

      },
      {
        threshold: 0.15
      }
    );

    revealElements.forEach(el => {
      revealObserver.observe(el);
    });

  } else {
    revealElements.forEach(el => {
      el.classList.add("reveal-active");
    });
  }
}

/* ================================================================
   6. TYPING TEXT EFFECT
   HTML needed: <span class="typing-text"></span> inside .hero-role
================================================================ */
const typingEl = document.querySelector(".typing-text");
if (typingEl) {
  const roles = [
    "AI Engineer",
    "Machine Learning Engineer",
    "Data Scientist",
    "Python Developer",
    "Full Stack Developer",
    "Creative Technologist"
  ];
  let rIdx = 0, cIdx = 0, deleting = false;

  function typeEffect() {
    const role = roles[rIdx];
    typingEl.textContent = role.substring(0, deleting ? cIdx - 1 : cIdx + 1);
    deleting ? cIdx-- : cIdx++;

    if (!deleting && cIdx === role.length) {
      deleting = true;
      return setTimeout(typeEffect, 1400);
    }
    if (deleting && cIdx === 0) {
      deleting = false;
      rIdx = (rIdx + 1) % roles.length;
    }
    setTimeout(typeEffect, deleting ? 45 : 90);
  }
  typeEffect();
}

/* ================================================================
   7. CONTACT FORM HANDLER

   HTML IDs required in your form:
     <form      id="contactForm">
     <input     id="fn"        type="text">    ← Full Name
     <input     id="fe_email"  type="email">   ← Email
     <input     id="fe_phone"  type="tel">     ← Phone (optional)
     <select    id="fs">                       ← Subject
     <textarea  id="fm">                       ← Message
     <button    id="submitBtn" type="button">  ← Submit

   Data flow:
     Validate → /api/contact (Telegram + Google Sheet) → EmailJS
================================================================ */
document.addEventListener("DOMContentLoaded", function () {

  const form       = document.getElementById("contactForm");
  const submitBtn  = document.getElementById("submitBtn");
  const phoneInput = document.getElementById("fe_phone");
  const emailInput = document.getElementById("fe_email");

  /* --- Phone field: lock "+91 " prefix, allow only digits --- */
  if (phoneInput) {
    phoneInput.value = "+91 ";

    phoneInput.addEventListener("input", function () {
      const digits = this.value
        .replace("+91 ", "")
        .replace(/[^0-9]/g, "")
        .substring(0, 10);
      this.value = "+91 " + digits;
    });

    phoneInput.addEventListener("keydown", function (e) {
      if (
        this.selectionStart <= 4 &&
        (e.key === "Backspace" || e.key === "Delete")
      ) {
        e.preventDefault();
      }
    });
  }

  /* --- Email: force lowercase in real-time --- */
  if (emailInput) {
    emailInput.addEventListener("input", function () {
      const pos  = this.selectionStart;
      this.value = this.value.toLowerCase();
      this.setSelectionRange(pos, pos);
    });
  }

  /* --- Form submit handler --- */
  if (!submitBtn) return;

  submitBtn.addEventListener("click", async function (e) {
    e.preventDefault();

    /* Collect values */
    const name    = (document.getElementById("fn")?.value  || "").trim();
    const subject = (document.getElementById("fs")?.value  || "").trim();
    const message = (document.getElementById("fm")?.value  || "").trim();
    const phone   = phoneInput ? phoneInput.value.trim() : "";
    const email   = emailInput ? emailInput.value.trim() : "";

    /* ---- Validation ---- */
    if (!name) {
      showToast("Please enter your Full Name.", "error");
      return;
    }
    if (!subject) {
      showToast("Please select a Subject.", "error");
      return;
    }
    if (!message) {
      showToast("Please write your Message.", "error");
      return;
    }

    const emailRegex = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/;
    const emailOK    = emailRegex.test(email.toLowerCase());
    /* "+91 " = 4 chars + 10 digits = 14 total */
    const phoneOK    = /^\+91\s\d{10}$/.test(phone);

    if (!emailOK && !phoneOK) {
      showToast(
        "Please enter a valid Email Address or Phone Number.",
        "error"
      );
      return;
    }

    /* ---- Loading state ---- */
    submitBtn.disabled  = true;
    submitBtn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i>&nbsp; Sending...';

    const payload = {
      name,
      phone   : phoneOK ? phone : "Not Provided",
      email   : emailOK ? email : "Not Provided",
      subject,
      message
    };

    /* ================================================
       STEP 1 — /api/contact  →  Telegram + Google Sheet
       (Server-side, keys fully hidden in .env)
    ================================================ */
    try {
      const apiRes = await fetch("/api/contact", {
        method  : "POST",
        headers : { "Content-Type": "application/json" },
        body    : JSON.stringify(payload)
      });
      if (!apiRes.ok) throw new Error("API HTTP " + apiRes.status);
    } catch (err) {
      /* Non-blocking — continues to EmailJS even if API fails */
      console.warn("Backend API error:", err.message);
    
      showToast("Server sync failed. Saved locally only.","info");
    }
    /* ================================================
       STEP 2 — EmailJS  →  Email to owner + auto-reply
       Wait for config if it hasn't loaded yet
    ================================================ */
    if (emailOK) {
      /* Ensure config is loaded before using keys */
      if (!_configLoaded) await _configPromise;

      if (typeof emailjs !== "undefined" && EMAILJS_SERVICE_ID) {
        try {
        /* =================================
         1. OWNER EMAIL
        ================================= */
          await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            from_name  : name,
            from_phone : phoneOK ? phone : "Not Provided",
            from_email : email,
            subject,
            message,
            reply_to   : email
          });
           /* =================================
             2. USER AUTO REPLY
           ================================= */

           await emailjs.send(EMAILJS_SERVICE_ID,EMAILJS_AUTOREPLY_TEMPLATE_ID,{
          from_name  : name,
          from_phone : phoneOK ? phone : "Not Provided",
          from_email : email,
          subject,
          message,
          reply_to : email

        }

      );
        } catch (err) {
          console.warn("EmailJS error:", err);

          showToast("Email delivery failed.","info");
        }


      }
    }

    /* ================================================
       DONE — Reset UI
    ================================================ */
    showToast("Message sent! I'll reply to you soon. ✅", "success");

    submitBtn.disabled  = false;
    submitBtn.innerHTML =
      '<i class="fa-solid fa-paper-plane"></i> Send Message';

    if (form)       form.reset();
    if (phoneInput) phoneInput.value = "+91 ";

  }); /* end click handler */

}); /* end DOMContentLoaded */

/* ================================================================
   8. CERTIFICATE POPUP
   HTML needed:
     <button class="openCertificate" data-img="path/to/cert.jpg">
     <div class="certificate-popup">
       <button class="close-popup">×</button>
       <img id="popupImage" src="" alt="Certificate">
     </div>
================================================================ */
const popup    = document.querySelector(".certificate-popup");
const popupImg = document.getElementById("popupImage");
const closeBtn = document.querySelector(".close-popup");
const openBtns = document.querySelectorAll(".openCertificate");

if (popup && popupImg && closeBtn) {

  openBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      popupImg.src = btn.getAttribute("data-img") || "";
      popup.classList.add("active");
    });
  });

  closeBtn.addEventListener("click", function () {
    popup.classList.remove("active");
  });

  /* Click outside image = close */
  popup.addEventListener("click", function (e) {
    if (e.target === popup) popup.classList.remove("active");
  });
}

/* ================================================================
   SITE CONFIG — Centralized Personal / Social / Asset Details
================================================================ */

function loadSiteConfig() {

  /* Profile details */
  
  document.querySelectorAll('[data-social="email"]').forEach(el => {
  el.href = `mailto:${SITE_CONFIG.profile.email}`;
  });

  document.querySelectorAll('[data-site="phone"]').forEach(el => {
    el.textContent = SITE_CONFIG.profile.phone;

    if (el.tagName === "A") {
      el.href = `tel:${SITE_CONFIG.profile.phone.replace(/\s+/g, "")}`;
    }
  });



  /* Social links */
  document.querySelectorAll('[data-social="greybox"]').forEach(el => {
    el.href = SITE_CONFIG.social.greybox;
  });

  document.querySelectorAll('[data-social="book"]').forEach(el => {
    el.href = SITE_CONFIG.social.book;
  });

  document.querySelectorAll('[data-social="github"]').forEach(el => {
    el.href = SITE_CONFIG.social.github;
  });

  document.querySelectorAll('[data-social="linkedin"]').forEach(el => {
    el.href = SITE_CONFIG.social.linkedin;
  });

  document.querySelectorAll('[data-social="youtube"]').forEach(el => {
    el.href = SITE_CONFIG.social.youtube;
  });

  document.querySelectorAll('[data-social="instagram"]').forEach(el => {
    el.href = SITE_CONFIG.social.instagram;
  });


  /* Images */
  document.querySelectorAll('[data-image="profile"]').forEach(el => {
  el.src = SITE_CONFIG.links.profile_image;
});

document.querySelectorAll('[data-image="about"]').forEach(el => {
  el.src = SITE_CONFIG.links.about_image;
});

document.querySelectorAll('[data-image="greybox-logo"]').forEach(el => {
  el.src = SITE_CONFIG.links.greybox_logo;
});

/* Resume */

document.querySelectorAll('[data-link="resume"]').forEach(el => {
  el.href = SITE_CONFIG.links.resume;
});
}


/* Run after HTML is ready */
document.addEventListener("DOMContentLoaded", loadSiteConfig);

/* ================================================================
   LOADER — Animated Loading Screen
================================================================ */
document.addEventListener("DOMContentLoaded", () => {

  const loader = document.getElementById("app-loader");

  // Already launched before → don't show loader
  if (localStorage.getItem("mm_portfolio_launched") === "true") {
    if (loader) loader.remove();
    return;
  }

  const percent = document.getElementById("loader-percent");
  const progress = document.getElementById("loader-progress");
  const status = document.getElementById("loader-status");

  if (!loader || !percent || !progress) return;

  const statuses = [
    { value: 0, text: "INITIALIZING..." },
    { value: 20, text: "LOADING EXPERIENCE..." },
    { value: 40, text: "BUILDING INTERFACE..." },
    { value: 60, text: "CONNECTING CREATIVITY..." },
    { value: 80, text: "ALMOST READY..." },
    { value: 100, text: "WELCOME." }
  ];

  const duration = 2600;
  const startTime = performance.now();

  function animateLoader(currentTime) {

    const elapsed = currentTime - startTime;

    const rawProgress = Math.min(
      elapsed / duration,
      1
    );

    const easedProgress =
      1 - Math.pow(1 - rawProgress, 3);

    const current = Math.floor(easedProgress * 100);

    percent.textContent = current;
    progress.style.width = current + "%";

    let currentStatus = statuses[0];

    for (const item of statuses) {
      if (current >= item.value) {
        currentStatus = item;
      }
    }

    status.textContent = currentStatus.text;

    if (rawProgress < 1) {

      requestAnimationFrame(animateLoader);

    } else {

      setTimeout(() => {

        // Remember that first launch is completed
        localStorage.setItem(
          "mm_portfolio_launched",
          "true"
        );

        loader.classList.add("loader-hidden");

        setTimeout(() => {
          loader.remove();
        }, 900);

      }, 500);
    }
  }

  requestAnimationFrame(animateLoader);

});
/* ================================================================
   MM PORTFOLIO — FIRST LAUNCH LOADER
================================================================ */

(function () {

  const LOADER_KEY =
    "mm_portfolio_first_launch";

  const loader =
    document.getElementById("app-loader");


  /* =========================================
     ALREADY COMPLETED
  ========================================= */

  try {

    if (
      localStorage.getItem(LOADER_KEY) ===
      "completed"
    ) {

      if (loader) {
        loader.remove();
      }

      return;
    }

  } catch (error) {

    console.warn(
      "LocalStorage unavailable:",
      error
    );

  }


  /* =========================================
     REQUIRED ELEMENTS
  ========================================= */

  if (!loader) {
    return;
  }


  const percent =
    document.getElementById(
      "loader-percent"
    );

  const progress =
    document.getElementById(
      "loader-progress"
    );

  const status =
    document.getElementById(
      "loader-status"
    );

  const progressTrack =
    document.querySelector(
      ".progress-track"
    );


  if (
    !percent ||
    !progress ||
    !status
  ) {

    loader.remove();

    return;
  }


  /* =========================================
     LOADING STATUS
  ========================================= */

  const statuses = [

    {
      value: 0,
      text: "INITIALIZING..."
    },

    {
      value: 20,
      text: "LOADING EXPERIENCE..."
    },

    {
      value: 40,
      text: "BUILDING INTERFACE..."
    },

    {
      value: 60,
      text: "CONNECTING CREATIVITY..."
    },

    {
      value: 80,
      text: "ALMOST READY..."
    },

    {
      value: 100,
      text: "WELCOME."
    }

  ];


  /* =========================================
     LOADER SETTINGS
  ========================================= */

  const duration = 2600;

  const startTime =
    performance.now();


  /* =========================================
     ANIMATION
  ========================================= */

  function animateLoader(
    currentTime
  ) {

    const elapsed =
      currentTime - startTime;


    const rawProgress =
      Math.min(
        elapsed / duration,
        1
      );


    /*
     * Smooth ease-out
     */

    const easedProgress =
      1 -
      Math.pow(
        1 - rawProgress,
        3
      );


    const current =
      Math.floor(
        easedProgress * 100
      );


    /* =====================================
       UPDATE %
    ===================================== */

    percent.textContent =
      current;


    /* =====================================
       UPDATE BAR
    ===================================== */

    progress.style.width =
      current + "%";


    /* =====================================
       ACCESSIBILITY
    ===================================== */

    if (progressTrack) {

      progressTrack.setAttribute(
        "aria-valuenow",
        current
      );

    }


    /* =====================================
       UPDATE STATUS
    ===================================== */

    let activeStatus =
      statuses[0];


    for (
      const item of statuses
    ) {

      if (
        current >= item.value
      ) {

        activeStatus = item;

      }

    }


    status.textContent =
      activeStatus.text;


    /* =====================================
       CONTINUE
    ===================================== */

    if (
      rawProgress < 1
    ) {

      requestAnimationFrame(
        animateLoader
      );

      return;
    }


    /* =====================================
       100% COMPLETE
    ===================================== */

    setTimeout(() => {


      /*
       * Save first-launch completion
       */

      try {

        localStorage.setItem(
          LOADER_KEY,
          "completed"
        );

      } catch (error) {

        console.warn(
          "Unable to save loader state:",
          error
        );

      }


      /*
       * Fade out
       */

      loader.classList.add(
        "loader-hidden"
      );


      /*
       * Remove after animation
       */

      setTimeout(() => {

        loader.remove();

      }, 900);


    }, 400);

  }


  requestAnimationFrame(
    animateLoader
  );

})();
/* ================================================================
   FLOATING NETWORK STATUS
   Murasolimaran Portfolio PWA
================================================================ */

(function () {

  /* ================================================================
     ELEMENTS
  ================================================================ */

  const widget =
    document.getElementById("network-widget");

  const badge =
    document.getElementById("network-badge");

  const closeButton =
    document.getElementById("network-close");

  const title =
    document.getElementById("network-title");

  const subtitle =
    document.getElementById("network-subtitle");

  const connection =
    document.getElementById("network-connection");

  const network =
    document.getElementById("network-network");

  const footer =
    document.getElementById("network-footer");


  /* ================================================================
     SAFETY CHECK
  ================================================================ */

  if (
    !widget ||
    !badge ||
    !closeButton ||
    !title ||
    !subtitle ||
    !connection ||
    !network ||
    !footer
  ) {
    return;
  }


  /* ================================================================
     TIMER
  ================================================================ */

  let hideTimer = null;


  /* ================================================================
     SHOW ENTIRE WIDGET
  ================================================================ */

  function showWidget() {

    widget.classList.add(
      "widget-visible"
    );

  }


  /* ================================================================
     HIDE ENTIRE WIDGET
     
     Used for:
     ONLINE → 2 sec → hide
     BACK ONLINE → 2 sec → hide
  ================================================================ */

  function hideWidget() {

    clearTimeout(hideTimer);

    widget.classList.remove(
      "widget-visible",
      "card-open"
    );

    badge.setAttribute(
      "aria-expanded",
      "false"
    );

  }


  /* ================================================================
     OPEN CARD
  ================================================================ */

  function openCard() {

    clearTimeout(hideTimer);

    widget.classList.add(
      "widget-visible",
      "card-open"
    );

    badge.setAttribute(
      "aria-expanded",
      "true"
    );

  }


  /* ================================================================
     CLOSE CARD ONLY
     
     Badge remains visible.
  ================================================================ */

  function closeCard() {

    widget.classList.remove(
      "card-open"
    );

    badge.setAttribute(
      "aria-expanded",
      "false"
    );

  }


  /* ================================================================
     HIDE ENTIRE WIDGET AFTER DELAY
  ================================================================ */

  function hideAfter(delay) {

    clearTimeout(hideTimer);

    hideTimer = setTimeout(
      function () {

        hideWidget();

      },
      delay
    );

  }


  /* ================================================================
     ONLINE STATE
     
     Card + badge visible for 2 seconds.
     Then BOTH disappear.
  ================================================================ */

  function showOnline() {

    clearTimeout(hideTimer);


    widget.classList.remove(
      "offline",
      "checking"
    );

    widget.classList.add(
      "online"
    );


    title.textContent =
      "You're Online";

    subtitle.textContent =
      "Internet connection available";

    connection.textContent =
      "ONLINE";

    network.textContent =
      "Active";

    footer.textContent =
      "All features available";


    /* Show card + badge */

    openCard();


    /* Hide BOTH after 2 seconds */

    hideAfter(2000);

  }


  /* ================================================================
     OFFLINE STATE
     
     Card + badge visible initially.
     Card closes after 5 seconds.
     Badge stays visible.
  ================================================================ */

  function showOffline() {

    clearTimeout(hideTimer);


    widget.classList.remove(
      "online",
      "checking"
    );

    widget.classList.add(
      "offline"
    );


    title.textContent =
      "You're Offline";

    subtitle.textContent =
      "No internet connection";

    connection.textContent =
      "OFFLINE";

    network.textContent =
      "Disconnected";

    footer.textContent =
      "Waiting for internet connection";


    /* Show card + badge */

    openCard();


    /*
     * After 5 seconds:
     *
     * CARD closes
     * BADGE stays
     */

    hideTimer = setTimeout(
      function () {

        closeCard();

      },
      3000
    );

  }


  /* ================================================================
     CHECKING STATE
  ================================================================ */

  function showChecking() {

    clearTimeout(hideTimer);


    widget.classList.remove(
      "online",
      "offline"
    );

    widget.classList.add(
      "checking"
    );


    title.textContent =
      "Checking Connection";

    subtitle.textContent =
      "Checking internet access...";

    connection.textContent =
      "CHECKING";

    network.textContent =
      "Please wait";

    footer.textContent =
      "Checking network status";


    openCard();

  }


  /* ================================================================
     INITIAL APP LOAD
  ================================================================ */

  showChecking();


  setTimeout(
    function () {

      if (navigator.onLine) {

        /*
         * Internet available
         *
         * Show Online for 2 sec
         */

        showOnline();

      } else {

        /*
         * Internet unavailable
         *
         * Show Offline card for 5 sec
         */

        showOffline();

      }

    },
    700
  );


  /* ================================================================
     BADGE CLICK
     
     User can manually open/close the card.
  ================================================================ */

  badge.addEventListener(
    "click",
    function () {

      const isOpen =
        widget.classList.contains(
          "card-open"
        );


      if (isOpen) {

        /*
         * Card already open
         * → close card only
         */

        closeCard();

      } else {

        /*
         * Card closed
         * → open card
         */

        openCard();


        /*
         * If currently offline,
         * don't auto-close after clicking.
         *
         * User controls it manually.
         */

        if (
          widget.classList.contains(
            "offline"
          )
        ) {

          clearTimeout(hideTimer);

        }

      }

    }
  );


  /* ================================================================
     CLOSE BUTTON
  ================================================================ */

  closeButton.addEventListener(
    "click",
    function () {

      /*
       * Offline:
       * close CARD only.
       * Badge remains.
       */

      if (
        widget.classList.contains(
          "offline"
        )
      ) {

        clearTimeout(hideTimer);

        closeCard();

        return;

      }


      /*
       * Online / Checking:
       * close everything.
       */

      hideWidget();

    }
  );


  /* ================================================================
     INTERNET CONNECTION RESTORED
     
     Offline → Online
     
     Show "Back Online"
     for 2 seconds.
     
     Then hide badge + card.
  ================================================================ */

  window.addEventListener(
    "online",
    function () {

      clearTimeout(hideTimer);


      widget.classList.remove(
        "offline",
        "checking"
      );

      widget.classList.add(
        "online"
      );


      title.textContent =
        "Back Online";

      subtitle.textContent =
        "Internet connection restored";

      connection.textContent =
        "ONLINE";

      network.textContent =
        "Active";

      footer.textContent =
        "Connection restored";


      /*
       * Show card + badge
       */

      openCard();


      /*
       * Hide BOTH after 2 seconds
       */

      hideAfter(2000);

    }
  );


  /* ================================================================
     INTERNET CONNECTION LOST
     
     Online → Offline
     
     Show offline card.
     After 5 seconds card closes.
     Badge stays.
  ================================================================ */

  window.addEventListener(
    "offline",
    function () {

      clearTimeout(hideTimer);

      showOffline();

    }
  );


  /* ================================================================
     ESCAPE KEY
  ================================================================ */

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key !== "Escape"
      ) {
        return;
      }


      /*
       * Offline:
       * ESC closes card only.
       * Badge remains.
       */

      if (
        widget.classList.contains(
          "offline"
        )
      ) {

        clearTimeout(hideTimer);

        closeCard();

        return;

      }


      /*
       * Online / Checking:
       * hide everything.
       */

      hideWidget();

    }
  );


})();