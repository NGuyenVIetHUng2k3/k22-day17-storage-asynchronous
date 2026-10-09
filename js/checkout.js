const STORAGE_KEYS = {
  draft: "checkoutDraft",
  remembered: "checkoutRemembered"
};

const form = document.getElementById("checkout-form");
const fullNameInput = document.getElementById("full-name");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const addressInput = document.getElementById("address");
const rememberInput = document.getElementById("remember");
const messageEl = document.getElementById("checkout-message");
const clearButton = document.getElementById("clear-checkout");

function readJson(storage, key) {
  try {
    return JSON.parse(storage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function getFormData() {
  return {
    fullName: fullNameInput.value,
    phone: phoneInput.value,
    email: emailInput.value,
    address: addressInput.value
  };
}

function saveDraft() {
  sessionStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(getFormData()));
}

function saveRemembered() {
  localStorage.setItem(STORAGE_KEYS.remembered, JSON.stringify({
    fullName: fullNameInput.value,
    phone: phoneInput.value,
    email: emailInput.value
  }));
}

function loadCheckoutData() {
  const draft = readJson(sessionStorage, STORAGE_KEYS.draft);
  const remembered = readJson(localStorage, STORAGE_KEYS.remembered);

  // Bản nháp trong session được ưu tiên hơn dữ liệu đã ghi nhớ.
  const source = draft || remembered;

  if (source) {
    fullNameInput.value = source.fullName || "";
    phoneInput.value = source.phone || "";
    emailInput.value = source.email || "";
    addressInput.value = source.address || draft?.address || "";
  }

  rememberInput.checked = Boolean(remembered);
}

function showMessage(message) {
  messageEl.textContent = message;
  window.clearTimeout(showMessage.timer);
  showMessage.timer = window.setTimeout(() => {
    messageEl.textContent = "";
  }, 3000);
}

[fullNameInput, phoneInput, emailInput, addressInput].forEach(input => {
  input.addEventListener("input", () => {
    saveDraft();

    if (rememberInput.checked) {
      saveRemembered();
    }
  });
});

rememberInput.addEventListener("change", () => {
  if (rememberInput.checked) {
    saveRemembered();
  } else {
    localStorage.removeItem(STORAGE_KEYS.remembered);
  }

  saveDraft();
});

form.addEventListener("submit", event => {
  event.preventDefault();

  saveDraft();

  if (rememberInput.checked) {
    saveRemembered();
  } else {
    localStorage.removeItem(STORAGE_KEYS.remembered);
  }

  showMessage("Đã lưu thông tin Checkout.");
});

clearButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEYS.remembered);
  sessionStorage.removeItem(STORAGE_KEYS.draft);

  form.reset();
  rememberInput.checked = false;
  showMessage("Đã xóa toàn bộ thông tin Checkout.");
});

loadCheckoutData();
