import { _decorator, Animation, Component, Label, Node, tween, Vec3 } from 'cc'
import { EventDispatcher } from '../../libs/EventDispatcher'
const { ccclass, property } = _decorator

@ccclass('BombEffectControl')
export class BombEffectControl extends Component {
  private bombTips: string[] = [
    'Perfect!',
    'Fantastic!',
    'Marvelous!',
    'Super-Duper!',
    'Splerdid!',
    'Excellent!',
    'Wonderful!',
    'Brilliant!',
    'Incredible!',
    'Phenomenal!',
    'Awesome!'
  ]

  @property(Label)
  bombLabel: Label = null

  @property(Node)
  bombImageNode: Node = null

  private animation: Animation = null

  onLoad() {
    this.animation = this.bombImageNode?.getComponent(Animation)
    this.animation?.on(
      Animation.EventType.FINISHED,
      this.onAnimationFinished,
      this
    )
    this.setBombTip()
    EventDispatcher.getTarget().on(
      EventDispatcher.DINO_EAT_NOTE,
      this.hideBombTip,
      this
    )
  }

  setBombTip() {
    let tips = this.bombTips[Math.floor(Math.random() * this.bombTips.length)]
    this.bombLabel.string = tips
  }

  hideBombTip() {
    this.bombLabel.node.active = false
  }

  playBombEffect() {
    this.animation?.play('bomb')
    this.bombLabel.node.active = true
    tween(this.bombLabel.node)
      .to(0.1, { scale: new Vec3(1.1, 1.1, 1) })
      .start()
  }

  onAnimationFinished() {
    this.bombImageNode.active = false
    tween(this.bombLabel.node)
      .to(0.2, { scale: new Vec3(0.1, 0.1) })
      .call(() => {
        this.node?.destroy()
      })
      .start()
  }

  update(deltaTime: number) {}
}