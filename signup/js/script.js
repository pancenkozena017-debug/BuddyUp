import { firebaseConfig } from '../keys.js'; 
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Ініціалізація Firebase
const app = initializeApp(firebaseConfig);
console.log("✅ Firebase App initialized:", app.name);

// Підключення Storage
export const storage = getStorage(app);
console.log("✅ Firebase Storage ready:", storage);

// Функція завантаження фото
async function uploadPhotoToFirebase(file) {
    console.log("📁 Uploading file:", file.name);

    const storageRef = ref(storage, `users/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    console.log("🔥 File uploaded, URL:", downloadURL);
    return downloadURL;
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
        console.log("📷 File selected for upload:", file.name);
    } else {
        preview.src = '';
        preview.style.display = 'none';
        fileUploadText.textContent = 'Вибрати файл';
        console.log("⚠ No file selected");
    }
});

// Відправка форми
document.getElementById('signupForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const file = document.getElementById('photo').files[0];
    let photoURL = "";

    if (file) {
        try {
            photoURL = await uploadPhotoToFirebase(file);
        } catch (err) {
            console.error("❌ Firebase upload error:", err);
            alert("Помилка завантаження фото!");
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

    console.log("📤 Sending request to:", url);

    fetch(url, { method: "POST" })
        .then(res => res.json())
        .then(data => {
            console.log("✅ Server Response:", data);
            alert("Реєстрація успішна!");
        })
        .catch(err => {
            console.error("❌ Error sending form data:", err);
            alert("Помилка відправки даних!");
        });
});
