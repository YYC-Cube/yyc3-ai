// 工具类型定义
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>

export type EventHandler<T = any> = (event: T) => void

export type Validator<T> = (value: T) => boolean | string

export interface StorageItem<T> {
  key: string
  value: T
  expiresAt?: number
}

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number
  onEvict?: (key: string, value: any) => void
}
