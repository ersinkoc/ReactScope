import type {
  Kernel,
  Plugin,
  KernelEvent,
  RenderEvent,
  MountEvent,
  UnmountEvent,
  PropsChangeEvent,
  LogLevel,
  ConsoleReporterOptions,
} from '../../types'
import { formatDuration, formatTimestamp } from '../../utils/format'

export interface ConsoleReporterAPI {
  [key: string]: unknown
  setLogLevel(level: LogLevel): void
  getLogLevel(): LogLevel
  setFilter(filter: ((event: KernelEvent) => boolean) | null): void
  pause(): void
  resume(): void
  isPaused(): boolean
  log(message: string, level?: LogLevel): void
  setGroupByComponent(value: boolean): void
  setIncludeTimestamp(value: boolean): void
  setFormatOutput(value: boolean): void
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

/**
 * Console Reporter Plugin
 * Logs profiling data to browser console.
 */
export class ConsoleReporterPlugin implements Plugin {
  readonly name = 'console-reporter'
  readonly version = '1.0.0'

  private kernel: Kernel | null = null
  private options: Required<Omit<ConsoleReporterOptions, 'filter'>> & { filter: ((event: KernelEvent) => boolean) | null }
  private paused = false
  private componentGroups = new Map<string, unknown[]>()

  constructor(options: ConsoleReporterOptions = {}) {
    this.options = {
      logLevel: options.logLevel ?? 'info',
      groupByComponent: options.groupByComponent ?? false,
      includeTimestamp: options.includeTimestamp ?? true,
      formatOutput: options.formatOutput ?? true,
      filter: options.filter ?? null,
    }
  }

  readonly api: ConsoleReporterAPI = {
    setLogLevel: (level: LogLevel) => {
      this.options.logLevel = level
    },

    getLogLevel: () => {
      return this.options.logLevel
    },

    setFilter: (filter: ((event: KernelEvent) => boolean) | null) => {
      this.options.filter = filter
    },

    pause: () => {
      this.paused = true
    },

    resume: () => {
      this.paused = false
    },

    isPaused: () => {
      return this.paused
    },

    log: (message: string, level: LogLevel = 'info') => {
      this.logMessage(message, level)
    },

    setGroupByComponent: (value: boolean) => {
      this.options.groupByComponent = value
    },

    setIncludeTimestamp: (value: boolean) => {
      this.options.includeTimestamp = value
    },

    setFormatOutput: (value: boolean) => {
      this.options.formatOutput = value
    },
  }

  readonly hooks = {
    onRender: (event: RenderEvent) => {
      this.handleRenderEvent(event)
    },

    onMount: (event: MountEvent) => {
      this.handleMountEvent(event)
    },

    onUnmount: (event: UnmountEvent) => {
      this.handleUnmountEvent(event)
    },

    onPropsChange: (event: PropsChangeEvent) => {
      this.handlePropsChangeEvent(event)
    },
  }

  install(kernel: Kernel): void {
    this.kernel = kernel
  }

  uninstall(): void {
    this.flushGroups()
    this.kernel = null
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.options.logLevel]
  }

  private shouldReport(event: KernelEvent): boolean {
    if (this.paused) return false
    if (this.options.filter && !this.options.filter(event)) return false
    return true
  }

  private getPrefix(_level: LogLevel): string {
    const prefix = '[ReactScope]'
    if (!this.options.includeTimestamp) {
      return prefix
    }
    return `${prefix} ${formatTimestamp(Date.now())}`
  }

  private logMessage(message: string, level: LogLevel): void {
    if (!this.shouldLog(level)) return

    const prefix = this.getPrefix(level)
    const fullMessage = `${prefix} ${message}`

    switch (level) {
      case 'debug':
        console.debug(fullMessage)
        break
      case 'info':
        console.info(fullMessage)
        break
      case 'warn':
        console.warn(fullMessage)
        break
      case 'error':
        console.error(fullMessage)
        break
    }
  }

  private handleRenderEvent(event: RenderEvent): void {
    if (!this.shouldReport(event)) return
    if (!this.shouldLog('debug')) return

    const duration = this.options.formatOutput
      ? formatDuration(event.duration)
      : `${event.duration}ms`

    const level: LogLevel = event.duration > 16 ? 'warn' : 'debug'
    const message = `${event.componentName} rendered (${event.phase}) in ${duration}`

    if (this.options.groupByComponent) {
      this.addToGroup(event.componentId, { type: 'render', message, level })
    } else {
      this.logMessage(message, level)
    }
  }

  private handleMountEvent(event: MountEvent): void {
    if (!this.shouldReport(event)) return
    if (!this.shouldLog('debug')) return

    const message = `${event.componentName} mounted`

    if (this.options.groupByComponent) {
      this.addToGroup(event.componentId, { type: 'mount', message, level: 'debug' })
    } else {
      this.logMessage(message, 'debug')
    }
  }

  private handleUnmountEvent(event: UnmountEvent): void {
    if (!this.shouldReport(event)) return
    if (!this.shouldLog('debug')) return

    const message = `${event.componentName} unmounted`

    if (this.options.groupByComponent) {
      this.addToGroup(event.componentId, { type: 'unmount', message, level: 'debug' })
      this.flushGroup(event.componentId)
    } else {
      this.logMessage(message, 'debug')
    }
  }

  private handlePropsChangeEvent(event: PropsChangeEvent): void {
    if (!this.shouldReport(event)) return
    if (!this.shouldLog('debug')) return

    const changedKeys = event.changes.map((c) => c.key).join(', ')
    const message = `${event.componentName} props changed: ${changedKeys}`

    if (this.options.groupByComponent) {
      this.addToGroup(event.componentId, { type: 'props', message, level: 'debug' })
    } else {
      this.logMessage(message, 'debug')
    }
  }

  private addToGroup(componentId: string, entry: unknown): void {
    let group = this.componentGroups.get(componentId)
    if (!group) {
      group = []
      this.componentGroups.set(componentId, group)
    }
    group.push(entry)
  }

  private flushGroup(componentId: string): void {
    const group = this.componentGroups.get(componentId)
    if (!group || group.length === 0) return

    const metrics = this.kernel?.getMetrics().get(componentId)
    const name = metrics?.componentName ?? componentId

    console.groupCollapsed(`${this.getPrefix('info')} ${name}`)
    for (const entry of group) {
      const { message, level } = entry as { message: string; level: LogLevel }
      this.logMessage(message, level)
    }
    console.groupEnd()

    this.componentGroups.delete(componentId)
  }

  private flushGroups(): void {
    for (const componentId of this.componentGroups.keys()) {
      this.flushGroup(componentId)
    }
  }
}

/**
 * Create a new console reporter plugin instance.
 */
export function createConsoleReporterPlugin(options?: ConsoleReporterOptions): ConsoleReporterPlugin {
  return new ConsoleReporterPlugin(options)
}
