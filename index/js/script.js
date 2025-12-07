
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
        cardElement.querySelector('#profileDescription').textContent = `"${data.description || ''}"`;
        // cardElement.querySelector('#profileDistance').textContent = data.distance || '';

        // const tagsContainer = cardElement.querySelector('#profileTags');
        // tagsContainer.innerHTML = '';
        // (data.tags || []).forEach(tag => {
        //     const span = document.createElement('span');
        //     span.className = 'tag';
        //     span.textContent = tag;
        //     tagsContainer.appendChild(span);
        // });

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
document.addEventListener('DOMContentLoaded', function () {
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
        logoutButton.addEventListener('click', function () {

            // 1. Видаляємо дані користувача
            localStorage.removeItem("userId");
            alert("Ви успішно вийшли з профілю.");

            // 2. ОНОВЛЮЄМО DOM, щоб показати кнопку "Увійти"
            if (profileTrigger) profileTrigger.style.display = "none";
            if (loginButton) loginButton.style.display = "inline-block";
            if (profileModal) profileModal.style.display = "none"

        });
    }
});


// //editprofile
// document.addEventListener('DOMContentLoaded', () => {
//     // Елементи модальних вікон
//     const profileModal = document.getElementById('profile-modal');
//     const editProfileModal = document.getElementById('edit-profile-modal');

//     // Кнопки
//     const editProfileButton = document.getElementById('edit-profile-button');
//     const closeProfileButton = profileModal.querySelector('.close-button');
//     const closeEditButton = editProfileModal.querySelector('.close-edit');
//     const editProfileForm = document.getElementById('edit-profile-form');

//     // Поля форми редагування
//     const editNameInput = document.getElementById('edit-name');
//     const editSurnameInput = document.getElementById('edit-surname');
//     const editBirthdayInput = document.getElementById('edit-birthday');
//     const editPhoneInput = document.getElementById('edit-phone');
//     const editTelegramInput = document.getElementById('edit-telegram');
//     const editDescription= document.getElementById('edit-description');

//     // ⚠️ Приклад об'єкта поточних даних користувача. 
//     let currentUserData = {
//         email: "example@test.com", // Пошта не редагується, але зберігається для прикладу
//         name: "Олег",
//         surname: "Коваль",
//         birthday: "1990-01-01", // Формат YYYY-MM-DD
//         phone: "+380501234567",
//         telegramUsername: "@oleg_koval_tg"
//     };


//     //  Функції керування модальними вікнами
//     const openEditModal = () => {
//         // 1. Заповнення форми поточними даними (крім email та password)
//         editNameInput.value = currentUserData.name || '';
//         editSurnameInput.value = currentUserData.surname || '';
//         editDescription.value = currentUserData.description || '';

//         editBirthdayInput.value = currentUserData.birthday || '';
//         editPhoneInput.value = currentUserData.phone || '';
//         editTelegramInput.value = currentUserData.telegramUsername || '';

//         // 2. Закрити модальне вікно профілю
//         profileModal.style.display = 'none';

//         // 3. Відкрити модальне вікно редагування
//         editProfileModal.style.display = 'block';
//     };

//     /**
//      * Закриває вказане модальне вікно.
//      * @param {HTMLElement} modal - елемент модального вікна.
//      */
//     const closeModal = (modal) => {
//         modal.style.display = 'none';
//     };

//     // --- Обробники подій ---

//     // 1. Кнопка "Редагувати профіль" в модальному вікні профілю
//     editProfileButton.addEventListener('click', openEditModal);

//     // 2. Кнопка закриття (x) у вікні профілю
//     closeProfileButton.addEventListener('click', () => {
//         closeModal(profileModal);
//     });

//     // 3. Кнопка закриття (x) у вікні редагування
//     closeEditButton.addEventListener('click', () => {
//         closeModal(editProfileModal);
//     });

//     // 4. Закриття при кліку поза модальним вікном (для обох)
//     window.addEventListener('click', (event) => {
//         if (event.target === profileModal) {
//             closeModal(profileModal);
//         }
//         if (event.target === editProfileModal) {
//             closeModal(editProfileModal);
//         }
//     });

//     // 5. Обробка відправки форми редагування
//     editProfileForm.addEventListener('submit', (event) => {
//         event.preventDefault(); // Запобігти стандартній відправці форми

//         // Збір нових даних
//         const newUserData = {
//             // Пошту беремо зі старих даних, оскільки вона не редагується
//             email: currentUserData.email,
//             name: editNameInput.value,
//             surname: editSurnameInput.value,
//             description: editDescription.value,
//             birthday: editBirthdayInput.value,
//             phone: editPhoneInput.value,
//             telegramUsername: editTelegramInput.value
//         };

//         // ⚠️ Тут    має бути ваш код для відправки даних на сервер (API-запит)
//         console.log("Відправка оновлених даних:", newUserData);//kkrtogjotrhjiotrjhoptrejiopntjonjtopnjrorjhopijfgopnjhiopjhopejniopfjhhiophnjidofpgjniodfgjniojdfgiohnjdfgionjdfgobjdfgojniodfgjnfdgn

//         // Приклад: оновлення локальних даних після успішної відправки
//         currentUserData = newUserData;


//         // Закриття модального вікна редагування
//         closeModal(editProfileModal);

//         // Можливо, відкрити назад вікно профілю
//         profileModal.style.display = 'block';

//         alert("Дані профілю успішно оновлено!");
//     });

// });