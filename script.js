const menuToggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("main-nav");
const mainNavMobile = document.getElementById("main-nav-mobile");
const yearEl = document.getElementById("year");
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
const headerEl = document.querySelector(".site-header");
const projectsPanel = document.getElementById("projects-panel");
const projectModal = document.getElementById("project-modal");
const modalClose = document.getElementById("modal-close");
const modalProjectImage = document.getElementById("modal-project-image");
const modalProjectName = document.getElementById("modal-project-name");
const modalProjectLocation = document.getElementById("modal-project-location");
const modalProjectStatus = document.getElementById("modal-project-status");
const modalProjectDescription = document.getElementById("modal-project-description");
const modalProjectLongDescription = document.getElementById(
  "modal-project-long-description"
);
const modalLinks = document.getElementById("modal-links");
const collabGrid = document.getElementById("collab-grid");
const tabs = document.querySelectorAll(".tab-btn");
const hero = document.querySelector(".hero");
const heroLayerA = document.querySelector(".hero-bg-a");
const heroLayerB = document.querySelector(".hero-bg-b");
const projectsPrev = document.getElementById("projects-prev");
const projectsNext = document.getElementById("projects-next");

// Modal carousel elements
const modalCarousel = document.getElementById("modal-carousel");
const modalCarouselTrack = document.getElementById("modal-carousel-track");
const modalCarouselPrev = document.getElementById("modal-carousel-prev");
const modalCarouselNext = document.getElementById("modal-carousel-next");
const modalCarouselDots = document.getElementById("modal-carousel-dots");

const PROJECTS_COLLECTION = "projects";
const EMAILJS_PUBLIC_KEY = "kzgkrjE3cNOOZzv1s";
const EMAILJS_SERVICE_ID = "service_2ex7raf";
const EMAILJS_TEMPLATE_ID = "template_5deamim";
const EMAIL_RECIPIENTS = "tatva.architects@gmail.com";
const NAV_SCROLL_EXTRA = 28;
const PUBLIC_PROJECTS_CACHE_KEY = "tatvaa_public_projects_cache_v1";
let currentProjects = [];

const readCachedProjects = () => {
  try {
    const raw = localStorage.getItem(PUBLIC_PROJECTS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.warn("Could not read cached projects:", error);
    return null;
  }
};

const writeCachedProjects = (projects) => {
  try {
    localStorage.setItem(PUBLIC_PROJECTS_CACHE_KEY, JSON.stringify(projects || []));
  } catch (error) {
    console.warn("Could not write cached projects:", error);
  }
};

// Debug marker: helps confirm script.js is running.
window.__scriptLoaded = true;

// Ensure initial portfolio UI state is consistent on first load.
// (Sometimes classes can get out of sync after hot reloads or partial refreshes.)
if (projectsPanel) {
  tabs.forEach((item) => item.classList.remove("active"));
  const defaultTab = document.querySelector('.tab-btn[data-tab="residential design"]');
  defaultTab?.classList.add("active");
}

const supabaseUrl = window.SUPABASE_URL;
const supabaseAnonKey = window.SUPABASE_ANON_KEY;
const supabaseClient =
  supabaseUrl && supabaseAnonKey
    ? window.supabase.createClient(supabaseUrl, supabaseAnonKey)
    : null;

const sampleProjects = [
  {
    name: "Luxury Residence",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80",
    ],
    location: "Bodakdev, Ahmedabad",
    status: "Completed",
    description:
      "A premium family home with warm materials and expansive daylight planning.",
    longDescription:
      "Detailed planning with natural ventilation, site-optimized massing, and sustainable material strategy.",
    videoUrls: [],
    architectPdfUrls: [],
    isCollaboration: false,
  },
  {
    name: "Modern Villa",
    image:
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    ],
    location: "Science City, Ahmedabad",
    status: "Completed",
    description:
      "Contemporary villa architecture with clean geometry and private courtyards.",
    longDescription:
      "Focus on privacy zoning, open-to-sky courtyards, and passive cooling design.",
    videoUrls: [],
    architectPdfUrls: [],
    isCollaboration: true,
    collabCompanyName: "Aakar Developers",
    collabCompanyLogo:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=500&q=80",
    collabCompanySite: "https://example.com",
  },
  {
    name: "Commercial Complex",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7f34b5f7f05?auto=format&fit=crop&w=1200&q=80",
    ],
    location: "SG Highway, Ahmedabad",
    status: "Ongoing",
    description:
      "Mixed-use commercial development with modern facade articulation.",
    longDescription:
      "Designed for high footfall circulation, modular spaces, and future expansion.",
    videoUrls: [],
    architectPdfUrls: [],
    isCollaboration: true,
    collabCompanyName: "Shakti Group",
    collabCompanyLogo:
      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=500&q=80",
    collabCompanySite: "https://example.com",
  },
  {
    name: "Urban Townhouse",
    image:
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80",
    ],
    location: "Thaltej, Ahmedabad",
    status: "Ongoing",
    description:
      "Elegant townhouse concept balancing privacy and compact urban living.",
    longDescription:
      "Urban site-responsive planning with daylight optimization and efficient service layouts.",
    videoUrls: [],
    architectPdfUrls: [],
    isCollaboration: false,
  },
];

