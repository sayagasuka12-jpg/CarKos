/**
 * CarKos - Database Simulation Layer
 * Simulated Database using localStorage.
 * 
 * Schemas implemented:
 * - Users: id, nama, email, password, role ('admin', 'pemilik', 'pengguna')
 * - Kost: id, nama_kost, deskripsi, alamat, latitude, longitude, harga, jenis_kost, status_kamar, whatsapp, video_url, rating, nearest_campus, views_count, owner_id
 * - Fasilitas: id, nama_fasilitas, icon
 * - Kost_Fasilitas: kost_id, fasilitas_id
 * - Review: id, user_id, user_nama, kost_id, rating_kebersihan, rating_keamanan, rating_wifi, rating_keramahan, rating_avg, komentar, date
 */

// Initial Seed Data
const DEFAULT_FACILITIES = [
  { id: 1, nama_fasilitas: "AC", icon: "wind" },
  { id: 2, nama_fasilitas: "Wifi", icon: "wifi" },
  { id: 3, nama_fasilitas: "Kamar Mandi Dalam", icon: "bath" },
  { id: 4, nama_fasilitas: "Parkir", icon: "square" },
  { id: 5, nama_fasilitas: "CCTV", icon: "shield" },
  { id: 6, nama_fasilitas: "Dapur", icon: "coffee" },
  { id: 7, nama_fasilitas: "Mesin Cuci", icon: "shirt" }
];

const DEFAULT_USERS = [
  { id: 1, nama: "Budi Santoso", email: "owner@carkos.com", password: "password123", role: "pemilik" },
  { id: 2, nama: "Rian Hidayat", email: "renter@carkos.com", password: "password123", role: "pengguna" },
  { id: 3, nama: "Siti Aminah", email: "siti@carkos.com", password: "password123", role: "pengguna" },
  { id: 4, nama: "Admin CarKos", email: "admin@carkos.com", password: "admin123", role: "admin" }
];

