/**
 * Модуль управления задачами (Obsidian стиль)
 */
const Tasks = {
    currentList: 'all',
    editingTaskId: null,
    selectedTaskId: null,
    sidebarOpen: false,
    searchQuery: '',
    dateFilter: 'all',
    statusFilter: 'all',

    /**
     * Инициализация модуля задач
     */
    init() {
        const addTaskBtn = document.getElementById('add-task-btn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                this.openModal();
            });
        }

        const addListBtn = document.getElementById('add-task-list-btn');
        if (addListBtn) {
            addListBtn.addEventListener('click', () => {
                this.openListModal();
            });
        }

        // Кнопка открытия/закрытия боковой панели
        const sidebarToggle = document.getElementById('tasks-sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        const closeSidebar = document.getElementById('close-tasks-sidebar');
        if (closeSidebar) {
            closeSidebar.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Фильтры
        const searchInput = document.getElementById('tasks-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.render();
            });
        }

        const dateFilter = document.getElementById('tasks-date-filter');
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.dateFilter = e.target.value;
                this.render();
            });
        }

        const statusFilter = document.getElementById('tasks-status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.statusFilter = e.target.value;
                this.render();
            });
        }

        this.initTaskModal();
        this.initListModal();
        this.renderLists();
    },

    /**
     * Переключить боковую панель
     */
    toggleSidebar() {
        const sidebar = document.getElementById('tasks-sidebar');
        const toggle = document.getElementById('tasks-sidebar-toggle');
        
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
            this.sidebarOpen = !sidebar.classList.contains('collapsed');
        }
        if (toggle) {
            toggle.classList.toggle('open', this.sidebarOpen);
        }
    },

    /**
     * Инициализация модального окна задачи
     */
    initTaskModal() {
        const modal = document.getElementById('task-modal');
        if (!modal) return;

        const form = document.getElementById('task-form');
        const closeBtn = modal.querySelector('.close');
        const cancelBtn = document.getElementById('cancel-task-btn');

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
                this.saveTask();
            });
        }
    },

    /**
     * Инициализация модального окна списка
     */
    initListModal() {
        const modal = document.getElementById('task-list-modal');
        if (!modal) return;

        const form = document.getElementById('task-list-form');
        const closeBtn = modal.querySelector('.close');
        const cancelBtn = document.getElementById('cancel-task-list-btn');

        [closeBtn, cancelBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    this.closeListModal();
                });
            }
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeListModal();
            }
        });

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveList();
            });
        }
    },

    /**
     * Открыть модальное окно списка
     */
    openListModal() {
        const modal = document.getElementById('task-list-modal');
        if (modal) {
            modal.classList.add('active');
            const nameInput = document.getElementById('task-list-name-input');
            if (nameInput) nameInput.focus();
        }
    },

    /**
     * Закрыть модальное окно списка
     */
    closeListModal() {
        const modal = document.getElementById('task-list-modal');
        const form = document.getElementById('task-list-form');
        if (modal) modal.classList.remove('active');
        if (form) form.reset();
    },

    /**
     * Сохранить список
     */
    saveList() {
        const nameInput = document.getElementById('task-list-name-input');
        const colorInput = document.getElementById('task-list-color-input');

        if (!nameInput || !nameInput.value.trim()) return;

        const lists = DataManager.getTaskLists ? DataManager.getTaskLists() : [];
        lists.push({
            id: generateId(),
            name: nameInput.value.trim(),
            color: colorInput?.value || '#6366f1',
            createdAt: new Date().toISOString()
        });

        if (DataManager.saveTaskLists) {
            DataManager.saveTaskLists(lists);
        } else {
            localStorage.setItem('taskLists', JSON.stringify(lists));
        }

        this.closeListModal();
        this.renderLists();
        this.loadListsIntoSelect();
    },

    /**
     * Отрисовка списков задач
     */
    renderLists() {
        const container = document.getElementById('task-lists');
        if (!container) return;

        let lists = [];
        try {
            lists = JSON.parse(localStorage.getItem('taskLists') || '[]');
        } catch (e) {
            lists = [];
        }

        let html = `
            <div class="task-list-item ${this.currentList === 'all' ? 'active' : ''}" 
                 data-list="all" onclick="Tasks.selectList('all')">
                <i class="fas fa-list"></i>
                <span>Все задачи</span>
            </div>
        `;

        lists.forEach(list => {
            html += `
                <div class="task-list-item ${this.currentList === list.id ? 'active' : ''}" 
                     data-list="${list.id}" onclick="Tasks.selectList('${list.id}')">
                    <i class="fas fa-folder" style="color: ${list.color}"></i>
                    <span>${escapeHtml(list.name)}</span>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    /**
     * Выбрать список
     */
    selectList(listId) {
        this.currentList = listId;
        this.renderLists();
        this.render();

        const listName = document.getElementById('current-list-name');
        if (listName) {
            if (listId === 'all') {
                listName.textContent = 'Все задачи';
            } else {
                const lists = JSON.parse(localStorage.getItem('taskLists') || '[]');
                const list = lists.find(l => l.id === listId);
                listName.textContent = list ? list.name : 'Все задачи';
            }
        }
    },

    /**
     * Загрузить списки в select
     */
    loadListsIntoSelect() {
        const listInput = document.getElementById('task-list-input');
        if (!listInput) return;

        const lists = JSON.parse(localStorage.getItem('taskLists') || '[]');
        listInput.innerHTML = '<option value="">Все задачи</option>';
        
        lists.forEach(list => {
            const option = document.createElement('option');
            option.value = list.id;
            option.textContent = list.name;
            listInput.appendChild(option);
        });
    },

    /**
     * Открыть модальное окно задачи
     */
    openModal(taskId = null) {
        const modal = document.getElementById('task-modal');
        const form = document.getElementById('task-form');
        const titleInput = document.getElementById('task-title-input');
        const descInput = document.getElementById('task-description-input');
        const dateInput = document.getElementById('task-date-input');
        const timeInput = document.getElementById('task-time-input');
        const listInput = document.getElementById('task-list-input');
        const statusInput = document.getElementById('task-status-input');
        const modalTitle = document.getElementById('modal-task-title');

        if (!modal || !form) return;

        this.loadListsIntoSelect();
        this.editingTaskId = taskId;

        if (taskId) {
            const tasks = DataManager.getTasks();
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                if (modalTitle) modalTitle.textContent = 'Редактировать задачу';
                if (titleInput) titleInput.value = task.title;
                if (descInput) descInput.value = task.description || '';
                if (dateInput) dateInput.value = task.date || '';
                if (timeInput) timeInput.value = task.time || '';
                if (listInput) listInput.value = task.listId || '';
                if (statusInput) statusInput.value = task.status || 'pending';
            }
        } else {
            if (modalTitle) modalTitle.textContent = 'Добавить задачу';
            form.reset();
            if (listInput && this.currentList !== 'all') {
                listInput.value = this.currentList;
            }
        }

        modal.classList.add('active');
        if (titleInput) titleInput.focus();
    },

    /**
     * Закрыть модальное окно
     */
    closeModal() {
        const modal = document.getElementById('task-modal');
        const form = document.getElementById('task-form');
        if (modal) modal.classList.remove('active');
        if (form) form.reset();
        this.editingTaskId = null;
    },

    /**
     * Сохранить задачу
     */
    saveTask() {
        const titleInput = document.getElementById('task-title-input');
        const descInput = document.getElementById('task-description-input');
        const dateInput = document.getElementById('task-date-input');
        const timeInput = document.getElementById('task-time-input');
        const listInput = document.getElementById('task-list-input');
        const statusInput = document.getElementById('task-status-input');

        if (!titleInput) return;

        const tasks = DataManager.getTasks();
        const status = statusInput?.value || 'pending';
        const completed = status === 'completed';

        if (this.editingTaskId) {
            const taskIndex = tasks.findIndex(t => t.id === this.editingTaskId);
            if (taskIndex !== -1) {
                tasks[taskIndex] = {
                    ...tasks[taskIndex],
                    title: titleInput.value.trim(),
                    description: descInput?.value.trim() || '',
                    date: dateInput?.value || '',
                    time: timeInput?.value || '',
                    listId: listInput?.value || null,
                    status: status,
                    completed: completed,
                    completedAt: completed ? new Date().toISOString() : null
                };
            }
        } else {
            const newTask = {
                id: generateId(),
                title: titleInput.value.trim(),
                description: descInput?.value.trim() || '',
                date: dateInput?.value || '',
                time: timeInput?.value || '',
                listId: listInput?.value || null,
                status: status,
                completed: completed,
                completedAt: completed ? new Date().toISOString() : null,
                createdAt: new Date().toISOString()
            };
            tasks.push(newTask);
        }

        DataManager.saveTasks(tasks);
        this.closeModal();
        this.render();
        if (typeof Dashboard !== 'undefined') Dashboard.update();
        if (typeof Calendar !== 'undefined') Calendar.render();
    },

    /**
     * Удалить задачу
     */
    deleteTask(taskId) {
        if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
            const tasks = DataManager.getTasks();
            const filteredTasks = tasks.filter(t => t.id !== taskId);
            DataManager.saveTasks(filteredTasks);
            this.closeDetailPanel();
            this.render();
            if (typeof Dashboard !== 'undefined') Dashboard.update();
        }
    },

    /**
     * Переместить задачу в архив
     */
    moveToArchive(taskId) {
        const tasks = DataManager.getTasks();
        const task = tasks.find(t => t.id === taskId);
        
        if (task && task.completed) {
            const archive = DataManager.getArchive();
            archive.push({
                ...task,
                archivedAt: new Date().toISOString()
            });
            DataManager.saveArchive(archive);
            
            const filteredTasks = tasks.filter(t => t.id !== taskId);
            DataManager.saveTasks(filteredTasks);
            this.closeDetailPanel();
            this.render();
            if (typeof Dashboard !== 'undefined') Dashboard.update();
        }
    },

    /**
     * Переключить статус выполнения задачи
     */
    toggleTask(taskId, event) {
        if (event) event.stopPropagation();
        
        const tasks = DataManager.getTasks();
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.status = task.completed ? 'completed' : 'pending';
            task.completedAt = task.completed ? new Date().toISOString() : null;
            DataManager.saveTasks(tasks);
            this.render();
            if (typeof Dashboard !== 'undefined') Dashboard.update();
        }
    },

    /**
     * Открыть панель деталей задачи
     */
    openDetailPanel(taskId) {
        this.selectedTaskId = taskId;
        const panel = document.getElementById('task-detail-panel');
        const content = document.getElementById('task-detail-content');
        
        if (!panel || !content) return;

        const tasks = DataManager.getTasks();
        const task = tasks.find(t => t.id === taskId);
        
        if (!task) return;

        content.innerHTML = `
            <div class="task-detail-title">${escapeHtml(task.title)}</div>
            <div class="task-detail-field">
                <label>Описание</label>
                <textarea id="detail-description" onchange="Tasks.updateTaskField('${taskId}', 'description', this.value)">${escapeHtml(task.description || '')}</textarea>
            </div>
            <div class="task-detail-field">
                <label>Дата</label>
                <input type="date" id="detail-date" value="${task.date || ''}" onchange="Tasks.updateTaskField('${taskId}', 'date', this.value)">
            </div>
            <div class="task-detail-field">
                <label>Время</label>
                <input type="time" id="detail-time" value="${task.time || ''}" onchange="Tasks.updateTaskField('${taskId}', 'time', this.value)">
            </div>
            <div class="task-detail-field">
                <label>Статус</label>
                <select id="detail-status" onchange="Tasks.updateTaskField('${taskId}', 'status', this.value)">
                    <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>В процессе</option>
                    <option value="half" ${task.status === 'half' ? 'selected' : ''}>На половине</option>
                    <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Выполнено</option>
                </select>
            </div>
            <div style="margin-top: 2rem; display: flex; gap: 0.5rem;">
                <button class="btn btn-danger" onclick="Tasks.deleteTask('${taskId}')">
                    <i class="fas fa-trash"></i> Удалить
                </button>
                ${task.completed ? `
                    <button class="btn btn-info" onclick="Tasks.moveToArchive('${taskId}')">
                        <i class="fas fa-archive"></i> В архив
                    </button>
                ` : ''}
            </div>
        `;

        panel.classList.add('open');
    },

    /**
     * Закрыть панель деталей
     */
    closeDetailPanel() {
        const panel = document.getElementById('task-detail-panel');
        if (panel) panel.classList.remove('open');
        this.selectedTaskId = null;
    },

    /**
     * Обновить поле задачи
     */
    updateTaskField(taskId, field, value) {
        const tasks = DataManager.getTasks();
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task[field] = value;
            if (field === 'status') {
                task.completed = value === 'completed';
                task.completedAt = task.completed ? new Date().toISOString() : null;
            }
            DataManager.saveTasks(tasks);
            this.render();
            if (typeof Dashboard !== 'undefined') Dashboard.update();
        }
    },

    /**
     * Получить отфильтрованные задачи
     */
    getFilteredTasks() {
        let tasks = DataManager.getTasks();
        
        // Фильтр по списку
        if (this.currentList !== 'all') {
            tasks = tasks.filter(t => t.listId === this.currentList);
        }

        // Поиск по тексту
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            tasks = tasks.filter(t => 
                t.title.toLowerCase().includes(query) ||
                (t.description && t.description.toLowerCase().includes(query))
            );
        }

        // Фильтр по дате
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const monthEnd = new Date(today);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        switch (this.dateFilter) {
            case 'today':
                tasks = tasks.filter(t => {
                    if (!t.date) return false;
                    const taskDate = new Date(t.date);
                    taskDate.setHours(0, 0, 0, 0);
                    return taskDate.getTime() === today.getTime();
                });
                break;
            case 'week':
                tasks = tasks.filter(t => {
                    if (!t.date) return false;
                    const taskDate = new Date(t.date);
                    return taskDate >= today && taskDate <= weekEnd;
                });
                break;
            case 'month':
                tasks = tasks.filter(t => {
                    if (!t.date) return false;
                    const taskDate = new Date(t.date);
                    return taskDate >= today && taskDate <= monthEnd;
                });
                break;
            case 'overdue':
                tasks = tasks.filter(t => {
                    if (!t.date || t.completed) return false;
                    const taskDate = new Date(t.date);
                    return taskDate < today;
                });
                break;
            case 'no-date':
                tasks = tasks.filter(t => !t.date);
                break;
        }

        // Фильтр по статусу
        if (this.statusFilter !== 'all') {
            tasks = tasks.filter(t => t.status === this.statusFilter);
        }

        return tasks;
    },

    /**
     * Обновить диаграмму прогресса
     */
    updateProgressChart() {
        const tasks = this.getFilteredTasks();
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const half = tasks.filter(t => t.status === 'half').length;
        const pending = tasks.filter(t => t.status === 'pending' || !t.status).length;

        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        const circumference = 283;
        const offset = circumference - (percent / 100) * circumference;

        const progressFill = document.getElementById('progress-ring-fill');
        const progressPercent = document.getElementById('progress-percent');
        const tasksInProgress = document.getElementById('tasks-in-progress');
        const tasksHalfDone = document.getElementById('tasks-half-done');
        const tasksCompleted = document.getElementById('tasks-completed');

        if (progressFill) progressFill.style.strokeDashoffset = offset;
        if (progressPercent) progressPercent.textContent = `${percent}%`;
        if (tasksInProgress) tasksInProgress.textContent = pending;
        if (tasksHalfDone) tasksHalfDone.textContent = half;
        if (tasksCompleted) tasksCompleted.textContent = completed;
    },

    /**
     * Отрисовка списка задач
     */
    render() {
        const tasksList = document.getElementById('tasks-list');
        if (!tasksList) return;

        const tasks = this.getFilteredTasks();
        this.updateProgressChart();

        if (tasks.length === 0) {
            tasksList.innerHTML = '<div class="task-empty">Задач пока нет. Добавьте первую задачу!</div>';
            return;
        }

        // Сортировка: сначала незавершенные
        const sortedTasks = [...tasks].sort((a, b) => {
            if (a.completed && !b.completed) return 1;
            if (!a.completed && b.completed) return -1;
            return 0;
        });

        tasksList.innerHTML = sortedTasks.map(task => {
            const dateStr = task.date ? formatShortDate(task.date) : '';
            const timeStr = task.time || '';
            
            return `
                <div class="google-task-item ${task.completed ? 'completed' : ''}" 
                     onclick="Tasks.openDetailPanel('${task.id}')">
                    <div class="google-task-checkbox ${task.completed ? 'checked' : ''}" 
                         onclick="Tasks.toggleTask('${task.id}', event)"></div>
                    <div class="google-task-content">
                        <div class="google-task-title">${escapeHtml(task.title)}</div>
                        <div class="google-task-meta">
                            ${dateStr ? `<span><i class="fas fa-calendar"></i> ${dateStr}</span>` : ''}
                            ${timeStr ? `<span><i class="fas fa-clock"></i> ${timeStr}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
};
