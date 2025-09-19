document.addEventListener('DOMContentLoaded', () => {
    // Firebase configuration
    const firebaseConfig = {
    apiKey: "AIzaSyCNX5U-nlxxUcbvF61Gj6tkMssIdBmBmCg",
    authDomain: "kccw-a2786.firebaseapp.com",
    projectId: "kccw-a2786",
    storageBucket: "kccw-a2786.firebasestorage.app",
    messagingSenderId: "782338075484",
    appId: "1:782338075484:web:1667423357315006876f99",
    measurementId: "G-MWGJ03P681"
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const auth = firebase.auth();
    const messageBox = document.getElementById('message-box');
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const displayMessage = (message, type) => {
        messageBox.textContent = message;
        messageBox.className = `alert alert-${type}`;
        messageBox.style.display = 'block';
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 5000);
    };

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            await auth.signInWithEmailAndPassword(email, password);
            displayMessage('Logowanie zakończone sukcesem!', 'success');
            // Redirect to a dashboard or home page after successful login
            // window.location.href = '/dashboard.html';
        } catch (error) {
            console.error('Error during login:', error);
            displayMessage('Błąd logowania: ' + error.message, 'danger');
        }
    });
});
