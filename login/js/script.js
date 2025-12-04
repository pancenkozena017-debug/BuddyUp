document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const url = `https://buddyup-production-88e9.up.railway.app/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;

  console.log("📤 Login request to:", url);

  try {
    const response = await fetch(url, { method: "POST" });
    const data = await response.json();

    console.log("✅ Login Response:", data);

    if (data.status === "ok" && data.userId) {
      // Успішний вхід — зберігаємо userId і переходимо на головну
      localStorage.setItem("userId", data.userId);
      window.location.href = "/"; // тут можна змінити на потрібну головну сторінку
    } else if (data.status === "error") {
      // Помилка від сервера, наприклад неправильний пароль або пошта
      const message = data.message || "Невірна пошта або пароль. Спробуйте ще раз.";
      document.getElementById('loginError').textContent = message;
      document.getElementById('loginError').style.color = "red";
    } else {
      // Невідома помилка
      document.getElementById('loginError').textContent = "Сталася невідома помилка.";
      document.getElementById('loginError').style.color = "red";
    }
  } catch (err) {
    console.error("❌ Fetch login error:", err);
    document.getElementById('loginError').textContent = "Помилка мережі. Спробуйте ще раз.";
    document.getElementById('loginError').style.color = "red";
  }
});
