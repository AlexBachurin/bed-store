//select items

const cartBtn = document.querySelector('.nav-cart'),
      closeCartBtn = document.querySelector('.cart__close'),
      clearCartBtn = document.querySelector('.cart__clearBtn'),
      cartDOM = document.querySelector('.cart'),
      cartOverlay = document.querySelector('.cart-overlay'),
      cartContent = document.querySelector('.cart__content'),
      cartItemsAmount = document.querySelector('.nav__cart-amount'),
      cartTotalPrice = document.querySelector('.cart-total'),
      productsContent = document.querySelector('.products-container');

// main info for cart
let cart = [];

//getting products
class Products {
    async getProducts(url) {
        const res = await fetch(url);
        const data = await res.json();
        //destructuring to readable format
        let products = data.items;
        products = products.map((item) => {
            const {title,price} = item.fields;
            const {id} = item.sys;
            const image = item.fields.image.fields.file.url;
            //return each item as object in much more readable format
            return {
                title,
                price,
                id,
                image
            }
        })
        return products;
    }
}

// display content
class UI {
    displayProducts(products) {
        let result = '';
        products.forEach(({title, price, id, image}) => {
            result += `<article class="products__item">
            <div class="products__item-imgContainer">
                <img class="products__item-img" src="${image}" alt="${title}">
            </div>
            <button class="products__item-add" data-id = "${id}">
                <i class="fas fa-shopping-cart"></i>
                add to bag
            </button>
            <h3 class="products__item-title">
                ${title}
            </h3>
            <div class="products__item-price">$${price}</div>
        </article>
            `
        })
        productsContent.innerHTML = result;
    }
}

//local storage
class Storage {

}


window.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();

    //get products
    products.getProducts('products.json').then(
        (data) => ui.displayProducts(data)
    )
})