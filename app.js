const STORAGE_KEY = "honeymoon-atlas-2026";
const DIRTY_KEY = `${STORAGE_KEY}:dirty`;
const TOKEN_SESSION_KEY = `${STORAGE_KEY}:github-token`;
const REPOSITORY_CONFIG = {
  repoUrl: "https://github.com/sotoran712/SStravel",
  branch: "main",
  dataPath: "trip-data.json",
};

const typeLabels = {
  flight: "항공권",
  stay: "숙소",
  food: "식사",
  tour: "투어",
  transport: "이동",
  shopping: "쇼핑",
  etc: "기타",
};

const statusLabels = {
  planned: "예정",
  reserved: "예약",
  paid: "결제",
};

const defaultData = {
  trip: {
    title: "Luna Honeymoon 2026",
    couple: "민서 & 지훈",
    route: "Santorini · Athens · Milos",
    startDate: "2026-09-14",
    endDate: "2026-09-22",
    budget: 18000000,
    currency: "KRW",
  },
  github: {
    ...REPOSITORY_CONFIG,
  },
  itinerary: [
    {
      id: "itn-1",
      date: "2026-09-14",
      time: "22:35",
      type: "flight",
      title: "인천 출발",
      destination: "인천국제공항 제2터미널",
      address: "Incheon International Airport Terminal 2, Incheon, South Korea",
      budget: 0,
      spent: 0,
      status: "paid",
      note: "항공권 비용은 항공권 패널에서 관리. 라운지 이용권 확인.",
    },
    {
      id: "itn-2",
      date: "2026-09-15",
      time: "12:20",
      type: "transport",
      title: "아테네 경유 후 산토리니 이동",
      destination: "Santorini Airport",
      address: "Santorini Airport, Thira 847 00, Greece",
      budget: 0,
      spent: 0,
      status: "reserved",
      note: "항공권 비용은 항공권 패널에서 관리. 공항 픽업 기사 연락처 확인.",
    },
    {
      id: "itn-3",
      date: "2026-09-16",
      time: "17:40",
      type: "tour",
      title: "이아 선셋 포토 투어",
      destination: "Oia Castle",
      address: "Oia Castle, Oia 847 02, Greece",
      budget: 360000,
      spent: 0,
      status: "reserved",
      note: "드레스 코드는 아이보리와 네이비. 일몰 40분 전 도착.",
    },
    {
      id: "itn-4",
      date: "2026-09-17",
      time: "19:30",
      type: "food",
      title: "캘데라 디너",
      destination: "Ammoudi Bay",
      address: "Ammoudi Bay, Oia, Santorini, Greece",
      budget: 280000,
      spent: 0,
      status: "planned",
      note: "해산물 코스와 와인 페어링 후보 비교.",
    },
    {
      id: "itn-5",
      date: "2026-09-19",
      time: "10:00",
      type: "tour",
      title: "아크로폴리스와 플라카 산책",
      destination: "Acropolis of Athens",
      address: "Acropolis of Athens, Athens 105 58, Greece",
      budget: 180000,
      spent: 120000,
      status: "paid",
      note: "오전 입장권 예약. 점심은 플라카 골목에서 즉흥 선택.",
    },
    {
      id: "itn-6",
      date: "2026-09-21",
      time: "14:00",
      type: "shopping",
      title: "밀로스 기념품과 와인",
      destination: "Plaka Milos",
      address: "Plaka 848 00, Milos, Greece",
      budget: 350000,
      spent: 0,
      status: "planned",
      note: "가족 선물 리스트와 면세 한도 체크.",
    },
  ],
  flights: [
    {
      id: "flt-1",
      airline: "Korean Air",
      flightNumber: "KE901",
      route: "ICN → CDG → ATH",
      departureDate: "2026-09-14",
      bookingRef: "HMN26A",
      budget: 2700000,
      spent: 2700000,
    },
    {
      id: "flt-2",
      airline: "Aegean Airlines",
      flightNumber: "A3358",
      route: "ATH → JTR",
      departureDate: "2026-09-15",
      bookingRef: "",
      budget: 520000,
      spent: 480000,
    },
  ],
  stays: [
    {
      id: "stay-1",
      name: "Astra Suites Santorini",
      address: "Imerovigli, Santorini 847 00, Greece",
      checkIn: "2026-09-15",
      checkOut: "2026-09-18",
      budget: 4200000,
      spent: 3800000,
    },
    {
      id: "stay-2",
      name: "Electra Metropolis Athens",
      address: "Mitropoleos 15, Athens 105 57, Greece",
      checkIn: "2026-09-18",
      checkOut: "2026-09-20",
      budget: 1400000,
      spent: 1320000,
    },
    {
      id: "stay-3",
      name: "Milos Breeze Boutique Hotel",
      address: "Pollonia 848 00, Milos, Greece",
      checkIn: "2026-09-20",
      checkOut: "2026-09-22",
      budget: 1600000,
      spent: 0,
    },
  ],
  checklist: [
    { id: "chk-1", label: "여권 만료일 확인", done: true },
    { id: "chk-2", label: "국제운전면허증", done: false },
    { id: "chk-3", label: "웨딩 스냅 의상", done: false },
    { id: "chk-4", label: "여행자 보험 증권", done: true },
  ],
};

const state = {
  data: structuredClone(defaultData),
  activeDate: "all",
  search: "",
  editingItineraryId: null,
  editingStayId: null,
  editingFlightId: null,
  isDirty: false,
  statusTimer: null,
  toastTimer: null,
};

