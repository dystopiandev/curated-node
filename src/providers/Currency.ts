import { _BaseProvider } from "../_BaseProvider"

const isoCurrencies = require("iso-currencies")

export class Currency {
  constructor(
    readonly id: number,
    readonly symbol: string,
    readonly alpha3: string,
    readonly name: string,
    readonly decimalPlaces: number
  ) {}

  public static init(alpha3: string) {
    const currencyData = isoCurrencies.information(alpha3)
    return currencyData
      ? new Currency(
          currencyData.num,
          currencyData.symbol,
          alpha3,
          currencyData.name,
          currencyData.places
        )
      : null
  }
}

export class CurrencyProvider extends _BaseProvider<CurrencyProvider, {}> {
  protected readonly _currencies: Array<Currency> = []

  constructor() {
    super(CurrencyProvider, {})
    const currencyKeys = Object.keys(isoCurrencies.list())

    for (const currencyKey of currencyKeys) {
      const currency = Currency.init(currencyKey)

      if (currency) this._currencies.push(currency)
    }
  }

  get currencies() {
    return this._currencies
  }
}
