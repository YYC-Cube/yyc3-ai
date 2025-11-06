// 预览管理器 - 处理实时预览和热重载
export interface PreviewConfig {
  autoRefresh: boolean
  refreshDelay: number
  showConsole: boolean
  showErrors: boolean
}

export interface PreviewState {
  isLoading: boolean
  error: string | null
  lastUpdate: Date
  renderCount: number
}

export class PreviewManager {
  private config: PreviewConfig
  private state: PreviewState
  private refreshTimer: NodeJS.Timeout | null = null
  private listeners: Set<(state: PreviewState) => void> = new Set()

  constructor(config: Partial<PreviewConfig> = {}) {
    this.config = {
      autoRefresh: true,
      refreshDelay: 500,
      showConsole: true,
      showErrors: true,
      ...config,
    }

    this.state = {
      isLoading: false,
      error: null,
      lastUpdate: new Date(),
      renderCount: 0,
    }
  }

  subscribe(listener: (state: PreviewState) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.state))
  }

  updateConfig(config: Partial<PreviewConfig>) {
    this.config = { ...this.config, ...config }
  }

  scheduleRefresh(callback: () => void) {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }

    if (this.config.autoRefresh) {
      this.refreshTimer = setTimeout(() => {
        this.refresh(callback)
      }, this.config.refreshDelay)
    }
  }

  async refresh(callback: () => void) {
    this.state.isLoading = true
    this.state.error = null
    this.notify()

    try {
      await callback()
      this.state.renderCount++
      this.state.lastUpdate = new Date()
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : String(error)
    } finally {
      this.state.isLoading = false
      this.notify()
    }
  }

  clearError() {
    this.state.error = null
    this.notify()
  }

  getState(): PreviewState {
    return { ...this.state }
  }

  destroy() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }
    this.listeners.clear()
  }
}

// 生成预览 HTML
export function generatePreviewHTML(code: string, language: string): string {
  if (language === "html") {
    return code
  }

  if (language === "javascript" || language === "typescript") {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      margin: 0; 
      padding: 20px; 
      font-family: system-ui, -apple-system, sans-serif;
      background: #fff;
      color: #000;
    }
    @media (prefers-color-scheme: dark) {
      body { background: #000; color: #fff; }
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    ${code}
  </script>
</body>
</html>
    `
  }

  if (language === "react" || language === "jsx" || language === "tsx") {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { 
      margin: 0; 
      padding: 20px; 
      font-family: system-ui, -apple-system, sans-serif;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${code}
    
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>
    `
  }

  return `<pre>${code}</pre>`
}

export const previewManager = new PreviewManager()
export default previewManager
