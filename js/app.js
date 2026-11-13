/**
 * ==============================================================================
 * PawCare — Quản lý Hồ sơ & Lịch Chăm sóc Thú cưng
 * File JavaScript: app.js
 * Thiết kế giao diện tối giản, màu trung tính và biểu tượng đơn sắc
 * ==============================================================================
 */

// ==========================================
// 1. DỮ LIỆU MẪU BAN ĐẦU (DEMO DATA)
// ==========================================
const CAT_AVATAR = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&auto=format&fit=crop&q=80";
const DOG_AVATAR = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&auto=format&fit=crop&q=80";

const DEFAULT_PET = {
  name: "Bơ Mập",
  species: "Chó",
  gender: "Đực",
  birthDate: "2023-04-10",
  weight: 10.5,
  avatar: DOG_AVATAR
};

const DEFAULT_FEEDING = {
  lifeStage: "adult" // 'kitten' | 'adult' | 'sterilized'
};

const DEFAULT_VACCINES = [
  {
    id: 1,
    name: "Tiêm phòng dại (Rabies)",
    lastDate: "2024-05-10",
    nextDate: "2025-05-10",
    cycleMonths: 12,
    note: "Phòng khám Thú y PetCare, số lô vacxin #R-2024"
  },
  {
    id: 2,
    name: "Tiêm mũi tổng hợp 7 bệnh (DHPPi/L4)",
    lastDate: "2024-06-15",
    nextDate: "2025-06-15",
    cycleMonths: 12,
    note: "Phòng ngừa care, parvo, viêm gan truyền nhiễm"
  },
  {
    id: 3,
    name: "Tẩy giun định kỳ",
    lastDate: "2024-10-01",
    nextDate: "2025-01-01",
    cycleMonths: 3,
    note: "Thuốc tẩy giun dạng viên nén trộn thức ăn"
  },
  {
    id: 4,
    name: "Nhỏ gáy phòng ve rận & bọ chét",
    lastDate: "2024-11-01",
    nextDate: "2024-12-01",
    cycleMonths: 1,
    note: "Nhỏ dọc sống lưng sau gáy, kiêng tắm 2 ngày"
  }
];

// ==========================================
// 2. STATE ỨNG DỤNG & LOCALSTORAGE
// ==========================================
let state = {
  pet: null,
  feeding: null,
  vaccines: [],
  currentFilter: "all"
};

function initData() {
  const savedPet = localStorage.getItem("pawcare_pet");
  const savedFeeding = localStorage.getItem("pawcare_feeding");
  const savedVaccines = localStorage.getItem("pawcare_vaccines");

  if (savedPet) {
    state.pet = JSON.parse(savedPet);
    // Tự động đồng bộ sang chú chó Beagle theo yêu cầu người dùng
    if (state.pet.species === "Mèo" || (state.pet.avatar && state.pet.avatar.includes("514888286974"))) {
      state.pet.species = "Chó";
      state.pet.avatar = DOG_AVATAR;
      state.pet.weight = 10.5;
      localStorage.setItem("pawcare_pet", JSON.stringify(state.pet));
    }
  } else {
    state.pet = { ...DEFAULT_PET };
    localStorage.setItem("pawcare_pet", JSON.stringify(state.pet));
  }

  if (savedFeeding) {
    state.feeding = JSON.parse(savedFeeding);
  } else {
    state.feeding = { ...DEFAULT_FEEDING };
    localStorage.setItem("pawcare_feeding", JSON.stringify(state.feeding));
  }

  if (savedVaccines) {
    state.vaccines = JSON.parse(savedVaccines);
  } else {
    state.vaccines = JSON.parse(JSON.stringify(DEFAULT_VACCINES));
    localStorage.setItem("pawcare_vaccines", JSON.stringify(state.vaccines));
  }
}

function saveState() {
  localStorage.setItem("pawcare_pet", JSON.stringify(state.pet));
  localStorage.setItem("pawcare_feeding", JSON.stringify(state.feeding));
  localStorage.setItem("pawcare_vaccines", JSON.stringify(state.vaccines));
}

