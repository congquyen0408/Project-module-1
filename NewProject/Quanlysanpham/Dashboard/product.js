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
let editId = null;
let sortOrder = null;


function renderCategoryOptions() {
    if (filterCategorySelect !== null) {
        let filterHtml = '<option value="all">Lọc theo danh mục</option>';
        for (let i = 0; i < categoryList.length; i++) {
            filterHtml += '<option value="' + categoryList[i].id + '">' + categoryList[i].category_name + '</option>';
        }
        filterCategorySelect.innerHTML = filterHtml;
    }

    if (categorySelectModal !== null) {
        let modalHtml = '<option value="">-- Chọn danh mục --</option>';
        for (let i = 0; i < categoryList.length; i++) {
            modalHtml += '<option value="' + categoryList[i].id + '">' + categoryList[i].category_name + '</option>';
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
            let itemCatId = item.category_id;
            if (itemCatId === undefined) {
                itemCatId = item.categoryId;
            }
            if (Number(itemCatId) !== Number(categoryFilter)) {
                matchCategory = false;
            }
        }

        let matchStatus = true;
        if (statusFilter === "active") {
            if (item.status !== "ACTIVE") {
                matchStatus = false;
            }
        } else if (statusFilter === "inactive") {
            if (item.status !== "INACTIVE") {
                matchStatus = false;
            }
        }

        if (matchName === true && matchCategory === true && matchStatus === true) {
            result.push(item);
        }
    }

    if (sortOrder !== null) {
        for (let i = 0; i < result.length - 1; i++) {
            for (let j = i + 1; j < result.length; j++) {
                let compareValue = result[i].product_name.localeCompare(result[j].product_name);

                if (sortOrder === "asc" && compareValue > 0) {
                    let temp = result[i];
                    result[i] = result[j];
                    result[j] = temp;
                } else if (sortOrder === "desc" && compareValue < 0) {
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
        htmlContent = '<tr><td colspan="7" class="text-center text-muted py-4">Không tìm thấy sản phẩm phù hợp</td></tr>';
    } else {
        for (let i = 0; i < listToRender.length; i++) {
            let item = listToRender[i];

            let discountValue = 0;
            if (item.discount) {
                discountValue = item.discount;
            }

            let statusBadge = "";
            if (item.status === "ACTIVE") {
                statusBadge = '<span class="badge-active">Đang hoạt động</span>';
            } else {
                statusBadge = '<span class="badge-inactive">Ngừng hoạt động</span>';
            }

            htmlContent += '<tr>' +
                '<td>' + item.product_code + '</td>' +
                '<td class="fw-medium">' + item.product_name + '</td>' +
                '<td>' + Number(item.price).toLocaleString('vi-VN') + ' đ</td>' +
                '<td>' + item.stock + '</td>' +
                '<td>' + discountValue + '%</td>' +
                '<td style="text-align: center;">' + statusBadge + '</td>' +
                '<td style="text-align: center;">' +
                    '<button class="btn-action btn-delete" onclick="handleDelete(' + item.id + ')">' +
                        '<i class="fa-regular fa-trash-can"></i>' +
                    '</button>' +
                    '<button class="btn-action btn-edit" onclick="handleEdit(' + item.id + ')">' +
                        '<i class="fa-regular fa-pen-to-square"></i>' +
                    '</button>' +
                '</td>' +
            '</tr>';
        }
    }

    if (listProductElement !== null) {
        listProductElement.innerHTML = htmlContent;
    }
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


function resetValidation() {
    if (codeError !== null) codeError.style.display = "none";
    if (nameError !== null) nameError.style.display = "none";
    if (categoryError !== null) categoryError.style.display = "none";
    if (imageError !== null) imageError.style.display = "none";

    let codeInput = document.querySelector("#productCode");
    let nameInput = document.querySelector("#productName");
    let catInput = document.querySelector("#categorySelectModal");
    let imgInput = document.querySelector("#image");

    if (codeInput !== null) codeInput.classList.remove("is-invalid");
    if (nameInput !== null) nameInput.classList.remove("is-invalid");
    if (catInput !== null) catInput.classList.remove("is-invalid");
    if (imgInput !== null) imgInput.classList.remove("is-invalid");
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
        if (Number(productList[i].id) === Number(id)) {
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

        let catId = foundProduct.category_id;
        if (catId === undefined) {
            catId = foundProduct.categoryId;
        }
        document.querySelector("#categorySelectModal").value = catId;

        document.querySelector("#stock").value = foundProduct.stock;
        document.querySelector("#price").value = foundProduct.price;

        let discountEl = document.querySelector("#discount");
        if (discountEl !== null) {
            let discVal = 0;
            if (foundProduct.discount) {
                discVal = foundProduct.discount;
            }
            discountEl.value = discVal;
        }

        let imageEl = document.querySelector("#image");
        if (imageEl !== null) {
            let imgVal = "";
            if (foundProduct.image) {
                imgVal = foundProduct.image;
            }
            imageEl.value = imgVal;
        }

        let descEl = document.querySelector("#description");
        if (descEl !== null) {
            let descVal = "";
            if (foundProduct.description) {
                descVal = foundProduct.description;
            }
            descEl.value = descVal;
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

    let codeInput = document.querySelector("#productCode");
    let nameInput = document.querySelector("#productName");
    let categoryInput = document.querySelector("#categorySelectModal");
    let stockInput = document.querySelector("#stock");
    let priceInput = document.querySelector("#price");
    let discountInput = document.querySelector("#discount");
    let imageInput = document.querySelector("#image");
    let descInput = document.querySelector("#description");

    let codeValue = codeInput.value.trim();
    let nameValue = nameInput.value.trim();
    let categoryValue = categoryInput.value;
    let stockValue = Number(stockInput.value);
    let priceValue = Number(priceInput.value);
    let discountValue = Number(discountInput.value);
    let imageValue = imageInput.value.trim();
    let descValue = descInput.value.trim();

    let isCheckedActive = document.querySelector("#statusActive").checked;
    let statusValue = "INACTIVE";
    if (isCheckedActive === true) {
        statusValue = "ACTIVE";
    }

    let isValid = true;

    if (codeValue === "") {
        codeError.style.display = "block";
        codeInput.classList.add("is-invalid");
        isValid = false;
    } else {
        let isCodeDuplicate = false;
        for (let i = 0; i < productList.length; i++) {
            if (productList[i].product_code === codeValue && Number(productList[i].id) !== Number(editId)) {
                isCodeDuplicate = true;
                break;
            }
        }

        if (isCodeDuplicate === true) {
            codeError.textContent = "Mã sản phẩm đã tồn tại";
            codeError.style.display = "block";
            codeInput.classList.add("is-invalid");
            isValid = false;
        } else {
            codeError.style.display = "none";
            codeInput.classList.remove("is-invalid");
        }
    }


    if (nameValue === "") {
        nameError.style.display = "block";
        nameInput.classList.add("is-invalid");
        isValid = false;
    } else {
        nameError.style.display = "none";
        nameInput.classList.remove("is-invalid");
    }


    if (categoryValue === "") {
        categoryError.style.display = "block";
        categoryInput.classList.add("is-invalid");
        isValid = false;
    } else {
        categoryError.style.display = "none";
        categoryInput.classList.remove("is-invalid");
    }


    if (imageValue === "") {
        imageError.style.display = "block";
        imageInput.classList.add("is-invalid");
        isValid = false;
    } else {
        imageError.style.display = "none";
        imageInput.classList.remove("is-invalid");
    }

    if (isValid === false) {
        return;
    }


    if (editId === null) {
        let newId = 1;
        if (productList.length > 0) {
            newId = Number(productList[productList.length - 1].id) + 1;
        }

        let newProduct = {
            id: newId,
            product_code: codeValue,
            product_name: nameValue,
            category_id: Number(categoryValue),
            price: priceValue,
            stock: stockValue,
            discount: discountValue,
            image: imageValue,
            description: descValue,
            status: statusValue,
            created_at: new Date().toISOString()
        };

        productList.push(newProduct);
    } else {
        for (let i = 0; i < productList.length; i++) {
            if (Number(productList[i].id) === Number(editId)) {
                productList[i].product_code = codeValue;
                productList[i].product_name = nameValue;
                productList[i].category_id = Number(categoryValue);
                productList[i].price = priceValue;
                productList[i].stock = stockValue;
                productList[i].discount = discountValue;
                productList[i].image = imageValue;
                productList[i].description = descValue;
                productList[i].status = statusValue;
                break;
            }
        }
    }

    localStorage.setItem("products", JSON.stringify(productList));
    renderProducts();
    productModal.hide();

    let toastMsg = document.querySelector("#toastMessage");
    if (toastMsg !== null) {
        if (editId === null) {
            toastMsg.textContent = "Thêm mới sản phẩm thành công";
        } else {
            toastMsg.textContent = "Cập nhật sản phẩm thành công";
        }
    }
    successToast.show();
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
        let deleteNameEl = document.querySelector("#deleteProductName");
        if (deleteNameEl !== null) {
            deleteNameEl.textContent = foundProduct.product_name;
        }
        deleteConfirmModal.show();
    }
}

let btnConfirmDelete = document.querySelector("#btnConfirmDelete");
if (btnConfirmDelete !== null) {
    btnConfirmDelete.onclick = function () {
        if (deleteId !== null) {
            let deleteIndex = -1;
            for (let i = 0; i < productList.length; i++) {
                if (Number(productList[i].id) === Number(deleteId)) {
                    deleteIndex = i;
                    break;
                }
            }

            if (deleteIndex !== -1) {
                productList.splice(deleteIndex, 1);
                localStorage.setItem("products", JSON.stringify(productList));

                deleteConfirmModal.hide();
                renderProducts();

                let toastMsg = document.querySelector("#toastMessage");
                if (toastMsg !== null) {
                    toastMsg.textContent = "Xóa sản phẩm thành công";
                }
                successToast.show();
            }
        }
    };
}

renderCategoryOptions();
renderProducts();
