/**
 * Модуль настроек
 */
const Settings = {
    /**
     * Инициализация модуля настроек
     */
    init() {
        const exportBtn = document.getElementById('export-data-btn');
        const importBtn = document.getElementById('import-data-btn');
        const clearBtn = document.getElementById('clear-data-btn');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.importData();
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearData();
            });
        }
    },

    /**
     * Экспорт данных
     */
    exportData() {
        const data = DataManager.getAllData();
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `productivity-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert('Данные успешно экспортированы!');
    },

    /**
     * Импорт данных
     */
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        if (confirm('Вы уверены? Это заменит все текущие данные.')) {
                            DataManager.saveAllData(data);
                            alert('Данные успешно импортированы!');
                            Navigation.updatePageContent('dashboard');
                            Navigation.updatePageContent('tasks');
                            Navigation.updatePageContent('goals');
                            Navigation.updatePageContent('notes');
                            Navigation.updatePageContent('projects');
                            Navigation.updatePageContent('archive');
                        }
                    } catch (error) {
                        alert('Ошибка при импорте данных. Проверьте формат файла.');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    },

    /**
     * Очистить все данные
     */
    clearData() {
        if (confirm('Вы уверены, что хотите удалить ВСЕ данные? Это действие нельзя отменить!')) {
            DataManager.clearAll();
            alert('Все данные удалены!');
            Navigation.updatePageContent('dashboard');
            Navigation.updatePageContent('tasks');
            Navigation.updatePageContent('goals');
            Navigation.updatePageContent('notes');
            Navigation.updatePageContent('projects');
            Navigation.updatePageContent('archive');
        }
    }
};
