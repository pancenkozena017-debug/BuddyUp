

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
        const response = await fetch(`https://buddyup-production-88e9.up.railway.app/get_user?id=${userId}`);
        if (!response.ok) throw new Error("Помилка при отриманні даних користувача");

        const userData = await response.json();
        dataDisplay.innerHTML = formatUserData(userData);
        modal.style.display = 'block';
    } catch (error) {
        console.error(error);
        alert("Не вдалося завантажити дані користувача");
    }
});

// Закриття вікна по кнопці "x"
closeButton.addEventListener('click', function () {
    modal.style.display = 'none';
});

// Закриття вікна по кліку поза ним
window.addEventListener('click', function (event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});