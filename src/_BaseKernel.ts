import { LogModule } from "./modules/Log"

export abstract class _BaseKernel<T, C> {
  private _config: C

  constructor(
    DerivedKernel: new (...a: any[]) => T,
    _config: any,
    readonly _logger?: LogModule
  ) {
    this._config = _config as C

    if (!this._logger && _config.logger)
      _config.logger.origin =
        _config.logger.origin ?? `#${new Date().getTime()}`
    this._logger = new LogModule(_config.logger)

    this.logger?.quiet(`<- ${DerivedKernel.name}`)
  }

  abstract boot(): Promise<boolean> // true for errorless boot
  abstract halt(): Promise<boolean> // true for errorless halt

  get config(): C {
    return this._config as C
  }

  get logger() {
    return this._logger
  }
}
