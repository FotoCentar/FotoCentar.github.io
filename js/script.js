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
     SERVICE MODAL CONTACT BUTTONS
  ===================================================== */

  const modalContactButtons = document.querySelectorAll(".modal-contact-btn");

  modalContactButtons.forEach((button) => {
    /*
     * Го отстрануваме Bootstrap автоматското dismiss
     * за ние да го контролираме редоследот:
     * 1. затвори modal
     * 2. скролај до контакт секцијата
     */
    button.removeAttribute("data-bs-dismiss");

    button.addEventListener("click", (event) => {
      event.preventDefault();

      const targetSelector = button.getAttribute("href") || "#contact";
      const modalElement = button.closest(".modal");

      if (!modalElement || typeof bootstrap === "undefined") {
        scrollToSection(targetSelector);
        return;
      }

      const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);

      modalElement.addEventListener(
        "hidden.bs.modal",
        () => {
          scrollToSection(targetSelector);
          setActiveNavLink(targetSelector);
        },
        { once: true },
      );

      modalInstance.hide();
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

  const galleryModalImageWrapper = document.querySelector(
    ".gallery-modal-image-wrapper",
  );

  /*
   * Ги креираме стрелките и бројачот автоматски
   * ако случајно сè уште се користи постар index.html.
   */
  let galleryModalPreviousButton = document.getElementById("galleryModalPrev");

  let galleryModalNextButton = document.getElementById("galleryModalNext");

  let galleryModalCounter = document.getElementById("galleryModalCounter");

  if (galleryModalImageWrapper && !galleryModalPreviousButton) {
    galleryModalPreviousButton = document.createElement("button");

    galleryModalPreviousButton.type = "button";
    galleryModalPreviousButton.id = "galleryModalPrev";
    galleryModalPreviousButton.className =
      "gallery-modal-nav gallery-modal-prev";
    galleryModalPreviousButton.setAttribute(
      "aria-label",
      "Претходна фотографија",
    );
    galleryModalPreviousButton.innerHTML =
      '<i class="fa-solid fa-chevron-left"></i>';

    galleryModalImageWrapper.prepend(galleryModalPreviousButton);
  }

  if (galleryModalImageWrapper && !galleryModalNextButton) {
    galleryModalNextButton = document.createElement("button");

    galleryModalNextButton.type = "button";
    galleryModalNextButton.id = "galleryModalNext";
    galleryModalNextButton.className = "gallery-modal-nav gallery-modal-next";
    galleryModalNextButton.setAttribute("aria-label", "Следна фотографија");
    galleryModalNextButton.innerHTML =
      '<i class="fa-solid fa-chevron-right"></i>';

    galleryModalImageWrapper.append(galleryModalNextButton);
  }

  if (!galleryModalCounter) {
    const galleryModalCaption = document.querySelector(
      ".gallery-modal-caption",
    );

    if (galleryModalCaption) {
      galleryModalCounter = document.createElement("span");

      galleryModalCounter.id = "galleryModalCounter";
      galleryModalCounter.className = "gallery-modal-counter";
      galleryModalCounter.setAttribute("aria-live", "polite");

      galleryModalCaption.append(galleryModalCounter);
    }
  }

  let currentGalleryImages = [];
  let currentGalleryIndex = 0;
  let galleryTouchStartX = 0;
  let galleryImageChangeTimer = null;

  /* =====================================================
     5. GALLERY FILTERING
  ===================================================== */

  galleryFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedFilter = button.dataset.filter || "all";

      galleryFilterButtons.forEach((filterButton) => {
        filterButton.classList.remove("active");
      });

      button.classList.add("active");

      galleryItems.forEach((item) => {
        const itemCategory = item.dataset.category || "";

        const shouldShow =
          selectedFilter === "all" || selectedFilter === itemCategory;

        item.classList.remove("gallery-visible");

        if (shouldShow) {
          item.classList.remove("gallery-hidden");

          void item.offsetWidth;

          item.classList.add("gallery-visible");
        } else {
          item.classList.add("gallery-hidden");
        }
      });
    });
  });

  /* =====================================================
     6. UNIVERSAL GALLERY ALBUM LIGHTBOX
  ===================================================== */

  const getGalleryGroup = (clickedButton) => {
    /*
     * Новиот album систем користи data-album.
     */
    const selectedAlbum = clickedButton.dataset.album || "";

    if (selectedAlbum) {
      return Array.from(
        document.querySelectorAll(
          `[data-album="${CSS.escape(selectedAlbum)}"][data-image]`,
        ),
      );
    }

    /*
     * Fallback за стариот HTML:
     * ги групира сите видливи gallery картички
     * што имаат исто data-category.
     */
    const clickedGalleryItem = clickedButton.closest(".gallery-item");

    const selectedCategory = clickedGalleryItem?.dataset.category || "";

    if (!selectedCategory) {
      return [clickedButton];
    }

    return Array.from(
      document.querySelectorAll(
        `.gallery-item[data-category="${CSS.escape(selectedCategory)}"] .gallery-image-button[data-image]`,
      ),
    );
  };

  const updateGalleryModal = () => {
    if (currentGalleryImages.length === 0 || !galleryModalImage) {
      return;
    }

    const currentImage = currentGalleryImages[currentGalleryIndex];

    if (!currentImage) return;

    const imageSource = currentImage.dataset.image || "";

    const imageTitle = currentImage.dataset.title || "Фотографија";

    const categoryName = currentImage.dataset.categoryName || "";

    if (galleryImageChangeTimer) {
      window.clearTimeout(galleryImageChangeTimer);
    }

    galleryModalImage.classList.add("is-changing");

    galleryImageChangeTimer = window.setTimeout(() => {
      galleryModalImage.src = imageSource;
      galleryModalImage.alt = imageTitle;

      if (galleryModalTitle) {
        galleryModalTitle.textContent = imageTitle;
      }

      if (galleryModalCategory) {
        galleryModalCategory.textContent = categoryName;
      }

      if (galleryModalCounter) {
        galleryModalCounter.textContent = `${currentGalleryIndex + 1} / ${currentGalleryImages.length}`;
      }

      const hasMultipleImages = currentGalleryImages.length > 1;

      if (galleryModalPreviousButton) {
        galleryModalPreviousButton.hidden = !hasMultipleImages;
      }

      if (galleryModalNextButton) {
        galleryModalNextButton.hidden = !hasMultipleImages;
      }

      window.requestAnimationFrame(() => {
        galleryModalImage.classList.remove("is-changing");
      });

      galleryImageChangeTimer = null;
    }, 100);
  };

  const showPreviousGalleryImage = () => {
    if (currentGalleryImages.length < 2) return;

    currentGalleryIndex =
      (currentGalleryIndex - 1 + currentGalleryImages.length) %
      currentGalleryImages.length;

    updateGalleryModal();
  };

  const showNextGalleryImage = () => {
    if (currentGalleryImages.length < 2) return;

    currentGalleryIndex =
      (currentGalleryIndex + 1) % currentGalleryImages.length;

    updateGalleryModal();
  };

  if (galleryModal) {
    galleryModal.addEventListener("show.bs.modal", (event) => {
      const clickedButton = event.relatedTarget;

      if (
        !clickedButton ||
        !clickedButton.matches(".gallery-image-button[data-image]")
      ) {
        return;
      }

      currentGalleryImages = getGalleryGroup(clickedButton);

      currentGalleryIndex = currentGalleryImages.indexOf(clickedButton);

      if (currentGalleryIndex < 0) {
        currentGalleryIndex = 0;
      }

      updateGalleryModal();
    });

    galleryModal.addEventListener("hidden.bs.modal", () => {
      if (galleryImageChangeTimer) {
        window.clearTimeout(galleryImageChangeTimer);

        galleryImageChangeTimer = null;
      }

      currentGalleryImages = [];
      currentGalleryIndex = 0;

      if (galleryModalImage) {
        galleryModalImage.src = "";
        galleryModalImage.alt = "";

        galleryModalImage.classList.remove("is-changing");
      }

      if (galleryModalTitle) {
        galleryModalTitle.textContent = "";
      }

      if (galleryModalCategory) {
        galleryModalCategory.textContent = "";
      }

      if (galleryModalCounter) {
        galleryModalCounter.textContent = "";
      }

      if (galleryModalPreviousButton) {
        galleryModalPreviousButton.hidden = true;
      }

      if (galleryModalNextButton) {
        galleryModalNextButton.hidden = true;
      }
    });
  }

  galleryModalPreviousButton?.addEventListener(
    "click",
    showPreviousGalleryImage,
  );

  galleryModalNextButton?.addEventListener("click", showNextGalleryImage);

  document.addEventListener("keydown", (event) => {
    if (!galleryModal?.classList.contains("show")) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPreviousGalleryImage();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNextGalleryImage();
    }
  });

  galleryModalImageWrapper?.addEventListener(
    "touchstart",
    (event) => {
      galleryTouchStartX = event.changedTouches[0].clientX;
    },
    {
      passive: true,
    },
  );

  galleryModalImageWrapper?.addEventListener(
    "touchend",
    (event) => {
      const galleryTouchEndX = event.changedTouches[0].clientX;

      const swipeDistance = galleryTouchEndX - galleryTouchStartX;

      if (Math.abs(swipeDistance) < 50) {
        return;
      }

      if (swipeDistance > 0) {
        showPreviousGalleryImage();
      } else {
        showNextGalleryImage();
      }
    },
    {
      passive: true,
    },
  );

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

  const currentYear = document.getElementById("currentYear");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }
});
