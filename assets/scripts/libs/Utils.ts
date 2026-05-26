import { sys } from 'cc'

export default class Utils {
  static setCache(key: string, value: any, expire: number = 0): void {
    let obj = {
      data: value,
      time: Date.now() / 1000,
      expire: expire
    }
    sys.localStorage.setItem(key, JSON.stringify(obj))
  }

  static getCache(key: string): any {
    let val: any = sys.localStorage.getItem(key)
    if (!val) {
      return null
    }
    val = JSON.parse(val)
    if (val.expire && Date.now() / 1000 - val.time > val.expire) {
      sys.localStorage.removeItem(key)
      return null
    }
    return val.data
  }
}