import { Server as SocketIOServer, Socket as SocketIOSocket } from "socket.io"

type SocketIOMiddleware = (socket: SocketIOSocket, next: any) => void

type SocketIOListener = {
  event: string
  handler: (...args: any[]) => any
}

export class SocketIONamespace {
  constructor(
    private readonly _name: string,
    private readonly _listeners: SocketIOListener[],
    private readonly _middlewares?: {
      preConnection?: SocketIOMiddleware[]
      postConnection?: SocketIOMiddleware[]
    }
  ) {}

  public attachListeners(server: SocketIOServer, socket: SocketIOSocket) {
    for (const listener of this._listeners) {
      server.on(listener.event, listener.handler(socket, server))
    }
  }

  get name() {
    return this._name
  }

  get preConnectionMiddleware() {
    return this._middlewares?.preConnection
  }

  get postConnectionMiddleware() {
    return this._middlewares?.postConnection
  }

  get listeners() {
    return this._listeners
  }
}
