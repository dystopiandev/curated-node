export class ObjectUtils {
  public static deepFreeze(o: { [k: string]: any }) {
    Object.freeze(o)
    if (o === undefined) {
      return o
    }

    Object.getOwnPropertyNames(o).forEach(function (prop) {
      if (
        o[prop] !== null &&
        (typeof o[prop] === "object" || typeof o[prop] === "function") &&
        !Object.isFrozen(o[prop])
      ) {
        ObjectUtils.deepFreeze(o[prop])
      }
    })

    return o
  }
}
