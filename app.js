new Vue({
  el: "#app",

  data: {
    rates: [],
    currencies: {},
    amount: 0,
    from: "USD",
    to: "EUR",
    result: 0,
    base: "",
    crypto_rates: [],
    crypto_currencies: {},
    crypto_amount: 0,
    crypto_price: 0,
    crypto_symbols: [],
    crypto_symbols_to: [],
    from_crypto: "BTC",
    to_crypto: "USD",
  },

  created: function () {
    this.getBase();
    this.getCurrencies();
    this.getCryptoCurrencies();
  },

  computed: {
    formattedCurrencies() {
      return Object.keys(this.currencies).sort();
    },
    calculateResult() {
      return (Number(this.amount) * this.result).toFixed(4);
    },
    disabled() {
      return this.amount === 0 || !this.amount;
    },
    formattedCryptoCurrenciesFrom() {
      let all_crypto_symbols = Object.values(this.crypto_currencies);

      for (key in all_crypto_symbols) {
        let crypto_s = all_crypto_symbols[key].symbol;
        if (crypto_s.endsWith("USDT")) {
          this.crypto_symbols.push(crypto_s.substr(0, 3));
        }
      }
      this.crypto_symbols.sort();

      let i = 0;
      while (i < this.crypto_symbols.length) {
        if (this.crypto_symbols[i] === this.crypto_symbols[i + 1]) {
          this.crypto_symbols.splice(i, 1);
        } else {
          ++i;
        }
      }

      return this.crypto_symbols;
    },
    formattedCryptoCurrenciesTo() {
      let all_crypto_symbols = Object.values(this.crypto_currencies);
      this.crypto_symbols_to = [];
      for (key in all_crypto_symbols) {
        let crypto_s = all_crypto_symbols[key].symbol;
        if (crypto_s.startsWith(this.from_crypto)) {
          this.crypto_symbols_to.push(crypto_s.substr(3, crypto_s.length));
        }
      }
      return this.crypto_symbols_to;
    },
    calculateCryptoResult() {
      return (Number(this.crypto_amount) * this.crypto_price).toFixed(4);
    },
  },
  methods: {
    getCurrencies() {
      const currencies = localStorage.getItem("curencies");
      if (currencies) {
        this.currencies = JSON.parse(currencies);
        return;
      }

      axios.get("https://api.exchangeratesapi.io/latest/").then((response) => {
        this.currencies = response.data.rates;
        localStorage.setItem("currencies", JSON.stringify(response.data.rates));
        this.currencies[this.base] = 1;
      });
    },
    convertCurrency() {
      let rate_from_currency = this.currencies[this.from];
      let rate_to_currency = this.currencies[this.to];
      if (rate_from_currency <= rate_to_currency)
        this.result = rate_to_currency * rate_from_currency;
      else {
        this.result = rate_to_currency / rate_from_currency;
      }
    },
    getBase() {
      axios.get("https://api.exchangeratesapi.io/latest/").then((response) => {
        this.base = response.data.base;
      });
    },

    getCryptoCurrencies() {
      const crypto_currencies = localStorage.getItem("crypto_curencies");
      if (crypto_currencies) {
        this.crypto_currencies = JSON.parse(crypto_currencies);
        return;
      }

      axios
        .get("https://api.binance.com/api/v3/ticker/price")
        .then((response) => {
          this.crypto_currencies = response.data;
          localStorage.setItem(
            "crypto_currencies",
            JSON.stringify(response.data.crypto_rates)
          );
        });
    },

    convertCryptoCurrency() {
      this.crypto_price = 0;
      for (key in this.crypto_currencies) {
        let crypto_position_t = this.crypto_currencies[key].symbol.indexOf(
          this.from_crypto.concat(this.to_crypto).concat("T")
        );
        if (crypto_position_t >= 0) {
          this.crypto_price = Object.values(this.crypto_currencies)[key].price;
          break;
        }
      }

      if (this.crypto_price === 0) {
        for (key in this.crypto_currencies) {
          let crypto_position = this.crypto_currencies[key].symbol.indexOf(
            this.from_crypto.concat(this.to_crypto)
          );
          if (crypto_position >= 0) {
            this.crypto_price = Object.values(this.crypto_currencies)[
              key
            ].price;
            break;
          }
        }
      }
    },
  },
});
