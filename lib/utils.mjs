import child_process from 'child_process'
import { relative, isAbsolute } from 'node:path'
import { promisify } from 'node:util'
const exec = promisify(child_process.exec)

export async function execute(command) {
  const { stdout } = await exec(command)
  return stdout
}

export function isSameOrSubPath(parentPath, childPath) {
  if (parentPath === childPath) return true
  const relativePath = relative(parentPath, childPath)
  return (
    relativePath === '' // Same path (e.g. parentPath = '/a/b/', childPath = '/a/b')
    || !relativePath.startsWith('..') && !isAbsolute(relativePath) // Sub path
  )
}

export function isSubPath(parentPath, childPath) {
  const relativePath = relative(parentPath, childPath)
  return relativePath && !relativePath.startsWith('..') && !isAbsolute(relativePath) 
}

export function pathToPosix(path) {
  return path.replace(/\\/g, '/')
}
  