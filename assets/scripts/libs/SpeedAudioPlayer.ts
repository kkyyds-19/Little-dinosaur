import { _decorator, AudioClip, sys } from 'cc'
const { ccclass } = _decorator

declare const wx: any

@ccclass('SpeedAudioPlayer')
export class SpeedAudioPlayer {
  private audioElement: HTMLAudioElement | null = null
  private innerAudioContext: any = null
  private currentPlayRate: number = 1.0
  private volume: number = 1.0
  private isPlaying: boolean = false
  private isPaused: boolean = false
  private lastPlayState: { rate: number; position: number } = {
    rate: 1.0,
    position: 0
  }
  private currentAudioClip: AudioClip | null = null

  async init(audioClip: AudioClip) {
    if (!audioClip) {
      console.error('SpeedAudioPlayer: 音频剪辑不能为空')
      return
    }
    this.currentAudioClip = audioClip
    if (this.isH5Platform()) {
      await this.initH5(audioClip)
    } else if (this.isWxGamePlatform()) {
      await this.initWxGame(audioClip)
    } else {
      console.error('SpeedAudioPlayer: 暂不支持当前运行平台')
    }
  }

  async changeAudioClip(newAudioClip: AudioClip, keepState: boolean = true) {
    if (!newAudioClip) {
      console.error('SpeedAudioPlayer: 切换音频失败，音频剪辑不能为空')
      return
    }
    if (keepState) {
      this.lastPlayState.rate = this.currentPlayRate
      this.lastPlayState.position = this.getCurrentPlayTime()
    } else {
      this.lastPlayState = { rate: 1.0, position: 0 }
    }
    this.stop()
    await this.init(newAudioClip)
    if (keepState) {
      this.currentPlayRate = this.lastPlayState.rate
      this.setPlayRate(this.currentPlayRate)
      if (this.isPaused) {
        this.seek(this.lastPlayState.position)
        console.log(
          `SpeedAudioPlayer: 切换音频后保留暂停状态，位置：${this.lastPlayState.position.toFixed(
            3
          )}秒`
        )
      } else if (this.isPlaying) {
        this.play(this.currentPlayRate, this.lastPlayState.position)
      }
    }
    console.log('SpeedAudioPlayer: 音频文件切换成功')
  }

  play(playRate: number = 1.0, startAt: number = 0) {
    this.currentPlayRate = Math.max(0.5, Math.min(playRate, 2.0))
    startAt = Math.max(0, Math.min(startAt, this.getTotalDuration()))
    if (this.isH5Platform() && this.audioElement) {
      this.audioElement.playbackRate = this.currentPlayRate
      this.audioElement.currentTime = startAt
      this.audioElement
        .play()
        .then(() => {
          this.updatePlayState(true, false)
          console.log(
            `SpeedAudioPlayer: H5 播放开始，速率：${
              this.currentPlayRate
            }，起始位置：${startAt.toFixed(3)}秒`
          )
        })
        .catch((e) => {
          console.error('SpeedAudioPlayer: H5 播放失败（需用户交互触发）：', e)
        })
    } else if (this.isWxGamePlatform() && this.innerAudioContext) {
      this.innerAudioContext.playbackRate = this.currentPlayRate
      this.innerAudioContext.seek(startAt)
      this.innerAudioContext.play()
      this.updatePlayState(true, false)
      this.lastPlayState.position = startAt
      console.log(
        `SpeedAudioPlayer: 微信小游戏播放开始，速率：${
          this.currentPlayRate
        }，起始位置：${startAt.toFixed(3)}秒`
      )
    } else {
      console.warn('SpeedAudioPlayer: 音频未初始化完成，无法播放')
    }
  }

  pause() {
    if (!this.isPlaying || this.isPaused) {
      console.warn('SpeedAudioPlayer: 音频未播放或已暂停，无法暂停')
      return
    }
    if (this.isH5Platform() && this.audioElement) {
      this.audioElement.pause()
      const pausePos = this.audioElement.currentTime
      this.cachePausePosition(pausePos)
      this.updatePlayState(false, true)
    } else if (this.isWxGamePlatform() && this.innerAudioContext) {
      this.innerAudioContext.pause()
      const pausePos = this.innerAudioContext.currentTime
      this.cachePausePosition(pausePos)
      this.updatePlayState(false, true)
    }
  }

