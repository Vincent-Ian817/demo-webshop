const PRODUCTS = {
  apple: { name: "Apple", emoji: "🍏" },
  banana: { name: "Banana", emoji: "🍌" },
  lemon: { name: "Lemon", emoji: "🍋" },
};

function getBasket() {
  try {
    const basket = localStorage.getItem("basket");
    if (!basket) return [];
    const parsed = JSON.parse(basket);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Error parsing basket from localStorage:", error);
    return [];
  }
}

function addToBasket(product) {
  const basket = getBasket();
  basket.push(product);
  localStorage.setItem("basket", JSON.stringify(basket));
}

function clearBasket() {
  localStorage.removeItem("basket");
}

function renderBasket() {
  const basket = getBasket();
  const basketList = document.getElementById("basketList");
  const cartButtonsRow = document.querySelector(".cart-buttons-row");
  if (!basketList) return;
  basketList.innerHTML = "";
  if (basket.length === 0) {
    basketList.innerHTML = "<li>No products in basket.</li>";
    if (cartButtonsRow) cartButtonsRow.style.display = "none";
    return;
  }
  basket.forEach((product) => {
    const item = PRODUCTS[product];
    if (item) {
      const li = document.createElement("li");
      li.innerHTML = `<span class='basket-emoji'>${item.emoji}</span> <span>${item.name}</span>`;
      basketList.appendChild(li);
    }
  });
  if (cartButtonsRow) cartButtonsRow.style.display = "flex";
}

function renderBasketIndicator() {
  const basket = getBasket();
  let indicator = document.querySelector(".basket-indicator");
  if (!indicator) {
    const basketLink = document.querySelector(".basket-link");
    if (!basketLink) return;
    indicator = document.createElement("span");
    indicator.className = "basket-indicator";
    basketLink.appendChild(indicator);
  }
  if (basket.length > 0) {
    indicator.textContent = basket.length;
    indicator.style.display = "flex";
  } else {
    indicator.style.display = "none";
  }
}

// Call this on page load and after basket changes
if (document.readyState !== "loading") {
  renderBasketIndicator();
} else {
  document.addEventListener("DOMContentLoaded", renderBasketIndicator);
}

// Patch basket functions to update indicator
const origAddToBasket = window.addToBasket;
window.addToBasket = function (product) {
  origAddToBasket(product);
  renderBasketIndicator();
};
const origClearBasket = window.clearBasket;
window.clearBasket = function () {
  origClearBasket();
  renderBasketIndicator();
};

// Slot machine: pick a random fruit, animate reels, and add to basket
const FRUIT_KEYS = Object.keys(PRODUCTS);

function randomFruitKey() {
  return FRUIT_KEYS[Math.floor(Math.random() * FRUIT_KEYS.length)];
}

function spinSlot() {
  const reels = [
    document.getElementById("reel1"),
    document.getElementById("reel2"),
    document.getElementById("reel3"),
  ].filter(Boolean);
  const spinBtn = document.getElementById("spinBtn");
  const slotMsg = document.getElementById("slotMsg");
  if (!reels.length || !spinBtn) return;

  spinBtn.disabled = true;
  if (slotMsg) slotMsg.textContent = "Spinning...";

  // animate quick random changes
  const interval = setInterval(() => {
    const key = randomFruitKey();
    reels.forEach((r) => (r.textContent = PRODUCTS[key].emoji));
  }, 80);

  // stop after ~1.2s and add an item
  setTimeout(() => {
    clearInterval(interval);
    const chosen = randomFruitKey();
    reels.forEach((r) => (r.textContent = PRODUCTS[chosen].emoji));
    // Add to basket (use global wrapper so indicator updates)
    try {
      window.addToBasket(chosen);
    } catch (e) {
      // fallback to local function
      addToBasket(chosen);
      renderBasketIndicator();
    }
    if (slotMsg) slotMsg.textContent = `Added ${PRODUCTS[chosen].name} to basket!`;
    // re-enable button after a short delay
    setTimeout(() => {
      if (slotMsg) slotMsg.textContent = "";
      spinBtn.disabled = false;
    }, 1200);
  }, 1200);
}

// Wire up the spin button when page loads
if (document.readyState !== "loading") {
  const btn = document.getElementById("spinBtn");
  if (btn) btn.addEventListener("click", spinSlot);
} else {
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("spinBtn");
    if (btn) btn.addEventListener("click", spinSlot);
  });
}
