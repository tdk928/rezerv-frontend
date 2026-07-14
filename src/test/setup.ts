import '@testing-library/jest-dom/vitest'
import { beforeEach } from 'vitest'

const localStore = new Map<string, string>()

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => localStore.get(key) ?? null,
    setItem: (key: string, value: string) => localStore.set(key, value),
    removeItem: (key: string) => localStore.delete(key),
    clear: () => localStore.clear(),
  },
  configurable: true,
})

beforeEach(() => {
  localStore.clear()
})
