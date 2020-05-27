import express, {
  Router as ExpressRouter,
  RouterOptions as ExpressRouterOptions
} from "express"
import normalizePath from "normalize-path"

interface ExpressRoute {
  path: string
  method: ExpressRouterRequestMethod
  handler: ExpressRouterRequestHandler
  middleware?: {
    preRoute?: ExpressRouterRequestHandler[]
    postRoute?: ExpressRouterRequestHandler[]
  }
}

type ExpressRouterRequestMethod =
  | "get"
  | "head"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "options"
  | "trace"

type ExpressRouterRequestHandler = (...args: any[]) => any

export class ExpressRouterWrapper {
  private readonly _routes: ExpressRoute[] = []
  private readonly _router: ExpressRouter

  constructor(
    private readonly _basePath: string,
    routes: ExpressRoute[],
    private readonly _routerOptions?: ExpressRouterOptions
  ) {
    this._router = express.Router(this._routerOptions ?? {})

    for (const route of routes) {
      this._routes.push(route)

      this._router
        .route(normalizePath(`/${this._basePath}/${route.path}`))
        [route.method](
          ...(route.middleware?.preRoute ?? []),
          route.handler,
          ...(route.middleware?.postRoute ?? [])
        )
    }
  }

  get basePath() {
    return this._basePath
  }

  get router() {
    return this._router
  }

  get routerOptions() {
    return this._routerOptions
  }
}