const els = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindElements();
  bindEvents();
  const hasLocalData = loadLocalData();
  applyRepositoryConfig();
  state.isDirty = localStorage.getItem(DIRTY_KEY) === "1";

  if (!state.isDirty) {
    const loadedRemote = await loadRepositoryData();
    if (!loadedRemote && !hasLocalData) {
      await loadBundledDataIfAvailable();
    }
  }

  populateForms();
  updateTokenStatus();
  render();
  updateSaveControls(state.isDirty ? "수정사항 있음" : "저장소 연결됨");
}

function bindElements() {
  const ids = [
    "saveState",
    "heroTitle",
    "heroRoute",
    "summaryDates",
    "summaryBudget",
    "summaryRemaining",
    "tripForm",
    "tripTitleInput",
    "coupleInput",
    "routeInput",
    "startDateInput",
    "endDateInput",
    "budgetInput",
    "resetButton",
    "budgetHealth",
    "budgetBar",
    "spentAmount",
    "plannedAmount",
    "categoryBreakdown",
    "searchInput",
    "clearFilterButton",
    "dayTabs",
    "itineraryList",
    "itineraryForm",
    "itineraryFormTitle",
    "cancelEditButton",
    "entryDateInput",
    "entryTimeInput",
    "entryTypeInput",
    "entryTitleInput",
    "entryDestinationInput",
    "entryAddressInput",
    "entryBudgetInput",
    "entrySpentInput",
    "entryStatusInput",
    "entryNoteInput",
    "itinerarySubmitLabel",
    "stayList",
    "stayForm",
    "cancelStayEditButton",
    "stayNameInput",
    "stayAddressInput",
    "stayCheckInInput",
    "stayCheckOutInput",
    "stayBudgetInput",
    "staySpentInput",
    "staySubmitLabel",
    "flightList",
    "flightForm",
    "cancelFlightEditButton",
    "flightAirlineInput",
    "flightNumberInput",
    "flightRouteInput",
    "flightDateInput",
    "flightBookingInput",
    "flightBudgetInput",
    "flightSpentInput",
    "flightSubmitLabel",
    "checklistCount",
    "checklistList",
    "checklistForm",
    "checklistInput",
    "githubForm",
    "githubTokenForm",
    "repoUrlInput",
    "branchInput",
    "dataPathInput",
    "githubTokenInput",
    "tokenStatus",
    "clearTokenButton",
    "downloadJsonButton",
    "downloadMarkdownButton",
    "copyMarkdownButton",
    "repoSaveButton",
    "loadRemoteButton",
    "openPagesButton",
    "importJsonInput",
    "toast",
  ];

  ids.forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function bindEvents() {
  els.tripForm.addEventListener("submit", handleTripSubmit);
  els.itineraryForm.addEventListener("submit", handleItinerarySubmit);
  els.stayForm.addEventListener("submit", handleStaySubmit);
  els.flightForm.addEventListener("submit", handleFlightSubmit);
  els.githubForm.addEventListener("submit", handleGithubSubmit);
  els.githubTokenForm.addEventListener("submit", handleTokenSubmit);
  els.checklistForm.addEventListener("submit", handleChecklistSubmit);
  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderItinerary();
  });
  els.clearFilterButton.addEventListener("click", () => {
    state.activeDate = "all";
    state.search = "";
    els.searchInput.value = "";
    render();
  });
  els.cancelEditButton.addEventListener("click", clearItineraryForm);
  els.cancelStayEditButton.addEventListener("click", clearStayForm);
  els.cancelFlightEditButton.addEventListener("click", clearFlightForm);
  els.resetButton.addEventListener("click", resetToSample);
  els.downloadJsonButton.addEventListener("click", downloadJson);
  els.downloadMarkdownButton.addEventListener("click", downloadMarkdown);
  els.copyMarkdownButton.addEventListener("click", copyMarkdown);
  els.repoSaveButton.addEventListener("click", handleRepositorySave);
  els.clearTokenButton.addEventListener("click", clearGitHubToken);
  els.loadRemoteButton.addEventListener("click", loadRemoteJson);
  els.openPagesButton.addEventListener("click", openGitHubPages);
  els.importJsonInput.addEventListener("change", importJsonFile);
}

function loadLocalData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;

  try {
    state.data = mergeData(JSON.parse(raw));
    return true;
  } catch {
    showToast("저장된 데이터를 읽지 못했습니다.");
    return false;
  }
}

async function loadBundledDataIfAvailable() {
  try {
    const response = await fetch("./trip-data.json", { cache: "no-store" });
    if (!response.ok) return;
    const remoteData = await response.json();
    state.data = mergeData(remoteData);
    persistData({ dirty: false, message: "샘플 데이터 연결됨" });
  } catch {
    // file:// preview and empty GitHub Pages folders can ignore this path.
  }
}

