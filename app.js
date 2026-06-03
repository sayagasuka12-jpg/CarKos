// Using global DB and initDB from db.js

// --- APPLICATION STATE ---
let state = {
  activeUser: null,
  currentView: 'explore', // 'explore', 'detail', 'dashboard'
  selectedKostId: null,
  filters: {
    query: '',
    campus: '',
    priceMin: null,
    priceMax: null,
    genders: [],
    statuses: [],
    facilities: []
  },
  reviewFormRating: {
    kebersihan: 0,
    keamanan: 0,
    wifi: 0,
    keramahan: 0
  }
};

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Database
  initDB();

  // Load Active User Session if exists
  const savedUser = sessionStorage.getItem("carkos_active_user");
  if (savedUser) {
    state.activeUser = JSON.parse(savedUser);
  }

  // Setup UI Hooks & Event Listeners
  setupNavigation();
  setupFilters();
  setupAuth();
  setupDashboard();
  setupReviews();

  // Initial Render
  renderHeader();
  renderFacilitiesFilters();
  applyFilters();

  // Scroll Header Effect
  window.addEventListener('scroll', () => {
    const header = document.getElementById('mainHeader');
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Setup URL routing via Hash if present
  handleHashRouting();
  window.addEventListener('hashchange', handleHashRouting);
});

