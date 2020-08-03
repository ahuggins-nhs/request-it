import * as shell from 'gulp-shell'
import { rmdirSync } from 'fs'

export const mocha = shell.task(['mocha'])
export const nyc = shell.task(['nyc mocha'])
export const tsc = shell.task(['tsc --sourceMap false'])
export const clean = async () => rmdirSync('./dist', { recursive: true })
