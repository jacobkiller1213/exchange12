<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from "vue";
import { useExchangeStore } from "@/store/ExchangeStore";
import { useRouter } from "vue-router";
import Loader from "@/components/Loader.vue";
import regexData from "@/api/regex_data.json";
const name_exchange = ref(import.meta.env.VITE_EXCHANGER_NAME);
const router = useRouter();

const isCalculating = ref(false);
const validationError = ref("");
const debounceTimeout = ref(null);
const pageLoading = ref(true); // Флаг загрузки страницы
const isSubmitting = ref(false); // Флаг отправки формы
const formErrors = ref({}); // Ошибки формы
const orderCreated = ref(false); // Флаг создания ордера
const orderData = ref(null); // Данные созданного ордера
const notRememberData = ref(false); // Флаг для чекбокса "Не запоминать введенные данные"
const agreeChecked = ref(false); // Согласие с правилами

// Новые реактивные поля формы
const phone = ref("");
const email = ref("");
const account = ref("");
const memo = ref(""); // Добавляем поле для memo/tag/message

// Флаги для отслеживания первого ввода в поля
const touchedFields = ref({
  phone: false,
  email: false,
  account: false,
  memo: false,
  amountFrom: false,
  amountTo: false,
  agree: false,
});

// Флаг для отображения поля memo
const showMemoField = computed(() => {
  const currency = selectedToCurrency.value;
  if (!currency) return false;

  // Список монет, требующих memo/tag
  const memoRequiredCoins = [
"XRP",
"XLM",
"BNB",
"ATOM",
"EOS",
"XMR",
"ALGO",
"ADA",
  ];
  return memoRequiredCoins.includes(currency.code?.toUpperCase());
});

// Состояние и обработчики модалки выбора монеты
const isSearchModalOpen = ref(false);
const selectModalSide = ref(null); // 'from' | 'to'
const searchQuery = ref("");

const filteredCryptoCurrencies = computed(() => {
  const list = cryptoCurrencies.value || [];
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return list;
  return list.filter((item) => {
const code = String(item.code || "").toLowerCase();
const network = String(item.network || "").toLowerCase();
const label = String(item.label || "").toLowerCase();
const currencyFrom = String(item.currency_from || "").toLowerCase();
return (
  code.includes(query) ||
  network.includes(query) ||
  label.includes(query) ||
  currencyFrom.includes(query)
);
  });
});

function openSearchModal(side) {
  selectModalSide.value = side;
  isSearchModalOpen.value = true;
  searchQuery.value = "";
}

function closeSearchModal() {
  isSearchModalOpen.value = false;
}

function handleCoinSelect(coin) {
  if (!coin) return;
  if (selectModalSide.value === "from") {
selectFromCurrency(coin);
  } else if (selectModalSide.value === "to") {
selectToCurrency(coin);
  }
  closeSearchModal();
}

function selectFromCurrency(currency) {
  console.log("Выбрана валюта отправления:", currency);
  currencyFrom.value = currency.key;
  // Пересчитываем в зависимости от доступной суммы
  if (amountFrom.value) {
debouncedCalculateExchange();
  } else if (amountTo.value) {
debouncedCalculateExchangeReverse();
  }
}
function selectToCurrency(currency) {
  console.log("Выбрана валюта получения:", currency);
  currencyTo.value = currency.key;
  // Пересчитываем в зависимости от доступной суммы
  if (amountFrom.value) {
debouncedCalculateExchange();
  } else if (amountTo.value) {
debouncedCalculateExchangeReverse();
  }
}

// Computed для получения минимальной суммы текущей валюты
const currentMinAmount = computed(() => {
  if (!currencyFrom.value) return 0;
  return getMinAmountForCurrency(currencyFrom.value);
});

// Вычисляемые свойства для получения объектов валют
const selectedFromCurrency = computed(() => {
  return cryptoCurrencies.value.find((c) => c.key === currencyFrom.value) || {};
});

const selectedToCurrency = computed(() => {
  return cryptoCurrencies.value.find((c) => c.key === currencyTo.value) || {};
});