  resume() {
    if (!this.isPaused) {
      console.warn('SpeedAudioPlayer: 音频未暂停，无法恢复播放')
      return
    }
    const resumePos = this.lastPlayState.position
    if (this.isH5Platform() && this.audioElement) {
      this.audioElement.currentTime = resumePos
      this.audioElement
        .play()
        .then(() => {
          this.updatePlayState(true, false)
          console.log(
            `SpeedAudioPlayer: H5 恢复播放，从${resumePos.toFixed(3)}秒开始`
          )
        })
        .catch((e) => {
          console.error('SpeedAudioPlayer: H5 恢复播放失败：', e)
        })
    } else if (this.isWxGamePlatform() && this.innerAudioContext) {
      this.innerAudioContext.playbackRate = this.currentPlayRate
      this.innerAudioContext.seek(resumePos)
      this.innerAudioContext.play()
      this.updatePlayState(true, false)
      console.log(
        `SpeedAudioPlayer: 微信小游戏恢复播放，速率：${
          this.currentPlayRate
        }，从${resumePos.toFixed(3)}秒开始`
      )
    }
  }

  stop() {
    if (this.isH5Platform() && this.audioElement) {
      this.audioElement.pause()
      this.audioElement.currentTime = 0
    } else if (this.isWxGamePlatform() && this.innerAudioContext) {
      this.innerAudioContext.pause()
      this.innerAudioContext.seek(0)
    }
    this.updatePlayState(false, false)
    this.lastPlayState.position = 0
    console.log('SpeedAudioPlayer: 停止播放，状态已重置')
  }

