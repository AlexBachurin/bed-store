//select items

const cartBtn = document.querySelector('.nav__cart'),
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
            const {
                title,
                price
            } = item.fields;
            const {
                id
            } = item.sys;
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
    //display products
    displayProducts(products) {
        let result = '';
        products.forEach(({
            title,
            price,
            id,
            image
        }) => {
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
    //add to cart buttons
    getAddToCartButtons() {
        const btns = document.querySelectorAll('.products__item-add');
        btns.forEach(btn => {
            //get button id
            const id = btn.getAttribute('data-id');
            //check if item with this id in cart for each button
            let isInCart = cart.find(item => item.id === id);
            if (isInCart) {
                //if its in cart change text and disable button
                btn.textContent = "In Cart";
                btn.disabled = true;
                // else add functionality
            } else {
                btn.addEventListener('click', (e) => {
                    const target = e.currentTarget;
                    target.textContent = "In Cart";
                    target.disabled = true;
                    //get product from local storage             
                    let product = Storage.getProduct(id);
                    //use spread to setup new cartItem
                    let cartItem = {
                        ...product,
                        amount: 1
                    }
                    //clear empty message
                    if (cart.length === 0) {
                        document.querySelector('.cart__empty').remove();
                    }
                    
                    //add product to the cart
                    cart.push(cartItem);
                    //save cart in local storage
                    Storage.saveCart(cart);
                    //set cart items amount
                    this.setCartValues(cart);
                    //display cart item
                    this.addCartItem(cartItem);
                    //show cart
                    this.showCart();
                })
            }

        })
    }
    //set values
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        //amount of items in cart on nav
        cartItemsAmount.textContent = Number(itemsTotal);
        //total price of all items in cart
        cartTotalPrice.textContent = Number(tempTotal).toFixed(2);
    }
    //add item to cart html
    addCartItem(item) {
        let cartItem = document.createElement('div');
        cartItem.innerHTML = `
        <div class="cart__item-content">
            <div class="cart__item-imgContainer">
                <img class="cart__item-img" src="${item.image}" alt="${item.title}">
                
            </div>
            <div class="cart__item-descr">
                <h4 class="cart__item-title">${item.title}</h4>
                <div class="cart__item-price">$${item.price}</div>
                <button class="cart__item-remove" data-id=${item.id}>remove</button>
            </div>
        </div>
        <div class="cart__item-counter">
            <i class="cart__item-btn cart__item-btn_add fas fa-chevron-up" data-id=${item.id}></i>
            <span class="cart__item-amount">${item.amount}</span>
            <i class="cart__item-btn cart__item-btn_sub fas fa-chevron-down" data-id=${item.id}></i>
        </div>`
        cartItem.classList.add('cart__item');
        cartContent.insertAdjacentElement("afterbegin", cartItem)
    }
    //show cart
    showCart() {
        cartOverlay.classList.add('show-cart');
    }
    //Setup APP
    setupApp() {
        //check cart
        cart = Storage.getCartItems();
        //if we have items in cart storage
        //place html inside cart + set values
        if (cart.length > 0) {
            cart.forEach(item => {
                this.addCartItem(item);
            })
            this.setCartValues(cart);
        } else {
            //empty cart placeholder
            const empty  = document.createElement('h2');
            empty.innerHTML = `You haven't added any items to cart yet`
            empty.classList.add('cart__empty');
            cartContent.insertAdjacentElement('afterbegin', empty)
        }
        //close cart
        closeCartBtn.addEventListener('click', () => {
            cartOverlay.classList.remove('show-cart');
        })
        //open cart
        cartBtn.addEventListener('click', () => {
            this.showCart();
        })
    }
}

//local storage
class Storage {
    //static method, we can use without instantiating class exemplar
    static saveProducts(products) {
        //dont forget to json stringify
        localStorage.setItem('products', JSON.stringify(products));
    }
    //get product based on its id
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'))
        let product = products.find(item => item.id === id);
        return product;
    }
    //save items to cart
    static saveCart(cartArr) {
        localStorage.setItem('cart', JSON.stringify(cartArr));
    }
    // get items from cart
    static getCartItems() {
        let cartItems = JSON.parse(localStorage.getItem('cart')) ? JSON.parse(localStorage.getItem('cart')) : [];
        return cartItems;
    }
}


window.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();
    //setup page 
    ui.setupApp();

    //get products
    products.getProducts('products.json').then(
        (data) => {
            ui.displayProducts(data);
            Storage.saveProducts(data);
        }
        //once we get products we setting up function for buttons
    ).then(() => {
        ui.getAddToCartButtons();
    })



})