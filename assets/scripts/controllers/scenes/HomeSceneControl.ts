import {
  _decorator,
  Color,
  Component,
  director,
  EventTouch,
  Label,
  Node
} from 'cc'
import AudioEffect from '../../libs/AudioEffect'
import GlobalData from '../../config/GlobalData'
import Common from '../../libs/Common'
const { ccclass, property } = _decorator

@ccclass('HomeSceneControl')
export class HomeSceneControl extends Component {
  @property(Node)
  swipeNode: Node | null = null

  @property(Label)
  bestScoreLabel: Label | null = null

  @property(Label)
  currentMusicLabel: Label | null = null

  private isSwiped: boolean = false

  start() {
    this.swipeNode?.on(Node.EventType.TOUCH_START, this.onSwipeStart, this)
    this.setBestScoreLabel()
    this.setCurrentMusicLabel()
    this.setBackgroundColor()
    this.preloadGameScene()
  }

  preloadGameScene() {
    director.preloadScene('game')
  }

  onSwipeStart(event: EventTouch) {
    this.startGame()
  }

  public startGame() {
    if (this.isSwiped) {
      return
    }
    this.isSwiped = true
    setTimeout(() => {
      this.isSwiped = false
    }, 1000)
    director.preloadScene('game', () => {
      director.loadScene('game')
    })
  }

  setBestScoreLabel() {
    if (this.bestScoreLabel) {
      this.bestScoreLabel.string = GlobalData.bestScore.toString()
    }
  }

  setCurrentMusicLabel() {
    if (this.currentMusicLabel) {
      this.currentMusicLabel.string = GlobalData.currentMusicInfo?.title
    }
  }

  setBackgroundColor() {
    const dinoInfo = GlobalData.currentDinoInfo
    Common.setPageBackgroundColor(
      this.node.getChildByName('bg'),
      new Color(dinoInfo?.bgColor)
    )
  }

  goToLoveStoryScene() {
    AudioEffect.playClickAudio()
    director.preloadScene('love_story', () => {
      director.loadScene('love_story')
    })
  }

  goToMoodScene() {
    AudioEffect.playClickAudio()
    director.preloadScene('mood', () => {
      director.loadScene('mood')
    })
  }

}