/**
 * Модуль управления темой приложения
 */
const Theme = {
    /**
     * Инициализация темы
     */
    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        
        // Кнопка переключения темы
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                this.setTheme(newTheme);
            });
        }
    },

    /**
     * Установить тему
     * @param {string} theme - 'light' или 'dark'
     */
    setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        localStorage.setItem('theme', theme);
        
        // Обновить иконку переключения
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    },

    /**
     * Получить текущую тему
     * @returns {string} 'light' или 'dark'
     */
    getCurrentTheme() {
        return document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    }
};