// --- HELPER: Trigger Lucide Icons refresh ---
function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// --- ROUTING / NAVIGATION ---
function setupNavigation() {
  const logoLink = document.getElementById('logoLink');
  const navHome = document.getElementById('navHome');
  const btnBackToHome = document.getElementById('btnBackToHome');

  logoLink.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('explore');
  });

  navHome.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('explore');
  });

  btnBackToHome.addEventListener('click', () => {
    switchView('explore');
  });

  // Campus recommendation pills
  document.querySelectorAll('.campus-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const isSelected = pill.classList.contains('active');
      document.querySelectorAll('.campus-pill').forEach(p => p.classList.remove('active'));
      
      if (isSelected) {
        state.filters.campus = '';
        document.getElementById('campusSelect').value = '';
      } else {
        pill.classList.add('active');
        state.filters.campus = pill.getAttribute('data-campus');
        document.getElementById('campusSelect').value = state.filters.campus;
      }
      applyFilters();
    });
  });

  // Main Search Bar Submit
  document.getElementById('btnSearchSubmit').addEventListener('click', () => {
    state.filters.query = document.getElementById('searchQuery').value;
    state.filters.campus = document.getElementById('campusSelect').value;
    
    // Sync recommendations pills styling
    document.querySelectorAll('.campus-pill').forEach(pill => {
      if (pill.getAttribute('data-campus') === state.filters.campus) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    applyFilters();
  });
}

function handleHashRouting() {
  const hash = window.location.hash;
  if (!hash || hash === '#') {
    switchView('explore');
  } else if (hash.startsWith('#kost-')) {
    const id = parseInt(hash.replace('#kost-', ''));
    if (id) {
      state.selectedKostId = id;
      switchView('detail');
    }
  } else if (hash === '#dashboard') {
    if (state.activeUser && (state.activeUser.role === 'pemilik' || state.activeUser.role === 'admin')) {
      switchView('dashboard');
    } else {
      window.location.hash = '';
      switchView('explore');
      showAuthModal();
    }
  }
}

function switchView(viewName) {
  state.currentView = viewName;
  
  // Update views active classes
  const views = ['exploreView', 'detailView', 'dashboardView'];
  views.forEach(v => {
    const el = document.getElementById(v);
    if (v === viewName + 'View') {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  // Update Nav Active States
  const navHome = document.getElementById('navHome');
  if (viewName === 'explore') {
    navHome.classList.add('active');
    window.location.hash = '';
  } else {
    navHome.classList.remove('active');
  }

  // Handle specific view entries
  if (viewName === 'explore') {
    applyFilters();
  } else if (viewName === 'detail') {
    renderKostDetail();
  } else if (viewName === 'dashboard') {
    renderDashboard();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- RENDERING HEADER CONTROLS ---
function renderHeader() {
  const userControls = document.getElementById('userControls');
  
  if (state.activeUser) {
    const initial = state.activeUser.nama.charAt(0);
    const showDashboardLink = state.activeUser.role === 'pemilik' || state.activeUser.role === 'admin';

    userControls.innerHTML = `
      <div class="profile-dropdown" id="profileDropdown">
        <div class="user-profile" id="userProfileBtn">
          <div class="avatar">${initial}</div>
          <span class="user-name">${state.activeUser.nama}</span>
          <i data-lucide="chevron-down" style="width:16px;height:16px;"></i>
        </div>
        <div class="dropdown-menu" id="profileDropdownMenu">
          <div style="padding: 10px 16px; font-size:12px; color:#64748b;">
            Login sebagai: <strong>${state.activeUser.role === 'pemilik' ? 'Pemilik Kos' : state.activeUser.role === 'admin' ? 'Administrator' : 'Pencari Kos'}</strong>
          </div>
          <div class="dropdown-divider"></div>
          ${showDashboardLink ? `<div class="dropdown-item" id="ddDashboard"><i data-lucide="layout-dashboard"></i> Dashboard</div>` : ''}
          <div class="dropdown-item" id="ddHome"><i data-lucide="search"></i> Cari Kos</div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" id="ddLogout" style="color:var(--danger);"><i data-lucide="log-out"></i> Keluar</div>
        </div>
      </div>
    `;

    // Dropdown toggles
    const userProfileBtn = document.getElementById('userProfileBtn');
    const dropdownMenu = document.getElementById('profileDropdownMenu');
    
    userProfileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      dropdownMenu.classList.remove('show');
    });

    // Dropdown actions
    if (showDashboardLink) {
      document.getElementById('ddDashboard').addEventListener('click', () => {
        window.location.hash = '#dashboard';
      });
    }

    document.getElementById('ddHome').addEventListener('click', () => {
      switchView('explore');
    });

    document.getElementById('ddLogout').addEventListener('click', () => {
      sessionStorage.removeItem("carkos_active_user");
      state.activeUser = null;
      window.location.hash = '';
      switchView('explore');
      renderHeader();
    });

  } else {
    userControls.innerHTML = `
      <button class="btn btn-outline btn-sm" id="btnShowLogin">Masuk / Daftar</button>
    `;
    document.getElementById('btnShowLogin').addEventListener('click', showAuthModal);
  }

  refreshIcons();
}

// --- FILTERS FUNCTIONALITY ---
function renderFacilitiesFilters() {
  const container = document.getElementById('facilitiesCheckboxContainer');
  const facilities = DB.facilities.getAll();
  
  container.innerHTML = facilities.map(fac => `
    <label class="checkbox-label">
      <input type="checkbox" name="facilityFilter" value="${fac.id}">
      <span>${fac.nama_fasilitas}</span>
    </label>
  `).join('');

  // Event listeners for facilities checklists
  document.querySelectorAll('input[name="facilityFilter"]').forEach(el => {
    el.addEventListener('change', () => {
      const selected = [];
      document.querySelectorAll('input[name="facilityFilter"]:checked').forEach(c => {
        selected.push(parseInt(c.value));
      });
      state.filters.facilities = selected;
      applyFilters();
    });
  });
}

function setupFilters() {
  // Price limits
  document.getElementById('priceMin').addEventListener('input', (e) => {
    state.filters.priceMin = e.target.value ? parseInt(e.target.value) : null;
    applyFilters();
  });
  document.getElementById('priceMax').addEventListener('input', (e) => {
    state.filters.priceMax = e.target.value ? parseInt(e.target.value) : null;
    applyFilters();
  });

  // Gender selections
  document.querySelectorAll('input[name="genderFilter"]').forEach(el => {
    el.addEventListener('change', () => {
      const selected = [];
      document.querySelectorAll('input[name="genderFilter"]:checked').forEach(c => {
        selected.push(c.value);
      });
      state.filters.genders = selected;
      applyFilters();
    });
  });

  // Status check selectors
  document.querySelectorAll('input[name="statusFilter"]').forEach(el => {
    el.addEventListener('change', () => {
      const selected = [];
      document.querySelectorAll('input[name="statusFilter"]:checked').forEach(c => {
        selected.push(c.value);
      });
      state.filters.statuses = selected;
      applyFilters();
    });
  });

  // Sort changes
  document.getElementById('sortSelect').addEventListener('change', applyFilters);

  // Reset Filters button
  document.getElementById('btnResetFilters').addEventListener('click', () => {
    state.filters = {
      query: '',
      campus: '',
      priceMin: null,
      priceMax: null,
      genders: [],
      statuses: [],
      facilities: []
    };

    // Reset UI Inputs
    document.getElementById('searchQuery').value = '';
    document.getElementById('campusSelect').value = '';
    document.getElementById('priceMin').value = '';
    document.getElementById('priceMax').value = '';
    
    document.querySelectorAll('input[name="genderFilter"]').forEach(c => c.checked = false);
    document.querySelectorAll('input[name="statusFilter"]').forEach(c => c.checked = false);
    document.querySelectorAll('input[name="facilityFilter"]').forEach(c => c.checked = false);
    document.querySelectorAll('.campus-pill').forEach(p => p.classList.remove('active'));
    document.getElementById('sortSelect').value = 'relevance';

    applyFilters();
  });
}

function applyFilters() {
  let list = DB.kosts.getAll();

  // Search query filter (matches location name or boarding house name)
  if (state.filters.query.trim()) {
    const q = state.filters.query.toLowerCase().trim();
    list = list.filter(k => k.nama_kost.toLowerCase().includes(q) || k.alamat.toLowerCase().includes(q));
  }

  // Campus filter
  if (state.filters.campus) {
    list = list.filter(k => k.nearest_campus === state.filters.campus);
  }

  // Price minimum filter
  if (state.filters.priceMin !== null) {
    list = list.filter(k => k.harga >= state.filters.priceMin);
  }

  // Price maximum filter
  if (state.filters.priceMax !== null) {
    list = list.filter(k => k.harga <= state.filters.priceMax);
  }

  // Gender filter
  if (state.filters.genders.length > 0) {
    list = list.filter(k => state.filters.genders.includes(k.jenis_kost));
  }

  // Room status filter
  if (state.filters.statuses.length > 0) {
    list = list.filter(k => state.filters.statuses.includes(k.status_kamar));
  }

  // Facilities list match (must contain ALL selected facilities)
  if (state.filters.facilities.length > 0) {
    list = list.filter(k => {
      const facilityIds = k.facilities.map(f => f.id);
      return state.filters.facilities.every(facId => facilityIds.includes(facId));
    });
  }

  // Sorting selections
  const sortBy = document.getElementById('sortSelect').value;
  if (sortBy === 'price-asc') {
    list.sort((a, b) => a.harga - b.harga);
  } else if (sortBy === 'price-desc') {
    list.sort((a, b) => b.harga - a.harga);
  } else if (sortBy === 'rating-desc') {
    list.sort((a, b) => b.rating - a.rating);
  }

  // Update counts
  document.getElementById('resultsCount').innerText = list.length;

  renderKostCards(list);
}

// --- RENDER PROPERTY LIST CARDS ---
function renderKostCards(list) {
  const grid = document.getElementById('listingsGrid');
  
  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <i data-lucide="search-code"></i>
        <h3>Kos Tidak Ditemukan</h3>
        <p>Maaf, kos dengan kriteria filter tersebut tidak dapat ditemukan. Coba reset filter atau gunakan kata kunci lain.</p>
      </div>
    `;
    refreshIcons();
    return;
  }

  grid.innerHTML = list.map(k => {
    // Determine badges classes
    const genderClass = k.jenis_kost.toLowerCase();
    const statusClass = k.status_kamar.toLowerCase().replace(' ', '-');
    const displayPrice = k.harga.toLocaleString('id-ID');
    
    // Rating star generation (5 stars)
    let starsHtml = '';
    const roundedRating = Math.round(k.rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        starsHtml += `<i data-lucide="star" style="fill:var(--warning); color:var(--warning);"></i>`;
      } else {
        starsHtml += `<i data-lucide="star"></i>`;
      }
    }

    return `
      <div class="kos-card" data-id="${k.id}">
        <div class="card-media">
          <img src="${k.images[0]}" alt="${k.nama_kost}" class="card-img" loading="lazy">
          
          <div class="badge-container-top">
            <span class="card-badge-gender ${genderClass}">${k.jenis_kost}</span>
            <div class="card-badge-verified">
              <i data-lucide="check-circle" style="fill:var(--primary); color:var(--white);"></i>
            </div>
          </div>

          <div class="badge-container-bottom">
            <span class="card-badge-status ${statusClass}">${k.status_kamar}</span>
          </div>
        </div>

        <div class="card-body">
          <span class="card-campus-distance">${k.nearest_campus}</span>
          <h3 class="card-title">${k.nama_kost}</h3>
          
          <div class="card-location">
            <i data-lucide="map-pin"></i>
            <span>${k.alamat}</span>
          </div>

          <div class="card-rating-row">
            <div class="rating-stars">
              ${starsHtml}
            </div>
            <span>${k.rating || 'Baru'}</span>
          </div>

          <div class="card-divider"></div>

          <div class="card-footer-row">
            <div class="card-price">
              <span class="card-price-label">Mulai dari</span>
              <span class="card-price-amount">Rp ${displayPrice}<span>/bln</span></span>
            </div>
            <button class="btn btn-primary btn-sm btn-card-detail" data-id="${k.id}">Lihat Detail</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Add click listeners to cards & detail buttons
  document.querySelectorAll('.kos-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicked on the detail button since it triggers separately
      if (e.target.classList.contains('btn-card-detail')) return;
      const id = card.getAttribute('data-id');
      window.location.hash = `#kost-${id}`;
    });
  });

  document.querySelectorAll('.btn-card-detail').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      window.location.hash = `#kost-${id}`;
    });
  });

  refreshIcons();
}

