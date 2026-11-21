/**
 * ==============================================================================
 * PawCare — Sổ Sức Khỏe & Quản Lý Hồ Sơ Thú Cưng
 * File JavaScript: app.js
 * Hỗ trợ đa hồ sơ thú cưng, màn hình chọn bạn nhỏ (Profile Switcher) chuẩn thiết kế
 * ==============================================================================
 */

// Ảnh đại diện mẫu chất lượng cao
const DOG_BEAGLE_AVATAR = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&auto=format&fit=crop&q=80";
const CAT_ALN_AVATAR = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&auto=format&fit=crop&q=80";
const DOG_CORGI_AVATAR = "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&auto=format&fit=crop&q=80";

// Thông tin tài khoản người dùng mặc định
const DEFAULT_USER = {
  email: "thinhle@pawcare.vn",
  name: "Thịnh Lê",
  role: "Pet Parent",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
};

// ==========================================
// 1. DỮ LIỆU BAN ĐẦU THEO HÌNH ẢNH MẪU
// ==========================================
const DEFAULT_PETS = [
  {
    id: "pet-bo-map",
    name: "Bơ Mập",
    species: "Chó",
    breed: "Chó Poodle",
    gender: "Đực",
    birthDate: "2024-03-15", // ~2 tuổi
    weight: 4.5,
    avatar: DOG_BEAGLE_AVATAR,
    lifeStage: "adult",
    vaccines: [
      {
        id: 101,
        name: "Tiêm phòng dại (Rabies)",
        lastDate: "2024-05-10",
        nextDate: "2025-05-10",
        cycleMonths: 12,
        note: "Bệnh viện Thú y PetCare, số lô #R-2024"
      },
      {
        id: 102,
        name: "Tiêm mũi tổng hợp 7 bệnh (DHPPi/L4)",
        lastDate: "2024-06-15",
        nextDate: "2025-06-15",
        cycleMonths: 12,
        note: "Phòng ngừa care, parvo, viêm gan truyền nhiễm"
      },
      {
        id: 103,
        name: "Tẩy giun định kỳ",
        lastDate: "2024-10-01",
        nextDate: "2025-01-01",
        cycleMonths: 3,
        note: "Thuốc tẩy giun dạng viên nén trộn thức ăn"
      },
      {
        id: 104,
        name: "Nhỏ gáy phòng ve rận & bọ chét",
        lastDate: "2024-11-01",
        nextDate: "2024-12-01",
        cycleMonths: 1,
        note: "Nhỏ dọc sống lưng sau gáy, kiêng tắm 2 ngày"
      }
    ]
  },
  {
    id: "pet-miu-miu",
    name: "Miu Miu",
    species: "Mèo",
    breed: "Mèo ALN",
    gender: "Cái",
    birthDate: "2024-09-10", // ~1.5 tuổi
    weight: 3.6,
    avatar: CAT_ALN_AVATAR,
    lifeStage: "adult",
    vaccines: [
      {
        id: 201,
        name: "Tiêm mũi tổng hợp 4 bệnh (FVRCP)",
        lastDate: "2024-07-20",
        nextDate: "2025-07-20",
        cycleMonths: 12,
        note: "Phòng ngừa giảm bạch cầu, viêm mũi khí quản"
      },
      {
        id: 202,
        name: "Tẩy giun định kỳ",
        lastDate: "2024-10-15",
        nextDate: "2025-01-15",
        cycleMonths: 3,
        note: "Thuốc tẩy giun dạng viên"
      }
    ]
  },
  {
    id: "pet-banh-bao",
    name: "Bánh Bao",
    species: "Chó",
    breed: "Chó Corgi",
    gender: "Đực",
    birthDate: "2025-03-01", // ~8 tháng
    weight: 7.2,
    avatar: DOG_CORGI_AVATAR,
    lifeStage: "kitten",
    vaccines: [
      {
        id: 301,
        name: "Tiêm mũi 3 tổng hợp (Puppy)",
        lastDate: "2024-08-10",
        nextDate: "2025-08-10",
        cycleMonths: 12,
        note: "Hoàn tất phác đồ tiêm mũi con"
      },
      {
        id: 302,
        name: "Tiêm phòng dại",
        lastDate: "2024-09-01",
        nextDate: "2025-09-01",
        cycleMonths: 12,
        note: "Kiêng tắm 3 ngày sau tiêm"
      }
    ]
  }
];

// ==========================================
// 2. STATE ỨNG DỤNG & LOCALSTORAGE
// ==========================================
let state = {
  pets: [],
  activePetId: null,
  currentFilter: "all",
  isManageMode: false,
  isLoggedIn: false,
  currentUser: null
};

