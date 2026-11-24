/**
 * TugasKuliah - Versi Simpel & Minimalis
 * Tanpa kerumitan: Tambah, Checklist Selesai, Filter, Hapus, Simpan Otomatis
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'tugaskuliah_simple_v1';
  const THEME_KEY = 'tugaskuliah_theme_v1';

  let tasks = [];
  let currentFilter = 'aktif'; // 'aktif' | 'selesai' | 'semua'

  // DOM
  const taskListEl = document.getElementById('taskList');
  const emptyStateEl = document.getElementById('emptyState');
  const taskCountText = document.getElementById('taskCountText');
  const filterTabs = document.getElementById('filterTabs');
  const courseList = document.getElementById('courseList');

  // Form Inputs
  const quickAddForm = document.getElementById('quickAddForm');
  const quickTitleInput = document.getElementById('quickTitleInput');
  const quickCourseInput = document.getElementById('quickCourseInput');
  const quickDateInput = document.getElementById('quickDateInput');

  // Menu Modal
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const menuBtn = document.getElementById('menuBtn');
  const menuModal = document.getElementById('menuModal');
  const closeMenuBtn = document.getElementById('closeMenuBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importFileInput = document.getElementById('importFileInput');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const toastEl = document.getElementById('toast');

  // ================= Inisialisasi =================
  function init() {
    loadTheme();
    loadTasks();
    setupEvents();
  }

  function loadTasks() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        tasks = JSON.parse(raw);
      } catch (e) {
        tasks = [];
      }
    } else {
      // Contoh tugas awal sederhana
      tasks = [
        {
          id: '1',
          title: 'Laporan Praktikum Modul 3',
          course: 'Basis Data',
          dueDate: getTodayDateString(),
          completed: false
        },
        {
          id: '2',
          title: 'Tugas Makalah Etika Profesi',
          course: 'Etika Profesi',
          dueDate: '',
          completed: false
        }
      ];
      saveTasks();
    }
    render();
  }

  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function getTodayDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // ================= Render =================
  function render() {
    // 1. Update list rekomendasi mata kuliah di datalist
    const courses = [...new Set(tasks.map(t => t.course).filter(Boolean))];
    courseList.innerHTML = courses.map(c => `<option value="${escapeHtml(c)}">`).join('');

    // 2. Filter tugas
    const filtered = tasks.filter(t => {
      if (currentFilter === 'aktif') return !t.completed;
      if (currentFilter === 'selesai') return t.completed;
      return true; // 'semua'
    });

    // Urutkan: belum selesai di atas
    filtered.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      return 0;
    });

    // 3. Render kartu
    taskListEl.innerHTML = '';
    if (filtered.length === 0) {
      emptyStateEl.style.display = 'block';
    } else {
      emptyStateEl.style.display = 'none';
      filtered.forEach(t => {
        const item = document.createElement('div');
        item.className = `task-item ${t.completed ? 'completed' : ''}`;
        
        let dateInfo = '';
        if (t.dueDate) {
          const isToday = t.dueDate === getTodayDateString();
          dateInfo = `<span class="date-tag ${isToday && !t.completed ? 'urgent' : ''}">📅 ${t.dueDate}</span>`;
        }

        item.innerHTML = `
          <div class="task-check" title="Tandai selesai">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div class="task-info">
            <div class="task-title">${escapeHtml(t.title)}</div>
            ${(t.course || t.dueDate) ? `
              <div class="task-sub">
                ${t.course ? `<span class="course-tag">${escapeHtml(t.course)}</span>` : ''}
                ${dateInfo}
              </div>
            ` : ''}
          </div>
          <button class="del-btn" title="Hapus tugas">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        `;

        // Checkbox klik
        item.querySelector('.task-check').addEventListener('click', () => {
          t.completed = !t.completed;
          saveTasks();
          render();
          showToast(t.completed ? '✅ Tugas selesai!' : 'Tugas diaktifkan kembali');
        });

        // Hapus klik
        item.querySelector('.del-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          tasks = tasks.filter(itemTask => itemTask.id !== t.id);
          saveTasks();
          render();
          showToast('🗑️ Tugas dihapus');
        });

        taskListEl.appendChild(item);
      });
    }

    // 4. Update Header Subtitle
    const activeCount = tasks.filter(t => !t.completed).length;
    taskCountText.textContent = activeCount === 0 ? 'Semua tugas beres! 🎉' : `${activeCount} tugas belum selesai`;
  }

  // ================= Tambah Tugas =================
  function handleAdd(e) {
    e.preventDefault();
    const title = quickTitleInput.value.trim();
    if (!title) return;

    const newTask = {
      id: String(Date.now()),
      title: title,
      course: quickCourseInput.value.trim(),
      dueDate: quickDateInput.value,
      completed: false
    };

    tasks.unshift(newTask);
    saveTasks();

    quickTitleInput.value = '';
    quickCourseInput.value = '';
    quickDateInput.value = '';

    render();
    showToast('✨ Tugas ditambahkan');
  }

  // ================= Tema & Modal =================
  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
  }

  function loadTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove('show'), 2000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ================= Events =================
  function setupEvents() {
    quickAddForm.addEventListener('submit', handleAdd);
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Filter Buttons
    filterTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.seg-btn');
      if (!btn) return;
      filterTabs.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });

    // Menu Modal
    menuBtn.addEventListener('click', () => menuModal.classList.add('open'));
    closeMenuBtn.addEventListener('click', () => menuModal.classList.remove('open'));
    window.addEventListener('click', (e) => {
      if (e.target === menuModal) menuModal.classList.remove('open');
    });

    // Backup & Restore
    exportBtn.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `tugas_kuliah_backup.json`;
      a.click();
      a.remove();
      showToast('💾 Cadangan diunduh');
    });

    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
            tasks = imported;
            saveTasks();
            render();
            menuModal.classList.remove('open');
            showToast('📥 Data dipulihkan');
          }
        } catch (err) {
          alert('Format file salah');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });

    clearAllBtn.addEventListener('click', () => {
      if (confirm('Hapus semua daftar tugas?')) {
        tasks = [];
        saveTasks();
        render();
        menuModal.classList.remove('open');
        showToast('🗑️ Semua tugas dihapus');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
