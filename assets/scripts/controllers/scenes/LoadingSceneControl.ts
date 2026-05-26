import {
  _decorator,
  Color,
  Component,
  director,
  Sprite,
  Node,
  tween,
  Vec3,
  Label,
  resources,
  AudioClip,
  instantiate,
  Prefab
} from 'cc'
import AudioEffect from '../../libs/AudioEffect'
import GlobalData from '../../config/GlobalData'
import Common from '../../libs/Common'
import { BombEffectControl } from '../effects/BombEffectControl'
const { ccclass, property } = _decorator

@ccclass('LoadingSceneControl')
export class LoadingSceneControl extends Component {
  @property(Node)
  dinoNode: Node | null = null!

  @property(Node)
  loadingNode: Node | null = null!

  @property(Node)
  startGameBtnNode: Node | null = null!

  @property(Prefab)
  boomPrefab: Prefab = null!

  private resourceDirs = [
    'images',
    'prefabs'
  ]

  private totalResourceCount = 5
  private loadingProgress = 0
  private isFinished = false

  start() {
    this.setBackgroundColor()
    this.setDinoColor()
    this.playDinoAnimation()
    this.playLoadingAnimation()
    this.preloadResources()
    this.scheduleOnce(() => {
      this.loadingProgress = this.totalResourceCount
    }, 5)
  }

  setBackgroundColor() {
    const dinoInfo = GlobalData.currentDinoInfo
    Common.setPageBackgroundColor(
      this.node.getChildByName('bg'),
      new Color(dinoInfo?.bgColor)
    )
  }

  setDinoColor() {
    const dinoInfo = GlobalData.currentDinoInfo
    const dinoColor = new Color(dinoInfo?.dinoColor)
    this.dinoNode.getComponent(Sprite).color = dinoColor
  }

  playDinoAnimation() {
    const position = this.dinoNode.getPosition()
    tween(this.dinoNode)
      .repeatForever(
        tween()
          .set({ scale: new Vec3(-1, 1, 1) })
          .to(1, {
            position: new Vec3(150, position.y, position.z)
          })
          .set({ scale: new Vec3(1, 1, 1) })
          .to(1, {
            position: new Vec3(-150, position.y, position.z)
          })
      )
      .start()
  }

  playLoadingAnimation() {
    tween(this.loadingNode.getComponent(Label))
      .repeatForever(
        tween()
          .set({ string: 'Loading.' })
          .delay(0.5)
          .set({ string: 'Loading..' })
          .delay(0.5)
          .set({ string: 'Loading...' })
          .delay(0.5)
      )
      .start()
  }

  openStartGameBtn() {
    this.loadingNode.active = false
    this.startGameBtnNode.active = true
    tween(this.startGameBtnNode)
      .repeatForever(
        tween()
          .to(0.5, { scale: new Vec3(1.1, 1.1, 1) })
          .to(0.5, { scale: new Vec3(1, 1, 1) })
      )
      .start()
  }

  preloadResources() {
    director.preloadScene('home', () => {
      this.loadingProgress += 1
    })
    director.preloadScene('game', () => {
      this.loadingProgress += 1
    })
    this.preloadImageResources()
    this.preloadAudioResources()
  }

  preloadAudioResources() {
    const musicId = GlobalData.selectedMusicID
    const musicPath = `audios/music/music_${musicId}`
    resources.load(musicPath, AudioClip, (err, asset) => {
      this.loadingProgress += 1
    })
  }

  preloadImageResources() {
    this.resourceDirs.forEach((dir) => {
      resources.loadDir(dir, (err, assets) => {
        this.loadingProgress += 1
      })
    })
  }

  goToHomeScene() {
    AudioEffect.playClickAudio()
    this.playBombEffect()
    this.scheduleOnce(() => {
      director.loadScene('home')
    }, 0.4)
  }

  playBombEffect() {
    if (!this.boomPrefab) return
    const bombNode = instantiate(this.boomPrefab)
    this.node.addChild(bombNode)
    bombNode.setPosition(0, 0)
    const bombEffect = bombNode.getComponent(BombEffectControl)
    bombEffect?.playBombEffect()
  }

  update(deltaTime: number) {}
}