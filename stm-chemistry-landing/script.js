const YM_COUNTER_ID = null;

const header = document.querySelector(".site-header");
const form = document.querySelector(".lead-form");
const statusMessage = document.querySelector(".form-status");
const heroTitle = document.querySelector("#hero-title");
const consent = document.querySelector("#consent");
const consentError = document.querySelector(".consent-error");

const fields = {
  name: document.querySelector("#name"),
  phone: document.querySelector("#phone"),
  email: document.querySelector("#email"),
  category: document.querySelector("#category"),
  volume: document.querySelector("#volume"),
  deadline: document.querySelector("#deadline"),
  channel: document.querySelector("#channel"),
};

const validators = {
  name(value) {
    return value.trim().length >= 2 ? "" : "Укажите имя.";
  },
  phone(value) {
    return /^\+?[0-9\s()\-]{9,}$/.test(value.trim())
      ? ""
      : "Укажите телефон для связи.";
  },
  email(value) {
    const clean = value.trim();
    return clean === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)
      ? ""
      : "Проверьте формат email.";
  },
  category(value) {
    return value ? "" : "Выберите категорию товара.";
  },
  volume(value) {
    return value.trim().length >= 3 ? "" : "Укажите примерный объем.";
  },
  deadline(value) {
    return value ? "" : "Выберите желаемый срок.";
  },
  channel(value) {
    return value ? "" : "Выберите канал продаж.";
  },
};

function trackEvent(name, params = {}) {
  const payload = {
    page: "stm-chemistry-landing",
    ...params,
  };

  if (YM_COUNTER_ID && window.ym) {
    window.ym(YM_COUNTER_ID, "reachGoal", name, payload);
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...payload });

  if (window.location.hostname === "localhost" || window.location.protocol === "file:") {
    console.info("[analytics]", name, payload);
  }
}

function setHeaderState() {
  header.dataset.elevated = window.scrollY > 12 ? "true" : "false";
}

function getHeadlineVariant() {
  const params = new URLSearchParams(window.location.search);
  const forced = params.get("headline");

  if (forced === "a" || forced === "b") {
    return forced;
  }

  const stored = window.localStorage.getItem("stmHeadlineVariant");
  if (stored === "a" || stored === "b") {
    return stored;
  }

  const generated = Math.random() > 0.5 ? "b" : "a";
  window.localStorage.setItem("stmHeadlineVariant", generated);
  return generated;
}

function applyHeadlineTest() {
  const variant = getHeadlineVariant();
  const text = heroTitle.dataset[`variant${variant.toUpperCase()}`];

  if (text) {
    heroTitle.textContent = text;
  }

  trackEvent("ab_variant", { variant });
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

function validateConsent() {
  const message = consent.checked ? "" : "Подтвердите согласие на обработку данных.";
  consentError.textContent = message;
  return !message;
}

function validateForm() {
  const fieldsValid = Object.keys(fields).map(validateField).every(Boolean);
  const consentValid = validateConsent();
  return fieldsValid && consentValid;
}

Object.keys(fields).forEach((name) => {
  fields[name].addEventListener("input", () => {
    if (fields[name].closest(".field").dataset.invalid === "true") {
      validateField(name);
    }
  });
});

consent.addEventListener("change", validateConsent);

document.querySelectorAll("[data-track]").forEach((element) => {
  element.addEventListener("click", () => {
    trackEvent(element.dataset.track, {
      label: element.textContent.trim(),
      href: element.getAttribute("href") || "",
    });
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  statusMessage.textContent = "";
  trackEvent("lead_submit_attempt");

  if (!validateForm()) {
    statusMessage.textContent = "Проверьте поля с подсказками выше.";
    statusMessage.style.color = "var(--danger)";
    trackEvent("lead_submit_error");
    return;
  }

  form.dataset.state = "loading";
  statusMessage.style.color = "var(--accent-dark)";
  statusMessage.textContent = "Готовим заявку к отправке...";

  const formData = Object.fromEntries(new FormData(form).entries());

  window.setTimeout(() => {
    form.dataset.state = "success";
    statusMessage.textContent =
      "Заявка сохранена в демо-режиме. В рабочей версии она уйдет менеджеру в CRM, Telegram или email.";
    trackEvent("lead_submit_success", {
      category: formData.category,
      volume: formData.volume,
      channel: formData.channel,
    });
    form.reset();
  }, 750);
});

window.addEventListener("scroll", setHeaderState, { passive: true });

applyHeadlineTest();
setHeaderState();