async function loadRepositoryData({ throwOnError = false } = {}) {
  const token = getGitHubToken();
  if (token) {
    try {
      state.data = mergeData(await readDataFromGitHub(token));
      persistData({ dirty: false, message: "저장소 연결됨" });
      return true;
    } catch (error) {
      if (throwOnError) throw error;
      return false;
    }
  }

  try {
    const response = await fetch(`${buildRawGitHubUrl()}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      if (throwOnError) throw new Error("GitHub JSON을 불러오지 못했습니다.");
      return false;
    }
    state.data = mergeData(await response.json());
    persistData({ dirty: false, message: "저장소 연결됨" });
    return true;
  } catch (error) {
    if (throwOnError) throw error;
    return false;
  }
}

async function readDataFromGitHub(token) {
  const repo = parseGitHubRepo(state.data.github.repoUrl);
  if (!repo) {
    throw new Error("저장소 URL을 확인해 주세요.");
  }

  const path = (state.data.github.dataPath || "trip-data.json").replace(/^\/+/, "");
  const branch = state.data.github.branch || "main";
  const endpoint = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`;
  const response = await fetch(endpoint, {
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new Error(await githubErrorMessage(response));
  }

  const file = await response.json();
  return JSON.parse(fromBase64Utf8(file.content || ""));
}

function mergeData(source) {
  const merged = structuredClone(defaultData);
  return {
    ...merged,
    ...source,
    trip: { ...merged.trip, ...(source.trip || {}) },
    github: { ...merged.github, ...(source.github || {}), ...REPOSITORY_CONFIG },
    itinerary: Array.isArray(source.itinerary) ? source.itinerary : merged.itinerary,
    flights: Array.isArray(source.flights) ? source.flights : [],
    stays: Array.isArray(source.stays) ? source.stays : merged.stays,
    checklist: Array.isArray(source.checklist) ? source.checklist : merged.checklist,
  };
}

function applyRepositoryConfig() {
  state.data.github = {
    ...(state.data.github || {}),
    ...REPOSITORY_CONFIG,
  };
}

function persistData({ dirty = state.isDirty, message = "" } = {}) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
  setDirtyState(dirty, message);
}

function saveData(message = "수정사항 있음") {
  applyRepositoryConfig();
  persistData({ dirty: true, message });
}

function setDirtyState(isDirty, message = "") {
  state.isDirty = isDirty;
  localStorage.setItem(DIRTY_KEY, isDirty ? "1" : "0");
  updateSaveControls(message || (isDirty ? "수정사항 있음" : "저장소 연결됨"));
}

function updateSaveControls(message = "") {
  if (!els.saveState || !els.repoSaveButton) return;
  clearTimeout(state.statusTimer);
  els.saveState.textContent = message || (state.isDirty ? "수정사항 있음" : "저장소 연결됨");
  els.repoSaveButton.classList.toggle("is-hidden", !state.isDirty);
  if (message && state.isDirty && message !== "수정사항 있음") {
    state.statusTimer = setTimeout(() => {
      if (state.isDirty) {
        els.saveState.textContent = "수정사항 있음";
      }
    }, 1200);
  }
}

function populateForms() {
  const { trip, github } = state.data;
  els.tripTitleInput.value = trip.title;
  els.coupleInput.value = trip.couple;
  els.routeInput.value = trip.route;
  els.startDateInput.value = trip.startDate;
  els.endDateInput.value = trip.endDate;
  els.budgetInput.value = trip.budget;

  els.repoUrlInput.value = github.repoUrl;
  els.branchInput.value = github.branch;
  els.dataPathInput.value = github.dataPath;

  clearItineraryForm(false);
  clearStayForm(false);
  clearFlightForm(false);
}

function render() {
  renderSummary();
  renderBudget();
  renderDayTabs();
  renderItinerary();
  renderStays();
  renderFlights();
  renderChecklist();
  refreshIcons();
}

function renderSummary() {
  const { trip } = state.data;
  const totals = calculateTotals();
  els.heroTitle.textContent = trip.title;
  els.heroRoute.textContent = trip.route;
  els.summaryDates.textContent = `${formatDateShort(trip.startDate)} - ${formatDateShort(trip.endDate)}`;
  els.summaryBudget.textContent = formatMoney(trip.budget);
  els.summaryRemaining.textContent = formatMoney(trip.budget - totals.spent);
}

function renderBudget() {
  const { trip } = state.data;
  const totals = calculateTotals();
  const spentRatio = trip.budget > 0 ? Math.min((totals.spent / trip.budget) * 100, 100) : 0;
  const plannedRatio = trip.budget > 0 ? Math.round((totals.planned / trip.budget) * 100) : 0;

  els.budgetBar.style.width = `${spentRatio}%`;
  els.spentAmount.textContent = formatMoney(totals.spent);
  els.plannedAmount.textContent = `${formatMoney(totals.planned)} · ${plannedRatio}%`;
  els.budgetHealth.textContent = getBudgetHealth(trip.budget, totals.spent);
  els.categoryBreakdown.innerHTML = "";

  const categoryEntries = Object.entries(totals.byType)
    .filter(([, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1]);
  const maxCategory = Math.max(...categoryEntries.map(([, amount]) => amount), 1);
  categoryEntries.forEach(([type, amount]) => {
    const row = document.createElement("div");
    row.className = "breakdown-item";
    row.innerHTML = `
      <div class="breakdown-top">
        <span>${typeLabels[type] || "기타"}</span>
        <strong>${formatMoney(amount)}</strong>
      </div>
      <div class="mini-meter"><div style="width:${Math.max((amount / maxCategory) * 100, 4)}%"></div></div>
    `;
    els.categoryBreakdown.append(row);
  });
}

function renderDayTabs() {
  const days = buildTripDays();
  els.dayTabs.innerHTML = "";
  els.dayTabs.append(createDayTab("all", "전체"));

  days.forEach((day, index) => {
    const label = `D+${index + 1} ${formatDateShort(day)}`;
    els.dayTabs.append(createDayTab(day, label));
  });
}

function createDayTab(value, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `day-tab${state.activeDate === value ? " is-active" : ""}`;
  button.dataset.date = value;
  button.textContent = label;
  button.addEventListener("click", () => {
    state.activeDate = value;
    if (value !== "all" && !state.editingItineraryId) {
      els.entryDateInput.value = value;
    }
    renderDayTabs();
    renderItinerary();
  });
  return button;
}

function renderItinerary() {
  const items = filteredItinerary();
  els.itineraryList.innerHTML = "";

  if (!items.length) {
    els.itineraryList.innerHTML = `<div class="empty-state">표시할 일정이 없습니다.</div>`;
    refreshIcons();
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "itinerary-card";
    card.innerHTML = `
      <div class="time-cell">
        <strong>${item.time || "--:--"}</strong>
        <span class="type-chip">${typeLabels[item.type] || "기타"}</span>
      </div>
      <div class="card-main">
        <div class="card-title-row">
          <h3>${escapeHtml(item.title)}</h3>
          <span class="status-chip ${item.status}">${statusLabels[item.status] || "예정"}</span>
        </div>
        <p class="card-meta">${formatDateLong(item.date)} · ${escapeHtml(item.destination)}</p>
        <p class="card-note">${escapeHtml(item.note || "메모 없음")}</p>
        <div class="card-footer">
          <div class="money-row">
            <span class="money-chip">예산 ${formatMoney(item.budget || 0)}</span>
            <span class="money-chip">사용 ${formatMoney(item.spent || 0)}</span>
          </div>
          <div class="card-actions">
            <a class="map-link" href="${mapUrl(item.address || item.destination)}" target="_blank" rel="noreferrer">
              <i data-lucide="map-pin"></i>
              Google Maps
            </a>
            <button class="small-action" type="button" data-action="edit" data-id="${item.id}">수정</button>
            <button class="small-action" type="button" data-action="delete" data-id="${item.id}">삭제</button>
          </div>
        </div>
      </div>
    `;
    els.itineraryList.append(card);
  });

  els.itineraryList.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", handleItineraryAction);
  });
  refreshIcons();
}

