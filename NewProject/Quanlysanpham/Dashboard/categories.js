let currentUser = getUserLogin();

if (currentUser === null) {
    location.href = "../Auth/auth.html";
} else {
    let userNameElement = document.querySelector("#userName");
    if (userNameElement !== null) {
        if (currentUser.first_name !== "" && currentUser.last_name !== "") {
            userNameElement.textContent = currentUser.last_name + " " + currentUser.first_name;
        } else {
            userNameElement.textContent = currentUser.email;
        }
    }

    let userAvatarElement = document.querySelector("#userAvatar");
    if (userAvatarElement !== null) {
        if (currentUser.avatar !== "") {
            userAvatarElement.src = currentUser.avatar;
        }
    }
}

let btnLogout = document.querySelector("#btnLogout");
if (btnLogout !== null) {
    btnLogout.onclick = function () {
        localStorage.removeItem("userLogin");
        location.href = "../Auth/auth.html";
    };
}

let categoryList = getCategories();

let listCategoryElement = document.querySelector("#listCategory");
let btnOpenAddModal = document.querySelector("#btnOpenAddModal");
let searchCategoryInput = document.querySelector("#searchCategory");
let filterStatusSelect = document.querySelector("#filterStatus");

let categoryModalElement = document.querySelector("#categoryModal");
let categoryModal = new bootstrap.Modal(categoryModalElement);

let modalTitle = document.querySelector("#modalTitle");
let categoryForm = document.querySelector("#categoryForm");
let categoryCodeInput = document.querySelector("#categoryCode");
let categoryTitleInput = document.querySelector("#categoryTitle");
let codeError = document.querySelector("#codeError");
let titleError = document.querySelector("#titleError");
let btnSave = document.querySelector("#btnSave");

let warningDeleteModalElement = document.querySelector("#warningDeleteModal");
let warningDeleteModal = new bootstrap.Modal(warningDeleteModalElement);

let deleteConfirmModalElement = document.querySelector("#deleteConfirmModal");
let deleteConfirmModal = new bootstrap.Modal(deleteConfirmModalElement);

let successToastElement = document.querySelector("#successToast");
let successToast = new bootstrap.Toast(successToastElement, { delay: 3000 });

let deleteCategoryId = null;
let editId = null;
let sortOrder = null;


function getFilteredCategories() {
    let result = [];

    let keyword = "";
    if (searchCategoryInput !== null) {
        keyword = searchCategoryInput.value.trim().toLowerCase();
    }

    let statusFilter = "all";
    if (filterStatusSelect !== null) {
        statusFilter = filterStatusSelect.value;
    }

    for (let i = 0; i < categoryList.length; i++) {
        let item = categoryList[i];

        let matchName = item.category_name.toLowerCase().includes(keyword);
        let matchStatus = true;

        if (statusFilter === "active") {
            if (item.status === "ACTIVE") {
                matchStatus = true;
            } else {
                matchStatus = false;
            }
        } else if (statusFilter === "inactive") {
            if (item.status === "INACTIVE") {
                matchStatus = true;
            } else {
                matchStatus = false;
            }
        }

        if (matchName && matchStatus) {
            result.push(item);
        }
    }

    if (sortOrder !== null) {
        for (let i = 0; i < result.length - 1; i++) {
            for (let j = i + 1; j < result.length; j++) {
                if (sortOrder === "asc") {
                    if (result[i].category_name.localeCompare(result[j].category_name) > 0) {
                        let temp = result[i];
                        result[i] = result[j];
                        result[j] = temp;
                    }
                } else if (sortOrder === "desc") {
                    if (result[i].category_name.localeCompare(result[j].category_name) < 0) {
                        let temp = result[i];
                        result[i] = result[j];
                        result[j] = temp;
                    }
                }
            }
        }
    }

    return result;
}


function renderCategories() {
    let listToRender = getFilteredCategories();
    let htmlContent = "";

    if (listToRender.length === 0) {
        htmlContent = `<tr><td colspan="4" class="text-center text-muted py-4">Không tìm thấy danh mục phù hợp</td></tr>`;
    } else {
        for (let i = 0; i < listToRender.length; i++) {
            let item = listToRender[i];

            let statusBadge = "";
            if (item.status === "ACTIVE") {
                statusBadge = `<span class="badge-active">Đang hoạt động</span>`;
            } else {
                statusBadge = `<span class="badge-inactive">Ngừng hoạt động</span>`;
            }

            htmlContent += `
                <tr>
                    <td>${item.category_code}</td>
                    <td class="fw-medium">${item.category_name}</td>
                    <td class="text-center">${statusBadge}</td>
                    <td class="text-center">
                        <button class="btn-action btn-delete" onclick="handleDelete(${item.id})">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                        <button class="btn-action btn-edit" onclick="handleEdit(${item.id})">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </button>
                    </td>
                </tr>
            `;
        }
    }

    listCategoryElement.innerHTML = htmlContent;
}

if (searchCategoryInput !== null) {
    searchCategoryInput.onkeyup = function () {
        renderCategories();
    };
}

if (filterStatusSelect !== null) {
    filterStatusSelect.onchange = function () {
        renderCategories();
    };
}

