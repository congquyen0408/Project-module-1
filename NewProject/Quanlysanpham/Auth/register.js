let registerForm = document.querySelector('#registerForm');
let alertBox = document.querySelector('#alertBox');

let lastNameError = document.querySelector('#lastNameError');
let firstNameError = document.querySelector('#firstNameError');
let emailError = document.querySelector('#emailError');
let passwordError = document.querySelector('#passwordError');
let confirmPasswordError = document.querySelector('#confirmPasswordError');
let agreeError = document.querySelector('#agreeError');

function isValidEmail(email) {
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

registerForm.onsubmit = function (e) {
    e.preventDefault();

    let lastNameInput = document.querySelector('#lastName').value.trim();
    let firstNameInput = document.querySelector('#firstName').value.trim();
    let emailInput = document.querySelector('#email').value.trim();
    let passwordInput = document.querySelector('#password').value.trim();
    let confirmPasswordInput = document.querySelector('#confirmPassword').value.trim();
    let agreeCheck = document.querySelector('#agreeCheck').checked;


    let errorMessage = null;

    if (lastNameInput === "") {
        lastNameError.style.display = "block";
        errorMessage = "Có lỗi";
    } else {
        lastNameError.style.display = "none";
    }

    if (firstNameInput === "") {
        firstNameError.style.display = "block";
        errorMessage = "Có lỗi";
    } else {
        firstNameError.style.display = "none";
    }


    if (emailInput === "") {
        emailError.textContent = "Email không được để trống";
        emailError.style.display = "block";
        errorMessage = "Có lỗi";
    } else if (!isValidEmail(emailInput)) {

        emailError.textContent = "Email không đúng định dạng";
        emailError.style.display = "block";
        errorMessage = "Có lỗi";
    } else {
        emailError.style.display = "none";
    }

    if (passwordInput === "") {
        passwordError.textContent = "Mật khẩu không được để trống";
        passwordError.style.display = "block";
        errorMessage = "Có lỗi";
    } else if (passwordInput.length < 8) {

        passwordError.textContent = "Mật khẩu phải tối thiểu 8 ký tự";
        passwordError.style.display = "block";
        errorMessage = "Có lỗi";
    } else {
        passwordError.style.display = "none";
    }


    if (confirmPasswordInput === "") {
        confirmPasswordError.textContent = "Mật khẩu xác nhận không được để trống";
        confirmPasswordError.style.display = "block";
        errorMessage = "Có lỗi";
    } else if (confirmPasswordInput !== passwordInput) {

        confirmPasswordError.textContent = "Mật khẩu xác nhận không trùng khớp";
        confirmPasswordError.style.display = "block";
        errorMessage = "Có lỗi";
    } else {
        confirmPasswordError.style.display = "none";
    }


    if (!agreeCheck) {
        agreeError.style.display = "block";
        errorMessage = "Có lỗi";
    } else {
        agreeError.style.display = "none";
    }

    if (errorMessage !== null) {
        alertBox.classList.add('d-none');
        return;
    }

    let isEmailExist = false;
    for (let i = 0; i < modList.length; i++) {
        if (modList[i].email === emailInput) {
            isEmailExist = true;
            break;
        }
    }

    if (isEmailExist) {
        showAlert("Email này đã được sử dụng! Vui lòng chọn email khác.", "danger");
        return;
    }

    let newUser = {
        id: modList.length + 1,
        fullName: lastNameInput + " " + firstNameInput,
        email: emailInput,
        password: passwordInput,
        status: true,
        isMaster: false
    };


    modList.push(newUser);


    localStorage.setItem("modList", JSON.stringify(modList));


    showAlert("Đăng ký tài khoản thành công! Đang chuyển về trang đăng nhập...", "success");

    setTimeout(function () {
        window.location.href = "auth.html";
    }, 2000);
};

function showAlert(message, type) {
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.classList.remove('d-none');
}