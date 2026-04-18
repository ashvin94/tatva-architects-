const logoutBtn = document.getElementById("logout-btn");
const projectForm = document.getElementById("project-form");
const projectList = document.getElementById("project-list");
const projectId = document.getElementById("project-id");
const nameInput = document.getElementById("project-name");
const imageFileInput = document.getElementById("project-image-file");
const imageInput = document.getElementById("project-image");
const imagePreview = document.getElementById("image-preview");
const locationInput = document.getElementById("project-location");
const statusInput = document.getElementById("project-status");
const descriptionInput = document.getElementById("project-description");
const longDescriptionInput = document.getElementById("project-long-description");
const videoUrlsInput = document.getElementById("project-video-urls");
const mediaFilesInput = document.getElementById("project-media-files");
const mediaUrlsInput = document.getElementById("project-media-urls");
const isCollaborationInput = document.getElementById("project-is-collaboration");
const collabCompanyNameInput = document.getElementById("project-collab-company-name");
const collabCompanyLogoInput = document.getElementById("project-collab-company-logo");
const collabCompanySiteInput = document.getElementById("project-collab-company-site");

// Gallery image elements
const galleryFilesInput = document.getElementById("project-gallery-files");
const galleryUrlsInput = document.getElementById("project-gallery-urls");
const galleryPreview = document.getElementById("gallery-preview");

const supabaseUrl = window.SUPABASE_URL;
const supabaseAnonKey = window.SUPABASE_ANON_KEY;
const supabaseClient =
  supabaseUrl && supabaseAnonKey
    ? window.supabase.createClient(supabaseUrl, supabaseAnonKey)
    : null;

const PROJECTS_TABLE = "projects";
const MEDIA_BUCKET = "project-media";
const PUBLIC_PROJECTS_CACHE_KEY = "tatvaa_public_projects_cache_v1";

const cacheProjectsForPublicSite = (projects) => {
  try {
    localStorage.setItem(PUBLIC_PROJECTS_CACHE_KEY, JSON.stringify(projects || []));
  } catch (error) {
    console.warn("Could not cache public projects locally:", error);
  }
};

const ensureAuthed = async () => {
  if (!supabaseClient) return false;
  const { data } = await supabaseClient.auth.getSession();
  if (!data?.session) {
    window.location.href = "admin.html";
    return false;
  }
  return true;
};

const fetchProjects = async () => {
  if (!supabaseClient) return [];
  const { data, error } = await supabaseClient
    .from(PROJECTS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

const saveProject = async (project) => {
  if (!supabaseClient) throw new Error("Supabase not configured.");
  if (project.id) {
    const { id, ...rest } = project;
    const { error } = await supabaseClient
      .from(PROJECTS_TABLE)
      .update(rest)
      .eq("id", id);
    if (error) throw error;
    return;
  }
  const { error } = await supabaseClient.from(PROJECTS_TABLE).insert(project);
  if (error) throw error;
};

const deleteProject = async (id) => {
  if (!supabaseClient) throw new Error("Supabase not configured.");
  const { error } = await supabaseClient.from(PROJECTS_TABLE).delete().eq("id", id);
  if (error) throw error;
};

const filePathSafe = (name) =>
  String(name || "file")
    .trim()
    .replace(/[^\w.\-]+/g, "_")
    .slice(0, 90) || "file";

const uploadToSupabaseStorage = async ({ file, folder }) => {
  if (!supabaseClient) throw new Error("Supabase not configured.");
  const path = `${folder}/${Date.now()}-${filePathSafe(file.name)}`;
  const { error } = await supabaseClient.storage.from(MEDIA_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  const { data } = supabaseClient.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

const renderProjects = async () => {
  const projects = await fetchProjects();
  cacheProjectsForPublicSite(projects);
  projectList.innerHTML = projects
    .map(
      (project) => {
        const imageCount = Array.isArray(project.images) ? project.images.length : 0;
        const galleryInfo = imageCount > 0 ? `${imageCount} gallery photos` : "No gallery photos";
        return `
    <article class="list-item">
      <img src="${project.image}" alt="${project.name}">
      <div>
        <strong>${project.name}</strong>
        <p>${project.location} | ${project.status}</p>
        <small>${project.description}</small>
        <small>📸 ${galleryInfo} | 🎥 Videos: ${(project.videoUrls || []).length} | 📎 Media: ${(project.mediaUrls || []).length}</small>
        <small>Collaborated: ${
          project.isCollaboration ? `Yes (${project.collabCompanyName || "Company not set"})` : "No"
        }</small>
      </div>
      <div class="actions">
        <button data-edit="${project.id}">Edit</button>
        <button data-delete="${project.id}">Delete</button>
      </div>
    </article>`;
      }
    )
    .join("");

  document.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await deleteProject(btn.dataset.delete);
      renderProjects();
    });
  });
  document.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const project = (await fetchProjects()).find((p) => p.id === btn.dataset.edit);
      if (!project) return;
      projectId.value = project.id;
      nameInput.value = project.name;
      imageInput.value = project.image;
      imagePreview.src = project.image;
      imagePreview.classList.remove("hidden");
      locationInput.value = project.location;
      statusInput.value = project.status;
      descriptionInput.value = project.description;
      longDescriptionInput.value = project.longDescription || "";
      videoUrlsInput.value = (project.videoUrls || []).join("\n");
      mediaUrlsInput.value = (project.mediaUrls || []).join("\n");
      isCollaborationInput.checked = Boolean(project.isCollaboration);
      collabCompanyNameInput.value = project.collabCompanyName || "";
      collabCompanyLogoInput.value = project.collabCompanyLogo || "";
      collabCompanySiteInput.value = project.collabCompanySite || "";

      // Populate gallery URLs when editing
      if (galleryUrlsInput) {
        const imgs = Array.isArray(project.images) ? project.images : [];
        galleryUrlsInput.value = imgs.join("\n");
      }
      // Show gallery preview
      renderGalleryPreview(Array.isArray(project.images) ? project.images : []);
    });
  });
};

