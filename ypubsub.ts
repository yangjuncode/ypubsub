type TFns = Function[]
type subjectTypes = string | number

export class PubSub<T extends subjectTypes> {
  private events: Map<T, TFns>

  constructor() {
    this.events = new Map<T, TFns>()
  }

  private getEvents(key: T): TFns {
    return this.events.get(key) || []
  }

  private setEvents(key: T, value: TFns): void {
    if (value.length) {
      this.events.set(key, value)
    } else {
      this.events.delete(key)
    }
  }

  publish(subject: T, ...args: any[]) {
    const events: TFns = this.getEvents(subject)
    for (let i = 0; i < events.length; i++) {
      events[i].apply(this, args)
    }
  }

  subscribe(subject: T | T[], cb: Function, timeoutSecs?: number): void {
    if (Array.isArray(subject)) {
      subject.forEach((eventName: T) => {
        this.subscribe(eventName, cb, timeoutSecs)
      })
      return
    }

    const fns: TFns = this.getEvents(subject)
    if (!fns.includes(cb)) {
      fns.push(cb)
    }

    this.setEvents(subject, fns)

    // 添加超时解绑订阅事件
    if (timeoutSecs) {
      setTimeout(() => {
        this.unsubscribe(subject, cb)
      }, timeoutSecs * 1000)
    }
  }

  subscribeOnce(subject: T, cb: Function, timeoutSecs?: number): void {
    // 包装事件回调，先解绑事件，再执行回调
    const wrapper = (...args: any[]) => {
      this.unsubscribe(subject, wrapper)
      cb.apply(this, args)
    }
    wrapper.fn = cb

    this.subscribe(subject, wrapper, timeoutSecs)
  }

  unsubscribe(subject?: T | T[], cb?: Function): void {
    // 不传递参数，清空所有订阅事件
    if (!arguments.length) {
      this.events.clear()
      return
    }

    // 如果解除的事件是数组，则循环解绑每个事件
    if (Array.isArray(subject)) {
      subject.forEach((eventName: T) => {
        this.unsubscribe(eventName, cb)
      })
      return
    }

    // 解除单个订阅事件
    // 如果没有传递回调，则解绑该事件所有订阅
    const _subject: T = subject as T
    if (!cb) {
      this.setEvents(_subject, [])
      return
    }

    // 查找对应的事件，并解绑订阅
    let events: TFns = this.getEvents(_subject)
    events = events.filter((method: Function) => {
      // @ts-ignore
      const _fn: Function | undefined = method.fn
      return !(method === cb || _fn === cb)
    })

    this.setEvents(_subject, events)
  }

  hasSubscribe(subject: T): boolean {
    return this.getEvents(subject).length > 0
  }
}

export const IntPubSub = new PubSub<number>()
export const StrPubSub = new PubSub<string>()

export default {
  IntPubSub,
  StrPubSub,
}
