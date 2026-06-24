document.addEventListener("DOMContentLoaded", function () {
  const cartButtons = document.querySelectorAll(".add-to-cart");
  const cartItemsBox = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");

  const customRequestForm = document.getElementById("customRequestForm");
  const formMessage = document.getElementById("formMessage");

  const newsletterForm = document.getElementById("newsletterForm");
  const newsletterMessage = document.getElementById("newsletterMessage");

  let cart = JSON.parse(localStorage.getItem("luxebagsCart")) || [];
  let discountPercent = Number(localStorage.getItem("luxebagsDiscount")) || 0;

  function saveCart() {
    localStorage.setItem("luxebagsCart", JSON.stringify(cart));
  }

  function saveDiscount() {
    localStorage.setItem("luxebagsDiscount", String(discountPercent));
  }

  function getCartCount() {
    return cart.reduce(function (total, item) {
      return total + item.quantity;
    }, 0);
  }

  function getCartSubtotal() {
    return cart.reduce(function (total, item) {
      return total + item.price * item.quantity;
    }, 0);
  }

  function getShipping(subtotal) {
    if (subtotal === 0 || subtotal >= 150) {
      return 0;
    }

    return 12;
  }

  function renderAllCarts() {
    renderCart();
    renderCartPage();
    saveCart();
    saveDiscount();
  }

  function renderCart() {
    if (!cartItemsBox || !cartCount || !cartTotal) {
      return;
    }

    cartItemsBox.innerHTML = "";

    if (cart.length === 0) {
      cartItemsBox.innerHTML = `
        <div class="empty-cart text-center py-5">
          <i class="fa-solid fa-bag-shopping mb-3"></i>
          <h6>Your cart is empty</h6>
          <p class="text-muted small">
            Add your favorite leather handbags to cart.
          </p>
        </div>
      `;
    } else {
      cart.forEach(function (item, index) {
        const detailsHtml = item.details
          ? `<small class="cart-item-details">${item.details}</small>`
          : "";

        cartItemsBox.innerHTML += `
          <div class="cart-item">
            <div class="cart-item-icon">
              <i class="fa-solid fa-bag-shopping"></i>
            </div>

            <div class="cart-item-info">
              <div class="d-flex justify-content-between gap-2">
                <h6>${item.name}</h6>
                <button class="remove-cart-item" data-index="${index}">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>

              ${detailsHtml}

              <p>$${item.price.toFixed(2)}</p>

              <div class="cart-qty">
                <button class="qty-minus" data-index="${index}">-</button>
                <strong>${item.quantity}</strong>
                <button class="qty-plus" data-index="${index}">+</button>
              </div>
            </div>
          </div>
        `;
      });
    }

    cartCount.textContent = getCartCount();
    cartTotal.textContent = "$" + getCartSubtotal().toFixed(2);

    attachCartActions();
  }

  function renderCartPage() {
    const cartPageItems = document.getElementById("cartPageItems");
    const cartPageItemCount = document.getElementById("cartPageItemCount");
    const cartPageSubtotal = document.getElementById("cartPageSubtotal");
    const cartPageDiscount = document.getElementById("cartPageDiscount");
    const cartPageShipping = document.getElementById("cartPageShipping");
    const cartPageGrandTotal = document.getElementById("cartPageGrandTotal");
    const checkoutBtn = document.getElementById("checkoutBtn");
    const freeShippingText = document.getElementById("freeShippingText");
    const freeShippingProgress = document.getElementById("freeShippingProgress");
    const couponMessage = document.getElementById("couponMessage");

    if (!cartPageItems) {
      return;
    }

    const subtotal = getCartSubtotal();
    const discountAmount = subtotal * (discountPercent / 100);
    const shipping = getShipping(subtotal);
    const grandTotal = Math.max(0, subtotal - discountAmount + shipping);

    if (cart.length === 0) {
      cartPageItems.innerHTML = `
        <div class="cart-page-empty">
          <i class="fa-solid fa-bag-shopping"></i>
          <h4>Your cart is empty</h4>
          <p>
            Looks like you have not added any leather handbag yet.
          </p>
          <a href="shop.html" class="btn btn-main">
            Start Shopping
          </a>
        </div>
      `;

      discountPercent = 0;
    } else {
      cartPageItems.innerHTML = "";

      cart.forEach(function (item, index) {
        const detailsHtml = item.details
          ? `<p>${item.details}</p>`
          : `<p>Premium leather handbag</p>`;

        cartPageItems.innerHTML += `
          <div class="cart-page-item">
            <div class="cart-page-icon">
              <i class="fa-solid fa-bag-shopping"></i>
            </div>

            <div class="cart-page-info">
              <h5>${item.name}</h5>
              ${detailsHtml}
              <strong class="cart-page-price">
                $${item.price.toFixed(2)} each
              </strong>
            </div>

            <div class="cart-page-controls">
              <div class="cart-qty">
                <button class="qty-minus" data-index="${index}">-</button>
                <strong>${item.quantity}</strong>
                <button class="qty-plus" data-index="${index}">+</button>
              </div>

              <button class="remove-cart-item" data-index="${index}">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        `;
      });
    }

    const updatedSubtotal = getCartSubtotal();
    const updatedDiscountAmount = updatedSubtotal * (discountPercent / 100);
    const updatedShipping = getShipping(updatedSubtotal);
    const updatedGrandTotal = Math.max(
      0,
      updatedSubtotal - updatedDiscountAmount + updatedShipping
    );

    if (cartPageItemCount) {
      cartPageItemCount.textContent = getCartCount();
    }

    if (cartPageSubtotal) {
      cartPageSubtotal.textContent = "$" + updatedSubtotal.toFixed(2);
    }

    if (cartPageDiscount) {
      cartPageDiscount.textContent = "-$" + updatedDiscountAmount.toFixed(2);
    }

    if (cartPageShipping) {
      cartPageShipping.textContent =
        updatedShipping === 0 ? "Free" : "$" + updatedShipping.toFixed(2);
    }

    if (cartPageGrandTotal) {
      cartPageGrandTotal.textContent = "$" + updatedGrandTotal.toFixed(2);
    }

    if (checkoutBtn) {
      if (cart.length === 0) {
        checkoutBtn.classList.add("disabled");
      } else {
        checkoutBtn.classList.remove("disabled");
      }
    }

    if (freeShippingText && freeShippingProgress) {
      const freeLimit = 150;
      const remaining = Math.max(0, freeLimit - updatedSubtotal);
      const progress = Math.min(100, (updatedSubtotal / freeLimit) * 100);

      if (updatedSubtotal === 0) {
        freeShippingText.textContent = "Add $150.00 more for free shipping";
      } else if (remaining > 0) {
        freeShippingText.textContent =
          "Add $" + remaining.toFixed(2) + " more for free shipping";
      } else {
        freeShippingText.textContent = "You unlocked free shipping!";
      }

      freeShippingProgress.style.width = progress + "%";
      freeShippingProgress.setAttribute("aria-valuenow", String(progress));
    }

    if (couponMessage && discountPercent > 0) {
      couponMessage.textContent = discountPercent + "% discount applied.";
      couponMessage.style.color = "#8b5e3c";
    }

    attachCartActions();
  }

  function addToCart(name, price, quantity, details) {
    const productQuantity = quantity || 1;
    const productDetails = details || "";

    const existingItem = cart.find(function (item) {
      return item.name === name && item.details === productDetails;
    });

    if (existingItem) {
      existingItem.quantity += productQuantity;
    } else {
      cart.push({
        name: name,
        price: price,
        quantity: productQuantity,
        details: productDetails
      });
    }

    renderAllCarts();
    showToast(name + " added to cart");
  }

  function attachCartActions() {
    const removeButtons = document.querySelectorAll(".remove-cart-item");
    const plusButtons = document.querySelectorAll(".qty-plus");
    const minusButtons = document.querySelectorAll(".qty-minus");

    removeButtons.forEach(function (button) {
      button.onclick = function () {
        const index = Number(button.dataset.index);
        cart.splice(index, 1);

        if (cart.length === 0) {
          discountPercent = 0;
        }

        renderAllCarts();
        showToast("Item removed from cart");
      };
    });

    plusButtons.forEach(function (button) {
      button.onclick = function () {
        const index = Number(button.dataset.index);
        cart[index].quantity += 1;
        renderAllCarts();
      };
    });

    minusButtons.forEach(function (button) {
      button.onclick = function () {
        const index = Number(button.dataset.index);

        if (cart[index].quantity > 1) {
          cart[index].quantity -= 1;
        } else {
          cart.splice(index, 1);
        }

        if (cart.length === 0) {
          discountPercent = 0;
        }

        renderAllCarts();
      };
    });
  }

  cartButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const productName = button.dataset.name;
      const productPrice = Number(button.dataset.price);

      addToCart(productName, productPrice, 1, "");
    });
  });

  function showToast(message) {
    let toast = document.querySelector(".toast-message");

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast-message";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(function () {
      toast.classList.remove("show");
    }, 2200);
  }

  if (customRequestForm) {
    customRequestForm.addEventListener("submit", function (event) {
      event.preventDefault();

      formMessage.textContent =
        "Thank you! Your custom bag request has been submitted.";
      formMessage.style.color = "#c89b3c";

      customRequestForm.reset();

      showToast("Custom request submitted");
    });
  }

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (event) {
      event.preventDefault();

      newsletterMessage.textContent =
        "Subscribed successfully! Your 10% offer is ready.";
      newsletterMessage.style.color = "#f8f1e7";

      newsletterForm.reset();

      showToast("Newsletter subscribed");
    });
  }

  function initCartPage() {
    const clearCartBtn = document.getElementById("clearCartBtn");
    const applyCouponBtn = document.getElementById("applyCouponBtn");
    const couponInput = document.getElementById("couponInput");
    const couponMessage = document.getElementById("couponMessage");
    const checkoutBtn = document.getElementById("checkoutBtn");

    if (clearCartBtn) {
      clearCartBtn.addEventListener("click", function () {
        cart = [];
        discountPercent = 0;
        renderAllCarts();
        showToast("Cart cleared");
      });
    }

    if (applyCouponBtn && couponInput && couponMessage) {
      applyCouponBtn.addEventListener("click", function () {
        const code = couponInput.value.trim().toUpperCase();

        if (cart.length === 0) {
          couponMessage.textContent = "Add items before applying a coupon.";
          couponMessage.style.color = "#b63434";
          return;
        }

        if (code === "LUXE10") {
          discountPercent = 10;
          couponMessage.textContent = "LUXE10 applied. You saved 10%.";
          couponMessage.style.color = "#8b5e3c";
          showToast("Coupon applied");
        } else if (code === "CUSTOM15") {
          discountPercent = 15;
          couponMessage.textContent = "CUSTOM15 applied. You saved 15%.";
          couponMessage.style.color = "#8b5e3c";
          showToast("Coupon applied");
        } else {
          discountPercent = 0;
          couponMessage.textContent = "Invalid coupon code.";
          couponMessage.style.color = "#b63434";
        }

        renderAllCarts();
      });
    }

    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", function (event) {
        if (cart.length === 0) {
          event.preventDefault();
          showToast("Your cart is empty");
        }
      });
    }
  }

  function initShopFilters() {
    const productsGrid = document.getElementById("productsGrid");
    const productItems = document.querySelectorAll(".shop-product-item");
    const shopSearch = document.getElementById("shopSearch");
    const shopSort = document.getElementById("shopSort");
    const productCount = document.getElementById("productCount");
    const noProducts = document.getElementById("noProducts");
    const resetFilters = document.getElementById("resetFilters");

    const categoryFilters = document.querySelectorAll(".filter-category");
    const colorFilters = document.querySelectorAll(".filter-color");
    const priceFilters = document.querySelectorAll(".filter-price");

    if (!productsGrid || productItems.length === 0) {
      return;
    }

    function getCheckedValues(elements) {
      const values = [];

      elements.forEach(function (element) {
        if (element.checked) {
          values.push(element.value);
        }
      });

      return values;
    }

    function getSelectedPriceRange() {
      let selected = "all";

      priceFilters.forEach(function (radio) {
        if (radio.checked) {
          selected = radio.value;
        }
      });

      return selected;
    }

    function matchPrice(price, range) {
      if (range === "all") {
        return true;
      }

      const parts = range.split("-");
      const min = Number(parts[0]);
      const max = Number(parts[1]);

      return price >= min && price <= max;
    }

    function filterProducts() {
      const searchValue = shopSearch ? shopSearch.value.toLowerCase().trim() : "";
      const selectedCategories = getCheckedValues(categoryFilters);
      const selectedColors = getCheckedValues(colorFilters);
      const selectedPrice = getSelectedPriceRange();

      let visibleCount = 0;

      productItems.forEach(function (item) {
        const name = item.dataset.name.toLowerCase();
        const category = item.dataset.category;
        const color = item.dataset.color;
        const price = Number(item.dataset.price);

        const matchesSearch =
          name.includes(searchValue) ||
          category.includes(searchValue) ||
          color.includes(searchValue);

        const matchesCategory =
          selectedCategories.length === 0 ||
          selectedCategories.includes(category);

        const matchesColor =
          selectedColors.length === 0 ||
          selectedColors.includes(color);

        const matchesPrice = matchPrice(price, selectedPrice);

        if (matchesSearch && matchesCategory && matchesColor && matchesPrice) {
          item.classList.remove("d-none");
          visibleCount += 1;
        } else {
          item.classList.add("d-none");
        }
      });

      if (productCount) {
        productCount.textContent = visibleCount;
      }

      if (noProducts) {
        if (visibleCount === 0) {
          noProducts.classList.remove("d-none");
        } else {
          noProducts.classList.add("d-none");
        }
      }
    }

    function sortProducts() {
      if (!shopSort) {
        return;
      }

      const sortValue = shopSort.value;
      const itemsArray = Array.from(productItems);

      itemsArray.sort(function (a, b) {
        const priceA = Number(a.dataset.price);
        const priceB = Number(b.dataset.price);
        const nameA = a.dataset.name.toLowerCase();
        const nameB = b.dataset.name.toLowerCase();

        if (sortValue === "price-low") {
          return priceA - priceB;
        }

        if (sortValue === "price-high") {
          return priceB - priceA;
        }

        if (sortValue === "name-az") {
          return nameA.localeCompare(nameB);
        }

        if (sortValue === "name-za") {
          return nameB.localeCompare(nameA);
        }

        return 0;
      });

      itemsArray.forEach(function (item) {
        productsGrid.appendChild(item);
      });

      filterProducts();
    }

    if (shopSearch) {
      shopSearch.addEventListener("input", filterProducts);
    }

    categoryFilters.forEach(function (filter) {
      filter.addEventListener("change", filterProducts);
    });

    colorFilters.forEach(function (filter) {
      filter.addEventListener("change", filterProducts);
    });

    priceFilters.forEach(function (filter) {
      filter.addEventListener("change", filterProducts);
    });

    if (shopSort) {
      shopSort.addEventListener("change", sortProducts);
    }

    if (resetFilters) {
      resetFilters.addEventListener("click", function () {
        if (shopSearch) {
          shopSearch.value = "";
        }

        categoryFilters.forEach(function (filter) {
          filter.checked = false;
        });

        colorFilters.forEach(function (filter) {
          filter.checked = false;
        });

        priceFilters.forEach(function (filter) {
          filter.checked = filter.value === "all";
        });

        if (shopSort) {
          shopSort.value = "default";
        }

        sortProducts();
        filterProducts();
      });
    }

    filterProducts();
  }

  function initProductPage() {
    const mainProductImage = document.getElementById("mainProductImage");
    const productThumbs = document.querySelectorAll(".product-thumb");

    const colorButtons = document.querySelectorAll(".product-color-option");
    const quantityInput = document.getElementById("productQuantity");
    const qtyMinus = document.getElementById("productQtyMinus");
    const qtyPlus = document.getElementById("productQtyPlus");

    const hardwareFinish = document.getElementById("hardwareFinish");
    const strapStyle = document.getElementById("strapStyle");
    const productInitials = document.getElementById("customInitials");

    const productAddToCart = document.getElementById("productAddToCart");
    const productBuyNow = document.getElementById("productBuyNow");

    if (mainProductImage && productThumbs.length > 0) {
      productThumbs.forEach(function (thumb) {
        thumb.addEventListener("click", function () {
          productThumbs.forEach(function (item) {
            item.classList.remove("active");
          });

          thumb.classList.add("active");
          mainProductImage.src = thumb.dataset.image;
        });
      });
    }

    colorButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        colorButtons.forEach(function (item) {
          item.classList.remove("active");
        });

        button.classList.add("active");
      });
    });

    if (qtyMinus && quantityInput) {
      qtyMinus.addEventListener("click", function () {
        let quantity = Number(quantityInput.value);

        if (quantity > 1) {
          quantity -= 1;
          quantityInput.value = quantity;
        }
      });
    }

    if (qtyPlus && quantityInput) {
      qtyPlus.addEventListener("click", function () {
        let quantity = Number(quantityInput.value);

        if (quantity < 10) {
          quantity += 1;
          quantityInput.value = quantity;
        }
      });
    }

    function getProductDetails() {
      const activeColor = document.querySelector(".product-color-option.active");
      const color = activeColor ? activeColor.dataset.color : "Classic Brown";
      const hardware = hardwareFinish ? hardwareFinish.value : "Gold";
      const strap = strapStyle ? strapStyle.value : "Short Handle";
      const initials = productInitials && productInitials.value.trim()
        ? productInitials.value.trim()
        : "No initials";

      return `Color: ${color} | Hardware: ${hardware} | Strap: ${strap} | Initials: ${initials}`;
    }

    function addDetailProductToCart(button, redirectToCheckout) {
      const name = button.dataset.name;
      const price = Number(button.dataset.price);
      const quantity = quantityInput ? Number(quantityInput.value) : 1;
      const details = getProductDetails();

      addToCart(name, price, quantity, details);

      if (redirectToCheckout) {
        window.location.href = "checkout.html";
      }
    }

    if (productAddToCart) {
      productAddToCart.addEventListener("click", function () {
        addDetailProductToCart(productAddToCart, false);
      });
    }

    if (productBuyNow) {
      productBuyNow.addEventListener("click", function () {
        addDetailProductToCart(productBuyNow, true);
      });
    }
  }

  function initCustomizePage() {
    const customizeForm = document.getElementById("customizeForm");

    if (!customizeForm) {
      return;
    }

    const bagStyle = document.getElementById("customBagStyle");
    const bagSize = document.getElementById("customBagSize");
    const hardware = document.getElementById("customHardware");
    const strap = document.getElementById("customStrap");
    const initials = document.getElementById("customInitials");
    const instructions = document.getElementById("customInstructions");

    const quantityInput = document.getElementById("customQuantity");
    const qtyMinus = document.getElementById("customQtyMinus");
    const qtyPlus = document.getElementById("customQtyPlus");

    const swatches = document.querySelectorAll(".custom-swatch");

    const previewBag = document.getElementById("customBagPreview");
    const previewInitials = document.getElementById("previewInitials");
    const previewBagStyle = document.getElementById("previewBagStyle");
    const previewColor = document.getElementById("previewColor");
    const previewSize = document.getElementById("previewSize");
    const previewHardware = document.getElementById("previewHardware");
    const previewStrap = document.getElementById("previewStrap");
    const previewName = document.getElementById("previewName");
    const previewQuantity = document.getElementById("previewQuantity");
    const previewTotal = document.getElementById("previewTotal");
    const customEstimatedTotal = document.getElementById("customEstimatedTotal");

    const addCustomBagToCart = document.getElementById("addCustomBagToCart");
    const customizeFormMessage = document.getElementById("customizeFormMessage");

    function getSelectedOptionPrice(selectElement) {
      const selectedOption = selectElement.options[selectElement.selectedIndex];
      return Number(selectedOption.dataset.price) || 0;
    }

    function getActiveColor() {
      const activeSwatch = document.querySelector(".custom-swatch.active");

      return {
        name: activeSwatch ? activeSwatch.dataset.color : "Classic Brown",
        className: activeSwatch ? activeSwatch.dataset.class : "brown"
      };
    }

    function getInitialsValue() {
      if (initials.value.trim()) {
        return initials.value.trim();
      }

      return "No initials";
    }

    function calculateCustomTotal() {
      const stylePrice = getSelectedOptionPrice(bagStyle);
      const sizePrice = getSelectedOptionPrice(bagSize);
      const hardwarePrice = getSelectedOptionPrice(hardware);
      const strapPrice = getSelectedOptionPrice(strap);
      const initialsPrice = initials.value.trim() ? 10 : 0;
      const quantity = Number(quantityInput.value);

      return (stylePrice + sizePrice + hardwarePrice + strapPrice + initialsPrice) * quantity;
    }

    function updateCustomizePreview() {
      const activeColor = getActiveColor();
      const total = calculateCustomTotal();
      const initialsText = initials.value.trim()
        ? initials.value.trim().slice(0, 3).toUpperCase()
        : "LB";

      previewBag.className = "custom-bag-preview " + activeColor.className;
      previewInitials.textContent = initialsText;

      previewBagStyle.textContent = bagStyle.value;
      previewColor.textContent = activeColor.name;
      previewSize.textContent = bagSize.value;
      previewHardware.textContent = hardware.value;
      previewStrap.textContent = strap.value;
      previewName.textContent = getInitialsValue();
      previewQuantity.textContent = quantityInput.value;

      previewTotal.textContent = "$" + total.toFixed(2);
      customEstimatedTotal.textContent = "$" + total.toFixed(2);
    }

    swatches.forEach(function (swatch) {
      swatch.addEventListener("click", function () {
        swatches.forEach(function (item) {
          item.classList.remove("active");
        });

        swatch.classList.add("active");
        updateCustomizePreview();
      });
    });

    const priceFields = document.querySelectorAll(".custom-price-field");

    priceFields.forEach(function (field) {
      field.addEventListener("change", updateCustomizePreview);
    });

    initials.addEventListener("input", updateCustomizePreview);

    qtyMinus.addEventListener("click", function () {
      let quantity = Number(quantityInput.value);

      if (quantity > 1) {
        quantity -= 1;
        quantityInput.value = quantity;
        updateCustomizePreview();
      }
    });

    qtyPlus.addEventListener("click", function () {
      let quantity = Number(quantityInput.value);

      if (quantity < 10) {
        quantity += 1;
        quantityInput.value = quantity;
        updateCustomizePreview();
      }
    });

    function getCustomBagDetails() {
      const activeColor = getActiveColor();
      const specialInstructions = instructions.value.trim()
        ? instructions.value.trim()
        : "No special instructions";

      return `Style: ${bagStyle.value} | Color: ${activeColor.name} | Size: ${bagSize.value} | Hardware: ${hardware.value} | Strap: ${strap.value} | Initials: ${getInitialsValue()} | Notes: ${specialInstructions}`;
    }

    if (addCustomBagToCart) {
      addCustomBagToCart.addEventListener("click", function () {
        const total = calculateCustomTotal();
        const quantity = Number(quantityInput.value);
        const unitPrice = total / quantity;

        addToCart("Custom " + bagStyle.value, unitPrice, quantity, getCustomBagDetails());
      });
    }

    customizeForm.addEventListener("submit", function (event) {
      event.preventDefault();

      customizeFormMessage.textContent =
        "Thank you! Your custom bag request has been submitted.";
      customizeFormMessage.style.color = "#c89b3c";

      showToast("Custom request submitted");
    });

    updateCustomizePreview();
  }

  initShopFilters();
  initProductPage();
  initCustomizePage();
  initCartPage();
  renderAllCarts();
});