// Карта регулярных выражений для популярных адресов
const ADDRESS_REGEX_BY_CODE = {
  // Crypto addresses
  BTC: /^(?:bc1[02-9ac-hj-np-z]{7,87}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/,
  ETH: /^0x[a-fA-F0-9]{40}$/,
  ETC: /^0x[a-fA-F0-9]{40}$/,
  MATIC: /^0x[a-fA-F0-9]{40}$/,
  DAI: /^0x[a-fA-F0-9]{40}$/,
  USDC: /^0x[a-fA-F0-9]{40}$/,
  USDCERC20: /^0x[a-fA-F0-9]{40}$/,
  USDTERC20: /^0x[a-fA-F0-9]{40}$/,
  TRX: /^T[A-Za-z1-9]{33}$/,
  USDTTRC20: /^T[A-Za-z1-9]{33}$/,
  USDCTRC20: /^T[A-Za-z1-9]{33}$/,
  LTC: /^(?:[LM3][A-Za-z0-9]{26,33}|ltc1[0-9A-Za-z]{39,59})$/,
  XRP: /^r[a-zA-Z0-9]{24,34}$/,
  XLM: /^G[A-D][A-Z2-7]{54}$/,
  SOL: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  TON: /^[UE][Qf][0-9A-Za-z\-_]{46}$/,
  USDTTON: /^[UE][Qf][0-9A-Za-z\-_]{46}$/,
  DOGE: /^D{1}[5-9A-HJ-NP-U]{1}[1-9A-HJ-NP-Za-km-z]{32}$/,
  DOT: /^1[0-9a-zA-Z]{47}$/,
  ADA: /^addr1[a-z0-9]{98}$/,
  XMR: /^[48][0-9AB][1-9A-HJ-NP-Za-km-z]{93}$/,
  BCH: /^(?:[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bitcoincash:q[a-z0-9]{41})$/,
  DASH: /^X[1-9A-HJ-NP-Za-km-z]{33}$/,
  ZEC: /^t1[a-zA-Z0-9]{33}$/,

  // Bank cards and accounts (RUB)
  SBERRUB: /^[0-9]{16,20}$/,
  TCSBRUB: /^[0-9]{16,20}$/,
  ACRUB: /^[0-9]{16,20}$/,
  CARDRUB: /^[0-9]{16,20}$/,
  RNKBRUB: /^[0-9]{16,20}$/,
  VTBRUB: /^[0-9]{16,20}$/,
  AVBRUB: /^[0-9]{16,20}$/,
  ROSBRUB: /^[0-9]{16,20}$/,
  RSHBRUB: /^[0-9]{16,20}$/,
  RFBRUB: /^[0-9]{16,20}$/,
  GPBRUB: /^[0-9]{16,20}$/,
  POSTBRUB: /^[0-9]{16,20}$/,
  OPNBRUB: /^[0-9]{16,20}$/,
  RUSSTRUB: /^[0-9]{16,20}$/,

  // KZT cards
  CARDKZT: /^[0-9]{16,20}$/,
  KSPBKZT: /^[0-9]{16,20}$/,
  HLKBKZT: /^[0-9]{16,20}$/,

  // Phone payments
  SBPRUB: /^\+?7[0-9]{10}$/,

  // Cash - no validation needed
  CASHRUB: null,
};

function getAddressRegexForCode(currency) {
  if (!currency) return null;

  // Пробуем разные варианты кода валюты
  const codes = [
currency.currency_from, // Полный код с сетью
currency.code, // Базовый код
currency.code + (currency.network || ""), // Код + сеть
(currency.code + (currency.network || ""))
  .replace(/\s+/g, "")
  .toUpperCase(), // Без пробелов
  ].filter(Boolean);

  // Сначала проверяем встроенные регексы
  for (const code of codes) {
const upper = String(code).toUpperCase();
if (ADDRESS_REGEX_BY_CODE.hasOwnProperty(upper)) {
  return ADDRESS_REGEX_BY_CODE[upper]; // Может быть null для некоторых валют
}
  }

  // Потом ищем в данных из JSON
  try {
for (const code of codes) {
  const upper = String(code).toUpperCase();
  const item = regexData.find(
(r) => r.best_code && r.best_code.toUpperCase() === upper && r.regex
  );
  if (item && item.regex && item.regex.trim()) {
const pattern = String(item.regex)
  .replace(/\\z$/, "$")
  .replace(/\\Z$/, "$");
return new RegExp(pattern);
  }
}
  } catch (e) {
console.warn("Ошибка в регексе из JSON:", e);
  }

  return null;
}

// Блокировка сабмита при любой ошибке
const hasValidationErrors = computed(() => {
  return (
!!validationError.value || Object.values(formErrors.value).some(Boolean)
  );
});

// Строгая проверка, блокирующая кнопку до полной валидности формы
const hasBlockingErrors = computed(() => {
  // Базовые обязательные поля и суммы/валюты
  if (
!currencyFrom.value ||
!currencyTo.value ||
!amountFrom.value ||
!amountTo.value ||
!agreeChecked.value
  ) {
return true;
  }

  // Мин. сумма и общая ошибка
  if (validationError.value) return true;

  // Телефон
  const phoneValue = phone.value.trim();
  const digitsOnly = phoneValue.replace(/\D/g, "");
  if (!phoneValue || digitsOnly.length < 10) return true;

  const forbiddenPrefixes = ['1', '39', '38', '49', '44', '65', '81', '82', '972', '971'];
  for (const prefix of forbiddenPrefixes) {
if (digitsOnly.startsWith(prefix)) return true;
  }

  // Email
  const emailValue = email.value.trim();
  if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) return true;

  // Адрес/реквизиты
  const accountValue = account.value.trim();
  if (!accountValue) return true;
  const currency = selectedToCurrency.value;
  const addrRegex = getAddressRegexForCode(currency);
  if (addrRegex === null) {
// Валидация адреса не требуется для данной валюты
  } else if (addrRegex) {
if (!addrRegex.test(accountValue)) return true;
  } else {
if (accountValue.length < 10) return true;
  }

  return false;
});

const {
  currencyFrom,
  currencyTo,
  amountFrom,
  amountTo,
  exchangeRate,
  minAmounts,
  loading,
  currencyOptions,
  cryptoCurrencies,
  fiatCurrencies,
  getRates,
  calculateExchange,
  calculateExchangeReverse,
  swapCurrencies,
  getMinAmounts,
  createOrder,
} = useExchangeStore();

function getMinAmountForCurrency(currencyId) {
  const currency = cryptoCurrencies.value.find((c) => c.key === currencyId);
  if (!currency || !minAmounts.value) return 0;
  const code = String(currency.code || '').trim();
  const network = String(currency.network || '').trim();
  const variants = [];
  // Base variants
  variants.push(code);
  if (network) {
variants.push(`${code} ${network}`); // with space
variants.push(`${code}${network}`); // no space
variants.push(`${code} (${network})`); // parentheses
  }
  // currency_from from store (usually code+network without space)
  if (currency.currency_from) variants.push(String(currency.currency_from));
  // Uppercase variants
  const upperVariants = variants.map(v => v.toUpperCase());
  const allKeys = [...variants, ...upperVariants];

  for (const k of allKeys) {
const val = minAmounts.value[k];
const num = typeof val === 'string' ? parseFloat(val) : Number(val);
if (Number.isFinite(num) && num > 0) {
  return num;
}
  }
  return 0;
}

function validateMinAmount(amount, currencyId) {
  const minAmount = getMinAmountForCurrency(currencyId);
  if (amount < minAmount) {
const currency = cryptoCurrencies.value.find((c) => c.key === currencyId);
const currencyCode = currency ? currency.code : "";
validationError.value = `Минимальная сумма для ${currencyCode}: ${minAmount}`;
return false;
  }
  validationError.value = "";
  return true;
}

// Функция для проверки валидации без вычислений
function checkValidation() {
  const hasAmountInput = amountFrom.value !== null && amountFrom.value !== undefined && amountFrom.value !== "";
  if (hasAmountInput && currencyFrom.value && touchedFields.value.amountFrom) {
const parsed = parseFloat(String(amountFrom.value).replace(/,/g, '.'));
if (Number.isFinite(parsed)) {
  validateMinAmount(parsed, currencyFrom.value);
} else {
  validationError.value = "";
}
  } else {
validationError.value = "";
  }
}

// Debounced функции для вычислений
function debouncedCalculateExchange() {
  if (debounceTimeout.value) {
clearTimeout(debounceTimeout.value);
  }

  debounceTimeout.value = setTimeout(() => {
handleCalculateExchange();
  }, 300);
}

function debouncedCalculateExchangeReverse() {
  if (debounceTimeout.value) {
clearTimeout(debounceTimeout.value);
  }

  debounceTimeout.value = setTimeout(() => {
handleCalculateExchangeReverse();
  }, 300);
}

// Обертки для функций вычисления с флагом
async function handleCalculateExchange() {
  if (isCalculating.value) return;

  console.log("Запуск расчета обмена...");
  console.log(
"Валюта отправления:",
selectedFromCurrency.value?.code || currencyFrom.value
  );
  console.log(
"Валюта получения:",
selectedToCurrency.value?.code || currencyTo.value
  );
  console.log("Сумма отправления:", amountFrom.value);

  // Сначала проверяем валидацию
  checkValidation();

  // Если есть ошибка валидации, не продолжаем
  if (validationError.value) {
console.log("Ошибка валидации:", validationError.value);
return;
  }

  isCalculating.value = true;
  try {
await calculateExchange();
console.log("Расчет завершен. Сумма получения:", amountTo.value);
  } catch (error) {
console.error("Ошибка при расчете:", error);
  } finally {
isCalculating.value = false;
  }
}

async function handleCalculateExchangeReverse() {
  if (isCalculating.value) return;

  console.log("Запуск обратного расчета...");
  console.log(
"Валюта отправления:",
selectedFromCurrency.value?.code || currencyFrom.value
  );
  console.log(
"Валюта получения:",
selectedToCurrency.value?.code || currencyTo.value
  );
  console.log("Сумма получения:", amountTo.value);

  isCalculating.value = true;
  try {
await calculateExchangeReverse();
console.log(
  "Обратный расчет завершен. Сумма отправления:",
  amountFrom.value
);
  } catch (error) {
console.error("Ошибка при обратном расчете:", error);
  } finally {
isCalculating.value = false;
  }
}

function exchange() {
  if (
amountFrom.value &&
amountTo.value &&
currencyFrom.value &&
currencyTo.value
  ) {
router.push(
  `/exchange?amountFrom=${amountFrom.value}&amountTo=${amountTo.value}&currencyFrom=${currencyFrom.value}&currencyTo=${currencyTo.value}`
);
  }
}

// Функция для переключения FAQ элементов
function toggleFaqItem(event) {
  const title = event.currentTarget;
  const desc = title.nextElementSibling;

  if (desc && desc.classList.contains("faq-item-desc")) {
const isOpen = desc.style.maxHeight !== "0px";

if (isOpen) {
  desc.style.maxHeight = "0";
  title.classList.remove("active");
} else {
  desc.style.maxHeight = desc.scrollHeight + "px";
  title.classList.add("active");
}
  }
}

// Валидация формы
function validateForm() {
  const errors = {};

  // Телефон
  if (touchedFields.value.phone) {
const phoneValue = phone.value.trim();
const digitsOnly = phoneValue.replace(/\D/g, "");
if (!phoneValue) {
  errors.phone = "Введите номер телефона";
} else if (digitsOnly.length < 10) {
  errors.phone = "Введите корректный номер телефона";
} else {
  const forbiddenPrefixes = ['1', '39', '38', '49', '44', '65', '81', '82', '972', '971'];
  const hasForbiddenPrefix = forbiddenPrefixes.some(prefix => digitsOnly.startsWith(prefix));
  if (hasForbiddenPrefix) {
errors.phone = "Введите корректный номер телефона";
  }
}
  }

  // Email
  if (touchedFields.value.email) {
const emailValue = email.value.trim();
if (!emailValue) {
  errors.email = "Введите email";
} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
  errors.email = "Введите корректный email";
}
  }

  // Реквизиты/адрес
  if (touchedFields.value.account) {
const accountValue = account.value.trim();
if (!accountValue) {
  errors.account = "Введите реквизиты";
} else {
  const currency = selectedToCurrency.value;
  const code = currency?.code;

  // Логирование для отладки
  console.log("Validating address for currency:", currency);
  console.log("Account value:", accountValue);

  const addrRegex = getAddressRegexForCode(currency);

  if (addrRegex === null) {
// Null означает, что валидация не требуется для этой валюты (например, наличные)
console.log("Validation skipped for currency (null regex)");
  } else if (addrRegex) {
console.log("Using regex:", addrRegex);
if (!addrRegex.test(accountValue)) {
  const networkSuffix = currency?.network
? ` (${currency.network})`
: "";
  errors.account = `Некорректный адрес для ${code}${networkSuffix}`;
}
  } else {
// Если регекс не найден, проводим базовую валидацию длины
if (accountValue.length < 10) {
  errors.account = "Реквизиты слишком короткие (минимум 10 символов)";
}
console.log(
  "No regex found for currency, using basic length validation"
);
  }
}
  }

  // Memo / Tag (обязательно для некоторых монет)
  if (touchedFields.value.memo && showMemoField.value) {
const memoValue = memo.value.trim();
if (!memoValue) {
  errors.memo = "Введите Memo/Tag";
}
  }

  // Чекбокс согласия
  if (!agreeChecked.value) {
errors.agree = "Необходимо согласиться с правилами сервиса";
  }

  formErrors.value = errors;
  return Object.keys(errors).length === 0;
}

