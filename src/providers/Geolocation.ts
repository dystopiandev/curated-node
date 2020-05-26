import { Currency } from "./Currency"
import { _BaseProvider } from "../_BaseProvider"
const ld = require("location-database")

export class Continent {
  constructor(
    readonly id: number,
    readonly alpha2: string,
    readonly name: string
  ) {}
}

export class Country {
  readonly primaryCurrency: Currency | null

  constructor(
    readonly id: number,
    readonly alpha2: string,
    readonly alpha3: string,
    readonly name: string,
    readonly nativeName: string,
    readonly capital: string,
    readonly dialCode: string | null,
    readonly emoji: string,
    readonly emojiUnicode: string,
    readonly continentId: number | null,
    readonly primaryCurrencyAlpha3: string
  ) {
    this.primaryCurrency = Currency.init(primaryCurrencyAlpha3)
  }
}

export class State {
  constructor(
    readonly id: number,
    readonly alpha2: string,
    readonly name: string,
    readonly countryId: number | null
  ) {}
}

export class GeolocationProvider extends _BaseProvider<
  GeolocationProvider,
  {}
> {
  protected _continents: Array<Continent> = []
  protected _countries: Array<Country> = []
  protected _states: Array<State> = []
  protected _countryAlpha2IdMap: { [alpha2: string]: number } = {}

  constructor() {
    super(GeolocationProvider, {})
    this._continents.push(
      new Continent(1, "AF", "Africa"),
      new Continent(2, "AN", "Antarctica"),
      new Continent(3, "AS", "Asia"),
      new Continent(4, "EU", "Europe"),
      new Continent(5, "NA", "North America"),
      new Continent(6, "OC", "Oceania"),
      new Continent(7, "SA", "South America")
    )

    const data = ld.getAll()
    const alpha2List = Object.keys(data)

    for (const alpha2 of alpha2List) {
      const country = new Country(
        data[alpha2].id,
        data[alpha2].iso2,
        data[alpha2].iso3,
        data[alpha2].name,
        data[alpha2].native,
        data[alpha2].capital,
        data[alpha2].phone_code
          ? `+${data[alpha2].phone_code.replace(/^(\+)/, "")}`
          : null,
        data[alpha2].emoji,
        data[alpha2].emojiU,
        (
          this._continents.find((c) => c.alpha2 === data[alpha2].continent) || {
            id: null
          }
        ).id,
        data[alpha2].currency
      )

      if (data[alpha2].states) {
        for (const stateData of data[alpha2].states) {
          this._states.push(
            new State(
              stateData.id,
              stateData.state_code,
              stateData.name,
              stateData.country_id
            )
          )
        }
      }

      this._countries.push(country)
      this._countryAlpha2IdMap[alpha2] = data[alpha2].id
    }
  }

  get continents() {
    return this._continents
  }

  get countries() {
    return this._countries
  }

  get states() {
    return this._states
  }

  public getContinentByAlpha2(alpha2: string) {
    return this._continents.find((c) => c.alpha2 === alpha2)
  }

  public getCountryByAlpha2(alpha2: string) {
    return this._countries.find((c) => c.alpha2 === alpha2)
  }

  public getCountryById(id: number) {
    return this._countries.find((c) => c.id === id) ?? null
  }

  public getStatesByCountryAlpha2(alpha2: string) {
    return this._states.filter(
      (s) => s.countryId === this._countryAlpha2IdMap[alpha2]
    )
  }

  public getStateById(id: number) {
    return this._states.find((s) => s.id === id) ?? null
  }
}
