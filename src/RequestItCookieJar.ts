import { CookieJar, MemoryCookieStore } from 'tough-cookie'
import { Cookie, Store } from 'tough-cookie'
import { promisify } from 'util'

interface RequestItStore extends Store {
  findCookie(domain: string, path: string, key: string): Promise<Cookie | null>
}

export interface RequestItCookieJar extends CookieJar {
  store: RequestItStore

  getCookieString(currentUrl: string, options?: CookieJar.GetCookiesOptions | Function): Promise<string>
  setCookie(
    cookieOrString: Cookie | string,
    currentUrl: string,
    options?: CookieJar.SetCookieOptions | Function
  ): Promise<Cookie>
}

export class RequestItCookieJar extends CookieJar {
  constructor (store?: Store, options?: CookieJar.Options) {
    super(store || new MemoryCookieStore(), {
      rejectPublicSuffixes: false,
      ...options
    })

    if (this.store && typeof this.store.findCookie === 'function') {
      this.store.findCookie = promisify(this.store.findCookie.bind(this.store))
    }

    this.getCookieString = promisify(this.getCookieString.bind(this))
    this.setCookie = promisify(this.setCookie.bind(this))
  }

  async findCookie (domain: string, path: string, key: string) {
    return await this.store.findCookie(domain, path, key)
  }

  static fromCookieJar (cookieJar: CookieJar) {
    if (cookieJar instanceof RequestItCookieJar) return cookieJar

    const requestItJar: RequestItCookieJar = Object.setPrototypeOf(
      Object.assign(new RequestItCookieJar(), cookieJar),
      RequestItCookieJar.prototype
    )

    if ((cookieJar as any).store && typeof (cookieJar as any).store.findCookie === 'function') {
      requestItJar.store.findCookie = promisify((cookieJar as any).store.findCookie.bind((cookieJar as any).store))
    }

    requestItJar.getCookieString = promisify(cookieJar.getCookieString.bind(requestItJar))
    requestItJar.setCookie = promisify(cookieJar.setCookie.bind(requestItJar))

    return requestItJar
  }
}