// Обработка отправки формы
async function handleSubmit(event) {
  event.preventDefault();

  if (isSubmitting.value) return;

  // Помечаем все поля как "touched" при отправке формы
  touchedFields.value.phone = true;
  touchedFields.value.email = true;
  touchedFields.value.account = true;
  touchedFields.value.memo = true;
  touchedFields.value.amountFrom = true;
  touchedFields.value.amountTo = true;
  touchedFields.value.agree = true;

  // Валидация формы
  if (!validateForm()) {
return;
  }

  try {
isSubmitting.value = true;

// Формируем объект paymentInfo с учетом memo, если оно есть
let paymentInfoObj = {
  "💼 Адрес кошелька": account.value,
};

if (showMemoField.value && memo.value) {
  paymentInfoObj["💬 Memo/Tag"] = memo.value;
}

// Создаем объект с данными для создания ордера
const orderPayload = {
  exchangerId: import.meta.env.VITE_EXCHANGER_ID,
  currencyFrom: selectedFromCurrency.value.currency_from,
  currencyTo: selectedToCurrency.value.currency_from,
  amountFrom: parseFloat(amountFrom.value),
  amountTo: parseFloat(amountTo.value),
  paymentInfo: JSON.stringify(paymentInfoObj),
  description: JSON.stringify({
"📱 Номер телефона": phone.value,
"📧 Email": email.value,
  }),
  otherInfo: null,
};

console.log("Создание ордера:", orderPayload);

// Вызываем метод создания ордера
const result = await createOrder(orderPayload);

if (result.success) {
  orderCreated.value = true;
  orderData.value = result.data;
  console.log("Ордер успешно создан:", result.data);

  // Перенаправляем на страницу ордера
  router.push(`/order/${result.data.id}`);
} else {
  console.error("Ошибка при создании ордера:", result.error);
  alert(`Ошибка при создании ордера: ${result.error}`);
}
  } catch (error) {
console.error("Ошибка при отправке формы:", error);
alert(
  "Произошла ошибка при создании ордера. Пожалуйста, попробуйте еще раз."
);
  } finally {
isSubmitting.value = false;
  }
}

