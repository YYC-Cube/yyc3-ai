// 模型管理系统
export interface ModelInfo {
  id: string
  name: string
  provider: string
  size?: string
  status: "available" | "downloading" | "downloaded" | "training" | "trained"
  progress?: number
  lastUsed?: string
  local: boolean
}

export interface TrainingConfig {
  modelId: string
  datasetPath: string
  epochs: number
  batchSize: number
  learningRate: number
}

export const localModels: ModelInfo[] = [
  {
    id: "llama-2-7b",
    name: "Llama 2 7B",
    provider: "Meta",
    size: "3.8 GB",
    status: "available",
    local: true,
  },
  {
    id: "mistral-7b",
    name: "Mistral 7B",
    provider: "Mistral AI",
    size: "4.1 GB",
    status: "available",
    local: true,
  },
  {
    id: "phi-2",
    name: "Phi-2",
    provider: "Microsoft",
    size: "2.7 GB",
    status: "available",
    local: true,
  },
]

// 下载模型
export async function downloadModel(modelId: string, onProgress?: (progress: number) => void): Promise<void> {
  // 模拟下载过程
  return new Promise((resolve) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      onProgress?.(progress)
      if (progress >= 100) {
        clearInterval(interval)
        resolve()
      }
    }, 500)
  })
}

// 训练模型
export async function trainModel(config: TrainingConfig, onProgress?: (progress: number) => void): Promise<void> {
  // 模拟训练过程
  return new Promise((resolve) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      onProgress?.(progress)
      if (progress >= 100) {
        clearInterval(interval)
        resolve()
      }
    }, 1000)
  })
}
