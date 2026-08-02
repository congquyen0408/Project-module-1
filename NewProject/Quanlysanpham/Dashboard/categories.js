if (!getUserLogin()) {
    location.href = "../Auth/auth.html";
}

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


let editId = null;
let sortOrder = null;


function getFilteredCategories() {
    let result = [];
    let keyword = searchCategoryInput ? searchCategoryInput.value.trim().toLowerCase() : "";
    let statusFilter = filterStatusSelect ? filterStatusSelect.value : "all";

    for (let i = 0; i < categoryList.length; i++) {
        let item = categoryList[i];
        
        let matchName = item.title.toLowerCase().includes(keyword);
        let matchStatus = true;

        if (statusFilter === "active") {
            matchStatus = item.status === true;
        } else if (statusFilter === "inactive") {
            matchStatus = item.status === false;
        }

        if (matchName && matchStatus) {
            result.push(item);
        }
    }

    if (sortOrder !== null) {
        for (let i = 0; i < result.length - 1; i++) {
            for (let j = i + 1; j < result.length; j++) {
                if (sortOrder === "asc" && result[i].title.localeCompare(result[j].title) > 0) {
                    let temp = result[i];
                    result[i] = result[j];
                    result[j] = temp;
                } else if (sortOrder === "desc" && result[i].title.localeCompare(result[j].title) < 0) {
                    let temp = result[i];
                    result[i] = result[j];
                    result[j] = temp;
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
            htmlContent += `
                <tr>
                    <td>${item.code}</td>
                    <td class="fw-medium">${item.title}</td>
                    <td class="text-center">
                        ${
                            item.status
                            ? `<span class="badge-active">Đang hoạt động</span>`
                            : `<span class="badge-inactive">Ngừng hoạt động</span>`
                        }
                    </td>
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


if (searchCategoryInput) {
    searchCategoryInput.onkeyup = function () {
        renderCategories();
    };
}

if (filterStatusSelect) {
    filterStatusSelect.onchange = function () {
        renderCategories();
    };
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

        categoryCodeInput.value = foundCategory.code;
        categoryTitleInput.value = foundCategory.title;
        if (foundCategory.status) {
            document.querySelector("#statusActive").checked = true;
        } else {
            document.querySelector("#statusInactive").checked = true;
        }

        categoryModal.show();
    }
}

categoryForm.onsubmit = function (e) {
    e.preventDefault();

    let codeValue = categoryCodeInput.value.trim();
    let titleValue = categoryTitleInput.value.trim();
    let statusValue = document.querySelector('input[name="statusRadio"]:checked').value === "true";

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

    if (errorMessage !== null) return;

    if (editId === null) {
        let newCategory = {
            id: categoryList.length > 0 ? categoryList[categoryList.length - 1].id + 1 : 1,
            code: codeValue,
            title: titleValue,
            status: statusValue
        };
        categoryList.push(newCategory);
    } else {
        for (let i = 0; i < categoryList.length; i++) {
            if (categoryList[i].id === editId) {
                categoryList[i].code = codeValue;
                categoryList[i].title = titleValue;
                categoryList[i].status = statusValue;
                break;
            }
        }
    }

    localStorage.setItem("categoryList", JSON.stringify(categoryList));
    renderCategories();
    categoryModal.hide();
};

function handleDelete(id) {
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) {
        let deleteIndex = -1;
        for (let i = 0; i < categoryList.length; i++) {
            if (categoryList[i].id === id) {
                deleteIndex = i;
                break;
            }
        }

        if (deleteIndex !== -1) {
            categoryList.splice(deleteIndex, 1);
            localStorage.setItem("categoryList", JSON.stringify(categoryList));
            renderCategories();
        }
    }
}

function resetValidation() {
    codeError.style.display = "none";
    titleError.style.display = "none";
    categoryCodeInput.classList.remove("is-invalid");
    categoryTitleInput.classList.remove("is-invalid");
}

renderCategories();