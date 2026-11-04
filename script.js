const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const bagButton = document.querySelector(".bag-button");
const bagCount = document.querySelector(".bag-count");
const cartDialog = document.querySelector(".cart-dialog");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total strong");
const checkoutButton = document.querySelector(".checkout-button");
const copyButton = document.querySelector(".copy-order");

const ORDER_EMAIL = "shehuusmanumar176@gmail.com";
const CART_KEY = "sabeer-bag-v1";

const cart = new Map();

function formatMoney(amount) {
  return `$${amount}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return;

    const saved = JSON.parse(raw);
    if (!Array.isArray(saved)) return;

    saved.forEach((entry) => {
      const name = entry && entry.name;
      const price = Number(entry && entry.price);
      const quantity = Math.floor(Number(entry && entry.quantity));

      if (typeof name !== "string" || !name) return;
      if (!Number.isFinite(price) || price <= 0) return;
      if (!Number.isFinite(quantity) || quantity <= 0) return;

      cart.set(name, { name, price, quantity });
    });
  } catch (error) {
    /* Storage unavailable or corrupt - start with an empty bag. */
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify([...cart.values()]));
  } catch (error) {
    /* Private mode or quota exceeded - the bag still works for this visit. */
  }
}

function cartTotals() {
  const items = [...cart.values()];
  return {
    items,
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  };
}

function renderCart() {
  const { items, itemCount, subtotal } = cartTotals();

  bagCount.textContent = String(itemCount);
  bagButton.setAttribute("aria-label", `Shopping bag, ${itemCount} ${itemCount === 1 ? "item" : "items"}`);
  cartTotal.textContent = formatMoney(subtotal);

  const hasItems = items.length > 0;
  checkoutButton.disabled = !hasItems;
  checkoutButton.textContent = hasItems ? "Checkout by email" : "Your bag is empty";

  if (!hasItems) {
    cartItems.innerHTML = '<p class="cart-empty">Your bag is waiting for something good.</p>';
    return;
  }

  cartItems.innerHTML = items.map((item) => {
    const name = escapeHtml(item.name);
    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <strong>${name}</strong>
          <span>${formatMoney(item.price)} each</span>
        </div>
        <div class="cart-item-controls">
          <button class="qty-button" type="button" data-action="decrease" data-name="${name}" aria-label="Remove one ${name}">−</button>
          <span class="qty-value" aria-hidden="true">${item.quantity}</span>
          <button class="qty-button" type="button" data-action="increase" data-name="${name}" aria-label="Add one more ${name}">+</button>
          <button class="cart-remove" type="button" data-action="remove" data-name="${name}" aria-label="Remove ${name} from bag">×</button>
        </div>
        <span class="cart-line-total">${formatMoney(item.price * item.quantity)}</span>
      </div>`;
  }).join("");
}

function setQuantity(name, nextQuantity) {
  const item = cart.get(name);
  if (!item) return;

  if (nextQuantity <= 0) {
    cart.delete(name);
  } else {
    item.quantity = nextQuantity;
  }

  saveCart();
  renderCart();
}

function buildOrderMessage() {
  const { items, itemCount, subtotal } = cartTotals();
  const lines = items.map((item) => `- ${item.name} x ${item.quantity} = ${formatMoney(item.price * item.quantity)}`);
  const subject = `Order from sabeer. (${itemCount} ${itemCount === 1 ? "item" : "items"})`;
  const body = [
    "Hi Sabeer,",
    "",
    "I would like to order:",
    "",
    ...lines,
    "",
    `Subtotal: ${formatMoney(subtotal)}`,
    "",
    "Please send payment and delivery details to:",
    "",
    "Name:",
    "Address:",
    "",
    "Thank you!"
  ].join("\n");

  return { subject, body, text: `${lines.join("\n")}\n\nSubtotal: ${formatMoney(subtotal)}` };
}

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
  siteNav.classList.toggle("is-open", !isExpanded);
});

siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    siteNav.classList.remove("is-open");
  }
});

document.querySelectorAll(".add-button").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.dataset.name;
    const price = Number(button.dataset.price);
    const item = cart.get(name) ?? { name, price, quantity: 0 };
    item.quantity += 1;
    cart.set(name, item);
    saveCart();
    renderCart();
    button.innerHTML = 'Added <span aria-hidden="true">✓</span>';
    window.setTimeout(() => {
      button.innerHTML = 'Add to bag <span aria-hidden="true">+</span>';
    }, 1000);
  });
});

cartItems.addEventListener("click", (event) => {
  const control = event.target.closest("[data-action]");
  if (!control) return;

  const name = control.dataset.name;
  const item = cart.get(name);
  if (!item) return;

  if (control.dataset.action === "increase") setQuantity(name, item.quantity + 1);
  if (control.dataset.action === "decrease") setQuantity(name, item.quantity - 1);
  if (control.dataset.action === "remove") setQuantity(name, 0);
});

bagButton.addEventListener("click", () => cartDialog.showModal());
document.querySelector(".cart-close").addEventListener("click", () => cartDialog.close());
cartDialog.addEventListener("click", (event) => {
  if (event.target === cartDialog) cartDialog.close();
});

checkoutButton.addEventListener("click", () => {
  if (cart.size === 0) return;

  const { subject, body } = buildOrderMessage();
  window.location.href = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

if (copyButton) {
  copyButton.addEventListener("click", async () => {
    if (cart.size === 0) return;

    const { text } = buildOrderMessage();
    const original = copyButton.textContent;

    try {
      await navigator.clipboard.writeText(text);
      copyButton.textContent = "Order copied";
    } catch (error) {
      copyButton.textContent = "Copy failed";
    }

    window.setTimeout(() => {
      copyButton.textContent = original;
    }, 2000);
  });
}

loadCart();
renderCart();
document.querySelector("#year").textContent = new Date().getFullYear();
