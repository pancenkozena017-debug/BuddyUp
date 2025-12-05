document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('loginError');

  errorDiv.textContent = "";

  const url =
    `https://buddyup-production-88e9.up.railway.app/login` +
    `?email=${encodeURIComponent(email)}` +
    `&password=${encodeURIComponent(password)}`;

  console.log("📤 Login request to:", url);

  try {
    const response = await fetch(url, { method: "POST" });
    const data = await response.json();

    console.log("✅ Login Response:", data);

    // сервер повертає ПЛОСКИЙ JSON
    const serverData = data;

    const isSuccess =
      serverData.status === "ok" ||
      serverData.statusCode === "200";

    if (isSuccess && serverData.uid) {
      localStorage.setItem("userId", serverData.uid);
      console.log("💾 Saved userId:", serverData.uid);

      window.location.href = "/index/index.html";
      return;
    }

    errorDiv.textContent = "Невірна пошта або пароль.";
    errorDiv.style.color = "red";

  } catch (err) {
    console.error("❌ Fetch login error:", err);

    errorDiv.textContent = "Помилка мережі. Спробуйте ще раз.";
    errorDiv.style.color = "red";
  }
});