// ==========================================
// 3. LOGIC NGHIỆP VỤ & TÍNH TOÁN
// ==========================================

function calculateAge(birthDateString) {
  if (!birthDateString) return "Chưa rõ tuổi";

  const birth = new Date(birthDateString);
  const now = new Date();

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years <= 0 && months <= 0) {
    const diffDays = Math.max(1, Math.floor((now - birth) / (1000 * 60 * 60 * 24)));
    return `${diffDays} ngày tuổi`;
  }

  if (years === 0) {
    return `${months} tháng tuổi`;
  }

  if (months === 0) {
    return `${years} tuổi`;
  }

  return `${years} tuổi ${months} tháng`;
}

function calculateFeeding(species, weight, lifeStage) {
  const w = parseFloat(weight) || 0;
  if (w <= 0) return { foodGram: 0, perMealGram: 0, mealsCount: 2, waterMl: 0 };

  const baseGramPerKg = species === "Mèo" ? 32 : 28;

  let multiplier = 1.0;
  if (lifeStage === "kitten") {
    multiplier = 1.6;
  } else if (lifeStage === "sterilized") {
    multiplier = 0.85;
  }

  const totalFoodGram = Math.round(w * baseGramPerKg * multiplier);
  const mealsCount = lifeStage === "kitten" ? 3 : 2;
  const perMealGram = Math.round(totalFoodGram / mealsCount);
  const totalWaterMl = Math.round(w * 55);

  return {
    foodGram: totalFoodGram,
    perMealGram: perMealGram,
    mealsCount: mealsCount,
    waterMl: totalWaterMl
  };
}

function calculateNextDate(lastDateString, cycleMonths) {
  const date = new Date(lastDateString);
  date.setMonth(date.getMonth() + parseInt(cycleMonths, 10));

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getVaccineStatus(nextDateString) {
  if (!nextDateString) return { status: "safe", daysLeft: 999 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextDate = new Date(nextDateString);
  nextDate.setHours(0, 0, 0, 0);

  const diffTime = nextDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: "overdue", daysLeft: Math.abs(diffDays) };
  } else if (diffDays <= 7) {
    return { status: "due-soon", daysLeft: diffDays };
  } else {
    return { status: "safe", daysLeft: diffDays };
  }
}

