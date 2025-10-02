class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl || "http://localhost:8000";
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            errorData.message || errorData.error || "Unknown error"
          }`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getRates(exchangerId) {
    return await this.makeRequest(`/api/rates/${exchangerId}`);
  }

  async getAllRates() {
    return await this.makeRequest("/api/rates/get/all");
  }

  async getRatesByCodes(codes) {
    return await this.makeRequest("/api/rates/get", {
      method: "POST",
      body: JSON.stringify({ rates: JSON.stringify(codes) }),
    });
  }

  async getOrder(orderId) {
    return await this.makeRequest(`/api/get_order/${orderId}`);
  }

  async changeOrderStatus(orderId, status) {
    return await this.makeRequest(`/api/change_order_status/${orderId}`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
  }

  async getMinAmount(exchangerId, currency) {
    return await this.makeRequest(
      `/api/get_min_amount/${exchangerId}/${currency}`
    );
  }

  async getAllMinAmounts(exchangerId) {
    return await this.makeRequest(`/api/get_min_amount_all/${exchangerId}`);
  }

   async calculateExchange(data) {
    const { exchangerId, currencyFrom, currencyTo, amountFrom, amountTo } =
      data;
    const payload = {
      exchanger_id: exchangerId,
      currency_from: currencyFrom,
      currency_to: currencyTo,
    };
    console.log('payload', payload);

    if (amountFrom !== undefined) {
      payload.amount_from = amountFrom;
    }
    if (amountTo !== undefined) {
      payload.amount_to = amountTo;
    }

    return await this.makeRequest("/api/calculate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async createOrder(orderData) {
    const {
      exchangerId,
      currencyFrom,
      currencyTo,
      amountFrom,
      amountTo,
      paymentInfo,
      description,
      otherInfo,
    } = orderData;

    const payload = {
      exchanger_id: exchangerId,
      currency_from: currencyFrom,
      currency_to: currencyTo,
      amount_from: amountFrom,
      amount_to: amountTo,
      payment_info: paymentInfo,
    };

    if (description) payload.description = description;
    if (otherInfo) payload.other_info = otherInfo;

    return await this.makeRequest("/api/create_order", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getSpreads() {
    return await this.makeRequest("/api/spreads/get");
  }
}

class ExchangerService extends ApiService {
  async getExchangerRates(exchangerId) {
    try {
      const response = await this.getRates(exchangerId);
      return {
        success: true,
        rates: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async calculateBestRate(currencyFrom, currencyTo, amount, exchangerIds = []) {
    const calculations = [];

    for (const exchangerId of exchangerIds) {
      try {
        const result = await this.calculateExchange({
          exchangerId,
          currencyFrom,
          currencyTo,
          amountFrom: amount,
        });

        if (result.success) {
          calculations.push({
            exchangerId,
            exchangerName: result.data.exchanger_name,
            amountTo: result.data.amount_to,
            exchangeRate: result.data.exchange_rate,
            spreadPercentage: result.data.spread_percentage,
          });
        }
      } catch (error) {
        console.error(`Ошибка расчета для обменника ${exchangerId}:`, error);
      }
    }

    calculations.sort((a, b) => b.amountTo - a.amountTo);

    return {
      success: true,
      bestRate: calculations[0] || null,
      allRates: calculations,
    };
  }

  async createExchangeOrder(orderData) {
    try {
      const minAmount = await this.getMinAmount(
        orderData.exchangerId,
        orderData.currencyFrom
      );

      if (orderData.amountFrom < minAmount) {
        return {
          success: false,
          error: `Минимальная сумма для обмена: ${minAmount} ${orderData.currencyFrom}`,
        };
      }

      const order = await this.createOrder(orderData);

      return {
        success: true,
        order: order.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async trackOrder(orderId) {
    try {
      const order = await this.getOrder(orderId);
      return {
        success: true,
        order,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getAllCurrencyPairs() {
    try {
      const [ratesResponse, spreadsResponse] = await Promise.all([
        this.getAllRates(),
        this.getSpreads(),
      ]);

      let rates = ratesResponse.data;
      const spreads = spreadsResponse.data;
      const fiatCurrencies = [
        'RUB', 'USD', 'EUR', 'KZT', 'UZS', 'TJS', 'TMT', 'KGS', 'UAH', 'GBP',
        'CNY', 'JPY', 'TRY', 'SBERRUB', 'TINKOFFRUB', 'SBPRUB'
      ];

      rates = rates.filter((rate) => {
        const currencyCode = rate.code;
        return !fiatCurrencies.includes(currencyCode);
      });

      const pairs = spreads.map((spread) => ({
        from: spread.currency_from,
        to: spread.currency_to,
        exchangerId: spread.exchanger_id,
        spreadPercentage: spread.spread,
      }));

      return {
        success: true,
        rates,
        pairs,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export {
  ApiService,
  ExchangerService,
};