function renderStays() {
  els.stayList.innerHTML = "";
  state.data.stays
    .slice()
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .forEach((stay) => {
      const card = document.createElement("article");
      card.className = "stay-card";
      card.innerHTML = `
        <div>
          <h3>${escapeHtml(stay.name)}</h3>
          <div class="stay-meta">${formatDateShort(stay.checkIn)} - ${formatDateShort(stay.checkOut)}</div>
        </div>
        <div class="money-row">
          <span class="money-chip">예산 ${formatMoney(stay.budget || 0)}</span>
          <span class="money-chip">사용 ${formatMoney(stay.spent || 0)}</span>
        </div>
        <div class="card-actions">
          <a class="map-link" href="${mapUrl(stay.address)}" target="_blank" rel="noreferrer">
            <i data-lucide="map-pin"></i>
            지도
          </a>
          <button class="small-action" type="button" data-stay-action="edit" data-id="${stay.id}">수정</button>
          <button class="small-action" type="button" data-stay-action="delete" data-id="${stay.id}">삭제</button>
        </div>
      `;
      els.stayList.append(card);
    });

  els.stayList.querySelectorAll("[data-stay-action]").forEach((button) => {
    button.addEventListener("click", handleStayAction);
  });
}

function renderFlights() {
  els.flightList.innerHTML = "";

  if (!state.data.flights.length) {
    els.flightList.innerHTML = `<div class="empty-state">항공권을 추가해 주세요.</div>`;
    return;
  }

  state.data.flights
    .slice()
    .sort((a, b) => a.departureDate.localeCompare(b.departureDate))
    .forEach((flight) => {
      const card = document.createElement("article");
      card.className = "flight-card";
      card.innerHTML = `
        <div>
          <h3>${escapeHtml(flight.airline)} ${escapeHtml(flight.flightNumber || "")}</h3>
          <div class="stay-meta">${formatDateShort(flight.departureDate)} · ${escapeHtml(flight.route)}</div>
        </div>
        <div class="money-row">
          <span class="money-chip">예산 ${formatMoney(flight.budget || 0)}</span>
          <span class="money-chip">사용 ${formatMoney(flight.spent || 0)}</span>
        </div>
        <div class="summary-line">예약번호 ${escapeHtml(flight.bookingRef || "미입력")}</div>
        <div class="card-actions">
          <button class="small-action" type="button" data-flight-action="edit" data-id="${flight.id}">수정</button>
          <button class="small-action" type="button" data-flight-action="delete" data-id="${flight.id}">삭제</button>
        </div>
      `;
      els.flightList.append(card);
    });

  els.flightList.querySelectorAll("[data-flight-action]").forEach((button) => {
    button.addEventListener("click", handleFlightAction);
  });
}

function renderChecklist() {
  els.checklistList.innerHTML = "";
  const doneCount = state.data.checklist.filter((item) => item.done).length;
  els.checklistCount.textContent = `${doneCount}/${state.data.checklist.length}`;

  state.data.checklist.forEach((item) => {
    const row = document.createElement("label");
    row.className = `check-item${item.done ? " is-done" : ""}`;
    row.innerHTML = `
      <input type="checkbox" ${item.done ? "checked" : ""} data-check-id="${item.id}" />
      <span>${escapeHtml(item.label)}</span>
      <button class="icon-button" type="button" aria-label="준비물 삭제" data-remove-check="${item.id}">
        <i data-lucide="trash-2"></i>
      </button>
    `;
    els.checklistList.append(row);
  });

  els.checklistList.querySelectorAll("[data-check-id]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const item = state.data.checklist.find((check) => check.id === event.target.dataset.checkId);
      if (!item) return;
      item.done = event.target.checked;
      saveData("체크됨");
      renderChecklist();
      refreshIcons();
    });
  });

  els.checklistList.querySelectorAll("[data-remove-check]").forEach((button) => {
    button.addEventListener("click", (event) => {
      state.data.checklist = state.data.checklist.filter((check) => check.id !== event.currentTarget.dataset.removeCheck);
      saveData("삭제됨");
      renderChecklist();
      refreshIcons();
    });
  });
}

