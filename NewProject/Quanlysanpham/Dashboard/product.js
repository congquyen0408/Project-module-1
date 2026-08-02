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


let listProductElement = document.querySelector("#listProduct");
let btnOpenAddModal = document.querySelector("#btnOpenAddModal");


let productModalElement = document.querySelector("#productModal");
let productModal = new bootstrap.Modal(productModalElement);

let deleteModalElement = document.querySelector("#deleteModal");
let deleteModal = new bootstrap.Modal(deleteModalElement);


let modalTitle = document.querySelector("#modalTitle");
let productForm = document.querySelector("#productForm");
let productCodeInput = document.querySelector("#productCode");
let productNameInput = document.querySelector("#productName");
let productCategorySelect = document.querySelector("#productCategory");
let productNumberInput = document.querySelector("#productNumber");
let productPriceInput = document.querySelector("#productPrice");
let productDiscountInput = document.querySelector("#productDiscount");
let productImageInput = document.querySelector("#productImage");
let productDetailInput = document.querySelector("#productDetail");


let codeError = document.querySelector("#codeError");
let nameError = document.querySelector("#nameError");
let imageError = document.querySelector("#imageError");
let btnSave = document.querySelector("#btnSave");


let deleteProductName = document.querySelector("#deleteProductName");
let btnConfirmDelete = document.querySelector("#btnConfirmDelete");


let toastSuccess = document.querySelector("#toastSuccess");
let toastMessage = document.querySelector("#toastMessage");


let searchProductInput = document.querySelector("#searchProduct");
let filterCategorySelect = document.querySelector("#filterCategory");
let filterStatusSelect = document.querySelector("#filterStatus");


let editId = null;
let deleteId = null;


let currentSortField = null;
let currentSortOrder = null; // 'asc' hoặc 'desc'


function loadCategoryDropdowns() {
    let htmlOptions = "";
    for (let i = 0; i < categoryList.length; i++) {
        htmlOptions += `<option value="${categoryList[i].id}">${categoryList[i].title}</option>`;
    }
    productCategorySelect.innerHTML = htmlOptions;


    if (filterCategorySelect) {
        filterCategorySelect.innerHTML = `<option value="all">Lọc theo danh mục</option>` + htmlOptions;
    }
}


