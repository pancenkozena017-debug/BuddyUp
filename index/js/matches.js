const matchesModal = document.getElementById("matches-modal");
const matchesButton = document.getElementById("matches-button");
const matchesList = document.getElementById("matches-list");
const closeMatchesButton = document.querySelector(".close-matches-button");


matchesButton.addEventListener("click", () => {
    matchesModal.style.display = "block";
    loadMatches();
});


closeMatchesButton.addEventListener("click", () => {
    matchesModal.style.display = "none";
});


window.addEventListener("click", (e) => {
    if (e.target === matchesModal) {
        matchesModal.style.display = "none";
    }
});

async function loadMatches() {
    if (!currentUid) {
        matchesList.innerHTML = "<p>❌ Ви не увійшли</p>";
        return;
    }

    matchesList.innerHTML = "<p>Завантаження...</p>";

    try {
        const res = await fetch(
            `https://buddyup-production-88e9.up.railway.app/get_matches?uid=${currentUid}`
        );
        const matchData = await res.json();

        if (!Array.isArray(matchData) || matchData.length === 0) {
            matchesList.innerHTML = "<p>Поки що немає матчів 😔</p>";
            return;
        }

        matchesList.innerHTML = "";

        for (const match of matchData) {

            const userId = match.with;


            const userRes = await fetch(
                `https://buddyup-production-88e9.up.railway.app/get_user?uid=${userId}`
            );
            const user = await userRes.json();

            const photo = user.photo || "/img/default-avatar.png";
            const name = (user.name + " " + user.surname) || `UID: ${user.id}`;
            const birthday = user.birthday || "Студент";

            const div = document.createElement("div");
            div.classList.add("match-card");
            div.dataset.userid = user.id;

            div.innerHTML = `
                <div class="match-left">
                    <img src="${photo}" class="match-avatar" alt="Avatar">
                </div>
                <div class="match-right">
                    <a href="#" class="match-profile-link" onclick="openUserProfile('${user.id}')">
                        ПЕРЕГЛЯНУТИ ПРОФІЛЬ
                    </a>
                    <div class="match-rating">
                        <span data-value="1">1</span>
                        <span data-value="2">2</span>
                        <span data-value="3">3</span>
                        <span data-value="4">4</span>
                        <span data-value="5">5</span>
                    </div>
                </div>
            `;

            matchesList.appendChild(div);
        }

        attachRatingHandlers();

    } catch (err) {
        console.error(err);
        matchesList.innerHTML = "<p>❌ Помилка завантаження</p>";
    }
}

// Рейтинг
function attachRatingHandlers() {
    document.querySelectorAll('.match-card .match-rating span').forEach(star => {
        star.addEventListener('click', async (e) => {
            const value = e.target.dataset.value;
            const card = e.target.closest('.match-card');
            const userId = card.dataset.userid;

            try {
                const res = await fetch(`https://buddyup-production-88e9.up.railway.app/sendRating?to=${userId}&rating=${value}`, {
                    method: 'POST',
                });

                if (!res.ok) throw new Error('Помилка при відправці рейтингу');

                alert(`Ви поставили оцінку ${value}`);
                card.querySelector('.match-rating').style.display = 'none';
            } catch (err) {
                console.error(err);
                alert('Помилка при відправці оцінки');
            }
        });
    });
} function openUserProfile(uid) {
    showProfile(uid, false); // false = чужий профіль, кнопки ховаємо
}

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