function handleTripSubmit(event) {
  event.preventDefault();
  state.data.trip = {
    ...state.data.trip,
    title: els.tripTitleInput.value.trim(),
    couple: els.coupleInput.value.trim(),
    route: els.routeInput.value.trim(),
    startDate: els.startDateInput.value,
    endDate: els.endDateInput.value,
    budget: numberValue(els.budgetInput.value),
  };
  saveData("여행 저장");
  render();
  showToast("여행 정보가 저장되었습니다.");
}

function handleItinerarySubmit(event) {
  event.preventDefault();
  const payload = {
    date: els.entryDateInput.value,
    time: els.entryTimeInput.value,
    type: els.entryTypeInput.value,
    title: els.entryTitleInput.value.trim(),
    destination: els.entryDestinationInput.value.trim(),
    address: els.entryAddressInput.value.trim(),
    budget: numberValue(els.entryBudgetInput.value),
    spent: numberValue(els.entrySpentInput.value),
    status: els.entryStatusInput.value,
    note: els.entryNoteInput.value.trim(),
  };

  if (state.editingItineraryId) {
    const index = state.data.itinerary.findIndex((item) => item.id === state.editingItineraryId);
    state.data.itinerary[index] = { ...state.data.itinerary[index], ...payload };
    showToast("일정이 수정되었습니다.");
  } else {
    state.data.itinerary.push({ id: createId("itn"), ...payload });
    showToast("일정이 추가되었습니다.");
  }

  clearItineraryForm(false);
  saveData("일정 저장");
  render();
}

function handleItineraryAction(event) {
  const { action, id } = event.currentTarget.dataset;
  const item = state.data.itinerary.find((entry) => entry.id === id);
  if (!item) return;

  if (action === "edit") {
    state.editingItineraryId = id;
    els.itineraryFormTitle.textContent = "일정 수정";
    els.itinerarySubmitLabel.textContent = "수정 저장";
    els.cancelEditButton.classList.remove("is-hidden");
    els.entryDateInput.value = item.date;
    els.entryTimeInput.value = item.time;
    els.entryTypeInput.value = item.type;
    els.entryTitleInput.value = item.title;
    els.entryDestinationInput.value = item.destination;
    els.entryAddressInput.value = item.address;
    els.entryBudgetInput.value = item.budget;
    els.entrySpentInput.value = item.spent;
    els.entryStatusInput.value = item.status;
    els.entryNoteInput.value = item.note || "";
    els.entryTitleInput.focus();
    refreshIcons();
    return;
  }

  state.data.itinerary = state.data.itinerary.filter((entry) => entry.id !== id);
  saveData("일정 삭제");
  render();
  showToast("일정이 삭제되었습니다.");
}

function handleStaySubmit(event) {
  event.preventDefault();
  const payload = {
    name: els.stayNameInput.value.trim(),
    address: els.stayAddressInput.value.trim(),
    checkIn: els.stayCheckInInput.value,
    checkOut: els.stayCheckOutInput.value,
    budget: numberValue(els.stayBudgetInput.value),
    spent: numberValue(els.staySpentInput.value),
  };

  if (state.editingStayId) {
    const index = state.data.stays.findIndex((stay) => stay.id === state.editingStayId);
    state.data.stays[index] = { ...state.data.stays[index], ...payload };
    showToast("숙소가 수정되었습니다.");
  } else {
    state.data.stays.push({ id: createId("stay"), ...payload });
    showToast("숙소가 추가되었습니다.");
  }

  clearStayForm(false);
  saveData("숙소 저장");
  render();
}

function handleStayAction(event) {
  const { stayAction, id } = event.currentTarget.dataset;
  const stay = state.data.stays.find((item) => item.id === id);
  if (!stay) return;

  if (stayAction === "edit") {
    state.editingStayId = id;
    els.staySubmitLabel.textContent = "수정 저장";
    els.cancelStayEditButton.classList.remove("is-hidden");
    els.stayNameInput.value = stay.name;
    els.stayAddressInput.value = stay.address;
    els.stayCheckInInput.value = stay.checkIn;
    els.stayCheckOutInput.value = stay.checkOut;
    els.stayBudgetInput.value = stay.budget;
    els.staySpentInput.value = stay.spent;
    els.stayNameInput.focus();
    refreshIcons();
    return;
  }

  state.data.stays = state.data.stays.filter((item) => item.id !== id);
  saveData("숙소 삭제");
  render();
  showToast("숙소가 삭제되었습니다.");
}

function handleFlightSubmit(event) {
  event.preventDefault();
  const payload = {
    airline: els.flightAirlineInput.value.trim(),
    flightNumber: els.flightNumberInput.value.trim(),
    route: els.flightRouteInput.value.trim(),
    departureDate: els.flightDateInput.value,
    bookingRef: els.flightBookingInput.value.trim(),
    budget: numberValue(els.flightBudgetInput.value),
    spent: numberValue(els.flightSpentInput.value),
  };

  if (state.editingFlightId) {
    const index = state.data.flights.findIndex((flight) => flight.id === state.editingFlightId);
    state.data.flights[index] = { ...state.data.flights[index], ...payload };
    showToast("항공권이 수정되었습니다.");
  } else {
    state.data.flights.push({ id: createId("flt"), ...payload });
    showToast("항공권이 추가되었습니다.");
  }

  clearFlightForm(false);
  saveData("항공권 저장");
  render();
}

