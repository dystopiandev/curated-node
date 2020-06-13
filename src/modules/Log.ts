import chalk from "chalk"
import { _BaseModule } from "../_BaseModule"

export type LogModuleConfig = {
  console?: boolean
  origin?: string
}

export class LogModule {
  private readonly _prefix: string

  constructor(private config?: LogModuleConfig) {
    this._prefix = this.config?.origin ?? ""
  }

  success(...args: any[]) {
    if (this.config?.console) {
      console.info(this._prefix, chalk.greenBright(...args))
    }
  }

  info(...args: any[]) {
    if (this.config?.console) {
      console.info(this._prefix, chalk.blueBright(...args))
    }
  }

  warn(...args: any[]) {
    if (this.config?.console) {
      console.warn(this._prefix, chalk.yellowBright(...args))
    }
  }

  error(...args: any[]) {
    if (this.config?.console) {
      console.error(this._prefix, chalk.redBright(...args))
    }
  }

  log(...args: any[]) {
    if (this.config?.console) {
      console.log(this._prefix, chalk.whiteBright(...args))
    }
  }

  quiet(...args: any[]) {
    if (this.config?.console) {
      console.log(this._prefix, chalk.gray(...args))
    }
  }

  debug(...args: any[]) {
    if (this.config?.console) {
      console.debug(this._prefix, chalk.dim(...args))
    }
  }

  trace(...args: any[]) {
    if (this.config?.console) {
      console.trace(
        this._prefix,
        chalk.black.bgWhite(JSON.stringify(args, null, 2))
      )
    }
  }

  newLine() {
    if (this.config?.console) {
      console.log()
    }
  }
}