function initData() {
  const savedPets = localStorage.getItem("pawcare_pets_v2");
  const savedActiveId = localStorage.getItem("pawcare_active_pet_id");
  const savedAuth = localStorage.getItem("pawcare_is_logged_in");
  const savedUser = localStorage.getItem("pawcare_current_user");

  state.isLoggedIn = savedAuth === "true";

  if (savedUser) {
    try {
      state.currentUser = JSON.parse(savedUser);
    } catch (e) {
      state.currentUser = { ...DEFAULT_USER };
    }
  } else {
    state.currentUser = { ...DEFAULT_USER };
  }

  if (savedPets) {
    try {
      state.pets = JSON.parse(savedPets);
    } catch (e) {
      state.pets = JSON.parse(JSON.stringify(DEFAULT_PETS));
    }
  } else {
    state.pets = JSON.parse(JSON.stringify(DEFAULT_PETS));
    saveState();
  }

  // Nếu có ID lưu trước đó thì gán, nếu không để null (hiện màn hình chọn)
  state.activePetId = savedActiveId || null;
}

function saveState() {
  localStorage.setItem("pawcare_pets_v2", JSON.stringify(state.pets));
  localStorage.setItem("pawcare_is_logged_in", state.isLoggedIn ? "true" : "false");
  if (state.currentUser) {
    localStorage.setItem("pawcare_current_user", JSON.stringify(state.currentUser));
  }
  if (state.activePetId) {
    localStorage.setItem("pawcare_active_pet_id", state.activePetId);
  } else {
    localStorage.removeItem("pawcare_active_pet_id");
  }
}

/**
 * Cập nhật giao diện thông tin tài khoản người dùng
 */
function updateUserUI() {
  const user = state.currentUser || DEFAULT_USER;
  const nameEl = document.getElementById("headerUserName");
  const roleEl = document.getElementById("headerUserRole");
  const avatarEl = document.getElementById("headerUserAvatar");
  const familyTitle = document.getElementById("familyWidgetTitle");
  const familyAvatar = document.getElementById("familyWidgetAvatar");

  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.role || "Pet Parent";
  if (avatarEl && user.avatar) avatarEl.src = user.avatar;
  if (familyTitle) familyTitle.textContent = `Gia đình ${user.name}`;
  if (familyAvatar && user.avatar) familyAvatar.src = user.avatar;

  const inputEmail = document.getElementById("loginUsername");
  if (inputEmail && user.email) {
    inputEmail.value = user.email;
  }
}

/**
 * Xử lý đăng nhập và lưu thông tin tài khoản vào LocalStorage
 */
function handleUserLogin(email, customName = null) {
  let displayName = customName;
  if (!displayName) {
    if (email === "thinhle@pawcare.vn" || email.includes("thinhle")) {
      displayName = "Thịnh Lê";
    } else {
      const part = email.split("@")[0];
      displayName = part.charAt(0).toUpperCase() + part.slice(1);
    }
  }

  state.currentUser = {
    email: email || "thinhle@pawcare.vn",
    name: displayName || "Thịnh Lê",
    role: "Pet Parent",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
  };
  state.isLoggedIn = true;
  state.activePetId = null; // Luôn bắt đầu từ Bước 2: Chọn thú cưng theo đúng thứ tự!

  saveState();
  updateUserUI();
  showSelectionScreen();
}

function getCurrentPet() {
  return state.pets.find(p => p.id === state.activePetId) || state.pets[0];
}

// ==========================================
// 3. LOGIC TÍNH TOÁN & THỜI GIAN
// ==========================================

function formatShortAge(birthDateString) {
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
    return `${diffDays} ngày`;
  }

  if (years === 0) {
    return `${months} tháng`;
  }

  if (months === 6) {
    return `${years}.5 tuổi`;
  }

  if (months > 0) {
    return `${years} tuổi ${months} th`;
  }

  return `${years} tuổi`;
}