function handleFlightAction(event) {
  const { flightAction, id } = event.currentTarget.dataset;
  const flight = state.data.flights.find((item) => item.id === id);
  if (!flight) return;

  if (flightAction === "edit") {
    state.editingFlightId = id;
    els.flightSubmitLabel.textContent = "수정 저장";
    els.cancelFlightEditButton.classList.remove("is-hidden");
    els.flightAirlineInput.value = flight.airline;
    els.flightNumberInput.value = flight.flightNumber || "";
    els.flightRouteInput.value = flight.route;
    els.flightDateInput.value = flight.departureDate;
    els.flightBookingInput.value = flight.bookingRef || "";
    els.flightBudgetInput.value = flight.budget;
    els.flightSpentInput.value = flight.spent;
    els.flightAirlineInput.focus();
    refreshIcons();
    return;
  }

  state.data.flights = state.data.flights.filter((item) => item.id !== id);
  saveData("항공권 삭제");
  render();
  showToast("항공권이 삭제되었습니다.");
}

function handleChecklistSubmit(event) {
  event.preventDefault();
  const label = els.checklistInput.value.trim();
  if (!label) return;
  state.data.checklist.push({ id: createId("chk"), label, done: false });
  els.checklistInput.value = "";
  saveData("준비물 저장");
  renderChecklist();
  refreshIcons();
}

function handleGithubSubmit(event) {
  event.preventDefault();
  applyRepositoryConfig();
  populateForms();
  persistData({ dirty: state.isDirty, message: state.isDirty ? "수정사항 있음" : "저장소 연결됨" });
  showToast("GitHub 저장소가 자동 연결되어 있습니다.");
}

async function handleTokenSubmit(event) {
  event.preventDefault();
  const token = els.githubTokenInput.value.trim();
  if (!token) {
    updateTokenStatus("토큰을 입력해 주세요.", "error");
    return;
  }

  els.githubTokenForm.querySelector("button[type='submit']").disabled = true;
  updateTokenStatus("토큰 권한을 확인하는 중입니다.", "normal");

  try {
    await readDataFromGitHub(token);
    sessionStorage.setItem(TOKEN_SESSION_KEY, token);
    els.githubTokenInput.value = "";
    updateTokenStatus("토큰 확인됨. 저장하기를 누르면 GitHub에 커밋됩니다.", "ready");
    showToast("토큰이 이번 브라우저 탭에만 연결되었습니다.");
  } catch (error) {
    sessionStorage.removeItem(TOKEN_SESSION_KEY);
    updateTokenStatus(error.message || "토큰을 확인하지 못했습니다.", "error");
    showToast(error.message || "토큰을 확인하지 못했습니다.");
  } finally {
    els.githubTokenForm.querySelector("button[type='submit']").disabled = false;
  }
}

function clearGitHubToken() {
  sessionStorage.removeItem(TOKEN_SESSION_KEY);
  els.githubTokenInput.value = "";
  updateTokenStatus("토큰을 지웠습니다. 다시 저장하려면 토큰을 입력해 주세요.", "normal");
  showToast("GitHub 토큰을 지웠습니다.");
}

function getGitHubToken() {
  return sessionStorage.getItem(TOKEN_SESSION_KEY) || "";
}

function updateTokenStatus(message = "", mode = "") {
  if (!els.tokenStatus) return;
  const hasToken = Boolean(getGitHubToken());
  els.tokenStatus.classList.toggle("is-ready", mode === "ready" || (!mode && hasToken));
  els.tokenStatus.classList.toggle("is-error", mode === "error");
  els.tokenStatus.textContent = message || (hasToken
    ? "토큰 연결됨. 저장하기를 누르면 GitHub에 직접 커밋됩니다."
    : "토큰은 이 브라우저 탭에서만 보관됩니다.");
}

function clearItineraryForm(resetDate = true) {
  state.editingItineraryId = null;
  els.itineraryForm.reset();
  els.itineraryFormTitle.textContent = "일정 추가";
  els.itinerarySubmitLabel.textContent = "일정 추가";
  els.cancelEditButton.classList.add("is-hidden");
  els.entryDateInput.value = resetDate ? state.data.trip.startDate : state.data.trip.startDate;
  els.entryTimeInput.value = "10:00";
  els.entryTypeInput.value = "tour";
  els.entryStatusInput.value = "planned";
  refreshIcons();
}

function clearStayForm() {
  state.editingStayId = null;
  els.stayForm.reset();
  els.staySubmitLabel.textContent = "숙소 추가";
  els.cancelStayEditButton.classList.add("is-hidden");
  els.stayCheckInInput.value = state.data.trip.startDate;
  els.stayCheckOutInput.value = state.data.trip.endDate;
  refreshIcons();
}

function clearFlightForm() {
  state.editingFlightId = null;
  els.flightForm.reset();
  els.flightSubmitLabel.textContent = "항공권 추가";
  els.cancelFlightEditButton.classList.add("is-hidden");
  els.flightDateInput.value = state.data.trip.startDate;
  refreshIcons();
}

function resetToSample() {
  state.data = structuredClone(defaultData);
  state.activeDate = "all";
  state.search = "";
  els.searchInput.value = "";
  saveData("초기화됨");
  populateForms();
  render();
  showToast("샘플 계획으로 초기화했습니다.");
}

