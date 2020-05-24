import expressSessCstor, { SessionOptions } from "express-session"
import { _BaseModule } from "../_BaseModule"
import { LogModule, LogModuleConfig } from "./Log"
import { RedisModule } from "./Redis"
import { Socket as SocketIOSocket } from "socket.io"

export type SessionModuleConfig = {
  id?: string
  logger?: LogModuleConfig
  options: Partial<SessionOptions>
}

/**
 *Uses express-session to offer shared sessions
 *
 * @export
 * @class SessionModule
 * @extends {_BaseModule}
 */
export class SessionModule extends _BaseModule<
  SessionModule,
  SessionModuleConfig
> {
  private readonly _expressSession: any

  constructor(
    config: SessionModuleConfig,
    private readonly _redisProvider: RedisModule,
    logger?: LogModule
  ) {
    super(SessionModule, config, logger)

    this._expressSession = expressSessCstor(
      Object.assign(
        {
          store: this._redisProvider.redisStore,
          resave: false,
          saveUninitialized: false
        },
        this.config.options
      ) as SessionOptions
    )
  }

  get expressMiddleware() {
    return this._expressSession
  }

  get socketIOMiddleware() {
    return (socket: SocketIOSocket, next: any) => {
      this._expressSession(socket.request, socket.request.res || {}, next)
    }
  }
}
