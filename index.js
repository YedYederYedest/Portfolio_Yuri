
/* ========================================
   KEYBOARD ACCESSIBILITY
======================================== */

const handleFirstTab = (event) => {
  if (event.key === "Tab") {
    document.body.classList.add("user-is-tabbing");

    window.removeEventListener("keydown", handleFirstTab);
    window.addEventListener("mousedown", handleMouseDownOnce);
  }
};

const handleMouseDownOnce = () => {
  document.body.classList.remove("user-is-tabbing");

  window.removeEventListener("mousedown", handleMouseDownOnce);
  window.addEventListener("keydown", handleFirstTab);
};

window.addEventListener("keydown", handleFirstTab);


/* ========================================
   HTML SECTIONS
======================================== */

const sections = [
  { id: "headernav", file: "./html/headernav.html" },
  { id: "work", file: "./html/work.html" },
  { id: "about", file: "./html/about.html" },
  { id: "experience", file: "./html/experience.html" },
  { id: "contact", file: "./html/contact.html" },
  { id: "gallery", file: "./html/gallery.html" },
  { id: "footer", file: "./html/footer.html" }
];


/* ========================================
   LOAD HTML SECTIONS
======================================== */

async function loadSections() {
  for (const section of sections) {
    try {
      const response = await fetch(section.file);

      if (!response.ok) {
        throw new Error(`Could not load ${section.file}`);
      }

      const html = await response.text();

      const container = document.getElementById(section.id);

      if (container) {
        container.innerHTML = html;
      }

    } catch (error) {
      console.error(`Error loading ${section.file}:`, error);
    }
  }

  // Initialize features only after all HTML is loaded
  initializeBackToTop();
  initializeGallery();
}

loadSections();


/* ========================================
   BACK TO TOP BUTTON
======================================== */

function initializeBackToTop() {
  const backToTopButton = document.querySelector(".back-to-top");

  if (!backToTopButton) return;

  const updateBackToTopButton = () => {
    const isVisible = window.scrollY > 700;

    backToTopButton.style.visibility = isVisible ? "visible" : "hidden";
    backToTopButton.style.opacity = isVisible ? "1" : "0";
    backToTopButton.style.transform = isVisible
      ? "scale(1)"
      : "scale(0)";
  };

  window.addEventListener("scroll", updateBackToTopButton);
  updateBackToTopButton();
}


/* ========================================
   PHOTO GALLERY INITIALIZATION
======================================== */

function initializeGallery() {
  const photoBundlePreview = document.getElementById("photoBundlePreview");
  const photoGalleryGrid = document.getElementById("photoGalleryGrid");
  const photoCount = document.getElementById("photoCount");

  const openGalleryButton = document.getElementById("openPhotoGallery");
  const closeGalleryButton = document.getElementById("closePhotoGallery");
  const photoGallery = document.getElementById("photoGallery");

  // Make sure the gallery HTML exists
  if (!photoGallery || !photoGalleryGrid) {
    console.error("Gallery elements could not be found. Check gallery.html.");
    return;
  }

  /* Create individual photo elements */

  function createPhotoElement(photo) {
    const image = document.createElement("img");

    image.src = photo.src;
    image.alt = photo.alt || "Gallery photo";
    image.loading = "lazy";

    return image;
  }

  /* Load photos from JSON */

  async function loadPhotos() {
    try {
      const response = await fetch("./photos.json");

      if (!response.ok) {
        throw new Error(`Failed to load photos: ${response.status}`);
      }

      const photos = await response.json();

      if (!Array.isArray(photos)) {
        throw new Error("photos.json must contain an array of photos.");
      }

      // Clear existing photos before adding them
      photoGalleryGrid.innerHTML = "";

      if (photoBundlePreview) {
        photoBundlePreview.innerHTML = "";
      }

      photos.forEach((photo) => {
        photoGalleryGrid.appendChild(createPhotoElement(photo));

        if (photoBundlePreview) {
          photoBundlePreview.appendChild(createPhotoElement(photo));
        }
      });

      if (photoCount) {
        photoCount.textContent = `${photos.length} Photos`;
      }

    } catch (error) {
      console.error("Error loading photo gallery:", error);

      if (photoCount) {
        photoCount.textContent = "Gallery unavailable";
      }
    }
  }

  /* Open gallery */

  function openPhotoGallery() {
    photoGallery.classList.add("active");
    photoGallery.setAttribute("aria-hidden", "false");
    document.body.classList.add("gallery-open");

    closeGalleryButton?.focus();
  }

  /* Close gallery */

  function closePhotoGallery() {
    photoGallery.classList.remove("active");
    photoGallery.setAttribute("aria-hidden", "true");
    document.body.classList.remove("gallery-open");

    openGalleryButton?.focus();
  }

  /* Event listeners */

  openGalleryButton?.addEventListener("click", openPhotoGallery);

  closeGalleryButton?.addEventListener("click", closePhotoGallery);

  photoGallery.addEventListener("click", (event) => {
    if (event.target === photoGallery) {
      closePhotoGallery();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      photoGallery.classList.contains("active")
    ) {
      closePhotoGallery();
    }
  });

  // Load photos after the gallery elements exist
  loadPhotos();
}
