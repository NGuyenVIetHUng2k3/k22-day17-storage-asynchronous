const API_URL = "https://dummyjson.com/products";

const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const productsEl = document.getElementById("products");
const modal = document.getElementById("product-modal");
const detailEl = document.getElementById("product-detail");
const detailLoadingEl = document.getElementById("detail-loading");

let products = [];
let isLoading = false;

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "USD"
  }).format(price);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showLoading() {
  loadingEl.classList.remove("hidden");
  errorEl.classList.add("hidden");
  productsEl.innerHTML = "";
}

function hideLoading() {
  loadingEl.classList.add("hidden");
}

function showError(message) {
  hideLoading();
  errorEl.innerHTML = `
    <p>${escapeHtml(message)}</p>
    <button class="btn" id="retry-btn" type="button">Thử lại</button>
  `;
  errorEl.classList.remove("hidden");
  document.getElementById("retry-btn").addEventListener("click", loadProducts);
}

function renderProducts() {
  if (!products.length) {
    productsEl.innerHTML = '<div class="empty">Không có sản phẩm nào.</div>';
    return;
  }

  productsEl.innerHTML = products.map(product => `
    <article class="product-card" data-id="${product.id}" tabindex="0">
      <img src="${escapeHtml(product.thumbnail)}" alt="${escapeHtml(product.title)}">
      <div class="product-body">
        <span class="category">${escapeHtml(product.category)}</span>
        <h2>${escapeHtml(product.title)}</h2>
        <p class="price">${formatPrice(product.price)}</p>
        <div class="product-meta">
          <span>⭐ ${product.rating}</span>
          <span>Tồn: ${product.stock}</span>
        </div>
        <button class="btn full add-cart" type="button" data-id="${product.id}">Thêm vào giỏ hàng</button>
      </div>
    </article>
  `).join("");

  productsEl.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", (event) => {
      if (event.target.closest(".add-cart")) return;
      openProductDetail(Number(card.dataset.id));
    });
  });

  productsEl.querySelectorAll(".add-cart").forEach(button => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      addToCart(Number(button.dataset.id));
    });
  });
}

function addToCart(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      quantity: 1
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`Đã thêm "${product.title}" vào giỏ hàng.`);
}

async function loadProducts() {
  if (isLoading) return;

  isLoading = true;
  showLoading();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    products = Array.isArray(data.products) ? data.products : [];

    hideLoading();
    renderProducts();
  } catch (error) {
    console.error(error);
    showError("Không thể tải danh sách sản phẩm. Vui lòng kiểm tra kết nối mạng và thử lại.");
  } finally {
    isLoading = false;
  }
}

async function openProductDetail(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  detailLoadingEl.classList.add("hidden");

  detailEl.innerHTML = `
    <div class="detail-grid">
      <img src="${escapeHtml(product.thumbnail)}" alt="${escapeHtml(product.title)}">
      <div>
        <span class="category">${escapeHtml(product.category)}</span>
        <h2 id="modal-title">${escapeHtml(product.title)}</h2>
        <p>${escapeHtml(product.description)}</p>
        <p class="price">${formatPrice(product.price)}</p>
        <p><strong>Mã:</strong> ${product.id}</p>
        <p><strong>Đánh giá:</strong> ⭐ ${product.rating}</p>
        <p><strong>Tồn kho:</strong> ${product.stock}</p>
      </div>
    </div>
  `;
}

function closeModal() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

document.querySelectorAll("[data-close-modal]").forEach(element => {
  element.addEventListener("click", closeModal);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

loadProducts();
