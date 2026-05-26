import { _decorator, Color, Component, Sprite, tween, Vec3, view } from 'cc'
import { EventDispatcher } from '../../libs/EventDispatcher'
import GlobalData from '../../config/GlobalData'
import { GameState } from '../../config/Config'
const { ccclass, property } = _decorator

@ccclass('NoteControl')
export class NoteControl extends Component {
  speed: number = GlobalData.noteSpeed
  isEnableFall: boolean = false

  start() {
    EventDispatcher.getTarget().on(
      EventDispatcher.GAME_START,
      this.startFall,
      this
    )
    EventDispatcher.getTarget().on(
      EventDispatcher.CLEAR_SCREEN_NOTES,
      this.clearNotesInScreen,
      this
    )
  }

  initNote() {
    this.setNoteColor()
  }

  setNoteColor() {
    const dinoInfo = GlobalData.currentDinoInfo
    const noteColor = new Color(dinoInfo?.dinoColor)
    this.node.getChildByName('note_img').getComponent(Sprite).color = noteColor
  }

  startFall() {
    this.isEnableFall = true
  }

  noteBeEaten() {
    this.node?.removeFromParent()
    this.node?.destroy()
  }

  noteHitLine() {
    let tipTextNode = this.node.getChildByName('tip_text')
    tipTextNode.active = true
    let sprite = this.node.getChildByName('note_img').getComponent(Sprite)
    let noteColor = new Color(GlobalData.currentDinoInfo?.dinoColor)
    tween(sprite)
      .repeat(
        3,
        tween()
          .to(0.2, {
            color: new Color(noteColor.r, noteColor.g, noteColor.b, 0)
          })
          .to(0.2, { color: noteColor })
      )
      .call(() => {
        tween(tipTextNode)
          .to(0.5, { scale: new Vec3(0, 0, 0) })
          .call(() => {
            if (GlobalData.gameState == GameState.GAME_OVER) {
              EventDispatcher.getTarget().emit(EventDispatcher.CLEAR_ALL_NOTES)
              this.scheduleOnce(() => {
                EventDispatcher.getTarget().emit(
                  EventDispatcher.MOVE_DINO_TO_LINE
                )
              }, 0.1)
              EventDispatcher.getTarget().emit(
                EventDispatcher.SHOW_RESULT_MODAL
              )
            } else if (GlobalData.gameState == GameState.PAUSE) {
              EventDispatcher.getTarget().emit(
                EventDispatcher.SHOW_CONTINUE_MODAL
              )
              this.scheduleOnce(() => {
                EventDispatcher.getTarget().emit(
                  EventDispatcher.CLEAR_SCREEN_NOTES
                )
              }, 0.1)
            }
          })
          .start()
      })
      .start()
  }

  clearNotesInScreen() {
    if (this.checkIsInScreen()) {
      this.node?.removeFromParent()
      this.node?.destroy()
    }
  }

  checkIsInScreen() {
    const screenWidth = view.getVisibleSize().width
    const screenHeight = view.getVisibleSize().height
    const worldPos = this.node.getWorldPosition()
    return (
      worldPos.x >= 0 &&
      worldPos.x <= screenWidth &&
      worldPos.y >= 0 &&
      worldPos.y <= screenHeight
    )
  }

  update(deltaTime: number) {
    if (!this.isEnableFall || GlobalData.gameState != GameState.PLAYING) {
      return
    }
    this.node.y -= this.speed * GlobalData.speedRate * deltaTime
    if (this.node.y < -800) {
      this.node.destroy()
    }
  }
}