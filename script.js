// script.js — robust loader + safe event wiring

document.addEventListener("DOMContentLoaded", () => {
  // Load header and footer in parallel, but initialize components only after insertion.
  const headerPromise = fetch("header.html")
    .then(res => {
      if (!res.ok) throw new Error("Header fetch failed: " + res.status);
      return res.text();
    })
    .then(html => {
      const hdr = document.getElementById("header");
      if (hdr) hdr.innerHTML = html;
      setupMenuToggle(); // init header interactions after insertion
    })
    .catch(err => {
      console.error("Could not load header:", err);
    });

  const footerPromise = fetch("footer.html")
    .then(res => {
      if (!res.ok) throw new Error("Footer fetch failed: " + res.status);
      return res.text();
    })
    .then(html => {
      const ftr = document.getElementById("footer");
      if (ftr) ftr.innerHTML = html;
      setupScrollTop(); // footer inserted -> wire scroll button
    })
    .catch(err => {
      console.error("Could not load footer:", err);
    });

  // After both header/footer attempts complete, initialize page-specific features (modal, etc.)
  Promise.allSettled([headerPromise, footerPromise]).then(() => {
    setupMenuModal(); // safe: will check for elements internally
  });
});

/* -------------------------
   Header: mobile menu toggle
   ------------------------- */
function setupMenuToggle() {
  // elements are inside header.html which was injected
  const toggle = document.getElementById("menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (!toggle || !navLinks) return; // nothing to do if header isn't present

  toggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
    toggle.classList.toggle("open");
  });

  // Close mobile menu when a nav link is clicked (nice UX)
  navLinks.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      if (navLinks.classList.contains("show")) {
        navLinks.classList.remove("show");
        toggle.classList.remove("open");
      }
    });
  });

  // Optional: close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!navLinks.contains(e.target) && !toggle.contains(e.target)) {
      navLinks.classList.remove("show");
      toggle.classList.remove("open");
    }
  });
}

/* -------------------------
   Menu Modal (index/menu pages)
   ------------------------- */
function setupMenuModal() {
  const openBtn = document.getElementById("openMenuBtn");
  const modal = document.getElementById("menuModal");
  if (!openBtn || !modal) return; // not on this page

  const closeBtn = document.getElementById("closeMenuBtn");

  function openModal(e) {
    e && e.preventDefault();
    modal.style.display = "flex";
    // lock background scroll while modal is open
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.style.display = "none";
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  openBtn.addEventListener("click", openModal);

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  // Close when clicking outside modal-content
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") {
      closeModal();
    }
  });
}

/* -------------------------
   Footer: scroll-to-top
   ------------------------- */
function setupScrollTop() {
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  if (!scrollTopBtn) return;

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  // Optional: show/hide the button based on scroll position (useful if you move it out of the footer)
  // If you keep the button inside the footer bar (as it is now), you can comment out the next block.
  const showOn = 200; // px
  window.addEventListener("scroll", () => {
    if (window.scrollY > showOn) {
      scrollTopBtn.style.opacity = "1";
      scrollTopBtn.style.pointerEvents = "auto";
    } else {
      scrollTopBtn.style.opacity = "0.25";
      scrollTopBtn.style.pointerEvents = "none";
    }
  });

  // initialize visibility
  if (window.scrollY > showOn) {
    scrollTopBtn.style.opacity = "1";
    scrollTopBtn.style.pointerEvents = "auto";
  } else {
    scrollTopBtn.style.opacity = "0.25";
    scrollTopBtn.style.pointerEvents = "none";
  }
}
