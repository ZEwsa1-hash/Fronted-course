/**
 * Модуль аналитики
 */
const Analytics = {
    /**
     * Инициализация модуля аналитики
     */
    init() {
        // Аналитика обновляется при переходе на страницу
    },

    /**
     * Обновить данные аналитики
     */
    update() {
        const tasks = DataManager.getTasks();
        const goals = DataManager.getGoals();
        const projects = DataManager.getProjects();
        const archive = DataManager.getArchive();

        // Статистика задач
        const totalTasks = tasks.length + archive.length;
        const completedTasks = tasks.filter(t => t.completed).length + archive.length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        this.setElementText('analytics-total-tasks', totalTasks);
        this.setElementText('analytics-completed-tasks', completedTasks);
        this.setElementText('analytics-completion-rate', completionRate + '%');

        // Активность
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        const todayCompleted = this.countCompletedInPeriod(tasks, archive, today, new Date());
        const weekCompleted = this.countCompletedInPeriod(tasks, archive, weekAgo, new Date());
        const monthCompleted = this.countCompletedInPeriod(tasks, archive, monthAgo, new Date());

        this.setElementText('analytics-today-completed', todayCompleted);
        this.setElementText('analytics-week-completed', weekCompleted);
        this.setElementText('analytics-month-completed', monthCompleted);

        // Цели
        const shortGoals = goals.filter(g => g.category === 'short').length;
        const longGoals = goals.filter(g => g.category === 'long').length;

        this.setElementText('analytics-total-goals', goals.length);
        this.setElementText('analytics-short-goals', shortGoals);
        this.setElementText('analytics-long-goals', longGoals);

        // Проекты
        const projectTasks = tasks.filter(t => t.projectId).length;

        this.setElementText('analytics-total-projects', projects.length);
        this.setElementText('analytics-project-tasks', projectTasks);

        // График активности за 7 дней
        this.renderActivityChart(tasks, archive);
    },

    /**
     * Подсчет выполненных задач за период
     */
    countCompletedInPeriod(tasks, archive, startDate, endDate) {
        let count = 0;

        tasks.forEach(task => {
            if (task.completed && task.completedAt) {
                const completedDate = new Date(task.completedAt);
                if (completedDate >= startDate && completedDate <= endDate) {
                    count++;
                }
            }
        });

        archive.forEach(task => {
            if (task.archivedAt) {
                const archivedDate = new Date(task.archivedAt);
                if (archivedDate >= startDate && archivedDate <= endDate) {
                    count++;
                }
            }
        });

        return count;
    },

    /**
     * Отрисовка графика активности
     */
    renderActivityChart(tasks, archive) {
        const chartContainer = document.getElementById('activity-chart');
        if (!chartContainer) return;

        const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const data = [];
        const today = new Date();

        // Собираем данные за последние 7 дней
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const count = this.countCompletedInPeriod(tasks, archive, date, nextDate);
            data.push({
                day: dayNames[date.getDay()],
                count: count
            });
        }

        const maxCount = Math.max(...data.map(d => d.count), 1);

        chartContainer.innerHTML = data.map(d => {
            const height = (d.count / maxCount) * 100;
            return `
                <div class="activity-bar" style="height: ${Math.max(height, 5)}%;">
                    <span class="activity-bar-value">${d.count}</span>
                    <span class="activity-bar-label">${d.day}</span>
                </div>
            `;
        }).join('');
    },

    /**
     * Установить текст элемента
     */
    setElementText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }
};
