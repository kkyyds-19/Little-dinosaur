import {
  _decorator,
  AudioClip,
  AudioSource,
  Component,
  EditBox,
  EventTouch,
  Input,
  input,
  instantiate,
  KeyCode,
  Node,
  Prefab,
  ProgressBar,
  tween,
  UITransform,
  Vec3
} from 'cc'
import GlobalData from '../../config/GlobalData'
const { ccclass, property } = _decorator

@ccclass('RhythmSceneControl')
export class RhythmSceneControl extends Component {
  @property(Node)
  clickArea: Node = null

  @property(ProgressBar)
  progressBar: ProgressBar = null

  @property(Prefab)
  rhythmNotePrefab: Prefab = null

  @property(Node)
  lineNode: Node = null

  @property(AudioClip)
  currentAudioClip: AudioClip = null

  @property(EditBox)
  outputInputBox: EditBox = null

  audioSource: AudioSource = null
  trackPositions: Vec3[] = []
  rhythmNoteHeight: number = 62
  musicDuration: number = 0
  currentTrackIndex: number = -1
  rhythmNoteInterval: number = 0
  elapsedTime: number = 0
  noteInfoList: any[] = []

  private keyTrackMap: { [key: number]: number } = {
    [KeyCode.KEY_A]: 0,
    [KeyCode.KEY_S]: 1,
    [KeyCode.KEY_D]: 2
  }

  onLoad(): void {
    this.rhythmNoteInterval =
      this.rhythmNoteHeight / GlobalData.noteSpeed - 0.02
    this.audioSource = this.node.getComponent(AudioSource)
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this)
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this)
    this.clickArea?.on(Node.EventType.TOUCH_START, this.touchStart, this)
    this.clickArea?.on(Node.EventType.TOUCH_END, this.touchEnd, this)
    this.clickArea?.on(Node.EventType.TOUCH_CANCEL, this.touchEnd, this)
  }

  start() {
    let baseLinePosition = this.lineNode.getPosition()
    this.trackPositions = [
      new Vec3(baseLinePosition.x - 180, baseLinePosition.y, 0),
      new Vec3(baseLinePosition.x, baseLinePosition.y, 0),
      new Vec3(baseLinePosition.x + 180, baseLinePosition.y, 0)
    ]
    this.musicDuration = this.getAudioDuration()
  }

  getAudioDuration(): number {
    if (this.currentAudioClip) {
      return this.currentAudioClip.getDuration()
    }
    return 0
  }

  touchStart(event: EventTouch) {
    let touchPosition = event.getUILocation()
    for (let i = 0; i < this.clickArea.children.length; i++) {
      if (
        this.clickArea.children[i]
          .getComponent(UITransform)
          .getBoundingBoxToWorld()
          .contains(touchPosition)
      ) {
        this.currentTrackIndex = i
        break
      }
    }
    if (this.currentTrackIndex !== -1) {
      let buttonNode = this.clickArea.children[this.currentTrackIndex]
      tween(buttonNode)
        .to(0.1, { scale: new Vec3(0.9, 0.9, 1) })
        .start()
      if (this.audioSource.playing) {
        this.elapsedTime = 0
        this.createRhythmNote(this.currentTrackIndex)
      }
    }
  }

  touchEnd() {
    if (this.currentTrackIndex == -1) {
      return
    }
    let buttonNode = this.clickArea.children[this.currentTrackIndex]
    tween(buttonNode)
      .to(0.1, { scale: new Vec3(1, 1, 1) })
      .start()
    this.currentTrackIndex = -1
    this.elapsedTime = 0
  }

  createRhythmNote(trackType: number) {
    const rhythmNoteNode: Node = instantiate(this.rhythmNotePrefab)
    rhythmNoteNode.setParent(this.node)
    rhythmNoteNode.setPosition(this.trackPositions[trackType])
    let noteInfo = {
      trackType: trackType,
      timePoint: this.audioSource.currentTime
    }
    this.noteInfoList.push(noteInfo)
  }

  onKeyDown(event: any) {
    if (event.keyCode === KeyCode.SPACE) {
      this.switchMusic()
    } else if (this.keyTrackMap.hasOwnProperty(event.keyCode)) {
      if (this.audioSource.playing) {
        const trackIndex = this.keyTrackMap[event.keyCode]
        this.currentTrackIndex = trackIndex
        this.elapsedTime = 0
        this.createRhythmNote(trackIndex)
      }
    }
  }

  onKeyUp(event: any) {
    if (this.keyTrackMap.hasOwnProperty(event.keyCode)) {
      this.touchEnd()
    }
  }

  switchMusic() {
    if (this.audioSource.playing) {
      this.pauseMusic()
    } else {
      this.playMusic()
    }
  }

  playMusic() {
    const audioClip = this.currentAudioClip
    if (!audioClip) {
      return
    }
    this.audioSource.clip = audioClip
    this.audioSource.play()
  }

  pauseMusic() {
    this.audioSource.pause()
  }

  stopMusic() {
    this.audioSource.stop()
  }

  saveNoteInfoList() {
    this.outputInputBox.string = this.noteInfoList.length
      ? JSON.stringify(this.noteInfoList)
      : ''
  }

  update(deltaTime: number) {
    if (this.musicDuration > 0 && this.audioSource.playing) {
      let currentTime = this.audioSource.currentTime
      if (currentTime <= 0) {
        return
      }
      let progress = currentTime / this.musicDuration
      progress = Math.round(progress * 100) / 100
      this.progressBar.progress = progress
      if (this.currentTrackIndex !== -1) {
        this.elapsedTime += deltaTime
        if (this.elapsedTime >= this.rhythmNoteInterval) {
          this.elapsedTime = 0
          this.createRhythmNote(this.currentTrackIndex)
        }
      }
    }
  }
}