
document.addEventListener('DOMContentLoaded', () => {
    let profiles = [];
    let currentProfileIndex = 0;

    const initialCard = document.querySelector('.profile-card');

    // Завантаження користувачів з сервера
    async function loadUsers() {
        try {
            const response = await fetch("https://buddyup-production-88e9.up.railway.app/get_users");
            if (!response.ok) throw new Error("Не вдалося завантажити користувачів");

            const users = await response.json();
            profiles = users.sort(() => Math.random() - 0.5);
            currentProfileIndex = 0;
        } catch (error) {
            console.error(error);
            alert("Помилка при отриманні користувачів");
        }
    }

    // Оновлення картки
    function updateCardContent(cardElement, data) {
        console.log(data);
        console.log(document.querySelectorAll('#profileUni'));

        cardElement.querySelector('#profileName').textContent = `${data.name} ${data.surname}, ${getAge(data.birthday)}`;
        cardElement.querySelector('#profileUni').textContent = `Рейтинг ${data.rating}` || '';
        cardElement.querySelector('#profileDescription').textContent = `"${data.description || ''}"`;
        const img = cardElement.querySelector('#profileImage');
        if (img && data.photo) img.src = data.photo;
    }

    function getAge(birthday) {
        if (!birthday) return '';
        const birthDate = new Date(birthday);
        const diff = Date.now() - birthDate.getTime();
        const age = new Date(diff).getUTCFullYear() - 1970;
        return age;
    }

    // Налаштування свайп-картки
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

        async function throwCard(direction) {
            card.classList.add(`swipe-${direction}`);

            card.addEventListener('transitionend', async () => {
                card.remove();

                // Відправляємо лайк/дизлайк на сервер
                const currentUserId = localStorage.getItem("userId"); // твій id
                const targetUserId = profiles[currentProfileIndex].id; // id користувача, якому ставимо лайк

                try {
                    const response = await fetch(`https://buddyup-production-88e9.up.railway.app/sendLike?to=${currentUserId}&from=${targetUserId}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                    });
                    const data = await response.json();
                    console.log(`Відправлено ${direction} для користувача ${targetUserId}:`, data);
                } catch (error) {
                    console.error(`Помилка при ${direction}:`, error);
                }

                currentProfileIndex++;
                if (currentProfileIndex >= profiles.length) {
                    await loadUsers();
                }

                const nextData = profiles[currentProfileIndex % profiles.length];
                const newCard = document.querySelector('.profile-card-template').cloneNode(true);
                newCard.classList.remove('profile-card-template');
                newCard.classList.add('profile-card');

                updateCardContent(newCard, nextData);
                setupCardInteractions(newCard);

                document.querySelector('.profiles .container').insertBefore(newCard, document.querySelector('.easter-egg'));
            }, { once: true });
        }



        card.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);

        card.addEventListener('touchstart', startDrag, { passive: true });
        document.addEventListener('touchmove', drag, { passive: true });
        document.addEventListener('touchend', endDrag);


        card.querySelector('.button-like').addEventListener('click', () => handleButtonClick('like'));
        card.querySelector('.button-reject').addEventListener('click', () => handleButtonClick('reject'));
    }

    const cardTemplate = initialCard.cloneNode(true);
    cardTemplate.classList.remove('profile-card');
    cardTemplate.classList.add('profile-card-template');
    initialCard.parentNode.insertBefore(cardTemplate, initialCard);

    (async () => {
        await loadUsers();
        updateCardContent(initialCard, profiles[currentProfileIndex]);
        setupCardInteractions(initialCard);
    })();
});

//logout
document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logout-button');
    const loginButton = document.getElementById("login-button");
    const profileTrigger = document.getElementById("profile-button-trigger");

    const userId = localStorage.getItem("userId");
    if (userId) {
        // Є userId → показуємо профіль
        if (profileTrigger) profileTrigger.style.display = "inline-block";
        if (loginButton) loginButton.style.display = "none";
    } else {
        // Нема userId → показуємо логін
        if (profileTrigger) profileTrigger.style.display = "none";
        if (loginButton) loginButton.style.display = "inline-block";
    }


    if (logoutButton) {
        logoutButton.addEventListener('click', function () {


            localStorage.removeItem("userId");
            alert("Ви успішно вийшли з профілю.");


            if (profileTrigger) profileTrigger.style.display = "none";
            if (loginButton) loginButton.style.display = "inline-block";
            if (profileModal) profileModal.style.display = "none"

        });
    }
});

const menuToggle = document.getElementById('menuToggle');
const navbar = document.getElementById('navbar');

menuToggle.addEventListener('click', () => {
    navbar.classList.toggle('active');
});