// Watch для валидации при изменении суммы или валюты
watch([amountFrom, currencyFrom], () => {
  if (amountFrom.value !== "") {
touchedFields.value.amountFrom = true;
  }
  checkValidation();
});

watch([currencyFrom, currencyTo, amountFrom], () => {
  if (
currencyFrom.value &&
currencyTo.value &&
amountFrom.value &&
!isCalculating.value
  ) {
debouncedCalculateExchange();
  }
});

// Revalidate when min amounts are updated from the store
watch([minAmounts, currencyFrom], () => {
  checkValidation();
});

watch(amountTo, () => {
  if (
currencyFrom.value &&
currencyTo.value &&
amountTo.value &&
!isCalculating.value
  ) {
debouncedCalculateExchangeReverse();
  }
});

// Пересчитывать, если меняется валюта и заполнено только поле получения
watch([currencyFrom, amountTo], () => {
  if (
currencyFrom.value &&
currencyTo.value &&
amountTo.value &&
!isCalculating.value
  ) {
debouncedCalculateExchangeReverse();
  }
});

// Пересчитывать, если меняется валюта и заполнено только поле отправления
watch([currencyTo, amountFrom], () => {
  if (
currencyFrom.value &&
currencyTo.value &&
amountFrom.value &&
!isCalculating.value
  ) {
debouncedCalculateExchange();
  }
});

// Live validate contact and address fields
watch([phone, email, account, memo, selectedToCurrency, agreeChecked], () => {
  // Устанавливаем флаги "touched" при изменении значений
  if (phone.value) touchedFields.value.phone = true;
  if (email.value) touchedFields.value.email = true;
  if (account.value) touchedFields.value.account = true;
  if (memo.value) touchedFields.value.memo = true;

  validateForm();
});

// Функция для переключения состояния чекбокса
function toggleCheckbox() {
  // Простое переключение значения
  notRememberData.value = !notRememberData.value;
  console.log("Состояние чекбокса изменено на:", notRememberData.value);
}

onMounted(async () => {
  try {
pageLoading.value = true; // Устанавливаем флаг загрузки
await getRates();
await getMinAmounts();

// Устанавливаем валюты по умолчанию (BTC -> ETH)
const btcCurrency = cryptoCurrencies.value.find((c) => c.code === "BTC");
const ethCurrency = cryptoCurrencies.value.find((c) => c.code === "ETH");

if (btcCurrency) {
  currencyFrom.value = btcCurrency.key;
  console.log(
"Установлена валюта отправления по умолчанию:",
btcCurrency.code
  );
}
if (ethCurrency) {
  currencyTo.value = ethCurrency.key;
  console.log(
"Установлена валюта получения по умолчанию:",
ethCurrency.code
  );
}

// Если BTC или ETH не найдены, используем первые доступные валюты
if (!currencyFrom.value && cryptoCurrencies.value.length > 0) {
  currencyFrom.value = cryptoCurrencies.value[0].key;
  console.log(
"Установлена первая доступная валюта отправления:",
cryptoCurrencies.value[0].code
  );
}
if (!currencyTo.value && cryptoCurrencies.value.length > 1) {
  currencyTo.value = cryptoCurrencies.value[1].key;
  console.log(
"Установлена первая доступная валюта получения:",
cryptoCurrencies.value[1].code
  );
}

// Если есть валюты, устанавливаем начальную сумму и выполняем расчет
if (currencyFrom.value && currencyTo.value) {
  amountFrom.value = "0.1"; // Устанавливаем начальную сумму
  await calculateExchange(); // Рассчитываем обмен
}

// Добавляем обработчики событий для FAQ элементов
const faqTitles = document.querySelectorAll(".faq-item-title");
faqTitles.forEach((title) => {
  title.addEventListener("click", toggleFaqItem);
});

// Инициализируем стили для FAQ элементов
const faqDescs = document.querySelectorAll(".faq-item-desc");
faqDescs.forEach((desc) => {
  desc.style.maxHeight = "0";
  desc.style.overflow = "hidden";
  desc.style.transition = "max-height 0.3s ease";
});

// Оживление FAQ (блок вопросов-ответов с классами .questions__item / .js-tabs-button)
const tabButtons = Array.from(document.querySelectorAll('.js-tabs-button'));
const tabItems = Array.from(document.querySelectorAll('.questions__item'));

function closeAllTabs() {
  tabItems.forEach((item) => {
item.classList.remove('show');
const content = item.querySelector('.tabs__content');
if (content) {
  content.style.maxHeight = '0px';
}
  });
}

function toggleTabClick(e) {
  const button = e.currentTarget;
  const item = button.closest('.questions__item');
  if (!item) return;

  const content = item.querySelector('.tabs__content');
  const isOpen = item.classList.contains('show');

  if (isOpen) {
item.classList.remove('show');
if (content) content.style.maxHeight = '0px';
  } else {
closeAllTabs();
item.classList.add('show');
if (content) {
  // выставляем высоту для плавного открытия
  content.style.maxHeight = content.scrollHeight + 'px';
}
  }
}

// навешиваем обработчики
tabButtons.forEach((btn) => btn.addEventListener('click', toggleTabClick));

// Инициализация: раскрыть те, у кого уже есть show
tabItems.forEach((item) => {
  if (item.classList.contains('show')) {
const content = item.querySelector('.tabs__content');
if (content) content.style.maxHeight = content.scrollHeight + 'px';
  }
});

// Сохраняем в замыкание для снятия подписок при unmount
window.__faqCleanup = () => {
  tabButtons.forEach((btn) => btn.removeEventListener('click', toggleTabClick));
};
  } finally {
// Убираем флаг загрузки после всех инициализаций
pageLoading.value = false;
  }
});

