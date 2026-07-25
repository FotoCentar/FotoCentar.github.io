document.addEventListener("DOMContentLoaded", () => {
  /* =====================================================
   EMAILJS CONFIGURATION
===================================================== */

  const EMAILJS_PUBLIC_KEY = "uLOEyqwv4uoEwfsFO";
  const EMAILJS_SERVICE_ID = "service_wz2nm0e";
  const EMAILJS_TEMPLATE_ID = "template_8wc1bc2";

  if (typeof emailjs !== "undefined") {
    emailjs.init({
      publicKey: EMAILJS_PUBLIC_KEY,
      blockHeadless: true,
      limitRate: {
        id: "contact-form",
        throttle: 10000,
      },
    });
  }
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

  allNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const clickedTarget = link.getAttribute("href");

      allNavLinks.forEach((navLink) => {
        navLink.classList.toggle(
          "active",
          navLink.getAttribute("href") === clickedTarget,
        );
      });
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
   CONTACT FORM ELEMENTS
===================================================== */

  const contactForm = document.getElementById("contactForm");

  const contactName = document.getElementById("contactName");

  const contactPhone = document.getElementById("contactPhone");

  const contactEmail = document.getElementById("contactEmail");

  const contactService = document.getElementById("contactService");

  const contactDate = document.getElementById("contactDate");

  const contactLocation = document.getElementById("contactLocation");

  const contactMessage = document.getElementById("contactMessage");

  const contactConsent = document.getElementById("contactConsent");

  const contactFormResponse = document.getElementById("contactFormResponse");

  const contactSubmitButton = contactForm?.querySelector(".contact-submit-btn");

  /* =====================================================
   SET MINIMUM DATE
===================================================== */

  if (contactDate) {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    contactDate.min = `${year}-${month}-${day}`;
  }

  /* =====================================================
   CONTACT FORM HELPERS
===================================================== */

  const getFormGroup = (field) => {
    return field?.closest(".contact-form-group");
  };

  const showFieldError = (field) => {
    const formGroup = getFormGroup(field);

    if (!formGroup) return;

    formGroup.classList.add("has-error");
    formGroup.classList.remove("has-success");

    field.setAttribute("aria-invalid", "true");
  };

  const showFieldSuccess = (field) => {
    const formGroup = getFormGroup(field);

    if (!formGroup) return;

    formGroup.classList.remove("has-error");
    formGroup.classList.add("has-success");

    field.setAttribute("aria-invalid", "false");
  };

  const clearFieldState = (field) => {
    const formGroup = getFormGroup(field);

    if (!formGroup) return;

    formGroup.classList.remove("has-error", "has-success");

    field.removeAttribute("aria-invalid");
  };

  const hideFormResponse = () => {
    if (!contactFormResponse) return;

    contactFormResponse.textContent = "";

    contactFormResponse.classList.remove("is-success", "is-error");
  };

  /* =====================================================
   FIELD VALIDATION FUNCTIONS
===================================================== */

  const validateName = () => {
    if (!contactName) return true;

    const nameValue = contactName.value.trim();

    /*
     * Најмалку 3 карактери.
     */
    const isValid = nameValue.length >= 3;

    if (isValid) {
      showFieldSuccess(contactName);
    } else {
      showFieldError(contactName);
    }

    return isValid;
  };

  const validatePhone = () => {
    if (!contactPhone) return true;

    /*
     * Ги отстрануваме празните места,
     * цртичките и заградите.
     */
    const phoneValue = contactPhone.value.trim().replace(/[\s\-()]/g, "");

    /*
     * Дозволува:
     * 070123456
     * +38970123456
     * 38970123456
     */
    const phonePattern = /^\+?\d{8,15}$/;

    const isValid = phonePattern.test(phoneValue);

    if (isValid) {
      showFieldSuccess(contactPhone);
    } else {
      showFieldError(contactPhone);
    }

    return isValid;
  };

  const validateEmail = () => {
    if (!contactEmail) return true;

    const emailValue = contactEmail.value.trim();

    /*
     * E-mail полето не е задолжително.
     */
    if (emailValue === "") {
      clearFieldState(contactEmail);
      return true;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const isValid = emailPattern.test(emailValue);

    if (isValid) {
      showFieldSuccess(contactEmail);
    } else {
      showFieldError(contactEmail);
    }

    return isValid;
  };

  const validateService = () => {
    if (!contactService) return true;

    const isValid = contactService.value.trim() !== "";

    if (isValid) {
      showFieldSuccess(contactService);
    } else {
      showFieldError(contactService);
    }

    return isValid;
  };

  const validateMessage = () => {
    if (!contactMessage) return true;

    const messageValue = contactMessage.value.trim();

    /*
     * Пораката мора да има најмалку
     * 10 карактери.
     */
    const isValid = messageValue.length >= 10;

    if (isValid) {
      showFieldSuccess(contactMessage);
    } else {
      showFieldError(contactMessage);
    }

    return isValid;
  };

  const validateConsent = () => {
    if (!contactConsent) return true;

    const consentError = document.querySelector(".consent-error");

    const isValid = contactConsent.checked;

    if (isValid) {
      contactConsent.setAttribute("aria-invalid", "false");

      consentError?.classList.remove("is-visible");
    } else {
      contactConsent.setAttribute("aria-invalid", "true");

      consentError?.classList.add("is-visible");
    }

    return isValid;
  };

  /* =====================================================
   VALIDATE COMPLETE FORM
===================================================== */

  const validateContactForm = () => {
    const validationResults = [
      validateName(),
      validatePhone(),
      validateEmail(),
      validateService(),
      validateMessage(),
      validateConsent(),
    ];

    return validationResults.every((result) => result === true);
  };

  /* =====================================================
   VALIDATE FIELDS ON BLUR
===================================================== */

  contactName?.addEventListener("blur", validateName);

  contactPhone?.addEventListener("blur", validatePhone);

  contactEmail?.addEventListener("blur", validateEmail);

  contactService?.addEventListener("change", validateService);

  contactMessage?.addEventListener("blur", validateMessage);

  contactConsent?.addEventListener("change", validateConsent);

  /* =====================================================
   REMOVE ERROR WHILE USER TYPES
===================================================== */

  contactName?.addEventListener("input", () => {
    if (contactName.value.trim().length >= 3) {
      validateName();
    }

    hideFormResponse();
  });

  contactPhone?.addEventListener("input", () => {
    if (contactPhone.value.trim().length >= 8) {
      validatePhone();
    }

    hideFormResponse();
  });

  contactEmail?.addEventListener("input", () => {
    if (contactEmail.value.trim() === "" || contactEmail.value.includes("@")) {
      validateEmail();
    }

    hideFormResponse();
  });

  contactMessage?.addEventListener("input", () => {
    if (contactMessage.value.trim().length >= 10) {
      validateMessage();
    }

    hideFormResponse();
  });

  /* =====================================================
   CONTACT FORM SUBMIT WITH EMAILJS
===================================================== */

  const setContactButtonLoading = (isLoading) => {
    if (!contactSubmitButton) return;

    contactSubmitButton.disabled = isLoading;

    if (isLoading) {
      contactSubmitButton.innerHTML = `
      <span>Се испраќа...</span>
      <i class="fa-solid fa-spinner fa-spin"></i>
    `;
    } else {
      contactSubmitButton.innerHTML = `
      <span>Испрати барање</span>
      <i class="fa-solid fa-arrow-right"></i>
    `;
    }
  };

  const resetContactFormStates = () => {
    if (!contactForm) return;

    contactForm.querySelectorAll(".contact-form-group").forEach((formGroup) => {
      formGroup.classList.remove("has-error", "has-success");
    });

    contactForm.querySelectorAll("[aria-invalid]").forEach((field) => {
      field.removeAttribute("aria-invalid");
    });

    document.querySelector(".consent-error")?.classList.remove("is-visible");
  };

  contactForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    hideFormResponse();

    const formIsValid = validateContactForm();

    if (!formIsValid) {
      if (contactFormResponse) {
        contactFormResponse.textContent =
          "Проверете ги означените полиња и обидете се повторно.";

        contactFormResponse.classList.add("is-error");
      }

      const firstInvalidField = contactForm.querySelector(
        '[aria-invalid="true"]',
      );

      firstInvalidField?.focus();
      return;
    }

    if (typeof emailjs === "undefined") {
      if (contactFormResponse) {
        contactFormResponse.textContent =
          "Сервисот за испраќање моментално не е достапен.";

        contactFormResponse.classList.add("is-error");
      }

      return;
    }

    setContactButtonLoading(true);

    try {
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        contactForm,
      );

      if (contactFormResponse) {
        contactFormResponse.textContent =
          "Вашето барање е успешно испратено. Ќе ве контактираме во најкраток можен рок.";

        contactFormResponse.classList.add("is-success");
      }

      contactForm.reset();
      resetContactFormStates();
    } catch (error) {
      console.error("EmailJS error:", error);

      if (contactFormResponse) {
        contactFormResponse.textContent =
          "Барањето не беше испратено. Обидете се повторно или јавете ни се телефонски.";

        contactFormResponse.classList.add("is-error");
      }
    } finally {
      setContactButtonLoading(false);
    }
  });
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
