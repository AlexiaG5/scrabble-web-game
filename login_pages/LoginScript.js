
// Register and Login form
document.addEventListener('DOMContentLoaded', () => {

  // Handles registration form
  document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password })
    })
    .then(response => response.json())
    .then(data => {
      document.getElementById('message').textContent = data.message || data.error;
    })
    .catch(error => {
        document.getElementById('message').textContent = 'Registration failed. Please try again.';
      });
  });

  // Handles login form
  document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', 
          },
        body: JSON.stringify({ email, password })
    })
    .then(response =>  response.json())
    .then(data => {
        // If the response is JSON and has a 'message', display it
        if (data.message) {
            document.getElementById("message").innerText = data.message;

            // If login is successful store the user info
            if (data.message === 'Login successful') {

              localStorage.setItem('email', data.email);
              localStorage.setItem('username', data.username);

              window.location.href = '/mainMenu';  // Redirect after login
            }
        } else {
            // Handle any other response (error)
            document.getElementById('loginMessage').textContent = data.message;
        }
    })
    .catch(error => {
        console.error(error);
        document.getElementById('message').textContent = 'Login failed. Please try again.';
    });
  })

  // Guest button function
  document.getElementById("guest-login").addEventListener("click", function () {
    fetch("/guestLogin", { method: "POST" })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                localStorage.removeItem("username");
                localStorage.removeItem("email");
                window.location.href = "/mainMenu";
            }
        });
    });
})

// Function to toggle between register and login forms
function toggleForm() {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const toggleButton = document.getElementById('toggleButton');
  const message = document.getElementById('message');

  message.textContent = '';
  
  if (registerForm.style.display === 'none') {
      // Show register form and hide login form
      registerForm.style.display = 'block';
      loginForm.style.display = 'none';
      toggleButton.textContent = 'Login';
  } else {
      // Show login form and hide register form
      registerForm.style.display = 'none';
      loginForm.style.display = 'block';
      toggleButton.textContent = 'Register';
  }
}

// Show the register form and hide the login form at first
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('registerForm').style.display = 'block';
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('toggleButton').disabled = false;
});