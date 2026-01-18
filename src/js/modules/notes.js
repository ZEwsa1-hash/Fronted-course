/**
 * Модуль управления заметками (скрываемая боковая панель)
 */
const Notes = {
    editingNoteId: null,
    selectedNoteId: null,
    sidebarOpen: false,
    searchQuery: '',

    /**
     * Инициализация модуля заметок
     */
    init() {
        const addNoteBtn = document.getElementById('add-note-btn');
        if (addNoteBtn) {
            addNoteBtn.addEventListener('click', () => {
                this.openModal();
            });
        }

        // Кнопка открытия/закрытия боковой панели
        const sidebarToggle = document.getElementById('notes-sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        const closeSidebar = document.getElementById('close-notes-sidebar');
        if (closeSidebar) {
            closeSidebar.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Поиск заметок
        const searchInput = document.getElementById('notes-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.renderSidebar();
            });
        }

        this.initNoteModal();
    },

    /**
     * Переключить боковую панель
     */
    toggleSidebar() {
        const sidebar = document.getElementById('notes-sidebar');
        const toggle = document.getElementById('notes-sidebar-toggle');
        
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
            this.sidebarOpen = !sidebar.classList.contains('collapsed');
        }
        if (toggle) {
            toggle.classList.toggle('open', this.sidebarOpen);
        }
    },

    /**
     * Инициализация модального окна заметки
     */
    initNoteModal() {
        const modal = document.getElementById('note-modal');
        if (!modal) return;

        const form = document.getElementById('note-form');
        const closeBtn = modal.querySelector('.close');
        const cancelBtn = document.getElementById('cancel-note-btn');

        [closeBtn, cancelBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    this.closeModal();
                });
            }
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveNote();
            });
        }
    },

    /**
     * Открыть модальное окно заметки
     */
    openModal(noteId = null) {
        const modal = document.getElementById('note-modal');
        const form = document.getElementById('note-form');
        const titleInput = document.getElementById('note-title-input');
        const contentInput = document.getElementById('note-content-input');
        const modalTitle = document.getElementById('modal-note-title');

        if (!modal || !form) return;

        this.editingNoteId = noteId;

        if (noteId) {
            const notes = DataManager.getNotes();
            const note = notes.find(n => n.id === noteId);
            if (note) {
                if (modalTitle) modalTitle.textContent = 'Редактировать заметку';
                if (titleInput) titleInput.value = note.title;
                if (contentInput) contentInput.value = note.content || '';
            }
        } else {
            if (modalTitle) modalTitle.textContent = 'Добавить заметку';
            form.reset();
        }

        modal.classList.add('active');
        if (titleInput) titleInput.focus();
    },

    /**
     * Закрыть модальное окно
     */
    closeModal() {
        const modal = document.getElementById('note-modal');
        const form = document.getElementById('note-form');
        if (modal) modal.classList.remove('active');
        if (form) form.reset();
        this.editingNoteId = null;
    },

    /**
     * Сохранить заметку
     */
    saveNote() {
        const titleInput = document.getElementById('note-title-input');
        const contentInput = document.getElementById('note-content-input');

        if (!titleInput) return;

        const notes = DataManager.getNotes();

        if (this.editingNoteId) {
            const noteIndex = notes.findIndex(n => n.id === this.editingNoteId);
            if (noteIndex !== -1) {
                notes[noteIndex] = {
                    ...notes[noteIndex],
                    title: titleInput.value.trim(),
                    content: contentInput.value.trim(),
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            const newNote = {
                id: generateId(),
                title: titleInput.value.trim(),
                content: contentInput.value.trim(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            notes.push(newNote);
        }

        DataManager.saveNotes(notes);
        this.closeModal();
        this.render();
        if (typeof Dashboard !== 'undefined') Dashboard.update();
    },

    /**
     * Удалить заметку
     */
    deleteNote(noteId) {
        if (confirm('Вы уверены, что хотите удалить эту заметку?')) {
            const notes = DataManager.getNotes();
            const filteredNotes = notes.filter(n => n.id !== noteId);
            DataManager.saveNotes(filteredNotes);
            this.render();
            if (typeof Dashboard !== 'undefined') Dashboard.update();
        }
    },

    /**
     * Выбрать заметку в боковой панели
     */
    selectNote(noteId) {
        this.selectedNoteId = noteId;
        this.render();
        this.openModal(noteId);
    },

    /**
     * Отрисовка боковой панели заметок
     */
    renderSidebar() {
        const sidebarList = document.getElementById('notes-sidebar-list');
        if (!sidebarList) return;

        let notes = DataManager.getNotes();

        // Фильтрация по поиску
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            notes = notes.filter(n => 
                n.title.toLowerCase().includes(query) ||
                (n.content && n.content.toLowerCase().includes(query))
            );
        }

        if (notes.length === 0) {
            sidebarList.innerHTML = '<div style="padding: 1rem; color: var(--text-light); font-size: 0.9rem;">Нет заметок</div>';
            return;
        }

        sidebarList.innerHTML = notes.map(note => {
            const preview = note.content ? note.content.substring(0, 50) + (note.content.length > 50 ? '...' : '') : 'Без содержимого';
            return `
                <div class="notes-sidebar-item ${this.selectedNoteId === note.id ? 'active' : ''}" 
                     onclick="Notes.selectNote('${note.id}')">
                    <div class="notes-sidebar-item-title">${escapeHtml(note.title)}</div>
                    <div class="notes-sidebar-item-preview">${escapeHtml(preview)}</div>
                </div>
            `;
        }).join('');
    },

    /**
     * Отрисовка списка заметок
     */
    render() {
        this.renderSidebar();

        const notesList = document.getElementById('notes-list');
        if (!notesList) return;

        const notes = DataManager.getNotes();

        if (notes.length === 0) {
            notesList.innerHTML = '<div class="task-empty">Заметок пока нет. Добавьте первую заметку!</div>';
            return;
        }

        notesList.innerHTML = notes.map(note => {
            const dateStr = formatShortDate(note.createdAt);
            return `
                <div class="note-item">
                    <div class="note-header">
                        <div class="note-title">${escapeHtml(note.title)}</div>
                        <div class="task-actions">
                            <button class="btn btn-secondary btn-small" onclick="Notes.openModal('${note.id}')" title="Редактировать">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-small" onclick="Notes.deleteNote('${note.id}')" title="Удалить">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="note-content">${escapeHtml(note.content || '')}</div>
                    <div class="note-date"><i class="fas fa-clock"></i> ${dateStr}</div>
                </div>
            `;
        }).join('');
    }
};
