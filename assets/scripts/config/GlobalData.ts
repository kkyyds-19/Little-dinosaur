import Utils from '../libs/Utils'
import { GameState, GameStorageKeyConfig } from './Config'

export default class GlobalData {
  public static gameState: GameState = GameState.WAIT_START
  public static addScore: number = 1
  public static curRoundTotalScore: number = 0
  public static noteSpeed: number = 800
  public static lifeNumPerRound: number = 2
  public static speedRate: number = 1
  public static speedRateAdd: number = 0.2
  public static get selectedMusicID() {
    return parseInt(Utils.getCache(GameStorageKeyConfig.SelectedMusicID)) || 1
  }
  public static set selectedMusicID(value) {
    Utils.setCache(GameStorageKeyConfig.SelectedMusicID, value)
  }
  public static get selectedDinoID() {
    return parseInt(Utils.getCache(GameStorageKeyConfig.SelectedDinoID)) || 1
  }
  public static set selectedDinoID(value) {
    Utils.setCache(GameStorageKeyConfig.SelectedDinoID, value)
  }
  public static get currentDinoInfo(): any {
    return (
      Utils.getCache(GameStorageKeyConfig.CurrentDinoInfo) || {
        id: 1,
        name: '小恐龙1',
        desc: 'Dino:Will you marry me?',
        isLocked: 0,
        unlockGold: 0,
        dinoColor: '#ffffff',
        bgColor: '#cce5cd'
      }
    )
  }
  public static set currentDinoInfo(value) {
    Utils.setCache(GameStorageKeyConfig.CurrentDinoInfo, value)
  }
  public static get currentMusicInfo(): any {
    return (
      Utils.getCache(GameStorageKeyConfig.CurrentMusicInfo) || {
        id: 1,
        title: 'Like A Dino!',
        bestScore: 0,
        isLocked: 0,
        unlockGold: 0
      }
    )
  }
  public static set currentMusicInfo(value) {
    Utils.setCache(GameStorageKeyConfig.CurrentMusicInfo, value)
  }
  public static get bestScore() {
    let scoreMap = Utils.getCache(GameStorageKeyConfig.BestScore) || {}
    let bestScoreKey = GlobalData.selectedMusicID
    let score = scoreMap[bestScoreKey] || 0
    return score
  }
  public static set bestScore(value) {
    let bestScoreKey = GlobalData.selectedMusicID
    let scoreMap = Utils.getCache(GameStorageKeyConfig.BestScore) || {}
    scoreMap[bestScoreKey] = parseInt(value)
    Utils.setCache(GameStorageKeyConfig.BestScore, scoreMap)
  }
  public static get totalScore() {
    let score = Utils.getCache(GameStorageKeyConfig.TotalScore) || 0
    return score ? parseInt(score) : 0
  }
  public static set totalScore(value) {
    Utils.setCache(GameStorageKeyConfig.TotalScore, value)
  }
  public static get unlockMusicIDList() {
    return Utils.getCache(GameStorageKeyConfig.UnlockMusicIDList) || []
  }
  public static set unlockMusicIDList(value) {
    Utils.setCache(GameStorageKeyConfig.UnlockMusicIDList, value)
  }
  public static get unlockDinoIDList() {
    return Utils.getCache(GameStorageKeyConfig.UnlockDinoIDList) || []
  }
  public static set unlockDinoIDList(value) {
    Utils.setCache(GameStorageKeyConfig.UnlockDinoIDList, value)
  }
  public static resetGameData() {
    GlobalData.curRoundTotalScore = 0
    GlobalData.lifeNumPerRound = 2
    GlobalData.speedRate = 1
  }
}