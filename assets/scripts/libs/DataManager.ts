import { _decorator, JsonAsset, resources } from 'cc'
const { ccclass, property } = _decorator

@ccclass('DataManager')
export class DataManager {
  public static async loadJson<T>(path: string): Promise<T | null> {
    return new Promise((resolve) => {
      resources.load(path, JsonAsset, (err, asset) => {
        if (err) {
          console.error(`加载JSON文件失败: ${path}`, err)
          resolve(null)
          return
        }
        resolve(asset.json as T)
      })
    })
  }
}