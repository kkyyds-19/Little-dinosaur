export enum GameState {
  WAIT_START = 0,
  PLAYING = 1,
  GAME_OVER = 2,
  PAUSE = 3
}

export class GameStorageKeyConfig {
  static MusicNoteList: string = '_dino_music_note_list'
  static BestScore: string = '_dino_best_score'
  static TotalScore: string = '_dino_total_score'
  static SelectedMusicID: string = '_dino_selected_music_id'
  static UnlockMusicIDList: string = '_dino_unlock_music_id_list'
  static SelectedDinoID: string = '_dino_selected_dino_id'
  static UnlockDinoIDList: string = '_dino_unlock_dino_id_list'
  static CurrentDinoInfo: string = '_dino_current_dino_info'
  static CurrentMusicInfo: string = '_dino_current_music_info'
}