function calculateTotals() {
  const byType = {};
  let planned = 0;
  let spent = 0;

  state.data.itinerary.forEach((item) => {
    const budget = numberValue(item.budget);
    const used = numberValue(item.spent);
    planned += budget;
    spent += used;
    byType[item.type] = (byType[item.type] || 0) + Math.max(used, budget);
  });

  state.data.stays.forEach((stay) => {
    const budget = numberValue(stay.budget);
    const used = numberValue(stay.spent);
    planned += budget;
    spent += used;
    byType.stay = (byType.stay || 0) + Math.max(used, budget);
  });

  state.data.flights.forEach((flight) => {
    const budget = numberValue(flight.budget);
    const used = numberValue(flight.spent);
    planned += budget;
    spent += used;
    byType.flight = (byType.flight || 0) + Math.max(used, budget);
  });

  return { planned, spent, byType };
}

function filteredItinerary() {
  return state.data.itinerary
    .filter((item) => state.activeDate === "all" || item.date === state.activeDate)
    .filter((item) => {
      if (!state.search) return true;
      return [item.title, item.destination, item.address, item.note, typeLabels[item.type]]
        .join(" ")
        .toLowerCase()
        .includes(state.search);
    })
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
}

function buildTripDays() {
  const start = parseDateInputValue(state.data.trip.startDate);
  const end = parseDateInputValue(state.data.trip.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return [...new Set(state.data.itinerary.map((item) => item.date))].sort();
  }

  const days = [];
  const cursor = new Date(start);
  while (cursor <= end && days.length < 60) {
    days.push(formatDateInputValue(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function downloadJson() {
  downloadFile("trip-data.json", JSON.stringify(state.data, null, 2), "application/json");
  showToast("JSON 파일을 만들었습니다.");
}

async function handleRepositorySave() {
  applyRepositoryConfig();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));

  const token = getGitHubToken();
  if (!token) {
    updateTokenStatus("GitHub에 직접 저장하려면 토큰을 입력해 주세요.", "error");
    showToast("토큰 연결 후 다시 저장해 주세요. 파일 저장은 JSON 버튼을 사용하세요.");
    return;
  }

  els.repoSaveButton.disabled = true;
  els.repoSaveButton.innerHTML = `<i data-lucide="loader-2"></i> 저장 중`;
  refreshIcons();

  try {
    await saveDataToGitHub(token);
    const remoteData = mergeData(await readDataFromGitHub(token));
    if (!isSameData(remoteData, state.data)) {
      throw new Error("GitHub 저장 검증 실패: 저장 후 다시 읽은 데이터가 현재 화면과 다릅니다.");
    }
    setDirtyState(false, "GitHub 저장됨");
    updateTokenStatus("GitHub에 저장되었습니다.", "ready");
    showToast("trip-data.json을 GitHub main 브랜치에 커밋했습니다.");
  } catch (error) {
    setDirtyState(true, "저장 실패");
    updateTokenStatus(error.message || "GitHub 저장에 실패했습니다.", "error");
    showToast(error.message || "GitHub 저장에 실패했습니다.");
  } finally {
    els.repoSaveButton.disabled = false;
    els.repoSaveButton.innerHTML = `<i data-lucide="save"></i> 저장하기`;
    refreshIcons();
  }
}

function downloadMarkdown() {
  downloadFile("README.md", buildMarkdown(), "text/markdown");
  showToast("README 파일을 만들었습니다.");
}

async function copyMarkdown() {
  try {
    await navigator.clipboard.writeText(buildMarkdown());
    showToast("README 내용을 복사했습니다.");
  } catch {
    showToast("브라우저에서 복사를 허용하지 않았습니다.");
  }
}

async function loadRemoteJson() {
  if (state.isDirty && !window.confirm("저장되지 않은 수정사항이 있습니다. GitHub 데이터를 불러오면 현재 화면의 변경사항이 덮어써집니다.")) {
    return;
  }

  try {
    await loadRepositoryData({ throwOnError: true });
    populateForms();
    render();
    showToast("GitHub JSON을 불러왔습니다.");
  } catch (error) {
    showToast(error.message || "GitHub JSON을 불러오지 못했습니다.");
  }
}

async function saveDataToGitHub(token) {
  const repo = parseGitHubRepo(state.data.github.repoUrl);
  if (!repo) {
    throw new Error("저장소 URL을 확인해 주세요.");
  }

  const path = (state.data.github.dataPath || "trip-data.json").replace(/^\/+/, "");
  const branch = state.data.github.branch || "main";
  const endpoint = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${encodePath(path)}`;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const currentResponse = await fetch(`${endpoint}?ref=${encodeURIComponent(branch)}`, { cache: "no-store", headers });
  let sha = "";
  if (currentResponse.ok) {
    const currentFile = await currentResponse.json();
    sha = currentFile.sha || "";
  } else if (currentResponse.status !== 404) {
    throw new Error(await githubErrorMessage(currentResponse));
  }

  const json = JSON.stringify(state.data, null, 2);
  const updateResponse = await fetch(endpoint, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: `Update ${path} from Honeymoon Atlas`,
      content: toBase64Utf8(json),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!updateResponse.ok) {
    throw new Error(await githubErrorMessage(updateResponse));
  }

  return updateResponse.json();
}

async function githubErrorMessage(response) {
  let detail = "";
  try {
    const payload = await response.json();
    detail = payload.message ? ` ${payload.message}` : "";
  } catch {
    detail = "";
  }

  if (response.status === 401) return "토큰이 올바르지 않거나 만료되었습니다.";
  if (response.status === 403) return "토큰에 저장소 Contents 쓰기 권한이 없습니다.";
  if (response.status === 404) return "저장소, 브랜치, 데이터 파일 경로를 찾지 못했습니다.";
  if (response.status === 409) return "GitHub 파일이 방금 변경되었습니다. 불러오기 후 다시 저장해 주세요.";
  return `GitHub 저장 실패 (${response.status}).${detail}`;
}

function encodePath(path) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function toBase64Utf8(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64Utf8(value) {
  const binary = atob(value.replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function isSameData(left, right) {
  return stableStringify(mergeData(left)) === stableStringify(mergeData(right));
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function importJsonFile(event) {
  const [file] = event.target.files;
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state.data = mergeData(JSON.parse(reader.result));
      saveData("가져옴");
      populateForms();
      render();
      showToast("JSON 파일을 가져왔습니다.");
    } catch {
      showToast("JSON 형식을 확인해 주세요.");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function openGitHubPages() {
  const repo = parseGitHubRepo(state.data.github.repoUrl);
  if (!repo) {
    showToast("저장소 URL을 확인해 주세요.");
    return;
  }

  const url = repo.repo.toLowerCase() === `${repo.owner.toLowerCase()}.github.io`
    ? `https://${repo.owner}.github.io/`
    : `https://${repo.owner}.github.io/${repo.repo}/`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function buildRawGitHubUrl() {
  const repo = parseGitHubRepo(state.data.github.repoUrl);
  if (!repo) return "";
  const branch = encodeURIComponent(state.data.github.branch || "main");
  const path = (state.data.github.dataPath || "trip-data.json").replace(/^\/+/, "");
  return `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/${branch}/${path}`;
}

function parseGitHubRepo(value) {
  const match = value.match(/github\.com\/([^/\s]+)\/([^/\s#?]+)/i);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/i, ""),
  };
}

function buildMarkdown() {
  const { trip, itinerary, flights, stays, checklist } = state.data;
  const totals = calculateTotals();
  const rows = itinerary
    .slice()
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .map((item) => {
      const map = mapUrl(item.address || item.destination);
      return `| ${formatDateShort(item.date)} | ${item.time} | ${typeLabels[item.type] || "기타"} | [${safeMd(item.title)}](${map}) | ${safeMd(item.destination)} | ${formatMoney(item.budget || 0)} | ${formatMoney(item.spent || 0)} | ${statusLabels[item.status] || "예정"} |`;
    })
    .join("\n");

  const stayRows = stays
    .slice()
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .map((stay) => `| [${safeMd(stay.name)}](${mapUrl(stay.address)}) | ${formatDateShort(stay.checkIn)} | ${formatDateShort(stay.checkOut)} | ${formatMoney(stay.budget || 0)} | ${formatMoney(stay.spent || 0)} |`)
    .join("\n");

  const flightRows = flights
    .slice()
    .sort((a, b) => a.departureDate.localeCompare(b.departureDate))
    .map((flight) => `| ${formatDateShort(flight.departureDate)} | ${safeMd(flight.airline)} | ${safeMd(flight.flightNumber || "-")} | ${safeMd(flight.route)} | ${safeMd(flight.bookingRef || "-")} | ${formatMoney(flight.budget || 0)} | ${formatMoney(flight.spent || 0)} |`)
    .join("\n");

  const checklistRows = checklist
    .map((item) => `- [${item.done ? "x" : " "}] ${safeMd(item.label)}`)
    .join("\n");

  return `# ${safeMd(trip.title)}

**Couple:** ${safeMd(trip.couple)}  
**Route:** ${safeMd(trip.route)}  
**Dates:** ${formatDateShort(trip.startDate)} - ${formatDateShort(trip.endDate)}

## Budget

| Total | Planned | Spent | Remaining |
| --- | ---: | ---: | ---: |
| ${formatMoney(trip.budget)} | ${formatMoney(totals.planned)} | ${formatMoney(totals.spent)} | ${formatMoney(trip.budget - totals.spent)} |

## Itinerary

| Date | Time | Type | Plan | Destination | Budget | Spent | Status |
| --- | --- | --- | --- | --- | ---: | ---: | --- |
${rows || "| - | - | - | - | - | - | - | - |"}

## Flights

| Date | Airline | Flight | Route | Booking Ref | Budget | Spent |
| --- | --- | --- | --- | --- | ---: | ---: |
${flightRows || "| - | - | - | - | - | - | - |"}

## Stays

| Stay | Check-in | Check-out | Budget | Spent |
| --- | --- | --- | ---: | ---: |
${stayRows || "| - | - | - | - | - |"}

## Checklist

${checklistRows || "- [ ] 준비물 추가"}
`;
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function mapUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || "")}`;
}

function getBudgetHealth(budget, spent) {
  if (!budget) return "예산 입력";
  const ratio = spent / budget;
  if (ratio >= 1) return "초과";
  if (ratio >= 0.82) return "주의";
  return "안정";
}

function formatMoney(value) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: state.data.trip.currency || "KRW",
    maximumFractionDigits: 0,
  }).format(numberValue(value));
}

function formatDateShort(value) {
  if (!value) return "-";
  const date = parseDateInputValue(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" }).format(date);
}

function formatDateLong(value) {
  if (!value) return "-";
  const date = parseDateInputValue(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

function parseDateInputValue(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!match) return new Date(NaN);

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return new Date(NaN);
  }
  return date;
}

function formatDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeMd(value = "") {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => {
    els.toast.classList.remove("is-visible");
  }, 2200);
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
