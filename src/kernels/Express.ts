import normalizePath from "normalize-path"
import express, { Application as ExpressApp } from "express"
import cors, { CorsOptions } from "cors"
import { createServer, Server as HttpServer } from "http"
import { LogModule, LogModuleConfig } from "../modules/Log"
import { _BaseKernel } from "../_BaseKernel"
import { ExpressRouterWrapper } from "../components/ExpressRouterWrapper"

export type ExpressKernelConfig = {
  id?: string
  logger?: LogModuleConfig
  host: string
  port: number
  path: string
  cors?: {
    allowedOrigins: string[]
  }
}

export class ExpressKernel extends _BaseKernel<
  ExpressKernel,
  ExpressKernelConfig
> {
  private readonly _expressApp: ExpressApp
  private readonly _httpServer: HttpServer

  constructor(
    config: ExpressKernelConfig,
    private _expressRouterWrappers: ExpressRouterWrapper[],
    logger?: LogModule
  ) {
    super(ExpressKernel, config, logger)
    this._expressApp = express()
    this._httpServer = createServer(this._expressApp)

    // if path doesn't begin with a "/", SocketIO misbehaves
    // this fixes that
    if (this.config.path) {
      this.config.path = normalizePath(`/${this.config.path}`)
    }

    if (this.config.cors) {
      this._expressApp.use(
        cors(
          Object.assign(
            {
              origin: this.config.cors?.allowedOrigins,
              credentials: true
            },
            this.config.cors as CorsOptions
          )
        )
      )
    }
  }

  public static getMiddleware(
    mw: "bodyparser_json" | "bodyparser_urlencoded",
    mwOptions?: any
  ) {
    switch (mw) {
      case "bodyparser_json":
        return express.json()
      case "bodyparser_urlencoded":
        return express.urlencoded(
          Object.assign(
            {
              extended: false
            },
            mwOptions
          )
        )
    }
  }

  public use(...args: any[]) {
    this._logger?.info(
      args
        .map((arg) => `use ${arg.prototype?.constructor.name || "..."}(...)`)
        .join(", ")
    )
    this._expressApp.use(...args)
    return this
  }

  public enable(setting: string) {
    this._logger?.info(`enable "${setting}"`)
    this._expressApp.enable(setting)
    return this
  }

  public disable(setting: string) {
    this._logger?.info(`disable "${setting}"`)
    this._expressApp.disable(setting)
    return this
  }

  public set(setting: string, val: any) {
    this._logger?.info(`set "${setting}" = ${val}`)
    this._expressApp.set(setting, val)
    return this
  }

  public boot() {
    this._logger?.info("boot")
    return new Promise<boolean>(async (resolve) => {
      try {
        for (const expressRouterWrapper of this._expressRouterWrappers) {
          this._expressApp.use(this.config.path, expressRouterWrapper.router)
        }

        this._httpServer.listen(this.config.port, this.config.host, () => {
          this._logger?.success(
            `HTTP server is listening on ${this.config.host}:${
              this.config.port
            }${this.config.path ? ` at ${this.config.path}` : ""}`
          )

          resolve(true)
        })
      } catch (e) {
        this._logger?.error(`${e.name}: ${e.message}`)
        resolve(false)
      }
    })
  }

  public halt() {
    this._logger?.warn("halt")
    return new Promise<boolean>(async (resolve) => {
      if (this.httpServer.listening) {
        this._httpServer.close((err) => {
          if (err) {
            this.logger?.error(`${err.name}: ${err.message}`)
            return resolve(true)
          }

          resolve(false)
        })
      } else resolve(false)
    })
  }

  public get app() {
    return this._expressApp
  }

  public get httpServer() {
    return this._httpServer
  }
}
