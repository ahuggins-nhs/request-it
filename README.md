# Request-It

A stupidly simple HTTP client for Node-JS that should just work. Built-in support for cookies and JSON. No follow-redirects magic.

## Usage
Install via NPM and require in your project. Then request it and go!

```js
const { RequestIt } = require('request-it-client')

;(async function main () {
  const res = await RequestIt.go('https://reqres.in/api/users/2')

  console.log(res.body.data.first_name) // expected result: Janet
})()

```

## API

### `class RequestIt`

- `new RequestIt(options?: RequestOptions)`
- **Instance Members**
  - `public options: RequestOptions`
  - `public cookieJar: RequestItCookieJar`
  - `public go(options?: RequestOptions | string | URL): Promise<IncomingMessage>`
  - `public get(options?: RequestOptions | string | URL): Promise<IncomingMessage>`
  - `public patch(options?: RequestOptions | string | URL): Promise<IncomingMessage>`
  - `public post(options?: RequestOptions | string | URL): Promise<IncomingMessage>`
  - `public put(options?: RequestOptions | string | URL): Promise<IncomingMessage>`
  - `public delete(options?: RequestOptions | string | URL): Promise<IncomingMessage>`
- **Static Members**
  - `static go(options?: RequestOptions | string | URL): Promise<IncomingMessage>`
  - `static get(options?: RequestOptions | string | URL): Promise<IncomingMessage>`
  - `static patch(options?: RequestOptions | string | URL): Promise<IncomingMessage>`
  - `static post(options?: RequestOptions | string | URL): Promise<IncomingMessage>`
  - `static put(options?: RequestOptions | string | URL): Promise<IncomingMessage>`
  - `static delete(options?: RequestOptions | string | URL): Promise<IncomingMessage>`

### `interface RequestOptions`

See NodeJS docs for [details](https://nodejs.org/docs/latest-v12.x/api/http.html#http_http_request_options_callback).

- **Extended Properties**
  - `url: string | URL`
  - `cookieJar?: RequestItCookieJar | CookieJar`
  - `body?: string | Buffer | object | any[]`
  - `json?: object | any[]`
  - `responseType?: 'json'`
  - `rejectBadJson?: boolean`
  - `params?: { [key: string]: string | boolean | number }`

### `interface IncomingMessage`

See NodeJS docs for [details](https://nodejs.org/docs/latest-v12.x/api/http.html#http_class_http_incomingmessage).

- **Extended Properties**
  - `json: () => any`
  - `body: any`
  - `cookieJar: RequestItCookieJar`
  - `rawResponse: Buffer`
  - `rawBody: Buffer`

### `class RequestItCookieJar extends CookieJar`

Extends `tough-cookie` [cookie jar class](https://github.com/salesforce/tough-cookie#cookiejar).

- `new RequestItCookieJar(store?: Store, options?: CookieJar.Options)`
- **Instance Members**
  - `public findCookie(domain: string, path: string, key: string): Promise<Cookie>`
- **Static Members**
  - `static fromCookieJar(cookieJar: CookieJar): RequestItCookieJar`