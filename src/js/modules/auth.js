/**
 * Модуль авторизации
 * Управляет входом и выходом пользователя
 */
const Auth = {
    currentUser: null,

    /**
     * Инициализация модуля авторизации
     */
    init() {
        this.loadUser();
        this.initAuthModal();
        this.updateAuthUI();
    },

    /**
     * Инициализация модального окна авторизации
     */
    initAuthModal() {
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const authModal = document.getElementById('auth-modal');
        const authForm = document.getElementById('auth-form');
        const closeBtn = authModal?.querySelector('.close');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.openAuthModal();
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeAuthModal();
            });
        }

        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        if (authModal) {
            window.addEventListener('click', (e) => {
                if (e.target === authModal) {
                    this.closeAuthModal();
                }
            });
        }
    },

    /**
     * Открыть модальное окно авторизации
     */
    openAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.add('active');
            const nameInput = document.getElementById('auth-name-input');
            if (nameInput) nameInput.focus();
        }
    },

    /**
     * Закрыть модальное окно авторизации
     */
    closeAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.remove('active');
            const form = document.getElementById('auth-form');
            if (form) form.reset();
        }
    },

    /**
     * Обработка входа
     */
    handleLogin() {
        const nameInput = document.getElementById('auth-name-input');
        const emailInput = document.getElementById('auth-email-input');
        
        if (!nameInput || !emailInput) return;

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        if (!name || !email) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        this.currentUser = {
            name: name,
            email: email,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.closeAuthModal();
        this.updateAuthUI();
    },

    /**
     * Выход из системы
     */
    logout() {
        if (confirm('Вы уверены, что хотите выйти?')) {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            this.updateAuthUI();
        }
    },

    /**
     * Загрузить пользователя из LocalStorage
     */
    loadUser() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    },

    /**
     * Обновить UI авторизации
     */
    updateAuthUI() {
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const userInfo = document.getElementById('user-info');

        if (this.currentUser) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (userInfo) {
                userInfo.textContent = this.currentUser.name;
                userInfo.style.display = 'block';
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userInfo) userInfo.style.display = 'none';
        }
    },

    /**
     * Получить текущего пользователя
     * @returns {Object|null} Текущий пользователь
     */
    getCurrentUser() {
        return this.currentUser;
    }
};