onUnmounted(() => {
  if (typeof window.__faqCleanup === 'function') {
window.__faqCleanup();
delete window.__faqCleanup;
  }
});

const formatCoin = (coin) => {
  return coin?.code?.toLowerCase() || '';
}

// Обработчики blur для показа ошибок по месту
function markPhoneTouched() {
  touchedFields.value.phone = true;
  validateForm();
}
function markEmailTouched() {
  touchedFields.value.email = true;
  validateForm();
}
function markAccountTouched() {
  touchedFields.value.account = true;
  validateForm();
}
function markMemoTouched() {
  touchedFields.value.memo = true;
  validateForm();
}
function markAmountFromTouched() {
  touchedFields.value.amountFrom = true;
  checkValidation();
}
function markAmountToTouched() {
  touchedFields.value.amountTo = true;
  // Ничего не валидируем отдельно для amountTo сейчас
}
</script>

<template>
  <div class="promo">
<section class="promo js-promo">
  <div class="container">
<h1 class="promo__title">Сервис для обмена криптовалюты</h1>
<div class="change" style="position: relative;">
  <Loader :visible=" pageLoading || loading || isCalculating" text="Считаем..." />
  <form
id="exchange__form_js"
method="get"
action="/exchange/create-order"
class="change exchange__form js-exchange-form-initial"
autocomplete="off"
@submit.prevent="handleSubmit"
  >
<input
  name="fingerprint"
  type="hidden"
  id="fingerprint"
  value="2237543831"
/>
<input name="from" type="hidden" id="currency-from" value="BTC" />
<input name="to" type="hidden" id="currency-to" value="XMR" />
<input type="checkbox" class="hidden" name="fix" id="fix" />
<input type="checkbox" class="hidden" name="pay" id="pay" />
<div class="change__top">
  <div class="change__block js-first-block" :class="{ 'has-error': (touchedFields.amountFrom && validationError) }">
<div class="change__prop">Вы отправляете</div>
<div class="change__unit">
  <div class="change__info field" :class="{ 'has-error': touchedFields.amountFrom && validationError }">
<input
  name="amount-from"
  id="amount-from"
  class="reset-input change__value change__input target exchange__input js-onlyNumbers js-exchange-input js-exchange-from"
  v-model="amountFrom"
  style="color: rgb(255, 255, 255)"
  @blur="markAmountFromTouched"
/>
<div v-if="touchedFields.amountFrom && validationError" class="change__error">{{ validationError }}</div>
  </div>
  <div class="dropdown change__dropdown">
<div
  class="reset-btn dropdown__button change__currency-button js-first-currency js-show-popup"
  data-currency="BTC"
  style="display: flex; align-items: center; gap: 4px;"
  data-popup="search"
  @click="openSearchModal('from')"
>
<img :src="'/coins/'+formatCoin(selectedFromCurrency)+'.png'" alt="" srcset="" style="width: 20px; height: 20px; flex-shrink: 0;">
  <span :class="['currency', 'currency_' + ((selectedFromCurrency.code || 'BTC').toLowerCase())]">{{ selectedFromCurrency.code || 'BTC' }}</span>
</div>
  </div>
</div>
<div class="change__unit">

  <div class="change__network">{{ selectedFromCurrency.code }}</div>
</div>
<div
  class="exchange__error js-exchange-error js-exchange-error-from"
>
</div>
  </div>
  <div
class="reset-btn change__arrow js-change-button is_fix_mode-js"
@click="swapCurrencies"
  >
<svg
  width="18"
  height="18"
  viewBox="0 0 18 18"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
fill-rule="evenodd"
clip-rule="evenodd"
class="reverse_button_svg"
d="M15.75 5.25C15.75 5.66421 15.4142 6 15 6L4.81066 6L6.53033 7.71967C6.82322 8.01256 6.82322 8.48744 6.53033 8.78033C6.23744 9.07322 5.76256 9.07322 5.46967 8.78033L2.46967 5.78033C2.17678 5.48744 2.17678 5.01256 2.46967 4.71967L5.46967 1.71967C5.76256 1.42678 6.23744 1.42678 6.53033 1.71967C6.82322 2.01256 6.82322 2.48744 6.53033 2.78033L4.81066 4.5L15 4.5C15.4142 4.5 15.75 4.83579 15.75 5.25ZM15.5303 12.2197C15.8232 12.5126 15.8232 12.9874 15.5303 13.2803L12.5303 16.2803C12.2374 16.5732 11.7626 16.5732 11.4697 16.2803C11.1768 15.9874 11.1768 15.5126 11.4697 15.2197L13.1893 13.5L3 13.5C2.58579 13.5 2.25 13.1642 2.25 12.75C2.25 12.3358 2.58579 12 3 12L13.1893 12L11.4697 10.2803C11.1768 9.98744 11.1768 9.51256 11.4697 9.21967C11.7626 8.92678 12.2374 8.92678 12.5303 9.21967L15.5303 12.2197Z"
fill="#BFBFBF"
  ></path>
</svg>
  </div>
  <div class="change__block js-second-block">
<div class="change__prop">Вы получаете</div>
<div class="change__unit">
  <div class="change__info">
<input
  name="amount-to"
  id="amount-to"
  class="reset-input change__value change__input target exchange__input js-onlyNumbers js-exchange-input js-exchange-to"
  placeholder="..."
  v-model="amountTo"
  @blur="markAmountToTouched"