// --- RENDER DETAIL PAGE ---
function renderKostDetail() {
  const content = document.getElementById('detailViewContent');
  const k = DB.kosts.getById(state.selectedKostId);
  
  if (!k) {
    content.innerHTML = `
      <div class="empty-state">
        <i data-lucide="frown"></i>
        <h3>Kos Tidak Ditemukan</h3>
        <p>Sewa kos ini telah dihapus oleh pemilik atau link tidak valid.</p>
      </div>
    `;
    refreshIcons();
    return;
  }

  // Increment view stats (view count increases when visited)
  DB.kosts.incrementViews(k.id);

  const displayPrice = k.harga.toLocaleString('id-ID');
  const genderClass = k.jenis_kost.toLowerCase();
  const statusClass = k.status_kamar.toLowerCase().replace(' ', '-');

  // Load reviews list
  const reviews = DB.reviews.getByKostId(k.id);
  const reviewsCount = reviews.length;

  // Calculate Sub ratings averages
  let cleanRating = 0, safetyRating = 0, wifiRating = 0, hostRating = 0;
  if (reviewsCount > 0) {
    cleanRating = parseFloat((reviews.reduce((sum, r) => sum + r.rating_kebersihan, 0) / reviewsCount).toFixed(1));
    safetyRating = parseFloat((reviews.reduce((sum, r) => sum + r.rating_keamanan, 0) / reviewsCount).toFixed(1));
    wifiRating = parseFloat((reviews.reduce((sum, r) => sum + r.rating_wifi, 0) / reviewsCount).toFixed(1));
    hostRating = parseFloat((reviews.reduce((sum, r) => sum + r.rating_keramahan, 0) / reviewsCount).toFixed(1));
  }

  // Rating stars for overall title rating row
  let starsHtml = '';
  const roundedRating = Math.round(k.rating);
  for (let i = 1; i <= 5; i++) {
    if (i <= roundedRating) {
      starsHtml += `<i data-lucide="star" style="fill:var(--warning); color:var(--warning);"></i>`;
    } else {
      starsHtml += `<i data-lucide="star"></i>`;
    }
  }

  // Create Gallery HTML
  let galleryHtml = `
    <div class="gallery-main gallery-item">
      <img src="${k.images[0]}" alt="${k.nama_kost}">
    </div>
  `;
  if (k.images.length > 1) {
    galleryHtml += `
      <div class="gallery-sub-grid" style="display:flex; flex-direction:column; gap:12px;">
        <div class="gallery-item" style="height: calc(50% - 6px);">
          <img src="${k.images[1]}" alt="${k.nama_kost}">
        </div>
        <div class="gallery-item" style="height: calc(50% - 6px);">
          <img src="${k.images[2] || k.images[0]}" alt="${k.nama_kost}">
        </div>
      </div>
    `;
  } else {
    galleryHtml += `
      <div class="gallery-sub-grid" style="display:flex; flex-direction:column; gap:12px;">
        <div class="gallery-item" style="height: calc(50% - 6px);">
          <img src="${k.images[0]}" alt="${k.nama_kost}">
        </div>
        <div class="gallery-item" style="height: calc(50% - 6px);">
          <img src="${k.images[0]}" alt="${k.nama_kost}">
        </div>
      </div>
    `;
  }

  content.innerHTML = `
    <!-- Top info bar -->
    <div class="detail-header">
      <div class="detail-title-block">
        <div class="detail-labels">
          <span class="detail-label-gender ${genderClass}">${k.jenis_kost}</span>
          <span class="detail-label-verified"><i data-lucide="shield-check"></i> Kos Terverifikasi</span>
          <span class="detail-label-status ${statusClass}">${k.status_kamar}</span>
        </div>
        <h1 class="detail-title">${k.nama_kost}</h1>
        <div class="detail-location">
          <i data-lucide="map-pin"></i>
          <span>${k.alamat}</span>
        </div>
      </div>

      <div class="detail-meta-rating">
        <i data-lucide="star" style="fill:var(--warning);"></i>
        <span>${k.rating || 'Baru'}</span>
        <span style="color:#64748b; font-weight:500;">(${reviewsCount} Ulasan)</span>
      </div>
    </div>

    <!-- Gallery Grid -->
    <div class="detail-gallery">
      ${galleryHtml}
    </div>

    <!-- Detail Layout Grid -->
    <div class="detail-layout">
      
      <!-- Main Info Pane -->
      <div class="detail-main-panel">
        
        <!-- Video Tour Section (Mandatory) -->
        <div class="detail-section-card">
          <h3 class="detail-section-title"><i data-lucide="video" style="color:var(--primary);"></i> Video Tour Kos (Wajib)</h3>
          <p style="font-size:13px; color:#64748b; margin-bottom:16px;">Kami mewajibkan pemilik kos mengupload video walkthrough asli untuk memastikan kondisi kos sebenarnya (Anti Zonk).</p>
          <div class="video-tour-container">
            <iframe src="${k.video_url}" title="Video Tour ${k.nama_kost}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        </div>

        <!-- Description -->
        <div class="detail-section-card">
          <h3 class="detail-section-title">Deskripsi Lengkap</h3>
          <p class="description-text">${k.deskripsi}</p>
        </div>

        <!-- Facilities -->
        <div class="detail-section-card">
          <h3 class="detail-section-title">Fasilitas Kamar & Bersama</h3>
          <div class="facilities-detail-grid">
            ${k.facilities.map(f => `
              <div class="facility-detail-item">
                <div class="facility-detail-icon">
                  <i data-lucide="${f.icon}"></i>
                </div>
                <span class="facility-detail-name">${f.nama_fasilitas}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Rules -->
        <div class="detail-section-card">
          <h3 class="detail-section-title">Peraturan Kos</h3>
          <div class="rules-list">
            ${k.rules.map(r => `
              <div class="rule-item">
                <i data-lucide="alert-circle"></i>
                <span>${r}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Map & Nearest Campuses -->
        <div class="detail-section-card">
          <h3 class="detail-section-title">Lokasi & Akses Kampus</h3>
          <div class="maps-grid">
            <!-- Mock Google Maps -->
            <div class="mock-map-placeholder">
              <img class="mock-map-img" src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" alt="Map mockup background">
              <div class="map-marker">
                <i data-lucide="map-pin" style="fill:var(--danger);"></i>
                <div class="map-marker-label">${k.nama_kost}</div>
              </div>
            </div>
            <!-- Proximity Info -->
            <div class="campus-proximity-card">
              <div class="proximity-item">
                <div class="proximity-icon">
                  <i data-lucide="graduation-cap"></i>
                </div>
                <div class="proximity-info">
                  <h4>Kampus Terdekat</h4>
                  <p>${k.nearest_campus}</p>
                </div>
              </div>

              <div class="proximity-item">
                <div class="proximity-icon">
                  <i data-lucide="navigation"></i>
                </div>
                <div class="proximity-info">
                  <h4>Estimasi Jarak Tempuh</h4>
                  <p>± 5 Menit Jalan Kaki (350 meter)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reviews Section -->
        <div class="detail-section-card" id="reviewsContainer">
          <h3 class="detail-section-title">Review & Rating Pengguna</h3>
          
          ${reviewsCount > 0 ? `
            <div class="review-stats-card">
              <div class="overall-rating-box">
                <div class="overall-score">${k.rating}</div>
                <div class="overall-rating-label">Sangat Baik</div>
                <span style="font-size:12px; color:#64748b;">Berdasarkan ${reviewsCount} ulasan</span>
              </div>
              <div class="category-ratings-grid">
                <div class="category-rating-item">
                  <div class="cat-rating-label">
                    <span>Kebersihan</span>
                    <span>${cleanRating} / 5</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${(cleanRating/5)*100}%"></div>
                  </div>
                </div>
                <div class="category-rating-item">
                  <div class="cat-rating-label">
                    <span>Keamanan</span>
                    <span>${safetyRating} / 5</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${(safetyRating/5)*100}%"></div>
                  </div>
                </div>
                <div class="category-rating-item">
                  <div class="cat-rating-label">
                    <span>Koneksi Wifi</span>
                    <span>${wifiRating} / 5</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${(wifiRating/5)*100}%"></div>
                  </div>
                </div>
                <div class="category-rating-item">
                  <div class="cat-rating-label">
                    <span>Keramahan Pemilik</span>
                    <span>${hostRating} / 5</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${(hostRating/5)*100}%"></div>
                  </div>
                </div>
              </div>
            </div>
          ` : `
            <div class="review-stats-card" style="grid-template-columns:1fr; text-align:center;">
              <p style="color:#64748b;">Belum ada ulasan untuk kos ini. Jadilah yang pertama memberikan ulasan!</p>
            </div>
          `}

          <!-- Reviews comment lists -->
          <div class="review-list">
            ${reviews.map(r => `
              <div class="review-card">
                <div class="review-user-row">
                  <div class="reviewer-meta">
                    <div class="avatar">${r.user_nama.charAt(0)}</div>
                    <div class="reviewer-info">
                      <h4>${r.user_nama}</h4>
                      <span>Pengguna Terverifikasi • ${r.date}</span>
                    </div>
                  </div>
                  <div class="review-score-badge">
                    <i data-lucide="star" style="fill:var(--warning); color:var(--warning); width:14px; height:14px;"></i>
                    <span>${r.rating_avg}</span>
                  </div>
                </div>
                <p class="review-text">${r.komentar}</p>
              </div>
            `).join('')}
          </div>

          <!-- Write Review Section -->
          <div style="margin-top:40px; padding-top:30px; border-top: 1px solid var(--border-color);">
            <h4 style="font-size:16px; margin-bottom:16px;">Tulis Ulasan Kamu</h4>
            
            ${state.activeUser ? `
              ${state.activeUser.role === 'pengguna' ? `
                <form id="submitReviewForm" class="write-review-form">
                  <div class="rating-inputs-grid">
                    <div class="rating-input-item">
                      <label>Kebersihan</label>
                      <div class="star-rating-selector" data-category="kebersihan">
                        <i data-lucide="star" data-value="1"></i>
                        <i data-lucide="star" data-value="2"></i>
                        <i data-lucide="star" data-value="3"></i>
                        <i data-lucide="star" data-value="4"></i>
                        <i data-lucide="star" data-value="5"></i>
                      </div>
                    </div>
                    <div class="rating-input-item">
                      <label>Keamanan</label>
                      <div class="star-rating-selector" data-category="keamanan">
                        <i data-lucide="star" data-value="1"></i>
                        <i data-lucide="star" data-value="2"></i>
                        <i data-lucide="star" data-value="3"></i>
                        <i data-lucide="star" data-value="4"></i>
                        <i data-lucide="star" data-value="5"></i>
                      </div>
                    </div>
                    <div class="rating-input-item">
                      <label>Koneksi Wifi</label>
                      <div class="star-rating-selector" data-category="wifi">
                        <i data-lucide="star" data-value="1"></i>
                        <i data-lucide="star" data-value="2"></i>
                        <i data-lucide="star" data-value="3"></i>
                        <i data-lucide="star" data-value="4"></i>
                        <i data-lucide="star" data-value="5"></i>
                      </div>
                    </div>
                    <div class="rating-input-item">
                      <label>Keramahan Pemilik</label>
                      <div class="star-rating-selector" data-category="keramahan">
                        <i data-lucide="star" data-value="1"></i>
                        <i data-lucide="star" data-value="2"></i>
                        <i data-lucide="star" data-value="3"></i>
                        <i data-lucide="star" data-value="4"></i>
                        <i data-lucide="star" data-value="5"></i>
                      </div>
                    </div>
                  </div>
                  <div class="form-group" style="margin-top:16px;">
                    <label for="reviewKomentar">Komentar Ulasan</label>
                    <textarea id="reviewKomentar" placeholder="Tulis pengalaman kamu selama tinggal di kos ini secara jujur dan transparan..." required></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary btn-sm" style="align-self: flex-start;">Kirim Ulasan</button>
                </form>
              ` : `
                <p style="color:#64748b; font-size:14px; background-color:var(--light); padding:12px; border-radius:var(--radius-sm);">Hanya akun pencari kos (pengguna) yang dapat menulis ulasan.</p>
              `}
            ` : `
              <p style="color:#64748b; font-size:14px; background-color:var(--light); padding:12px; border-radius:var(--radius-sm);">Silakan <a href="#" id="loginLinkInReview" style="color:var(--primary); font-weight:700; text-decoration:underline;">Masuk / Login</a> terlebih dahulu untuk menulis ulasan.</p>
            `}
          </div>

        </div>

      </div>

      <!-- Right Sticky Booking Card -->
      <div class="sticky-sidebar">
        <div class="booking-card">
          <div class="booking-header">
            <div class="booking-price">Rp ${displayPrice} <span>/ Bulan</span></div>
            <div class="booking-verified-row">
              <i data-lucide="check-circle" style="fill:var(--success); color:var(--white);"></i>
              <span>Kos Terverifikasi Tanpa Zonk</span>
            </div>
          </div>

          <div class="booking-details-box">
            <div class="booking-detail-row">
              <span class="booking-detail-label">Jenis Kos</span>
              <span class="booking-detail-value">${k.jenis_kost}</span>
            </div>
            <div class="booking-detail-row">
              <span class="booking-detail-label">Status Ketersediaan</span>
              <span class="booking-detail-value ${statusClass}">${k.status_kamar}</span>
            </div>
            <div class="booking-detail-row">
              <span class="booking-detail-label">Kampus Terdekat</span>
              <span class="booking-detail-value">${k.nearest_campus}</span>
            </div>
          </div>

          <!-- Contact Owners -->
          <button class="btn btn-contact-whatsapp" id="btnContactWhatsappOwner">
            <i data-lucide="message-circle" style="fill:var(--white);"></i> Hubungi Pemilik
          </button>
          
          <div style="text-align:center; margin-top:12px; font-size:11px; color:#94a3b8; font-weight:500;">
            *Klik tombol di atas untuk membuka chat WhatsApp langsung ke pemilik kos.
          </div>
        </div>
      </div>

    </div>
  `;

  // WhatsApp click handler
  document.getElementById('btnContactWhatsappOwner').addEventListener('click', () => {
    const waText = `Halo Pengelola/Pemilik ${k.nama_kost}, saya melihat listing kos Anda di platform CarKos dan tertarik untuk bertanya lebih lanjut mengenai kamar yang ${k.status_kamar}. Apakah boleh info lebih detail? Terima kasih!`;
    const waUrl = `https://api.whatsapp.com/send?phone=${k.whatsapp}&text=${encodeURIComponent(waText)}`;
    window.open(waUrl, '_blank');
  });

  // Login handler inside reviews section if guest
  const loginLinkInReview = document.getElementById('loginLinkInReview');
  if (loginLinkInReview) {
    loginLinkInReview.addEventListener('click', (e) => {
      e.preventDefault();
      showAuthModal();
    });
  }

  // Setup dynamic stars click behavior
  setupReviewStars();

  // Handle Review submission
  const reviewForm = document.getElementById('submitReviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitReview(k.id);
    });
  }

  refreshIcons();
}

