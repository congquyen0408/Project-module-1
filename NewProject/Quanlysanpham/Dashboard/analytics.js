
if (!getUserLogin()) {
    location.href = "../Auth/auth.html";
}

console.log(getUserLogin())


let btnLogout = document.querySelector("#btnLogout");
if (btnLogout) {
    btnLogout.onclick = function () {
        localStorage.removeItem("userLogin");
        location.href = "../Auth/auth.html";
    };
}

let currentUser = getUserLogin();

if (!currentUser) {
    location.href = "../Auth/auth.html";
} else {
    let userNameElement = document.querySelector("#userName");
    if (userNameElement) {
        userNameElement.textContent = currentUser.email;
    }
}