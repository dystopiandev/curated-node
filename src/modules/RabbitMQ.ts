import * as Amqp from "@droidsolutions-oss/amqp-ts"
import { LogModuleConfig, LogModule } from "./Log"
import { _BaseModule } from "../_BaseModule"
import { PromiseUtils } from "../utils/Promise"

export type RabbitMQModuleConfig = {
  id?: string
  logger?: LogModuleConfig
  scheme?: "amqp" | "amqps"
  options: { host: string; port: number; user: string; password: string }
}

export class RabbitMQModule extends _BaseModule<
  RabbitMQModule,
  RabbitMQModuleConfig
> {
  private readonly _connection: Amqp.Connection
  private readonly _url: string
  private readonly _queues: { [key: string]: Amqp.Queue }

  constructor(config: RabbitMQModuleConfig, logger?: LogModule) {
    super(RabbitMQModule, config, logger)

    this._url = `${config.scheme ?? "amqp"}://${config.options.user}:${
      config.options.password
    }@${config.options.host}:${config.options.port}`
    this._queues = {}
    this._connection = new Amqp.Connection(this._url)

    const [err] = PromiseUtils.sync(this._connection.initialized)

    if (err) {
      throw new Error(err ?? "RabbitMQ initialization failed!")
    }
  }

  public destroy() {
    return new Promise((resolve, reject) => {
      this._connection
        .close()
        .then((res) => resolve(res))
        .catch((err) => reject(err))
    })
  }

  get connection() {
    return this._connection
  }

  get queues() {
    return this._queues
  }

  public async getQueue(
    queueName: string,
    queueOptions: { [key: string]: any } = { durable: true }
  ): Promise<Amqp.Queue> {
    if (this._queues[queueName]) return Promise.resolve(this._queues[queueName])

    this._queues[queueName] = this._connection.declareQueue(
      queueName,
      queueOptions
    )
    await this._queues[queueName].initialized
    return Promise.resolve(this._queues[queueName])
  }

  public async sendToQueue(
    queueName: string,
    rawMsg: any,
    msgOptions: { [key: string]: any } = { persistent: true }
  ): Promise<Amqp.Message> {
    const msg = new Amqp.Message(rawMsg, msgOptions)

    const q = await this.getQueue(queueName)
    q.send(msg)
    return msg
  }

  public async consumeQueue(
    queueName: string,
    consumerFn: (msg: Amqp.Message) => any,
    consumerOptions: { [key: string]: any } = { noAck: false }
  ) {
    const q = await this.getQueue(queueName)
    return q.activateConsumer(consumerFn, consumerOptions)
  }
}