function getFilteredProducts() {
    let result = [];
    let keyword = searchProductInput ? searchProductInput.value.trim().toLowerCase() : "";
    let selectedCat = filterCategorySelect ? filterCategorySelect.value : "all";
    let selectedStatus = filterStatusSelect ? filterStatusSelect.value : "all";

    for (let i = 0; i < productList.length; i++) {
        let item = productList[i];

        let matchName = item.name.toLowerCase().includes(keyword);

        let matchCategory = true;
        if (selectedCat !== "all") {
            matchCategory = item.categoryId === Number(selectedCat);
        }

        let matchStatus = true;
        if (selectedStatus === "active") {
            matchStatus = item.status === true;
        } else if (selectedStatus === "inactive") {
            matchStatus = item.status === false;
        }

        if (matchName && matchCategory && matchStatus) {
            result.push(item);
        }
    }

    if (currentSortField !== null && currentSortOrder !== null) {
        for (let i = 0; i < result.length - 1; i++) {
            for (let j = i + 1; j < result.length; j++) {
                let valA = result[i][currentSortField];
                let valB = result[j][currentSortField];

                if (currentSortField === 'price') {
                    valA = Number(String(valA).replace(/[^0-9]/g, ''));
                    valB = Number(String(valB).replace(/[^0-9]/g, ''));
                }

                let isSwap = false;
                if (currentSortOrder === 'asc') {
                    isSwap = typeof valA === 'string' ? valA.localeCompare(valB) > 0 : valA > valB;
                } else if (currentSortOrder === 'desc') {
                    isSwap = typeof valA === 'string' ? valA.localeCompare(valB) < 0 : valA < valB;
                }

                if (isSwap) {
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

            htmlContent += `
                <tr>
                    <td>${item.code}</td>
                    <td class="fw-medium">${item.name}</td>
                    <td>${item.price}</td>
                    <td>${item.number}</td>
                    <td>${item.discount}</td>
                    <td class="text-center">
                        ${
                            item.status
                            ? `<span class="badge-active">Đang hoạt động</span>`
                            : `<span class="badge-inactive">Ngừng hoạt động</span>`
                        }
                    </td>
                    <td class="text-center">
                        <button class="btn-action btn-delete" onclick="handleOpenDeleteModal(${item.id})">
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

        productCodeInput.value = foundProduct.code;
        productNameInput.value = foundProduct.name;
        productCategorySelect.value = foundProduct.categoryId;
        productNumberInput.value = foundProduct.number;
        productPriceInput.value = foundProduct.price;
        productDiscountInput.value = foundProduct.discount;
        productImageInput.value = (foundProduct.images && foundProduct.images.length > 0) ? foundProduct.images[0] : "";
        productDetailInput.value = foundProduct.detail || "";

        if (foundProduct.status) {
            document.querySelector("#statusActive").checked = true;
        } else {
            document.querySelector("#statusInactive").checked = true;
        }

        productModal.show();
    }
}


productForm.onsubmit = function (e) {
    e.preventDefault();

    let codeValue = productCodeInput.value.trim();
    let nameValue = productNameInput.value.trim();
    let categoryIdValue = Number(productCategorySelect.value);
    let numberValue = Number(productNumberInput.value);
    let priceValue = productPriceInput.value.trim();
    let discountValue = productDiscountInput.value.trim();
    let imageValue = productImageInput.value.trim();
    let detailValue = productDetailInput.value.trim();
    let statusValue = document.querySelector('input[name="statusRadio"]:checked').value === "true";

    let errorMessage = null;

    if (codeValue === "") {
        codeError.style.display = "block";
        productCodeInput.classList.add("is-invalid");
        errorMessage = "Có lỗi";
    } else {
        codeError.style.display = "none";
        productCodeInput.classList.remove("is-invalid");
    }

    if (nameValue === "") {
        nameError.style.display = "block";
        productNameInput.classList.add("is-invalid");
        errorMessage = "Có lỗi";
    } else {
        nameError.style.display = "none";
        productNameInput.classList.remove("is-invalid");
    }

    if (imageValue === "") {
        imageError.style.display = "block";
        productImageInput.classList.add("is-invalid");
        errorMessage = "Có lỗi";
    } else {
        imageError.style.display = "none";
        productImageInput.classList.remove("is-invalid");
    }

    if (errorMessage !== null) return;

    if (editId === null) {

        let newProduct = {
            id: productList.length > 0 ? productList[productList.length - 1].id + 1 : 1,
            code: codeValue,
            name: nameValue,
            price: priceValue || "0đ",
            number: numberValue,
            discount: discountValue || "0%",
            status: statusValue,
            categoryId: categoryIdValue,
            images: [imageValue],
            detail: detailValue
        };

        productList.push(newProduct);
        showToast("Thêm sản phẩm thành công");
    } else {

        for (let i = 0; i < productList.length; i++) {
            if (productList[i].id === editId) {
                productList[i].code = codeValue;
                productList[i].name = nameValue;
                productList[i].price = priceValue;
                productList[i].number = numberValue;
                productList[i].discount = discountValue;
                productList[i].status = statusValue;
                productList[i].categoryId = categoryIdValue;
                productList[i].images = [imageValue];
                productList[i].detail = detailValue;
                break;
            }
        }
        showToast("Cập nhật sản phẩm thành công");
    }

    localStorage.setItem("productList", JSON.stringify(productList));
    renderProducts();
    productModal.hide();
};


function handleOpenDeleteModal(id) {
    let foundProduct = null;

    for (let i = 0; i < productList.length; i++) {
        if (productList[i].id === id) {
            foundProduct = productList[i];
            break;
        }
    }

    if (foundProduct !== null) {
        deleteId = id;
        deleteProductName.textContent = foundProduct.name; // Nạp tên sản phẩm động
        deleteModal.show();
    }
}

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
            localStorage.setItem("productList", JSON.stringify(productList));
            renderProducts();
            deleteModal.hide();
            showToast("Xóa sản phẩm thành công");
        }
    }
};


if (searchProductInput) {
    searchProductInput.onkeyup = function () {
        renderProducts();
    };
}

if (filterCategorySelect) {
    filterCategorySelect.onchange = function () {
        renderProducts();
    };
}

if (filterStatusSelect) {
    filterStatusSelect.onchange = function () {
        renderProducts();
    };
}

function handleSortByProduct(field) {
    let icon = field === 'name' ? document.querySelector("#sortNameIcon") : document.querySelector("#sortPriceIcon");

    if (currentSortField !== field) {
        currentSortField = field;
        currentSortOrder = 'asc';
    } else {
        currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    }

    if (icon) {
        icon.className = currentSortOrder === 'asc' ? "fa-solid fa-arrow-up-long ms-1" : "fa-solid fa-arrow-down-long ms-1";
    }

    renderProducts();
}


function showToast(msg) {
    toastMessage.textContent = msg;
    toastSuccess.classList.remove("d-none");

    setTimeout(function () {
        hideToast();
    }, 3000);
}

function hideToast() {
    toastSuccess.classList.add("d-none");
}

function resetValidation() {
    codeError.style.display = "none";
    nameError.style.display = "none";
    imageError.style.display = "none";
    productCodeInput.classList.remove("is-invalid");
    productNameInput.classList.remove("is-invalid");
    productImageInput.classList.remove("is-invalid");
}

loadCategoryDropdowns();
renderProducts();