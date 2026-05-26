import {
  _decorator,
  Component,
  director,
  Label,
  PageView,
  Node,
  Color,
  Prefab,
  instantiate,
  Vec3
} from 'cc'
import AudioEffect from '../../libs/AudioEffect'
import GlobalData from '../../config/GlobalData'
import { EventDispatcher } from '../../libs/EventDispatcher'
import Common from '../../libs/Common'
import { BombEffectControl } from '../effects/BombEffectControl'
const { ccclass, property } = _decorator

@ccclass('LoveStorySceneControl')
export class LoveStorySceneControl extends Component {
  @property(Label)
  totalScoreLabel: Label = null!

  @property(Label)
  storyDescLabel: Label = null!

  @property(PageView)
  pageViewComp: PageView = null!

  @property(Node)
  buttonGroupNode: Node = null!

  @property(Prefab)
  boomPrefab: Prefab = null!

  private selectedDinoID: number = 0
  private isClickedBtn: boolean = false

  dinoList: any[] = [
    {
      id: 1,
      name: '小恐龙1',
      desc: 'Dino:Will you marry me?',
      isLocked: 0,
      unlockGold: 0,
      dinoColor: '#ffffff',
      bgColor: '#cce5cd'
    },
    {
      id: 2,
      name: '小恐龙2',
      desc: 'Dina:Yes!',
      isLocked: 1,
      unlockGold: 1000,
      dinoColor: '#FFE064',
      bgColor: '#f3ffc8'
    },
    {
      id: 3,
      name: '小恐龙3',
      desc: 'Dino:I,Dino,Take you,my love,forever!',
      isLocked: 1,
      unlockGold: 2000,
      dinoColor: '#FD6445',
      bgColor: '#ffaf6d'
    },
    {
      id: 4,
      name: '小恐龙4',
      desc: 'Dino:I Love You!',
      isLocked: 1,
      unlockGold: 3000,
      dinoColor: '#9164FF',
      bgColor: '#a4a2ff'
    },
    {
      id: 5,
      name: '小恐龙5',
      desc: 'Dino:Yes,my love! ha,ha,ha!',
      isLocked: 1,
      unlockGold: 4000,
      dinoColor: '#FD64F2',
      bgColor: '#f19dff'
    }
  ]

  protected onLoad(): void {
    this.setBackgroundColor()
    this.initDinoListLockStates()
  }

  start() {
    this.setTotalScoreLabel()
    this.initPageView()
  }

  setBackgroundColor() {
    const dinoInfo = GlobalData.currentDinoInfo
    Common.setPageBackgroundColor(
      this.node.getChildByName('bg'),
      new Color(dinoInfo?.bgColor)
    )
  }

  initDinoListLockStates() {
    Common.unlockDino(1)
    this.dinoList.forEach((item) => {
      item.isLocked = Common.isDinoUnlocked(item.id) ? 0 : 1
    })
  }

  setTotalScoreLabel() {
    this.totalScoreLabel.string = GlobalData.totalScore.toString()
  }

  initPageView() {
    let index = this.dinoList.findIndex(
      (item) => item.id === GlobalData.selectedDinoID
    )
    if (index !== -1) {
      this.pageViewComp.setCurrentPageIndex(index)
      this.storyDescLabel.string =
        this.dinoList[index].desc || 'Dino:Will you marry me?'
      this.refreshButtonDisplay(index)
    }
  }

  backToHome() {
    AudioEffect.playClickAudio()
    director.loadScene('home')
  }

  confirmSelectDino() {
    AudioEffect.playClickAudio()
    if (this.selectedDinoID > 0) {
      GlobalData.selectedDinoID = this.selectedDinoID
      GlobalData.currentDinoInfo = this.dinoList[this.selectedDinoID - 1]
    }
    this.playBombEffect()
    this.scheduleOnce(() => {
      director.loadScene('home')
    }, 0.4)
  }

  buyDino() {
    if (this.isClickedBtn) {
      return
    }
    this.isClickedBtn = true
    setTimeout(() => {
      this.isClickedBtn = false
    }, 1000)
    AudioEffect.playClickAudio()
    let selectedDino = this.dinoList.find(
      (item) => item.id === this.selectedDinoID
    )
    if (!selectedDino) {
      return
    }
    if (GlobalData.totalScore >= selectedDino.unlockGold) {
      GlobalData.totalScore -= selectedDino.unlockGold
      this.setTotalScoreLabel()
      Common.unlockDino(this.selectedDinoID)
      let dinoIndex = this.selectedDinoID - 1
      this.dinoList[dinoIndex]!.isLocked = 0
      this.refreshButtonDisplay(dinoIndex)
      this.playBombEffect()
    } else {
      EventDispatcher.getTarget().emit(
        EventDispatcher.TIPS_MSG,
        'Not Enough Coins!'
      )
    }
  }

  refreshButtonDisplay(dinoIndex: number) {
    this.selectedDinoID = this.dinoList[dinoIndex]?.id || 1
    let selectedDino = this.dinoList[dinoIndex]
    if (selectedDino?.isLocked) {
      this.buttonGroupNode.getChildByName('button_buy')!.active = true
      this.buttonGroupNode.getChildByName('button_cancel')!.active = true
      this.buttonGroupNode.getChildByName('button_ok')!.active = false
      this.buttonGroupNode
        .getChildByName('button_buy')!
        .getChildByName('gold_num')!
        .getComponent(Label).string =
        selectedDino?.unlockGold?.toString() || '0'
    } else {
      this.buttonGroupNode.getChildByName('button_buy')!.active = false
      this.buttonGroupNode.getChildByName('button_cancel')!.active = false
      this.buttonGroupNode.getChildByName('button_ok')!.active = true
    }
  }

  onPageEvent(event: any) {
    const currentIndex = parseInt(event?.curPageIdx)
    this.selectedDinoID = this.dinoList[currentIndex]?.id || 1
    this.storyDescLabel.string =
      this.dinoList[currentIndex]?.desc || 'Dino:Will you marry me?'
    this.refreshButtonDisplay(currentIndex)
    Common.setPageBackgroundColor(
      this.node.getChildByName('bg'),
      new Color(this.dinoList[currentIndex]?.bgColor || '#cce5cd')
    )
  }

  playBombEffect() {
    let bombEffectNode = instantiate(this.boomPrefab)
    let bombPos = new Vec3(0, 0, 0)
    bombEffectNode.setPosition(bombPos)
    bombEffectNode.setParent(this.buttonGroupNode.getChildByName('button_ok'))
    bombEffectNode.getComponent(BombEffectControl).playBombEffect()
  }

  update(deltaTime: number) {}
}