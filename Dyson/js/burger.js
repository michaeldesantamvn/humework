// Бургер-меню
document.addEventListener('DOMContentLoaded', function() {
    const burger = document.querySelector('.burger-menu');
    const menu = document.querySelector('.header__info');
    
    console.log('Burger:', burger);
    console.log('Menu:', menu);
    
    if (burger && menu) {
        
        burger.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Burger clicked');
            
            // Переключаем класс active
            burger.classList.toggle('active');
            menu.classList.toggle('active');
            
            // Меняем иконку при открытии/закрытии
            if (burger.classList.contains('active')) {
                // Меняем на крестик
                burger.innerHTML = `
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                        <line x1="5" y1="5" x2="25" y2="25" stroke="white" stroke-width="3"/>
                        <line x1="25" y1="5" x2="5" y2="25" stroke="white" stroke-width="3"/>
                    </svg>
                `;
                document.body.style.overflow = 'hidden';
            } else {
                // Меняем обратно на бургер
                burger.innerHTML = `
                    <svg width="30" height="20" viewBox="0 0 30 20" fill="none">
                        <line x1="0" y1="2" x2="30" y2="2" stroke="white" stroke-width="3"/>
                        <line x1="0" y1="10" x2="30" y2="10" stroke="white" stroke-width="3"/>
                        <line x1="0" y1="18" x2="30" y2="18" stroke="white" stroke-width="3"/>
                    </svg>
                `;
                document.body.style.overflow = '';
            }
        });
        
        // Закрываем при клике на ссылку
        const links = menu.querySelectorAll('.nav-menu__link');
        links.forEach(link => {
            link.addEventListener('click', function() {
                burger.classList.remove('active');
                menu.classList.remove('active');
                document.body.style.overflow = '';
                
                // Возвращаем иконку бургера
                burger.innerHTML = `
                    <svg width="30" height="20" viewBox="0 0 30 20" fill="none">
                        <line x1="0" y1="2" x2="30" y2="2" stroke="white" stroke-width="3"/>
                        <line x1="0" y1="10" x2="30" y2="10" stroke="white" stroke-width="3"/>
                        <line x1="0" y1="18" x2="30" y2="18" stroke="white" stroke-width="3"/>
                    </svg>
                `;
            });
        });
        
        // Закрываем при клике вне меню
        document.addEventListener('click', function(e) {
            if (!burger.contains(e.target) && !menu.contains(e.target) && menu.classList.contains('active')) {
                burger.classList.remove('active');
                menu.classList.remove('active');
                document.body.style.overflow = '';
                
                burger.innerHTML = `
                    <svg width="30" height="20" viewBox="0 0 30 20" fill="none">
                        <line x1="0" y1="2" x2="30" y2="2" stroke="white" stroke-width="3"/>
                        <line x1="0" y1="10" x2="30" y2="10" stroke="white" stroke-width="3"/>
                        <line x1="0" y1="18" x2="30" y2="18" stroke="white" stroke-width="3"/>
                    </svg>
                `;
            }
        });
        
        // Закрываем при ресайзе
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                burger.classList.remove('active');
                menu.classList.remove('active');
                document.body.style.overflow = '';
                
                burger.innerHTML = `
                    <svg width="30" height="20" viewBox="0 0 30 20" fill="none">
                        <line x1="0" y1="2" x2="30" y2="2" stroke="white" stroke-width="3"/>
                        <line x1="0" y1="10" x2="30" y2="10" stroke="white" stroke-width="3"/>
                        <line x1="0" y1="18" x2="30" y2="18" stroke="white" stroke-width="3"/>
                    </svg>
                `;
            }
        });
        
    } else {
        console.log('Бургер или меню не найдены!');
    }
});