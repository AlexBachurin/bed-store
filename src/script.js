//data
const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "ok8noypnlu1q",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "DGqfx2s2u2aU5hBfXcnorHKSJG49PAHbWxQWJpDSIqk"
});



//select items
const cartBtn = document.querySelector('.nav__cart'),
    closeCartBtn = document.querySelector('.cart__close'),
    clearCartBtn = document.querySelector('.cart__clearBtn'),
    cartDOM = document.querySelector('.cart'),
    cartOverlay = document.querySelector('.cart-overlay'),
    cartContent = document.querySelector('.cart__content'),
    cartContentWrapper = document.querySelector('.cart__content-wrapper'),
    cartItemsAmount = document.querySelector('.nav__cart-amount'),
    cartTotalPrice = document.querySelector('.cart-total'),
    productsContent = document.querySelector('.products-container'),
    popup = document.querySelector('.popup'),
    popupContent = document.querySelector('.popup__content'),
    category = document.querySelector('.products__category');

// main info for cart
let cart = [];

//placeholder for buttons
let addToCartButtons = [];

//getting products
class Products {
    async getProducts() {
        try {
            let contentful = await client.getEntries({
                content_type: 'comfyHouseStore'
            });

            // const res = await fetch(url);
            // const data = await res.json();
            //destructuring to readable format
            let products = contentful.items;
            products = products.map((item) => {
                const {
                    title,
                    price,
                    category
                } = item.fields;
                const {
                    id
                } = item.sys;
                const image = item.fields.image.fields.file.url;
                //return each item as object in much more readable format
                return {
                    title,
                    price,
                    category,
                    id,
                    image
                }
            })
            return products;

        } catch (error) {
            console.log(error);
        }

    }
}

