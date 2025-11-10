export class TypewriterEffect {
  private text = ""
  private currentIndex = 0
  private speed = 30
  private onUpdate: (text: string) => void
  private onComplete?: () => void
  private isPaused = false
  private intervalId: NodeJS.Timeout | null = null

  constructor(config: {
    text: string
    speed?: number
    onUpdate: (text: string) => void
    onComplete?: () => void
  }) {
    this.text = config.text
    this.speed = config.speed || 30
    this.onUpdate = config.onUpdate
    this.onComplete = config.onComplete
  }

  start() {
    if (this.intervalId) return

    this.intervalId = setInterval(() => {
      if (this.isPaused) return

      if (this.currentIndex < this.text.length) {
        this.currentIndex++
        this.onUpdate(this.text.slice(0, this.currentIndex))
      } else {
        this.stop()
        this.onComplete?.()
      }
    }, this.speed)
  }

  pause() {
    this.isPaused = true
  }

  resume() {
    this.isPaused = false
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  skip() {
    this.stop()
    this.currentIndex = this.text.length
    this.onUpdate(this.text)
    this.onComplete?.()
  }
}
