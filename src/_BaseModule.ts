import { LogModule } from "./modules/Log"

export abstract class _BaseModule<T, C> {
  private _config: C

  constructor(
    DerivedModule: new (...a: any[]) => T,
    _config: any,
    readonly _logger?: LogModule
  ) {
    this._config = _config as C

    if (!this._logger && _config?.logger)
      _config.logger.origin =
        _config.logger.origin ?? `#${new Date().getTime()}`
    this._logger = new LogModule(_config?.logger)

    this.logger?.quiet(`<- ${DerivedModule.name}`)
  }

  get config(): C {
    return this._config as C
  }

  get logger() {
    return this._logger
  }
}
