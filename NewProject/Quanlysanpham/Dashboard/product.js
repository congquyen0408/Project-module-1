
let currentUser = getUserLogin();

if (currentUser === null) {
    location.href = "../Auth/auth.html";
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

let btnLogout = document.querySelector("#btnLogout");
if (btnLogout !== null) {
    btnLogout.onclick = function () {
        localStorage.removeItem("userLogin");
        location.href = "../Auth/auth.html";
    };
}


let productList = getProducts();
let categoryList = getCategories();

let listProductElement = document.querySelector("#listProduct");
let btnOpenAddModal = document.querySelector("#btnOpenAddModal");
let searchProductInput = document.querySelector("#searchProduct");
let filterCategorySelect = document.querySelector("#filterCategory");
let filterStatusSelect = document.querySelector("#filterStatus"); // Bộ lọc trạng thái

let productModalElement = document.querySelector("#productModal");
let productModal = new bootstrap.Modal(productModalElement);

let modalTitle = document.querySelector("#modalTitle");
let productForm = document.querySelector("#productForm");
let categorySelectModal = document.querySelector("#categorySelectModal");
let btnSave = document.querySelector("#btnSave");


let codeError = document.querySelector("#codeError");
let nameError = document.querySelector("#nameError");
let categoryError = document.querySelector("#categoryError");
let imageError = document.querySelector("#imageError");

let deleteConfirmModalElement = document.querySelector("#deleteConfirmModal");
let deleteConfirmModal = new bootstrap.Modal(deleteConfirmModalElement);

let successToastElement = document.querySelector("#successToast");
let successToast = new bootstrap.Toast(successToastElement, { delay: 3000 });

let deleteId = null;
let btnConfirmDelete = document.querySelector("#btnConfirmDelete");

let editId = null;
let sortOrder = null;


function renderCategoryOptions() {
    if (filterCategorySelect !== null) {
        let filterHtml = `<option value="all">Lọc theo danh mục</option>`;
        for (let i = 0; i < categoryList.length; i++) {
            filterHtml += `<option value="${categoryList[i].id}">${categoryList[i].category_name}</option>`;
        }
        filterCategorySelect.innerHTML = filterHtml;
    }

    if (categorySelectModal !== null) {
        let modalHtml = `<option value="">-- Chọn danh mục --</option>`;
        for (let i = 0; i < categoryList.length; i++) {
            modalHtml += `<option value="${categoryList[i].id}">${categoryList[i].category_name}</option>`;
        }
        categorySelectModal.innerHTML = modalHtml;
    }
}


function getFilteredProducts() {
    let result = [];

    let keyword = "";
    if (searchProductInput !== null) {
        keyword = searchProductInput.value.trim().toLowerCase();
    }

    let categoryFilter = "all";
    if (filterCategorySelect !== null) {
        categoryFilter = filterCategorySelect.value;
    }

    let statusFilter = "all";
    if (filterStatusSelect !== null) {
        statusFilter = filterStatusSelect.value;
    }

    for (let i = 0; i < productList.length; i++) {
        let item = productList[i];

        let matchName = item.product_name.toLowerCase().includes(keyword);

        let matchCategory = true;
        if (categoryFilter !== "all") {
            matchCategory = item.category_id == categoryFilter;
        }

        let matchStatus = true;
        if (statusFilter === "active") {
            matchStatus = item.status === "ACTIVE";
        } else if (statusFilter === "inactive") {
            matchStatus = item.status === "INACTIVE";
        }

        if (matchName && matchCategory && matchStatus) {
            result.push(item);
        }
    }

    if (sortOrder !== null) {
        for (let i = 0; i < result.length - 1; i++) {
            for (let j = i + 1; j < result.length; j++) {
                if (sortOrder === "asc" && result[i].product_name.localeCompare(result[j].product_name) > 0) {
                    let temp = result[i];
                    result[i] = result[j];
                    result[j] = temp;
                } else if (sortOrder === "desc" && result[i].product_name.localeCompare(result[j].product_name) < 0) {
                    let temp = result[i];
                    result[i] = result[j];
                    result[j] = temp;
                }
            }
        }
    }

    return result;
}


function renderProducts() {
    let listToRender = getFilteredProducts();
    let htmlContent = "";

    if (listToRender.length === 0) {
        htmlContent = `<tr><td colspan="7" class="text-center text-muted py-4">Không tìm thấy sản phẩm phù hợp</td></tr>`;
    } else {
        for (let i = 0; i < listToRender.length; i++) {
            let item = listToRender[i];
            let discountValue = item.discount ? item.discount : 0;

            htmlContent += `
                <tr>
                    <td>${item.product_code}</td>
                    <td class="fw-medium">${item.product_name}</td>
                    <td>${Number(item.price).toLocaleString('vi-VN')} đ</td>
                    <td>${item.stock}</td>
                    <td>${discountValue}%</td>
                    <td style="text-align: center;">
                        ${item.status === "ACTIVE"
                    ? `<span class="badge-active">Đang hoạt động</span>`
                    : `<span class="badge-inactive">Ngừng hoạt động</span>`
                }
                    </td>
                    <td style="text-align: center;">
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

    listProductElement.innerHTML = htmlContent;
}


if (searchProductInput !== null) {
    searchProductInput.onkeyup = function (event) {
        renderProducts();
    };
}

if (filterCategorySelect !== null) {
    filterCategorySelect.onchange = function (event) {
        renderProducts();
    };
}

if (filterStatusSelect !== null) {
    filterStatusSelect.onchange = function (event) {
        renderProducts();
    };
}


function handleSortByName() {
    let sortIcon = document.querySelector("#sortNameIcon");
    if (sortOrder === null || sortOrder === "desc") {
        sortOrder = "asc";
        if (sortIcon !== null) sortIcon.className = "fa-solid fa-arrow-up-long ms-1";
    } else {
        sortOrder = "desc";
        if (sortIcon !== null) sortIcon.className = "fa-solid fa-arrow-down-long ms-1";
    }
    renderProducts();
}


btnOpenAddModal.onclick = function () {
    editId = null;
    modalTitle.textContent = "Thêm mới sản phẩm";
    btnSave.textContent = "Thêm";
    productForm.reset();
    resetValidation();
    productModal.show();
};


function handleEdit(id) {
    let foundProduct = null;
    for (let i = 0; i < productList.length; i++) {
        if (productList[i].id === id) {
            foundProduct = productList[i];
            break;
        }
    }

    if (foundProduct !== null) {
        editId = id;
        modalTitle.textContent = "Cập nhật sản phẩm";
        btnSave.textContent = "Lưu";
        resetValidation();

        document.querySelector("#productCode").value = foundProduct.product_code;
        document.querySelector("#productName").value = foundProduct.product_name;
        document.querySelector("#categorySelectModal").value = foundProduct.category_id;
        document.querySelector("#stock").value = foundProduct.stock;
        document.querySelector("#price").value = foundProduct.price;
        if (document.querySelector("#discount")) {
            document.querySelector("#discount").value = foundProduct.discount || 0;
        }
        if (document.querySelector("#image")) {
            document.querySelector("#image").value = foundProduct.image || "";
        }
        if (document.querySelector("#description")) {
            document.querySelector("#description").value = foundProduct.description || "";
        }

        if (foundProduct.status === "ACTIVE") {
            document.querySelector("#statusActive").checked = true;
        } else {
            document.querySelector("#statusInactive").checked = true;
        }

        productModal.show();
    }
}


function saveProduct(event) {
    event.preventDefault();

    let formEl = event.target;

    let codeValue = formEl.productCode ? formEl.productCode.value.trim() : "";
    let nameValue = formEl.productName ? formEl.productName.value.trim() : "";
    let categoryValue = formEl.categoryId ? formEl.categoryId.value : "";
    let stockValue = formEl.stock ? formEl.stock.value : 0;
    let priceValue = formEl.price ? formEl.price.value : 0;
    let discountValue = formEl.discount ? formEl.discount.value : 0;
    let imageValue = formEl.image ? formEl.image.value.trim() : "";
    let descValue = formEl.description ? formEl.description.value.trim() : "";

    let isCheckedActive = document.querySelector("#statusActive").checked;
    let statusValue;
    if (isCheckedActive) {
        statusValue = "ACTIVE";
    } else {
        statusValue = "INACTIVE";
    }


    let errorMessage = null;

    if (codeValue === "") {
        if (codeError !== null) codeError.style.display = "block";
        if (formEl.productCode) formEl.productCode.classList.add("is-invalid");
        errorMessage = "Có lỗi";
    } else {
        if (codeError !== null) codeError.style.display = "none";
        if (formEl.productCode) formEl.productCode.classList.remove("is-invalid");
    }

    if (nameValue === "") {
        if (nameError !== null) nameError.style.display = "block";
        if (formEl.productName) formEl.productName.classList.add("is-invalid");
        errorMessage = "Có lỗi";
    } else {
        if (nameError !== null) nameError.style.display = "none";
        if (formEl.productName) formEl.productName.classList.remove("is-invalid");
    }

    if (categoryValue === "") {
        if (categoryError !== null) categoryError.style.display = "block";
        if (formEl.categoryId) formEl.categoryId.classList.add("is-invalid");
        errorMessage = "Có lỗi";
    } else {
        if (categoryError !== null) categoryError.style.display = "none";
        if (formEl.categoryId) formEl.categoryId.classList.remove("is-invalid");
    }

    if (imageValue === "") {
        if (imageError !== null) imageError.style.display = "block";
        if (formEl.image) formEl.image.classList.add("is-invalid");
        errorMessage = "Có lỗi";
    } else {
        if (imageError !== null) imageError.style.display = "none";
        if (formEl.image) formEl.image.classList.remove("is-invalid");
    }

    if (errorMessage !== null) return;


    if (editId === null) {
        let newId;
        if (productList.length > 0) {
            newId = productList[productList.length - 1].id + 1;
        } else {
            newId = 1;
        }

        let newProduct = {
            id: newId,
            product_code: codeValue,
            product_name: nameValue,
            category_id: Number(categoryValue),
            stock: Number(stockValue),
            price: Number(priceValue),
            discount: Number(discountValue),
            image: imageValue,
            status: statusValue,
            description: descValue,
            created_at: new Date().toISOString()
        };

        productList.push(newProduct);
    } else {
        for (let i = 0; i < productList.length; i++) {
            if (productList[i].id === editId) {
                productList[i].product_code = codeValue;
                productList[i].product_name = nameValue;
                productList[i].category_id = Number(categoryValue);
                productList[i].stock = Number(stockValue);
                productList[i].price = Number(priceValue);
                productList[i].discount = Number(discountValue);
                productList[i].image = imageValue;
                productList[i].status = statusValue;
                productList[i].description = descValue;
                break;
            }
        }
    }

    localStorage.setItem("products", JSON.stringify(productList));
    renderProducts();
    productModal.hide();
}

productForm.onsubmit = saveProduct;


function handleDelete(id) {
    let foundProduct = null;
    for (let i = 0; i < productList.length; i++) {
        if (productList[i].id == id) {
            foundProduct = productList[i];
            break;
        }
    }

    if (foundProduct !== null) {
        deleteId = id;
        
        let nameToShow = foundProduct.product_name || foundProduct.name || "";
        let nameEl = document.querySelector("#deleteProductName");
        if (nameEl !== null) {
            nameEl.textContent = nameToShow;
        }
        deleteConfirmModal.show();
    }
}


if (btnConfirmDelete !== null) {
    btnConfirmDelete.onclick = function () {
        if (deleteId !== null) {
            let deleteIndex = -1;
            for (let i = 0; i < productList.length; i++) {
                if (productList[i].id === deleteId) {
                    deleteIndex = i;
                    break;
                }
            }

            if (deleteIndex !== -1) {
                productList.splice(deleteIndex, 1);
                localStorage.setItem("products", JSON.stringify(productList));

                deleteConfirmModal.hide();
                renderProducts();
                successToast.show();
            }
        }
    };
}

function resetValidation() {
    if (codeError) codeError.style.display = "none";
    if (nameError) nameError.style.display = "none";
    if (categoryError) categoryError.style.display = "none";
    if (imageError) imageError.style.display = "none";

    let inputs = productForm.querySelectorAll(".is-invalid");
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].classList.remove("is-invalid");
    }
}


renderCategoryOptions();
renderProducts();