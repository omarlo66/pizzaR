document.addEventListener('DOMContentLoaded', function() {
    // Function to check if the user is logged in
    function checkLogin() {
        const userId = localStorage.getItem('userId');
        if (!userId && !isLoginPage()) {
            window.location.href = 'login.html';
        }
    }

    // Function to check if the current page is the login page
    function isLoginPage() {
        return window.location.pathname.includes('login.html');
    }

    // Ensure user is logged in for all pages except login
    checkLogin();

    // Profile page functionality
    const profileContainer = document.getElementById('profile-container');
    if (profileContainer) {
        const username = localStorage.getItem('username');
        const email = localStorage.getItem('email');

        if (username && email) {
            document.getElementById('username').textContent = username;
            document.getElementById('email').textContent = email;
        } else {
            alert('لا توجد معلومات مستخدم. يرجى تسجيل الدخول.');
            window.location.href = 'login.html';
        }
    }

    const ordersPageElement = document.getElementById('orders-page');
    if (ordersPageElement) {
        // Fetch orders only when on orders page
        fetch('/orders')
            .then(response => response.json())
            .then(orders => {
                // Display orders on the page
                const ordersContainer = document.getElementById('orders-container');
                let totalPrice = 0;

                if (orders.length === 0) {
                    ordersContainer.innerHTML = '<p>لا توجد طلبات</p>';
                } else {
                    orders.forEach(order => {
                        const orderElement = document.createElement('div');
                        orderElement.innerHTML = `
                            <h3>الطلب رقم: ${order._id}</h3>
                            <img src="${order.imageUrl}" alt="${order.name}" style="width: 100px;">
                            <p>المنتجات: ${order.name}</p>
                            <p>السعر: ${order.price} دولار</p>
                            <p>النوع: ${order.type}</p>
                        `;
                        ordersContainer.appendChild(orderElement);
                        totalPrice += parseFloat(order.price);
                    });

                    document.getElementById('total-price').textContent = totalPrice.toFixed(2);
                }
            })
            .catch(error => {
                console.error('Error fetching orders:', error);
                alert('حدث خطأ أثناء جلب الطلبات');
            });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;

            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Login successful') {
                    localStorage.setItem('userId', data.userId);
                    localStorage.setItem('username', username);
                    localStorage.setItem('email', email);
                    window.location.href = 'home.html';
                } else {
                    alert('Failed to login. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error during login:', error);
                alert('حدث خطأ أثناء تسجيل الدخول');
            });
        });
    }

    // Function to handle adding items to cart
    window.addToCart = function(type, itemName) {
        const size = type === 'Pizza' ? document.querySelector('input[name="size"]:checked').value : null;
        const totalPrice = document.getElementById('totalPrice').textContent;
        const userId = localStorage.getItem('userId');

        const order = {
            name: itemName,
            size: size,
            price: totalPrice,
            type: type.toLowerCase(),
            userId: userId
        };

        fetch('/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.parse(order)
            // body: JSON.stringify(order)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            alert('تم إضافة الطلب إلى السلة');
            navigateTo('home');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('حدث خطأ أثناء إضافة الطلب إلى السلة');
        });
    }

    // Update total price on pizza size change
    const sizeOptions = document.querySelectorAll('input[name="size"]');
    const totalPriceElement = document.getElementById('totalPrice');
    if (sizeOptions.length > 0 && totalPriceElement) {
        sizeOptions.forEach(option => {
            option.addEventListener('change', function () {
                totalPriceElement.textContent = this.value;
            });
        });
    }

    // Navigate to different pages
    window.navigateTo = function(page) {
        window.location.href = `${page}.html`;
    }

    // Select pizza type and store in localStorage
    window.selectPizza = function(type) {
        localStorage.setItem('selectedPizza', type);
        window.location.href = 'pizza-details.html';
    }

    // Select burger type and store in localStorage
    window.selectBurger = function(type) {
        localStorage.setItem('selectedBurger', type);
        window.location.href = 'burger-details.html';
    }

    // Pizza details page functionality
    const pizzaType = localStorage.getItem('selectedPizza');
    const pizzaNameElement = document.getElementById('pizzaName');
    const pizzaImageElement = document.getElementById('pizzaImage');

    if (pizzaNameElement && pizzaImageElement) {
        let pizzaName = '';
        let pizzaImageSrc = '';

        if (pizzaType === 'vegetarian') {
            pizzaName = 'بيتزا بالخضار';
            pizzaImageSrc = 'vegetarian.webp'; // تأكد من أن هذا المسار صحيح
        } else if (pizzaType === 'cheese') {
            pizzaName = 'بيتزا بالجبن';
            pizzaImageSrc = 'cheese.jpg'; // تأكد من أن هذا المسار صحيح
        }

        pizzaNameElement.textContent = pizzaName;
        pizzaImageElement.src = pizzaImageSrc;
    }

    // Burger details page functionality
    const burgerType = localStorage.getItem('selectedBurger');
    const burgerNameElement = document.getElementById('burgerName');
    const burgerImageElement = document.getElementById('burgerImage');

    if (burgerNameElement && burgerImageElement) {
        let burgerName = '';
        let burgerImageSrc = 'burger.jpg'; // Assuming a default burger image, update accordingly

        burgerNameElement.textContent = burgerName;
        burgerImageElement.src = burgerImageSrc;
    }
});
