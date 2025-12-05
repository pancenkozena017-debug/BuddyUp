
// ==================== ЛАЙКИ ==================== //

const likesModal = document.getElementById("likes-modal");
const likesButton = document.getElementById("likes-button");
const closeLikesButton = document.querySelector(".close-likes-button");
const likesList = document.getElementById("likes-list");

// Твій uid з кешу (localStorage)
const currentUid = localStorage.getItem("uid");

// Відкрити модал
likesButton.addEventListener("click", () => {
    likesModal.style.display = "block";
    loadLikes();
});

// Закрити модал
closeLikesButton.addEventListener("click", () => {
    likesModal.style.display = "none";
});

// Закривання по кліку поза вікном
window.addEventListener("click", (e) => {
    if (e.target === likesModal) {
        likesModal.style.display = "none";
    }
});

// ====== Функція завантаження лайків ======
async function loadLikes() {
    if (!currentUid) {
        likesList.innerHTML = "<p>❌ Ви не увійшли</p>";
        return;
    }

    likesList.innerHTML = "<p>Завантаження...</p>";

    try {
        const res = await fetch(`https://buddyup-production-88e9.up.railway.app/get_likes?uid=${currentUid}`);
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
            likesList.innerHTML = "<p>Поки що ніхто не лайкнув 😔</p>";
            return;
        }

        likesList.innerHTML = "";

        data.forEach(like => {
            const div = document.createElement("div");
            div.classList.add("like-item");

            const photo = like.photoURL || "/img/default-avatar.png";
            const name = like.name || `UID: ${like.from_uid}`;
            const uni = like.uni || "Студент";
            const quote = like.quote || "";

            div.innerHTML = `
        <img src="${photo}" class="like-photo">
        <div class="like-info">
            <div class="like-name">${name}</div>
            <div class="like-uni">${uni}</div>
            <div class="like-quote">${quote}</div>
        </div>

        <div class="like-actions">
            <button class="reject-btn" data-uid="${like.from_uid}">❌</button>
            <button class="accept-btn" data-uid="${like.from_uid}">❤️</button>
        </div>
    `;

            likesList.appendChild(div);
        });


    } catch (err) {
        console.error(err);
        likesList.innerHTML = "<p>❌ Помилка завантаження</p>";
    }
}

// ===== Автооновлення кожні 60 секунд =====
setInterval(() => {
    if (likesModal.style.display === "block") {
        loadLikes();
    }
}, 60000);
// ===== Обробники кнопок =====

// Reject (Відхилити)
document.querySelectorAll(".reject-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
        const fromUid = btn.dataset.uid;

        try {
            await fetch(`https://buddyup-production-88e9.up.railway.app/reject_like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to_uid: currentUid,
                    from_uid: fromUid
                })
            });

            btn.closest(".like-item").remove(); // забрати з UI
        } catch (err) {
            console.log(err);
            alert("Помилка при відхиленні!");
        }
    });
});

// Accept (Прийняти → створює матч)
document.querySelectorAll(".accept-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
        const fromUid = btn.dataset.uid;

        try {
            const res = await fetch(`https://buddyup-production-88e9.up.railway.app/accept_like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to_uid: currentUid,
                    from_uid: fromUid
                })
            });

            const data = await res.json();

            if (data.status === "match") {
                alert("🎉 У вас взаємний матч!");
            }

            btn.closest(".like-item").remove(); // забрати з UI
        } catch (err) {
            console.log(err);
            alert("Помилка при прийнятті!");
        }
    });
});
