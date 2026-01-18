/**
 * Модуль управления проектами (колонки со скроллом)
 */
const Projects = {
    editingProjectId: null,
    currentProjectId: null,

    /**
     * Инициализация модуля проектов
     */
    init() {
        const addProjectBtn = document.getElementById('add-project-btn');
        if (addProjectBtn) {
            addProjectBtn.addEventListener('click', () => {
                this.openModal();
            });
        }

        this.initProjectModal();
    },

    /**
     * Инициализация модального окна проекта
     */
    initProjectModal() {
        const modal = document.getElementById('project-modal');
        if (!modal) return;

        const form = document.getElementById('project-form');
        const closeBtn = modal.querySelector('.close');
        const cancelBtn = document.getElementById('cancel-project-btn');

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
                this.saveProject();
            });
        }
    },

    /**
     * Открыть модальное окно проекта
     */
    openModal(projectId = null) {
        const modal = document.getElementById('project-modal');
        const form = document.getElementById('project-form');
        const nameInput = document.getElementById('project-name-input');
        const descInput = document.getElementById('project-description-input');
        const colorInput = document.getElementById('project-color-input');
        const modalTitle = document.getElementById('modal-project-title');

        if (!modal || !form) return;

        this.editingProjectId = projectId;

        if (projectId) {
            const projects = DataManager.getProjects();
            const project = projects.find(p => p.id === projectId);
            if (project) {
                if (modalTitle) modalTitle.textContent = 'Редактировать проект';
                if (nameInput) nameInput.value = project.name;
                if (descInput) descInput.value = project.description || '';
                if (colorInput) colorInput.value = project.color || '#4a90e2';
            }
        } else {
            if (modalTitle) modalTitle.textContent = 'Добавить проект';
            form.reset();
            if (colorInput) colorInput.value = '#4a90e2';
        }

        modal.classList.add('active');
        if (nameInput) nameInput.focus();
    },

    /**
     * Закрыть модальное окно
     */
    closeModal() {
        const modal = document.getElementById('project-modal');
        const form = document.getElementById('project-form');
        if (modal) modal.classList.remove('active');
        if (form) form.reset();
        this.editingProjectId = null;
    },

    /**
     * Сохранить проект
     */
    saveProject() {
        const nameInput = document.getElementById('project-name-input');
        const descInput = document.getElementById('project-description-input');
        const colorInput = document.getElementById('project-color-input');

        if (!nameInput) return;

        const projects = DataManager.getProjects();

        if (this.editingProjectId) {
            const projectIndex = projects.findIndex(p => p.id === this.editingProjectId);
            if (projectIndex !== -1) {
                projects[projectIndex] = {
                    ...projects[projectIndex],
                    name: nameInput.value.trim(),
                    description: descInput.value.trim(),
                    color: colorInput?.value || '#4a90e2'
                };
            }
        } else {
            const newProject = {
                id: generateId(),
                name: nameInput.value.trim(),
                description: descInput.value.trim(),
                color: colorInput?.value || '#4a90e2',
                createdAt: new Date().toISOString()
            };
            projects.push(newProject);
        }

        DataManager.saveProjects(projects);
        this.closeModal();
        this.render();
        if (typeof Dashboard !== 'undefined') Dashboard.update();
        if (typeof Tasks !== 'undefined') Tasks.loadListsIntoSelect();
    },

    /**
     * Удалить проект
     */
    deleteProject(projectId, event) {
        if (event) event.stopPropagation();
        if (confirm('Вы уверены, что хотите удалить этот проект?')) {
            const projects = DataManager.getProjects();
            const filteredProjects = projects.filter(p => p.id !== projectId);
            DataManager.saveProjects(filteredProjects);
            this.render();
            if (typeof Tasks !== 'undefined') Tasks.loadListsIntoSelect();
        }
    },

    /**
     * Открыть страницу проекта
     */
    openProject(projectId) {
        this.currentProjectId = projectId;
        
        // Скрыть страницу проектов, показать детали
        document.getElementById('projects').classList.remove('active');
        document.getElementById('project-detail').classList.add('active');
        
        this.renderProjectDetail();
    },

    /**
     * Вернуться к списку проектов
     */
    backToList() {
        this.currentProjectId = null;
        document.getElementById('project-detail').classList.remove('active');
        document.getElementById('projects').classList.add('active');
    },

    /**
     * Добавить задачу в проект
     */
    addTaskToProject() {
        if (typeof Tasks !== 'undefined' && this.currentProjectId) {
            Tasks.openModal();
            // Установить проект в форме
            setTimeout(() => {
                const listInput = document.getElementById('task-list-input');
                if (listInput) {
                    // Найти проект и установить его
                }
            }, 100);
        }
    },

    /**
     * Отрисовка деталей проекта
     */
    renderProjectDetail() {
        const titleEl = document.getElementById('project-detail-title');
        const contentEl = document.getElementById('project-detail-content');
        
        if (!contentEl) return;

        const projects = DataManager.getProjects();
        const project = projects.find(p => p.id === this.currentProjectId);
        
        if (!project) {
            this.backToList();
            return;
        }

        if (titleEl) titleEl.textContent = project.name;

        const tasks = DataManager.getTasks().filter(t => t.projectId === this.currentProjectId);
        const completedTasks = tasks.filter(t => t.completed).length;
        const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

        contentEl.innerHTML = `
            <div class="project-detail-info">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <div class="project-color-dot" style="background-color: ${project.color}; width: 20px; height: 20px;"></div>
                    <h3>${escapeHtml(project.name)}</h3>
                </div>
                ${project.description ? `<p style="color: var(--text-light); margin-bottom: 1rem;">${escapeHtml(project.description)}</p>` : ''}
                <div style="display: flex; gap: 2rem; margin-bottom: 1rem;">
                    <div>
                        <span style="font-size: 2rem; font-weight: 700; color: var(--primary-color);">${tasks.length}</span>
                        <span style="color: var(--text-light);"> задач</span>
                    </div>
                    <div>
                        <span style="font-size: 2rem; font-weight: 700; color: var(--success-color);">${completedTasks}</span>
                        <span style="color: var(--text-light);"> выполнено</span>
                    </div>
                    <div>
                        <span style="font-size: 2rem; font-weight: 700; color: var(--primary-color);">${progress}%</span>
                        <span style="color: var(--text-light);"> прогресс</span>
                    </div>
                </div>
                <div class="goal-progress" style="height: 8px;">
                    <div class="goal-progress-bar" style="width: ${progress}%; background-color: ${project.color}"></div>
                </div>
            </div>
            <h3 style="margin: 1.5rem 0 1rem;">Задачи проекта</h3>
            <div class="project-detail-tasks">
                ${tasks.length === 0 ? '<p style="color: var(--text-light);">Нет задач в этом проекте</p>' : 
                    tasks.map(task => `
                        <div class="task-item ${task.completed ? 'completed' : ''}">
                            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                                   onchange="Tasks.toggleTask('${task.id}'); Projects.renderProjectDetail();">
                            <div class="task-content">
                                <div class="task-title">${escapeHtml(task.title)}</div>
                                ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        `;
    },

    /**
     * Отрисовка списка проектов (колонки)
     */
    render() {
        const projectsColumns = document.getElementById('projects-columns');
        if (!projectsColumns) return;

        const projects = DataManager.getProjects();
        const tasks = DataManager.getTasks();

        if (projects.length === 0) {
            projectsColumns.innerHTML = '<div class="task-empty">Проектов пока нет. Добавьте первый проект!</div>';
            return;
        }

        projectsColumns.innerHTML = projects.map(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const completedTasks = projectTasks.filter(t => t.completed).length;
            const totalTasks = projectTasks.length;

            return `
                <div class="project-column" onclick="Projects.openProject('${project.id}')">
                    <div class="project-column-header">
                        <div class="project-color-dot" style="background-color: ${project.color}"></div>
                        <div class="project-column-title">${escapeHtml(project.name)}</div>
                        <div class="project-column-count">${completedTasks}/${totalTasks}</div>
                    </div>
                    <div class="project-column-content">
                        ${projectTasks.slice(0, 5).map(task => `
                            <div class="project-task-item ${task.completed ? 'completed' : ''}">
                                ${escapeHtml(task.title)}
                            </div>
                        `).join('')}
                        ${projectTasks.length > 5 ? `<div style="color: var(--text-light); font-size: 0.8rem; padding: 0.5rem;">+${projectTasks.length - 5} ещё</div>` : ''}
                        ${projectTasks.length === 0 ? '<div style="color: var(--text-light); font-size: 0.85rem;">Нет задач</div>' : ''}
                    </div>
                </div>
            `;
        }).join('') + `
            <div class="project-column" style="border: 2px dashed var(--border-color); cursor: pointer; display: flex; align-items: center; justify-content: center; min-height: 200px;" onclick="Projects.openModal()">
                <div style="text-align: center; color: var(--text-light);">
                    <i class="fas fa-plus" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                    <div>Новый проект</div>
                </div>
            </div>
        `;
    }
};
