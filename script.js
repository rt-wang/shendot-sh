const coverMap = {
  dev: "assets/covers/developer-work.jpg",
  music: "assets/covers/music.jpg",
  video: "assets/covers/video.jpg",
  articles: "assets/covers/articles.jpg",
  notes: "assets/covers/notes.jpg",
};

const categories = [
  { id: "all", label: "All" },
  { id: "dev", label: "Dev" },
  { id: "music", label: "Music" },
  { id: "video", label: "Video" },
  { id: "articles", label: "Articles" },
  { id: "notes", label: "Notes" },
  { id: "store", label: "Store" },
];

const workItems = [
  {
    id: "music-releases",
    category: "music",
    type: "Music",
    title: "Music Releases",
    year: "Now",
    cover: coverMap.music,
    summary: "Finished tracks, demos, mixes, and live sketches collected like a record shelf.",
    detail:
      "A place for release links, embedded players, liner notes, stems, session notes, and the strongest recent work.",
    action: "Open Shelf",
    href: "#catalog",
    tags: ["releases", "mixes", "sketches"],
  },
  {
    id: "developer-work",
    category: "dev",
    type: "Development",
    title: "Developer Work",
    year: "GitHub",
    cover: coverMap.dev,
    summary: "Repositories, tools, prototypes, and systems work with direct links to source.",
    detail:
      "Use this shelf for pinned repos, live demos, architecture notes, and compact writeups about why each project matters.",
    action: "Open Shelf",
    href: "#catalog",
    tags: ["repos", "tools", "systems"],
  },
  {
    id: "video-archive",
    category: "video",
    type: "Video",
    title: "Video Archive",
    year: "Motion",
    cover: coverMap.video,
    summary: "Short films, performance clips, process edits, and moving image experiments.",
    detail:
      "The card model supports local posters now and can switch to self-hosted WebM or MP4 files when the footage is ready.",
    action: "Open Shelf",
    href: "#catalog",
    tags: ["shorts", "edits", "motion"],
  },
  {
    id: "technical-articles",
    category: "articles",
    type: "Writing",
    title: "Technical Articles",
    year: "Markdown",
    cover: coverMap.articles,
    summary: "Deep dives, build logs, system design notes, and longer technical essays.",
    detail:
      "A shelf for markdown-backed articles once the site grows into a generated build or light CMS workflow.",
    action: "Read Shelf",
    href: "#articles",
    tags: ["essays", "systems", "build logs"],
  },
  {
    id: "public-notes",
    category: "notes",
    type: "Signals",
    title: "Public Notes",
    year: "Social",
    cover: coverMap.notes,
    summary: "Selected posts, short ideas, screenshots, and public fragments worth keeping.",
    detail:
      "Static note cards keep the best public posts close to the work without depending on heavy social embeds.",
    action: "Open Shelf",
    href: "#articles",
    tags: ["tweets", "ideas", "links"],
  },
  {
    id: "store-shelf",
    category: "store",
    type: "Objects",
    title: "Store Shelf",
    year: "Later",
    cover: coverMap.music,
    summary: "Future merch, objects, editions, downloads, and limited physical releases.",
    detail:
      "Keep this small at first: a release object, a zine, a shirt, or a digital pack can sit beside the creative archive.",
    action: "Open Shelf",
    href: "#catalog",
    tags: ["objects", "editions", "downloads"],
  },
];

let activeFilter = "all";
let activeFeatureIndex = 0;

const featureCover = document.querySelector("#featureCover");
const featureImage = document.querySelector("#featureImage");
const featureCoverLabel = document.querySelector("#featureCoverLabel");
const featureType = document.querySelector("#featureType");
const featureTitle = document.querySelector("#featureTitle");
const featureSummary = document.querySelector("#featureSummary");
const featureAction = document.querySelector("#featureAction");
const featureCounter = document.querySelector("#featureCounter");
const heroFilters = document.querySelector("#heroFilters");
const catalogFilters = document.querySelector("#catalogFilters");
const workGrid = document.querySelector("#workGrid");
const resultCount = document.querySelector("#resultCount");
const articleList = document.querySelector("#articleList");
const resetSleeves = document.querySelector("#resetSleeves");

const featuredItems = workItems.filter((item) => item.category !== "store");

function padIndex(index) {
  return String(index + 1).padStart(2, "0");
}

function getCategoryCount(categoryId) {
  if (categoryId === "all") {
    return workItems.length;
  }

  return workItems.filter((item) => item.category === categoryId).length;
}

function setFeaturedByIndex(index) {
  activeFeatureIndex = (index + featuredItems.length) % featuredItems.length;
  const item = featuredItems[activeFeatureIndex];

  featureImage.src = item.cover;
  featureImage.alt = `${item.title} cover`;
  featureCoverLabel.textContent = item.type;
  featureType.textContent = `Featured / ${item.type}`;
  featureTitle.textContent = item.title;
  featureSummary.textContent = item.summary;
  featureAction.href = item.href;
  featureAction.dataset.filterLink = item.category;
  featureCounter.textContent = padIndex(activeFeatureIndex);
}