  setPlayRate(playRate: number) {
    this.currentPlayRate = Math.max(0.5, Math.min(playRate, 2.0))
    this.lastPlayState.rate = this.currentPlayRate
    if (this.isH5Platform() && this.audioElement) {
      this.audioElement.playbackRate = this.currentPlayRate
    } else if (this.isWxGamePlatform() && this.innerAudioContext) {
      this.innerAudioContext.playbackRate = this.currentPlayRate
      if (this.isPlaying) {
        const currentPosition = this.getCurrentPlayTime()
        this.innerAudioContext.pause()
        this.innerAudioContext.seek(currentPosition)
        this.innerAudioContext.play()
        console.log(
          `SpeedAudioPlayer: 微信小游戏重启播放以应用新速率，当前位置：${currentPosition.toFixed(
            3
          )}秒`
        )
      }
    }
    console.log(`SpeedAudioPlayer: 速率已调整为：${this.currentPlayRate}`)
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(volume, 1))
    if (this.isH5Platform() && this.audioElement) {
      this.audioElement.volume = this.volume
    } else if (this.isWxGamePlatform() && this.innerAudioContext) {
      this.innerAudioContext.volume = this.volume
    }
    console.log(`SpeedAudioPlayer: 音量已设置为：${this.volume}`)
  }

  getTotalDuration(): number {
    if (this.isH5Platform() && this.audioElement) {
      return this.audioElement.duration || 0
    } else if (this.isWxGamePlatform() && this.innerAudioContext) {
      return this.innerAudioContext.duration || 0
    }
    return 0
  }

  getCurrentPlayTime(): number {
    if (this.isH5Platform() && this.audioElement) {
      return this.audioElement.currentTime || 0
    } else if (this.isWxGamePlatform() && this.innerAudioContext) {
      return this.innerAudioContext.currentTime || 0
    }
    return 0
  }

  getPlayState() {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentPlayRate: this.currentPlayRate,
      currentPlayTime: this.getCurrentPlayTime(),
      totalDuration: this.getTotalDuration(),
      volume: this.volume,
      platform: this.getCurrentPlatform()
    }
  }

  destroy() {
    if (this.isH5Platform() && this.audioElement) {
      this.stop()
      this.audioElement.remove()
      this.audioElement = null
    } else if (this.isWxGamePlatform() && this.innerAudioContext) {
      this.stop()
      this.innerAudioContext.offCanplay()
      this.innerAudioContext.offEnded()
      this.innerAudioContext.offError()
      this.innerAudioContext.destroy()
      this.innerAudioContext = null
    }
    this.currentAudioClip = null
    console.log(`SpeedAudioPlayer: ${this.getCurrentPlatform()} 资源已销毁`)
  }

  private async initH5(audioClip: AudioClip) {
    if (!this.audioElement) {
      this.audioElement = document.createElement('audio')
      this.audioElement.preload = 'auto'
      this.audioElement.onended = () => {
        this.updatePlayState(false, false)
        this.lastPlayState.position = 0
        console.log('SpeedAudioPlayer: H5 音频播放结束')
      }
    }
    this.audioElement.src = audioClip.nativeUrl
    await new Promise((resolve, reject) => {
      const onCanplayCallback = () => {
        this.audioElement!.removeEventListener(
          'canplaythrough',
          onCanplayCallback
        )
        resolve(true)
      }
      this.audioElement!.addEventListener('canplaythrough', onCanplayCallback)
      this.audioElement!.addEventListener('error', (e) => {
        reject(new Error(`H5 音频加载失败：${e}`))
      })
    })
    this.audioElement.volume = this.volume
    this.audioElement.playbackRate = this.currentPlayRate
    console.log(
      'SpeedAudioPlayer: H5 音频初始化成功，总时长：',
      this.getTotalDuration().toFixed(2),
      '秒'
    )
  }

  private async initWxGame(audioClip: AudioClip) {
    if (!this.innerAudioContext) {
      this.innerAudioContext = wx.createInnerAudioContext()
      this.innerAudioContext.volume = this.volume
      this.innerAudioContext.playbackRate = this.currentPlayRate
      this.innerAudioContext.loop = false
      this.innerAudioContext.onCanplay(() => {
        console.log(
          'SpeedAudioPlayer: 微信小游戏音频加载完成，总时长：',
          this.getTotalDuration().toFixed(2),
          '秒'
        )
      })
      this.innerAudioContext.onEnded(() => {
        this.updatePlayState(false, false)
        this.lastPlayState.position = 0
        console.log('SpeedAudioPlayer: 微信小游戏音频播放结束')
      })
      this.innerAudioContext.onError((err: any) => {
        console.error('SpeedAudioPlayer: 微信小游戏音频发生错误：', err)
        this.updatePlayState(false, false)
      })
    }
    this.innerAudioContext.src = audioClip.nativeUrl
    await new Promise((resolve) => {
      const onCanplayCallback = () => {
        this.innerAudioContext.offCanplay(onCanplayCallback)
        resolve(true)
      }
      if (this.innerAudioContext.readyState === 'canplay') {
        resolve(true)
      } else {
        this.innerAudioContext.onCanplay(onCanplayCallback)
      }
    })
    this.innerAudioContext.volume = this.volume
    this.innerAudioContext.playbackRate = this.currentPlayRate
  }

  private isH5Platform(): boolean {
    return sys.isBrowser && sys.platform !== sys.Platform.WECHAT_GAME
  }

  private isWxGamePlatform(): boolean {
    return sys.platform === sys.Platform.WECHAT_GAME
  }

  private getCurrentPlatform(): string {
    if (this.isH5Platform()) return 'H5'
    if (this.isWxGamePlatform()) return '微信小游戏'
    return '未知平台'
  }

  private updatePlayState(isPlaying: boolean, isPaused: boolean) {
    this.isPlaying = isPlaying
    this.isPaused = isPaused
  }

  private cachePausePosition(position: number) {
    const clampPos = Math.max(0, Math.min(position, this.getTotalDuration()))
    this.lastPlayState.position = clampPos
    console.log(
      `SpeedAudioPlayer: 暂停成功，当前位置：${clampPos.toFixed(3)}秒`
    )
  }

  private seek(position: number) {
    const clampPos = Math.max(0, Math.min(position, this.getTotalDuration()))
    if (this.isH5Platform() && this.audioElement) {
      this.audioElement.currentTime = clampPos
    } else if (this.isWxGamePlatform() && this.innerAudioContext) {
      this.innerAudioContext.seek(clampPos)
    }
  }
}