import * as http from 'http'
import { CookieJar } from 'tough-cookie'
import { RequestItCookieJar } from './RequestItCookieJar'

export interface RequestOptions extends http.RequestOptions {
  url?: string | URL
  cookieJar?: RequestItCookieJar | CookieJar
  body?: string | Buffer | object | any[]
  json?: object | any[]
  form?: { [key: string]: string | boolean | number }
  responseType?: 'json'
  rejectBadJson?: boolean
  followRedirect?: boolean
  maxRedirects?: number
  params?: { [key: string]: string | boolean | number }
}

export interface IncomingMessage extends http.IncomingMessage {
  json: () => any
  body: any
  cookieJar: RequestItCookieJar
  rawResponse: Buffer
  rawBody: Buffer
}
