import type {
  Kernel,
  Plugin,
  KernelEvent,
  TimestampedEvent,
  TimelineRecording,
} from '../../types'
import { uid } from '../../utils/uid'

export interface TimelineRecorderAPI {
  [key: string]: unknown
  startRecording(): void
  stopRecording(): void
  isRecording(): boolean
  getRecording(): TimelineRecording
  clearRecording(): void
  exportRecording(): string
  getTimeRange(): { start: number; end: number }
  getEventsByType(type: string): TimestampedEvent[]
  seekTo(timestamp: number): TimestampedEvent[]
  getEventCount(): number
}

/**
 * Timeline Recorder Plugin
 * Records events over time for playback/analysis.
 */
export class TimelineRecorderPlugin implements Plugin {
  readonly name = 'timeline-recorder'
  readonly version = '1.0.0'

  private recording = false
  private events: TimestampedEvent[] = []
  private startTime: number | null = null
  private endTime: number | null = null
  private maxEvents = 10000

  readonly api: TimelineRecorderAPI = {
    startRecording: () => {
      this.startRecording()
    },

    stopRecording: () => {
      this.stopRecording()
    },

    isRecording: () => {
      return this.recording
    },

    getRecording: () => {
      return this.getRecording()
    },

    clearRecording: () => {
      this.clearRecording()
    },

    exportRecording: () => {
      return JSON.stringify(this.getRecording(), null, 2)
    },

    getTimeRange: () => {
      return {
        start: this.startTime ?? 0,
        end: this.endTime ?? Date.now(),
      }
    },

    getEventsByType: (type: string) => {
      return this.events.filter((e) => e.type === type)
    },

    seekTo: (timestamp: number) => {
      return this.events.filter((e) => e.timestamp <= timestamp)
    },

    getEventCount: () => {
      return this.events.length
    },
  }

  readonly hooks = {
    onRender: (event: KernelEvent) => {
      this.recordEvent(event)
    },

    onMount: (event: KernelEvent) => {
      this.recordEvent(event)
    },

    onUnmount: (event: KernelEvent) => {
      this.recordEvent(event)
    },

    onPropsChange: (event: KernelEvent) => {
      this.recordEvent(event)
    },

    onStateChange: (event: KernelEvent) => {
      this.recordEvent(event)
    },
  }

  install(kernel: Kernel): void {
    this.maxEvents = kernel.getOptions().maxHistorySize ?? 10000
  }

  uninstall(): void {
    this.stopRecording()
    this.events = []
  }

  private startRecording(): void {
    if (this.recording) return

    this.recording = true
    this.startTime = Date.now()
    this.endTime = null
    this.events = []
  }

  private stopRecording(): void {
    if (!this.recording) return

    this.recording = false
    this.endTime = Date.now()
  }

  private recordEvent(event: KernelEvent): void {
    if (!this.recording) return

    const timestampedEvent: TimestampedEvent = {
      id: uid(),
      type: event.type,
      timestamp: event.timestamp,
      data: event as unknown as Record<string, unknown>,
    }

    this.events.push(timestampedEvent)

    // Limit events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }
  }

  private getRecording(): TimelineRecording {
    const componentIds = new Set<string>()

    for (const event of this.events) {
      const data = event.data as { componentId?: string }
      if (data.componentId) {
        componentIds.add(data.componentId)
      }
    }

    const duration =
      this.startTime !== null
        ? (this.endTime ?? Date.now()) - this.startTime
        : 0

    return {
      events: [...this.events],
      startTime: this.startTime ?? 0,
      endTime: this.endTime,
      metadata: {
        componentCount: componentIds.size,
        eventCount: this.events.length,
        duration,
      },
    }
  }

  private clearRecording(): void {
    this.events = []
    this.startTime = null
    this.endTime = null
    this.recording = false
  }
}

/**
 * Create a new timeline recorder plugin instance.
 */
export function createTimelineRecorderPlugin(): TimelineRecorderPlugin {
  return new TimelineRecorderPlugin()
}
