import { _decorator, Component, AudioClip } from 'cc'
import { EventDispatcher } from '../../libs/EventDispatcher'
import { SpeedAudioPlayer } from '../../libs/SpeedAudioPlayer'
import GlobalData from '../../config/GlobalData'
const { ccclass, property } = _decorator

@ccclass('MusicManager')
export class MusicManager extends Component {
  private audioPlayer: SpeedAudioPlayer = null

  @property({
    type: [AudioClip],
    tooltip: '音频剪辑列表'
  })
  audioClips: AudioClip[] = []

  private currentAudioClipIndex: number = 0

  async onLoad() {
    this.currentAudioClipIndex = GlobalData.selectedMusicID - 1
    this.audioPlayer = new SpeedAudioPlayer()
    await this.audioPlayer.init(this.audioClips[this.currentAudioClipIndex])
  }

  start() {
    EventDispatcher.getTarget().on(EventDispatcher.GAME_PAUSE, this.pause, this)
    EventDispatcher.getTarget().on(
      EventDispatcher.GAME_RESUME,
      this.resume,
      this
    )
    EventDispatcher.getTarget().on(EventDispatcher.GAME_OVER, this.stop, this)
  }

  async play() {
    if (this.currentAudioClipIndex !== GlobalData.selectedMusicID - 1) {
      this.currentAudioClipIndex = GlobalData.selectedMusicID - 1
      await this.audioPlayer.changeAudioClip(
        this.audioClips[this.currentAudioClipIndex]
      )
    }
    this.audioPlayer.play(GlobalData.speedRate)
    this.audioPlayer.setVolume(1.0)
  }

  pause() {
    this.audioPlayer.pause()
  }

  stop() {
    this.audioPlayer.stop()
  }

  resume() {
    this.audioPlayer.resume()
  }

  update(deltaTime: number) {}
}