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

let productList = getProducts();
let categoryList = getCategories();

let listProductElement = document.querySelector("#listProduct");
let btnOpenAddModal = document.querySelector("#btnOpenAddModal");
let searchProductInput = document.querySelector("#searchProduct");
let filterCategorySelect = document.querySelector("#filterCategory");
let filterStatusSelect = document.querySelector("#filterStatus");

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
            if (Number(item.category_id) === Number(categoryFilter)) {
                matchCategory = true;
            } else {
                matchCategory = false;
            }
        }

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

        if (matchName && matchCategory && matchStatus) {
            result.push(item);
        }
    }

    if (sortOrder !== null) {
        for (let i = 0; i < result.length - 1; i++) {
            for (let j = i + 1; j < result.length; j++) {
                if (sortOrder === "asc") {
                    if (result[i].product_name.localeCompare(result[j].product_name) > 0) {
                        let temp = result[i];
                        result[i] = result[j];
                        result[j] = temp;
                    }
                } else if (sortOrder === "desc") {
                    if (result[i].product_name.localeCompare(result[j].product_name) < 0) {
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

function renderProducts() {
    let listToRender = getFilteredProducts();
    let htmlContent = "";

    if (listToRender.length === 0) {
        htmlContent = `<tr><td colspan="7" class="text-center text-muted py-4">Không tìm thấy sản phẩm phù hợp</td></tr>`;
    } else {
        for (let i = 0; i < listToRender.length; i++) {
            let item = listToRender[i];

            let discountValue = 0;
            if (item.discount !== undefined && item.discount !== null) {
                discountValue = item.discount;
            }

            let statusBadge = "";
            if (item.status === "ACTIVE") {
                statusBadge = `<span class="badge-active">Đang hoạt động</span>`;
            } else {
                statusBadge = `<span class="badge-inactive">Ngừng hoạt động</span>`;
            }

            htmlContent += `
                <tr>
                    <td>${item.product_code}</td>
                    <td class="fw-medium">${item.product_name}</td>
                    <td>${Number(item.price).toLocaleString('vi-VN')} đ</td>
                    <td>${item.stock}</td>
                    <td>${discountValue}%</td>
                    <td style="text-align: center;">${statusBadge}</td>
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
    searchProductInput.onkeyup = function () {
        renderProducts();
    };
}

if (filterCategorySelect !== null) {
    filterCategorySelect.onchange = function () {
        renderProducts();
    };
}

if (filterStatusSelect !== null) {
    filterStatusSelect.onchange = function () {
        renderProducts();
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

        productForm.productCode.value = foundProduct.product_code;
        productForm.productName.value = foundProduct.product_name;
        productForm.categoryId.value = foundProduct.category_id;
        productForm.stock.value = foundProduct.stock;
        productForm.price.value = foundProduct.price;

        if (productForm.discount) {
            if (foundProduct.discount !== undefined) {
                productForm.discount.value = foundProduct.discount;
            } else {
                productForm.discount.value = 0;
            }
        }

        if (productForm.image) {
            if (foundProduct.image !== undefined) {
                productForm.image.value = foundProduct.image;
            } else {
                productForm.image.value = "";
            }
        }

        if (productForm.description) {
            if (foundProduct.description !== undefined) {
                productForm.description.value = foundProduct.description;
            } else {
                productForm.description.value = "";
            }
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

    let codeValue = formEl.productCode.value.trim();
    let nameValue = formEl.productName.value.trim();
    let categoryValue = formEl.categoryId.value;
    let stockValue = formEl.stock.value;
    let priceValue = formEl.price.value;
    let discountValue = formEl.discount.value;
    let imageValue = formEl.image.value.trim();
    let descValue = formEl.description.value.trim();

    let isCheckedActive = document.querySelector("#statusActive").checked;
    let statusValue;
    if (isCheckedActive) {
        statusValue = "ACTIVE";
    } else {
        statusValue = "INACTIVE";
    }

    let errorMessage = null;

    if (codeValue === "") {
        if (codeError !== null) {
            codeError.style.display = "block";
        }
        formEl.productCode.classList.add("is-invalid");
        errorMessage = "Có lỗi";
    } else {
        if (codeError !== null) {
            codeError.style.display = "none";
        }
        formEl.productCode.classList.remove("is-invalid");
    }

    if (nameValue === "") {
        if (nameError !== null) {
            nameError.style.display = "block";
        }
        formEl.productName.classList.add("is-invalid");
        errorMessage = "Có lỗi";
    } else {
        if (nameError !== null) {
            nameError.style.display = "none";
        }
        formEl.productName.classList.remove("is-invalid");
    }

    if (categoryValue === "") {
        if (categoryError !== null) {
            categoryError.style.display = "block";
        }
        formEl.categoryId.classList.add("is-invalid");
        errorMessage = "Có lỗi";
    } else {
        if (categoryError !== null) {
            categoryError.style.display = "none";
        }
        formEl.categoryId.classList.remove("is-invalid");
    }

    if (imageValue === "") {
        if (imageError !== null) {
            imageError.style.display = "block";
        }
        formEl.image.classList.add("is-invalid");
        errorMessage = "Có lỗi";
    } else {
        if (imageError !== null) {
            imageError.style.display = "none";
        }
        formEl.image.classList.remove("is-invalid");
    }

    if (errorMessage !== null) {
        return;
    }

    if (editId === null) {
        let newProduct = {
            id: Date.now(),
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
        if (Number(productList[i].id) === Number(id)) {
            foundProduct = productList[i];
            break;
        }
    }

    if (foundProduct !== null) {
        deleteId = id;
        let nameEl = document.querySelector("#deleteProductName");
        if (nameEl !== null) {
            nameEl.textContent = foundProduct.product_name;
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