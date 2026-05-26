import { _decorator, Collider2D, Component, Contact2DType } from 'cc'
import GlobalData from '../../config/GlobalData'
import { GameState } from '../../config/Config'
import { NoteControl } from './NoteControl'
import { EventDispatcher } from '../../libs/EventDispatcher'
const { ccclass, property } = _decorator

@ccclass('LineControl')
export class LineControl extends Component {
  start() {
    this.node
      .getComponent(Collider2D)
      .on(Contact2DType.BEGIN_CONTACT, this.onCollisionEnter, this)
  }

  onCollisionEnter(selfCollider: Collider2D, otherCollider: Collider2D) {
    if (GlobalData.gameState != GameState.PLAYING) {
      return
    }
    if (otherCollider.tag === 2) {
      GlobalData.lifeNumPerRound--
      if (GlobalData.lifeNumPerRound >= 0) {
        EventDispatcher.getTarget().emit(EventDispatcher.UPDATE_LIFE)
      }
      if (GlobalData.lifeNumPerRound < 0) {
        GlobalData.gameState = GameState.GAME_OVER
        otherCollider.getComponent(NoteControl).noteHitLine()
        EventDispatcher.getTarget().emit(EventDispatcher.GAME_OVER)
      } else {
        GlobalData.gameState = GameState.PAUSE
        otherCollider.getComponent(NoteControl).noteHitLine()
        EventDispatcher.getTarget().emit(EventDispatcher.GAME_PAUSE)
      }
    }
  }

  update(deltaTime: number) {}
}