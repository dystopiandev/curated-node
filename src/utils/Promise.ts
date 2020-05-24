import synchronousify from "synchronized-promise"

export class PromiseUtils {
  public static sync(promise: Promise<any>): [any, any] {
    try {
      return (synchronousify(
        () =>
          new Promise((resolve) => {
            promise
              .then((res) => resolve([null, res]))
              .catch((err) => resolve([err, null]))
          })
      )() as unknown) as [any, any]
    } catch (err) {
      return [err, null]
    }
  }
}