const DEFAULT_KOSTS = [
  {
    id: 1,
    nama_kost: "Kost Putri Jasmine UNILA Rajabasa",
    deskripsi: "Kost putri khusus mahasiswi UNILA. Sangat dekat dengan Fakultas Kedokteran dan FKIP. Fasilitas lengkap dengan spring bed, AC, lemari baju, meja belajar, dan kamar mandi dalam. Area parkir luas dan aman dengan penjaga kost 24 jam.",
    alamat: "Gg. Karya Muda No. 45, Rajabasa, Kec. Rajabasa, Kota Bandar Lampung",
    latitude: -5.3701,
    longitude: 105.2415,
    harga: 1100000,
    jenis_kost: "Putri",
    status_kamar: "Tersedia",
    whatsapp: "6281234567890",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: 4.8,
    nearest_campus: "Universitas Lampung (UNILA)",
    views_count: 324,
    owner_id: 1,
    images: [
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"
    ],
    rules: [
      "Lawan jenis dilarang masuk ke dalam kamar",
      "Batas kunjungan tamu maksimal pukul 22.00 WIB",
      "Dilarang membuat kegaduhan setelah pukul 21.00 WIB",
      "Menjaga kebersihan area dapur bersama"
    ]
  },
  {
    id: 2,
    nama_kost: "Kost ITERA Edelweiss Sukarame",
    deskripsi: "Hunian nyaman khusus mahasiswi ITERA. Jarak hanya 3 menit dari gerbang kampus. Kamar modern dengan AC, Wifi kencang, kasur, lemari, serta meja belajar. Dapur bersama dan parkir motor aman.",
    alamat: "Jl. Terusan Ryacudu Gg. Al-Iman, Sukarame, Kec. Sukarame, Kota Bandar Lampung",
    latitude: -5.3578,
    longitude: 105.3142,
    harga: 1000000,
    jenis_kost: "Putri",
    status_kamar: "Tersedia",
    whatsapp: "6281234567890",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: 4.5,
    nearest_campus: "Institut Teknologi Sumatera (ITERA)",
    views_count: 189,
    owner_id: 1,
    images: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
    ],
    rules: [
      "Tamu menginap wajib melapor ke pengelola kost",
      "Dilarang membawa hewan peliharaan",
      "Matikan AC dan lampu jika bepergian"
    ]
  },
  {
    id: 3,
    nama_kost: "Kost Putra UNILA Bumi Manti",
    deskripsi: "Kost khusus putra dekat kampus UNILA. Dilengkapi fasilitas Wifi kencang, parkir motor luas, kamar mandi dalam, kasur, dan lemari. Lokasi tenang dan dekat dengan berbagai pusat kuliner mahasiswa di Rajabasa.",
    alamat: "Jl. Bumi Manti II Gg. Baru, Rajabasa, Kec. Rajabasa, Kota Bandar Lampung",
    latitude: -5.3655,
    longitude: 105.2388,
    harga: 750000,
    jenis_kost: "Putra",
    status_kamar: "Hampir Penuh",
    whatsapp: "6281234567890",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: 4.8,
    nearest_campus: "Universitas Lampung (UNILA)",
    views_count: 512,
    owner_id: 1,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=800&q=80"
    ],
    rules: [
      "Dilarang merokok di dalam kamar",
      "Menjaga kerapian parkir motor",
      "Membayar uang sewa tepat waktu maksimal tanggal 5"
    ]
  },
  {
    id: 4,
    nama_kost: "Kost Executive Kedaton UBL",
    deskripsi: "Kost eksklusif campur (putra/putri) dekat kampus UBL (Universitas Bandar Lampung) dan pusat kota. Fasilitas premium: kamar mandi dalam, AC, Wifi super cepat, CCTV keamanan 24 Jam, dan akses kartu kunci gerbang.",
    alamat: "Jl. Z.A. Pagar Alam No. 89, Kedaton, Kec. Kedaton, Kota Bandar Lampung",
    latitude: -5.3789,
    longitude: 105.2502,
    harga: 1600000,
    jenis_kost: "Campur",
    status_kamar: "Penuh",
    whatsapp: "6281234567890",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: 4.2,
    nearest_campus: "Universitas Bandar Lampung (UBL)",
    views_count: 98,
    owner_id: 1,
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"
    ],
    rules: [
      "Akses gerbang 24 jam dengan kartu khusus",
      "Tamu lawan jenis dilarang menginap di dalam kamar"
    ]
  },
  {
    id: 5,
    nama_kost: "Kost UIN Raden Intan Sukarame",
    deskripsi: "Kost putri syariah sangat dekat dengan UIN Raden Intan Lampung. Bersih, tertib, aman, dan kondusif untuk belajar. Fasilitas kamar mandi dalam, kasur, lemari, meja belajar, dan Wifi gratis.",
    alamat: "Jl. Endro Suratmin Gg. Bahari, Sukarame, Kec. Sukarame, Kota Bandar Lampung",
    latitude: -5.3842,
    longitude: 105.2954,
    harga: 800000,
    jenis_kost: "Putri",
    status_kamar: "Tersedia",
    whatsapp: "6281234567890",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: 4.7,
    nearest_campus: "UIN Raden Intan Lampung (UIN RIL)",
    views_count: 245,
    owner_id: 1,
    images: [
      "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"
    ],
    rules: [
      "Lawan jenis dilarang berkunjung ke kamar (hanya boleh di ruang tamu)",
      "Batas jam malam gerbang utama dikunci pukul 22.00 WIB",
      "Menjaga sopan santun dengan warga sekitar"
    ]
  },
  {
    id: 6,
    nama_kost: "Kost Pasutri Way Halim Permai",
    deskripsi: "Hunian nyaman tipe studio khusus pasutri (pasangan suami istri) atau pekerja profesional di area Way Halim. Kamar ber-AC dilengkapi mini pantry (dapur kecil), Wifi, kasur springbed, kamar mandi dalam, dan parkir mobil gratis.",
    alamat: "Jl. Kimaja Gg. Kepayang No. 12, Way Halim, Kec. Way Halim, Kota Bandar Lampung",
    latitude: -5.3905,
    longitude: 105.2711,
    harga: 2000000,
    jenis_kost: "Pasutri",
    status_kamar: "Hampir Penuh",
    whatsapp: "6281234567890",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: 4.6,
    nearest_campus: "Universitas Bandar Lampung (UBL)",
    views_count: 154,
    owner_id: 1,
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=800&q=80"
    ],
    rules: [
      "Wajib menunjukkan Buku Nikah/KTP Pasutri saat mendaftar",
      "Iuran kebersihan dan parkir sudah termasuk sewa bulanan",
      "Dilarang membawa hewan peliharaan berukuran besar"
    ]
  }
];

