import {
  _decorator,
  AudioClip,
  Component,
  instantiate,
  Label,
  Node,
  Prefab,
  Vec3
} from 'cc'
import GlobalData from '../../config/GlobalData'
import { EventDispatcher } from '../../libs/EventDispatcher'
import Common from '../../libs/Common'
import { NoteControl } from '../components/NoteControl'

const { ccclass, property } = _decorator

@ccclass('NoteManager')
export class NoteManager extends Component {
  @property(Prefab)
  notePrefab: Prefab = null

  @property(AudioClip)
  currentAudioClip: AudioClip = null

  @property(Node)
  lineNode: Node = null

  @property(Label)
  noteCountLabel: Label = null

  private linePosition: Vec3 = new Vec3(0, 0, 0)
  private noteArray: any[] = []

  async onLoad() {
    EventDispatcher.getTarget().on(
      EventDispatcher.CLEAR_ALL_NOTES,
      this.clearAllNotes,
      this
    )
    EventDispatcher.getTarget().on(
      EventDispatcher.PASS_LEVEL,
      this.reGenerateNotes,
      this
    )
    this.linePosition = this.lineNode.getPosition()
  }

  async start() {
    this.noteArray = await Common.loadMusicNoteData(GlobalData.selectedMusicID)
    this.createNotesToScene()
    this.updateNoteCount()
  }

  async reGenerateNotes() {
    this.clearAllNotes()
    this.noteArray = await Common.loadMusicNoteData(GlobalData.selectedMusicID)
    this.createNotesToScene()
    this.updateNoteCount()
  }

  createNotesToScene() {
    for (let i = this.noteArray.length - 1; i >= 0; i--) {
      this.createNoteNode(this.noteArray[i])
    }
  }

  createNoteNode(noteItem?: any) {
    const noteNode: Node = instantiate(this.notePrefab)
    let noteX = 0
    if (noteItem.trackType == 0) {
      noteX = this.linePosition.x - 180
    } else if (noteItem.trackType == 1) {
      noteX = this.linePosition.x
    } else if (noteItem.trackType == 2) {
      noteX = this.linePosition.x + 180
    }
    let noteY = GlobalData.noteSpeed * noteItem.timePoint + this.linePosition.y
    noteNode.setPosition(noteX, noteY, 0)
    this.node.addChild(noteNode)
    noteNode.getComponent(NoteControl).initNote()
  }

  clearAllNotes() {
    this.node.removeAllChildren()
  }

  updateNoteCount() {
    this.noteCountLabel.string = 'Tempo: ' + this.noteArray.length
  }

  update(deltaTime: number) {}
}