import {
  _decorator,
  Collider2D,
  Color,
  Component,
  Contact2DType,
  director,
  EventTouch,
  Input,
  input,
  instantiate,
  Node,
  Prefab,
  Sprite,
  SpriteFrame,
  tween,
  Vec3
} from 'cc'
import { NoteControl } from './NoteControl'
import { BombEffectControl } from '../effects/BombEffectControl'
import { EventDispatcher } from '../../libs/EventDispatcher'
import GlobalData from '../../config/GlobalData'
import { GameState } from '../../config/Config'
const { ccclass, property } = _decorator

@ccclass('DinoControl')
export class DinoControl extends Component {
  @property(SpriteFrame)
  neckSpriteFrame: SpriteFrame = null!

  @property(Node)
  lineNode: Node = null!

  @property(Prefab)
  boomPrefab: Prefab = null!

  @property
  isOpenMove: boolean = false

  neckHeight: number = 62
  maxMoveX: number = 180
  isEnableMove: boolean = false

  onLoad() {
    this.setDinoColor()
    EventDispatcher.getTarget().on(
      EventDispatcher.MOVE_DINO_TO_LINE,
      this.moveDinoToLine,
      this
    )
    EventDispatcher.getTarget().on(
      EventDispatcher.GAME_RESUME,
      this.resumeGame,
      this
    )
    EventDispatcher.getTarget().on(
      EventDispatcher.ENABLE_MOVE_DINO,
      this.enableMove,
      this
    )
  }

  start() {
    if (this.isOpenMove) {
      input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)
    }
    this.node
      .getComponent(Collider2D)
      .on(Contact2DType.BEGIN_CONTACT, this.onCollisionEnter, this)
  }

  setDinoColor() {
    const dinoInfo = GlobalData.currentDinoInfo
    const dinoColor = new Color(dinoInfo?.dinoColor)
    this.node.getChildByName('dino_head').getComponent(Sprite).color = dinoColor
    this.node.getChildByName('dino_body').getComponent(Sprite).color = dinoColor
  }

  enableMove() {
    this.isEnableMove = true
    this.scheduleOnce(() => {
      this.isEnableMove = false
    }, 3)
  }

  onTouchMove(event: EventTouch) {
    if (
      [GameState.GAME_OVER, GameState.PAUSE].includes(GlobalData.gameState) &&
      !this.isEnableMove
    ) {
      return
    }
    let currentPos = this.node.position
    let deltaX = event.getDelta().x
    let targetPos = new Vec3(currentPos.x + deltaX, currentPos.y, 0)
    if (targetPos.x > this.maxMoveX) {
      targetPos.x = this.maxMoveX
    }
    if (targetPos.x < -this.maxMoveX) {
      targetPos.x = -this.maxMoveX
    }
    this.node.setPosition(targetPos)
    if (deltaX > 0.5) {
      this.node.scale = new Vec3(-1, 1, 1)
    } else if (deltaX < -0.5) {
      this.node.scale = new Vec3(1, 1, 1)
    }
  }

  onCollisionEnter(selfCollider: Collider2D, otherCollider: Collider2D) {
    if (GlobalData.gameState != GameState.PLAYING) {
      return
    }
    if (otherCollider.tag === 2) {
      GlobalData.curRoundTotalScore += GlobalData.addScore
      EventDispatcher.getTarget().emit(EventDispatcher.DINO_EAT_NOTE)
      otherCollider.node.getComponent(NoteControl).noteBeEaten()
      this.addDinoNeckLength()
      this.playEatNoteAnimation()
      this.playBombEffect()
      let isPassLevel = this.checkIsPassLevel()
      if (isPassLevel) {
        EventDispatcher.getTarget().emit(EventDispatcher.PASS_LEVEL)
      }
    }
  }

  addDinoNeckLength() {
    let neckNode = new Node()
    let sprite = neckNode.addComponent(Sprite)
    sprite.color = new Color(GlobalData.currentDinoInfo?.dinoColor)
    sprite.spriteFrame = this.neckSpriteFrame
    neckNode.parent = this.node.getChildByName('dino_neck_box')
    let bodyNode: Node = this.node.getChildByName('dino_body')
    let bodyPos: Vec3 = bodyNode.getPosition()
    bodyNode.setPosition(bodyPos.x, bodyPos.y - this.neckHeight, 0)
  }

  playEatNoteAnimation() {
    let neckList: Node[] = this.node
      .getChildByName('dino_neck_box')
      .children.slice(0, 16) as Node[]
    let animationPromise = Promise.resolve()
    for (let i = 0; i < neckList.length; i++) {
      const node = neckList[i]
      animationPromise = animationPromise.then(() => {
        return new Promise<void>((resolve) => {
          tween(node)
            .to(0.1, { scale: new Vec3(1.2, 1, 1) })
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .call(() => resolve())
            .start()
        })
      })
    }
  }

  playBombEffect() {
    let bombEffectNode = instantiate(this.boomPrefab)
    let bombPos = new Vec3(this.node.position.x, this.node.position.y + 100, 0)
    bombEffectNode.setPosition(bombPos)
    bombEffectNode.setParent(this.node.parent)
    bombEffectNode.getComponent(BombEffectControl).playBombEffect()
  }

  moveDinoToLine() {
    let linePos: Vec3 = this.lineNode.getWorldPosition()
    let dinoPos: Vec3 = this.node.getChildByName('dino_body').getWorldPosition()
    let distance = linePos.y - dinoPos.y - 44
    tween(this.node)
      .by(1, { position: new Vec3(0, distance, 0) })
      .start()
  }

  checkIsPassLevel() {
    let noteManager = director
      .getScene()
      .getChildByName('Canvas')
      .getChildByName('note_manager') as Node
    if (noteManager?.children?.length == 0) {
      return true
    } else {
      return false
    }
  }

  resumeGame() {
    let isPassLevel = this.checkIsPassLevel()
    if (isPassLevel) {
      EventDispatcher.getTarget().emit(EventDispatcher.PASS_LEVEL)
    }
  }

  update(deltaTime: number) {}
}