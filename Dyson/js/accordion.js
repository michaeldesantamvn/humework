// Ждем загрузку DOM
document.addEventListener('DOMContentLoaded', function() {
    // Находим все элементы аккордеона
    const accordionItems = document.querySelectorAll('.accordion-list__item');
    
    // Функция для закрытия всех элементов
    function closeAllAccordions() {
        accordionItems.forEach(item => {
            item.classList.remove('accordion-list__item--active');
        });
    }
    
    // Для каждого элемента добавляем обработчик
    accordionItems.forEach(item => {
        const control = item.querySelector('.accordion-list__control');
        const content = item.querySelector('.accordion-list__content');
        const icon = item.querySelector('.accordion-list__control-icon svg');
        
        control.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Проверяем, открыт ли текущий элемент
            const isActive = item.classList.contains('accordion-list__item--active');
            
            // Если нужно закрывать другие при открытии нового
            if (!isActive) {
                closeAllAccordions();
            }
            
            // Переключаем класс у текущего элемента
            item.classList.toggle('accordion-list__item--active');
            
            // Плавный скролл до открытого элемента (опционально)
            if (!isActive) {
                setTimeout(() => {
                    item.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 300);
            }
        });
        
        // Добавляем клавиатурную навигацию (опционально)
        control.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                control.click();
            }
        });
        
        // Делаем элементы фокусируемыми для доступности
        control.setAttribute('tabindex', '0');
        control.setAttribute('role', 'button');
        control.setAttribute('aria-expanded', 'false');
    });
    
    // Обновляем ARIA-атрибуты при открытии/закрытии
    function updateAriaAttributes() {
        accordionItems.forEach(item => {
            const control = item.querySelector('.accordion-list__control');
            const isActive = item.classList.contains('accordion-list__item--active');
            control.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });
    }
    
    // Наблюдаем за изменениями классов
    const observer = new MutationObserver(updateAriaAttributes);
    accordionItems.forEach(item => {
        observer.observe(item, { attributes: true, attributeFilter: ['class'] });
    });
});