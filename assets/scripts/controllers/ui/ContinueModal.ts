import {
  _decorator,
  Color,
  Component,
  EventTouch,
  Node,
  Sprite,
  tween,
  UITransform,
  Vec3
} from 'cc'
import { EventDispatcher } from '../../libs/EventDispatcher'
import AudioEffect from '../../libs/AudioEffect'
import GlobalData from '../../config/GlobalData'
import { GameState } from '../../config/Config'
const { ccclass, property } = _decorator

@ccclass('ContinueModal')
export class ContinueModal extends Component {
  @property(Node)
  swipeNode: Node | null = null

  @property(Node)
  tip1Node: Node | null = null

  @property(Node)
  tip2Node: Node | null = null

  start() {
    this.node.active = false
    this.node.setPosition(0, 0)
    EventDispatcher.getTarget().on(
      EventDispatcher.SHOW_CONTINUE_MODAL,
      this.showModal,
      this
    )
    this.swipeNode?.on(Node.EventType.TOUCH_START, this.onSwipeStart, this)
    this.setDinoColor()
  }

  showModal(params: any = {}) {
    if (!params?.noPlayAudio) {
      AudioEffect.playClickAudio()
    }
    GlobalData.gameState = GameState.PAUSE
    this.node.active = true
    if (GlobalData.lifeNumPerRound > 0) {
      this.playTipAnimation(this.tip1Node)
    } else {
      this.playTipAnimation(this.tip2Node)
    }
  }

  closeModal() {
    this.node.active = false
  }

  pauseGame() {
    AudioEffect.playClickAudio()
    EventDispatcher.getTarget().emit(EventDispatcher.SHOW_PAUSE_MODAL)
  }

  onSwipeStart(event: EventTouch) {
    this.closeModal()
    EventDispatcher.getTarget().emit(EventDispatcher.ENABLE_MOVE_DINO)
    this.scheduleOnce(() => {
      GlobalData.gameState = GameState.PLAYING
      EventDispatcher.getTarget().emit(EventDispatcher.GAME_RESUME)
    }, 2)
  }

  playTipAnimation(tipNode: Node) {
    tipNode.active = true
    const oriPos = tipNode.getPosition().clone()
    const tipWidth = tipNode.getComponent(UITransform).width + 5
    tween(tipNode)
      .to(0.3, {
        position: new Vec3(oriPos.x - tipWidth, oriPos.y, 0)
      })
      .delay(0.8)
      .to(0.2, {
        position: oriPos
      })
      .call(() => {
        tipNode.active = false
        tipNode.setPosition(oriPos)
      })
      .start()
  }

  setDinoColor() {
    const dinoColor = new Color(GlobalData.currentDinoInfo?.dinoColor)
    this.tip1Node.getChildByName('dino')!.getComponent(Sprite).color = dinoColor
    this.tip2Node.getChildByName('dino')!.getComponent(Sprite).color = dinoColor
  }

  update(deltaTime: number) {}
}