// ЛАЙКИ //

const likesModal = document.getElementById("likes-modal");
const likesButton = document.getElementById("likes-button");
const closeLikesButton = document.querySelector(".close-likes-button");
const likesList = document.getElementById("likes-list");


const currentUid = localStorage.getItem("userId");


likesButton.addEventListener("click", () => {
    likesModal.style.display = "block";
    loadLikes();
});


const closeButtons = document.querySelectorAll('.close-button');


closeButtons.forEach(button => {

    button.addEventListener('click', function() {
        const modalToClose = this.closest('.modal');
        if (modalToClose) {
            modalToClose.style.display = 'none';
        }
    });
});


window.addEventListener("click", (e) => {
    if (e.target === likesModal) {
        likesModal.style.display = "none";
    }
});

// LOAD LIKES 
async function loadLikes() {
    if (!currentUid) {
        likesList.innerHTML = "<p>❌ Ви не увійшли</p>";
        return;
    }

    likesList.innerHTML = "<p>Завантаження...</p>";

    try {
        const res = await fetch(
            `https://buddyup-production-88e9.up.railway.app/get_likes?uid=${currentUid}`
        );

        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
            likesList.innerHTML = "<p>Поки що ніхто не лайкнув 😔</p>";
            return;
        }

        likesList.innerHTML = "";

        data.forEach(like => {
            const div = document.createElement("div");
            div.classList.add("like-item");
            console.log(like);

            const photo = like.photo || "/img/default-avatar.png";
            const name = (like.name + like.surname) || `UID: ${like.id}`;
            const birthday = like.birthday || "Студент";

            div.innerHTML = `
                <img src="${photo}" class="like-photo">
                <div class="like-info">
                    <div class="like-name">${name}</div>
                    <div class="like-uni">${birthday}</div>
                </div>

                <div class="like-actions">
                    <button class="reject-btn" data-uid="${like.id}">❌</button>
                    <button class="accept-btn" data-uid="${like.id}">❤️</button>
                </div>
            `;

            likesList.appendChild(div);
        });

        attachButtons();

    } catch (err) {
        console.error(err);
        likesList.innerHTML = "<p>❌ Помилка завантаження</p>";
    }
}

setInterval(() => {
    if (likesModal.style.display === "block") {
        loadLikes();
    }
}, 60000);

//BUTTON HANDLERS 
function attachButtons() {

    document.querySelectorAll(".reject-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const fromUid = btn.dataset.uid;

            const url =
                `https://buddyup-production-88e9.up.railway.app/removeLike` +
                `?to=${encodeURIComponent(currentUid)}` +
                `&from=${encodeURIComponent(fromUid)}`;
            print(url);
            try {
                await fetch(url, { method: "POST" });

                btn.closest(".like-item").remove();
            } catch (err) {
                console.log(err);
                alert("Помилка при відхиленні!");
            }
        });
    });

    // Accept
    document.querySelectorAll(".accept-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const fromUid = btn.dataset.uid;

            const url =
                `https://buddyup-production-88e9.up.railway.app/sendLike` +
                `?to=${encodeURIComponent(currentUid)}` +
                `&from=${encodeURIComponent(fromUid)}`;

            try {
                const res = await fetch(url, { method: "POST" });
                const data = await res.json();

                if (data.status === "match") {
                    alert("🎉 У вас взаємний матч!");
                }

                btn.closest(".like-item").remove();
            } catch (err) {
                console.log(err);
                alert("Помилка при прийнятті!");
            }
        });
    });
}
