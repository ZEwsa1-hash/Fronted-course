/**
 * Модуль навигации (SPA)
 * Управляет переключением между страницами без перезагрузки
 */
const Navigation = {
    /**
     * Инициализация навигации
     */
    init() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = link.getAttribute('data-page');
                this.navigateTo(pageId);
            });
        });

        // Быстрый доступ на главной
        const quickAccessCards = document.querySelectorAll('.quick-access-card');
        quickAccessCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = card.getAttribute('data-page');
                this.navigateTo(pageId);
            });
        });

    },

    /**
     * Переход на страницу
     * @param {string} pageId - ID страницы
     */
    navigateTo(pageId) {
        // Скрыть все страницы
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Показать выбранную страницу
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Обновить активную ссылку в навигации
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-page="${pageId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Обновить контент страницы
        this.updatePageContent(pageId);
    },

    /**
     * Обновить контент страницы
     * @param {string} pageId - ID страницы
     */
    updatePageContent(pageId) {
        switch(pageId) {
            case 'dashboard':
                if (typeof Dashboard !== 'undefined') Dashboard.update();
                break;
            case 'tasks':
                if (typeof Tasks !== 'undefined') Tasks.render();
                break;
            case 'calendar':
                if (typeof Calendar !== 'undefined') Calendar.render();
                break;
            case 'goals':
                if (typeof Goals !== 'undefined') Goals.render();
                break;
            case 'notes':
                if (typeof Notes !== 'undefined') Notes.render();
                break;
            case 'projects':
                if (typeof Projects !== 'undefined') Projects.render();
                break;
            case 'archive':
                if (typeof Archive !== 'undefined') Archive.render();
                break;
            case 'analytics':
                if (typeof Analytics !== 'undefined') Analytics.update();
                break;
        }
    }
};