/>
  </div>
  <div class="dropdown change__dropdown">
<div
  class="reset-btn dropdown__button change__currency-button js-second-currency js-show-popup"
  data-currency="XMR"
  data-popup="search"
  style="display: flex; align-items: center; gap: 4px;"
  @click="openSearchModal('to')"
>
  <img :src="'/coins/'+formatCoin(selectedToCurrency)+'.png'" alt="" srcset="" style="width: 20px; height: 20px; flex-shrink: 0;">
  <span :class="['currency', 'currency_' + ((selectedToCurrency.code || 'XMR').toLowerCase())]">{{ selectedToCurrency.code || 'XMR' }}</span>
</div>
  </div>
</div>
<div class="change__unit">
  <div class="change__prop change__prop_lower">
Все комиссии включены
  </div>
  <div class="change__network">{{ selectedToCurrency.code }}</div>
</div>
  </div>
</div>
<div
  class="main__col change__address field is_fix_mode-js"
  id="destination_address_block"
  :class="{ 'has-error': formErrors.account }"
>
  <div class="change__prop">Ваш {{ selectedToCurrency.code || 'адрес' }} адрес</div>
  <div class="input_camera__wrapper">
<input
  name="destinationAddress"
  id="destination_address"
  class="reset-input change__value change__input check-field dist_address_plh"
  :placeholder="`Введите ваш ${selectedToCurrency.code || ''} адрес`"
  data-currency=""
  v-model="account"
  @blur="markAccountTouched"
/>

  </div>
  <div class="popup qr-code js-camera-pop-up">
<div class="camera_pop__overflow">
  <div class="video__block">
<div class="popup__header qr-code__header">
  <span class="popup__title qr-code__title"
>Отсканируйте QR-код</span
  >
  <button
type="button"
class="reset-btn popup__close qr_code_close"
  >
<svg
  class="popup__close-icon"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 25"
>
  <path
d="M5.293 5.965a1 1 0 0 1 1.414 0L12 11.258l5.293-5.293a1 1 0 1 1 1.414 1.414l-5.293 5.293 5.293 5.293a1 1 0 0 1-1.414 1.414L12 14.086 6.707 19.38a1 1 0 0 1-1.414-1.414l5.293-5.293L5.293 7.38a1 1 0 0 1 0-1.414Z"
fill="currentColor"
  ></path>
</svg>
  </button>
</div>
<div id="reader" class="camera_reader"></div>
<svg style="position: absolute" width="0" height="0">
  <mask id="mask" maskContentUnits="objectBoundingBox">
<rect width="1" height="1" fill="white"></rect>
<rect
  x="0"
  y="0"
  width="1"
  height="1"
  rx="0.1"
  fill="black"
></rect>
  </mask>
</svg>
  </div>
</div>
  </div>
  <div v-if="formErrors.account" class="change__error">{{ formErrors.account }}</div>
</div>
<div class="change__row is_fix_mode-js">
  <div
class="main__col change__col field"
:class="{ 'has-error': formErrors.memo }"
id="destination_tag_block"
v-if="showMemoField"
  >
<div class="change__prop order-field-header">Memo / Tag</div>
<input
  class="reset-input change__value change__input"
  name="destinationTag"
  id="destination_tag"
  placeholder="Введите Memo / Tag"
  v-model="memo"
  @blur="markMemoTouched"
/>
<div v-if="formErrors.memo" class="change__error">{{ formErrors.memo }}</div>
  </div>
  <div class="main__col change__col field" :class="{ 'has-error': formErrors.phone }">
<div class="change__prop">Телефон</div>
<input
  class="reset-input change__value change__input input_font-size_brp"
  type="tel"
  id="phone"
  placeholder="Введите номер телефона"
  name="phone"
  v-model="phone"
  @blur="markPhoneTouched"
/>
<div v-if="formErrors.phone" class="change__error">{{ formErrors.phone }}</div>
  </div>
  <div class="main__col change__col field" :class="{ 'has-error': formErrors.email }">
<div class="change__prop">Email</div>
<input
  class="reset-input change__value change__input input_font-size_brp"
  type="email"
  id="email"
  placeholder="Введите адрес почты"
  name="email"
  v-model="email"
  @blur="markEmailTouched"
/>
<div v-if="formErrors.email" class="change__error">{{ formErrors.email }}</div>
  </div>
</div>


<div class="change__footer">
  <div class="hidden" id="from_tag__checkbox">
<label
  class="checkbox checkbox_blue checkbox_small change__agree_tag"
>
  <input
class="checkbox__input"
type="checkbox"
value="agree"
  />
  <span class="checkbox__custom"></span>
  <span class="checkbox__block">
Я осведомлён о необходимости указывать тег/мемо при переводе
средств
  </span>
</label>
  </div>
  <label
class="checkbox checkbox_blue checkbox_small change__agree is_fix_mode-js"
:class="{ 'has-error': formErrors.agree }"
  >
<input class="checkbox__input" type="checkbox" value="agree" v-model="agreeChecked" />
<span class="checkbox__custom"></span
><span class="checkbox__block"
  >Я согласен с&nbsp;<a
href="/docs/privacy-policy"
target="_blank"
>Политикой конфиденциальности</a
  >,&nbsp;<a href="/docs/kyc" target="_blank"
>Политикой AML/KYC</a
  >
  и&nbsp;<a href="/docs/terms" target="_blank"
>Правилами пользования сервисом</a
  ></span
>
  </label>
  <div v-if="formErrors.agree" class="change__error">{{ formErrors.agree }}</div>
  <button
class="button exchange-button js-exchange-button"
:class="{ 'button--loading': isSubmitting }"
:disabled="hasBlockingErrors || isSubmitting"
  >
<span>Создать обмен</span
><span class="loading loading-4">
  <span class="loading-4-dot loading-4-span1"></span>
  <span class="loading-4-dot loading-4-span2"></span>
  <span class="loading-4-dot loading-4-span3"></span>
</span>
  </button>
</div>
  </form>
  <div v-if="isSearchModalOpen" class="popup js-popup active" data-popup="search">