function calculateAgeFull(birthDateString) {
  if (!birthDateString) return "Chưa rõ tuổi";
  return formatShortAge(birthDateString);
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
  } else if (diffDays <= 14) {
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
// 4. CHUYỂN ĐỔI GIAO DIỆN (VIEW SWITCHER)
// Thứ tự luồng nghiêm ngặt:
// Bước 1: Đăng nhập -> Bước 2: Chọn thú cưng -> Bước 3: Hồ sơ thú cưng
// ==========================================

/**
 * BƯỚC 1: Hiển thị Màn hình Đăng nhập (Login Screen)
 */
function showLoginScreen() {
  state.isLoggedIn = false;
  state.activePetId = null;
  state.isManageMode = false;
  saveState();

  const viewLogin = document.getElementById("viewLogin");
  const viewSelection = document.getElementById("viewPetSelection");
  const viewDetail = document.getElementById("viewPetDetail");
  const headerUser = document.getElementById("headerUserSection");

  if (viewLogin) viewLogin.classList.remove("hidden");
  if (viewSelection) viewSelection.classList.add("hidden");
  if (viewDetail) viewDetail.classList.add("hidden");
  if (headerUser) headerUser.classList.add("hidden");

  updateUserUI();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * BƯỚC 2: Hiển thị Màn hình Chọn bạn nhỏ (Pet Selection Screen)
 */
function showSelectionScreen() {
  if (!state.isLoggedIn) {
    showLoginScreen();
    return;
  }

  const viewLogin = document.getElementById("viewLogin");
  const viewSelection = document.getElementById("viewPetSelection");
  const viewDetail = document.getElementById("viewPetDetail");
  const headerUser = document.getElementById("headerUserSection");

  if (viewLogin) viewLogin.classList.add("hidden");
  if (viewSelection) viewSelection.classList.remove("hidden");
  if (viewDetail) viewDetail.classList.add("hidden");
  if (headerUser) headerUser.classList.remove("hidden");

  state.activePetId = null;
  state.isManageMode = false;
  saveState();
  updateUserUI();
  renderPetGrid();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * BƯỚC 3: Chọn 1 bé và mở Màn hình Chi tiết sức khỏe (Pet Detail Dashboard)
 */
function selectPetAndShowDetail(petId) {
  if (!state.isLoggedIn) {
    showLoginScreen();
    return;
  }

  state.activePetId = petId;
  state.isManageMode = false;
  saveState();

  const viewLogin = document.getElementById("viewLogin");
  const viewSelection = document.getElementById("viewPetSelection");
  const viewDetail = document.getElementById("viewPetDetail");
  const headerUser = document.getElementById("headerUserSection");

  if (viewLogin) viewLogin.classList.add("hidden");
  if (viewSelection) viewSelection.classList.add("hidden");
  if (viewDetail) viewDetail.classList.remove("hidden");
  if (headerUser) headerUser.classList.remove("hidden");

  updateUserUI();
  renderPetDetailView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==========================================
// 5. RENDER MÀN HÌNH CHỌN BẠN NHỎ (PET SELECTION)
// ==========================================

function renderPetGrid() {
  const container = document.getElementById("petGrid");
  container.innerHTML = "";

  // Cập nhật trạng thái nút Chế độ quản lý hồ sơ (Vị trí 4)
  const btnManage = document.getElementById("btnToggleManageMode");
  const txtManage = document.getElementById("txtManageMode");
  const iconManage = document.getElementById("iconManageMode");

  if (state.isManageMode) {
    txtManage.textContent = "Hoàn tất";
    btnManage.className = "text-xs font-semibold px-3.5 py-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition flex items-center gap-1.5 shadow-xs";
    iconManage.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />`;
  } else {
    txtManage.textContent = "Quản lý hồ sơ";
    btnManage.className = "text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs";
    iconManage.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />`;
  }

  state.pets.forEach(pet => {
    const isSelected = pet.id === state.activePetId;
    const ringClass = isSelected
      ? "ring-4 ring-pawgreen-600/30 border-2 border-pawgreen-600 scale-105"
      : "border-2 border-slate-200/80 hover:border-pawgreen-600 hover:scale-105";

    // VỊ TRÍ 4: Nút X chỉ hiển thị khi bật Chế độ Quản lý!
    const deleteButtonHtml = state.isManageMode
      ? `
        <button onclick="handleDeletePet(event, '${pet.id}')" title="Xóa hồ sơ ${pet.name}" class="absolute top-0 right-0 w-7 h-7 rounded-full bg-rose-500 hover:bg-rose-600 text-white border-2 border-white shadow-md flex items-center justify-center transition scale-100 hover:scale-110 z-20">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      `
      : "";

    const petCol = document.createElement("div");
    petCol.className = `relative flex flex-col items-center cursor-pointer group text-center transition ${state.isManageMode ? 'hover:scale-95' : ''}`;

    petCol.innerHTML = `
      <div class="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-white shadow-sm transition duration-200 ${ringClass}">
        <img src="${pet.avatar || DOG_BEAGLE_AVATAR}" alt="${pet.name}" class="w-full h-full rounded-full object-cover">
        ${deleteButtonHtml}
      </div>

      <h3 class="font-bold text-base text-slate-900 mt-3 group-hover:text-pawgreen-700 transition">
        ${pet.name}
      </h3>
      <p class="text-xs text-slate-400 font-medium">
        ${pet.breed || pet.species} • ${formatShortAge(pet.birthDate)}
      </p>
    `;

    // Click vào card: Nếu đang ở chế độ quản lý thì bấm vào pet cũng hỏi xóa, nếu bình thường thì mở chi tiết
    petCol.onclick = (e) => {
      if (e.target.closest("button")) return;
      if (state.isManageMode) {
        handleDeletePet(e, pet.id);
        return;
      }
      selectPetAndShowDetail(pet.id);
    };

    container.appendChild(petCol);
  });

  // Nút "+ Thêm thú cưng" (Hồ sơ mới) theo hình mẫu
  const addBtnCol = document.createElement("div");
  addBtnCol.className = "flex flex-col items-center cursor-pointer group text-center transition";
  addBtnCol.onclick = openModalAddPet;

  addBtnCol.innerHTML = `
    <div class="w-28 h-28 sm:w-32 sm:h-32 rounded-full circle-dashed-border flex items-center justify-center bg-slate-50/50 hover:bg-pawgreen-50/50 transition">
      <span class="text-3xl font-light text-slate-400 group-hover:text-pawgreen-700 transition">+</span>
    </div>
    <h3 class="font-bold text-base text-slate-700 mt-3 group-hover:text-pawgreen-700 transition">
      + Thêm thú cưng
    </h3>
    <p class="text-xs text-slate-400 font-medium">
      Hồ sơ mới
    </p>
  `;

  container.appendChild(addBtnCol);
}

// ==========================================
// 6. RENDER MÀN HÌNH CHI TIẾT SỨC KHỎE CỦA PET
// ==========================================

function renderPetDetailView() {
  const pet = getCurrentPet();
  if (!pet) return;

  // Cập nhật nhãn tên ở thanh điều hướng trên cùng
  document.getElementById("badgeCurrentPetName").textContent = `🐾 ${pet.name}`;

  // 1. Thẻ hồ sơ thú cưng
  document.getElementById("displayPetName").textContent = pet.name;
  document.getElementById("displayPetBreed").textContent = pet.breed ? `(${pet.breed})` : "";
  document.getElementById("displaySpeciesBadge").textContent = pet.species;
  document.getElementById("displayPetGender").textContent = pet.gender;
  document.getElementById("displayPetAge").textContent = calculateAgeFull(pet.birthDate);
  document.getElementById("displayPetWeight").textContent = pet.weight;

  if (pet.avatar) {
    document.getElementById("displayPetAvatar").src = pet.avatar;
  }

  // Điền sẵn dữ liệu vào form sửa
  document.getElementById("inputPetName").value = pet.name || "";
  document.getElementById("selectSpecies").value = pet.species || "Chó";
  document.getElementById("inputBreed").value = pet.breed || "";
  document.getElementById("selectGender").value = pet.gender || "Đực";
  document.getElementById("inputBirthDate").value = pet.birthDate || "";
  document.getElementById("inputWeight").value = pet.weight || "";

  // 2. Bàn tính khẩu phần ăn
  document.getElementById("selectLifeStage").value = pet.lifeStage || "adult";
  const feedingResult = calculateFeeding(pet.species, pet.weight, pet.lifeStage);

  document.getElementById("calcFoodGram").textContent = `${feedingResult.foodGram} g`;
  document.getElementById("calcMealBreakdown").textContent = `~ ${feedingResult.perMealGram} g / bữa (${feedingResult.mealsCount} bữa/ngày)`;
  document.getElementById("calcWaterMl").textContent = `${feedingResult.waterMl} ml`;

  // 3. Banner Cảnh báo Y tế & 3 Thẻ Dashboard
  const vaccines = pet.vaccines || [];
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

  // Cập nhật huy hiệu Tình trạng sức khỏe của Pet (Khỏe mạnh / Chú Ý)
  const healthBadge = document.getElementById("displayPetHealthBadge");
  if (healthBadge) {
    if (attentionCount === 0) {
      healthBadge.className = "px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium inline-flex items-center gap-1.5 transition";
      healthBadge.innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        Khỏe mạnh
      `;
    } else {
      healthBadge.className = "px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-300 font-bold inline-flex items-center gap-1.5 transition shadow-2xs";
      healthBadge.innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
        Chú Ý
      `;
    }
  }

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
    banner.className = "p-4 rounded-xl border border-rose-200/80 bg-rose-50/40 text-slate-900 transition-all flex items-center justify-between gap-4";
    alertIconBox.className = "w-9 h-9 rounded-lg bg-rose-100/70 text-rose-600 flex items-center justify-center flex-shrink-0";
    alertIconBox.innerHTML = `
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    `;
    alertTitle.textContent = `Cảnh báo: Có ${overdueCount} lịch chăm sóc của ${pet.name} đã quá hạn`;
    alertDesc.textContent = "Vui lòng kiểm tra và sắp xếp đưa bé đến cơ sở thú y gần nhất.";
    alertBadge.className = "text-xs font-medium px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200/70 whitespace-nowrap";
    alertBadge.textContent = "Quá hạn";
  } else if (dueSoonCount > 0) {
    banner.className = "p-4 rounded-xl border border-amber-200/80 bg-amber-50/40 text-slate-900 transition-all flex items-center justify-between gap-4";
    alertIconBox.className = "w-9 h-9 rounded-lg bg-amber-100/70 text-amber-700 flex items-center justify-center flex-shrink-0";
    alertIconBox.innerHTML = `
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    `;
    alertTitle.textContent = `Nhắc nhở: Có ${dueSoonCount} lịch sắp đến hạn trong 14 ngày tới`;
    alertDesc.textContent = `Kiểm tra lịch hẹn để chuẩn bị thời gian đưa ${pet.name} đi tiêm đúng ngày.`;
    alertBadge.className = "text-xs font-medium px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70 whitespace-nowrap";
    alertBadge.textContent = "Sắp đến hạn";
  } else {
    banner.className = "p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/30 text-slate-900 transition-all flex items-center justify-between gap-4";
    alertIconBox.className = "w-9 h-9 rounded-lg bg-emerald-100/70 text-emerald-600 flex items-center justify-center flex-shrink-0";
    alertIconBox.innerHTML = `
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    `;
    alertTitle.textContent = `Lịch trình chăm sóc của ${pet.name} đang an toàn`;
    alertDesc.textContent = "Tất cả các mũi tiêm và cữ thuốc định kỳ đều được duy trì đúng thời hạn.";
    alertBadge.className = "text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 whitespace-nowrap";
    alertBadge.textContent = "An toàn";
  }

  // 4. Danh sách Sổ tiêm chủng Timeline
  renderVaccinesList();
}

function renderVaccinesList() {
  const pet = getCurrentPet();
  const container = document.getElementById("vaccineList");
  container.innerHTML = "";

  const filter = state.currentFilter;
  const list = pet.vaccines || [];
  const filteredList = list.filter(v => {
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
    let borderClass = "";
    let nextDateTextColor = "";
    let btnCompleteHtml = "";

    if (info.status === "overdue") {
      // 1. Quá hạn -> Pastel Đỏ (Rose)
      borderClass = "border-2 border-rose-200/90 bg-rose-50/20 hover:border-rose-300";
      nextDateTextColor = "text-rose-500 font-semibold";
      statusBadgeHtml = `
        <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/70">
          <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          Quá hạn ${info.daysLeft} ngày
        </span>
      `;
      btnCompleteHtml = `
        <button onclick="handleCompleteVaccine(${v.id})" class="text-xs font-medium text-slate-700 hover:text-slate-900 bg-transparent hover:bg-slate-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 border border-slate-300 shadow-2xs cursor-pointer" title="Đánh dấu hoàn thành lịch này">
          Hoàn thành
        </button>
      `;
    } else if (info.status === "due-soon") {
      // 2. Gần đến hạn -> Pastel Vàng/Cam (Amber)
      borderClass = "border-2 border-amber-200/90 bg-amber-50/20 hover:border-amber-300";
      nextDateTextColor = "text-amber-600 font-semibold";
      const daysText = info.daysLeft === 0 ? "Hôm nay" : `Còn ${info.daysLeft} ngày`;
      statusBadgeHtml = `
        <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          Gần đến hạn • ${daysText}
        </span>
      `;
      btnCompleteHtml = `
        <button onclick="handleCompleteVaccine(${v.id})" class="text-xs font-medium text-slate-700 hover:text-slate-900 bg-transparent hover:bg-slate-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 border border-slate-300 shadow-2xs cursor-pointer" title="Đánh dấu hoàn thành lịch này">
          Hoàn thành
        </button>
      `;
    } else {
      // 3. Đã hoàn thành / An toàn -> Pastel Xanh lá (Emerald / Mint)
      borderClass = "border-2 border-emerald-200/90 bg-emerald-50/20 hover:border-emerald-300";
      nextDateTextColor = "text-emerald-700 font-semibold";
      statusBadgeHtml = `
        <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
          <svg class="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          Đã hoàn thành • Còn ${info.daysLeft} ngày
        </span>
      `;
      btnCompleteHtml = `
        <button onclick="handleCompleteVaccine(${v.id})" class="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer" title="Đã hoàn thành • Bấm để hoàn tác nếu cần">
          <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          Đã hoàn thành
        </button>
      `;
    }

    const itemCard = document.createElement("div");
    itemCard.className = `p-4 rounded-xl bg-white border ${borderClass} space-y-3 transition-all`;
    itemCard.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <div class="space-y-0.5">
          <h4 class="font-bold text-sm text-slate-900">${v.name}</h4>
          <p class="text-xs text-slate-500">Chu kỳ lặp lại: <strong class="text-slate-700">${v.cycleMonths} tháng</strong></p>
        </div>
        ${statusBadgeHtml}
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-3 rounded-lg border border-slate-100">
        <div>
          <span class="text-slate-400 block text-[11px] font-medium">Ngày gần nhất:</span>
          <span class="font-semibold text-slate-700">${formatDateVN(v.lastDate)}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px] font-medium">Hạn tiếp theo:</span>
          <span class="${nextDateTextColor}">${formatDateVN(v.nextDate)}</span>
        </div>
      </div>

      ${v.note ? `<p class="text-xs text-slate-600 bg-slate-50/90 px-3 py-1.5 rounded-lg border border-slate-200">Ghi chú: ${v.note}</p>` : ''}

      <div class="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
        ${btnCompleteHtml}
        <button onclick="handleDeleteVaccine(${v.id})" class="text-xs text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition" title="Xóa lịch này">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>
    `;

    container.appendChild(itemCard);
  });
}

// ==========================================
// 7. CÁC HÀM XỬ LÝ SỰ KIỆN (EVENT LISTENERS)
// ==========================================

// Điều hướng Logo PawCare
document.getElementById("navLogoBtn").addEventListener("click", (e) => {
  e.preventDefault();
  if (state.isLoggedIn) {
    showSelectionScreen();
  } else {
    showLoginScreen();
  }
});

// Điều hướng trở về Chọn thú cưng từ màn hình chi tiết
document.getElementById("btnBackToSelection").addEventListener("click", showSelectionScreen);

// Đăng xuất tài khoản
const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    showLoginScreen();
  });
}

// Xử lý Form đăng nhập
const formLogin = document.getElementById("formLogin");
if (formLogin) {
  formLogin.addEventListener("submit", function(e) {
    e.preventDefault();
    const email = document.getElementById("loginUsername").value.trim();
    handleUserLogin(email);
  });
}

// Đăng nhập nhanh bằng tài khoản mẫu
const btnQuickDemoLogin = document.getElementById("btnQuickDemoLogin");
if (btnQuickDemoLogin) {
  btnQuickDemoLogin.addEventListener("click", function() {
    handleUserLogin("thinhle@pawcare.vn", "Thịnh Lê");
  });
}

// Bật / Tắt chế độ Quản lý hồ sơ (Vị trí 4)
document.getElementById("btnToggleManageMode").addEventListener("click", () => {
  state.isManageMode = !state.isManageMode;
  renderPetGrid();
});

// Modal thêm thú cưng mới
function openModalAddPet() {
  document.getElementById("modalAddPet").classList.remove("hidden");
  document.getElementById("newPetName").focus();
}

function closeModalAddPet() {
  document.getElementById("modalAddPet").classList.add("hidden");
  document.getElementById("formAddPet").reset();
}

document.getElementById("btnCloseModalAddPet").addEventListener("click", closeModalAddPet);
document.getElementById("btnCancelModalAddPet").addEventListener("click", closeModalAddPet);
document.getElementById("modalAddPet").addEventListener("click", (e) => {
  if (e.target.id === "modalAddPet") {
    closeModalAddPet();
  }
});

// Submit form tạo thú cưng mới
document.getElementById("formAddPet").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("newPetName").value.trim();
  const species = document.getElementById("newPetSpecies").value;
  const breed = document.getElementById("newPetBreed").value.trim() || (species === "Chó" ? "Chó Cưng" : "Mèo Cưng");
  const gender = document.getElementById("newPetGender").value;
  const weight = parseFloat(document.getElementById("newPetWeight").value);
  const birthDate = document.getElementById("newPetBirthDate").value;
  const avatarFile = document.getElementById("newPetAvatarFile").files[0];

  if (!name || isNaN(weight) || weight <= 0) {
    alert("Vui lòng nhập tên và cân nặng hợp lệ!");
    return;
  }

  const newId = "pet-" + Date.now();
  const defaultAvatar = species === "Chó" ? DOG_BEAGLE_AVATAR : CAT_ALN_AVATAR;

  const defaultNewVaccines = [
    {
      id: Date.now() + 1,
      name: species === "Chó" ? "Tiêm mũi tổng hợp 7 bệnh" : "Tiêm mũi tổng hợp 4 bệnh",
      lastDate: new Date().toISOString().split("T")[0],
      nextDate: calculateNextDate(new Date().toISOString().split("T")[0], 12),
      cycleMonths: 12,
      note: "Mũi tiêm định kỳ hàng năm"
    },
    {
      id: Date.now() + 2,
      name: "Tẩy giun định kỳ",
      lastDate: new Date().toISOString().split("T")[0],
      nextDate: calculateNextDate(new Date().toISOString().split("T")[0], 3),
      cycleMonths: 3,
      note: "Uống thuốc định kỳ mỗi 3 tháng"
    }
  ];

  if (avatarFile) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const newPet = {
        id: newId,
        name,
        species,
        breed,
        gender,
        weight,
        birthDate,
        avatar: event.target.result,
        lifeStage: "adult",
        vaccines: defaultNewVaccines
      };
      state.pets.push(newPet);
      saveState();
      closeModalAddPet();
      selectPetAndShowDetail(newId);
    };
    reader.readAsDataURL(avatarFile);
  } else {
    const newPet = {
      id: newId,
      name,
      species,
      breed,
      gender,
      weight,
      birthDate,
      avatar: defaultAvatar,
      lifeStage: "adult",
      vaccines: defaultNewVaccines
    };
    state.pets.push(newPet);
    saveState();
    closeModalAddPet();
    selectPetAndShowDetail(newId);
  }
});

// Toggle Sửa hồ sơ
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

// Submit Sửa hồ sơ thú cưng hiện tại
document.getElementById("petForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const pet = getCurrentPet();
  if (!pet) return;

  const name = document.getElementById("inputPetName").value.trim();
  const species = document.getElementById("selectSpecies").value;
  const breed = document.getElementById("inputBreed").value.trim();
  const gender = document.getElementById("selectGender").value;
  const birthDate = document.getElementById("inputBirthDate").value;
  const weight = parseFloat(document.getElementById("inputWeight").value);
  const avatarFile = document.getElementById("inputAvatarFile").files[0];

  if (!name || isNaN(weight) || weight <= 0) {
    alert("Vui lòng nhập đầy đủ thông tin hợp lệ!");
    return;
  }

  if (avatarFile) {
    const reader = new FileReader();
    reader.onload = function(event) {
      pet.name = name;
      pet.species = species;
      pet.breed = breed;
      pet.gender = gender;
      pet.birthDate = birthDate;
      pet.weight = weight;
      pet.avatar = event.target.result;
      saveState();
      renderPetDetailView();
      document.getElementById("petForm").classList.add("hidden");
      document.getElementById("btnToggleEditPet").textContent = "Sửa hồ sơ";
    };
    reader.readAsDataURL(avatarFile);
  } else {
    pet.name = name;
    pet.species = species;
    pet.breed = breed;
    pet.gender = gender;
    pet.birthDate = birthDate;
    pet.weight = weight;
    saveState();
    renderPetDetailView();
    document.getElementById("petForm").classList.add("hidden");
    document.getElementById("btnToggleEditPet").textContent = "Sửa hồ sơ";
  }
});

// Xóa hồ sơ thú cưng từ Màn hình 1 (Chọn bạn nhỏ)
window.handleDeletePet = function(event, petId) {
  if (event) {
    event.stopPropagation();
  }

  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;

  if (state.pets.length <= 1) {
    alert(`Không thể xóa bạn nhỏ cuối cùng (${pet.name})! Danh sách cần có tối thiểu 1 hồ sơ để quản lý.`);
    return;
  }

  const ok = confirm(`Bạn có chắc chắn muốn xóa hồ sơ của bé "${pet.name}" không?\nToàn bộ dữ liệu tiêm chủng, cân nặng và dinh dưỡng của bé sẽ bị xóa.`);
  if (!ok) return;

  state.pets = state.pets.filter(p => p.id !== petId);

  if (state.activePetId === petId) {
    state.activePetId = null;
  }

  saveState();
  renderPetGrid();
};

// Xóa hồ sơ thú cưng hiện tại từ Form sửa hồ sơ (Màn hình 2)
document.getElementById("btnDeleteCurrentPet").addEventListener("click", () => {
  const currentPet = getCurrentPet();
  if (!currentPet) return;

  if (state.pets.length <= 1) {
    alert(`Không thể xóa bạn nhỏ cuối cùng (${currentPet.name})! Danh sách cần có tối thiểu 1 hồ sơ để quản lý.`);
    return;
  }

  const ok = confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn hồ sơ của bé "${currentPet.name}" không?\nToàn bộ dữ liệu sẽ bị xóa hoàn toàn.`);
  if (!ok) return;

  state.pets = state.pets.filter(p => p.id !== currentPet.id);
  state.activePetId = null;
  saveState();
  showSelectionScreen();
});

// Đổi giai đoạn dinh dưỡng
document.getElementById("selectLifeStage").addEventListener("change", function(e) {
  const pet = getCurrentPet();
  if (pet) {
    pet.lifeStage = e.target.value;
    saveState();
    renderPetDetailView();
  }
});

// Modal Popup: Thêm lịch tiêm chủng mới
function openModalAddVaccine() {
  const modal = document.getElementById("modalAddVaccine");
  if (modal) {
    modal.classList.remove("hidden");
    const today = new Date().toISOString().split("T")[0];
    const inputDate = document.getElementById("inputLastDate");
    if (inputDate && !inputDate.value) {
      inputDate.value = today;
    }
    const inputName = document.getElementById("inputVaccineName");
    if (inputName) {
      setTimeout(() => inputName.focus(), 50);
    }
  }
}

function closeModalAddVaccine() {
  const modal = document.getElementById("modalAddVaccine");
  if (modal) {
    modal.classList.add("hidden");
    document.getElementById("vaccineForm").reset();
  }
}

document.getElementById("btnToggleAddVaccine").addEventListener("click", openModalAddVaccine);
document.getElementById("btnCloseModalAddVaccine").addEventListener("click", closeModalAddVaccine);
document.getElementById("btnCancelAddVaccine").addEventListener("click", closeModalAddVaccine);

document.getElementById("modalAddVaccine").addEventListener("click", (e) => {
  if (e.target.id === "modalAddVaccine") {
    closeModalAddVaccine();
  }
});

document.getElementById("vaccineForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const pet = getCurrentPet();
  if (!pet) return;

  const name = document.getElementById("inputVaccineName").value.trim();
  const lastDate = document.getElementById("inputLastDate").value;
  const cycleMonths = parseInt(document.getElementById("selectCycleMonths").value, 10);
  const note = document.getElementById("inputVaccineNote").value.trim();

  if (!name || !lastDate) {
    alert("Vui lòng điền tên dịch vụ và ngày thực hiện!");
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

  if (!pet.vaccines) pet.vaccines = [];
  pet.vaccines.push(newVaccine);
  saveState();
  renderPetDetailView();

  closeModalAddVaccine();
});

// Hoàn thành mũi tiêm (hỗ trợ toggle hoàn tác)
window.handleCompleteVaccine = function(id) {
  const pet = getCurrentPet();
  if (!pet || !pet.vaccines) return;

  const item = pet.vaccines.find(v => v.id === id);
  if (!item) return;

  const info = getVaccineStatus(item.nextDate);

  if (info.status === "safe") {
    // Nếu đã hoàn thành, bấm lại sẽ hoàn tác trở lại trạng thái chưa xong
    if (item._prevLastDate !== undefined && item._prevNextDate !== undefined) {
      item.lastDate = item._prevLastDate;
      item.nextDate = item._prevNextDate;
      delete item._prevLastDate;
      delete item._prevNextDate;
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      item.nextDate = yesterday.toISOString().split("T")[0];
    }
  } else {
    // Khi chưa xong, bấm Hoàn thành sẽ chuyển sang trạng thái đã xong
    item._prevLastDate = item.lastDate;
    item._prevNextDate = item.nextDate;

    const todayStr = new Date().toISOString().split("T")[0];
    const newNextDate = calculateNextDate(todayStr, item.cycleMonths);

    item.lastDate = todayStr;
    item.nextDate = newNextDate;
  }

  saveState();
  renderPetDetailView();
};

// Xoá mũi tiêm
window.handleDeleteVaccine = function(id) {
  const pet = getCurrentPet();
  if (!pet || !pet.vaccines) return;

  const item = pet.vaccines.find(v => v.id === id);
  if (!item) return;

  const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa lịch "${item.name}" không?`);
  if (confirmDelete) {
    pet.vaccines = pet.vaccines.filter(v => v.id !== id);
    saveState();
    renderPetDetailView();
  }
};

// Bộ lọc
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", function() {
    document.querySelectorAll(".filter-btn").forEach(b => {
      b.classList.remove("active", "bg-slate-900", "text-white");
      b.classList.add("bg-slate-100", "text-slate-600");
    });

    this.classList.add("active", "bg-slate-900", "text-white");
    this.classList.remove("bg-slate-100", "text-slate-600");

    state.currentFilter = this.getAttribute("data-filter");
    renderVaccinesList();
  });
});

// ==========================================
// 8. KHỞI TẠO KHI TẢI TRANG
// Thứ tự luồng nghiêm ngặt: 
// Bước 1: Đăng nhập -> Bước 2: Chọn thú cưng -> Bước 3: Hồ sơ thú cưng
// ==========================================
window.addEventListener("DOMContentLoaded", () => {
  initData();

  if (!state.isLoggedIn) {
    // Chưa đăng nhập: Mở ngay màn hình Đăng nhập
    showLoginScreen();
  } else if (state.activePetId) {
    // Đã đăng nhập và đang xem dở 1 pet: Mở chi tiết
    selectPetAndShowDetail(state.activePetId);
  } else {
    // Đã đăng nhập: Mở màn hình Chọn thú cưng
    showSelectionScreen();
  }
});
