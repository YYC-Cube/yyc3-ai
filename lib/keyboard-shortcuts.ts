// 全局快捷键系统 - 支持全键盘操作

export interface Shortcut {
  id: string
  keys: string
  description: string
  category: string
  action: () => void
  enabled: boolean
}

class KeyboardShortcutManager {
  private shortcuts: Map<string, Shortcut> = new Map()
  private isEnabled = true

  constructor() {
    this.registerDefaultShortcuts()
    this.initialize()
  }

  // 注册默认快捷键
  private registerDefaultShortcuts(): void {
    const defaults: Omit<Shortcut, "enabled">[] = [
      // 文件操作
      {
        id: "new-chat",
        keys: "Ctrl+N",
        description: "新建对话",
        category: "文件",
        action: () => this.emitEvent("new-chat"),
      },
      {
        id: "save",
        keys: "Ctrl+S",
        description: "保存",
        category: "文件",
        action: () => this.emitEvent("save"),
      },
      // 编辑
      {
        id: "undo",
        keys: "Ctrl+Z",
        description: "撤销",
        category: "编辑",
        action: () => this.emitEvent("undo"),
      },
      {
        id: "redo",
        keys: "Ctrl+Y",
        description: "重做",
        category: "编辑",
        action: () => this.emitEvent("redo"),
      },
      {
        id: "find",
        keys: "Ctrl+F",
        description: "查找",
        category: "编辑",
        action: () => this.emitEvent("find"),
      },
      // AI功能
      {
        id: "ai-complete",
        keys: "Ctrl+Space",
        description: "AI补全",
        category: "AI",
        action: () => this.emitEvent("ai-complete"),
      },
      {
        id: "ai-explain",
        keys: "Ctrl+E",
        description: "解释代码",
        category: "AI",
        action: () => this.emitEvent("ai-explain"),
      },
      {
        id: "ai-fix",
        keys: "Ctrl+.",
        description: "修复代码",
        category: "AI",
        action: () => this.emitEvent("ai-fix"),
      },
      // 导航
      {
        id: "toggle-sidebar",
        keys: "Ctrl+B",
        description: "切换侧边栏",
        category: "导航",
        action: () => this.emitEvent("toggle-sidebar"),
      },
      {
        id: "command-palette",
        keys: "Ctrl+P",
        description: "命令面板",
        category: "导航",
        action: () => this.emitEvent("command-palette"),
      },
      {
        id: "search",
        keys: "/",
        description: "搜索",
        category: "导航",
        action: () => this.emitEvent("search"),
      },
      // 视图
      {
        id: "zoom-in",
        keys: "Ctrl++",
        description: "放大",
        category: "视图",
        action: () => this.emitEvent("zoom-in"),
      },
      {
        id: "zoom-out",
        keys: "Ctrl+-",
        description: "缩小",
        category: "视图",
        action: () => this.emitEvent("zoom-out"),
      },
      {
        id: "toggle-theme",
        keys: "Ctrl+Shift+T",
        description: "切换主题",
        category: "视图",
        action: () => this.emitEvent("toggle-theme"),
      },
    ]

    defaults.forEach((shortcut) => {
      this.register({ ...shortcut, enabled: true })
    })
  }

  // 初始化事件监听
  private initialize(): void {
    if (typeof window === "undefined") return

    window.addEventListener("keydown", (e) => {
      if (!this.isEnabled) return

      const keys = this.getKeysFromEvent(e)
      const shortcut = Array.from(this.shortcuts.values()).find(
        (s) => s.enabled && s.keys.toLowerCase() === keys.toLowerCase(),
      )

      if (shortcut) {
        e.preventDefault()
        shortcut.action()
      }
    })
  }

  // 从事件提取快捷键字符串
  private getKeysFromEvent(e: KeyboardEvent): string {
    const keys: string[] = []

    if (e.ctrlKey || e.metaKey) keys.push("Ctrl")
    if (e.shiftKey) keys.push("Shift")
    if (e.altKey) keys.push("Alt")

    const key = e.key
    if (key.length === 1) {
      keys.push(key.toUpperCase())
    } else if (key === " ") {
      keys.push("Space")
    } else if (key !== "Control" && key !== "Shift" && key !== "Alt" && key !== "Meta") {
      keys.push(key)
    }

    return keys.join("+")
  }

  // 发送事件
  private emitEvent(eventName: string): void {
    window.dispatchEvent(new CustomEvent(`shortcut:${eventName}`))
  }

  // 注册快捷键
  register(shortcut: Shortcut): void {
    this.shortcuts.set(shortcut.id, shortcut)
  }

  // 注销快捷键
  unregister(id: string): void {
    this.shortcuts.delete(id)
  }

  // 启用/禁用快捷键
  setEnabled(id: string, enabled: boolean): void {
    const shortcut = this.shortcuts.get(id)
    if (shortcut) {
      shortcut.enabled = enabled
    }
  }

  // 启用/禁用所有快捷键
  setAllEnabled(enabled: boolean): void {
    this.isEnabled = enabled
  }

  // 获取所有快捷键
  getAllShortcuts(): Shortcut[] {
    return Array.from(this.shortcuts.values())
  }

  // 按类别获取快捷键
  getShortcutsByCategory(category: string): Shortcut[] {
    return Array.from(this.shortcuts.values()).filter((s) => s.category === category)
  }

  // 获取快捷键帮助文本
  getHelpText(): string {
    const categories = new Set(Array.from(this.shortcuts.values()).map((s) => s.category))
    let help = "# 快捷键列表\n\n"

    categories.forEach((category) => {
      help += `## ${category}\n\n`
      const shortcuts = this.getShortcutsByCategory(category)
      shortcuts.forEach((shortcut) => {
        help += `- **${shortcut.keys}**: ${shortcut.description}\n`
      })
      help += "\n"
    })

    return help
  }
}

export const keyboardShortcuts = new KeyboardShortcutManager()
