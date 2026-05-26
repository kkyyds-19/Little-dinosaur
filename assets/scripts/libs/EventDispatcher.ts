import { _decorator } from 'cc'
import { EventTarget } from 'cc'
const { ccclass, property } = _decorator

const event_target = new EventTarget()

export class EventDispatcher {
  private static data: EventDispatcher

  public static TIPS_MSG = 'tips_msg'
  public static GAME_START = 'game_start'
  public static GAME_OVER = 'game_over'
  public static GAME_PAUSE = 'game_pause'
  public static GAME_RESUME = 'game_resume'
  public static PASS_LEVEL = 'pass_level'
  public static DINO_EAT_NOTE = 'dino_eat_note'
  public static CLEAR_ALL_NOTES = 'clear_all_notes'
  public static CLEAR_SCREEN_NOTES = 'clear_screen_notes'
  public static MOVE_DINO_TO_LINE = 'move_dino_to_line'
  public static ENABLE_MOVE_DINO = 'enable_move_dino'
  public static SHOW_RESULT_MODAL = 'show_result_modal'
  public static SHOW_PAUSE_MODAL = 'show_pause_modal'
  public static SHOW_CONTINUE_MODAL = 'show_continue_modal'
  public static UPDATE_LIFE = 'update_life'
  public static SELECT_MOOD_ITEM = 'select_mood_item'
  public static UNLOCK_MOOD_ITEM = 'unlock_mood_item'

  static getTarget(): EventTarget {
    if (EventDispatcher.data == null) {
      EventDispatcher.data = new EventDispatcher()
    }
    return EventDispatcher.data.getEventTarget()
  }

  private getEventTarget(): EventTarget {
    return event_target
  }
}