document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const url = `https://buddyup-production-88e9.up.railway.app/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;

  console.log("📤 Login request to:", url);

  fetch(url, { method: "POST" })
    .then(res => res.json())
    .then(data => {
      console.log("✅ Login Response:", data);
      alert("Вхід пройшов! Перевір консоль");
    })
    .catch(err => console.error("❌ Fetch login error:", err));
});