<div class="popup__content">
  <div class="popup__top">
<div class="popup__title">Выберите монету</div>
<button class="reset-btn popup__close" @click="closeSearchModal">
  <img
src="/xgram/images/icons/close.svg"
width="24"
height="24"
  />
</button>
  </div>


  <div class="search js-search active">
<div class="search__block">
  <div class="search__text">Выберите криптовалюту</div>
  <div class="search__input-wrapper">
<input
  class="reset-input search__input"
  placeholder="Найти монету"
  v-model="searchQuery"
/>
  </div>
</div>
  </div>
  <div class="search__items js-search-items" style="display: flex; flex-wrap: wrap; gap: 10px; height: fit-content;">
<button v-for="coin in filteredCryptoCurrencies" :key="coin.key"
style="background: #2c2c2e; !important; border-radius: 12px;"
  class="reset-btn search__item js-search-button"
  @click="handleCoinSelect(coin)"
>
  <span class="currency currency_big" style="items-align: center;">
<img :src="'/coins/'+ formatCoin(coin)+'.png'" style="width: 24px; height: 24px; flex-shrink: 0;" alt="">
<span class="currency__info">
  <span class="currency__name">{{ coin.code }}</span>
</span>
<span v-if="coin.network" class="currency__label">{{ coin.network }}</span>
  </span>
</button>

  </div>
</div>
  </div>
</div>


  </div>
</section>
  </div>
  <div class="container">
<section class="section about" id="about_us">
  <div class="about__block">
<div class="about__desc">
  <h2 class="section__title section__title_left about__title">
{{ name_exchange }}
  </h2>
  <div class="about__text">
{{ name_exchange }} — платформа для обмена криптовалюты, ориентированная на работу
c мультичейн токенами. Наша главная цель — обеспечить пользователям
удобный и быстрый обмен токенов. Операции на нашем сайте проходят
без задержек, с минимальными комиссиями и высоким уровнем
ликвидности.
  </div>
</div>
<div class="about__image">
  <img src="/xgram/images/about-xgram.png" alt="О нас" height="300" />
</div>
  </div>
  <div class="about__block">
<div class="about__image">
  <img
src="/xgram/images/about-bridge.png"
alt="О нашей платформе обмена"
  />
</div>
<div class="about__desc">
  <h2 class="section__title section__title_left about__title">
Преимущества CEX, сохраняя DEX стандарты
  </h2>
  <div class="about__text">
На рынке криптовалют существует два ключевых типа бирж —
централизованные (CEX) и децентрализованные (DEX). Криптобиржа CEX
гарантирует высокую ликвидность. DEX обеспечивает децентрализацию и
полную анонимность операций. {{ name_exchange }} сочетает преимущества обеих
моделей, предоставляя пользователям лучшие условия для обмена
токенов.
  </div>
</div>
  </div>
  <div class="about__block">
<div class="about__desc">
  <h2 class="section__title section__title_left about__title">
Простота и безопасность
  </h2>
  <div class="about__text">
Наша платформа поддерживает взаимодействие с ведущими DEX и CEX
биржами, гарантируя лёгкость перемещения активов между ними.
Благодаря команде разработчиков, обладающей успешным бэкграундом в
web3, мы легко обеспечиваем поддержку централизованных и
децентрализованных решений. Теперь не нужно выбирать между
безопасностью и ликвидностью — с {{ name_exchange }} вы получаете лучшее от обоих
миров. Наша платформа одна из самых гибких и удобных для
пользователей!
  </div>
</div>
<div class="about__image">
  <img
src="/xgram/images/about-safe.png"
alt="Безопасный и простой обмен"
height="386"
  />
</div>
  </div>
</section>
<section class="features section">
  <div>
<h2 class="section__title">
  Мгновенные безопасные обмены и анонимность
</h2>
  </div>
  <div class="features__items">
<div class="features__item">
  <img
class="features_item__img"
src="/xgram/images/feature-safe.svg"
alt=""
  />
  <div class="section__name features__name">Безопасный перевод</div>
  <div class="section__text features__text">
Все переводы на платформе {{ name_exchange }} защищены посредством
криптографических алгоритмов, которые гарантируют их полную
безопасность. Мы используем только проверенные протоколы,
обеспечивая надёжные транзакции без риска взломов.
  </div>
</div>
<div class="features__item">
  <img
class="features_item__img"
src="/xgram/images/feature-anonim.svg"
alt=""
  />
  <div class="section__name features__name">Анонимность</div>
  <div class="section__text features__text">
Ваши данные и операции остаются конфиденциальными благодаря
использованию принципов децентрализации. {{ name_exchange }} гарантирует, что
информация о транзакциях не будет раскрыта третьим лицам. Нашей
платформой пользуются трейдеры, которые ценят свою приватность в
мире цифровых активов.
  </div>
</div>
<div class="features__item">
  <img
class="features_item__img"
src="/xgram/images/feature-liquid.svg"
alt=""
  />
  <div class="section__name features__name">Ликвидность</div>
  <div class="section__text features__text">
Платформа {{ name_exchange }} объединяет собственную ликвидность и ликвидность
CEX, что позволяет обрабатывать большие объёмы транзакций без
задержек. Независимо от выбранной криптовалюты, {{ name_exchange }} гарантирует
мгновенный обмен по наиболее выгодным курсам.
  </div>
</div>
<div class="features__item">
  <img
class="features_item__img"
src="/xgram/images/feature-support.svg"
alt=""
  />
  <div class="section__name features__name">Оперативная поддержка</div>
  <div class="section__text features__text">
Наша служба поддержки работает с 10 до 22 по московскому времени, обеспечивая
оперативную помощь по всем вопросам. Независимо от сложности
ситуации — мы гарантируем профессиональное сопровождение на каждом
этапе работы с платформой.
  </div>
</div>
  </div>
</section>
  </div>
  <div class="shape-bg">
<div class="container">
  <section class="steps section" id="how_it_works">
<div class="section__top">
  <h2 class="section__title">Простые шаги для быстрого обмена</h2>
  <div class="section__promo-text">
Для обмена криптовалют онлайн на {{ name_exchange }} достаточно следовать
нескольким простым шагам:
  </div>