// --- REVIEW STARS DYNAMIC BEHAVIOR ---
function setupReviewStars() {
  document.querySelectorAll('.star-rating-selector').forEach(selector => {
    const category = selector.getAttribute('data-category');
    const stars = selector.querySelectorAll('i');

    stars.forEach(star => {
      // Hover feedback effects
      star.addEventListener('mouseover', () => {
        const val = parseInt(star.getAttribute('data-value'));
        highlightStars(stars, val);
      });

      star.addEventListener('mouseout', () => {
        const currentSelectedVal = state.reviewFormRating[category];
        highlightStars(stars, currentSelectedVal);
      });

      // Click select rating
      star.addEventListener('click', () => {
        const val = parseInt(star.getAttribute('data-value'));
        state.reviewFormRating[category] = val;
        highlightStars(stars, val);
      });
    });
  });
}

function highlightStars(stars, value) {
  stars.forEach(star => {
    const starVal = parseInt(star.getAttribute('data-value'));
    if (starVal <= value) {
      star.classList.add('active');
      star.setAttribute('style', 'fill:var(--warning); color:var(--warning);');
    } else {
      star.classList.remove('active');
      star.removeAttribute('style');
    }
  });
}

function setupReviews() {
  // Empty, reviews logic initialized during render
}

function submitReview(kostId) {
  const r = state.reviewFormRating;
  
  // Validation: Check if all category ratings have been set
  if (r.kebersihan === 0 || r.keamanan === 0 || r.wifi === 0 || r.keramahan === 0) {
    alert("Mohon berikan rating di semua kategori terlebih dahulu.");
    return;
  }

  const komentar = document.getElementById('reviewKomentar').value.trim();
  if (!komentar) {
    alert("Mohon masukkan komentar ulasan Anda.");
    return;
  }

  // Calculate overall average rating
  const avg = parseFloat(((r.kebersihan + r.keamanan + r.wifi + r.keramahan) / 4).toFixed(1));

  const reviewPayload = {
    user_id: state.activeUser.id,
    user_nama: state.activeUser.nama,
    kost_id: kostId,
    rating_kebersihan: r.kebersihan,
    rating_keamanan: r.keamanan,
    rating_wifi: r.wifi,
    rating_keramahan: r.keramahan,
    rating_avg: avg,
    komentar: komentar
  };

  DB.reviews.add(reviewPayload);

  // Reset local state ratings form
  state.reviewFormRating = { kebersihan: 0, keamanan: 0, wifi: 0, keramahan: 0 };

  // Re-render
  renderKostDetail();
  alert("Ulasan Anda berhasil dikirim! Terima kasih atas feedback transparan Anda.");
}

