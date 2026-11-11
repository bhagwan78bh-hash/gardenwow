/* =========================================================
   GardenWow — interactions
   Vanilla JS, no dependencies. Everything works from a
   static file; checklist progress is stored on-device only.
   ========================================================= */
(function () {
  "use strict";

  // Only opt into the reveal animation once this script is actually running.
  // If the script fails to load, all content stays visible.
  document.documentElement.classList.add("reveal-ready");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header ---------- */
  const header = document.querySelector("[data-header]");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  let menuOpen = false;

  function setMenu(open, returnFocus) {
    if (!menuToggle || !mobileMenu) return;
    menuOpen = open;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
    mobileMenu.hidden = !open;

    if (open) {
      const firstLink = mobileMenu.querySelector("a");
      window.setTimeout(() => firstLink && firstLink.focus(), 30);
    } else if (returnFocus) {
      menuToggle.focus();
    }
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => setMenu(!menuOpen, false));
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false, false));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuOpen) {
        event.preventDefault();
        setMenu(false, true);
        return;
      }
      if (event.key !== "Tab" || !menuOpen) return;

      const focusables = [menuToggle, ...mobileMenu.querySelectorAll("a, button")].filter(
        (el) => el && !el.hasAttribute("disabled")
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 980 && menuOpen) setMenu(false, false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
  if (revealItems.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((el) => el.classList.add("is-visible"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
      );
      revealItems.forEach((el) => revealObserver.observe(el));
    }
  }

  /* ---------- Season tabs ---------- */
  const seasonTablist = document.querySelector("[data-season-tabs]");
  const seasonTabs = seasonTablist
    ? Array.from(seasonTablist.querySelectorAll('[role="tab"]'))
    : [];
  const seasonPanels = Array.from(document.querySelectorAll(".season-panel"));

  function selectSeason(index, focusTab) {
    if (!seasonTabs.length) return;
    const safeIndex = (index + seasonTabs.length) % seasonTabs.length;

    seasonTabs.forEach((tab, i) => {
      const selected = i === safeIndex;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focusTab) tab.focus();
    });

    seasonTabs.forEach((tab, i) => {
      const panel = document.getElementById(tab.getAttribute("aria-controls"));
      if (panel) panel.hidden = i !== safeIndex;
    });
  }

  if (seasonTabs.length) {
    // Default to the season that matches today's month (Indian urban calendar).
    const monthSeason = [
      "winter", "winter", "spring", "spring", "summer", "summer",
      "monsoon", "monsoon", "monsoon", "autumn", "autumn", "winter"
    ][new Date().getMonth()];
    const initialIndex = Math.max(0, seasonTabs.findIndex((tab) => tab.dataset.season === monthSeason));
    selectSeason(initialIndex, false);

    // Keep the current season visible in the horizontally scrolling tab strip.
    const centerActiveTab = (tab) => {
      if (!tab || !seasonTablist || seasonTablist.scrollWidth <= seasonTablist.clientWidth) return;
      const listRect = seasonTablist.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      seasonTablist.scrollLeft += tabRect.left - listRect.left - (listRect.width - tabRect.width) / 2;
    };
    window.requestAnimationFrame(() => centerActiveTab(seasonTabs[initialIndex]));
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => centerActiveTab(seasonTabs[initialIndex]));
    }
    seasonTabs.forEach((tab) => tab.addEventListener("click", () => centerActiveTab(tab)));

    seasonTabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectSeason(index, false));
      tab.addEventListener("keydown", (event) => {
        let next = null;
        if (event.key === "ArrowRight") next = index + 1;
        else if (event.key === "ArrowLeft") next = index - 1;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = seasonTabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        selectSeason(next, true);
      });
    });
    // Sync panels once in case HTML fallback and selected tab differ.
    selectSeason(initialIndex, false);
  }

  /* ---------- Plant matcher ---------- */
  const PLANTS = [
    {
      name: "Snake plant",
      latin: "Dracaena trifasciata",
      lights: ["low", "medium"],
      spaces: ["sill", "floor"],
      efforts: ["easy"],
      art: "upright",
      water: "Every 2–3 weeks",
      why: "Grows happily in shade and forgives a forgotten watering."
    },
    {
      name: "ZZ plant",
      latin: "Zamioculcas zamiifolia",
      lights: ["low", "medium"],
      spaces: ["floor", "rail"],
      efforts: ["easy"],
      art: "upright",
      water: "When top 5 cm is dry",
      why: "Glossy, architectural and almost aggressively low-maintenance."
    },
    {
      name: "Golden pothos",
      latin: "Epipremnum aureum",
      lights: ["low", "medium"],
      spaces: ["rail", "sill"],
      efforts: ["easy"],
      art: "trailing",
      water: "When top 3 cm is dry",
      why: "Trails beautifully from a shelf and roots easily from a cutting."
    },
    {
      name: "Spider plant",
      latin: "Chlorophytum comosum",
      lights: ["medium"],
      spaces: ["rail", "floor"],
      efforts: ["easy"],
      art: "trailing",
      water: "When top 2 cm is dry",
      why: "Fast, forgiving and generous with babies you can share."
    },
    {
      name: "Peace lily",
      latin: "Spathiphyllum wallisii",
      lights: ["low", "medium"],
      spaces: ["floor", "sill"],
      efforts: ["weekly"],
      art: "leafy",
      water: "When leaves begin to soften",
      why: "Tells you plainly when it is thirsty — and flowers in soft light."
    },
    {
      name: "Boston fern",
      latin: "Nephrolepis exaltata",
      lights: ["medium"],
      spaces: ["rail", "floor"],
      efforts: ["weekly"],
      art: "leafy",
      water: "Keep evenly moist",
      why: "Loves a steamy bathroom and a bright corner without harsh sun."
    },
    {
      name: "Aloe vera",
      latin: "Aloe barbadensis miller",
      lights: ["full"],
      spaces: ["sill"],
      efforts: ["easy"],
      art: "rosette",
      water: "Every 2–3 weeks",
      why: "A true sun worshipper that stores its own water supply."
    },
    {
      name: "Jade plant",
      latin: "Crassula ovata",
      lights: ["full"],
      spaces: ["sill"],
      efforts: ["easy"],
      art: "rosette",
      water: "When fully dry",
      why: "Plump leaves, tough constitution and excellent windowsill energy."
    },
    {
      name: "Mint",
      latin: "Mentha spicata",
      lights: ["full", "medium"],
      spaces: ["sill", "rail"],
      efforts: ["weekly"],
      art: "leafy",
      water: "Keep consistently moist",
      why: "Vigorous and useful in the kitchen — give it its own pot."
    },
    {
      name: "Genovese basil",
      latin: "Ocimum basilicum",
      lights: ["full"],
      spaces: ["sill", "rail"],
      efforts: ["weekly"],
      art: "leafy",
      water: "When top 2 cm is dry",
      why: "Sun plus regular pinching equals more pesto than you expected."
    },
    {
      name: "Cherry tomato",
      latin: "Solanum lycopersicum",
      lights: ["full"],
      spaces: ["floor", "rail"],
      efforts: ["hands"],
      art: "edible",
      water: "Daily in summer",
      why: "A big pot, full sun and steady feeding repay you in fruit."
    },
    {
      name: "Chilli",
      latin: "Capsicum annuum",
      lights: ["full"],
      spaces: ["sill", "floor"],
      efforts: ["weekly"],
      art: "edible",
      water: "When top 3 cm is dry",
      why: "A sunny sill can absolutely give you a real chilli harvest."
    },
    {
      name: "Marigold",
      latin: "Tagetes patula",
      lights: ["full"],
      spaces: ["rail", "sill"],
      efforts: ["weekly"],
      art: "flower",
      water: "When top 3 cm is dry",
      why: "Cheerful, quick and famously good at keeping pests guessing."
    },
    {
      name: "Coriander",
      latin: "Coriandrum sativum",
      lights: ["medium", "full"],
      spaces: ["sill", "rail"],
      efforts: ["hands"],
      art: "leafy",
      water: "Keep moist, not soggy",
      why: "Best in mild weather; sow little and often for a steady supply."
    },
    {
      name: "Lettuce",
      latin: "Lactuca sativa",
      lights: ["medium"],
      spaces: ["sill", "rail"],
      efforts: ["easy"],
      art: "leafy",
      water: "Keep evenly moist",
      why: "A cut-and-come-again crop that makes a windowsill feel productive."
    },
    {
      name: "Curry leaf",
      latin: "Murraya koenigii",
      lights: ["full"],
      spaces: ["floor"],
      efforts: ["weekly"],
      art: "upright",
      water: "When top 3 cm is dry",
      why: "Needs sun, warmth and patience — then earns its place by the stove."
    },
    {
      name: "Tulsi",
      latin: "Ocimum tenuiflorum",
      lights: ["full"],
      spaces: ["sill", "rail"],
      efforts: ["weekly"],
      art: "leafy",
      water: "When top 2 cm is dry",
      why: "Sun and regular pinching keep this kitchen garden favourite bushy."
    },
    {
      name: "Bougainvillea",
      latin: "Bougainvillea glabra",
      lights: ["full"],
      spaces: ["floor", "rail"],
      efforts: ["weekly"],
      art: "flower",
      water: "Sparingly; let it dry",
      why: "Flowers best in full sun and slightly tough love."
    }
  ];

  const lightLabel = { low: "Low light", medium: "Bright indirect", full: "Full sun" };
  const spaceLabel = { sill: "Windowsill", rail: "Shelf or rail", floor: "Floor or roof" };
  const effortLabel = { easy: "Barely there", weekly: "Weekly check-in", hands: "Likes a fuss" };
  const lightOrder = ["low", "medium", "full"];
  const spaceOrder = ["sill", "rail", "floor"];
  const effortOrder = ["easy", "weekly", "hands"];

  function distance(a, b, order) {
    return Math.abs(order.indexOf(a) - order.indexOf(b));
  }

  function scorePlant(plant, light, space, effort) {
    let score = 0;
    score += plant.lights.includes(light) ? 4 : plant.lights.some((l) => distance(l, light, lightOrder) <= 1) ? 1 : 0;
    score += plant.spaces.includes(space) ? 2.5 : plant.spaces.some((s) => distance(s, space, spaceOrder) <= 1) ? 0.7 : 0;
    score += plant.efforts.includes(effort) ? 2 : plant.efforts.some((e) => distance(e, effort, effortOrder) <= 1) ? 0.6 : 0;
    return score;
  }

  function plantArt(kind) {
    const pot = `
      <path d="M31 77h38l-4.5 15H35.5L31 77Z" fill="#b86445"/>
      <rect x="29" y="72.5" width="42" height="6" rx="2.2" fill="#cf7b58"/>
      <path d="M38 81.5h24" stroke="#8e452f" stroke-width="1.2" stroke-linecap="round" opacity=".35"/>`;

    const art = {
      upright: `
        <path d="M50 72C46 54 41 36 36 20c8 5 13 20 16 52Z" fill="#2b5534"/>
        <path d="M52 72C53 46 57 30 63 14c5 8 4 29-4 58Z" fill="#477548"/>
        <path d="M47 72C43 57 41 45 42 31c7 6 9 23 8 41Z" fill="#6e915c"/>
        <path d="M55 72c2-18 6-31 11-42 1 11-1 28-7 42Z" fill="#91ad72"/>`,
      trailing: `
        <path d="M43 73C35 58 34 45 38 33" fill="none" stroke="#2b5534" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M57 73C64 58 67 46 64 33" fill="none" stroke="#2b5534" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M40 48c-8-4-13-1-14 5 7 2 12 0 14-5Z" fill="#4d7a4b"/>
        <path d="M36 38c2-7 7-10 12-7-1 7-5 10-12 7Z" fill="#70945f"/>
        <path d="M61 53c8-4 13-1 14 5-7 2-12 0-14-5Z" fill="#4d7a4b"/>
        <path d="M66 41c-2-7-7-10-12-7 1 7 5 10 12 7Z" fill="#70945f"/>
        <path d="M47 61c-6-2-10 1-10 6 6 1 10-1 10-6Z" fill="#365f3c"/>
        <path d="M54 64c6-2 10 1 10 6-6 1-10-1-10-6Z" fill="#365f3c"/>`,
      leafy: `
        <path d="M50 73V40M50 54 36 43M50 59 65 47M50 48 40 33" fill="none" stroke="#2b5534" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M38 34c-9-6-16-3-18 5 8 4 15 2 18-5Z" fill="#3f6c42"/>
        <path d="M63 48c10-5 16-1 17 7-9 3-15 0-17-7Z" fill="#4d7a4b"/>
        <path d="M50 44c-9-5-14 0-15 8 8 3 14-1 15-8Z" fill="#70945f"/>
        <path d="M54 55c9-4 15 1 15 9-8 2-14-2-15-9Z" fill="#365f3c"/>
        <path d="M48 64c-8-4-14 0-14 8 8 2 13-2 14-8Z" fill="#5a8455"/>`,
      rosette: `
        <path d="M50 72C46 55 44 39 46 24c7 8 8 27 4 48Z" fill="#3f6c42"/>
        <path d="M50 72C51 52 56 35 64 26c2 11-3 30-14 46Z" fill="#70945f"/>
        <path d="M49 72C45 55 38 42 30 34c-2 12 7 29 19 38Z" fill="#5a8455"/>
        <path d="M50 72c1-13 4-23 9-30 2 8-2 22-9 30Z" fill="#91ad72"/>
        <path d="M48 72c-4-12-8-19-14-23 0 9 5 19 14 23Z" fill="#477548"/>`,
      flower: `
        <path d="M50 73V39M50 54 40 45M50 60 61 50" fill="none" stroke="#2b5534" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M45 58c-7-3-12 0-12 6 6 2 11 0 12-6ZM56 52c7-3 12 0 12 6-6 2-11 0-12-6Z" fill="#4d7a4b"/>
        <circle cx="50" cy="32" r="8.5" fill="#d77a4f"/>
        <circle cx="42" cy="37" r="6.5" fill="#e39a6e"/>
        <circle cx="58" cy="37" r="6.5" fill="#c76b4b"/>
        <circle cx="50" cy="43" r="6" fill="#e8ac7f"/>
        <circle cx="50" cy="36" r="3.4" fill="#f4d88d"/>`,
      edible: `
        <path d="M50 73V34M50 51 39 42M50 59 63 47" fill="none" stroke="#2b5534" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M41 43c-7-4-12-1-13 5 6 3 12 1 13-5ZM60 48c7-4 12-1 13 5-6 3-12 1-13-5Z" fill="#4d7a4b"/>
        <path d="M50 35c-5-6-4-14 2-18 5 6 4 13-2 18Z" fill="#70945f"/>
        <circle cx="43" cy="57" r="7" fill="#c76b4b"/>
        <circle cx="59" cy="63" r="6" fill="#d77a4f"/>
        <path d="M43 50c1-2 2-3 4-4M59 57c1-2 2-3 4-4" stroke="#2b5534" stroke-width="1.4" stroke-linecap="round"/>`
    };

    return `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">${art[kind] || art.leafy}${pot}</svg>`;
  }

  const matcherForm = document.querySelector("[data-matcher-form]");
  const resultsWrap = document.querySelector("[data-match-results]");
  const resultsCount = document.querySelector("[data-match-count]");
  const matchStatus = document.querySelector("[data-match-status]");

  function getChoice(name) {
    const checked = matcherForm && matcherForm.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : null;
  }

  function renderMatches() {
    if (!matcherForm || !resultsWrap) return;
    const light = getChoice("light");
    const space = getChoice("space");
    const effort = getChoice("effort");
    if (!light || !space || !effort) return;

    const ranked = PLANTS
      .map((plant, index) => ({ plant, index, score: scorePlant(plant, light, space, effort) }))
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .slice(0, 3);

    resultsWrap.innerHTML = ranked
      .map(({ plant }) => {
        const lightTag = plant.lights.includes("low") && plant.lights.includes("medium")
          ? "Low–medium light"
          : plant.lights.includes("medium") && plant.lights.includes("full")
            ? "Indirect–full sun"
            : lightLabel[plant.lights[0]];
        const spaceShort = { sill: "Sill", rail: "Shelf", floor: "Floor" };
        const spaceTag = plant.spaces.length > 1
          ? plant.spaces.map((s) => spaceShort[s]).join(" / ")
          : spaceLabel[plant.spaces[0]];
        const effortTag = effortLabel[plant.efforts[0]];
        return `
          <article class="result-card">
            <div class="plant-art">${plantArt(plant.art)}</div>
            <div class="result-info">
              <h3>${plant.name}</h3>
              <p class="plant-latin">${plant.latin}</p>
              <div class="result-tags">
                <span>${lightTag}</span>
                <span>${spaceTag}</span>
                <span>${effortTag}</span>
              </div>
              <p class="result-why">${plant.why}</p>
            </div>
            <div class="result-care">
              <span>Water</span>
              <strong>${plant.water}</strong>
            </div>
          </article>`;
      })
      .join("");

    if (resultsCount) {
      resultsCount.textContent = `0${ranked.length} / ${PLANTS.length}`;
    }
    if (matchStatus) {
      const spacePhrase = { sill: "a windowsill", rail: "a shelf or rail", floor: "a floor or roof" }[space];
      const effortPhrase = { easy: "barely-there care", weekly: "weekly care", hands: "hands-on care" }[effort];
      matchStatus.textContent = `Showing ${ranked.length} plant matches for ${lightLabel[light].toLowerCase()}, ${spacePhrase}, and ${effortPhrase}.`;
    }
  }

  if (matcherForm) {
    matcherForm.addEventListener("change", renderMatches);
    renderMatches();

    const reset = document.querySelector("[data-match-reset]");
    if (reset) {
      reset.addEventListener("click", () => {
        const defaults = { light: "medium", space: "rail", effort: "weekly" };
        Object.entries(defaults).forEach(([name, value]) => {
          const input = matcherForm.querySelector(`input[name="${name}"][value="${value}"]`);
          if (input) input.checked = true;
        });
        renderMatches();
        const first = matcherForm.querySelector('input[name="light"]');
        if (first) first.focus({ preventScroll: true });
      });
    }
  }

  /* ---------- Weekly checklist ---------- */
  const checklist = document.querySelector("[data-checklist]");
  if (checklist) {
    const STORAGE_KEY = "gardenwow:weekly-reset:v1";
    const inputs = Array.from(checklist.querySelectorAll('input[type="checkbox"]'));
    const countEl = document.querySelector("[data-check-count]");
    const progress = document.querySelector("[data-progress]");
    const progressBar = document.querySelector("[data-progress-bar]");
    const messageEl = document.querySelector("[data-check-message]");
    const resetBtn = document.querySelector("[data-check-reset]");
    const card = checklist.closest(".checklist-card");
    const defaultMessage = "Progress saves on this device. No account needed.";

    function readSaved() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        return [];
      }
    }

    function save() {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(inputs.filter((input) => input.checked).map((input) => input.value))
        );
      } catch (error) {
        /* Storage can be unavailable in private or file contexts. The page still works. */
      }
    }

    function updateChecklist(announce) {
      const done = inputs.filter((input) => input.checked).length;
      const total = inputs.length;
      if (countEl) countEl.textContent = `${done} / ${total}`;
      if (progress) progress.setAttribute("aria-valuenow", String(done));
      if (progressBar) progressBar.style.width = `${(done / total) * 100}%`;
      if (card) card.classList.toggle("is-complete", done === total);

      if (messageEl) {
        if (done === 0) messageEl.textContent = defaultMessage;
        else if (done === total) messageEl.textContent = "Garden tended. Week handled. Go do something nice.";
        else messageEl.textContent = `${total - done} small ${total - done === 1 ? "thing" : "things"} left. No rush.`;
      }

      if (announce) {
        const live = document.querySelector("[data-check-status]");
        if (live) live.textContent = done === total ? "All weekly tasks complete." : `${done} of ${total} tasks complete.`;
      }
    }

    const saved = readSaved();
    inputs.forEach((input) => {
      if (saved.includes(input.value)) input.checked = true;
      input.addEventListener("change", () => {
        save();
        updateChecklist(true);
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        inputs.forEach((input) => { input.checked = false; });
        save();
        updateChecklist(true);
        if (inputs[0]) inputs[0].focus();
      });
    }

    updateChecklist(false);
  }

  /* ---------- Footer year ---------- */
  const yearEls = document.querySelectorAll("[data-year]");
  yearEls.forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
