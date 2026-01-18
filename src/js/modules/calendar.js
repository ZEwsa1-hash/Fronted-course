/**
 * Модуль календаря (Google Calendar стиль)
 */
const Calendar = {
    currentDate: new Date(),
    selectedDate: null,
    editingEventId: null,
    isSelecting: false,
    selectionStart: null,

    /**
     * Инициализация модуля календаря
     */
    init() {
        const prevBtn = document.getElementById('prev-month');
        const nextBtn = document.getElementById('next-month');
        const todayBtn = document.getElementById('today-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.render();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.render();
            });
        }

        if (todayBtn) {
            todayBtn.addEventListener('click', () => {
                this.currentDate = new Date();
                this.render();
            });
        }

        this.initEventModal();
    },

    /**
     * Инициализация модального окна события
     */
    initEventModal() {
        const modal = document.getElementById('calendar-event-modal');
        if (!modal) return;

        const form = document.getElementById('calendar-event-form');
        const closeBtn = modal.querySelector('.close');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeEventModal();
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeEventModal();
            }
        });

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveEvent();
            });
        }
    },

    /**
     * Открыть модальное окно добавления события
     */
    openEventModal(date = null, startTime = null, endTime = null) {
        const modal = document.getElementById('calendar-event-modal');
        const form = document.getElementById('calendar-event-form');
        const dateInput = document.getElementById('event-date-input');
        const titleInput = document.getElementById('event-title-input');
        const timeStartInput = document.getElementById('event-time-start');
        const timeEndInput = document.getElementById('event-time-end');

        if (!modal || !form) return;

        form.reset();
        this.editingEventId = null;

        if (date) {
            const dateStr = date.toISOString().split('T')[0];
            if (dateInput) dateInput.value = dateStr;
        } else {
            const today = new Date().toISOString().split('T')[0];
            if (dateInput) dateInput.value = today;
        }

        if (startTime && timeStartInput) {
            timeStartInput.value = startTime;
        }
        if (endTime && timeEndInput) {
            timeEndInput.value = endTime;
        }

        modal.classList.add('active');
        if (titleInput) titleInput.focus();
    },

    /**
     * Закрыть модальное окно события
     */
    closeEventModal() {
        const modal = document.getElementById('calendar-event-modal');
        const form = document.getElementById('calendar-event-form');
        if (modal) modal.classList.remove('active');
        if (form) form.reset();
        this.editingEventId = null;
    },

    /**
     * Сохранить событие (задачу)
     */
    saveEvent() {
        const titleInput = document.getElementById('event-title-input');
        const dateInput = document.getElementById('event-date-input');
        const timeStartInput = document.getElementById('event-time-start');
        const timeEndInput = document.getElementById('event-time-end');
        const descInput = document.getElementById('event-description-input');

        if (!titleInput || !titleInput.value.trim()) return;

        const tasks = DataManager.getTasks();
        const newTask = {
            id: generateId(),
            title: titleInput.value.trim(),
            description: descInput?.value.trim() || '',
            date: dateInput?.value || '',
            time: timeStartInput?.value || '',
            timeEnd: timeEndInput?.value || '',
            status: 'pending',
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);
        DataManager.saveTasks(tasks);
        this.closeEventModal();
        this.render();
        if (typeof Tasks !== 'undefined') Tasks.render();
        if (typeof Dashboard !== 'undefined') Dashboard.update();
    },

    /**
     * Получить задачи на определенную дату
     */
    getTasksForDate(date) {
        const tasks = DataManager.getTasks();
        const dateStr = date.toISOString().split('T')[0];
        return tasks.filter(task => task.date === dateStr);
    },

    /**
     * Обработка клика на день
     */
    handleDayClick(day, event) {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const date = new Date(year, month, day);
        
        // Открыть модальное окно для добавления задачи
        this.openEventModal(date);
    },

    /**
     * Показать задачи дня
     */
    showDayTasks(day, event) {
        event.stopPropagation();
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const date = new Date(year, month, day);
        const tasks = this.getTasksForDate(date);

        if (tasks.length === 0) {
            this.openEventModal(date);
            return;
        }

        this.showDayModal(date, tasks);
    },

    /**
     * Показать модальное окно дня
     */
    showDayModal(date, tasks) {
        const existingModal = document.getElementById('day-view-modal');
        if (existingModal) existingModal.remove();

        const monthNames = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];

        const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        const dateStr = `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]}`;

        // Группировка задач по часам
        const hourlyTasks = {};
        for (let h = 0; h < 24; h++) {
            hourlyTasks[h] = [];
        }

        tasks.forEach(task => {
            if (task.time) {
                const hour = parseInt(task.time.split(':')[0]);
                hourlyTasks[hour].push(task);
            } else {
                hourlyTasks[0].push(task);
            }
        });

        let tasksHtml = '';
        for (let h = 0; h < 24; h++) {
            const hourStr = h.toString().padStart(2, '0') + ':00';
            const hourTasks = hourlyTasks[h];
            
            tasksHtml += `
                <div class="hour-row" onclick="Calendar.openEventModalForHour(${date.getFullYear()}, ${date.getMonth()}, ${date.getDate()}, ${h})">
                    <div class="hour-label">${hourStr}</div>
                    <div class="hour-tasks">
                        ${hourTasks.map(task => `
                            <div class="hour-task ${task.completed ? 'completed' : ''}" onclick="event.stopPropagation();">
                                <span>${escapeHtml(task.title)}</span>
                                ${task.time ? `<span class="task-time">${task.time}${task.timeEnd ? ' - ' + task.timeEnd : ''}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        const modal = document.createElement('div');
        modal.id = 'day-view-modal';
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content day-view-content">
                <span class="close" onclick="Calendar.closeDayViewModal()">&times;</span>
                <div class="day-view-header">
                    <h2>${dateStr}</h2>
                    <button class="btn btn-primary" onclick="Calendar.openEventModal(new Date(${date.getFullYear()}, ${date.getMonth()}, ${date.getDate()}))">
                        <i class="fas fa-plus"></i> Добавить
                    </button>
                </div>
                <div class="day-schedule">
                    ${tasksHtml}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeDayViewModal();
            }
        });
    },

    /**
     * Открыть модальное окно для конкретного часа
     */
    openEventModalForHour(year, month, day, hour) {
        const date = new Date(year, month, day);
        const startTime = hour.toString().padStart(2, '0') + ':00';
        const endTime = (hour + 1).toString().padStart(2, '0') + ':00';
        
        this.closeDayViewModal();
        this.openEventModal(date, startTime, endTime);
    },

    /**
     * Закрыть модальное окно просмотра дня
     */
    closeDayViewModal() {
        const modal = document.getElementById('day-view-modal');
        if (modal) modal.remove();
    },

    /**
     * Отрисовка календаря
     */
    render() {
        const container = document.getElementById('calendar-container');
        const monthYearLabel = document.getElementById('current-month-year');
        
        if (!container) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const today = new Date();

        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];

        if (monthYearLabel) {
            monthYearLabel.textContent = `${monthNames[month]} ${year}`;
        }

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        let startDay = firstDay.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1;

        const daysInMonth = lastDay.getDate();
        const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

        let html = '<div class="calendar-grid">';
        
        html += '<div class="calendar-header-row">';
        dayNames.forEach(day => {
            html += `<div class="calendar-day-name">${day}</div>`;
        });
        html += '</div>';

        html += '<div class="calendar-days">';
        
        for (let i = 0; i < startDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === today.toDateString();
            const tasks = this.getTasksForDate(date);
            const hasTasks = tasks.length > 0;

            html += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${hasTasks ? 'has-tasks' : ''}" 
                     onclick="Calendar.handleDayClick(${day}, event)">
                    <span class="day-number">${day}</span>
                    <div class="calendar-day-tasks">
                        ${tasks.slice(0, 3).map(task => `
                            <div class="calendar-day-task" onclick="Calendar.showDayTasks(${day}, event)">
                                ${task.time ? task.time + ' ' : ''}${escapeHtml(task.title.substring(0, 15))}${task.title.length > 15 ? '...' : ''}
                            </div>
                        `).join('')}
                        ${tasks.length > 3 ? `<div class="calendar-day-task" onclick="Calendar.showDayTasks(${day}, event)">+${tasks.length - 3} ещё</div>` : ''}
                    </div>
                </div>
            `;
        }

        html += '</div></div>';
        container.innerHTML = html;
    }
};
