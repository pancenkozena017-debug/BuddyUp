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

document.getElementById('signupForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const file = document.getElementById('photo').files[0];

  // Якщо треба прямо Base64 передати — беремо з preview.src
  const base64Photo = document.getElementById('profile-preview').src;

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const name = document.getElementById('name').value;
  const surname = document.getElementById('surname').value;
  const birthday = document.getElementById('dateOfBirth').value;
  const phone = document.getElementById('phoneNumber').value;
  const telegramUsername = document.getElementById('telegramUsername').value;

  const url =
    `https://buddyup-production-88e9.up.railway.app/register`+
    `?email=${encodeURIComponent(email)}`+
    `&password=${encodeURIComponent(password)}`+
    `&name=${encodeURIComponent(name)}`+
    `&surname=${encodeURIComponent(surname)}`+
    `&phone=${encodeURIComponent(phone)}`+
    `&telegramUsername=${encodeURIComponent(telegramUsername)}`+
    `&birthday=${encodeURIComponent(birthday)}`+
    `&photo=${encodeURIComponent(base64Photo)}`;

console.log("📤 Sending request to:", url);

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(res => res.json())
    .then(data => {
      console.log("✅ Server Response:", data);
      alert("Реєстрація пройшла, перевір консоль!");
    })
    .catch(err => {
      console.error("❌ Error:", err);
      alert("Помилка запиту, дивись консоль!");
    });
});