function formatDateVN(dateString) {
  if (!dateString) return "---";
  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// ==========================================
// 4. RENDER GIAO DIỆN (DOM MANIPULATION)
// ==========================================

function renderPetProfile() {
  const pet = state.pet;
  if (!pet) return;

  document.getElementById("displayPetName").textContent = pet.name;
  document.getElementById("displaySpeciesBadge").textContent = pet.species;
  document.getElementById("displayPetGender").textContent = pet.gender;
  document.getElementById("displayPetAge").textContent = calculateAge(pet.birthDate);
  document.getElementById("displayPetWeight").textContent = pet.weight;

  if (pet.avatar) {
    document.getElementById("displayPetAvatar").src = pet.avatar;
  }

  document.getElementById("inputPetName").value = pet.name || "";
  document.getElementById("selectSpecies").value = pet.species || "Chó";
  document.getElementById("selectGender").value = pet.gender || "Đực";
  document.getElementById("inputBirthDate").value = pet.birthDate || "";
  document.getElementById("inputWeight").value = pet.weight || "";
}

function renderFeeding() {
  const pet = state.pet;
  const feeding = state.feeding;
  if (!pet || !feeding) return;

  document.getElementById("selectLifeStage").value = feeding.lifeStage || "adult";

  const result = calculateFeeding(pet.species, pet.weight, feeding.lifeStage);

  document.getElementById("calcFoodGram").textContent = `${result.foodGram} g`;
  document.getElementById("calcMealBreakdown").textContent = `~ ${result.perMealGram} g / bữa (${result.mealsCount} bữa/ngày)`;
  document.getElementById("calcWaterMl").textContent = `${result.waterMl} ml`;
}

function renderHealthAlerts() {
  const vaccines = state.vaccines;
  let overdueCount = 0;
  let dueSoonCount = 0;
  let safeCount = 0;

  vaccines.forEach(v => {
    const info = getVaccineStatus(v.nextDate);
    if (info.status === "overdue") overdueCount++;
    else if (info.status === "due-soon") dueSoonCount++;
    else safeCount++;
  });

  const totalCount = vaccines.length;
  const attentionCount = overdueCount + dueSoonCount;

  document.getElementById("statTotalVaccines").textContent = totalCount;
  document.getElementById("statSafeCount").textContent = safeCount;
  document.getElementById("statAttentionCount").textContent = attentionCount;

  document.getElementById("countFilterAll").textContent = totalCount;
  document.getElementById("countFilterAttention").textContent = attentionCount;
  document.getElementById("countFilterSafe").textContent = safeCount;

  const banner = document.getElementById("healthAlertBanner");
  const alertIconBox = document.getElementById("alertIconBox");
  const alertTitle = document.getElementById("alertTitle");
  const alertDesc = document.getElementById("alertDesc");
  const alertBadge = document.getElementById("alertBadge");

  if (overdueCount > 0) {
    banner.className = "p-4 rounded-xl border border-rose-200 bg-rose-50/50 text-slate-900 transition-all flex items-center justify-between gap-4";
    alertIconBox.className = "w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0";
    alertIconBox.innerHTML = `
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    `;
    alertTitle.textContent = `Cảnh báo: Có ${overdueCount} lịch chăm sóc đã quá hạn`;
    alertDesc.textContent = "Vui lòng kiểm tra và sắp xếp đưa bé đến cơ sở thú y gần nhất.";
    alertBadge.className = "text-xs font-medium px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 border border-rose-200 whitespace-nowrap";
    alertBadge.textContent = "Quá hạn";
  } else if (dueSoonCount > 0) {
    banner.className = "p-4 rounded-xl border border-amber-200 bg-amber-50/50 text-slate-900 transition-all flex items-center justify-between gap-4";
    alertIconBox.className = "w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0";
    alertIconBox.innerHTML = `
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    `;
    alertTitle.textContent = `Nhắc nhở: Có ${dueSoonCount} lịch sắp đến hạn trong 7 ngày tới`;
    alertDesc.textContent = "Kiểm tra lịch hẹn để chuẩn bị thời gian thực hiện đúng ngày.";
    alertBadge.className = "text-xs font-medium px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap";
    alertBadge.textContent = "Sắp đến hạn";
  } else {
    banner.className = "p-4 rounded-xl border border-slate-200 bg-white text-slate-900 transition-all flex items-center justify-between gap-4";
    alertIconBox.className = "w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0";
    alertIconBox.innerHTML = `
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    `;
    alertTitle.textContent = "Lịch trình chăm sóc của bé đang an toàn";
    alertDesc.textContent = "Tất cả các mũi tiêm và cữ thuốc định kỳ đều được duy trì đúng thời hạn.";
    alertBadge.className = "text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap";
    alertBadge.textContent = "An toàn";
  }
}

function renderVaccines() {
  const container = document.getElementById("vaccineList");
  container.innerHTML = "";

  const filter = state.currentFilter;
  const filteredList = state.vaccines.filter(v => {
    const info = getVaccineStatus(v.nextDate);
    if (filter === "attention") return info.status === "overdue" || info.status === "due-soon";
    if (filter === "safe") return info.status === "safe";
    return true;
  });

  if (filteredList.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-slate-400 bg-slate-50/60 rounded-lg border border-dashed border-slate-200">
        <p class="text-xs">Không có lịch tiêm nào trong mục này.</p>
      </div>
    `;
    return;
  }

  filteredList.forEach(v => {
    const info = getVaccineStatus(v.nextDate);

    let statusBadgeHtml = "";
    let borderClass = "border-slate-200";

    if (info.status === "overdue") {
      borderClass = "border-rose-200 bg-rose-50/30";
      statusBadgeHtml = `
        <span class="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
          <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Quá hạn ${info.daysLeft} ngày
        </span>
      `;
    } else if (info.status === "due-soon") {
      borderClass = "border-amber-200 bg-amber-50/30";
      statusBadgeHtml = `
        <span class="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Còn ${info.daysLeft} ngày nữa
        </span>
      `;
    } else {
      borderClass = "border-slate-200";
      statusBadgeHtml = `
        <span class="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Còn ${info.daysLeft} ngày
        </span>
      `;
    }

    const itemCard = document.createElement("div");
    itemCard.className = `p-4 rounded-lg bg-white border ${borderClass} space-y-2.5 transition`;
    itemCard.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <div class="space-y-0.5">
          <h4 class="font-semibold text-xs text-slate-900">${v.name}</h4>
          <p class="text-[11px] text-slate-500">Chu kỳ lặp lại: <strong>${v.cycleMonths} tháng</strong></p>
        </div>
        ${statusBadgeHtml}
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded border border-slate-100">
        <div>
          <span class="text-slate-400 block text-[10px]">Ngày gần nhất:</span>
          <span class="font-medium text-slate-700">${formatDateVN(v.lastDate)}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px]">Hạn tiếp theo:</span>
          <span class="font-semibold ${info.status === 'overdue' ? 'text-rose-600' : 'text-slate-900'}">${formatDateVN(v.nextDate)}</span>
        </div>
      </div>

      ${v.note ? `<p class="text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">Ghi chú: ${v.note}</p>` : ''}

      <div class="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
        <button onclick="handleCompleteVaccine(${v.id})" class="text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded transition flex items-center gap-1.5 border border-slate-200">
          <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          Đã hoàn thành
        </button>
        <button onclick="handleDeleteVaccine(${v.id})" class="text-xs text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-slate-100 transition" title="Xóa lịch này">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>
    `;

    container.appendChild(itemCard);
  });
}