/* Gallery preview rendering */
const renderGalleryPreview = (urls) => {
  if (!galleryPreview) return;
  if (!urls || urls.length === 0) {
    galleryPreview.innerHTML = "";
    return;
  }
  galleryPreview.innerHTML = urls
    .map(
      (url, i) =>
        `<img src="${url}" alt="Gallery photo ${i + 1}" class="gallery-thumb" />`
    )
    .join("");
};

logoutBtn.addEventListener("click", async () => {
  if (supabaseClient) await supabaseClient.auth.signOut();
  window.location.href = "admin.html";
});

projectForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabaseClient) {
    alert("Supabase is not configured. Set values in supabase-config.js");
    return;
  }
  if (!(await ensureAuthed())) return;

  const editingId = projectId.value || "";

  // === Cover image ===
  let imageValue = (imageInput.value || "").trim();
  if (imageFileInput.files && imageFileInput.files[0]) {
    try {
      imageValue = await uploadToSupabaseStorage({
        file: imageFileInput.files[0],
        folder: "covers",
      });
    } catch (err) {
      console.error("Supabase upload failed (cover):", err);
      alert(`Cover upload failed: ${err?.message || "unknown error"}`);
      return;
    }
  }
  if (!imageValue) {
    alert("Please upload a cover image or provide cover image URL.");
    return;
  }

  // === Gallery images ===
  const galleryUploaded = [];
  if (galleryFilesInput?.files && galleryFilesInput.files.length) {
    for (const file of galleryFilesInput.files) {
      try {
        galleryUploaded.push(
          await uploadToSupabaseStorage({ file, folder: "gallery" })
        );
      } catch (err) {
        console.error("Supabase upload failed (gallery):", err);
        alert(`Gallery upload failed: ${err?.message || "unknown error"}`);
        return;
      }
    }
  }
  const galleryLinks = (galleryUrlsInput?.value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  // Combine: cover first, then gallery uploads, then gallery URLs
  // Deduplicate: avoid adding the cover twice if it's also in gallery
  const allGallery = [...galleryUploaded, ...galleryLinks];
  const images = [imageValue, ...allGallery.filter((url) => url !== imageValue)];

  // === Media attachments ===
  const uploadedMedia = [];
  if (mediaFilesInput?.files && mediaFilesInput.files.length) {
    for (const file of mediaFilesInput.files) {
      try {
        uploadedMedia.push(
          await uploadToSupabaseStorage({ file, folder: "attachments" })
        );
      } catch (err) {
        console.error("Supabase upload failed (media):", err);
        alert(`Media upload failed: ${err?.message || "unknown error"}`);
        return;
      }
    }
  }
  const mediaLinks = (mediaUrlsInput?.value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const mediaUrls = [...uploadedMedia, ...mediaLinks];

  const payload = {
    name: nameInput.value,
    image: imageValue,
    images,
    location: locationInput.value,
    status: statusInput.value,
    description: descriptionInput.value,
    longDescription: longDescriptionInput.value.trim(),
    videoUrls: videoUrlsInput.value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    mediaUrls,
    isCollaboration: isCollaborationInput.checked,
    collabCompanyName: collabCompanyNameInput.value.trim(),
    collabCompanyLogo: collabCompanyLogoInput.value.trim(),
    collabCompanySite: collabCompanySiteInput.value.trim(),
  };

  await saveProject(editingId ? { id: editingId, ...payload } : payload);
  projectForm.reset();
  projectId.value = "";
  imagePreview.classList.add("hidden");
  if (galleryPreview) galleryPreview.innerHTML = "";
  renderProjects();
});

imageFileInput.addEventListener("change", async () => {
  if (!imageFileInput.files || !imageFileInput.files[0]) return;
  const file = imageFileInput.files[0];
  const previewUrl = URL.createObjectURL(file);
  imagePreview.src = previewUrl;
  imagePreview.classList.remove("hidden");
});

// Gallery file preview
if (galleryFilesInput) {
  galleryFilesInput.addEventListener("change", () => {
    if (!galleryFilesInput.files || !galleryFilesInput.files.length) return;
    const urls = [];
    for (const file of galleryFilesInput.files) {
      urls.push(URL.createObjectURL(file));
    }
    renderGalleryPreview(urls);
  });
}

ensureAuthed().then((ok) => {
  if (ok) renderProjects();
});