function setFeaturedByCategory(category) {
  const nextIndex = featuredItems.findIndex((item) => item.category === category);
  if (nextIndex >= 0) {
    setFeaturedByIndex(nextIndex);
  }
}

function setFilter(category) {
  activeFilter = category;
  renderFilters();
  renderGrid();
  document.querySelector("#catalog").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderFilters() {
  const visibleCategories = categories;

  const createButton = (category, compact = false) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "genre-button";
    button.innerHTML = `
      <span>${category.label}</span>
      <span>[${getCategoryCount(category.id)}]</span>
    `;
    button.setAttribute("aria-pressed", String(activeFilter === category.id));
    button.addEventListener("click", () => {
      if (category.id !== "all") {
        setFeaturedByCategory(category.id);
      }
      setFilter(category.id);
    });
    if (compact && category.id === "all") {
      button.hidden = true;
    }
    return button;
  };

  heroFilters.replaceChildren(
    ...visibleCategories.map((category) => createButton(category, true)),
  );
  catalogFilters.replaceChildren(...visibleCategories.map((category) => createButton(category)));
}

function mediaMarkup(item) {
  if (item.videoSrc) {
    return `
      <video
        src="${item.videoSrc}"
        poster="${item.cover}"
        preload="metadata"
        muted
        playsinline
        loop
      ></video>
    `;
  }

  return `<img src="${item.cover}" alt="${item.title} cover" loading="lazy">`;
}

function tagsMarkup(tags) {
  return tags.map((tag) => `<li>${tag}</li>`).join("");
}

function renderGrid() {
  const visibleItems =
    activeFilter === "all"
      ? workItems
      : workItems.filter((item) => item.category === activeFilter);

  resultCount.textContent = `${visibleItems.length} ${visibleItems.length === 1 ? "entry" : "entries"}`;

  workGrid.replaceChildren();
  visibleItems.forEach((item) => {
    const card = document.createElement("article");
    card.className = "work-card";
    card.dataset.category = item.category;
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-front">
          <div class="cover-media">${mediaMarkup(item)}</div>
          <div class="front-meta">
            <span class="front-kicker">${item.type}</span>
            <div class="front-title">
              <h3>${item.title}</h3>
              <span>${item.year}</span>
            </div>
            <button class="flip-toggle" type="button" data-flip aria-expanded="false">
              Details
            </button>
          </div>
        </div>
        <div class="card-face card-back">
          <div>
            <span class="back-kicker">${item.type}</span>
            <h3>${item.title}</h3>
            <p>${item.detail}</p>
          </div>
          <ul class="tag-list">${tagsMarkup(item.tags)}</ul>
          <div class="card-actions">
            <a class="card-link" href="${item.href}" data-filter-link="${item.category}">
              ${item.action}
            </a>
            <button class="flip-toggle" type="button" data-flip aria-expanded="true">
              Cover
            </button>
          </div>
        </div>
      </div>
    `;

    workGrid.append(card);
    updateCardFocus(card, false);
  });
}

function updateCardFocus(card, flipped) {
  const backControls = card.querySelectorAll(".card-back a, .card-back button");
  const frontControls = card.querySelectorAll(".card-front button");

  backControls.forEach((control) => {
    control.tabIndex = flipped ? 0 : -1;
  });

  frontControls.forEach((control) => {
    control.tabIndex = flipped ? -1 : 0;
  });

  card.querySelectorAll("[data-flip]").forEach((button) => {
    button.setAttribute("aria-expanded", String(flipped));
  });
}

function toggleCard(card, force) {
  const shouldFlip = typeof force === "boolean" ? force : !card.classList.contains("is-flipped");
  card.classList.toggle("is-flipped", shouldFlip);
  updateCardFocus(card, shouldFlip);
}

function renderArticles() {
  const writingItems = workItems.filter((item) => ["articles", "notes"].includes(item.category));
  articleList.replaceChildren();

  writingItems.forEach((item) => {
    const link = document.createElement("a");
    link.className = "article-link";
    link.href = item.href;
    link.dataset.filterLink = item.category;
    link.innerHTML = `
      <span>${item.type}</span>
      <h3>${item.title}</h3>
      <p>${item.summary}</p>
    `;
    articleList.append(link);
  });
}

featureCover.addEventListener("click", () => {
  setFeaturedByIndex(activeFeatureIndex + 1);
});

document.addEventListener("click", (event) => {
  const flipButton = event.target.closest("[data-flip]");
  if (flipButton) {
    const card = flipButton.closest(".work-card");
    toggleCard(card);
    return;
  }

  const filterLink = event.target.closest("[data-filter-link]");
  if (filterLink) {
    const nextFilter = filterLink.dataset.filterLink;
    if (nextFilter) {
      event.preventDefault();
      setFeaturedByCategory(nextFilter);
      setFilter(nextFilter);
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }
  document.querySelectorAll(".work-card.is-flipped").forEach((card) => toggleCard(card, false));
});

resetSleeves.addEventListener("click", () => {
  document.querySelectorAll(".work-card.is-flipped").forEach((card) => toggleCard(card, false));
});

setFeaturedByIndex(0);
renderFilters();
renderGrid();
renderArticles();
