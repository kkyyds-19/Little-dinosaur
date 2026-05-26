import {
  _decorator,
  Color,
  Component,
  Label,
  Node,
  Sprite,
  tween,
  UIOpacity,
  Vec3
} from 'cc'
import { EventDispatcher } from '../../libs/EventDispatcher'
import GlobalData from '../../config/GlobalData'
import AudioEffect from '../../libs/AudioEffect'
import Common from '../../libs/Common'
const { ccclass, property } = _decorator

@ccclass('MoodListItem')
export class MoodListItem extends Component {
  private itemObj: any = null

  start() {
    this.node.on(Node.EventType.TOUCH_END, this.onClick, this)
    EventDispatcher.getTarget().on(
      EventDispatcher.SELECT_MOOD_ITEM,
      this.onSelectMoodItem,
      this
    )
    EventDispatcher.getTarget().on(
      EventDispatcher.UNLOCK_MOOD_ITEM,
      this.onUnlockMoodItem,
      this
    )
    this.setDinoColor()
  }

  init(item: any) {
    this.itemObj = item
    this.node.getChildByName('music_title')!.getComponent(Label).string =
      item.title
    this.setLockState(item)
    if (item.id === GlobalData.selectedMusicID) {
      this.setSelected()
    }
  }

  setDinoColor() {
    let sprite = this.node.getChildByName('dino')!.getComponent(Sprite)
    sprite.color = new Color(GlobalData.currentDinoInfo?.dinoColor)
  }

  onClick() {
    AudioEffect.playClickAudio()
    this.setSelected()
    tween(this.node)
      .to(0.1, { scale: new Vec3(0.95, 0.95, 1) })
      .to(0.1, { scale: new Vec3(1, 1, 1) })
      .start()
  }

  setSelected() {
    const opacityComp = this.node
      .getChildByName('list_item_bg')!
      .getComponent(UIOpacity)
    const selectedNode = this.node.getChildByName('dino')
    opacityComp.opacity = 200
    selectedNode.active = true
    EventDispatcher.getTarget().emit(
      EventDispatcher.SELECT_MOOD_ITEM,
      this.itemObj?.id
    )
  }

  setUnSelected() {
    const opacityComp = this.node
      .getChildByName('list_item_bg')!
      .getComponent(UIOpacity)
    const selectedNode = this.node.getChildByName('dino')
    opacityComp.opacity = 255
    selectedNode.active = false
  }

  onSelectMoodItem(musicID: number) {
    if (musicID === this.itemObj?.id) {
      return
    }
    this.setUnSelected()
  }

  setLockState(item: any) {
    if (item.isLocked) {
      this.node.getChildByName('locked')!.active = true
      this.node.getChildByName('best_score')!.active = false
    } else {
      this.node.getChildByName('locked')!.active = false
      this.node.getChildByName('best_score')!.active = true
      this.node
        .getChildByName('best_score')!
        .getChildByName('score_num')!
        .getComponent(Label).string = item.bestScore + ''
    }
  }

  onUnlockMoodItem(musicID: number) {
    if (musicID !== this.itemObj?.id) {
      return
    }
    this.itemObj.isLocked = 0
    this.setLockState(this.itemObj)
    this.setSelected()
    Common.unlockMusic(musicID)
  }

  update(deltaTime: number) {}
}