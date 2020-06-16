import expressSessCstor from "express-session"
import connectRedis from "connect-redis"
import Redis, { Redis as RedisClient, RedisOptions } from "ioredis"
import { LogModule, LogModuleConfig } from "./Log"
import { _BaseModule } from "../_BaseModule"

export type RedisModuleConfig = {
  id?: string
  logger?: LogModuleConfig
  options?: Partial<RedisOptions>
}

export class RedisModule extends _BaseModule<RedisModule, RedisModuleConfig> {
  private readonly _redisStore: connectRedis.RedisStore
  private readonly _redisClient: RedisClient

  constructor(config: RedisModuleConfig, logger?: LogModule) {
    super(RedisModule, config, logger)

    const RedisStore = connectRedis(expressSessCstor)

    this._redisClient = new Redis(this.config.options)
    this._redisStore = new RedisStore({ client: this._redisClient })
  }

  get redisClient() {
    return this._redisClient
  }

  get redisStore() {
    return this._redisStore
  }
}