// Pivot table Kost_Fasilitas
const DEFAULT_KOST_FASILITAS = [
  // Kost 1 (AC, Wifi, Kamar Mandi Dalam, Parkir, CCTV)
  { kost_id: 1, fasilitas_id: 1 },
  { kost_id: 1, fasilitas_id: 2 },
  { kost_id: 1, fasilitas_id: 3 },
  { kost_id: 1, fasilitas_id: 4 },
  { kost_id: 1, fasilitas_id: 5 },
  // Kost 2 (AC, Wifi, Dapur, Parkir)
  { kost_id: 2, fasilitas_id: 1 },
  { kost_id: 2, fasilitas_id: 2 },
  { kost_id: 2, fasilitas_id: 6 },
  { kost_id: 2, fasilitas_id: 4 },
  // Kost 3 (AC, Wifi, KM Dalam, Dapur, Mesin Cuci, CCTV)
  { kost_id: 3, fasilitas_id: 1 },
  { kost_id: 3, fasilitas_id: 2 },
  { kost_id: 3, fasilitas_id: 3 },
  { kost_id: 3, fasilitas_id: 6 },
  { kost_id: 3, fasilitas_id: 7 },
  { kost_id: 3, fasilitas_id: 5 },
  // Kost 4 (Wifi, KM Dalam, Parkir, CCTV)
  { kost_id: 4, fasilitas_id: 2 },
  { kost_id: 4, fasilitas_id: 3 },
  { kost_id: 4, fasilitas_id: 4 },
  { kost_id: 4, fasilitas_id: 5 },
  // Kost 5 (AC, Wifi, KM Dalam, Parkir, CCTV, Dapur, Mesin Cuci)
  { kost_id: 5, fasilitas_id: 1 },
  { kost_id: 5, fasilitas_id: 2 },
  { kost_id: 5, fasilitas_id: 3 },
  { kost_id: 5, fasilitas_id: 4 },
  { kost_id: 5, fasilitas_id: 5 },
  { kost_id: 5, fasilitas_id: 6 },
  { kost_id: 5, fasilitas_id: 7 },
  // Kost 6 (AC, Wifi, KM Dalam, Parkir, CCTV, Dapur)
  { kost_id: 6, fasilitas_id: 1 },
  { kost_id: 6, fasilitas_id: 2 },
  { kost_id: 6, fasilitas_id: 3 },
  { kost_id: 6, fasilitas_id: 4 },
  { kost_id: 6, fasilitas_id: 5 },
  { kost_id: 6, fasilitas_id: 6 }
];

const DEFAULT_REVIEWS = [
  {
    id: 1,
    user_id: 2,
    user_nama: "Rian Hidayat",
    kost_id: 1,
    rating_kebersihan: 5,
    rating_keamanan: 5,
    rating_wifi: 4,
    rating_keramahan: 5,
    rating_avg: 4.8,
    komentar: "Sangat bersih dan nyaman sekali. Dekat sekali dengan gerbang UNILA Rajabasa, tinggal jalan kaki.",
    date: "2026-05-15"
  },
  {
    id: 2,
    user_id: 3,
    user_nama: "Siti Aminah",
    kost_id: 1,
    rating_kebersihan: 4,
    rating_keamanan: 5,
    rating_wifi: 5,
    rating_keramahan: 5,
    rating_avg: 4.8,
    komentar: "Wifinya kencang sekali cocok buat ngerjain tugas kuliah. Keamanan terjaga dengan baik di area Rajabasa.",
    date: "2026-05-20"
  },
  {
    id: 3,
    user_id: 2,
    user_nama: "Rian Hidayat",
    kost_id: 2,
    rating_kebersihan: 4,
    rating_keamanan: 4,
    rating_wifi: 5,
    rating_keramahan: 5,
    rating_avg: 4.5,
    komentar: "Lokasinya mantap dekat ITERA Sukarame, jalan aksesnya sudah bagus dan wifinya stabil.",
    date: "2026-05-18"
  },
  {
    id: 4,
    user_id: 3,
    user_nama: "Siti Aminah",
    kost_id: 3,
    rating_kebersihan: 5,
    rating_keamanan: 5,
    rating_wifi: 5,
    rating_keramahan: 4,
    rating_avg: 4.8,
    komentar: "Fasilitas lengkap banget, dekat dengan UBL Kedaton. Sangat merekomendasikan kos eksklusif ini.",
    date: "2026-05-28"
  }
];

