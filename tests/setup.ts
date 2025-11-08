// 测试环境设置
import jest from "jest"
import "@testing-library/jest-dom"

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
}

// Mock fetch
global.fetch = jest.fn()

// Mock console methods
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}
