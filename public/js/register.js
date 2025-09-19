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
    const db = firebase.firestore();

    const volunteerRole = document.getElementById('volunteer-role');
    const institutionRole = document.getElementById('institution-role');
    const volunteerFields = document.getElementById('volunteer-fields');
    const institutionFields = document.getElementById('institution-fields');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const registerForm = document.getElementById('register-form');
    const registerContainer = document.querySelector('.login-container'); // Get the login container
    const messageBox = document.getElementById('message-box'); // Get the message box

    // Institution specific email and password inputs
    const institutionEmailInput = document.getElementById('institution-email');
    const institutionPasswordInput = document.getElementById('institution-password');

    // Get all input fields to handle placeholders
    const allInputs = document.querySelectorAll('#register-form input');

    // Function to update field visibility and container width
    const updateFieldVisibility = () => {
        const institutionInputs = institutionFields.querySelectorAll('input');

        if (volunteerRole.classList.contains('active')) {
            volunteerFields.style.display = 'block';
            institutionFields.style.display = 'none';
            registerContainer.classList.remove('wider-form');
            // Remove 'required' attribute when institution fields are hidden
            institutionInputs.forEach(input => input.removeAttribute('required'));
        } else {
            volunteerFields.style.display = 'none';
            institutionFields.style.display = 'block';
            // Add 'required' attribute back when institution fields are visible
            institutionInputs.forEach(input => input.setAttribute('required', ''));
            if (window.innerWidth >= 768) {
                registerContainer.classList.add('wider-form');
            } else {
                registerContainer.classList.remove('wider-form');
            }
        }
    };

    // Initial field visibility setup
    updateFieldVisibility();

    // Function to display messages in the message box
    const displayMessage = (message, type) => {
        messageBox.textContent = message;
        messageBox.className = `alert alert-${type}`;
        messageBox.style.display = 'block';
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 5000); // Hide message after 5 seconds
    };

    // Function to clear messages from the message box
    const clearMessages = () => {
        messageBox.textContent = '';
        messageBox.className = 'alert';
        messageBox.style.display = 'none';
    };

    // Add a resize listener to adjust width dynamically
    window.addEventListener('resize', updateFieldVisibility);

    // Role switch logic
    volunteerRole.addEventListener('click', () => {
        volunteerRole.classList.add('active');
        institutionRole.classList.remove('active');
        updateFieldVisibility();
    });

    institutionRole.addEventListener('click', () => {
        institutionRole.classList.add('active');
        volunteerRole.classList.remove('active');
        updateFieldVisibility();
    });

    // Smooth placeholder animation (using Bootstrap's form-floating might be better for complex animations)
    const handlePlaceholder = (input) => {
        const originalPlaceholder = input.placeholder;
        input.addEventListener('focus', () => {
            input.placeholder = '';
        });
        input.addEventListener('blur', () => {
            if (input.value === '') {
                input.placeholder = originalPlaceholder;
            }
        });
    };

    // Apply placeholder handling to all relevant input fields
    allInputs.forEach(handlePlaceholder);

    // Registration form submission (basic example)
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        let email, password; // Declare email and password variables

        if (volunteerRole.classList.contains('active')) {
            email = emailInput.value;
            password = passwordInput.value;
            const repeatPasswordVolunteer = document.getElementById('volunteer-repeat-password')?.value;

            if (password !== repeatPasswordVolunteer) {
                displayMessage('Hasła wolontariusza nie pasują do siebie!', 'danger');
                return;
            }
            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                await db.collection('users').doc(user.uid).set({
                    email: user.email,
                    role: 'volunteer'
                });
                await user.sendEmailVerification(); // Send email verification
                console.log('Wolontariusz zarejestrowany i zalogowany:', user);
                displayMessage('Rejestracja wolontariusza zakończona sukcesem! Sprawdź swój adres e-mail w celu weryfikacji.', 'success');
            } catch (error) {
                console.error('Error during volunteer registration:', error);
                if (error.code === 'auth/email-already-in-use') {
                    try {
                        // Try to sign in the user to check verification status
                        const userCredential = await auth.signInWithEmailAndPassword(email, password);
                        const user = userCredential.user;

                        if (!user.emailVerified) {
                            await user.sendEmailVerification();
                            displayMessage('Konto z tym adresem e-mail już istnieje, ale nie jest zweryfikowane. Nowa wiadomość e-mail z weryfikacją została wysłana.', 'info');
                        } else {
                            displayMessage('Konto z tym adresem e-mail już istnieje i jest zweryfikowane. Zaloguj się.', 'info');
                        }
                    } catch (signInError) {
                        console.error('Błąd podczas logowania w celu sprawdzenia weryfikacji:', signInError);
                        displayMessage('Błąd: ' + signInError.message, 'danger');
                    }
                } else {
                    displayMessage('Błąd: ' + error.message, 'danger');
                }
            }
        } else { // Institution registration
            email = institutionEmailInput.value; // Use institution-specific email input
            password = institutionPasswordInput.value; // Use institution-specific password input
            const repeatPasswordInstitution = document.getElementById('institution-repeat-password')?.value;

            if (password !== repeatPasswordInstitution) {
                displayMessage('Hasła instytucji nie pasują do siebie!', 'danger');
                return;
            }

            const institutionName = document.getElementById('institution-name').value;
            const contactPerson = document.getElementById('contact-person').value;
            const institutionPhone = document.getElementById('institution-phone').value;
            const address = document.getElementById('institution-address').value;
            const zipCode = document.getElementById('institution-zip').value;

            try {
                // Check if institution already exists
                const institutionRef = db.collection('institutions').where('name', '==', institutionName);
                const institutionSnapshot = await institutionRef.get();

                if (!institutionSnapshot.empty) {
                    displayMessage('Instytucja o tej nazwie już istnieje. Skontaktuj się z administratorem, aby uzyskać dostęp.', 'danger');
                    return;
                }

                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Create new institution document
                const newInstitutionRef = await db.collection('institutions').add({
                    name: institutionName,
                    contactPerson: contactPerson,
                    phone: institutionPhone,
                    address: address,
                    zipCode: zipCode,
                    adminId: user.uid // Link institution to its admin user
                });

                await db.collection('users').doc(user.uid).set({
                    email: user.email,
                    role: 'institution_admin', // Set role as institution_admin
                    institutionId: newInstitutionRef.id // Link user to the institution
                });
                await user.sendEmailVerification(); // Send email verification
                console.log('Instytucja zarejestrowana i zalogowana:', user);
                displayMessage('Rejestracja instytucji zakończona sukcesem! Sprawdź swój adres e-mail w celu weryfikacji.', 'success');
            } catch (error) {
                console.error('Error during institution registration:', error);
                if (error.code === 'auth/email-already-in-use') {
                    try {
                        // Try to sign in the user to check verification status
                        const userCredential = await auth.signInWithEmailAndPassword(email, password);
                        const user = userCredential.user;

                        if (!user.emailVerified) {
                            await user.sendEmailVerification();
                            displayMessage('Konto z tym adresem e-mail już istnieje, ale nie jest zweryfikowane. Nowa wiadomość e-mail z weryfikacją została wysłana.', 'info');
                        } else {
                            displayMessage('Konto z tym adresem e-mail już istnieje i jest zweryfikowane. Zaloguj się.', 'info');
                        }
                    } catch (signInError) {
                        console.error('Błąd podczas logowania w celu sprawdzenia weryfikacji:', signInError);
                        displayMessage('Błąd: ' + signInError.message, 'danger');
                    }
                } else {
                    displayMessage('Błąd: ' + error.message, 'danger');
                }
            }
        }
    });

    // For now, it's just a console log. In a real app, this might navigate to a login form.
    const loginLink = document.getElementById('login-link');
    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'login.html';
        });
    }
});
