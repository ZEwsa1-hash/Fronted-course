/**
 * Главный файл приложения
 * Инициализирует все модули
 */

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация всех модулей
    if (typeof Navigation !== 'undefined') Navigation.init();
    if (typeof Auth !== 'undefined') Auth.init();
    if (typeof Theme !== 'undefined') Theme.init();
    if (typeof Tasks !== 'undefined') Tasks.init();
    if (typeof Goals !== 'undefined') Goals.init();
    if (typeof Notes !== 'undefined') Notes.init();
    if (typeof Calendar !== 'undefined') Calendar.init();
    if (typeof Projects !== 'undefined') Projects.init();
    if (typeof Archive !== 'undefined') Archive.init();
    if (typeof Settings !== 'undefined') Settings.init();

    // Загрузить начальные данные
    if (typeof Dashboard !== 'undefined') Dashboard.update();
    if (typeof Tasks !== 'undefined') {
        Tasks.renderLists();
        Tasks.render();
        Tasks.loadListsIntoSelect();
    }
    if (typeof Calendar !== 'undefined') Calendar.render();
    if (typeof Goals !== 'undefined') Goals.render();
    if (typeof Notes !== 'undefined') Notes.render();
    if (typeof Projects !== 'undefined') Projects.render();
    if (typeof Archive !== 'undefined') Archive.render();
    if (typeof Analytics !== 'undefined') Analytics.init();

    // Кнопка переключения сайдбара
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-hidden');
        });
    }
});