</div>
<ol class="reset-list steps__items">
  <li class="steps__item">
<div class="steps__desc">
  <div class="section__name steps__name">Выбор криптовалюты</div>
  <div class="section__text steps__text">
Выберите криптовалюты, которые хотите обменять. На {{ name_exchange }}
поддерживаются все популярные цифровые активы: биткойн, эфириум,
альткойны, токены TON и другие. Затем нужно нажать на кнопку
«Создать обмен»
  </div>
</div>
  </li>
  <li class="steps__item">
<div class="steps__desc">
  <div class="section__name steps__name">Ввод адреса</div>
  <div class="section__text steps__text">
Для обмена криптовалюты необходимо ввести адрес, на который
будут отправлены средства. Убедитесь, что вы вводите правильный
адрес, так как транзакции в блокчейне необратимы, и любые ошибки
могут привести к потере средств
  </div>
</div>
<img
  class="steps__image"
  src="/xgram/images/steps-two.png"
  alt="Второй шаг обмена"
  height="189"
/>
  </li>
  <li class="steps__item">
<img
  class="steps__image"
  src="/xgram/images/steps-three.png?v=2"
  alt="Третий шаг обмена"
  height="289"
/>
<div class="steps__desc">
  <div class="section__name steps__name">Внесение депозита</div>
  <div class="section__text steps__text">
Для обмена необходим отправить требуемое количество цифровых
активов на указанный адрес. Все комиссии на {{ name_exchange }} прозрачны, без
скрытых платежей или дополнительных сборов
  </div>
</div>
  </li>
  <li class="steps__item">
<div class="steps__desc">
  <div class="section__name steps__name">
Получение криптовалюты
  </div>
  <div class="section__text steps__text">
После подтверждения средства мгновенно поступят на указанный
вами кошелек. Об этом будет свидетельствовать статус «Завершен».
Благодаря скорости и надежности операций {{ name_exchange }} выбирают
трейдеры, которые ценят время и хотят избежать задержек
  </div>
</div>
  </li>
</ol>
  </section>
  <section class="choose section">
<div class="container">
  <div class="choose__wrapper">
<div class="choose__desc">
  <h2 class="section__title choose__title">
Обменивай на любом<br />устройстве
  </h2>
  <div class="section__promo-text choose__promo-text">
<p>
  С {{ name_exchange }} можно проводить обмены на любом устройстве — от
  компьютеров до смартфонов. Наш онлайн-обменник адаптирован под
  все типы устройств. Поэтому он позволяет легко и удобно
  проводить операции с криптовалютами, где бы вы ни находились.
  Также наши пользователи могут рассчитывать на мониторинг
  лучших курсов.
</p>
<p>
  Мы предлагаем удобный интерфейс, который одинаково хорошо
  работает в мобильной версии и на десктопе. Это делает {{ name_exchange }}
  универсальной платформой, которая подходит как для новичков,
  так и для опытных трейдеров. Наш электронный обменник
  обеспечивает полный контроль над вашими активами на любом
  устройстве.
</p>
  </div>
</div>
<div class="choose__image">
  <img
src="/xgram/images/choose.png?v=4"
width="683"
alt="Менять можно на разных устройствах"
  />
</div>
  </div>
</div>
  </section>
</div>
  </div>

  <div class="container">
<section class="questions section" id="faq">
  <div class="section__top">
<h2 class="section__title">Ответы на часто задаваемые вопросы</h2>
  </div>
  <div class="questions__items">
<div class="questions__item tabs show">
  <button class="reset-btn questions__button js-tabs-button">
<span>Как выбрать лучший курс для обмена?</span>
  </button>
  <div class="questions__text tabs__content">
{{ name_exchange }} работает только с лучшими курсами на обмен, поэтому ваша
транзакция произойдет с минимальными потерями. Наши клиенты получают
лучшие условия для обмена.
  </div>
</div>
<div class="questions__item tabs">
  <button class="reset-btn questions__button js-tabs-button">
<span>Какую комиссию взимает платформа?</span>
  </button>
  <div class="questions__text tabs__content">
Комиссия на платформе {{ name_exchange }} минимальна. Она зависит от выбранной
валютной пары и объёма транзакции. Мы предлагаем прозрачные условия
без скрытых платежей.
  </div>
</div>
<div class="questions__item tabs">
  <button class="reset-btn questions__button js-tabs-button">
<span>Какие криптовалюты поддерживаются для обмена?</span>
  </button>
  <div class="questions__text tabs__content">
На {{ name_exchange }} поддерживается огромный выбор цифровых активов: биткойн,
эфириум, токены TON и другие. С полным списком вы можете
ознакомиться в нашем калькуляторе.
  </div>
</div>
<div class="questions__item tabs">
  <button class="reset-btn questions__button js-tabs-button">
<span>Как обеспечивается безопасность моих транзакций?</span>
  </button>
  <div class="questions__text tabs__content">
{{ name_exchange }} использует продвинутые методы криптографии, гарантируя защиту
данных и транзакций. Мы гарантируем полную безопасность всех
операций.
  </div>
</div>
<div class="questions__item tabs">
  <button class="reset-btn questions__button js-tabs-button">
<span>Как долго обрабатываются заявки на вывод средств?</span>
  </button>
  <div class="questions__text tabs__content">
Все заявки на вывод средств обрабатываются мгновенно благодаря нашей
системе, которая гарантирует высокую ликвидность и надёжность
выполнения транзакций.
  </div>
</div>
  </div>
</section>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.global-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(5px);
}

.hexch_submit {
  position: relative;
  overflow: hidden;
}

.hexch_submit:disabled {
  opacity: 0.7;
  cursor: wait;
}
</style>
<style scoped>
.has-error .js_sum_val {
  border-color: #e74c3c !important;
  box-shadow: 0 0 0 1px rgba(231, 76, 60, 0.15);
}

.js_error.js_sum1_error,
.js_error.js_phone_error,
.js_error.js_cf6_error,
.js_error.js_account2_error {
  color: #e74c3c;
}

.hexch_pers_label_ins,
.hexch_curs_label_ins {
  padding-bottom: 5px;
}

@media (max-width: 768px) {
  .hometext-wrapper {
padding-top: 150px !important;
  }
}
</style>
