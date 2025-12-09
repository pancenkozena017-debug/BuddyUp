//   ПРОФІЛЬ

const profileButton = document.getElementById('profile-button-trigger');
const profileModal = document.getElementById('profile-modal');
const closeProfileButton = document.querySelector('.close-button');
const dataDisplay = document.getElementById('profile-data-display');
document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logout-button');
    const loginButton = document.getElementById("login-button");
    const profileTrigger = document.getElementById("profile-button-trigger");


    const userId = localStorage.getItem("userId");
    if (userId) {
        if (profileTrigger) profileTrigger.style.display = "inline-block";
        if (loginButton) loginButton.style.display = "none";
    } else {
        if (profileTrigger) profileTrigger.style.display = "none";
        if (loginButton) loginButton.style.display = "inline-block";
    }
});
// Форматування даних
function formatUserData(data) {
    const displayItems = [
        { label: "Email", value: data.email },
        { label: "Ім'я", value: data.name },
        { label: "Прізвище", value: data.surname },
        { label: "Опис", value: data.description },
        { label: "Дата народження", value: data.birthday },
        { label: "Телефон", value: data.phone },
        { label: "Telegram", value: data.telegramUsername },
    ];

    return displayItems.map(i =>
        `<p><strong>${i.label}:</strong> ${i.value}</p>`
    ).join('');
}
profileButton.addEventListener('click', () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return alert("Користувач не знайдений у localStorage");
    showProfile(userId, true); // true = профіль
});



closeProfileButton.addEventListener('click', () => {
    profileModal.style.display = 'none';
});


//РЕДАГУВАННЯ ПРОФІЛЮ

const editProfileModal = document.getElementById('edit-profile-modal');
const editProfileButton = document.getElementById('edit-profile-button');
const closeEditButton = document.querySelector('.close-edit');
const editProfileForm = document.getElementById('edit-profile-form');


const editNameInput = document.getElementById('edit-name');
const editSurnameInput = document.getElementById('edit-surname');
const editBirthdayInput = document.getElementById('edit-birthday');
const editPhoneInput = document.getElementById('edit-phone');
const editTelegramInput = document.getElementById('edit-telegram');
const editDescription = document.getElementById('edit-description');


editProfileButton.addEventListener('click', () => {
    const data = window.currentUserData;

    editNameInput.value = data.name || '';
    editSurnameInput.value = data.surname || '';
    editDescription.value = data.description || '';
    editBirthdayInput.value = data.birthday || '';
    editPhoneInput.value = data.phone || '';
    editTelegramInput.value = data.telegramUsername || '';

    profileModal.style.display = 'none';
    editProfileModal.style.display = 'block';
});


closeEditButton.addEventListener('click', () => {
    editProfileModal.style.display = 'none';
});


window.addEventListener('click', e => {
    if (e.target === profileModal) profileModal.style.display = 'none';
    if (e.target === editProfileModal) editProfileModal.style.display = 'none';
});

// Відправка форми
editProfileForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const userId = localStorage.getItem("userId");

    const newUserData = {
        name: editNameInput.value,
        surname: editSurnameInput.value,
        description: editDescription.value,
        birthday: editBirthdayInput.value,
        phone: editPhoneInput.value,
        telegramUsername: editTelegramInput.value
    };
    const url =
        `https://buddyup-production-88e9.up.railway.app/update` +
        `?id=${encodeURIComponent(userId)}` +
        `&name=${encodeURIComponent(editNameInput.value)}` +
        `&surname=${encodeURIComponent(editSurnameInput.value)}` +
        `&description=${encodeURIComponent(editDescription.value)}` +
        `&phone=${encodeURIComponent(editPhoneInput.value)}` +
        `&telegramUsername=${encodeURIComponent(editTelegramInput.value)}` +
        `&birthday=${encodeURIComponent(editBirthdayInput.value)}`;
    try {
        const response = await fetch(
            url,
            {
                method: "PUT",
            }
        );

        if (!response.ok) throw new Error();

        alert("Дані профілю оновлено!");


        window.currentUserData = newUserData;

        editProfileModal.style.display = 'none';
        profileModal.style.display = 'block';

    } catch (e) {
        console.error(e);
        alert("Не вдалося оновити профіль");
    }
});


async function showProfile(uid, isOwn = false) {
    try {
        const response = await fetch(
            `https://buddyup-production-88e9.up.railway.app/get_user?uid=${uid}`
        );
        if (!response.ok) throw new Error("Не вдалося завантажити дані користувача");

        const userData = await response.json();

        const dataDisplay = document.getElementById('profile-data-display');
        dataDisplay.innerHTML = formatUserData(userData);


        document.getElementById('edit-profile-button').style.display = isOwn ? 'inline-block' : 'none';
        document.getElementById('logout-button').style.display = isOwn ? 'inline-block' : 'none';

        profileModal.style.display = 'block';

    
        if (isOwn) window.currentUserData = userData;

    } catch (err) {
        console.error(err);
        alert("Помилка при завантаженні профілю користувача");
    }
}