const heroImages = [
  "https://images.unsplash.com/photo-1527030280862-64139fba04ca?auto=format&fit=crop&w=2400&q=80",
  "https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=2400&q=80",
  "https://images.unsplash.com/photo-1600607687644-c7f34b5f7f05?auto=format&fit=crop&w=2400&q=80",
];

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/* =====================================================
   CAROUSEL HELPER — resolves images array for a project
   ====================================================== */
const getProjectImages = (project) => {
  const imgs = project.images;
  if (Array.isArray(imgs) && imgs.length > 0) return imgs;
  return project.image ? [project.image] : [];
};

/* =====================================================
   CAROUSEL — generic initializer for card-level carousels
   Uses event delegation for performance
   ====================================================== */
const initCardCarousels = (container) => {
  if (!container) return;

  // Arrow click navigation
  container.addEventListener("click", (e) => {
    const arrowBtn = e.target.closest(".card-carousel-arrow");
    if (!arrowBtn) return;
    e.preventDefault();
    e.stopPropagation();

    const carousel = arrowBtn.closest(".card-carousel");
    if (!carousel) return;

    const track = carousel.querySelector(".card-carousel-track");
    const totalSlides = track ? track.children.length : 0;
    if (totalSlides <= 1) return;

    let current = parseInt(carousel.dataset.currentSlide || "0", 10);
    const direction = arrowBtn.classList.contains("card-carousel-next") ? 1 : -1;
    current = (current + direction + totalSlides) % totalSlides;

    carousel.dataset.currentSlide = current;
    track.style.transform = `translateX(-${current * 100}%)`;

    // Update dots
    carousel.querySelectorAll(".card-carousel-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === current);
    });
  });

  // Touch swipe navigation
  let startX = 0;
  let currentX = 0;
  let activeCarousel = null;

  container.addEventListener("touchstart", (e) => {
    const carousel = e.target.closest(".card-carousel");
    if (!carousel) return;
    const track = carousel.querySelector(".card-carousel-track");
    if (!track || track.children.length <= 1) return;
    
    startX = e.touches[0].clientX;
    currentX = startX;
    activeCarousel = carousel;
  }, { passive: true });

  container.addEventListener("touchmove", (e) => {
    if (!activeCarousel) return;
    currentX = e.touches[0].clientX;
  }, { passive: true });

  container.addEventListener("touchend", (e) => {
    if (!activeCarousel) return;
    const diff = startX - currentX;
    
    // Trigger slide if swiped more than 40px
    if (Math.abs(diff) > 40) {
      const track = activeCarousel.querySelector(".card-carousel-track");
      const totalSlides = track ? track.children.length : 0;
      let current = parseInt(activeCarousel.dataset.currentSlide || "0", 10);
      
      const direction = diff > 0 ? 1 : -1;
      current = (current + direction + totalSlides) % totalSlides;
      
      activeCarousel.dataset.currentSlide = current;
      track.style.transform = `translateX(-${current * 100}%)`;
      
      activeCarousel.querySelectorAll(".card-carousel-dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === current);
      });
    }
    
    activeCarousel = null;
    startX = 0;
    currentX = 0;
  });
};

