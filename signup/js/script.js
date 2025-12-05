import { firebaseConfig } from '../keys.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Ініціалізація Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Функція завантаження фото
async function uploadPhotoToFirebase(file) {
    const storageRef = ref(storage, `users/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
}

// Попередній перегляд фото
document.getElementById('photo').addEventListener('change', function (e) {
    const preview = document.getElementById('profile-preview');
    const fileUploadText = document.getElementById('file-upload-text');
    const file = e.target.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            preview.src = event.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
        fileUploadText.textContent = file.name;
    } else {
        preview.src = '';
        preview.style.display = 'none';
        fileUploadText.textContent = 'Вибрати файл';
    }
});

// Відправка форми
document.getElementById('signupForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const errorDiv = document.getElementById('signupError'); // елемент для повідомлень
    errorDiv.textContent = ""; // очищаємо попередні повідомлення

    const file = document.getElementById('photo').files[0];
    let photoURL = "";

    if (file) {
        try {
            photoURL = await uploadPhotoToFirebase(file);
        } catch (err) {
            console.error("❌ Firebase upload error:", err);
            errorDiv.textContent = "Помилка завантаження фото!";
            return;
        }
    }

    // Дані форми
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    const surname = document.getElementById('surname').value;
    const birthday = document.getElementById('dateOfBirth').value;
    const phone = document.getElementById('phoneNumber').value;
    const telegramUsername = document.getElementById('telegramUsername').value;

    const url =
        `https://buddyup-production-88e9.up.railway.app/register` +
        `?email=${encodeURIComponent(email)}` +
        `&password=${encodeURIComponent(password)}` +
        `&name=${encodeURIComponent(name)}` +
        `&surname=${encodeURIComponent(surname)}` +
        `&phone=${encodeURIComponent(phone)}` +
        `&telegramUsername=${encodeURIComponent(telegramUsername)}` +
        `&birthday=${encodeURIComponent(birthday)}` +
        `&photo=${encodeURIComponent(photoURL)}`;

    try {
        const response = await fetch(url, { method: "POST" });
        const data = await response.json();

        console.log("SERVER RESPONSE:", data);

        // дані сервера
        const serverData = data.data || {};

        const isSuccess =
            serverData.status === "ok" ||
            serverData.statusCode === "200" ||
            data.message === "Registered successfully!";

        if (isSuccess) {
            const userId = serverData.uid; // <-- ось тут правильний userId

            if (!userId) {
                errorDiv.textContent = "❌ Сервер не повернув uid!";
                return;
            }

            console.log("UserId saved:", userId);
            localStorage.setItem("userId", userId);

            // Перехід після успіху
            window.location.href = "/index/index.html";
            return;
        }

        errorDiv.textContent = data.message || "Сталася помилка реєстрації!";
    } catch (err) {
        console.error("❌ Error sending form data:", err);
        errorDiv.textContent = "Помилка мережі. Спробуйте ще раз!";
    }

});
