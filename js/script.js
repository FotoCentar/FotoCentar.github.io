document.addEventListener("DOMContentLoaded", () => {
  /* =====================================================
     NAVBAR ELEMENTS
  ===================================================== */

  const navbar = document.getElementById("mainNavbar");

  const desktopNavLinks = document.querySelectorAll("#mainNavbar .nav-link");

  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  const allNavLinks = [...desktopNavLinks, ...mobileNavLinks];

  const sections = allNavLinks
    .map((link) => {
      const sectionId = link.getAttribute("href");

      if (!sectionId || !sectionId.startsWith("#")) {
        return null;
      }

      return document.querySelector(sectionId);
    })
    .filter((section, index, array) => {
      return section !== null && array.indexOf(section) === index;
    });

  let scrollAnimationRunning = false;

  /* =====================================================
     1. NAVBAR BACKGROUND ON SCROLL
  ===================================================== */

  const updateNavbarBackground = () => {
    if (!navbar) return;

    navbar.classList.toggle("navbar-scrolled", window.scrollY > 40);
  };

  /* =====================================================
     2. ACTIVE NAVIGATION LINK
  ===================================================== */

  const updateActiveNavigation = () => {
    if (!navbar || sections.length === 0) return;

    const navbarHeight = navbar.offsetHeight;
    const scrollPosition = window.scrollY + navbarHeight + 120;

    let currentSectionId = sections[0].id;

    sections.forEach((section) => {
      if (scrollPosition >= section.offsetTop) {
        currentSectionId = section.id;
      }
    });

    allNavLinks.forEach((link) => {
      const linkTarget = link.getAttribute("href");

      link.classList.toggle("active", linkTarget === `#${currentSectionId}`);
    });
  };

  /* =====================================================
     3. OPTIMIZED SCROLL HANDLER
  ===================================================== */

  const handleScroll = () => {
    if (scrollAnimationRunning) return;

    scrollAnimationRunning = true;

    window.requestAnimationFrame(() => {
      updateNavbarBackground();
      updateActiveNavigation();

      scrollAnimationRunning = false;
    });
  };

  /* =====================================================
     4. NAVIGATION CLICK
  ===================================================== */

  const setActiveNavLink = (targetSelector) => {
    allNavLinks.forEach((navLink) => {
      navLink.classList.toggle(
        "active",
        navLink.getAttribute("href") === targetSelector,
      );
    });
  };

  const scrollToSection = (targetSelector) => {
    if (!targetSelector || !targetSelector.startsWith("#")) return;

    const targetSection = document.querySelector(targetSelector);

    if (!targetSection) {
      console.warn(`Не постои секција: ${targetSelector}`);
      return;
    }

    const navbarHeight = navbar?.offsetHeight || 0;

    const targetPosition =
      targetSection.getBoundingClientRect().top +
      window.scrollY -
      navbarHeight +
      1;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });

    window.history.replaceState(null, "", targetSelector);
  };

  /* Desktop navigation */

  desktopNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setActiveNavLink(link.getAttribute("href"));
    });
  });

  /* Mobile navigation */

  const mobileMenu = document.getElementById("mobileMenu");

  const mobileOffcanvas =
    mobileMenu && typeof bootstrap !== "undefined"
      ? bootstrap.Offcanvas.getOrCreateInstance(mobileMenu)
      : null;

  const mobileMenuLinks = document.querySelectorAll(
    ".mobile-nav-link, .mobile-contact-btn, .mobile-menu-logo",
  );

  mobileMenuLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetSelector = link.getAttribute("href");

      if (!targetSelector || !targetSelector.startsWith("#")) return;

      event.preventDefault();
      setActiveNavLink(targetSelector);

      if (mobileMenu?.classList.contains("show") && mobileOffcanvas) {
        mobileMenu.addEventListener(
          "hidden.bs.offcanvas",
          () => {
            scrollToSection(targetSelector);
          },
          { once: true },
        );

        mobileOffcanvas.hide();
      } else {
        scrollToSection(targetSelector);
      }
    });
  });

  /* =====================================================
     GALLERY ELEMENTS
  ===================================================== */

  const galleryFilterButtons = document.querySelectorAll(".gallery-filter");

  const galleryItems = document.querySelectorAll(".gallery-item");

  const galleryModal = document.getElementById("galleryModal");

  const galleryModalImage = document.getElementById("galleryModalImage");

  const galleryModalTitle = document.getElementById("galleryModalTitle");

  const galleryModalCategory = document.getElementById("galleryModalCategory");

  /* =====================================================
     5. GALLERY FILTERING
  ===================================================== */

  galleryFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedFilter = button.dataset.filter || "all";

      /* Active filter button */

      galleryFilterButtons.forEach((filterButton) => {
        filterButton.classList.remove("active");
      });

      button.classList.add("active");

      /* Filter gallery items */

      galleryItems.forEach((item) => {
        const itemCategory = item.dataset.category || "";

        const shouldShow =
          selectedFilter === "all" || selectedFilter === itemCategory;

        item.classList.remove("gallery-visible");

        if (shouldShow) {
          item.classList.remove("gallery-hidden");

          /*
           * Го принудуваме browser-от повторно
           * да ја активира reveal-анимацијата.
           */
          void item.offsetWidth;

          item.classList.add("gallery-visible");
        } else {
          item.classList.add("gallery-hidden");
        }
      });
    });
  });

  /* =====================================================
     6. GALLERY LIGHTBOX MODAL
  ===================================================== */

  if (galleryModal) {
    galleryModal.addEventListener("show.bs.modal", (event) => {
      const clickedButton = event.relatedTarget;

      if (!clickedButton) return;

      const imageSource = clickedButton.dataset.image || "";

      const imageTitle = clickedButton.dataset.title || "Фотографија";

      const categoryName = clickedButton.dataset.categoryName || "";

      if (galleryModalImage) {
        galleryModalImage.src = imageSource;
        galleryModalImage.alt = imageTitle;
      }

      if (galleryModalTitle) {
        galleryModalTitle.textContent = imageTitle;
      }

      if (galleryModalCategory) {
        galleryModalCategory.textContent = categoryName;
      }
    });

    /*
     * Го празниме src кога modal-от ќе се затвори,
     * за старата фотографија да не се прикаже накратко
     * при следното отворање.
     */

    galleryModal.addEventListener("hidden.bs.modal", () => {
      if (galleryModalImage) {
        galleryModalImage.src = "";
        galleryModalImage.alt = "";
      }

      if (galleryModalTitle) {
        galleryModalTitle.textContent = "";
      }

      if (galleryModalCategory) {
        galleryModalCategory.textContent = "";
      }
    });
  }

  /* =====================================================
     7. KEYBOARD ACCESSIBILITY FOR FILTERS
  ===================================================== */

  galleryFilterButtons.forEach((button, index) => {
    button.addEventListener("keydown", (event) => {
      let nextIndex = index;

      if (event.key === "ArrowRight") {
        nextIndex = (index + 1) % galleryFilterButtons.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex =
          (index - 1 + galleryFilterButtons.length) %
          galleryFilterButtons.length;
      } else {
        return;
      }

      event.preventDefault();

      galleryFilterButtons[nextIndex].focus();
      galleryFilterButtons[nextIndex].click();
    });
  });

  /* =====================================================
   ABOUT COUNTER ELEMENTS
===================================================== */

  const aboutStatistics = document.querySelector(".about-statistics");

  const aboutStatNumbers = document.querySelectorAll(".about-stat-number");

  let aboutCountersStarted = false;

  /* =====================================================
   ABOUT COUNTER ANIMATION
===================================================== */

  const animateAboutCounter = (counter) => {
    const target = Number(counter.dataset.target);
    const suffix = counter.dataset.suffix || "";

    /*
     * Времетраење на анимацијата во милисекунди.
     */
    const duration = 1800;
    const startTime = performance.now();

    if (!Number.isFinite(target)) {
      counter.textContent = `0${suffix}`;
      return;
    }

    const updateCounter = (currentTime) => {
      const elapsedTime = currentTime - startTime;

      const progress = Math.min(elapsedTime / duration, 1);

      /*
       * Ease-out ефект:
       * бројките започнуваат побрзо,
       * а завршуваат постепено.
       */
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      const currentValue = Math.round(target * easedProgress);

      counter.textContent = `${currentValue.toLocaleString("mk-MK")}${suffix}`;

      if (progress < 1) {
        window.requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = `${target.toLocaleString("mk-MK")}${suffix}`;
      }
    };

    window.requestAnimationFrame(updateCounter);
  };

  /* =====================================================
   START ALL ABOUT COUNTERS
===================================================== */

  const startAboutCounters = () => {
    if (aboutCountersStarted) return;

    aboutCountersStarted = true;

    aboutStatNumbers.forEach((counter) => {
      animateAboutCounter(counter);
    });
  };

  /* =====================================================
   OBSERVE ABOUT STATISTICS
===================================================== */

  if (
    aboutStatistics &&
    aboutStatNumbers.length > 0 &&
    "IntersectionObserver" in window
  ) {
    const aboutCounterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          startAboutCounters();
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.35,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    aboutCounterObserver.observe(aboutStatistics);
  } else if (aboutStatNumbers.length > 0) {
    /*
     * Fallback за постари browser-и.
     */
    startAboutCounters();
  }

  /* =====================================================
     8. INITIAL FUNCTIONS
  ===================================================== */

  updateNavbarBackground();
  updateActiveNavigation();

  window.addEventListener("scroll", handleScroll, {
    passive: true,
  });

  window.addEventListener("resize", () => {
    updateActiveNavigation();
  });
});