const renderCollaborations = (projects) => {
  if (!collabGrid) return;
  const companies = new Map();

  projects.forEach((project) => {
    if (!project.isCollaboration || !project.collabCompanyName) return;
    const key = project.collabCompanyName.trim().toLowerCase();
    if (!key || companies.has(key)) return;
    companies.set(key, {
      name: project.collabCompanyName.trim(),
      logo: project.collabCompanyLogo || "",
      site: project.collabCompanySite || "",
    });
  });

  const list = [...companies.values()];
  if (!list.length) {
    collabGrid.innerHTML =
      '<p class="text-white/70">No collaboration companies added yet.</p>';
    return;
  }

  collabGrid.innerHTML = list
    .map((company) => {
      const logo = company.logo
        ? `<img src="${escapeHtml(
            company.logo
          )}" alt="${escapeHtml(company.name)} logo" class="w-12 h-12 rounded-2xl object-cover bg-white ring-1 ring-white/20" />`
        : `<div class="w-12 h-12 rounded-2xl inline-flex items-center justify-center bg-white text-slate-900 font-bold ring-1 ring-white/20">${escapeHtml(
            company.name.slice(0, 1).toUpperCase()
          )}</div>`;
      const title = escapeHtml(company.name);
      return `<article class="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition">
        <div class="flex items-center gap-3">
          ${logo}
          <div>
            <h3 class="text-white font-semibold">${title}</h3>
            <p class="text-white/70 text-sm mt-0.5">Collaboration partner</p>
          </div>
        </div>
      </article>`;
    })
    .join("");
};

