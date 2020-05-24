import {
  Server as SocketIOServer,
  Socket as SocketIOSocket,
  listen,
  ServerOptions as SocketIOServerOptions
} from "socket.io"
import { Server as HttpServer, createServer } from "http"
import { LogModule, LogModuleConfig } from "../modules/Log"
import { _BaseKernel } from "../_BaseKernel"
import { ExpressKernel } from "./Express"
import { SocketIONamespace } from "../components/SocketIONamespace"
import normalizePath from "normalize-path"

export type SocketIOKernelConfig = {
  id?: string
  logger?: LogModuleConfig
  httpServerOptions?: {
    port: number
  }
  options: Partial<SocketIOServerOptions>
}

export class SocketIOKernel extends _BaseKernel<
  SocketIOKernel,
  SocketIOKernelConfig
> {
  private _httpServer?: HttpServer
  private _io: SocketIOServer

  constructor(
    config: SocketIOKernelConfig,
    socketIONamespaces: SocketIONamespace[],
    expressKernel?: ExpressKernel,
    logger?: LogModule
  ) {
    super(SocketIOKernel, config, logger)

    // if path doesn't begin with a "/", SocketIO misbehaves
    // this fixes that
    if (this.config.options.path) {
      this.config.options.path = normalizePath(`/${this.config.options.path}`)
    }

    if (expressKernel) {
      if (expressKernel.httpServer.listening)
        throw new Error("Target HTTP server is already listening!")

      this._io = listen(expressKernel.httpServer, this.config.options)
      this.logger?.success(
        `Bound to <${expressKernel.config.logger?.origin}>${
          this.config.options.path ? ` at ${this.config.options.path}` : ""
        }`
      )
    } else {
      if (!this.config.httpServerOptions)
        throw new Error(
          "Attempted to listen on an instance with no HTTP server attached, and no http server config for spawning an internal HTTP server!"
        )

      this._httpServer = createServer()
      this.logger?.success(
        `Bootstrapped to internal HTTP server${
          this.config.options.path ? ` at ${this.config.options.path}` : ""
        }`
      )
      this._io = listen(this._httpServer, this.config.options)
    }

    for (const socketIONamespace of socketIONamespaces) {
      const nsp = normalizePath(`/${socketIONamespace.name}`)

      for (const middleware of socketIONamespace.preConnectionMiddleware ??
        []) {
        this._io.of(nsp).use(middleware)
      }

      for (const listener of socketIONamespace.listeners) {
        this._io.of(nsp).on("connection", (socket: SocketIOSocket) => {
          socket.on(listener.event, (...args: any[]) => {
            listener.handler(socket, this._io.of(nsp))(...args)
          })
        })
      }
    }
  }

  public use(
    middleware: (socket: SocketIOSocket, fn: (err?: any) => void) => void
  ) {
    this._logger?.info(
      `use ${middleware.prototype.constructor.name || "..."}(...)`
    )
    this._io.use(middleware)
    return this
  }

  boot(): Promise<any> {
    this._logger?.info("boot")
    return new Promise(async (resolve) => {
      try {
        if (this._httpServer) {
          this._httpServer.listen(this.config.httpServerOptions!.port, () => {
            this.logger?.success(
              `${this.config.logger?.origin} listening on ${
                this.config.httpServerOptions!.port
              }`
            )
            resolve(true)
          })
        } else {
          this._logger?.error(
            "Instance is attached to an external HTTP server. Listen from there!"
          )
          return resolve(false)
        }
      } catch (e) {
        this._logger?.error(`${e.name}: ${e.message}`)
        resolve(false)
      }
    })
  }

  halt(): Promise<any> {
    this._logger?.warn("halt")
    return new Promise(async (resolve) => {
      try {
        this._io.close(() => {
          resolve(true)
        })
      } catch (e) {
        this.logger?.error(`${e.name}: ${e.message}`)
        resolve(false)
      }
    })
  }

  get httpServer() {
    return this._httpServer
  }

  get io() {
    return this._io
  }
}
