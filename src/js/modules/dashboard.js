/**
 * Модуль главной страницы (Dashboard)
 */
const Dashboard = {
    /**
     * Обновление данных на главной странице
     */
    update() {
        const tasks = DataManager.getTasks();
        const goals = DataManager.getGoals();
        const notes = DataManager.getNotes();
        const projects = DataManager.getProjects();
        const archive = DataManager.getArchive();

        const activeTasks = tasks.filter(t => !t.completed);
        const activeTasksCount = document.getElementById('active-tasks-count');
        if (activeTasksCount) activeTasksCount.textContent = activeTasks.length;

        const quickTasksCount = document.getElementById('quick-tasks-count');
        if (quickTasksCount) quickTasksCount.textContent = activeTasks.length;

        const today = new Date().toDateString();
        const completedToday = tasks.filter(t => {
            if (!t.completed) return false;
            const completedDate = t.completedAt ? new Date(t.completedAt).toDateString() : null;
            return completedDate === today;
        }).length;
        
        const completedTodayCount = document.getElementById('completed-today-count');
        if (completedTodayCount) completedTodayCount.textContent = completedToday;

        const activeGoalsCount = document.getElementById('active-goals-count');
        if (activeGoalsCount) activeGoalsCount.textContent = goals.length;

        const quickGoalsCount = document.getElementById('quick-goals-count');
        if (quickGoalsCount) quickGoalsCount.textContent = goals.length;

        const notesCount = document.getElementById('notes-count');
        if (notesCount) notesCount.textContent = notes.length;

        const quickNotesCount = document.getElementById('quick-notes-count');
        if (quickNotesCount) quickNotesCount.textContent = notes.length;

        const quickProjectsCount = document.getElementById('quick-projects-count');
        if (quickProjectsCount) quickProjectsCount.textContent = projects.length;

        const quickArchiveCount = document.getElementById('quick-archive-count');
        if (quickArchiveCount) quickArchiveCount.textContent = archive.length;

        const recentTasks = tasks.slice(-5).reverse();
        const recentTasksContainer = document.getElementById('recent-tasks');
        if (recentTasksContainer) {
            if (recentTasks.length === 0) {
                recentTasksContainer.innerHTML = '<p style="color: var(--text-light);">Задач пока нет</p>';
            } else {
                recentTasksContainer.innerHTML = recentTasks.map(task => {
                    const dateStr = task.date ? formatShortDate(task.date) : '';
                    return `
                        <div class="task-item ${task.completed ? 'completed' : ''}" style="margin-bottom: 0.5rem;">
                            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                                   onchange="Tasks.toggleTask('${task.id}')">
                            <div class="task-content">
                                <div class="task-title">${escapeHtml(task.title)}</div>
                                ${dateStr ? `<div class="task-date"><i class="fas fa-calendar"></i> ${dateStr}</div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    }
};
