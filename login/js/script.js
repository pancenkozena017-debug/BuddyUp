document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('loginError');

  errorDiv.textContent = ""; // очищаємо старі помилки

  const url =
    `https://buddyup-production-88e9.up.railway.app/login` +
    `?email=${encodeURIComponent(email)}` +
    `&password=${encodeURIComponent(password)}`;

  console.log("📤 Login request to:", url);

  try {
    const response = await fetch(url, { method: "POST" });
    const data = await response.json();

    console.log("✅ Login Response:", data);

    // дістаємо внутрішні дані
    const serverData = data.data || {};

    // логіка успіху
    const isSuccess =
      serverData.status === "ok" ||
      serverData.statusCode === "200" ||
      data.message === "Login successful";

    if (isSuccess && serverData.uid) {
      const userId = serverData.uid;

      localStorage.setItem("userId", userId);
      console.log("💾 Saved userId:", userId);

      window.location.href = "/index/index.html"; // перехід на головну
      return;
    }

    // Якщо сервер повернув помилку
    errorDiv.textContent = data.message || "Невірна пошта або пароль.";
    errorDiv.style.color = "red";

  } catch (err) {
    console.error("❌ Fetch login error:", err);

    errorDiv.textContent = "Помилка мережі. Спробуйте ще раз.";
    errorDiv.style.color = "red";
  }
});
