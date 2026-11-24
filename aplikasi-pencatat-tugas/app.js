/**
 * TugasKuliah - Aplikasi Pencatat Tugas & Deadline Mahasiswa
 * Engine: Course Management, Assignment Classification, Deadline Countdown, Offline Storage & Backup
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_TASKS_KEY = 'tugaskuliah_tasks_v2';
  const STORAGE_COURSES_KEY = 'tugaskuliah_courses_v2';
  const STORAGE_THEME_KEY = 'tugaskuliah_theme';

  // State Aplikasi
  let tasks = [];
  let courses = [];
  let currentCourse = 'semua';
  let currentFilter = 'aktif';
  let searchQuery = '';
  let deferredPrompt = null;

  // DOM Elements
  const taskListEl = document.getElementById('taskList');
  const emptyStateEl = document.getElementById('emptyState');
  const emptyTitleEl = document.getElementById('emptyTitle');
  const emptyDescEl = document.getElementById('emptyDesc');

  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const courseChips = document.getElementById('courseChips');
  const statusTabs = document.querySelector('.status-tabs');
  const bottomNav = document.querySelector('.bottom-nav');

  // Stats & Header Elements
  const totalCountEl = document.getElementById('totalCount');
  const doneCountEl = document.getElementById('doneCount');
  const progressPercentEl = document.getElementById('progressPercent');
  const progressBarFillEl = document.getElementById('progressBarFill');
  const urgentBanner = document.getElementById('urgentBanner');
  const urgentText = document.getElementById('urgentText');
  const badgeActiveEl = document.getElementById('badgeActive');
  const badgeUrgentEl = document.getElementById('badgeUrgent');
  const badgeDoneEl = document.getElementById('badgeDone');
  const currentDateText = document.getElementById('currentDateText');

  // Modals
  const taskModal = document.getElementById('taskModal');
  const courseModal = document.getElementById('courseModal');
  const statsModal = document.getElementById('statsModal');
  const settingsModal = document.getElementById('settingsModal');

  // Task Form Elements
  const taskForm = document.getElementById('taskForm');
  const modalTitle = document.getElementById('modalTitle');
  const openAddModalBtn = document.getElementById('openAddModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');

  const editTaskId = document.getElementById('editTaskId');
  const taskTitleInput = document.getElementById('taskTitleInput');
  const taskCourseSelect = document.getElementById('taskCourseSelect');
  const taskTypeSelect = document.getElementById('taskTypeSelect');
  const taskDueDateInput = document.getElementById('taskDueDateInput');
  const taskDueTimeInput = document.getElementById('taskDueTimeInput');
  const taskPrioritySelect = document.getElementById('taskPrioritySelect');
  const taskLecturerInput = document.getElementById('taskLecturerInput');
  const taskLinkInput = document.getElementById('taskLinkInput');
  const taskNotesInput = document.getElementById('taskNotesInput');

  // Course Management Form Elements
  const manageCoursesBtn = document.getElementById('manageCoursesBtn');
  const addCourseForm = document.getElementById('addCourseForm');
  const newCourseName = document.getElementById('newCourseName');
  const courseManagerList = document.getElementById('courseManagerList');

  // Settings & Theme
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importFileInput = document.getElementById('importFileInput');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const pwaInstallCard = document.getElementById('pwaInstallCard');
  const installAppBtn = document.getElementById('installAppBtn');
  const toastEl = document.getElementById('toast');

  // Mapping Jenis Tugas
  const TASK_TYPES = {
    individu: { label: '📝 Individu', color: 'badge-type' },
    kelompok: { label: '👥 Kelompok', color: 'badge-type' },
    praktikum: { label: '🧪 Praktikum', color: 'badge-type' },
    proyek: { label: '💻 Proyek', color: 'badge-type' },
    makalah: { label: '📄 Makalah', color: 'badge-type' },
    presentasi: { label: '📊 PPT', color: 'badge-type' },
    ujian: { label: '🎯 Ujian/Kuis', color: 'badge-type' }
  };

  // ================= Inisialisasi =================
  function init() {
    loadTheme();
    formatCurrentDate();
    loadCourses();
    loadTasks();
    setupEventListeners();
    setupPwaInstall();
  }

  function formatCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'short' };
    currentDateText.textContent = `Semester Aktif • ${now.toLocaleDateString('id-ID', options)}`;
  }

  // Load Daftar Mata Kuliah
  function loadCourses() {
    const raw = localStorage.getItem(STORAGE_COURSES_KEY);
    if (raw) {
      try {
        courses = JSON.parse(raw);
      } catch (e) {
        courses = [];
      }
    } else {
      courses = [
        'Algoritma & Pemrograman',
        'Basis Data',
        'Kecerdasan Buatan',
        'Jaringan Komputer',
        'Etika Profesi'
      ];
      saveCourses();
    }
    renderCourseOptions();
  }

  function saveCourses() {
    localStorage.setItem(STORAGE_COURSES_KEY, JSON.stringify(courses));
    renderCourseOptions();
  }

  // Render Pilihan Mata Kuliah di Filter & Form Dropdown
  function renderCourseOptions() {
    // 1. Dropdown di Modal Form
    taskCourseSelect.innerHTML = '';
    courses.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      taskCourseSelect.appendChild(opt);
    });

    // 2. Chips di Header Filter
    courseChips.innerHTML = '';
    const allChip = document.createElement('button');
    allChip.className = `chip ${currentCourse === 'semua' ? 'active' : ''}`;
    allChip.dataset.course = 'semua';
    allChip.textContent = 'Semua Matkul';
    courseChips.appendChild(allChip);

    courses.forEach(c => {
      const chip = document.createElement('button');
      chip.className = `chip ${currentCourse === c ? 'active' : ''}`;
      chip.dataset.course = c;
      chip.textContent = c;
      courseChips.appendChild(chip);
    });

    // 3. List di Modal Kelola Matkul
    renderCourseManagerList();
  }

  function renderCourseManagerList() {
    courseManagerList.innerHTML = '';
    if (courses.length === 0) {
      courseManagerList.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">Belum ada mata kuliah.</p>';
      return;
    }

    courses.forEach(c => {
      const row = document.createElement('div');
      row.className = 'course-item-row';
      row.innerHTML = `
        <span class="course-item-name">📚 ${escapeHtml(c)}</span>
        <button class="action-btn delete-btn" title="Hapus Matkul">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;

      row.querySelector('.delete-btn').addEventListener('click', () => {
        if (confirm(`Hapus mata kuliah "${c}"? Tugas terkait akan tetap ada.`)) {
          courses = courses.filter(item => item !== c);
          saveCourses();
          render();
          showToast(`Mata kuliah "${c}" dihapus`);
        }
      });

      courseManagerList.appendChild(row);
    });
  }

  // Load Data Tugas
  function loadTasks() {
    const rawData = localStorage.getItem(STORAGE_TASKS_KEY);
    if (rawData) {
      try {
        tasks = JSON.parse(rawData);
      } catch (e) {
        tasks = [];
      }
    } else {
      // Data Bawaan Realistis Mahasiswa
      const today = getTodayDateString();
      const tomorrow = getFutureDateString(1);
      const nextWeek = getFutureDateString(4);

      tasks = [
        {
          id: 'task_1',
          title: 'Laporan Praktikum Modul 3: Query SQL Join',
          course: 'Basis Data',
          type: 'praktikum',
          priority: 'tinggi',
          dueDate: tomorrow,
          dueTime: '23:59',
          lecturer: 'Dr. Hendra, S.Kom',
          link: 'https://classroom.google.com',
          notes: 'Format PDF. Cantumkan screenshot query dan output database toko buku.',
          completed: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'task_2',
          title: 'Tugas Besar: Pembuatan Aplikasi Web MVC',
          course: 'Algoritma & Pemrograman',
          type: 'kelompok',
          priority: 'tinggi',
          dueDate: nextWeek,
          dueTime: '20:00',
          lecturer: 'Ibu Ratna, M.T',
          link: 'https://github.com',
          notes: 'Kelompok 4 orang. Push kode ke GitHub dan sertakan file README dokumentasi API.',
          completed: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'task_3',
          title: 'Resume Jurnal Etika AI & Hak Cipta',
          course: 'Etika Profesi',
          type: 'makalah',
          priority: 'sedang',
          dueDate: today,
          dueTime: '17:00',
          lecturer: 'Prof. Anwar',
          link: '',
          notes: 'Maksimal 3 halaman font Arial 11 spasi 1.5.',
          completed: false,
          createdAt: new Date().toISOString()
        }
      ];
      saveTasksToStorage();
    }
    render();
  }

  function saveTasksToStorage() {
    localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
  }

  // Helpers Tanggal & Countdown Deadline
  function getTodayDateString() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function getFutureDateString(daysAhead) {
    const target = new Date();
    target.setDate(target.getDate() + daysAhead);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function calculateCountdown(dueDate, dueTime) {
    if (!dueDate) return { text: 'Tanpa Deadline', status: 'normal', isUrgent: false, isOverdue: false };

    const target = new Date(`${dueDate}T${dueTime || '23:59'}:00`);
    const now = new Date();
    const diffMs = target - now;

    if (diffMs < 0) {
      const diffHours = Math.abs(Math.round(diffMs / (1000 * 60 * 60)));
      if (diffHours < 24) {
        return { text: `⚠️ Lewat ${diffHours} jam lalu`, status: 'danger', isUrgent: true, isOverdue: true };
      }
      const diffDays = Math.ceil(diffHours / 24);
      return { text: `⚠️ Terlambat ${diffDays} hari`, status: 'danger', isUrgent: true, isOverdue: true };
    }

    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    if (diffHours <= 6) {
      return { text: `🚨 Sisa ${Math.max(1, diffHours)} jam lagi!`, status: 'danger', isUrgent: true, isOverdue: false };
    }
    if (diffHours <= 24) {
      return { text: `⏰ Hari ini! (${dueTime || '23:59'})`, status: 'danger', isUrgent: true, isOverdue: false };
    }

    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 2) {
      return { text: `⏳ Besok lusa (${diffDays} hari)`, status: 'warning', isUrgent: true, isOverdue: false };
    }

    return { text: `📅 Sisa ${diffDays} hari (${dueDate})`, status: 'normal', isUrgent: false, isOverdue: false };
  }

  // ================= Rendering & Filter =================
  function render() {
    updateSummaryAndBadges();

    const filtered = tasks.filter(task => {
      // 1. Filter Mata Kuliah
      if (currentCourse !== 'semua' && task.course !== currentCourse) {
        return false;
      }

      // 2. Filter Pencarian Cepat
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(q);
        const courseMatch = task.course.toLowerCase().includes(q);
        const lecturerMatch = task.lecturer ? task.lecturer.toLowerCase().includes(q) : false;
        const notesMatch = task.notes ? task.notes.toLowerCase().includes(q) : false;
        if (!titleMatch && !courseMatch && !lecturerMatch && !notesMatch) return false;
      }

      // 3. Filter Status Tab
      const countdown = calculateCountdown(task.dueDate, task.dueTime);
      if (currentFilter === 'aktif') {
        return !task.completed;
      } else if (currentFilter === 'mendesak') {
        return !task.completed && countdown.isUrgent;
      } else if (currentFilter === 'kelompok') {
        return !task.completed && task.type === 'kelompok';
      } else if (currentFilter === 'selesai') {
        return task.completed;
      }

      return true;
    });

    // Urutkan: Tugas belum selesai di atas, lalu berdasarkan urgensi deadline terdekat
    filtered.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const timeA = new Date(`${a.dueDate || '9999-12-31'}T${a.dueTime || '23:59'}:00`).getTime();
      const timeB = new Date(`${b.dueDate || '9999-12-31'}T${b.dueTime || '23:59'}:00`).getTime();
      return timeA - timeB;
    });

    renderTaskList(filtered);
  }

  function renderTaskList(list) {
    taskListEl.innerHTML = '';

    if (list.length === 0) {
      emptyStateEl.style.display = 'block';
      if (searchQuery) {
        emptyTitleEl.textContent = 'Tugas Tidak Ditemukan';
        emptyDescEl.textContent = `Tidak ada tugas dengan kata kunci "${searchQuery}".`;
      } else if (currentFilter === 'selesai') {
        emptyTitleEl.textContent = 'Belum Ada Tugas Terkumpul';
        emptyDescEl.textContent = 'Tugas yang sudah kamu kumpulkan akan tampil di sini.';
      } else if (currentFilter === 'mendesak') {
        emptyTitleEl.textContent = 'Bebas Deadline Mendesak! 🎉';
        emptyDescEl.textContent = 'Tidak ada tugas yang deadline-nya mendekat dalam 48 jam ke depan.';
      } else {
        emptyTitleEl.textContent = 'Tidak Ada Tugas Kuliah';
        emptyDescEl.textContent = 'Semua tugas untuk mata kuliah ini sudah beres atau belum dicatat.';
      }
      return;
    }

    emptyStateEl.style.display = 'none';

    list.forEach(task => {
      const card = document.createElement('div');
      card.className = `task-item ${task.completed ? 'completed' : ''}`;
      card.dataset.id = task.id;

      const countdown = calculateCountdown(task.dueDate, task.dueTime);
      const typeInfo = TASK_TYPES[task.type] || { label: task.type, color: 'badge-type' };

      // Link Pengumpulan
      let linkHtml = '';
      if (task.link) {
        linkHtml = `
          <a href="${escapeHtml(task.link)}" target="_blank" rel="noopener noreferrer" class="lms-link-btn" title="Buka tautan pengumpulan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            Buka Link LMS / Drive
          </a>
        `;
      }

      card.innerHTML = `
        <div class="task-top-row">
          <div class="task-checkbox-wrap">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Tandai Sudah Dikumpulkan">
            <div class="checkbox-custom">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>

          <div class="task-body">
            <h3 class="task-title">${escapeHtml(task.title)}</h3>
            
            <div class="task-meta" style="margin-top: 6px;">
              <span class="task-badge badge-course">📚 ${escapeHtml(task.course)}</span>
              <span class="task-badge ${typeInfo.color}">${typeInfo.label}</span>
              ${!task.completed ? `<span class="task-badge badge-countdown ${countdown.status}">${countdown.text}</span>` : '<span class="task-badge" style="background:#dcfce7;color:#166534;">✅ Sudah Dikumpulkan</span>'}
            </div>

            ${task.lecturer ? `<div class="task-lecturer-info">👨‍🏫 Dosen: <strong>${escapeHtml(task.lecturer)}</strong></div>` : ''}
            ${task.notes ? `<p class="task-notes">${escapeHtml(task.notes)}</p>` : ''}
          </div>
        </div>

        <div class="task-footer">
          ${linkHtml}
          <div class="task-actions">
            <button class="action-btn edit-btn" title="Ubah Tugas Kuliah" aria-label="Edit">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="action-btn delete-btn" title="Hapus Tugas" aria-label="Hapus">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;

      // Event Listeners pada kartu tugas
      card.querySelector('.task-checkbox').addEventListener('change', () => toggleTaskDone(task.id));
      card.querySelector('.edit-btn').addEventListener('click', () => openEditModal(task));
      card.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

      taskListEl.appendChild(card);
    });
  }

  // Update Summary Progress & Banner Urgensi
  function updateSummaryAndBadges() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;

    // Hitung tugas mendesak
    const urgentTasks = tasks.filter(t => !t.completed && calculateCountdown(t.dueDate, t.dueTime).isUrgent);

    totalCountEl.textContent = total;
    doneCountEl.textContent = completed;

    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    progressPercentEl.textContent = `${percent}%`;
    progressBarFillEl.style.width = `${percent}%`;

    badgeActiveEl.textContent = active;
    badgeUrgentEl.textContent = urgentTasks.length;
    badgeDoneEl.textContent = completed;

    // Alert Banner di Header jika ada deadline mepet
    if (urgentTasks.length > 0) {
      urgentBanner.style.display = 'flex';
      urgentText.textContent = `Ada ${urgentTasks.length} tugas mendekati deadline! Segera cek & kerjakan.`;
    } else {
      urgentBanner.style.display = 'none';
    }
  }

  // ================= CRUD Tugas =================
  function toggleTaskDone(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    saveTasksToStorage();
    render();
    showToast(task.completed ? '🎉 Mantap! Tugas berhasil dikumpulkan' : '↩️ Tugas ditandai belum selesai');
  }

  function deleteTask(id) {
    if (!confirm('Hapus catatan tugas kuliah ini?')) return;
    tasks = tasks.filter(t => t.id !== id);
    saveTasksToStorage();
    render();
    showToast('🗑️ Tugas berhasil dihapus');
  }

  function openAddModal() {
    editTaskId.value = '';
    modalTitle.textContent = 'Tambah Tugas Kuliah';
    taskForm.reset();

    // Default ke matkul yang sedang aktif difilter (jika bukan 'semua')
    if (currentCourse !== 'semua' && courses.includes(currentCourse)) {
      taskCourseSelect.value = currentCourse;
    } else if (courses.length > 0) {
      taskCourseSelect.value = courses[0];
    }

    taskDueDateInput.value = getFutureDateString(1);
    taskDueTimeInput.value = '23:59';
    taskPrioritySelect.value = 'sedang';
    taskTypeSelect.value = 'individu';
    taskModal.classList.add('open');
    setTimeout(() => taskTitleInput.focus(), 150);
  }

  function openEditModal(task) {
    editTaskId.value = task.id;
    modalTitle.textContent = 'Ubah Catatan Tugas Kuliah';
    taskTitleInput.value = task.title;
    taskCourseSelect.value = task.course;
    taskTypeSelect.value = task.type || 'individu';
    taskDueDateInput.value = task.dueDate || '';
    taskDueTimeInput.value = task.dueTime || '23:59';
    taskPrioritySelect.value = task.priority || 'sedang';
    taskLecturerInput.value = task.lecturer || '';
    taskLinkInput.value = task.link || '';
    taskNotesInput.value = task.notes || '';
    taskModal.classList.add('open');
    setTimeout(() => taskTitleInput.focus(), 150);
  }

  function closeModal() {
    taskModal.classList.remove('open');
  }

  function handleTaskFormSubmit(e) {
    e.preventDefault();
    const title = taskTitleInput.value.trim();
    if (!title) return;

    const id = editTaskId.value;
    if (id) {
      // Edit
      const task = tasks.find(t => t.id === id);
      if (task) {
        task.title = title;
        task.course = taskCourseSelect.value;
        task.type = taskTypeSelect.value;
        task.dueDate = taskDueDateInput.value;
        task.dueTime = taskDueTimeInput.value;
        task.priority = taskPrioritySelect.value;
        task.lecturer = taskLecturerInput.value.trim();
        task.link = taskLinkInput.value.trim();
        task.notes = taskNotesInput.value.trim();
        showToast('✏️ Tugas kuliah diperbarui');
      }
    } else {
      // Tambah Baru
      const newTask = {
        id: 'task_' + Date.now(),
        title: title,
        course: taskCourseSelect.value,
        type: taskTypeSelect.value,
        dueDate: taskDueDateInput.value,
        dueTime: taskDueTimeInput.value,
        priority: taskPrioritySelect.value,
        lecturer: taskLecturerInput.value.trim(),
        link: taskLinkInput.value.trim(),
        notes: taskNotesInput.value.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };
      tasks.unshift(newTask);
      showToast('📚 Tugas kuliah baru berhasil ditambahkan');
    }

    saveTasksToStorage();
    closeModal();
    render();
  }

  // ================= Kelola Mata Kuliah =================
  function handleAddCourseSubmit(e) {
    e.preventDefault();
    const name = newCourseName.value.trim();
    if (!name) return;

    if (courses.some(c => c.toLowerCase() === name.toLowerCase())) {
      alert('Mata kuliah tersebut sudah ada.');
      return;
    }

    courses.push(name);
    saveCourses();
    newCourseName.value = '';
    showToast(`Mata kuliah "${name}" ditambahkan`);
  }

  // ================= Statistik Akademik =================
  function openStatsModal() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(t => !t.completed && calculateCountdown(t.dueDate, t.dueTime).isOverdue).length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statCompleted').textContent = completed;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statOverdue').textContent = overdue;

    const courseStatsList = document.getElementById('courseStatsList');
    courseStatsList.innerHTML = '';

    courses.forEach(c => {
      const cTasks = tasks.filter(t => t.course === c);
      const cDone = cTasks.filter(t => t.completed).length;
      const row = document.createElement('div');
      row.className = 'cat-stat-row';
      row.innerHTML = `
        <span>📚 <strong>${escapeHtml(c)}</strong></span>
        <span>${cDone} / ${cTasks.length} terkumpul</span>
      `;
      courseStatsList.appendChild(row);
    });

    statsModal.classList.add('open');
  }

  // ================= Backup & Restore =================
  function exportData() {
    const payload = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      courses: courses,
      tasks: tasks
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tugaskuliah_backup_${getTodayDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('💾 Cadangan tugas berhasil diunduh');
  }

  function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.tasks && Array.isArray(imported.tasks)) {
          tasks = imported.tasks;
          if (imported.courses && Array.isArray(imported.courses)) {
            courses = imported.courses;
            saveCourses();
          }
          saveTasksToStorage();
          render();
          showToast('📥 Data tugas berhasil dipulihkan!');
          settingsModal.classList.remove('open');
        } else if (Array.isArray(imported)) {
          tasks = imported;
          saveTasksToStorage();
          render();
          showToast('📥 Data tugas berhasil dipulihkan!');
          settingsModal.classList.remove('open');
        } else {
          alert('Format data file backup tidak cocok.');
        }
      } catch (err) {
        alert('Gagal membaca file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function clearAllData() {
    if (confirm('PERHATIAN: Apakah kamu yakin ingin mereset dan menghapus seluruh data tugas kuliah?')) {
      tasks = [];
      saveTasksToStorage();
      render();
      settingsModal.classList.remove('open');
      showToast('🗑️ Data tugas telah direset');
    }
  }

  // ================= Tema & PWA =================
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_THEME_KEY, next);
  }

  function loadTheme() {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => toastEl.classList.remove('show'), 2500);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupPwaInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      pwaInstallCard.style.display = 'flex';
    });

    installAppBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast('🚀 Memasang TugasKuliah ke HP...');
        }
        deferredPrompt = null;
        pwaInstallCard.style.display = 'none';
      }
    });
  }

  // ================= Event Listeners =================
  function setupEventListeners() {
    // Theme
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Search
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
      render();
    });

    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.style.display = 'none';
      render();
    });

    // Course Filter Chips
    courseChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      courseChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCourse = chip.dataset.course;
      render();
    });

    manageCoursesBtn.addEventListener('click', () => {
      courseModal.classList.add('open');
    });

    addCourseForm.addEventListener('submit', handleAddCourseSubmit);

    // Status Tabs
    statusTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab-btn');
      if (!tab) return;
      statusTabs.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      render();
    });

    // Bottom Navigation
    bottomNav.addEventListener('click', (e) => {
      const navItem = e.target.closest('.nav-item');
      if (!navItem) return;
      bottomNav.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      navItem.classList.add('active');

      const action = navItem.dataset.nav;
      if (action === 'tasks') {
        courseModal.classList.remove('open');
        statsModal.classList.remove('open');
        settingsModal.classList.remove('open');
      } else if (action === 'matkul') {
        courseModal.classList.add('open');
      } else if (action === 'stats') {
        openStatsModal();
      } else if (action === 'settings') {
        settingsModal.classList.add('open');
      }
    });

    // Modal Close Handlers
    openAddModalBtn.addEventListener('click', openAddModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    taskForm.addEventListener('submit', handleTaskFormSubmit);

    document.querySelectorAll('.close-course-btn').forEach(b => {
      b.addEventListener('click', () => {
        courseModal.classList.remove('open');
        bottomNav.querySelector('[data-nav="tasks"]').classList.add('active');
      });
    });

    document.querySelectorAll('.close-stats-btn').forEach(b => {
      b.addEventListener('click', () => {
        statsModal.classList.remove('open');
        bottomNav.querySelector('[data-nav="tasks"]').classList.add('active');
      });
    });

    document.querySelectorAll('.close-settings-btn').forEach(b => {
      b.addEventListener('click', () => {
        settingsModal.classList.remove('open');
        bottomNav.querySelector('[data-nav="tasks"]').classList.add('active');
      });
    });

    // Close on backdrop click
    window.addEventListener('click', (e) => {
      if (e.target === taskModal) closeModal();
      if (e.target === courseModal) {
        courseModal.classList.remove('open');
        bottomNav.querySelector('[data-nav="tasks"]').classList.add('active');
      }
      if (e.target === statsModal) {
        statsModal.classList.remove('open');
        bottomNav.querySelector('[data-nav="tasks"]').classList.add('active');
      }
      if (e.target === settingsModal) {
        settingsModal.classList.remove('open');
        bottomNav.querySelector('[data-nav="tasks"]').classList.add('active');
      }
    });

    // Backup & Restore Handlers
    exportBtn.addEventListener('click', exportData);
    importFileInput.addEventListener('change', importData);
    clearAllBtn.addEventListener('click', clearAllData);
  }

  // Start app
  document.addEventListener('DOMContentLoaded', init);
})();
