document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const data = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };
            
            console.log('Дані входу:', data);
            alert('Вхід успішний! (Перевірте консоль)');
        });