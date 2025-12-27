import type { Plugin, PluginRegistry as IPluginRegistry } from '../types'

/**
 * Plugin registry implementation.
 * Manages plugin lifecycle and provides access to registered plugins.
 */
export class PluginRegistryImpl implements IPluginRegistry {
  private plugins = new Map<string, Plugin>()

  /**
   * Register a plugin.
   * Throws if a plugin with the same name is already registered.
   */
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`[ReactScope] Plugin "${plugin.name}" is already registered`)
    }

    this.plugins.set(plugin.name, plugin)
  }

  /**
   * Unregister a plugin by name.
   * Returns true if the plugin was found and unregistered.
   */
  unregister(name: string): void {
    const plugin = this.plugins.get(name)
    if (!plugin) {
      return
    }

    this.plugins.delete(name)
  }

  /**
   * Get a plugin by name.
   */
  get<T extends Plugin>(name: string): T | undefined {
    return this.plugins.get(name) as T | undefined
  }

  /**
   * Get all registered plugins.
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Check if a plugin is registered.
   */
  has(name: string): boolean {
    return this.plugins.has(name)
  }

  /**
   * Clear all plugins.
   */
  clear(): void {
    this.plugins.clear()
  }

  /**
   * Get the number of registered plugins.
   */
  size(): number {
    return this.plugins.size
  }

  /**
   * Get all plugin names.
   */
  getNames(): string[] {
    return Array.from(this.plugins.keys())
  }
}

/**
 * Create a new plugin registry instance.
 */
export function createPluginRegistry(): IPluginRegistry {
  return new PluginRegistryImpl()
}
