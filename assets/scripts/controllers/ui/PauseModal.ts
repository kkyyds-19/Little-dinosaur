import { _decorator, Color, Component, director } from 'cc'
import { EventDispatcher } from '../../libs/EventDispatcher'
import AudioEffect from '../../libs/AudioEffect'
import Common from '../../libs/Common'
import GlobalData from '../../config/GlobalData'
const { ccclass, property } = _decorator

@ccclass('PauseModal')
export class PauseModal extends Component {
  start() {
    this.node.active = false
    this.node.setPosition(0, 0)
    EventDispatcher.getTarget().on(
      EventDispatcher.SHOW_PAUSE_MODAL,
      this.showModal,
      this
    )
  }

  showModal() {
    AudioEffect.playClickAudio()
    this.setBackgroundColor()
    this.node.active = true
    director.pause()
    EventDispatcher.getTarget().emit(EventDispatcher.GAME_PAUSE)
    EventDispatcher.getTarget().emit(EventDispatcher.SHOW_CONTINUE_MODAL, {
      noPlayAudio: true
    })
  }

  closeModal() {
    this.node.active = false
    director.resume()
  }

  resumeGame() {
    this.closeModal()
  }

  backToHome() {
    AudioEffect.playClickAudio()
    director.resume()
    director.loadScene('home')
  }

  setBackgroundColor() {
    const dinoInfo = GlobalData.currentDinoInfo
    Common.setPageBackgroundColor(
      this.node.getChildByName('bg'),
      new Color(dinoInfo?.bgColor)
    )
  }

  update(deltaTime: number) {}
}