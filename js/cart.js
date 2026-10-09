const cartListEl = document.getElementById("cart-list");
const totalQuantityEl = document.getElementById("total-quantity");
const totalPriceEl = document.getElementById("total-price");

function getCart() {
  try {
    const data = JSON.parse(localStorage.getItem("cart") || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "USD"
  }).format(price);
}

function renderCart() {
  const cart = getCart();

  if (!cart.length) {
    cartListEl.innerHTML = `
      <div class="empty">
        <h2>Giỏ hàng đang trống</h2>
        <p>Hãy chọn sản phẩm để thêm vào giỏ hàng.</p>
        <a class="btn" href="products.html">Xem sản phẩm</a>
      </div>
    `;
    totalQuantityEl.textContent = "0";
    totalPriceEl.textContent = formatPrice(0);
    return;
  }

  let totalQuantity = 0;
  let totalPrice = 0;

  cartListEl.innerHTML = cart.map(item => {
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const lineTotal = Number(item.price) * quantity;

    totalQuantity += quantity;
    totalPrice += lineTotal;

    return `
      <article class="cart-item">
        <img src="${item.thumbnail}" alt="${item.title}">
        <div class="cart-info">
          <h2>${item.title}</h2>
          <p>Đơn giá: ${formatPrice(item.price)}</p>
          <p>Thành tiền: <strong>${formatPrice(lineTotal)}</strong></p>
        </div>
        <div class="quantity-control">
          <button type="button" data-action="decrease" data-id="${item.id}" ${quantity === 1 ? "disabled" : ""}>−</button>
          <span>${quantity}</span>
          <button type="button" data-action="increase" data-id="${item.id}">+</button>
        </div>
        <button class="btn btn-danger" type="button" data-action="remove" data-id="${item.id}">Xóa</button>
      </article>
    `;
  }).join("");

  totalQuantityEl.textContent = totalQuantity;
  totalPriceEl.textContent = formatPrice(totalPrice);
}

function updateQuantity(id, delta) {
  const cart = getCart();
  const item = cart.find(product => product.id === id);
  if (!item) return;

  item.quantity = Math.max(1, item.quantity + delta);
  saveCart(cart);
  renderCart();
}

function removeItem(id) {
  const cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
  renderCart();
}

cartListEl.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "increase") updateQuantity(id, 1);
  if (action === "decrease") updateQuantity(id, -1);
  if (action === "remove") removeItem(id);
});

renderCart();