const renderProjects = (projects) => {
  if (!projectsPanel) return;
  try {
    currentProjects = projects;
    renderCollaborations(projects);
    projectsPanel.innerHTML = "";

  const createCard = (project) => {
    const status = String(project.status || "").trim();
    const statusLower = status.toLowerCase();
    const statusClass =
      statusLower === "completed" || statusLower === "sold out"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-amber-50 text-amber-800 border-amber-200";

    const topBadge =
      status
        ? `<span class="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold ${statusClass}">${escapeHtml(
            status
          )}</span>`
        : "";

    const beds =
      project.beds ?? project.bed ?? project.bedrooms ?? project.bedroom;
    const baths =
      project.baths ?? project.bath ?? project.bathrooms ?? project.bathroom;
    const area = project.area ?? project.areaSqm ?? project.areaSqFt ?? project.size;

    const specItems = [
      beds ? `<span><span class="font-semibold">Beds:</span> ${escapeHtml(beds)}</span>` : "",
      baths ? `<span><span class="font-semibold">Baths:</span> ${escapeHtml(baths)}</span>` : "",
      area ? `<span><span class="font-semibold">Area:</span> ${escapeHtml(area)}</span>` : "",
    ].filter(Boolean);

    const specs =
      specItems.length > 0
        ? `<div class="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            ${specItems.join('<span class="text-slate-300">•</span>')}
          </div>`
        : "";

    const collabLine = project.isCollaboration
      ? `<p class="mt-4 text-sm font-semibold text-slate-700">Collaborated with: ${
          project.collabCompanySite
            ? `<a class="text-brand-700 underline underline-offset-4 hover:text-brand-900" href="${escapeHtml(
                project.collabCompanySite
              )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
                project.collabCompanyName || "Partner Company"
              )}</a>`
            : `<span>${escapeHtml(
                project.collabCompanyName || "Partner Company"
              )}</span>`
        }</p>`
      : "";

    // Build carousel images
    const images = getProjectImages(project);
    const hasMultiple = images.length > 1;

    const carouselImages = images
      .map(
        (url, i) =>
          `<img class="card-carousel-slide w-full aspect-[16/11] object-cover shrink-0" src="${escapeHtml(url)}" alt="${escapeHtml(project.name)} - Photo ${i + 1}" loading="${i === 0 ? "eager" : "lazy"}" />`
      )
      .join("");

    const carouselDots = hasMultiple
      ? `<div class="card-carousel-dots">${images
          .map((_, i) => `<span class="card-carousel-dot${i === 0 ? " active" : ""}"></span>`)
          .join("")}</div>`
      : "";

    const carouselArrows = hasMultiple
      ? `<button class="card-carousel-arrow card-carousel-prev" type="button" aria-label="Previous photo">&#8249;</button>
         <button class="card-carousel-arrow card-carousel-next" type="button" aria-label="Next photo">&#8250;</button>`
      : "";

    const imageCounter = hasMultiple
      ? `<span class="card-carousel-counter">${images.length} photos</span>`
      : "";

    return `
      <article class="project-item snap-start shrink-0 w-[86%] sm:w-[380px] lg:w-auto lg:shrink rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition group">
        <div class="card-carousel relative overflow-hidden" data-current-slide="0">
          <div class="card-carousel-track flex transition-transform duration-300 ease-out" style="transform: translateX(0%)">
            ${carouselImages}
          </div>
          ${carouselArrows}
          ${carouselDots}
          <div class="absolute left-4 top-4 flex items-center gap-2 z-10">
            ${topBadge}
          </div>
          ${imageCounter ? `<div class="absolute right-4 top-4 z-10">${imageCounter}</div>` : ""}
        </div>

        <div class="p-6">
          <h3 class="text-lg font-semibold tracking-tight text-slate-900">${escapeHtml(
            project.name
          )}</h3>
          <p class="mt-1 text-sm text-slate-600">${escapeHtml(
            project.location
          )}</p>

          ${specs}

          <p class="mt-4 text-sm leading-relaxed text-slate-700 line-clamp-3">${escapeHtml(
            project.description
          )}</p>

          ${collabLine}

          <div class="mt-5 flex flex-wrap items-center gap-3">
            <button class="read-more-btn btn btn-secondary px-4 py-2 text-sm transition" data-project-name="${escapeHtml(
              project.name
            )}">Read More</button>
            <a href="#contact" class="btn btn-primary px-4 py-2 text-sm transition">Get Quote</a>
          </div>
        </div>
      </article>
    `;
  };

  const activeTab = document.querySelector(".tab-btn.active")?.dataset?.tab || "residential design";
  const filteredProjects = projects.filter(
    (item) => String(item?.status || "").trim().toLowerCase() === activeTab.toLowerCase()
  );

  const hasProjects = Array.isArray(projects) && projects.length > 0;
  
  const fallbackAll =
    hasProjects && filteredProjects.length === 0
      ? `<div class="w-full text-center text-slate-600 py-10 w-full col-span-full">
           Projects loaded, but no projects match the <strong>${escapeHtml(activeTab)}</strong> category.
         </div>`
      : "";

  projectsPanel.innerHTML =
    filteredProjects.map((p) => createCard(p)).join("") ||
    fallbackAll ||
    '<p class="text-slate-600 col-span-full py-10 w-full text-center">No projects in this category yet.</p>';

  // Initialize card carousels via event delegation
  initCardCarousels(projectsPanel);

  document.querySelectorAll(".read-more-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = currentProjects.find(
        (item) => item.name === button.dataset.projectName
      );
      if (!selected || !projectModal) return;

      // Build modal carousel
      const modalImages = getProjectImages(selected);
      setupModalCarousel(modalImages, selected.name);

      if (modalProjectName) modalProjectName.textContent = selected.name || "";
      if (modalProjectLocation)
        modalProjectLocation.textContent = selected.location || "";
      if (modalProjectStatus)
        modalProjectStatus.textContent = `Status: ${selected.status || "N/A"}`;
      if (modalProjectDescription)
        modalProjectDescription.textContent = selected.description || "";
      if (modalProjectLongDescription)
        modalProjectLongDescription.textContent =
          selected.longDescription || "More details will be updated soon.";

      if (modalLinks) {
        const links = [];
        (selected.videoUrls || []).forEach((url, index) => {
          links.push(
            `<a class="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition" href="${escapeHtml(
              url
            )}" target="_blank" rel="noopener noreferrer">Video ${
              index + 1
            }</a>`
          );
        });
        (
          selected.mediaUrls ||
          selected.architectPdfUrls ||
          selected.mapPdfUrls ||
          []
        ).forEach((url, index) => {
          links.push(
            `<a class="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition" href="${escapeHtml(
              url
            )}" target="_blank" rel="noopener noreferrer">Attachment ${
              index + 1
            }</a>`
          );
        });
        modalLinks.innerHTML =
          links.join("") || '<p class="text-sm text-slate-600">No media attachments.</p>';
      }

      projectModal.classList.add("show");
      projectModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  });
  } catch (err) {
    console.error("renderProjects failed:", err);
    completedPanel.innerHTML =
      '<div class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">Projects loaded but failed to render. Check console for details.</div>';
  }
};

/* =====================================================
   MODAL CAROUSEL — setup and navigation
   ====================================================== */
let modalSlideIndex = 0;
let modalSlideCount = 0;

