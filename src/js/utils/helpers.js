/**
 * Вспомогательные функции
 */

/**
 * Экранирование HTML для предотвращения XSS
 * @param {string} text - Текст для экранирования
 * @returns {string} Экранированный текст
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Форматирование даты
 * @param {string|Date} date - Дата для форматирования
 * @returns {string} Отформатированная дата
 */
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Форматирование короткой даты
 * @param {string|Date} date - Дата для форматирования
 * @returns {string} Отформатированная дата
 */
function formatShortDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU');
}

/**
 * Генерация уникального ID
 * @returns {string} Уникальный ID
 */
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}
