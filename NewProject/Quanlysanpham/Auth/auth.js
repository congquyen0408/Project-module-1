let loginForm = document.querySelector('#loginForm');
let alertBox = document.querySelector('#alertBox');

let emailError = document.querySelector('#emailError');
let passwordError = document.querySelector('#passwordError');

function isValidEmail(email) {
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showAlert(message, type) {
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.classList.remove('d-none');
}

loginForm.onsubmit = function (e) {
    e.preventDefault();
    let formEl = e.target;

    let emailInput = formEl.email.value.trim();
    let passwordInput = formEl.password.value.trim();


    let isValid = true;

    if (emailInput === "") {
        emailError.textContent = "Email không được để trống";
        emailError.style.display = "block";
        isValid = false;
    } else if (!isValidEmail(emailInput)) {
        emailError.textContent = "Email không đúng định dạng";
        emailError.style.display = "block";
        isValid = false;
    } else {
        emailError.style.display = "none";
    }

    if (passwordInput === "") {
        passwordError.textContent = "Mật khẩu không được để trống";
        passwordError.style.display = "block";
        isValid = false;
    } else if (passwordInput.length < 6) {
        passwordError.textContent = "Mật khẩu phải tối thiểu 6 ký tự";
        passwordError.style.display = "block";
        isValid = false;
    } else {
        passwordError.style.display = "none";
    }

    if (!isValid) {
        alertBox.classList.add('d-none');
        return;
    }

    let usersList = getUsers();

    let foundUser = null;
    for (let i = 0; i < usersList.length; i++) {
        if (usersList[i].email === emailInput && usersList[i].password === passwordInput) {
            foundUser = usersList[i];
            break;
        }
    }

    if (foundUser !== null) {
        if (foundUser.status === false) {
            showAlert("Tài khoản của bạn đã bị khóa!", "danger");
            return;
        }

        localStorage.setItem("userLogin", JSON.stringify(foundUser));
        showAlert("Đăng nhập thành công!", "success");

        setTimeout(function () {
            window.location.href = "../Dashboard/analytics.html";
        }, 1500);
    } else {
        showAlert("Email hoặc mật khẩu không chính xác!", "danger");
    }
};
