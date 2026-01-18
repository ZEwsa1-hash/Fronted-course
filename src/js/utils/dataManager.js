/**
 * Модуль управления данными в LocalStorage
 * Обеспечивает сохранение и загрузку всех данных приложения
 */
const DataManager = {
    /**
     * Получить все данные приложения
     * @returns {Object} Объект с задачами, целями, заметками, проектами
     */
    getAllData() {
        return {
            tasks: this.getTasks(),
            goals: this.getGoals(),
            notes: this.getNotes(),
            projects: this.getProjects(),
            archive: this.getArchive()
        };
    },

    /**
     * Сохранить все данные
     * @param {Object} data - Данные для сохранения
     */
    saveAllData(data) {
        if (data.tasks) localStorage.setItem('tasks', JSON.stringify(data.tasks));
        if (data.goals) localStorage.setItem('goals', JSON.stringify(data.goals));
        if (data.notes) localStorage.setItem('notes', JSON.stringify(data.notes));
        if (data.projects) localStorage.setItem('projects', JSON.stringify(data.projects));
        if (data.archive) localStorage.setItem('archive', JSON.stringify(data.archive));
    },

    // ========== Задачи ==========
    getTasks() {
        const tasks = localStorage.getItem('tasks');
        return tasks ? JSON.parse(tasks) : [];
    },

    saveTasks(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    },

    // ========== Цели ==========
    getGoals() {
        const goals = localStorage.getItem('goals');
        return goals ? JSON.parse(goals) : [];
    },

    saveGoals(goals) {
        localStorage.setItem('goals', JSON.stringify(goals));
    },

    // ========== Заметки ==========
    getNotes() {
        const notes = localStorage.getItem('notes');
        return notes ? JSON.parse(notes) : [];
    },

    saveNotes(notes) {
        localStorage.setItem('notes', JSON.stringify(notes));
    },

    // ========== Проекты ==========
    getProjects() {
        const projects = localStorage.getItem('projects');
        return projects ? JSON.parse(projects) : [];
    },

    saveProjects(projects) {
        localStorage.setItem('projects', JSON.stringify(projects));
    },

    // ========== Архив ==========
    getArchive() {
        const archive = localStorage.getItem('archive');
        return archive ? JSON.parse(archive) : [];
    },

    saveArchive(archive) {
        localStorage.setItem('archive', JSON.stringify(archive));
    },

    // ========== Списки задач ==========
    getTaskLists() {
        const lists = localStorage.getItem('taskLists');
        return lists ? JSON.parse(lists) : [];
    },

    saveTaskLists(lists) {
        localStorage.setItem('taskLists', JSON.stringify(lists));
    },

    // ========== Папки целей ==========
    getGoalFolders() {
        const folders = localStorage.getItem('goalFolders');
        return folders ? JSON.parse(folders) : [];
    },

    saveGoalFolders(folders) {
        localStorage.setItem('goalFolders', JSON.stringify(folders));
    },

    /**
     * Очистить все данные
     */
    clearAll() {
        localStorage.removeItem('tasks');
        localStorage.removeItem('goals');
        localStorage.removeItem('notes');
        localStorage.removeItem('projects');
        localStorage.removeItem('archive');
        localStorage.removeItem('taskLists');
        localStorage.removeItem('goalFolders');
    }
};