function renderAll() {
  renderPetProfile();
  renderFeeding();
  renderHealthAlerts();
  renderVaccines();
}

// ==========================================
// 5. CÁC HÀM XỬ LÝ SỰ KIỆN (EVENT HANDLERS)
// ==========================================

document.getElementById("btnToggleEditPet").addEventListener("click", () => {
  const form = document.getElementById("petForm");
  const isHidden = form.classList.contains("hidden");

  if (isHidden) {
    form.classList.remove("hidden");
    document.getElementById("btnToggleEditPet").textContent = "Đóng";
  } else {
    form.classList.add("hidden");
    document.getElementById("btnToggleEditPet").textContent = "Sửa hồ sơ";
  }
});

document.getElementById("btnCancelEditPet").addEventListener("click", () => {
  document.getElementById("petForm").classList.add("hidden");
  document.getElementById("btnToggleEditPet").textContent = "Sửa hồ sơ";
});

document.getElementById("petForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("inputPetName").value.trim();
  const species = document.getElementById("selectSpecies").value;
  const gender = document.getElementById("selectGender").value;
  const birthDate = document.getElementById("inputBirthDate").value;
  const weight = parseFloat(document.getElementById("inputWeight").value);
  const avatarFile = document.getElementById("inputAvatarFile").files[0];

  if (!name) {
    alert("Vui lòng nhập tên cho bé cưng!");
    return;
  }

  if (isNaN(weight) || weight <= 0) {
    alert("Vui lòng nhập cân nặng hợp lệ lớn hơn 0!");
    return;
  }

  if (avatarFile) {
    const reader = new FileReader();
    reader.onload = function (event) {
      state.pet = {
        name,
        species,
        gender,
        birthDate,
        weight,
        avatar: event.target.result
      };
      saveState();
      renderAll();
      document.getElementById("petForm").classList.add("hidden");
      document.getElementById("btnToggleEditPet").textContent = "Sửa hồ sơ";
    };
    reader.readAsDataURL(avatarFile);
  } else {
    // Nếu đổi loài và đang dùng ảnh mẫu mặc định thì tự động đổi ảnh mẫu sang loài tương ứng
    let currentAvatar = state.pet.avatar;
    if (currentAvatar === CAT_AVATAR || currentAvatar === DOG_AVATAR || !currentAvatar) {
      currentAvatar = species === "Mèo" ? CAT_AVATAR : DOG_AVATAR;
    }

    state.pet = {
      ...state.pet,
      name,
      species,
      gender,
      birthDate,
      weight,
      avatar: currentAvatar
    };
    saveState();
    renderAll();
    document.getElementById("petForm").classList.add("hidden");
    document.getElementById("btnToggleEditPet").textContent = "Sửa hồ sơ";
  }
});

