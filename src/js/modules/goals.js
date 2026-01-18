/**
 * Модуль управления целями с пользовательскими папками
 */
const Goals = {
    editingGoalId: null,
    currentFilter: 'all',

    /**
     * Инициализация модуля целей
     */
    init() {
        const addGoalBtn = document.getElementById('add-goal-btn');
        if (addGoalBtn) {
            addGoalBtn.addEventListener('click', () => {
                this.openModal();
            });
        }

        // Фильтры целей
        document.querySelectorAll('.goal-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Не реагировать на клик по кнопке +
                if (e.target.classList.contains('add-category-btn')) return;
                
                document.querySelectorAll('.goal-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.getAttribute('data-filter');
                this.render();
            });
        });

        this.initGoalModal();
        this.initFolderModal();
    },

    /**
     * Добавить категорию (папку) через кнопку +
     */
    addCategory(category) {
        const name = prompt('Введите название папки:');
        if (!name || !name.trim()) return;

        let folders = [];
        try {
            folders = JSON.parse(localStorage.getItem('goalFolders') || '[]');
        } catch (e) {
            folders = [];
        }

        folders.push({
            id: generateId(),
            name: name.trim(),
            category: category,
            createdAt: new Date().toISOString()
        });

        localStorage.setItem('goalFolders', JSON.stringify(folders));
        this.render();
    },

    /**
     * Инициализация модального окна цели
     */
    initGoalModal() {
        const modal = document.getElementById('goal-modal');
        if (!modal) return;

        const form = document.getElementById('goal-form');
        const closeBtn = modal.querySelector('.close');
        const cancelBtn = document.getElementById('cancel-goal-btn');

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
                this.saveGoal();
            });
        }
    },

    /**
     * Инициализация модального окна папки
     */
    initFolderModal() {
        const modal = document.getElementById('goal-folder-modal');
        if (!modal) return;

        const form = document.getElementById('goal-folder-form');
        const closeBtn = modal.querySelector('.close');
        const cancelBtn = document.getElementById('cancel-goal-folder-btn');

        [closeBtn, cancelBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    this.closeFolderModal();
                });
            }
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeFolderModal();
            }
        });

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveFolder();
            });
        }
    },

    /**
     * Открыть модальное окно папки
     */
    openFolderModal() {
        const modal = document.getElementById('goal-folder-modal');
        if (modal) {
            modal.classList.add('active');
            const nameInput = document.getElementById('goal-folder-name-input');
            if (nameInput) nameInput.focus();
        }
    },

    /**
     * Закрыть модальное окно папки
     */
    closeFolderModal() {
        const modal = document.getElementById('goal-folder-modal');
        const form = document.getElementById('goal-folder-form');
        if (modal) modal.classList.remove('active');
        if (form) form.reset();
    },

    /**
     * Сохранить папку
     */
    saveFolder() {
        const nameInput = document.getElementById('goal-folder-name-input');
        const categoryInput = document.getElementById('goal-folder-category-input');

        if (!nameInput || !nameInput.value.trim()) return;

        let folders = [];
        try {
            folders = JSON.parse(localStorage.getItem('goalFolders') || '[]');
        } catch (e) {
            folders = [];
        }

        folders.push({
            id: generateId(),
            name: nameInput.value.trim(),
            category: categoryInput?.value || 'medium',
            createdAt: new Date().toISOString()
        });

        localStorage.setItem('goalFolders', JSON.stringify(folders));
        this.closeFolderModal();
        this.render();
        this.loadFoldersIntoSelect();
    },

    /**
     * Удалить папку
     */
    deleteFolder(folderId) {
        if (confirm('Вы уверены, что хотите удалить эту папку? Цели в ней останутся.')) {
            let folders = JSON.parse(localStorage.getItem('goalFolders') || '[]');
            folders = folders.filter(f => f.id !== folderId);
            localStorage.setItem('goalFolders', JSON.stringify(folders));
            this.render();
        }
    },

    /**
     * Получить папки
     */
    getFolders() {
        try {
            return JSON.parse(localStorage.getItem('goalFolders') || '[]');
        } catch (e) {
            return [];
        }
    },

    /**
     * Загрузить папки в select
     */
    loadFoldersIntoSelect() {
        const folderInput = document.getElementById('goal-folder-input');
        if (!folderInput) return;

        const folders = this.getFolders();
        folderInput.innerHTML = '<option value="">Без папки</option>';
        
        folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder.id;
            option.textContent = folder.name;
            folderInput.appendChild(option);
        });
    },

    /**
     * Открыть модальное окно цели
     */
    openModal(goalId = null) {
        const modal = document.getElementById('goal-modal');
        const form = document.getElementById('goal-form');
        const titleInput = document.getElementById('goal-title-input');
        const descInput = document.getElementById('goal-description-input');
        const deadlineInput = document.getElementById('goal-deadline-input');
        const modalTitle = document.getElementById('modal-goal-title');

        if (!modal || !form) return;

        this.editingGoalId = goalId;
        this.loadFoldersIntoSelect();

        const categoryInput = document.getElementById('goal-category-input');
        const folderInput = document.getElementById('goal-folder-input');
        
        if (goalId) {
            const goals = DataManager.getGoals();
            const goal = goals.find(g => g.id === goalId);
            if (goal) {
                if (modalTitle) modalTitle.textContent = 'Редактировать цель';
                if (titleInput) titleInput.value = goal.title;
                if (descInput) descInput.value = goal.description || '';
                if (deadlineInput) deadlineInput.value = goal.deadline || '';
                if (categoryInput) categoryInput.value = goal.category || 'medium';
                if (folderInput) folderInput.value = goal.folderId || '';
            }
        } else {
            if (modalTitle) modalTitle.textContent = 'Добавить цель';
            form.reset();
            if (categoryInput) categoryInput.value = 'medium';
        }

        modal.classList.add('active');
        if (titleInput) titleInput.focus();
    },

    /**
     * Закрыть модальное окно
     */
    closeModal() {
        const modal = document.getElementById('goal-modal');
        const form = document.getElementById('goal-form');
        if (modal) modal.classList.remove('active');
        if (form) form.reset();
        this.editingGoalId = null;
    },

    /**
     * Сохранить цель
     */
    saveGoal() {
        const titleInput = document.getElementById('goal-title-input');
        const descInput = document.getElementById('goal-description-input');
        const deadlineInput = document.getElementById('goal-deadline-input');

        if (!titleInput) return;

        const goals = DataManager.getGoals();

        const categoryInput = document.getElementById('goal-category-input');
        const folderInput = document.getElementById('goal-folder-input');
        
        if (this.editingGoalId) {
            const goalIndex = goals.findIndex(g => g.id === this.editingGoalId);
            if (goalIndex !== -1) {
                goals[goalIndex] = {
                    ...goals[goalIndex],
                    title: titleInput.value.trim(),
                    description: descInput.value.trim(),
                    deadline: deadlineInput?.value || '',
                    category: categoryInput?.value || 'medium',
                    folderId: folderInput?.value || null
                };
            }
        } else {
            const newGoal = {
                id: generateId(),
                title: titleInput.value.trim(),
                description: descInput.value.trim(),
                deadline: deadlineInput?.value || '',
                category: categoryInput?.value || 'medium',
                folderId: folderInput?.value || null,
                progress: 0,
                createdAt: new Date().toISOString()
            };
            goals.push(newGoal);
        }

        DataManager.saveGoals(goals);
        this.closeModal();
        this.render();
        if (typeof Dashboard !== 'undefined') Dashboard.update();
    },

    /**
     * Удалить цель
     */
    deleteGoal(goalId) {
        if (confirm('Вы уверены, что хотите удалить эту цель?')) {
            const goals = DataManager.getGoals();
            const filteredGoals = goals.filter(g => g.id !== goalId);
            DataManager.saveGoals(filteredGoals);
            this.render();
            if (typeof Dashboard !== 'undefined') Dashboard.update();
        }
    },

    /**
     * Получить отфильтрованные цели
     */
    getFilteredGoals() {
        const goals = DataManager.getGoals();
        if (this.currentFilter === 'all') return goals;
        return goals.filter(g => g.category === this.currentFilter);
    },

    /**
     * Отрисовка списка целей
     */
    render() {
        const goalsList = document.getElementById('goals-list');
        if (!goalsList) return;

        const goals = this.getFilteredGoals();
        const folders = this.getFolders();

        if (goals.length === 0 && folders.length === 0) {
            goalsList.innerHTML = '<div class="task-empty">Целей пока нет. Добавьте первую цель!</div>';
            return;
        }

        // Стандартные категории
        const categories = [
            { key: 'short', title: 'Краткосрочные', icon: 'fas fa-clock' },
            { key: 'medium', title: 'Среднесрочные', icon: 'fas fa-calendar-week' },
            { key: 'long', title: 'Долгосрочные', icon: 'fas fa-calendar-alt' }
        ];

        let html = '';

        categories.forEach(category => {
            if (this.currentFilter !== 'all' && this.currentFilter !== category.key) return;

            // Цели без папки в этой категории
            const categoryGoals = goals.filter(g => g.category === category.key && !g.folderId);
            // Папки в этой категории
            const categoryFolders = folders.filter(f => f.category === category.key);

            html += `
                <div class="goal-category-section">
                    <div class="goal-category-header" onclick="Goals.toggleCategory('${category.key}')">
                        <i class="fas fa-chevron-down category-chevron" id="chevron-${category.key}"></i>
                        <i class="${category.icon}"></i>
                        <span>${category.title}</span>
                    </div>
                    <div class="goal-category-content" id="category-${category.key}">
            `;

            // Пользовательские папки
            categoryFolders.forEach(folder => {
                const folderGoals = goals.filter(g => g.folderId === folder.id);
                html += `
                    <div class="goal-folder custom-folder">
                        <div class="goal-folder-header" onclick="Goals.toggleFolder('${folder.id}')">
                            <i class="fas fa-chevron-down"></i>
                            <div class="goal-folder-title">
                                <i class="fas fa-folder"></i> ${escapeHtml(folder.name)} (${folderGoals.length})
                            </div>
                            <button class="btn-icon btn-small" onclick="event.stopPropagation(); Goals.deleteFolder('${folder.id}')" title="Удалить папку">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        <div class="goal-folder-content" id="folder-${folder.id}">
                            ${this.renderGoalItems(folderGoals)}
                        </div>
                    </div>
                `;
            });

            // Цели без папки
            html += this.renderGoalItems(categoryGoals);

            html += `
                    </div>
                </div>
            `;
        });

        goalsList.innerHTML = html;
    },

    /**
     * Отрисовка элементов целей
     */
    renderGoalItems(goals) {
        if (goals.length === 0) return '';

        return goals.map(goal => {
            const deadlineStr = goal.deadline ? formatShortDate(goal.deadline) : '';
            return `
                <div class="goal-item">
                    <div class="goal-header">
                        <div class="goal-title">${escapeHtml(goal.title)}</div>
                        <div class="task-actions">
                            <button class="btn btn-secondary btn-small" onclick="Goals.openModal('${goal.id}')" title="Редактировать">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-small" onclick="Goals.deleteGoal('${goal.id}')" title="Удалить">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    ${goal.description ? `<div class="goal-description">${escapeHtml(goal.description)}</div>` : ''}
                    ${deadlineStr ? `<div class="goal-deadline"><i class="fas fa-calendar"></i> Срок: ${deadlineStr}</div>` : ''}
                    <div class="goal-progress">
                        <div class="goal-progress-bar" style="width: ${goal.progress || 0}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Переключить категорию
     */
    toggleCategory(categoryKey) {
        const content = document.getElementById(`category-${categoryKey}`);
        const chevron = document.getElementById(`chevron-${categoryKey}`);
        
        if (content) {
            content.classList.toggle('collapsed');
        }
        if (chevron) {
            chevron.classList.toggle('rotated');
        }
    },

    /**
     * Переключить папку
     */
    toggleFolder(folderId) {
        const folder = document.getElementById(`folder-${folderId}`);
        const header = folder?.previousElementSibling;
        
        if (folder && header) {
            folder.classList.toggle('collapsed');
            header.classList.toggle('collapsed');
        }
    }
};
