const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const bagButton = document.querySelector(".bag-button");
const bagCount = document.querySelector(".bag-count");
const cartDialog = document.querySelector(".cart-dialog");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total strong");
const cart = new Map();

function renderCart() {
  const items = [...cart.values()];
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  bagCount.textContent = String(itemCount);
  bagButton.setAttribute("aria-label", `Shopping bag, ${itemCount} ${itemCount === 1 ? "item" : "items"}`);
  cartTotal.textContent = `$${subtotal}`;

  if (items.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Your bag is waiting for something good.</p>';
    return;
  }

  cartItems.innerHTML = items.map((item) =>
    `<div class="cart-item"><strong>${item.name} × ${item.quantity}</strong><span>$${item.price * item.quantity}</span></div>`
  ).join("");
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
    renderCart();
    button.innerHTML = 'Added <span aria-hidden="true">✓</span>';
    window.setTimeout(() => {
      button.innerHTML = 'Add to bag <span aria-hidden="true">+</span>';
    }, 1000);
  });
});

bagButton.addEventListener("click", () => cartDialog.showModal());
document.querySelector(".cart-close").addEventListener("click", () => cartDialog.close());
cartDialog.addEventListener("click", (event) => {
  if (event.target === cartDialog) cartDialog.close();
});

renderCart();
document.querySelector("#year").textContent = new Date().getFullYear();