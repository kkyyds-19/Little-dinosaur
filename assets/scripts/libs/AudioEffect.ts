import { AudioManager } from './AudioManager'

export default class AudioEffect {
  static playCommonAudio(audioUrl: string): void {
    if (!audioUrl) {
      return
    }
    AudioManager.inst.playOneShot(audioUrl)
  }

  public static playClickAudio() {
    let audioUrl = 'audios/common/click'
    AudioEffect.playCommonAudio(audioUrl)
  }

  public static playGoldAudio() {
    let audioUrl = 'audios/common/gold'
    AudioEffect.playCommonAudio(audioUrl)
  }

  public static playCoinsEntryAudio() {
    let audioUrl = 'audios/common/coins_entry'
    AudioEffect.playCommonAudio(audioUrl)
  }
}