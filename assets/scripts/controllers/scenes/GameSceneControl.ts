import {
  _decorator,
  Color,
  Component,
  Label,
  Node,
  Sprite,
  tween,
  UITransform,
  Vec3
} from 'cc'
import GlobalData from '../../config/GlobalData'
import AudioEffect from '../../libs/AudioEffect'
import Common from '../../libs/Common'
import { EventDispatcher } from '../../libs/EventDispatcher'
import { GameState } from '../../config/Config'
import { MusicManager } from '../managers/MusicManager'
const { ccclass, property } = _decorator

@ccclass('GameSceneControl')
export class GameSceneControl extends Component {
  @property(Label)
  totalScoreLabel: Label = null!

  @property(Label)
  lifeLabel: Label = null!

  @property(Node)
  startGameTipNode: Node = null!

  @property(Node)
  speedUpTipNode: Node = null!

  @property(Node)
  uiNode: Node = null!

  musicManager: MusicManager = null!
  screenWidth: number = 0

  onLoad(): void {
    this.screenWidth = this.node.getComponent(UITransform).width
    this.musicManager = this.node.getComponent(MusicManager)
    EventDispatcher.getTarget().on(
      EventDispatcher.DINO_EAT_NOTE,
      this.updateTotalScore,
      this
    )
    EventDispatcher.getTarget().on(
      EventDispatcher.UPDATE_LIFE,
      this.updateLife,
      this
    )
    EventDispatcher.getTarget().on(
      EventDispatcher.GAME_OVER,
      this.handleGameOver,
      this
    )
    EventDispatcher.getTarget().on(
      EventDispatcher.PASS_LEVEL,
      this.replayGame,
      this
    )
  }

  start() {
    this.setBackgroundColor()
    this.setDinoColor()
    GlobalData.resetGameData()
    this.startGame()
  }

  replayGame() {
    this.scheduleOnce(() => {
      GlobalData.speedRate = Number(
        (GlobalData.speedRate + GlobalData.speedRateAdd).toFixed(1)
      )
      this.startGame()
    }, 2)
  }

  startGame() {
    this.uiNode.active = true
    this.updateUI()
    GlobalData.gameState = GameState.PLAYING
    this.showStartGameTip()
    this.scheduleOnce(async () => {
      await this.playMusic()
      EventDispatcher.getTarget().emit(EventDispatcher.GAME_START)
    }, 1)
  }

  setBackgroundColor() {
    const dinoInfo = GlobalData.currentDinoInfo
    Common.setPageBackgroundColor(
      this.node.getChildByName('bg'),
      new Color(dinoInfo?.bgColor)
    )
  }

  setDinoColor() {
    const dinoColor = new Color(GlobalData.currentDinoInfo?.dinoColor)
    this.uiNode
      .getChildByName('life')!
      .getChildByName('dino_head')!
      .getComponent(Sprite).color = dinoColor
  }

  async playMusic() {
    await this.musicManager.play()
  }

  pauseGame() {
    AudioEffect.playClickAudio()
    EventDispatcher.getTarget().emit(EventDispatcher.SHOW_PAUSE_MODAL)
  }

  showStartGameTip() {
    if (GlobalData.speedRate > 1) {
      this.speedUpTipAnim()
    } else {
      this.firstGameTipAnim()
    }
  }

  firstGameTipAnim() {
    this.startGameTipNode.active = true
    const oriPos = this.startGameTipNode.getPosition().clone()
    tween(this.startGameTipNode)
      .to(0.3, {
        position: new Vec3(oriPos.x + this.screenWidth / 2 + 150, oriPos.y)
      })
      .delay(0.5)
      .to(0.2, {
        position: new Vec3(oriPos.x + this.screenWidth + 200, oriPos.y)
      })
      .call(() => {
        this.startGameTipNode.active = false
        this.startGameTipNode.setPosition(oriPos)
      })
      .start()
  }

  speedUpTipAnim() {
    this.speedUpTipNode.getComponent(Label).string =
      `Speed Up! (x${GlobalData.speedRate})`
    this.speedUpTipNode.active = true
    const oriPos = this.speedUpTipNode.getPosition().clone()
    tween(this.speedUpTipNode)
      .to(0.3, {
        position: new Vec3(oriPos.x + this.screenWidth / 2 + 200, oriPos.y)
      })
      .delay(0.5)
      .to(0.2, {
        position: new Vec3(oriPos.x + this.screenWidth + 200, oriPos.y)
      })
      .call(() => {
        this.speedUpTipNode.active = false
        this.speedUpTipNode.setPosition(oriPos)
      })
      .start()
  }

  updateUI() {
    this.updateTotalScore()
    this.updateLife()
    this.updateSpeed()
  }

  updateTotalScore() {
    this.totalScoreLabel.string = GlobalData.curRoundTotalScore + ''
  }

  updateLife() {
    this.lifeLabel.string = 'x ' + GlobalData.lifeNumPerRound
  }

  updateSpeed() {
    this.uiNode
      .getChildByName('note_info')!
      .getChildByName('speed')!
      .getComponent(Label).string = 'Speed: x' + GlobalData.speedRate
  }

  handleGameOver() {
    this.uiNode.active = false
  }

  update(deltaTime: number) {}
}