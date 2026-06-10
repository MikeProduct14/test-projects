const header = document.querySelector(".site-header");
const form = document.querySelector(".lead-form");
const statusMessage = document.querySelector(".form-status");

const fields = {
  name: document.querySelector("#name"),
  contact: document.querySelector("#contact"),
  format: document.querySelector("#format"),
  goal: document.querySelector("#goal"),
};

const validators = {
  name(value) {
    return value.trim().length >= 2 ? "" : "Укажите имя, чтобы тренер понимал, как к вам обращаться.";
  },
  contact(value) {
    const clean = value.trim();
    const isTelegram = /^@[a-zA-Z0-9_]{4,}$/.test(clean);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
    const isPhone = /^\+?[0-9\s()\\-]{9,}$/.test(clean);

    return isTelegram || isEmail || isPhone
      ? ""
      : "Оставьте Telegram, телефон или Email для связи.";
  },
  format(value) {
    return value ? "" : "Выберите формат занятия.";
  },
  goal(value) {
    return value.trim().length >= 8 ? "" : "Опишите цель хотя бы в одном коротком предложении.";
  },
};

function setHeaderState() {
  header.dataset.elevated = window.scrollY > 16 ? "true" : "false";
}

function setFieldError(input, message) {
  const field = input.closest(".field");
  const error = field.querySelector(".field-error");

  field.dataset.invalid = message ? "true" : "false";
  error.textContent = message;
}

function validateField(name) {
  const input = fields[name];
  const message = validators[name](input.value);
  setFieldError(input, message);
  return !message;
}

function validateForm() {
  return Object.keys(fields).map(validateField).every(Boolean);
}

Object.keys(fields).forEach((name) => {
  fields[name].addEventListener("input", () => {
    if (fields[name].closest(".field").dataset.invalid === "true") {
      validateField(name);
    }
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  statusMessage.textContent = "";

  if (!validateForm()) {
    statusMessage.textContent = "Проверьте поля с подсказками выше.";
    statusMessage.style.color = "var(--danger)";
    return;
  }

  form.dataset.state = "loading";
  statusMessage.style.color = "var(--mint)";
  statusMessage.textContent = "Отправляем заявку...";

  window.setTimeout(() => {
    form.dataset.state = "success";
    statusMessage.textContent =
      "Готово. В рабочей версии эта заявка уйдет в Telegram или на Email.";
    form.reset();
  }, 800);
});

window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();
