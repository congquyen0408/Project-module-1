let defaultUser = {
    id: 1,
    first_name: "Nguyễn Văn",
    last_name: "Nam",
    gender: 0,
    date_of_birth: "20/02/2023",
    address: "Thanh Xuân, Hà Nội",
    avatar: "https://i.pravatar.cc/100?img=12",
    email: "nvnam@gmail.com",
    password: "123456",
    status: true,
    phone_number: "0988787671",
    created_at: "2021-01-01T00:00:00Z"
};

let defaultUsersList = [defaultUser];

if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify(defaultUsersList));
}

let category1 = {
    id: 1,
    category_code: "DM001",
    category_name: "Hoa quả",
    image: "https://example.com/image.jpg",
    status: "ACTIVE",
    created_at: "2021-01-01T00:00:00Z"
};

let category2 = {
    id: 2,
    category_code: "DM002",
    category_name: "Rau củ",
    image: "https://example.com/image.jpg",
    status: "INACTIVE",
    created_at: "2021-01-01T00:00:00Z"
};

let defaultCategoryList = [category1, category2];

if (!localStorage.getItem("categories")) {
    localStorage.setItem("categories", JSON.stringify(defaultCategoryList));
}


let product1 = {
    id: 1,
    product_code: "SP001",
    product_name: "Táo",
    category_id: 1,
    stock: 100,
    price: 20000,
    discount: 0,
    image: "https://example.com/image.jpg",
    status: "ACTIVE",
    description: "Táo nhập khẩu từ Mỹ",
    created_at: "2021-01-01T00:00:00Z"
};

let product2 = {
    id: 2,
    product_code: "SP002",
    product_name: "Cà chua",
    category_id: 2,
    stock: 100,
    price: 20000,
    discount: 0,
    image: "https://example.com/image.jpg",
    status: "ACTIVE",
    description: "Cà chua nhập khẩu từ Hà Lan",
    created_at: "2021-01-01T00:00:00Z"
};

let defaultProductList = [product1, product2];

if (!localStorage.getItem("products")) {
    localStorage.setItem("products", JSON.stringify(defaultProductList));
}


function getUsers() {
    let data = JSON.parse(localStorage.getItem("users"));
    if (data === null) {
        return [];
    } else {
        return data;
    }
}


function getCategories() {
    let data = JSON.parse(localStorage.getItem("categories"));
    if (data === null) {
        return [];
    } else {
        return data;
    }
}


function getProducts() {
    let data = JSON.parse(localStorage.getItem("products"));
    if (data === null) {
        return [];
    } else {
        return data;
    }
}

function getUserLogin() {
    let data = JSON.parse(localStorage.getItem("userLogin"));
    if (data === null) {
        return null;
    } else {
        return data;
    }
}