let currentUser = getUserLogin();

if (currentUser === null) {
    window.location.href = "../Auth/auth.html";
} else {
    let userNameElement = document.querySelector("#userName");
    if (userNameElement !== null) {
        if (currentUser.first_name && currentUser.last_name) {
            userNameElement.textContent = currentUser.last_name + " " + currentUser.first_name;
        } else {
            userNameElement.textContent = currentUser.email;
        }
    }

    let userAvatarElement = document.querySelector("#userAvatar");
    if (userAvatarElement !== null && currentUser.avatar) {
        userAvatarElement.src = currentUser.avatar;
    }
}

let logoutButtons = document.querySelectorAll(".btn-logout-action");
for (let i = 0; i < logoutButtons.length; i++) {
    logoutButtons[i].onclick = function () {
        localStorage.removeItem("userLogin");
        window.location.href = "../Auth/auth.html";
    };
}


function renderAnalytics() {
    let analyticsContent = document.querySelector("#analyticsContent");
    if (analyticsContent === null) return;


    let usersList = getUsers();
    let categoryList = getCategories();
    let productList = getProducts();


    analyticsContent.innerHTML = `
        <div class="row g-4">
            <div class="col-md-4">
                <div class="card border-0 bg-primary bg-opacity-10 p-3 rounded-3">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <h6 class="text-primary mb-1 fw-bold">Tổng người dùng</h6>
                            <h3 class="mb-0 fw-bold text-primary">${usersList.length}</h3>
                        </div>
                        <i class="fa-solid fa-users fa-2x text-primary"></i>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="card border-0 bg-success bg-opacity-10 p-3 rounded-3">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <h6 class="text-success mb-1 fw-bold">Tổng danh mục</h6>
                            <h3 class="mb-0 fw-bold text-success">${categoryList.length}</h3>
                        </div>
                        <i class="fa-solid fa-folder fa-2x text-success"></i>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="card border-0 bg-warning bg-opacity-10 p-3 rounded-3">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <h6 class="text-warning mb-1 fw-bold">Tổng sản phẩm</h6>
                            <h3 class="mb-0 fw-bold text-warning">${productList.length}</h3>
                        </div>
                        <i class="fa-solid fa-box fa-2x text-warning"></i>
                    </div>
                </div>
            </div>
        </div>
    `;
}

renderAnalytics();