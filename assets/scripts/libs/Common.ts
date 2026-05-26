import { Color, Node, Sprite } from 'cc'
import GlobalData from '../config/GlobalData'
import { DataManager } from './DataManager'

export default class Common {
  public static async loadMusicNoteData(musicID: number): Promise<any | null> {
    return await DataManager.loadJson<any>(`data/music_${musicID}`)
  }

  public static isMusicUnlocked(musicID: number): boolean {
    return GlobalData.unlockMusicIDList?.includes(musicID)
  }

  public static unlockMusic(musicID: number) {
    if (Common.isMusicUnlocked(musicID)) {
      return
    }
    let unlockMusicIDList = GlobalData.unlockMusicIDList || []
    unlockMusicIDList?.push(musicID)
    GlobalData.unlockMusicIDList = unlockMusicIDList
  }

  public static isDinoUnlocked(dinoID: number): boolean {
    return GlobalData.unlockDinoIDList?.includes(dinoID)
  }

  public static unlockDino(dinoID: number) {
    if (Common.isDinoUnlocked(dinoID)) {
      return
    }
    let unlockDinoIDList = GlobalData.unlockDinoIDList || []
    unlockDinoIDList?.push(dinoID)
    GlobalData.unlockDinoIDList = unlockDinoIDList
  }

  public static setPageBackgroundColor(node: Node, color: Color) {
    node.getComponent(Sprite).color = color
  }
}