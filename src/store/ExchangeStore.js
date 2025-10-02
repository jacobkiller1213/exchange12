import { ref, computed } from "vue";
import { ExchangerService } from "@/api/api";

export function useExchangeStore() {
  const currencyFrom = ref("");
  const currencyTo = ref("");
  const amountFrom = ref("");
  const amountTo = ref("");
  const exchangeRate = ref("");
  const minAmount = ref("");
  const minAmounts = ref([])
  const rates = ref([]);
  const loading = ref(false);
  const exchangerService = new ExchangerService(
    import.meta.env.VITE_EXCHANGER_API
  );

  async function getRates() {
    try {
      loading.value = true;
      const response = await exchangerService.getAllCurrencyPairs();
      console.log(response);
      rates.value = response.rates || [];
    } catch (error) {
      console.error("Ошибка получения курсов:", error);
      rates.value = [];
    } finally {
      loading.value = false;
    }
  }

  const fiatCodes = [
    "RUB",
    "USD",
    "EUR",
    "KZT",
    "UZS",
    "TJS",
    "TMT",
    "KGS",
    "UAH",
    "GBP",
    "CNY",
    "JPY",
    "TRY",
    "SBERRUB",
    "TINKOFFRUB",
    "SBPRUB",
  ];

  const allCurrencyOptions = computed(() => {
    return rates.value.map((rate) => {
      const code = rate.code;
      const network = rate.network;
      const networkSuffix = network ? ` (${network})` : "";
      const iconPath = `/images/coins/icons/${code.toLowerCase()}.svg`;

      return {
        key: rate.id,
        label: `${code}${networkSuffix}`,
        description: `Курс: ${parseFloat(rate.rate).toLocaleString()}`,
        icon: iconPath,
        code: code,
        network: network,
        rate: rate.rate,
        currency_from: rate.code + (rate.network ? `${rate.network}` : ""),
        currency_to: rate.code + (rate.network ? `${rate.network}` : ""),
      };
    });
  });

  const currencyOptions = computed(() => {
    return allCurrencyOptions.value.filter((currency) => {
      return !fiatCodes.includes(currency.code);
    });
  });

  const cryptoCurrencies = computed(() => {
    return currencyOptions.value;
  });

  const fiatCurrencies = computed(() => {
    return allCurrencyOptions.value.filter((currency) =>
      fiatCodes.includes(currency.code)
    );
  });
  async function createOrder(order) {
    try {
      const result = await exchangerService.createOrder(order);
      console.log("Результат создания заказа:", result);
      // Нормализуем ответ, чтобы вернуть { success, data | error }
      if (result && result.data) {
        return { success: true, data: result.data };
      }
      if (result && result.id) {
        return { success: true, data: result };
      }
      return {
        success: !!result?.success,
        data: result?.data,
        error: result?.error || "Не удалось создать ордер",
      };
    } catch (error) {
      console.error("Ошибка создания заказа:", error);
      return { success: false, error: error.message || "Ошибка создания ордера" };
    }
  }

  async function getOrder(orderId) {
    try {
      const result = await exchangerService.getOrder(orderId);
      console.log("Данные заказа:", result);

      // Normalize the response format
      if (result && result.data) {
        return {
          success: true,
          data: result.data
        };
      } else if (result && result.id) {
        // If the result is directly the order object
        return {
          success: true,
          data: result
        };
      } else {
        return {
          success: false,
          error: 'Не удалось загрузить данные ордера'
        };
      }
    } catch (error) {
      console.error("Ошибка получения заказа:", error);
      return {
        success: false,
        error: error.message || 'Произошла ошибка при загрузке данных ордера'
      };
    }
  }
  async function calculateExchange() {
    if (!currencyFrom.value || !currencyTo.value || !amountFrom.value) return;

    try {
      loading.value = true;
      const fromCurrency = allCurrencyOptions.value.find(
        (r) => r.key === currencyFrom.value
      );
      const toCurrency = allCurrencyOptions.value.find(
        (r) => r.key === currencyTo.value
      );

      if (fromCurrency && toCurrency) {
        console.log('import.meta.env.VITE_EXCHANGER_ID', import.meta.env.VITE_EXCHANGER_ID);
        const result = await exchangerService.calculateExchange({
          exchangerId: import.meta.env.VITE_EXCHANGER_ID,
          currencyFrom: fromCurrency.currency_from,
          currencyTo: toCurrency.currency_from,
          amountFrom: parseFloat(amountFrom.value),
        });
        console.log(result);
        if (result.success) {
          amountTo.value = result.data.amount_to;
          exchangeRate.value = result.data.exchange_rate;
        }
      }
    } catch (error) {
      console.error("Ошибка расчета:", error);
    } finally {
      loading.value = false;
    }
  }

  async function calculateExchangeReverse() {
    if (!currencyFrom.value || !currencyTo.value || !amountTo.value) return;

    try {
      loading.value = true;
      const fromCurrency = allCurrencyOptions.value.find(
        (r) => r.key === currencyFrom.value
      );
      const toCurrency = allCurrencyOptions.value.find(
        (r) => r.key === currencyTo.value
      );

      if (fromCurrency && toCurrency) {
        const result = await exchangerService.calculateExchange({
          exchangerId: import.meta.env.VITE_EXCHANGER_ID,
          currencyFrom: fromCurrency.currency_from,
          currencyTo: toCurrency.currency_from,
          amountTo: parseFloat(amountTo.value),
        });
        console.log(result);
        if (result.success) {
          amountFrom.value = result.data.amount_from;
          exchangeRate.value = result.data.exchange_rate;
        }
      }
    } catch (error) {
      console.error("Ошибка обратного расчета:", error);
    } finally {
      loading.value = false;
    }
  }
  function getRateById(id) {
    return allCurrencyOptions.value.find((r) => r.key === id);
  }
  async function getMinAmounts() {
    try {
      const result = await exchangerService.getAllMinAmounts(import.meta.env.VITE_EXCHANGER_ID);
      minAmounts.value = result.data || result;
    } catch (error) {
      console.error("Ошибка получения минимальных сумм:", error);
      minAmounts.value = {};
    }
  }
  function swapCurrencies() {
    const tempFrom = currencyFrom.value;
    const tempAmountFrom = amountFrom.value;

    currencyFrom.value = currencyTo.value;
    currencyTo.value = tempFrom;

    amountFrom.value = amountTo.value;
    amountTo.value = tempAmountFrom;

    calculateExchange();
  }

  return {
    currencyFrom,
    currencyTo,
    amountFrom,
    amountTo,
    exchangeRate,
    minAmount,
    minAmounts,
    rates,
    loading,
    allCurrencyOptions,
    currencyOptions,
    cryptoCurrencies,
    fiatCurrencies,
    getRates,
    calculateExchange,
    calculateExchangeReverse,
    swapCurrencies,
    getRateById,
    getMinAmounts,
    createOrder,
    getOrder
  };
}
