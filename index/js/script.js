document.addEventListener('DOMContentLoaded', () => {
    const profiles = [
        { name: "Олег, 20", uni: "КПІ", quote: "Get in the robot, Shinji! А краще ходімо в бар 🍺", tags: ["Пиво", "Аніме", "Програмування"], distance: "0.5 км" },
        { name: "Анастасія, 19", uni: "КНУ", quote: "Не можу знайти мотивацію писати курсач. Ходімо краще в кіно!", tags: ["Навчання", "Кіно", "Кава"], distance: "1.2 км" },
        { name: "Максим, 21", uni: "ЛНУ ім. І. Франка", quote: "Хто зі мною на футбол сьогодні ввечері?", tags: ["Спорт", "Футбол", "Гуртожиток №3"], distance: "0.3 км" }
    ];

    let currentProfileIndex = 0;
    
    function updateCardContent(cardElement, data) {
        cardElement.querySelector('#profileName').textContent = data.name;
        cardElement.querySelector('#profileUni').textContent = data.uni;
        cardElement.querySelector('#profileQuote').textContent = `"${data.quote}"`;
        cardElement.querySelector('#profileDistance').textContent = data.distance;
        
        const tagsContainer = cardElement.querySelector('#profileTags');
        tagsContainer.innerHTML = '';
        data.tags.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = tag;
            tagsContainer.appendChild(span);
        });
    }

    function setupCardInteractions(card) {
        let isDragging = false;
        let startX = 0;
        let currentX = 0;
        const threshold = 100;

        function startDrag(e) {
            if (e.target.closest('.profile-buttons')) return; 

            isDragging = true;
            startX = e.clientX || e.touches[0].clientX;
            card.classList.add('is-dragging'); 
        }

        function drag(e) {
            if (!isDragging) return;

            currentX = e.clientX || e.touches[0].clientX; 
            const deltaX = currentX - startX; 
            const rotation = deltaX / 20; 

            card.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
        }

        function endDrag() {
            if (!isDragging) return;

            isDragging = false;
            card.classList.remove('is-dragging');
            
            const deltaX = currentX - startX;

            if (deltaX > threshold) {
                throwCard('like');
            } else if (deltaX < -threshold) {
                throwCard('reject');
            } else {
                card.style.transform = '';
            }
        }
        
        function handleButtonClick(direction) {
            if (card.classList.contains('swipe-like') || card.classList.contains('swipe-reject')) return;
            throwCard(direction);
        }

        function throwCard(direction) {
            card.classList.add(`swipe-${direction}`);
            
            card.addEventListener('transitionend', () => {
                card.remove(); 
                
                currentProfileIndex = (currentProfileIndex + 1) % profiles.length;
                const nextData = profiles[currentProfileIndex];
                
                const newCard = document.querySelector('.profile-card-template').cloneNode(true);
                newCard.classList.remove('profile-card-template');
                newCard.classList.add('profile-card');

                updateCardContent(newCard, nextData);
                setupCardInteractions(newCard);

                document.querySelector('.profiles .container').insertBefore(newCard, document.querySelector('.easter-egg'));
            }, { once: true });
        }

        // Прив'язка обробників для свайпу
        card.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);

        card.addEventListener('touchstart', startDrag, { passive: true });
        document.addEventListener('touchmove', drag, { passive: true });
        document.addEventListener('touchend', endDrag);

        // Прив'язка кнопок
        card.querySelector('.button-like').addEventListener('click', () => handleButtonClick('like'));
        card.querySelector('.button-reject').addEventListener('click', () => handleButtonClick('reject'));
    }

    // Створюємо шаблон картки  для клонування
    const initialCard = document.querySelector('.profile-card');
    const cardTemplate = initialCard.cloneNode(true);
    cardTemplate.classList.remove('profile-card');
    cardTemplate.classList.add('profile-card-template');
    
    // Додаємо шаблон в DOM (приховано)
    initialCard.parentNode.insertBefore(cardTemplate, initialCard);
    
    // Налаштовуємо першу картку
    updateCardContent(initialCard, profiles[currentProfileIndex]);
    setupCardInteractions(initialCard);
});