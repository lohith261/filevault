type Level = 'info' | 'warn' | 'error'
type Fields = Record<string, unknown>

function log(level: Level, message: string, fields?: Fields): void {
  if (process.env.NODE_ENV === 'test') return
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg: message,
    ...fields,
  }
  const line = JSON.stringify(entry)
  if (level === 'error') {
    console.error(line)
  } else if (level === 'warn') {
    console.warn(line)
  } else {
    console.log(line)
  }
}

export const logger = {
  info: (message: string, fields?: Fields) => log('info', message, fields),
  warn: (message: string, fields?: Fields) => log('warn', message, fields),
  error: (message: string, fields?: Fields) => log('error', message, fields),
}
