/**
 * Модуль архива (корзина выполненных задач)
 */
const Archive = {
    currentFilter: 'all',

    /**
     * Инициализация модуля архива
     */
    init() {
        // Фильтры по времени
        document.querySelectorAll('.archive-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.archive-filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.getAttribute('data-filter');
                this.render();
            });
        });
    },

    /**
     * Получить отфильтрованный архив
     */
    getFilteredArchive() {
        const archive = DataManager.getArchive();
        const now = new Date();
        
        switch(this.currentFilter) {
            case 'day':
                const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                return archive.filter(t => new Date(t.archivedAt) >= dayAgo);
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return archive.filter(t => new Date(t.archivedAt) >= weekAgo);
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return archive.filter(t => new Date(t.archivedAt) >= monthAgo);
            case 'year':
                const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                return archive.filter(t => new Date(t.archivedAt) >= yearAgo);
            default:
                return archive;
        }
    },

    /**
     * Восстановить задачу из архива
     */
    restoreTask(taskId) {
        const archive = DataManager.getArchive();
        const task = archive.find(t => t.id === taskId);
        
        if (task) {
            const tasks = DataManager.getTasks();
            tasks.push({
                ...task,
                archivedAt: undefined
            });
            DataManager.saveTasks(tasks);
            
            const filteredArchive = archive.filter(t => t.id !== taskId);
            DataManager.saveArchive(filteredArchive);
            this.render();
            if (typeof Dashboard !== 'undefined') Dashboard.update();
        }
    },

    /**
     * Удалить задачу из архива навсегда
     */
    deletePermanently(taskId) {
        if (confirm('Вы уверены, что хотите удалить эту задачу навсегда? Это действие нельзя отменить!')) {
            const archive = DataManager.getArchive();
            const filteredArchive = archive.filter(t => t.id !== taskId);
            DataManager.saveArchive(filteredArchive);
            this.render();
        }
    },

    /**
     * Очистить весь архив
     */
    clearArchive() {
        if (confirm('Вы уверены, что хотите очистить весь архив? Это действие нельзя отменить!')) {
            DataManager.saveArchive([]);
            this.render();
        }
    },

    /**
     * Отрисовка архива
     */
    render() {
        const archiveList = document.getElementById('archive-list');
        if (!archiveList) return;

        const archive = this.getFilteredArchive();

        if (archive.length === 0) {
            archiveList.innerHTML = '<div class="task-empty">Архив пуст</div>';
            return;
        }

        const filterLabels = {
            'all': 'всего времени',
            'day': 'последний день',
            'week': 'последнюю неделю',
            'month': 'последний месяц',
            'year': 'последний год'
        };

        archiveList.innerHTML = `
            <div class="archive-header">
                <p>В архиве за ${filterLabels[this.currentFilter]}: ${archive.length} ${this.getTaskWord(archive.length)}</p>
                <button class="btn btn-danger" onclick="Archive.clearArchive()">
                    <i class="fas fa-trash"></i> Очистить архив
                </button>
            </div>
            <div class="task-list">
                ${archive.map(task => {
                    const dateStr = task.date ? formatShortDate(task.date) : '';
                    const archivedDateStr = task.archivedAt ? formatShortDate(task.archivedAt) : '';
                    
                    return `
                        <div class="task-item completed">
                            <div class="task-content">
                                <div class="task-title">${escapeHtml(task.title)}</div>
                                ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                                <div class="task-meta">
                                    ${dateStr ? `<span class="task-date"><i class="fas fa-calendar"></i> ${dateStr}</span>` : ''}
                                    ${archivedDateStr ? `<span class="task-date"><i class="fas fa-archive"></i> Архивировано: ${archivedDateStr}</span>` : ''}
                                </div>
                            </div>
                            <div class="task-actions">
                                <button class="btn btn-success btn-small" onclick="Archive.restoreTask('${task.id}')" title="Восстановить">
                                    <i class="fas fa-undo"></i>
                                </button>
                                <button class="btn btn-danger btn-small" onclick="Archive.deletePermanently('${task.id}')" title="Удалить навсегда">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    /**
     * Получить правильное склонение слова "задача"
     */
    getTaskWord(count) {
        if (count === 1) return 'задача';
        if (count >= 2 && count <= 4) return 'задачи';
        return 'задач';
    }
};