const setupModalCarousel = (images, projectName) => {
  if (!modalCarouselTrack) return;
  modalSlideIndex = 0;
  modalSlideCount = images.length;

  // Build track images
  modalCarouselTrack.innerHTML = images
    .map(
      (url, i) =>
        `<img class="modal-carousel-slide" src="${escapeHtml(url)}" alt="${escapeHtml(projectName)} - Photo ${i + 1}" loading="${i === 0 ? "eager" : "lazy"}" />`
    )
    .join("");
  modalCarouselTrack.style.transform = "translateX(0%)";

  // Build dots
  if (modalCarouselDots) {
    if (images.length > 1) {
      modalCarouselDots.innerHTML = images
        .map((_, i) => `<span class="modal-dot${i === 0 ? " active" : ""}"></span>`)
        .join("");
      modalCarouselDots.style.display = "";
    } else {
      modalCarouselDots.innerHTML = "";
      modalCarouselDots.style.display = "none";
    }
  }

  // Show/hide arrows
  const showArrows = images.length > 1;
  if (modalCarouselPrev) modalCarouselPrev.style.display = showArrows ? "" : "none";
  if (modalCarouselNext) modalCarouselNext.style.display = showArrows ? "" : "none";
};

const navigateModalCarousel = (direction) => {
  if (modalSlideCount <= 1) return;
  modalSlideIndex = (modalSlideIndex + direction + modalSlideCount) % modalSlideCount;
  if (modalCarouselTrack) {
    modalCarouselTrack.style.transform = `translateX(-${modalSlideIndex * 100}%)`;
  }
  // Update dots
  if (modalCarouselDots) {
    modalCarouselDots.querySelectorAll(".modal-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === modalSlideIndex);
    });
  }
};

modalCarouselPrev?.addEventListener("click", () => navigateModalCarousel(-1));
modalCarouselNext?.addEventListener("click", () => navigateModalCarousel(1));

// Keyboard navigation for modal carousel
document.addEventListener("keydown", (e) => {
  if (!projectModal || !projectModal.classList.contains("show")) return;
  if (e.key === "ArrowLeft") navigateModalCarousel(-1);
  if (e.key === "ArrowRight") navigateModalCarousel(1);
});

// Touch swipe navigation for modal carousel
let modalStartX = 0;
let modalCurrentX = 0;

modalCarousel?.addEventListener("touchstart", (e) => {
  if (modalSlideCount <= 1) return;
  modalStartX = e.touches[0].clientX;
  modalCurrentX = modalStartX;
}, { passive: true });

modalCarousel?.addEventListener("touchmove", (e) => {
  if (modalSlideCount <= 1) return;
  modalCurrentX = e.touches[0].clientX;
}, { passive: true });

modalCarousel?.addEventListener("touchend", (e) => {
  if (modalSlideCount <= 1) return;
  const diff = modalStartX - modalCurrentX;
  
  if (Math.abs(diff) > 40) {
    navigateModalCarousel(diff > 0 ? 1 : -1);
  }
  
  modalStartX = 0;
  modalCurrentX = 0;
});

const initSupabaseAndProjects = async () => {
  const cachedProjects = readCachedProjects();

  if (!supabaseClient) {
    window.__projects = null;
    if (projectsPanel) {
      projectsPanel.innerHTML =
        '<div class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">Supabase is not initialized on the website. Check `supabase-config.js` is loaded before `script.js` and that `SUPABASE_URL` + `SUPABASE_ANON_KEY` are set.</div>';
    }
    renderProjects((cachedProjects && cachedProjects.length ? cachedProjects : sampleProjects));
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from(PROJECTS_COLLECTION)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    window.__projects = data;
    if (data && data.length) {
      writeCachedProjects(data);
      renderProjects(data);
      return;
    }
    renderProjects((cachedProjects && cachedProjects.length ? cachedProjects : sampleProjects));
  } catch (error) {
    console.error("Supabase fetch failed:", error);
    window.__projects = null;
    if (projectsPanel) {
      projectsPanel.innerHTML =
        '<div class="text-slate-600 col-span-full text-center">Unable to load projects from Supabase. Check RLS SELECT policy for role <strong>anon</strong>.</div>';
    }
    renderProjects((cachedProjects && cachedProjects.length ? cachedProjects : sampleProjects));
  }
};

const scrollProjectsRow = (panel, direction) => {
  if (!panel) return;
  const firstCard = panel.querySelector(".project-item");
  const step = firstCard
    ? firstCard.getBoundingClientRect().width + 16
    : Math.max(280, Math.floor(panel.clientWidth * 0.85));
  panel.scrollBy({ left: direction * step, behavior: "smooth" });
};

