

// 1. Отримуємо елементи
const profileButton = document.getElementById('profile-button-trigger'); // Новий ID для кнопки в хедері
const modal = document.getElementById('profile-modal');
const closeButton = document.querySelector('.close-button');
const dataDisplay = document.getElementById('profile-data-display');


// 2. Імітація даних (замініть на реальне отримання даних)
const userData = {
    email: "user@example.com",
    password: "h*ddenPassword", 
    name: "Олексій",
    surname: "Коваленко",
    birthday: "1995-10-25",
    phone: "+380 50 123 4567",
    telegramUsername: "@aleksey_k"
};


// 3. Допоміжна функція для форматування даних
function formatUserData(data) {
    const displayItems = [
        { label: "Email", value: data.email },
        { label: "Ім'я", value: data.name },
        { label: "Прізвище", value: data.surname },
        { label: "Дата народження", value: data.birthday },
        { label: "Телефон", value: data.phone },
        { label: "Telegram", value: data.telegramUsername },
        { label: "Пароль", value: "********" } 
    ];

    let htmlContent = '';
    displayItems.forEach(item => {
        htmlContent += `<p><strong>${item.label}:</strong> ${item.value}</p>`;
    });

    return htmlContent;
}


// 4. Обробники подій
// Відкриття вікна по кліку на кнопку в хедері
profileButton.addEventListener('click', function() {
    dataDisplay.innerHTML = formatUserData(userData);
    modal.style.display = 'block';
});

// Закриття вікна по кнопці "x"
closeButton.addEventListener('click', function() {
    modal.style.display = 'none';
});

// Закриття вікна по кліку поза ним
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});