function handleSortByName() {
    let sortIcon = document.querySelector("#sortNameIcon");
    if (sortOrder === null || sortOrder === "desc") {
        sortOrder = "asc";
        if (sortIcon !== null) {
            sortIcon.className = "fa-solid fa-arrow-up-long ms-1";
        }
    } else {
        sortOrder = "desc";
        if (sortIcon !== null) {
            sortIcon.className = "fa-solid fa-arrow-down-long ms-1";
        }
    }
    renderCategories();
}

btnOpenAddModal.onclick = function () {
    editId = null;
    modalTitle.textContent = "Thêm mới danh mục";
    btnSave.textContent = "Thêm";
    categoryForm.reset();
    resetValidation();
    categoryModal.show();
};

function handleEdit(id) {
    let foundCategory = null;
    for (let i = 0; i < categoryList.length; i++) {
        if (categoryList[i].id === id) {
            foundCategory = categoryList[i];
            break;
        }
    }

    if (foundCategory !== null) {
        editId = id;
        modalTitle.textContent = "Cập nhật danh mục";
        btnSave.textContent = "Lưu";
        resetValidation();

        categoryCodeInput.value = foundCategory.category_code;
        categoryTitleInput.value = foundCategory.category_name;

        if (foundCategory.status === "ACTIVE") {
            document.querySelector("#statusActive").checked = true;
        } else {
            document.querySelector("#statusInactive").checked = true;
        }

        categoryModal.show();
    }
}


function saveCategory(event) {
    event.preventDefault();
    let formEl = event.target;

    let codeValue = formEl.categoryCode.value.trim();
    let titleValue = formEl.categoryTitle.value.trim();

    let isCheckedActive = document.querySelector("#statusActive").checked;
    let statusValue;
    if (isCheckedActive) {
        statusValue = "ACTIVE";
    } else {
        statusValue = "INACTIVE";
    }

    let errorMessage = null;

    if (codeValue === "") {
        codeError.style.display = "block";
        categoryCodeInput.classList.add("is-invalid");
        errorMessage = "Có lỗi";
    } else {
        codeError.style.display = "none";
        categoryCodeInput.classList.remove("is-invalid");
    }

    if (titleValue === "") {
        titleError.style.display = "block";
        categoryTitleInput.classList.add("is-invalid");
        errorMessage = "Có lỗi";
    } else {
        titleError.style.display = "none";
        categoryTitleInput.classList.remove("is-invalid");
    }

    if (errorMessage !== null) {
        return;
    }

    if (editId === null) {
        let newCategory = {
            id: Date.now(),
            category_code: codeValue,
            category_name: titleValue,
            image: "https://example.com/image.jpg",
            status: statusValue,
            created_at: new Date().toISOString()
        };

        categoryList.push(newCategory);
    } else {
        for (let i = 0; i < categoryList.length; i++) {
            if (categoryList[i].id === editId) {
                categoryList[i].category_code = codeValue;
                categoryList[i].category_name = titleValue;
                categoryList[i].status = statusValue;
                break;
            }
        }
    }

    localStorage.setItem("categories", JSON.stringify(categoryList));
    renderCategories();
    categoryModal.hide();
}

categoryForm.onsubmit = saveCategory;

function handleDelete(id) {
    let productList = [];
    if (typeof getProducts === "function") {
        productList = getProducts();
    } else {
        let localData = localStorage.getItem("products");
        if (localData !== null) {
            productList = JSON.parse(localData);
        }
    }

    let hasProduct = false;
    for (let i = 0; i < productList.length; i++) {
        let catIdInProduct;
        if (productList[i].category_id !== undefined) {
            catIdInProduct = productList[i].category_id;
        } else {
            catIdInProduct = productList[i].categoryId;
        }

        if (Number(catIdInProduct) === Number(id)) {
            hasProduct = true;
            break;
        }
    }

    let foundCategory = null;
    for (let i = 0; i < categoryList.length; i++) {
        if (Number(categoryList[i].id) === Number(id)) {
            foundCategory = categoryList[i];
            break;
        }
    }

    if (hasProduct) {
        let warningNameEl = document.querySelector("#warningCategoryName");
        if (warningNameEl !== null && foundCategory !== null) {
            warningNameEl.textContent = foundCategory.category_name;
        }
        warningDeleteModal.show();
    } else {
        deleteCategoryId = id;
        let deleteNameEl = document.querySelector("#deleteCategoryName");
        if (deleteNameEl !== null && foundCategory !== null) {
            deleteNameEl.textContent = foundCategory.category_name;
        }
        deleteConfirmModal.show();
    }
}

let btnConfirmDeleteCategory = document.querySelector("#btnConfirmDeleteCategory");
if (btnConfirmDeleteCategory !== null) {
    btnConfirmDeleteCategory.onclick = function () {
        if (deleteCategoryId !== null) {
            let deleteIndex = -1;
            for (let i = 0; i < categoryList.length; i++) {
                if (Number(categoryList[i].id) === Number(deleteCategoryId)) {
                    deleteIndex = i;
                    break;
                }
            }

            if (deleteIndex !== -1) {
                categoryList.splice(deleteIndex, 1);
                localStorage.setItem("categories", JSON.stringify(categoryList));

                deleteConfirmModal.hide();
                renderCategories();

                successToast.show();
            }
        }
    };
}

function resetValidation() {
    codeError.style.display = "none";
    titleError.style.display = "none";
    categoryCodeInput.classList.remove("is-invalid");
    categoryTitleInput.classList.remove("is-invalid");
}

renderCategories();