import 'mocha'
import * as nock from 'nock'
import { RequestIt, RequestItCookieJar } from '../index'
import { CookieJar } from 'tough-cookie'
import * as assert from 'assert'
import * as http from 'http'

const url = new URL('https://test.example.sample/path')
const origin = url.origin
const path = url.pathname
const sample = { hello: 'world!' }

describe('RequestIt', () => {
  it('should make generic requests', async () => {
    nock(origin)
      .get(path)
      .reply(200, sample)
    nock(origin)
      .get(path)
      .reply(200, sample)
    nock(origin)
      .post(path)
      .reply(200, sample)
    nock(origin)
      .patch(path)
      .reply(200, sample)
    nock(origin)
      .put(path)
      .reply(200, sample)
    nock(origin)
      .delete(path)
      .reply(200, sample)
    nock(origin)
      .get(path)
      .reply(200, 'sample', { 'Content-Type': 'application/json' })
    nock(origin)
      .get(path)
      .reply(200, 'sample', { 'Content-Type': 'application/json' })

    const { body: body0 } = await RequestIt.go(url.toString())
    const { body: body1 } = await RequestIt.get(url)
    const { body: body2 } = await RequestIt.post(url)
    const { body: body3 } = await RequestIt.patch(url)
    const { body: body4 } = await RequestIt.put({ url, body: 'test' })
    const { body: body5 } = await RequestIt.delete(url)
    const { json } = await RequestIt.get(url)

    assert.deepStrictEqual(body0, sample)
    assert.deepStrictEqual(body1, sample)
    assert.deepStrictEqual(body2, sample)
    assert.deepStrictEqual(body3, sample)
    assert.deepStrictEqual(body4, sample)
    assert.deepStrictEqual(body5, sample)
    assert.strictEqual(json() instanceof Error, true)
    assert.throws(() => {
      ;(new RequestIt() as any).getProtocol(null)
    })
    await assert.rejects(async () => {
      await RequestIt.get({ url, rejectBadJson: true })
    })
  })

  it('should make request with custom cookie jar', async () => {
    nock(origin)
      .get(path)
      .reply(200, sample)

    const { body, cookieJar } = await new RequestIt({
      url,
      cookieJar: new CookieJar()
    }).get()
    await cookieJar.findCookie('example.sample', 'path', 'none')

    assert.deepStrictEqual(body, sample)
  })

  it('should parse response when not explicitly application/json', async () => {
    nock(origin)
      .get(path)
      .reply(200, sample, { 'content-type': 'text/plain' })

    const { body } = await RequestIt.get({
      url,
      responseType: 'json'
    })

    assert.deepStrictEqual(body, sample)
  })

  it('should stringify request to json', async () => {
    nock(origin)
      .post(path)
      .reply(200, sample)
    nock(origin)
      .post(path)
      .reply(200, sample)

    const { body: body1 } = await RequestIt.post({
      url,
      body: ['string']
    })
    const { body: body2 } = await RequestIt.post({
      url,
      json: sample
    })

    assert.deepStrictEqual(body1, sample)
    assert.deepStrictEqual(body2, sample)
  })

  it('should take custom headers', async () => {
    nock(origin)
      .get(path)
      .reply(200, sample, { 'content-type': 'text/plain' })

    const { body } = await RequestIt.get({
      url,
      responseType: 'json',
      headers: { 'Content-Length': 100, 'Content-Type': 'application/jazz' }
    })

    assert.deepStrictEqual(body, sample)
  })

  it('should take custom url parameters', async () => {
    nock(origin)
      .get(path + '?take=1')
      .reply(200, sample)

    const { body } = await RequestIt.get({
      url,
      params: { take: 1 }
    })

    assert.deepStrictEqual(body, sample)
  })

  it('should write cookies to cookie jar', async () => {
    nock(origin)
      .get(path)
      .reply(200, sample, { 'Set-Cookie': ['cookie1=testing'] })

    const { body, cookieJar } = await RequestIt.get({ url })
    const cookie = await cookieJar.findCookie('test.example.sample', '/', 'cookie1')

    assert.deepStrictEqual(body, sample)
    assert.deepStrictEqual(cookie.value, 'testing')
  })

  it('should ignore invalid domain cookies', async () => {
    nock(origin)
      .get(path)
      .reply(200, sample, {
        'Set-Cookie': ['cookie1=testing; path=/; domain=.hello.world']
      })

    const { cookieJar } = await RequestIt.get({ url })
    const cookie = await cookieJar.findCookie('hello.world', '/', 'cookie1')

    assert.strictEqual(cookie, undefined)
  })

  it('should should return same instance of RequestItCookieJar', async () => {
    nock(origin)
      .get(path)
      .reply(200, sample, { 'Set-Cookie': ['cookie1=testing'] })

    const originCookieJar = new RequestItCookieJar()
    const { cookieJar } = await RequestIt.get({
      url,
      cookieJar: originCookieJar
    })
    const cookie = await originCookieJar.findCookie('test.example.sample', '/', 'cookie1')

    assert.deepStrictEqual(cookieJar, originCookieJar)
    assert.deepStrictEqual(cookie.value, 'testing')
  })

  it('should capture the raw response on a socket', async () => {
    const json = JSON.stringify(sample)
    const server = http.createServer((req, res) => {
      res
        .writeHead(200, {
          'Content-Type': 'application/json',
          'Content-Length': json.length
        })
        .end(json)
    })

    server.listen(10000)

    const { rawResponse } = await RequestIt.get('http://localhost:10000')

    server.close()

    assert.strictEqual(rawResponse.toString('utf8').includes(json), true)
  })

  it('should handle redirects', async () => {
    nock(origin)
      .get(path)
      .reply(304, '', { Location: 'https://example2.sample/path2' })
    nock('https://example2.sample')
      .get('/path2')
      .reply(200, sample)
    nock(origin)
      .get(path)
      .reply(301, '', { Location: 'https://example2.sample/path2' })
    nock('https://example2.sample')
      .get('/path2')
      .reply(302, '', {
        Location: 'https://example2.sample/path3',
        'Set-Cookie': ['cookie1=testing']
      })
    nock('https://example2.sample')
      .get('/path3')
      .reply(303, '', { Location: 'https://example2.sample/path4' })
    nock('https://example2.sample')
      .get('/path4')
      .reply(303, '', { Location: 'https://example2.sample/path5' })
    nock(origin)
      .get(path)
      .reply(300, '', { Location: 'https://example2.sample/path2' })

    const { body } = await RequestIt.get(url)

    assert.deepStrictEqual(body, sample)
    await assert.rejects(async () => {
      await RequestIt.get(url)
    })

    const { statusCode } = await RequestIt.get({ url, followRedirect: false })

    assert.strictEqual(statusCode, 300)
  })

  it('should handle forms', async () => {
    nock(origin)
      .get(path)
      .reply(200, sample)

    const { body } = await RequestIt.get({ url, form: { hello: 'world' } })

    assert.deepStrictEqual(body, sample)
  })
})
