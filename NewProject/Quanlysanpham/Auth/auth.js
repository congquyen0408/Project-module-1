let loginForm = document.querySelector('#loginForm');
let alertBox = document.querySelector('#alertBox');
let emailError = document.querySelector('#emailError');
let passwordError = document.querySelector('#passwordError');

loginForm.onsubmit = function (e) {
    e.preventDefault();

    let emailInput = document.querySelector('#email').value.trim();
    let passwordInput = document.querySelector('#password').value.trim();

    console.log(emailInput)
    console.log(passwordInput)

    let isValid = true;

    if (emailInput === "") {
        emailError.style.display = "block";
        isValid = false;
    } else {
        emailError.style.display = "none";
    }

    if (passwordInput === "") {
        passwordError.style.display = "block";
        isValid = false;
    } else {
        passwordError.style.display = "none";
    }

        if (!isValid) {
            alertBox.classList.add('d-none');
            return;
        }

    let foundUser = null;
    for (let i = 0; i < modList.length; i++) {
        if (modList[i].email === emailInput && modList[i].password === passwordInput) {
            foundUser = modList[i];
            break;
        }
    }

    if (foundUser !== null) {
        if (foundUser.status === false) {
            showAlert('Tài khoản của bạn đã bị khóa!', 'danger');
            return;
        }

        showAlert('Đăng nhập thành công!', 'success');
        localStorage.setItem('userLogin', JSON.stringify(foundUser));

        setTimeout(function () {
            window.location.href ='../Dashboard/analytics.html';
        }, 2000);

    } else {
        showAlert('Email hoặc mật khẩu không chính xác!', 'danger');
    }
};

function showAlert(message, type) {
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.classList.remove('d-none');
}