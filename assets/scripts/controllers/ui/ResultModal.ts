import {
  _decorator,
  Color,
  Component,
  director,
  Label,
  Node,
  Sprite,
  tween,
  UITransform,
  Vec3
} from 'cc'
import { EventDispatcher } from '../../libs/EventDispatcher'
import AudioEffect from '../../libs/AudioEffect'
import GlobalData from '../../config/GlobalData'
const { ccclass, property } = _decorator

@ccclass('ResultModal')
export class ResultModal extends Component {
  @property(Label)
  scoreLabel: Label = null!

  @property(Label)
  bestScoreLabel: Label = null!

  @property(Label)
  totalScoreLabel: Label = null!

  @property(Node)
  tipNode: Node = null!

  @property(Node)
  backHomeBtn: Node = null!

  start() {
    this.node.active = false
    this.node.setPosition(0, 0)
    EventDispatcher.getTarget().on(
      EventDispatcher.SHOW_RESULT_MODAL,
      this.showModal,
      this
    )
  }

  showModal() {
    AudioEffect.playClickAudio()
    this.setDinoColor()
    this.node.active = true
    this.scoreLabel.string = GlobalData.curRoundTotalScore.toString()
    GlobalData.totalScore += GlobalData.curRoundTotalScore
    this.setTotalScoreLabel()
    this.setCurUserBestScore()
    this.scheduleOnce(async () => {
      await this.playGoldEffect()
      this.playTipAnimation()
      this.backHomeBtn.active = true
    }, 1)
  }

  closeModal() {
    this.node.active = false
    this.backHomeBtn.active = false
    this.scoreLabel.string = '0'
  }

  backToHome() {
    AudioEffect.playClickAudio()
    director.loadScene('home')
  }

  setCurUserBestScore() {
    let bestScore = GlobalData.bestScore
    if (GlobalData.curRoundTotalScore > bestScore) {
      GlobalData.bestScore = GlobalData.curRoundTotalScore
    }
    this.bestScoreLabel.string = GlobalData.bestScore.toString()
  }

  setTotalScoreLabel() {
    this.totalScoreLabel.string = GlobalData.totalScore.toString()
  }

  async playGoldEffect() {
    let goldCoinsNode = this.node
      .getChildByName('panel')
      .getChildByName('gold_coins')
    goldCoinsNode.active = true
    AudioEffect.playGoldAudio()
    this.scheduleOnce(() => {
      AudioEffect.playCoinsEntryAudio()
    }, 0.5)
    let goldCoinsList = goldCoinsNode.children
    let goldCoinNumNode = this.node
      .getChildByName('gold_label')
      .getChildByName('gold_num')
    let targetPos = goldCoinNumNode.getWorldPosition()
    for (let i = 0; i < goldCoinsList.length; i++) {
      let targetPosClone = targetPos.clone()
      await this.playSingleGoldAni(goldCoinsList[i], targetPosClone)
    }
  }

  async playSingleGoldAni(goldCoin: Node, targetPos: Vec3) {
    return new Promise((resolve) => {
      tween(goldCoin)
        .by(0.2, { position: new Vec3(0, -30, 0) })
        .call(() => {
          resolve(true)
          let goldWorldPos = goldCoin.getWorldPosition()
          let dirDiff = targetPos.subtract(goldWorldPos)
          tween(goldCoin)
            .by(0.5, { position: dirDiff })
            .call(() => {
              goldCoin.active = false
            })
            .start()
        })
        .start()
    })
  }

  playTipAnimation() {
    this.tipNode.active = true
    const oriPos = this.tipNode.getPosition().clone()
    const tipWidth = this.tipNode.getComponent(UITransform).width + 5
    tween(this.tipNode)
      .to(0.3, {
        position: new Vec3(oriPos.x - tipWidth, oriPos.y, 0)
      })
      .delay(0.8)
      .to(0.2, {
        position: oriPos
      })
      .call(() => {
        this.tipNode.active = false
        this.tipNode.setPosition(oriPos)
      })
      .start()
  }

  setDinoColor() {
    const dinoColor = new Color(GlobalData.currentDinoInfo?.dinoColor)
    this.tipNode.getChildByName('dino')!.getComponent(Sprite).color = dinoColor
  }

  update(deltaTime: number) {}
}