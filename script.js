(() => {
  "use strict";

  const PRICES = [
    { id: "rice", name: "Local Rice", category: "Grains", market: "Lagos", unit: "50kg bag", price: 78000, change: 2.4, history: [70000, 72000, 73000, 75000, 74000, 76000, 78000] },
    { id: "beans", name: "Honey Beans", category: "Grains", market: "Kano", unit: "50kg bag", price: 65000, change: -1.2, history: [68000, 67000, 66000, 67000, 65000, 66000, 65000] },
    { id: "maize", name: "Maize", category: "Grains", market: "Abuja", unit: "100kg bag", price: 52000, change: 1.8, history: [48000, 49000, 50000, 51000, 50000, 51000, 52000] },
    { id: "garri", name: "Garri", category: "Grains", market: "Ibadan", unit: "50kg bag", price: 38000, change: -2.0, history: [40000, 40000, 39000, 39000, 38000, 39000, 38000] },
    { id: "tomatoes", name: "Tomatoes", category: "Vegetables", market: "Lagos", unit: "Big basket", price: 32000, change: 8.6, history: [24000, 26000, 25000, 28000, 29000, 30000, 32000] },
    { id: "onions", name: "Onions", category: "Vegetables", market: "Kaduna", unit: "50kg bag", price: 45000, change: -3.1, history: [48000, 47000, 47000, 46000, 46000, 45000, 45000] },
    { id: "pepper", name: "Rodo Pepper", category: "Vegetables", market: "Lagos", unit: "50kg bag", price: 48000, change: 4.2, history: [42000, 44000, 43000, 45000, 46000, 47000, 48000] },
    { id: "yam", name: "Yam", category: "Vegetables", market: "Abuja", unit: "100 tubers", price: 85000, change: 5.0, history: [76000, 78000, 79000, 81000, 82000, 84000, 85000] },
    { id: "eggs", name: "Eggs", category: "Proteins", market: "Abuja", unit: "Crate of 30", price: 5200, change: 0, history: [5200, 5200, 5100, 5200, 5200, 5200, 5200] },
    { id: "chicken", name: "Chicken", category: "Proteins", market: "Lagos", unit: "1kg", price: 6500, change: 1.5, history: [6000, 6100, 6200, 6300, 6400, 6400, 6500] },
    { id: "palm-oil", name: "Palm Oil", category: "Oils & spices", market: "Port Harcourt", unit: "25L keg", price: 38000, change: -0.9, history: [39000, 39000, 38000, 38000, 39000, 38000, 38000] },
    { id: "cooking-oil", name: "Cooking Oil", category: "Oils & spices", market: "Lagos", unit: "5L bottle", price: 12500, change: 0, history: [12500, 12600, 12500, 12500, 12400, 12500, 12500] }
  ];

  const CATEGORY_KEYS = {
    "Grains": "grains",
    "Vegetables": "vegetables",
    "Proteins": "proteins",
    "Oils & spices": "oils"
  };
  const MARKET_KEYS = ["lagos", "abuja", "kano", "kaduna", "port-harcourt", "ibadan"];
  const WATCHLIST_KEY = "sabeer-market-watchlist-v1";

  const priceRows = document.querySelector("#price-rows");
  const priceSearch = document.querySelector("#price-search");
  const heroSearch = document.querySelector("#hero-search");
  const heroSearchInput = document.querySelector("#hero-search-input");
  const marketChips = document.querySelector("#market-chips");
  const categoryTabs = document.querySelector("#category-tabs");
  const watchlistToggle = document.querySelector("#watchlist-toggle");
  const watchlistCount = document.querySelector("#watchlist-count");
  const priceCount = document.querySelector("#price-count");
  const priceEmpty = document.querySelector("#price-empty");
  const priceEmptyCopy = document.querySelector("#price-empty-copy");
  const clearFilters = document.querySelector("#clear-filters");
  const nav = document.querySelector("#site-nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const year = document.querySelector("#year");

  const state = {
    query: "",
    market: "all",
    category: "all",
    watchlistOnly: false
  };

  let watchlist = loadWatchlist();
  let urlTimer = 0;

  function slug(value) {
    return String(value).toLowerCase().replace(/\s+/g, "-");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
      const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
      return map[character];
    });
  }

  function money(value) {
    return "₦" + Number(value).toLocaleString("en-NG");
  }

  function loadWatchlist() {
    try {
      const stored = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]");
      if (!Array.isArray(stored)) return new Set();
      const valid = new Set(PRICES.map((item) => item.id));
      return new Set(stored.filter((id) => typeof id === "string" && valid.has(id)));
    } catch (error) {
      return new Set();
    }
  }

  function saveWatchlist() {
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify([...watchlist]));
    } catch (error) {
      /* Storage can be unavailable in private browsing. The page still works. */
    }
  }

  function changeClass(change) {
    if (change > 0) return "is-up";
    if (change < 0) return "is-down";
    return "is-flat";
  }

  function changeLabel(change) {
    if (change > 0) return `↑ ${change.toFixed(1)}%`;
    if (change < 0) return `↓ ${Math.abs(change).toFixed(1)}%`;
    return "→ 0.0%";
  }

  function sparkBars(history) {
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    return history.map((value) => {
      const height = Math.round(17 + ((value - min) / range) * 83);
      return `<i style="height:${height}%"></i>`;
    }).join("");
  }

  function starIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="m12 3.4 2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.9L12 3.4Z"/></svg>';
  }

  function filteredPrices() {
    const query = state.query.toLowerCase();
    return PRICES.filter((item) => {
      if (state.market !== "all" && slug(item.market) !== state.market) return false;
      if (state.category !== "all" && CATEGORY_KEYS[item.category] !== state.category) return false;
      if (state.watchlistOnly && !watchlist.has(item.id)) return false;
      if (query) {
        const haystack = `${item.name} ${item.category} ${item.market} ${item.unit}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }

  function render() {
    const items = filteredPrices();
    const trendClass = (item) => changeClass(item.change);

    priceRows.innerHTML = items.map((item) => {
      const tracked = watchlist.has(item.id);
      const categoryClass = `price-dot--${CATEGORY_KEYS[item.category]}`;
      const trackLabel = tracked ? `Stop tracking ${item.name}` : `Track ${item.name}`;
      return `
        <tr>
          <td class="price-item-cell">
            <div class="price-item">
              <span class="price-dot ${categoryClass}" aria-hidden="true"></span>
              <span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.category)}</small></span>
            </div>
          </td>
          <td class="price-market-cell price-market">
            <strong>${escapeHtml(item.market)}</strong>
            <small><span class="price-market-updated">Updated 7:00 AM</span><span class="price-unit-mobile">${escapeHtml(item.unit)} · 7:00 AM</span></small>
          </td>
          <td class="price-unit-cell"><span class="price-unit">${escapeHtml(item.unit)}</span></td>
          <td class="price-value-cell"><span class="price-value">${money(item.price)}</span></td>
          <td class="price-change-cell"><span class="price-change ${trendClass(item)}">${changeLabel(item.change)}</span></td>
          <td class="price-spark-cell"><span class="spark ${trendClass(item)}" aria-hidden="true">${sparkBars(item.history)}</span></td>
          <td class="price-track-cell">
            <button class="track-button${tracked ? " is-tracked" : ""}" type="button" data-id="${escapeHtml(item.id)}" aria-pressed="${tracked}" aria-label="${escapeHtml(trackLabel)}">${starIcon()}</button>
          </td>
        </tr>
      `;
    }).join("");

    const noun = items.length === 1 ? "item" : "items";
    priceCount.textContent = `Showing ${items.length} of ${PRICES.length} ${noun}${state.watchlistOnly ? " in your watchlist" : ""}`;
    priceCount.setAttribute("aria-live", "polite");

    if (items.length === 0) {
      priceEmpty.hidden = false;
      const title = priceEmpty.querySelector("strong");
      if (state.watchlistOnly && watchlist.size === 0) {
        title.textContent = "Your watchlist is empty.";
        priceEmptyCopy.textContent = "Tap the star beside an item to save it here.";
      } else {
        title.textContent = "No prices match that search.";
        priceEmptyCopy.textContent = "Try a different item, market or category.";
      }
    } else {
      priceEmpty.hidden = true;
    }

    watchlistCount.textContent = String(watchlist.size);
    watchlistToggle.classList.toggle("is-active", state.watchlistOnly);
    watchlistToggle.setAttribute("aria-pressed", String(state.watchlistOnly));
  }

  function setActive(container, attribute, value) {
    if (!container) return;
    container.querySelectorAll(`[data-${attribute}]`).forEach((button) => {
      button.classList.toggle("is-active", button.dataset[attribute] === value);
    });
  }

  function syncUrl() {
    const url = new URL(window.location.href);
    if (state.query) url.searchParams.set("q", state.query);
    else url.searchParams.delete("q");
    if (state.market !== "all") url.searchParams.set("market", state.market);
    else url.searchParams.delete("market");
    if (state.category !== "all") url.searchParams.set("category", state.category);
    else url.searchParams.delete("category");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function applyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get("q") || "").trim();
    const market = params.get("market");
    const category = params.get("category");

    state.query = query;
    if (market && MARKET_KEYS.includes(market)) state.market = market;
    if (category && ["grains", "vegetables", "proteins", "oils"].includes(category)) state.category = category;

    priceSearch.value = query;
    heroSearchInput.value = query;
    setActive(marketChips, "market", state.market);
    setActive(categoryTabs, "category", state.category);
  }

  function clearAll() {
    state.query = "";
    state.market = "all";
    state.category = "all";
    state.watchlistOnly = false;
    priceSearch.value = "";
    heroSearchInput.value = "";
    setActive(marketChips, "market", "all");
    setActive(categoryTabs, "category", "all");
    render();
    syncUrl();
    priceSearch.focus();
  }

  function toggleWatched(id) {
    if (!id) return;
    if (watchlist.has(id)) watchlist.delete(id);
    else watchlist.add(id);
    saveWatchlist();
    render();
  }

  function scrollToPrices() {
    const section = document.querySelector("#prices");
    if (!section) return;
    const header = document.querySelector(".site-header");
    const headerOffset = (header ? header.offsetHeight : 82) + 18;
    window.scrollTo({
      top: Math.max(0, section.getBoundingClientRect().top + window.scrollY - headerOffset),
      behavior: "auto"
    });
  }

  priceRows.addEventListener("click", (event) => {
    const button = event.target.closest(".track-button");
    if (!button) return;
    toggleWatched(button.dataset.id);
  });

  marketChips.addEventListener("click", (event) => {
    const button = event.target.closest("[data-market]");
    if (!button) return;
    state.market = button.dataset.market;
    setActive(marketChips, "market", state.market);
    render();
    syncUrl();
  });

  categoryTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    setActive(categoryTabs, "category", state.category);
    render();
    syncUrl();
  });

  watchlistToggle.addEventListener("click", () => {
    state.watchlistOnly = !state.watchlistOnly;
    render();
  });

  clearFilters.addEventListener("click", clearAll);

  priceSearch.addEventListener("input", () => {
    state.query = priceSearch.value.trim();
    render();
    window.clearTimeout(urlTimer);
    urlTimer = window.setTimeout(syncUrl, 280);
  });

  heroSearch.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = heroSearchInput.value.trim();
    state.query = query;
    priceSearch.value = query;
    render();
    syncUrl();
    document.querySelector("#prices").scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => priceSearch.focus({ preventScroll: true }), 450);
  });

  if (menuToggle && nav) {
    const closeMenu = () => {
      nav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    };

    menuToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  if (year) year.textContent = String(new Date().getFullYear());

  const params = new URLSearchParams(window.location.search);
  const hasFilterParams = params.has("q") || params.has("market") || params.has("category");

  applyUrlParams();
  render();

  if (hasFilterParams || window.location.hash === "#prices") {
    window.requestAnimationFrame(scrollToPrices);
    window.setTimeout(scrollToPrices, 420);
    window.setTimeout(scrollToPrices, 1200);
    window.setTimeout(scrollToPrices, 2400);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scrollToPrices).catch(() => {});
    }

    window.addEventListener("load", scrollToPrices, { once: true });
  }
})();