// --- OWNER DASHBOARD LOGIC ---
function setupDashboard() {
  const btnAddNewKos = document.getElementById('btnAddNewKos');
  const btnCloseKosFormModal = document.getElementById('btnCloseKosFormModal');
  const btnCancelKosForm = document.getElementById('btnCancelKosForm');
  const kosFormModal = document.getElementById('kosFormModal');
  const kosForm = document.getElementById('kosForm');
  const btnAddRuleInput = document.getElementById('btnAddRuleInput');

  btnAddNewKos.addEventListener('click', () => {
    openKosModal();
  });

  const closeFormModal = () => {
    kosFormModal.classList.remove('show');
  };

  btnCloseKosFormModal.addEventListener('click', closeFormModal);
  btnCancelKosForm.addEventListener('click', closeFormModal);

  // Rules list inputs management
  btnAddRuleInput.addEventListener('click', () => {
    addRuleInputField('');
  });

  // Submit new/edited listing form
  kosForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitKosForm();
  });
}

function openKosModal(existingKostId = null) {
  const modal = document.getElementById('kosFormModal');
  const title = document.getElementById('kosFormModalTitle');
  const form = document.getElementById('kosForm');
  const rulesContainer = document.getElementById('rulesInputsContainer');
  const facilitiesContainer = document.getElementById('formFacilitiesCheckboxes');

  form.reset();
  rulesContainer.innerHTML = '';
  document.getElementById('formKostId').value = '';

  // Render checkable facilities
  const facilities = DB.facilities.getAll();
  facilitiesContainer.innerHTML = facilities.map(f => `
    <label class="checkbox-label" style="font-size:13px;">
      <input type="checkbox" name="formFacility" value="${f.id}">
      <span>${f.nama_fasilitas}</span>
    </label>
  `).join('');

  if (existingKostId) {
    title.innerText = "Edit Listing Kos";
    const k = DB.kosts.getById(existingKostId);
    
    document.getElementById('formKostId').value = k.id;
    document.getElementById('formNamaKost').value = k.nama_kost;
    document.getElementById('formDeskripsi').value = k.deskripsi;
    document.getElementById('formAlamat').value = k.alamat;
    document.getElementById('formHarga').value = k.harga;
    document.getElementById('formWhatsapp').value = k.whatsapp;
    document.getElementById('formJenisKost').value = k.jenis_kost;
    document.getElementById('formStatusKamar').value = k.status_kamar;
    document.getElementById('formNearestCampus').value = k.nearest_campus;
    document.getElementById('formVideoUrl').value = k.video_url;
    document.getElementById('formLatitude').value = k.latitude;
    document.getElementById('formLongitude').value = k.longitude;
    document.getElementById('formImages').value = k.images.join(', ');

    // Fill rules
    if (k.rules && k.rules.length > 0) {
      k.rules.forEach(r => addRuleInputField(r));
    } else {
      addRuleInputField('');
    }

    // Check pre-existing facilities checkboxes
    const activeFacIds = k.facilities.map(f => f.id);
    document.querySelectorAll('input[name="formFacility"]').forEach(checkbox => {
      const id = parseInt(checkbox.value);
      if (activeFacIds.includes(id)) {
        checkbox.checked = true;
      }
    });

  } else {
    title.innerText = "Tambah Kos Baru";
    addRuleInputField(''); // add one empty rule input
  }

  modal.classList.add('show');
  refreshIcons();
}

