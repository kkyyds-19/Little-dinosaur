import { _decorator, Component, Label, Node, tween, Vec3 } from 'cc'
import { EventDispatcher } from '../../libs/EventDispatcher'
const { ccclass, property } = _decorator

@ccclass('TipControl')
export class TipControl extends Component {
  @property(Label)
  tipLabel: Label | null = null

  start() {
    this.node.setPosition(0, -1000)
    EventDispatcher.getTarget().on(
      EventDispatcher.TIPS_MSG,
      this.showTips,
      this
    )
  }

  showTips(msg: string) {
    this.tipLabel.string = msg
    tween(this.node)
      .to(0.2, { position: new Vec3(0, 0, 0) })
      .delay(1)
      .to(0.2, { position: new Vec3(0, 1000, 0) })
      .call(() => {
        this.node.setPosition(0, -1000)
      })
      .start()
  }

  update(deltaTime: number) {}
}