document.addEventListener("DOMContentLoaded", function () {
  const checkoutForm = document.getElementById("checkoutForm");

  if (!checkoutForm) {
    return;
  }

  const checkoutItems = document.getElementById("checkoutItems");
  const checkoutSubtotal = document.getElementById("checkoutSubtotal");
  const checkoutDiscount = document.getElementById("checkoutDiscount");
  const checkoutShipping = document.getElementById("checkoutShipping");
  const checkoutGrandTotal = document.getElementById("checkoutGrandTotal");
  const placeOrderBtn = document.getElementById("placeOrderBtn");
  const checkoutMessage = document.getElementById("checkoutMessage");
  const paymentMethods = document.querySelectorAll(".payment-method");
  const paymentHelp = document.getElementById("paymentHelp");

  let checkoutCart = JSON.parse(localStorage.getItem("luxebagsCart")) || [];
  let checkoutDiscountPercent =
    Number(localStorage.getItem("luxebagsDiscount")) || 0;

  function getCheckoutSubtotal() {
    return checkoutCart.reduce(function (total, item) {
      return total + item.price * item.quantity;
    }, 0);
  }

  function getCheckoutShipping(subtotal) {
    if (subtotal === 0 || subtotal >= 150) {
      return 0;
    }

    return 12;
  }

  function updateHeaderCartAfterOrder() {
    const cartCount = document.getElementById("cartCount");
    const cartTotal = document.getElementById("cartTotal");
    const cartItems = document.getElementById("cartItems");

    if (cartCount) {
      cartCount.textContent = "0";
    }

    if (cartTotal) {
      cartTotal.textContent = "$0.00";
    }

    if (cartItems) {
      cartItems.innerHTML = `
        <div class="empty-cart text-center py-5">
          <i class="fa-solid fa-bag-shopping mb-3"></i>
          <h6>Your cart is empty</h6>
          <p class="text-muted small">
            Add your favorite leather handbags to cart.
          </p>
        </div>
      `;
    }
  }

  function renderCheckoutSummary() {
    const subtotal = getCheckoutSubtotal();
    const discountAmount = subtotal * (checkoutDiscountPercent / 100);
    const shipping = getCheckoutShipping(subtotal);
    const grandTotal = Math.max(0, subtotal - discountAmount + shipping);

    if (checkoutCart.length === 0) {
      checkoutItems.innerHTML = `
        <div class="checkout-empty">
          <i class="fa-solid fa-bag-shopping"></i>
          <h5>Your cart is empty</h5>
          <p class="text-muted mb-3">
            Add a handbag before checkout.
          </p>
          <a href="shop.html" class="btn btn-main">
            Shop Now
          </a>
        </div>
      `;

      placeOrderBtn.classList.add("disabled");
      placeOrderBtn.disabled = true;
    } else {
      checkoutItems.innerHTML = "";

      checkoutCart.forEach(function (item) {
        const details = item.details
          ? item.details
          : "Premium leather handbag";

        checkoutItems.innerHTML += `
          <div class="checkout-item">
            <div class="checkout-item-icon">
              <i class="fa-solid fa-bag-shopping"></i>
            </div>

            <div>
              <h6>${item.name}</h6>
              <p>${details}</p>
              <strong>
                ${item.quantity} × $${item.price.toFixed(2)}
              </strong>
            </div>
          </div>
        `;
      });

      placeOrderBtn.classList.remove("disabled");
      placeOrderBtn.disabled = false;
    }

    checkoutSubtotal.textContent = "$" + subtotal.toFixed(2);
    checkoutDiscount.textContent = "-$" + discountAmount.toFixed(2);
    checkoutShipping.textContent =
      shipping === 0 ? "Free" : "$" + shipping.toFixed(2);
    checkoutGrandTotal.textContent = "$" + grandTotal.toFixed(2);
  }

  paymentMethods.forEach(function (method) {
    method.addEventListener("click", function () {
      paymentMethods.forEach(function (item) {
        item.classList.remove("active");
      });

      method.classList.add("active");

      const selectedInput = method.querySelector("input");
      const selectedValue = selectedInput.value;

      if (selectedValue === "Cash on Delivery") {
        paymentHelp.innerHTML =
          '<i class="fa-solid fa-circle-info"></i> You will pay when your order is delivered.';
      }

      if (selectedValue === "Bank Transfer") {
        paymentHelp.innerHTML =
          '<i class="fa-solid fa-circle-info"></i> Our team will send bank transfer details after order confirmation.';
      }

      if (selectedValue === "Card Payment") {
        paymentHelp.innerHTML =
          '<i class="fa-solid fa-circle-info"></i> Card payment gateway can be connected later with Stripe or another provider.';
      }

      if (selectedValue === "PayPal") {
        paymentHelp.innerHTML =
          '<i class="fa-solid fa-circle-info"></i> PayPal checkout can be connected when your business account is ready.';
      }
    });
  });

  checkoutForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (checkoutCart.length === 0) {
      checkoutMessage.textContent = "Your cart is empty. Please add items first.";
      checkoutMessage.style.color = "#b63434";
      return;
    }

    const selectedPayment = document.querySelector(
      'input[name="paymentMethod"]:checked'
    );

    const orderNumber = "LB-" + Date.now().toString().slice(-7);
    const customerName = document.getElementById("checkoutName").value;

    checkoutMessage.innerHTML = `
      <div class="checkout-success-box">
        <i class="fa-solid fa-circle-check"></i>
        <strong>Order placed successfully!</strong><br>
        Thank you, ${customerName}. Your order number is ${orderNumber}.
        Payment Method: ${selectedPayment.value}.
      </div>
    `;

    checkoutMessage.style.color = "#8b5e3c";

    localStorage.removeItem("luxebagsCart");
    localStorage.removeItem("luxebagsDiscount");

    checkoutCart = [];
    checkoutDiscountPercent = 0;

    checkoutForm.reset();
    updateHeaderCartAfterOrder();
    renderCheckoutSummary();
  });

  renderCheckoutSummary();
});

document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contactForm");
  const contactMessage = document.getElementById("contactMessage");

  if (!contactForm) {
    return;
  }

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const contactName = document.getElementById("contactName").value.trim();
    const contactSubject = document.getElementById("contactSubject").value;

    contactMessage.textContent =
      "Thank you, " + contactName + "! Your message about " + contactSubject + " has been received.";
    contactMessage.style.color = "#8b5e3c";

    contactForm.reset();

    let toast = document.querySelector(".toast-message");

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast-message";
      document.body.appendChild(toast);
    }

    toast.textContent = "Contact message submitted";
    toast.classList.add("show");

    setTimeout(function () {
      toast.classList.remove("show");
    }, 2200);
  });
});