function addRuleInputField(value = '') {
  const container = document.getElementById('rulesInputsContainer');
  const div = document.createElement('div');
  div.className = 'rules-input-row';
  div.innerHTML = `
    <input type="text" class="form-control rule-input-item" value="${value}" placeholder="Contoh: Lawan jenis dilarang masuk kamar" required>
    <button type="button" class="btn btn-outline btn-icon delete btn-remove-rule"><i data-lucide="trash-2"></i></button>
  `;

  // remove button handler
  div.querySelector('.btn-remove-rule').addEventListener('click', () => {
    div.remove();
    // Keep at least one input rule row
    if (container.children.length === 0) {
      addRuleInputField('');
    }
  });

  container.appendChild(div);
  refreshIcons();
}

function submitKosForm() {
  const idVal = document.getElementById('formKostId').value;
  const name = document.getElementById('formNamaKost').value;
  const desc = document.getElementById('formDeskripsi').value;
  const address = document.getElementById('formAlamat').value;
  const price = document.getElementById('formHarga').value;
  const wa = document.getElementById('formWhatsapp').value;
  const gender = document.getElementById('formJenisKost').value;
  const status = document.getElementById('formStatusKamar').value;
  const campus = document.getElementById('formNearestCampus').value;
  const video = document.getElementById('formVideoUrl').value;
  const lat = document.getElementById('formLatitude').value;
  const lon = document.getElementById('formLongitude').value;
  
  // Parse photo URLs list
  const imgInput = document.getElementById('formImages').value.trim();
  let imageList = [];
  if (imgInput) {
    imageList = imgInput.split(',').map(url => url.trim()).filter(url => url.length > 0);
  }

  // Parse Rules list
  const ruleInputs = document.querySelectorAll('.rule-input-item');
  const rules = Array.from(ruleInputs).map(inp => inp.value.trim()).filter(val => val.length > 0);

  // Parse checked facilities checklist
  const selectedFacilities = [];
  document.querySelectorAll('input[name="formFacility"]:checked').forEach(cb => {
    selectedFacilities.push(parseInt(cb.value));
  });

  const payload = {
    nama_kost: name,
    deskripsi: desc,
    alamat: address,
    harga: price,
    whatsapp: wa,
    jenis_kost: gender,
    status_kamar: status,
    nearest_campus: campus,
    video_url: video,
    latitude: lat,
    longitude: lon,
    images: imageList,
    rules: rules,
    owner_id: state.activeUser.id
  };

  if (idVal) {
    // Edit existing Kost
    DB.kosts.update(idVal, payload, selectedFacilities);
    alert("Listing kos berhasil diperbarui!");
  } else {
    // Add new Kost
    DB.kosts.add(payload, selectedFacilities);
    alert("Listing kos baru berhasil dipublish!");
  }

  document.getElementById('kosFormModal').classList.remove('show');
  renderDashboard();
}