// display content
class UI {
    // **** CATEGORY ****
    //get categories
    getUniqCategories(products) {
        //get categories
        const category = products.map(item => item.category);
        //get only unique categories
        const uniqCategory = [...new Set(category)];
        return uniqCategory
    }
    //display categories
    displayCategories(products) {
        let result = `<button class="btn products__category-btn" data-category="All"> All </button>`;
        const uniqCategory = this.getUniqCategories(products);
        uniqCategory.forEach(item => {
            result += `<button class="btn products__category-btn" data-category="${item}">
                    ${item}
                </button>
            `
        })
        category.innerHTML = result;
    }
    // category buttons functionality
    categoryBtnsFunctionality() {
        const btns = document.querySelectorAll('.products__category-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target;
                //get clicked element category
                const category = target.dataset.category;
                //get all products from storage
                let products = Storage.getAllProducts();
                //check if category is All, display all products
                if (category === 'All') {
                    this.displayProducts(products);
                    //activate addtocart buttons and popup buttons
                    this.getAddToCartButtons();
                    this.activatePopup();
                    //else display items with clicked category
                } else {
                    products = products.filter(item => item.category === category);
                    this.displayProducts(products);
                    this.getAddToCartButtons();
                    this.activatePopup();
                }
                //give active class to active button
                btns.forEach(btn => {
                    btn.classList.remove('active-category');
                })
                target.classList.add('active-category')
            })
        })

    }
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
                add to cart
            </button>
            <button class="products__item-more" data-id = "${id}">
                <i class="fas fa-lg fa-search-plus"></i>
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
        //add btns to placeholder, transform it into normal array using spread
        addToCartButtons = [...btns]
        addToCartButtons.forEach(btn => {
            //get button id
            const id = btn.getAttribute('data-id');
            //check if item with this id in cart for each button
            let isInCart = this.findItemInCart(id);
            //check if item is already in cart, then disable it
            if (isInCart) {
                //if its in cart change text and disable button
                btn.textContent = "In Cart";
                btn.disabled = true;
                // else add functionality
            }
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


        })
    }
    //find item in cart
    findItemInCart(id) {
        return cart.find(item => item.id === id);
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
        cartTotalPrice.textContent = `${Number(tempTotal).toFixed(2)}$`;
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
        document.body.style.overflow = 'hidden';
    }
    //close cart
    closeCart() {
        cartOverlay.classList.remove('show-cart');
        document.body.style.overflow = '';
    }
    //empty cart placeholder
    emptyCartPlaceholder() {
        const empty = document.createElement('h2');
        empty.innerHTML = `You haven't added any items to cart yet`
        empty.classList.add('cart__empty');
        cartContent.insertAdjacentElement('afterbegin', empty);
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
            this.emptyCartPlaceholder();

        }
        //close cart
        closeCartBtn.addEventListener('click', () => {
            this.closeCart();
        })
        //open cart
        cartBtn.addEventListener('click', () => {
            this.showCart();
        })
        //close cart on outside click
        cartOverlay.addEventListener('click', (e) => {
            if (e.target.classList.contains('cart-overlay')) {
                this.closeCart();
            }
        })
    }

    // **** CART FUNCTIONALITY ****
    cartFunctionality() {
        // **** CLEAR ALL ITEMS ****
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        })
        //use event bubbling
        cartContent.addEventListener('click', (e) => {
            const target = e.target;
            const id = target.dataset.id;
            // **** REMOVE ITEM ****
            if (target.classList.contains('cart__item-remove')) {
                this.removeItem(id);
            }
            //***AMOUNT **** manipulations
            else if (target.classList.contains('cart__item-btn_add')) {

                let cartItem = this.findItemInCart(id);
                let amount = cartItem.amount;
                amount++;
                this.changeAmount(id, amount);
                //show in html
                target.nextElementSibling.textContent = amount;
            } else if (target.classList.contains('cart__item-btn_sub')) {
                //find matching item and get its current amount
                let cartItem = this.findItemInCart(id);
                let amount = cartItem.amount;
                if (amount != 1) {
                    amount--;
                    this.changeAmount(id, amount);
                    //show in html
                    target.previousElementSibling.textContent = amount;
                }
            }
        })
    }
    //change item amount
    changeAmount(id, amount) {
        //find matching item in cart and change its amount
        cart = cart.map(item => {
            if (item.id === id) {
                item.amount = amount;
            }
            return item;
        })
        //save new values
        Storage.saveCart(cart);
        //calculate new price
        this.setCartValues(cart)
    }
    // ***CLEAR ALL***
    clearCart() {
        //clear html content
        cartContent.innerHTML = '';
        cart = [];
        //clear cart in storage
        Storage.saveCart(cart);
        //update values
        this.setCartValues(cart);
        //place placeholder
        this.emptyCartPlaceholder();
        //revert all buttons to initial state
        addToCartButtons.forEach(btn => {
            btn.innerHTML = ` <i class="fas fa-shopping-cart"></i>
            add to cart`;
            btn.disabled = false;
        })
        //close cart
        this.closeCart();
    }

    //remove item
    removeItem(id) {
        //get all cart items but item which id we wanna remove
        cart = cart.filter(item => item.id !== id);
        //update localstorage
        Storage.saveCart(cart);
        //update html in cart
        cartContent.innerHTML = '';
        cart.forEach(item => {
            this.addCartItem(item);
        })
        //update prices
        this.setCartValues(cart);
        //if last element deleted place placeholder and close cart
        if (cart.length === 0) {
            this.emptyCartPlaceholder();
            this.closeCart();
        }
        //remove target button disabled button state
        const button = this.getTargetButton(id);
        if (button) {
            button.disabled = false;
            button.innerHTML = ` <i class="fas fa-shopping-cart"></i>
            add to cart`;
        }
    }

    //get matching button
    getTargetButton(id) {
        //find button by matching data attribute id
        const targetBtn = addToCartButtons.find(item => item.dataset.id === id);
        return targetBtn;
    }


    // **** POPUP VIEW MORE ****
    activatePopup() {
        const btns = document.querySelectorAll('.products__item-more');
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                //get clicked button id
                const target = e.currentTarget;
                const id = target.dataset.id;
                //fill info in popup
                this.fillPopupContent(id);
                //show popup
                this.showPopup();
            })
        })
    }
    //fill popup content with item info
    fillPopupContent(id) {
        //get item by id
        const item = Storage.getProduct(id);
        //filler text , change if item is in cart already
        let text = 'Add to cart';
        //if item with this index is in cart, we change text of button to 'In Cart'
        let inCart = this.findItemInCart(id);
        if (inCart) {
            text = 'In cart';
        }
        popupContent.innerHTML = ` <button class="popup__close">
        <i class="fas fa-2x fa-times"></i>
    </button>
    <div class="popup__img-container">
        <img class="popup__img" src="${item.image}" alt="${item.title}">
    </div>
    <div class="popup__descr">
        <h2 class="popup__title">
            ${item.title}
        </h2>
        <div class="popup__price">${item.price}$</div>
        <div class="popup__color">
            <div class="popup__color-item popup__color-item_1"></div>
            <div class="popup__color-item popup__color-item_2"></div>
        </div>
        <div class="popup__text">
            Cloud bread VHS hell of banjo bicycle rights jianbing umami mumblecore etsy 8-bit pok pok +1 wolf.
            Vexillologist yr dreamcatcher waistcoat, authentic chillwave trust fund. Viral typewriter
            fingerstache pinterest pork belly narwhal. Schlitz venmo everyday carry kitsch pitchfork chillwave
            iPhone taiyaki trust fund hashtag kinfolk microdosing gochujang live-edge
        </div>
        <button class="btn popup__btn" data-id ="${item.id}">
            ${text}
        </button>
    </div>`
    }

    //close popup functionality
    closePopupFunctionality() {
        //close on X
        popupContent.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('popup__close') || target.parentElement.classList.contains('popup__close')) {
                this.closePopup();
            }
        })
        //close on outside click
        popup.addEventListener('click', (e) => {
            if (e.target.classList.contains('popup')) {
                this.closePopup();
            }
        })
    }
    //show popup
    showPopup() {
        popup.classList.add('show-popup');
        document.body.style.overflow = 'hidden';
    }
    //helper to close popup window
    closePopup() {
        popup.classList.remove('show-popup');
        document.body.style.overflow = '';
    }
    //add to cart from popup
    popupAddToCart() {
        popupContent.addEventListener('click', e => {
            const target = e.target;
            if (target.classList.contains('popup__btn')) {
                const id = target.dataset.id;
                //get item by this id
                const item = Storage.getProduct(id);
                //if item is already in cart, we wont add to cart any more items
                let inCart = this.findItemInCart(id);
                if (inCart) {

                } else {
                    const product = {
                        ...item,
                        amount: 1
                    };
                    //clear empty message
                    if (cart.length === 0) {
                        document.querySelector('.cart__empty').remove();
                    }
                    //put into cart
                    cart.push(product);
                    //update local storage
                    Storage.saveCart(cart);
                    //update values
                    this.setCartValues(cart);
                    //add html of item in cart
                    this.addCartItem(product);
                    //close popup
                    this.closePopup();
                    //show cart
                    this.showCart();
                    //change product button state
                    const button = this.getTargetButton(id);
                    button.textContent = 'In Cart';
                    button.disabled = true;
                }

            }
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
    //get all products
    static getAllProducts() {
        let products = JSON.parse(localStorage.getItem('products'))
        return products;
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
            ui.displayCategories(data);
        }
        //once we get products we setting up function for buttons
        //and cart functionality(remove,increase/decrease amount/clear all items)
    ).then(() => {
        ui.getAddToCartButtons();
        ui.cartFunctionality();
        ui.activatePopup();
        ui.closePopupFunctionality();
        ui.popupAddToCart();
        ui.categoryBtnsFunctionality();
    })



})