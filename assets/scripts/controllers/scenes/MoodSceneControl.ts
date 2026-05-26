import {
  _decorator,
  AudioClip,
  AudioSource,
  Color,
  Component,
  director,
  instantiate,
  Label,
  Node,
  Prefab,
  resources,
  Vec3
} from 'cc'
import { MoodListItem } from '../ui/MoodListItem'
import { EventDispatcher } from '../../libs/EventDispatcher'
import AudioEffect from '../../libs/AudioEffect'
import GlobalData from '../../config/GlobalData'
import Common from '../../libs/Common'
import { GameStorageKeyConfig } from '../../config/Config'
import Utils from '../../libs/Utils'
import { BombEffectControl } from '../effects/BombEffectControl'
const { ccclass, property } = _decorator

@ccclass('MoodSceneControl')
export class MoodSceneControl extends Component {
  @property(Prefab)
  moodItemPrefab: Prefab = null

  @property(Node)
  contentNode: Node = null

  @property(Node)
  buttonGroupNode: Node = null

  @property(Label)
  totalScoreLabel: Label = null

  @property(Prefab)
  boomPrefab: Prefab = null!

  private selectedMusicID: number = 0
  private audioSource: AudioSource = null!
  private isClickedBtn: boolean = false

  musicList: any[] = [
    {
      id: 1,
      title: 'Like A Dino!',
      bestScore: 0,
      isLocked: 0,
      unlockGold: 0
    },
    {
      id: 2,
      title: "It's Ok,Not To Be Ok!",
      bestScore: 0,
      isLocked: 1,
      unlockGold: 1000
    },
    {
      id: 3,
      title: 'Good Luck Today!',
      bestScore: 0,
      isLocked: 1,
      unlockGold: 2000
    },
    {
      id: 4,
      title: 'A Piece Of Cake!',
      bestScore: 0,
      isLocked: 1,
      unlockGold: 3000
    },
    {
      id: 5,
      title: 'Im So Excited!',
      bestScore: 0,
      isLocked: 1,
      unlockGold: 4000
    },
    {
      id: 6,
      title: 'It Is What It Is!',
      bestScore: 0,
      isLocked: 1,
      unlockGold: 5000
    },
    {
      id: 7,
      title: 'A Silver Lining!',
      bestScore: 0,
      isLocked: 1,
      unlockGold: 6000
    },
    {
      id: 8,
      title: 'So Suβ!',
      bestScore: 0,
      isLocked: 1,
      unlockGold: 7000
    },
    {
      id: 9,
      title: 'You Made My Day!',
      bestScore: 0,
      isLocked: 1,
      unlockGold: 8000
    }
  ]

  onLoad() {
    this.audioSource = this.node.getComponent(AudioSource)
    this.initMusicListLockStates()
  }

  start() {
    EventDispatcher.getTarget().on(
      EventDispatcher.SELECT_MOOD_ITEM,
      this.refreshButtonDisplay,
      this
    )
    this.setTotalScoreLabel()
    this.setBackgroundColor()
    this.addMoodListItems()
  }

  initMusicListLockStates() {
    let bestScoreMap: any = Utils.getCache(GameStorageKeyConfig.BestScore) || {}
    Common.unlockMusic(1)
    this.musicList.forEach((item) => {
      item.isLocked = Common.isMusicUnlocked(item.id) ? 0 : 1
      item.bestScore = bestScoreMap[item.id] || 0
    })
  }

  setBackgroundColor() {
    const dinoInfo = GlobalData.currentDinoInfo
    Common.setPageBackgroundColor(
      this.node.getChildByName('bg'),
      new Color(dinoInfo?.bgColor)
    )
  }

  addMoodListItems() {
    this.musicList.forEach((item) => {
      let moodItem = instantiate(this.moodItemPrefab)
      moodItem.getComponent(MoodListItem).init(item)
      this.contentNode.addChild(moodItem)
    })
  }

  setTotalScoreLabel() {
    this.totalScoreLabel.string = GlobalData.totalScore.toString()
  }

  backToHome() {
    AudioEffect.playClickAudio()
    director.loadScene('home')
  }

  confirmSelectMusic() {
    AudioEffect.playClickAudio()
    if (this.selectedMusicID > 0) {
      GlobalData.selectedMusicID = this.selectedMusicID
      GlobalData.currentMusicInfo = this.musicList[this.selectedMusicID - 1]
    }
    this.playBombEffect()
    this.scheduleOnce(() => {
      director.loadScene('home')
    }, 0.4)
  }

  buyMusic() {
    if (this.isClickedBtn) {
      return
    }
    this.isClickedBtn = true
    setTimeout(() => {
      this.isClickedBtn = false
    }, 1000)
    AudioEffect.playClickAudio()
    let selectedMusic = this.musicList.find(
      (item) => item.id === this.selectedMusicID
    )
    if (!selectedMusic) {
      return
    }
    if (GlobalData.totalScore >= selectedMusic.unlockGold) {
      GlobalData.totalScore -= selectedMusic.unlockGold
      this.setTotalScoreLabel()
      EventDispatcher.getTarget().emit(
        EventDispatcher.UNLOCK_MOOD_ITEM,
        this.selectedMusicID
      )
      this.playBombEffect()
    } else {
      EventDispatcher.getTarget().emit(
        EventDispatcher.TIPS_MSG,
        'Not Enough Coins!'
      )
    }
  }

  refreshButtonDisplay(musicID: number) {
    this.selectedMusicID = musicID
    let selectedMusic = this.musicList.find((item) => item.id === musicID)
    if (selectedMusic.isLocked) {
      this.buttonGroupNode.getChildByName('button_buy')!.active = true
      this.buttonGroupNode.getChildByName('button_cancel')!.active = true
      this.buttonGroupNode.getChildByName('button_ok')!.active = false
      this.buttonGroupNode
        .getChildByName('button_buy')!
        .getChildByName('gold_num')!
        .getComponent(Label).string =
        selectedMusic?.unlockGold?.toString() || '0'
    } else {
      this.buttonGroupNode.getChildByName('button_buy')!.active = false
      this.buttonGroupNode.getChildByName('button_cancel')!.active = false
      this.buttonGroupNode.getChildByName('button_ok')!.active = true
    }
    this.playMusic()
  }

  private playMusic() {
    if (!this.selectedMusicID) {
      return
    }
    let musicPath = 'audios/music/music_' + this.selectedMusicID
    if (this.audioSource) {
      resources.load(musicPath, (err, clip: AudioClip) => {
        if (err) {
          console.log(err)
        } else {
          this.audioSource.stop()
          this.audioSource.clip = clip
          this.audioSource.play()
          this.audioSource.volume = 1
        }
      })
    }
  }

  playBombEffect() {
    let bombEffectNode = instantiate(this.boomPrefab)
    let bombPos = new Vec3(0, 0, 0)
    bombEffectNode.setPosition(bombPos)
    bombEffectNode.setParent(this.buttonGroupNode.getChildByName('button_ok'))
    bombEffectNode.getComponent(BombEffectControl).playBombEffect()
  }

  protected onDestroy(): void {
    if (this.audioSource) {
      this.audioSource.stop()
    }
  }
}