function renderDashboard() {
  // Guard clause for dashboard view access control
  if (!state.activeUser || (state.activeUser.role !== 'pemilik' && state.activeUser.role !== 'admin')) {
    window.location.hash = '';
    switchView('explore');
    return;
  }

  // Filters owner property listings
  let myKosts = DB.kosts.getAll();
  if (state.activeUser.role !== 'admin') {
    myKosts = myKosts.filter(k => k.owner_id === state.activeUser.id);
  }

  // Render metrics counts
  const totalListings = myKosts.length;
  const totalViews = myKosts.reduce((sum, k) => sum + (k.views_count || 0), 0);
  
  let totalRatingSum = 0;
  let ratedCount = 0;
  myKosts.forEach(k => {
    if (k.rating > 0) {
      totalRatingSum += k.rating;
      ratedCount++;
    }
  });
  const avgRating = ratedCount > 0 ? parseFloat((totalRatingSum / ratedCount).toFixed(1)) : 0.0;

  // Monthly Revenue Estimation: Sum monthly rentals of available and almost full listings
  const estimationRevenue = myKosts
    .filter(k => k.status_kamar !== 'Penuh')
    .reduce((sum, k) => sum + k.harga, 0);

  document.getElementById('metricTotalListings').innerText = totalListings;
  document.getElementById('metricTotalViews').innerText = totalViews;
  document.getElementById('metricAvgRating').innerText = avgRating.toFixed(1);
  document.getElementById('metricRevenue').innerText = `Rp ${estimationRevenue.toLocaleString('id-ID')}`;

  // Render Table
  const tableBody = document.getElementById('ownerListingsTableBody');
  if (totalListings === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:30px; color:#64748b;">
          Belum ada listing kos yang Anda daftarkan. Silakan klik tombol "Tambah Kos Baru".
        </td>
      </tr>
    `;
  } else {
    tableBody.innerHTML = myKosts.map(k => {
      const priceStr = k.harga.toLocaleString('id-ID');
      const statusClass = k.status_kamar.toLowerCase().replace(' ', '-');
      
      return `
        <tr>
          <td>
            <div class="table-kos-info">
              <img src="${k.images[0]}" alt="${k.nama_kost}" class="table-kos-img">
              <div class="table-kos-details">
                <h4>${k.nama_kost}</h4>
                <span>${k.nearest_campus}</span>
              </div>
            </div>
          </td>
          <td><strong>Rp ${priceStr}</strong></td>
          <td>
            <span class="table-badge-status ${statusClass}">${k.status_kamar}</span>
          </td>
          <td>${k.views_count || 0} kali dilihat</td>
          <td>
            <div style="display:flex; align-items:center; gap:4px; font-weight:600;">
              <i data-lucide="star" style="fill:var(--warning); color:var(--warning); width:16px; height:16px;"></i>
              <span>${k.rating || '-'}</span>
            </div>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn-icon btn-edit-kost" data-id="${k.id}" title="Edit Listing"><i data-lucide="edit-2"></i></button>
              <button class="btn-icon btn-view-kost" data-id="${k.id}" title="Lihat Halaman Kos"><i data-lucide="eye"></i></button>
              <button class="btn-icon delete btn-delete-kost" data-id="${k.id}" title="Hapus Listing"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Actions button listeners inside dashboard tables
    document.querySelectorAll('.btn-edit-kost').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openKosModal(id);
      });
    });

    document.querySelectorAll('.btn-view-kost').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        window.location.hash = `#kost-${id}`;
      });
    });

    document.querySelectorAll('.btn-delete-kost').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm("Apakah Anda yakin ingin menghapus listing kos ini secara permanen? Semua ulasan juga akan terhapus.")) {
          DB.kosts.delete(id);
          renderDashboard();
        }
      });
    });
  }

  // Draw Analytical SVG chart
  drawAnalyticsChart();
  refreshIcons();
}

