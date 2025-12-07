

// 1. Отримуємо елементи
const profileButton = document.getElementById('profile-button-trigger'); // Новий ID для кнопки в хедері
const modal = document.getElementById('profile-modal');
const closeButton = document.querySelector('.close-button');
const dataDisplay = document.getElementById('profile-data-display');



// 3. Допоміжна функція для форматування даних
function formatUserData(data) {
    const displayItems = [
        { label: "Email", value: data.email },
        { label: "Ім'я", value: data.name },
        { label: "Прізвище", value: data.surname },
        { label: "Дата народження", value: data.birthday },
        { label: "Телефон", value: data.phone },
        { label: "Telegram", value: data.telegramUsername },
    ];

    let htmlContent = '';
    displayItems.forEach(item => {
        htmlContent += `<p><strong>${item.label}:</strong> ${item.value}</p>`;
    });

    return htmlContent;
}


// 4. Обробники подій
profileButton.addEventListener('click', async function () {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("Користувач не знайдений у localStorage");
        return;
    }

    try {
        const response = await fetch(`https://buddyup-production-88e9.up.railway.app/get_user?uid=${userId}`);
        if (!response.ok) throw new Error("Помилка при отриманні даних користувача");

        const userData = await response.json();
        dataDisplay.innerHTML = formatUserData(userData);
        modal.style.display = 'block';
    } catch (error) {
        console.error(error);
        alert("Не вдалося завантажити дані користувача");
    }
});


// Закриття вікна по кліку поза ним
window.addEventListener('click', function (event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    let profiles = [];
    let currentProfileIndex = 0;

    const initialCard = document.querySelector('.profile-card');

    // Функція для завантаження користувачів з сервера
    async function loadUsers() {
        try {
            const response = await fetch("https://buddyup-production-88e9.up.railway.app/get_users");
            if (!response.ok) throw new Error("Не вдалося завантажити користувачів");

            const users = await response.json();
            // Перемішуємо список
            profiles = users.sort(() => Math.random() - 0.5);
            currentProfileIndex = 0;
        } catch (error) {
            console.error(error);
            alert("Помилка при отриманні користувачів");
        }
    }

    // Функція для оновлення картки
    function updateCardContent(cardElement, data) {
        cardElement.querySelector('#profileName').textContent = `${data.name} ${data.surname}, ${getAge(data.birthday)}`;
        cardElement.querySelector('#profileUni').textContent = data.university || '';
        cardElement.querySelector('#profileQuote').textContent = `"${data.quote || ''}"`;
        cardElement.querySelector('#profileDistance').textContent = data.distance || '';

        const tagsContainer = cardElement.querySelector('#profileTags');
        tagsContainer.innerHTML = '';
        (data.tags || []).forEach(tag => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = tag;
            tagsContainer.appendChild(span);
        });

        // Фото
        const img = cardElement.querySelector('#profileImage');
        if (img && data.photo) img.src = data.photo;
    }

    // Допоміжна функція для обчислення віку
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

                // Переходимо до наступної картки
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

    // Клонування шаблону картки
    const cardTemplate = initialCard.cloneNode(true);
    cardTemplate.classList.remove('profile-card');
    cardTemplate.classList.add('profile-card-template');
    initialCard.parentNode.insertBefore(cardTemplate, initialCard);

    // Старт: завантажуємо користувачів і налаштовуємо першу картку
    (async () => {
        await loadUsers();
        updateCardContent(initialCard, profiles[currentProfileIndex]);
        setupCardInteractions(initialCard);
    })();
});

//logout
document.addEventListener('DOMContentLoaded', function() {
    // Отримання елементів
    const logoutButton = document.getElementById('logout-button');
    const loginButton = document.getElementById("login-button");
    const profileTrigger = document.getElementById("profile-button-trigger");

    // --- ЛОГІКА 1: ВИЗНАЧЕННЯ СТАНУ ПРИ ЗАВАНТАЖЕННІ СТОРІНКИ ---
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
    
    // --- ЛОГІКА 2: ОБРОБНИК ВИХОДУ З ПРОФІЛЮ ---
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {

            // 1. Видаляємо дані користувача
            localStorage.removeItem("userId");
            alert("Ви успішно вийшли з профілю.");

            if (profileModal) {
                profileModal.style.display = "none";
            }

            // 2. ОНОВЛЮЄМО DOM, щоб показати кнопку "Увійти"
            if (profileTrigger) profileTrigger.style.display = "none";
            if (loginButton) loginButton.style.display = "inline-block";

        });
    }
});


//editprofile

// Відкрити модал редагування
document.getElementById("edit-profile-button").onclick = function () {
    const data = JSON.parse(localStorage.getItem("userData"));

    document.getElementById("edit-name").value = data.name || "";
    document.getElementById("edit-surname").value = data.surname || "";
    document.getElementById("edit-birthday").value = data.birthday || "";
    document.getElementById("edit-phone").value = data.phone || "";
    document.getElementById("edit-telegram").value = data.telegramUsername || "";

    document.getElementById("edit-profile-modal").style.display = "block";
};

// Закрити модал
document.querySelector(".close-edit").onclick = function () {
    document.getElementById("edit-profile-modal").style.display = "none";
};

// Зберегти зміни
document.getElementById("edit-profile-form").onsubmit = function (e) {
    e.preventDefault();

    let data = JSON.parse(localStorage.getItem("userData"));

    data.name = document.getElementById("edit-name").value;
    data.surname = document.getElementById("edit-surname").value;
    data.birthday = document.getElementById("edit-birthday").value;
    data.phone = document.getElementById("edit-phone").value;
    data.telegramUsername = document.getElementById("edit-telegram").value;

    localStorage.setItem("userData", JSON.stringify(data));

    updateProfileDisplay();

    document.getElementById("edit-profile-modal").style.display = "none";
};

