import { _decorator, Component } from 'cc'
import GlobalData from '../../config/GlobalData'
const { ccclass, property } = _decorator

@ccclass('RhythmNoteControl')
export class RhythmNoteControl extends Component {
  speed: number = GlobalData.noteSpeed

  start() {}

  update(deltaTime: number) {
    this.node.y += this.speed * deltaTime
    if (this.node.y > 1000) {
      this.node.destroy()
    }
  }
}