function drawAnalyticsChart() {
  const container = document.getElementById('chartContainer');
  const stats = DB.stats.getVisitorStats();
  const dates = Object.keys(stats).sort();

  if (dates.length === 0) {
    container.innerHTML = `<p style="text-align:center; padding:40px; color:#64748b;">Belum ada data kunjungan.</p>`;
    return;
  }

  // SVG parameters
  const width = 500;
  const height = 180;
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Max views count to scale heights
  const maxVal = Math.max(...Object.values(stats), 10);

  // Generate SVG bars content
  const step = chartWidth / (dates.length - 0.5);
  let svgContent = '';

  dates.forEach((date, i) => {
    const val = stats[date];
    const barHeight = (val / maxVal) * chartHeight;
    const x = padding + i * step;
    const y = height - padding - barHeight;
    const barWidth = step * 0.6;

    // Date formatting (DD/MM)
    const dParts = date.split('-');
    const label = `${dParts[2]}/${dParts[1]}`;

    svgContent += `
      <!-- Bar -->
      <rect class="chart-bar" x="${x}" y="${y}" width="${barWidth}" height="${barHeight}"></rect>
      <!-- Label views on top of bar -->
      <text class="chart-text" x="${x + barWidth / 2}" y="${y - 6}" font-size="10">${val}</text>
      <!-- Date labels on bottom -->
      <text class="chart-text" x="${x + barWidth / 2}" y="${height - 10}" font-size="10" fill="#64748b">${label}</text>
    `;
  });

  // Render SVG
  container.innerHTML = `
    <svg class="svg-chart" viewBox="0 0 ${width} ${height}">
      <!-- Grid lines -->
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#cbd5e1" stroke-width="2"></line>
      ${svgContent}
    </svg>
  `;
}

// --- AUTH LOGIC (REGISTER & LOGIN MODALS) ---
function setupAuth() {
  const modal = document.getElementById('authModal');
  const btnCloseAuthModal = document.getElementById('btnCloseAuthModal');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  btnCloseAuthModal.addEventListener('click', () => {
    modal.classList.remove('show');
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;
    
    const user = DB.users.authenticate(email, pass);
    if (user) {
      state.activeUser = user;
      sessionStorage.setItem("carkos_active_user", JSON.stringify(user));
      modal.classList.remove('show');
      renderHeader();

      // Check current view to refresh dynamic controls
      if (state.currentView === 'detail') {
        renderKostDetail();
      } else if (state.currentView === 'explore') {
        applyFilters();
      }
    } else {
      alert("Email atau password salah. Coba lagi.");
    }
  });

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nama = document.getElementById('registerNama').value;
    const email = document.getElementById('registerEmail').value;
    const pass = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;

    // Check if user email already exists
    if (DB.users.getByEmail(email)) {
      alert("Email ini sudah terdaftar. Silakan gunakan email lain atau login.");
      return;
    }

    const newUser = DB.users.add({ nama, email, password: pass, role });
    
    state.activeUser = newUser;
    sessionStorage.setItem("carkos_active_user", JSON.stringify(newUser));
    modal.classList.remove('show');
    renderHeader();

    alert(`Selamat datang ${nama}! Registrasi berhasil sebagai ${role === 'pemilik' ? 'Pemilik Kos' : 'Pencari Kos'}.`);
    
    // Redirect if owner
    if (role === 'pemilik') {
      window.location.hash = '#dashboard';
    } else if (state.currentView === 'detail') {
      renderKostDetail();
    }
  });
}

function showAuthModal() {
  const modal = document.getElementById('authModal');
  modal.classList.add('show');
  switchAuthTab('login');
}

// Global window scoping so inline HTML triggers work
window.switchAuthTab = function(tabName) {
  const loginPanel = document.getElementById('loginFormPanel');
  const registerPanel = document.getElementById('registerFormPanel');
  const tabLogin = document.getElementById('tabLoginBtn');
  const tabRegister = document.getElementById('tabRegisterBtn');

  if (tabName === 'login') {
    loginPanel.style.display = 'block';
    registerPanel.style.display = 'none';
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
  } else {
    loginPanel.style.display = 'none';
    registerPanel.style.display = 'block';
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
  }
};
