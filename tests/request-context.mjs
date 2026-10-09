import { AsyncLocalStorage } from "node:async_hooks"

export const context = new AsyncLocalStorage()
export async function headers() { return context.getStore()?.headers ?? new Headers() }
export async function cookies() {
  const store = context.getStore()
  return {
    get: (name) => store?.cookies.get(name),
    set: (name, value, options) => store?.cookies.set(name, { value, options }),
    delete: (name) => store?.cookies.delete(name),
  }
}
export function request(values = {}, run) {
  return context.run({ headers: new Headers(values.headers), cookies: new Map(values.cookies ?? []) }, run)
}