document.getElementById("selectLifeStage").addEventListener("change", function (e) {
  state.feeding.lifeStage = e.target.value;
  saveState();
  renderFeeding();
});

document.getElementById("btnToggleAddVaccine").addEventListener("click", () => {
  const form = document.getElementById("vaccineForm");
  const isHidden = form.classList.contains("hidden");

  if (isHidden) {
    form.classList.remove("hidden");
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("inputLastDate").value = today;
  } else {
    form.classList.add("hidden");
  }
});

document.getElementById("btnCancelAddVaccine").addEventListener("click", () => {
  document.getElementById("vaccineForm").classList.add("hidden");
});

document.getElementById("vaccineForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("inputVaccineName").value.trim();
  const lastDate = document.getElementById("inputLastDate").value;
  const cycleMonths = parseInt(document.getElementById("selectCycleMonths").value, 10);
  const note = document.getElementById("inputVaccineNote").value.trim();

  if (!name) {
    alert("Vui lòng nhập tên dịch vụ chăm sóc!");
    return;
  }

  if (!lastDate) {
    alert("Vui lòng chọn ngày thực hiện gần nhất!");
    return;
  }

  const nextDate = calculateNextDate(lastDate, cycleMonths);

  const newVaccine = {
    id: Date.now(),
    name,
    lastDate,
    nextDate,
    cycleMonths,
    note
  };

  state.vaccines.push(newVaccine);
  saveState();
  renderAll();

  this.reset();
  document.getElementById("vaccineForm").classList.add("hidden");
});

window.handleCompleteVaccine = function (id) {
  const item = state.vaccines.find(v => v.id === id);
  if (!item) return;

  const todayStr = new Date().toISOString().split("T")[0];
  const newNextDate = calculateNextDate(todayStr, item.cycleMonths);

  item.lastDate = todayStr;
  item.nextDate = newNextDate;

  saveState();
  renderAll();
};

window.handleDeleteVaccine = function (id) {
  const item = state.vaccines.find(v => v.id === id);
  if (!item) return;

  const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa lịch "${item.name}" không?`);
  if (confirmDelete) {
    state.vaccines = state.vaccines.filter(v => v.id !== id);
    saveState();
    renderAll();
  }
};

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".filter-btn").forEach(b => {
      b.classList.remove("active", "bg-slate-900", "text-white");
      b.classList.add("bg-slate-100", "text-slate-600");
    });

    this.classList.add("active", "bg-slate-900", "text-white");
    this.classList.remove("bg-slate-100", "text-slate-600");

    state.currentFilter = this.getAttribute("data-filter");
    renderVaccines();
  });
});

document.getElementById("btnResetDemo").addEventListener("click", () => {
  const ok = confirm("Bạn có muốn nạp lại dữ liệu mẫu của bé Bơ để trải nghiệm thử không?");
  if (ok) {
    state.pet = { ...DEFAULT_PET };
    state.feeding = { ...DEFAULT_FEEDING };
    state.vaccines = JSON.parse(JSON.stringify(DEFAULT_VACCINES));
    saveState();
    renderAll();
  }
});

// Khởi chạy khi tải trang
window.addEventListener("DOMContentLoaded", () => {
  initData();
  renderAll();
});