initSupabaseAndProjects();
if (window.emailjs) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

if (hero && heroLayerA && heroLayerB) {
  let currentIndex = 0;
  let frontLayer = heroLayerA;
  let backLayer = heroLayerB;
  frontLayer.classList.add("active");
  frontLayer.style.backgroundImage = `url("${heroImages[currentIndex]}")`;
  setInterval(() => {
    currentIndex = (currentIndex + 1) % heroImages.length;
    backLayer.style.backgroundImage = `url("${heroImages[currentIndex]}")`;
    backLayer.classList.add("active");
    frontLayer.classList.remove("active");
    const temp = frontLayer;
    frontLayer = backLayer;
    backLayer = temp;
  }, 5000);
}

// Smooth scroll for internal anchors with fixed-header offset
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  if (
    link.closest(".main-nav") ||
    link.closest("#main-nav-mobile") ||
    link.dataset.smoothScrollAttached === "true"
  ) {
    return;
  }
  link.dataset.smoothScrollAttached = "true";
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    const target = href ? document.querySelector(href) : null;
    if (!target) return;
    event.preventDefault();
    if (mainNavMobile) mainNavMobile.classList.add("hidden");
    const headerOffset = headerEl ? headerEl.offsetHeight + NAV_SCROLL_EXTRA : 100;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

menuToggle?.addEventListener("click", () => {
  if (mainNavMobile) mainNavMobile.classList.toggle("hidden");
});

projectsPrev?.addEventListener("click", () => scrollProjectsRow(projectsPanel, -1));
projectsNext?.addEventListener("click", () => scrollProjectsRow(projectsPanel, 1));

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    if (currentProjects) {
      renderProjects(currentProjects);
    }
  });
});

document.querySelectorAll('.main-nav a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    const target = href ? document.querySelector(href) : null;
    if (!target) return;
    event.preventDefault();
    if (mainNavMobile) mainNavMobile.classList.add("hidden");
    const headerOffset = headerEl ? headerEl.offsetHeight + NAV_SCROLL_EXTRA : 100;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

document.querySelectorAll('#main-nav-mobile a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    const target = href ? document.querySelector(href) : null;
    if (!target) return;
    event.preventDefault();
    if (mainNavMobile) mainNavMobile.classList.add("hidden");
    const headerOffset = headerEl ? headerEl.offsetHeight + NAV_SCROLL_EXTRA : 100;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

if (yearEl) yearEl.textContent = String(new Date().getFullYear());

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const siteLocation = String(formData.get("siteLocation") || "").trim();
    const designType = String(formData.get("designType") || "").trim();
    const userDescription = String(formData.get("userDescription") || "").trim();
    const squareFeet = Number(formData.get("squareFeet") || 0);
    if (!window.emailjs) {
      formStatus.textContent = "Email service is unavailable right now.";
      formStatus.style.color = "#b42318";
      return;
    }

    formStatus.textContent = "Sending message...";
    formStatus.style.color = "#555";

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        name,
        email,
        phone,
        siteLocation,
        designType,
        squareFeet,
        userDescription,
        to_email: EMAIL_RECIPIENTS,
        message:
          `New architecture enquiry from website contact form.
Square Feet: ${squareFeet}
Description: ${userDescription}`,
      });
      formStatus.textContent = "Message sent successfully.";
      formStatus.style.color = "#1b6b1b";
      contactForm.reset();
    } catch (error) {
      formStatus.textContent =
        "Failed to send message. Please try again in a moment.";
      formStatus.style.color = "#b42318";
      console.error("EmailJS send failed:", error);
    }
  });
}

const closeProjectModal = () => {
  if (!projectModal) return;
  projectModal.classList.remove("show");
  projectModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

modalClose?.addEventListener("click", closeProjectModal);
projectModal?.addEventListener("click", (event) => {
  if (event.target === projectModal) closeProjectModal();
});

const revealElements = document.querySelectorAll(
  ".section .container > *, .hero-content > *"
);
revealElements.forEach((element, index) => {
  element.classList.add("reveal");
  element.style.setProperty("--reveal-delay", `${Math.min(index * 50, 240)}ms`);
});
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
);
revealElements.forEach((element) => revealObserver.observe(element));
