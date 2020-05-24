import { LogModule } from "../modules/Log"

export class GracefulSignalShutdown {
  private _shuttingDown: boolean = false

  constructor(
    signals: Array<"SIGINT" | "SIGTERM">,
    promiseFns: Array<() => Promise<any>> = [],
    logger?: LogModule
  ) {
    const handler = (signal: string) => {
      if (this._shuttingDown) return
      else this._shuttingDown = true

      logger?.newLine()
      logger?.warn(`Received ${signal}. Shutting down...`)

      Promise.all(promiseFns.map((fn) => fn()))
        .then((exitStatuses) => {
          if (exitStatuses.some((eS) => !eS)) {
            throw new Error("Process exited with errors!")
          }

          logger?.quiet("Process exited with no errors.")
          process.exit(0)
        })
        .catch((err) => {
          logger?.error(err.message)
          process.exit(1)
        })
    }

    signals.forEach((signal) => process.on(signal, handler))
  }
}
