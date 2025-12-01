document.getElementById('photo').addEventListener('change', function(e) {
    const preview = document.getElementById('profile-preview');
    const fileUploadText = document.getElementById('file-upload-text');
    const file = e.target.files[0];

    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            preview.src = event.target.result;
            preview.style.display = 'block';
        }
        
        reader.readAsDataURL(file);
        fileUploadText.textContent = file.name;
    } else {
        preview.src = '';
        preview.style.display = 'none';
        fileUploadText.textContent = 'Вибрати файл';
    }
});

document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const data = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        name: document.getElementById('name').value,
        surname: document.getElementById('surname').value,
        // НОВЕ ПОЛЕ: Дата народження
        dateOfBirth: document.getElementById('dateOfBirth').value,
        // КІНЕЦЬ НОВОГО ПОЛЯ
        phoneNumber: document.getElementById('phoneNumber').value,
        telegramUsername: document.getElementById('telegramUsername').value,
        photo: document.getElementById('photo').files[0] 
    };
    
    console.log('Дані реєстрації:', data);
    alert('Реєстрація успішна! (Перевірте консоль)');
});