// Analytical Visitors Stats seed for owner dashboard (dates of past 7 days)
const generateMockVisitorStats = () => {
  const stats = {};
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    // random views between 15 and 65
    stats[dateStr] = Math.floor(Math.random() * 50) + 15;
  }
  return stats;
};

// Database Initialization
function initDB() {
  if (!localStorage.getItem("carkos_lampung_initialized")) {
    localStorage.setItem("carkos_users", JSON.stringify(DEFAULT_USERS));
    localStorage.setItem("carkos_kosts", JSON.stringify(DEFAULT_KOSTS));
    localStorage.setItem("carkos_facilities", JSON.stringify(DEFAULT_FACILITIES));
    localStorage.setItem("carkos_kost_facilities", JSON.stringify(DEFAULT_KOST_FASILITAS));
    localStorage.setItem("carkos_reviews", JSON.stringify(DEFAULT_REVIEWS));
    localStorage.setItem("carkos_visitor_stats", JSON.stringify(generateMockVisitorStats()));
    localStorage.setItem("carkos_lampung_initialized", "true");
  }
}

// Global getters and helpers
function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function setData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// User Operations
const DB = {
  users: {
    getAll: () => getData("carkos_users"),
    getById: (id) => getData("carkos_users").find(u => u.id === parseInt(id)),
    getByEmail: (email) => getData("carkos_users").find(u => u.email.toLowerCase() === email.toLowerCase().trim()),
    add: (user) => {
      const users = getData("carkos_users");
      user.id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      users.push(user);
      setData("carkos_users", users);
      return user;
    },
    authenticate: (email, password) => {
      const user = DB.users.getByEmail(email);
      if (user && user.password === password) {
        return user;
      }
      return null;
    }
  },

  facilities: {
    getAll: () => getData("carkos_facilities")
  },

  kosts: {
    getAll: () => {
      const kosts = getData("carkos_kosts");
      const pivot = getData("carkos_kost_facilities");
      const allFacilities = getData("carkos_facilities");

      // Join facilities data
      return kosts.map(kost => {
        const matchingFacIds = pivot.filter(p => p.kost_id === kost.id).map(p => p.fasilitas_id);
        const facilities = allFacilities.filter(f => matchingFacIds.includes(f.id));
        return { ...kost, facilities };
      });
    },

    getById: (id) => {
      const kost = getData("carkos_kosts").find(k => k.id === parseInt(id));
      if (!kost) return null;

      const pivot = getData("carkos_kost_facilities");
      const allFacilities = getData("carkos_facilities");
      const matchingFacIds = pivot.filter(p => p.kost_id === kost.id).map(p => p.fasilitas_id);
      const facilities = allFacilities.filter(f => matchingFacIds.includes(f.id));

      return { ...kost, facilities };
    },

    add: (kostData, facilityIds) => {
      const kosts = getData("carkos_kosts");
      const newId = kosts.length > 0 ? Math.max(...kosts.map(k => k.id)) + 1 : 1;
      
      const newKost = {
        id: newId,
        nama_kost: kostData.nama_kost,
        deskripsi: kostData.deskripsi,
        alamat: kostData.alamat,
        latitude: parseFloat(kostData.latitude) || -6.2000,
        longitude: parseFloat(kostData.longitude) || 106.8166,
        harga: parseInt(kostData.harga),
        jenis_kost: kostData.jenis_kost,
        status_kamar: kostData.status_kamar || "Tersedia",
        whatsapp: kostData.whatsapp.replace(/[^0-9]/g, ''),
        video_url: kostData.video_url || "https://www.youtube.com/embed/dQw4w9WgXcQ",
        rating: 0.0,
        nearest_campus: kostData.nearest_campus,
        views_count: 0,
        owner_id: parseInt(kostData.owner_id),
        images: kostData.images && kostData.images.length > 0 ? kostData.images : ["https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80"],
        rules: kostData.rules || ["Menjaga ketertiban dan kebersihan bersama"]
      };

      kosts.push(newKost);
      setData("carkos_kosts", kosts);

      // Save pivot relations
      const pivot = getData("carkos_kost_facilities");
      facilityIds.forEach(facId => {
        pivot.push({ kost_id: newId, fasilitas_id: parseInt(facId) });
      });
      setData("carkos_kost_facilities", pivot);

      return newId;
    },

    update: (id, kostData, facilityIds) => {
      const kosts = getData("carkos_kosts");
      const index = kosts.findIndex(k => k.id === parseInt(id));
      if (index === -1) return false;

      // Keep ratings and views count and owner id
      const original = kosts[index];
      kosts[index] = {
        ...original,
        nama_kost: kostData.nama_kost,
        deskripsi: kostData.deskripsi,
        alamat: kostData.alamat,
        latitude: parseFloat(kostData.latitude) || original.latitude,
        longitude: parseFloat(kostData.longitude) || original.longitude,
        harga: parseInt(kostData.harga),
        jenis_kost: kostData.jenis_kost,
        status_kamar: kostData.status_kamar,
        whatsapp: kostData.whatsapp.replace(/[^0-9]/g, ''),
        video_url: kostData.video_url || original.video_url,
        nearest_campus: kostData.nearest_campus,
        images: kostData.images && kostData.images.length > 0 ? kostData.images : original.images,
        rules: kostData.rules || original.rules
      };

      setData("carkos_kosts", kosts);

      // Update Pivot relation
      let pivot = getData("carkos_kost_facilities");
      // Remove old connections
      pivot = pivot.filter(p => p.kost_id !== parseInt(id));
      // Insert new connections
      facilityIds.forEach(facId => {
        pivot.push({ kost_id: parseInt(id), fasilitas_id: parseInt(facId) });
      });
      setData("carkos_kost_facilities", pivot);

      return true;
    },

    delete: (id) => {
      let kosts = getData("carkos_kosts");
      kosts = kosts.filter(k => k.id !== parseInt(id));
      setData("carkos_kosts", kosts);

      let pivot = getData("carkos_kost_facilities");
      pivot = pivot.filter(p => p.kost_id !== parseInt(id));
      setData("carkos_kost_facilities", pivot);

      let reviews = getData("carkos_reviews");
      reviews = reviews.filter(r => r.kost_id !== parseInt(id));
      setData("carkos_reviews", reviews);

      return true;
    },

    incrementViews: (id) => {
      const kosts = getData("carkos_kosts");
      const kost = kosts.find(k => k.id === parseInt(id));
      if (kost) {
        kost.views_count = (kost.views_count || 0) + 1;
        setData("carkos_kosts", kosts);
        
        // Add to daily visitor stats
        const stats = JSON.parse(localStorage.getItem("carkos_visitor_stats")) || {};
        const todayStr = new Date().toISOString().split('T')[0];
        stats[todayStr] = (stats[todayStr] || 0) + 1;
        localStorage.setItem("carkos_visitor_stats", JSON.stringify(stats));
      }
    }
  },

  reviews: {
    getByKostId: (kostId) => {
      return getData("carkos_reviews").filter(r => r.kost_id === parseInt(kostId));
    },

    add: (reviewData) => {
      const reviews = getData("carkos_reviews");
      const newId = reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1;
      
      const newReview = {
        id: newId,
        user_id: parseInt(reviewData.user_id),
        user_nama: reviewData.user_nama,
        kost_id: parseInt(reviewData.kost_id),
        rating_kebersihan: parseInt(reviewData.rating_kebersihan),
        rating_keamanan: parseInt(reviewData.rating_keamanan),
        rating_wifi: parseInt(reviewData.rating_wifi),
        rating_keramahan: parseInt(reviewData.rating_keramahan),
        rating_avg: parseFloat(reviewData.rating_avg),
        komentar: reviewData.komentar,
        date: new Date().toISOString().split('T')[0]
      };

      reviews.push(newReview);
      setData("carkos_reviews", reviews);

      // Recalculate average rating for the Kost listing
      const kosts = getData("carkos_kosts");
      const kostIndex = kosts.findIndex(k => k.id === parseInt(reviewData.kost_id));
      if (kostIndex !== -1) {
        const kostReviews = reviews.filter(r => r.kost_id === parseInt(reviewData.kost_id));
        const totalAvg = kostReviews.reduce((sum, r) => sum + r.rating_avg, 0);
        const newKostRating = parseFloat((totalAvg / kostReviews.length).toFixed(1));
        
        kosts[kostIndex].rating = newKostRating;
        setData("carkos_kosts", kosts);
      }

      return newReview;
    }
  },

  stats: {
    getVisitorStats: () => {
      return JSON.parse(localStorage.getItem("carkos_visitor_stats")) || {};
    }
  }
};

// Global exports
window.initDB = initDB;
window.DB = DB;
