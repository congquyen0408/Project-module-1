let mod = {
    id: 1,
    email: "admin@gmail.com",
    password: "123",
    status: true,
    isMaster: true,
}

let modList = [
    mod
]

if(!localStorage.getItem("modList")){
    localStorage.setItem("modList",JSON.stringify(modList))
} else {
    modList = JSON.parse(localStorage.getItem("modList"))
}

//Danh mục
let category = {
    id: 1,
    code:"DM001",
    title:"Quần áo",
    status:true,
}

let categoryList = [
    category
]

if(!localStorage.getItem("categoryList")){
    localStorage.setItem("categoryList",JSON.stringify(categoryList))
} else {
    categoryList = JSON.parse(localStorage.getItem("categoryList"))
}

//Sản phẩm
let product = {
    id: 1,
    code: "SP001",
    name: "Iphone 12 Pro",
    price: "12.000.000đ",
    number: 10,
    discount: "0%",
    status: true,
    categoryId:1,
    images: ["https://img1.kakaku.k-img.com/images/smartphone/icv/f_J0000034153.jpg"
    ]
}

let productList = [
    product
]

if(!localStorage.getItem("productList")){
    localStorage.setItem("productList",JSON.stringify(productList))
} else {
    productList = JSON.parse(localStorage.getItem("productList"))
}

function getUserLogin() {
    return JSON.parse(localStorage.getItem("userLogin"))
}