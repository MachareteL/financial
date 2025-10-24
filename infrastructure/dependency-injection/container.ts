/**
 * Lightweight dependency injection container.
 * Works with server-side rendering (SSR) and ensures a single source of truth
 * per request/context on the server while using a global singleton on the client.
 */

type Factory<T> = () => T // Function that creates an instance when needed

export class Container {
  // Shared store for client-side singletons and to hold the global container instance
  private static globalInstances = new Map<string, unknown>()

  // Per-container store used for request-scoped instances on the server
  private readonly scopedInstances = new Map<string, unknown>()

  // Detects whether this container instance is meant for server usage.
  // Defaults to checking for the absence of `window`.
  constructor(private readonly isServer = typeof window === "undefined") {}

  /**
   * Obtain a Container instance.
   * - On the server (SSR) you should create a fresh Container per request/context
   *   so each request has its own scoped instances.
   * - On the client we reuse a single global Container instance (singleton).
   */
  static getInstance(): Container {
    if (typeof window === "undefined") {
      // SSR: return a new container for each request/context
      return new Container(true)
    }

    // Client-side: keep and return a single global container instance
    if (!this.globalInstances.has("__container__")) {
      this.globalInstances.set("__container__", new Container(false))
    }
    return this.globalInstances.get("__container__") as Container
  }

  /**
   * Get a dependency instance for the given token.
   * If it doesn't exist, the provided factory is called to create it and it's stored.
   *
   * Behavior:
   * - On the server (isServer === true) instances are stored in the container's scoped map
   *   so they live only for the lifetime of this Container (e.g., a single request).
   * - On the client, instances are stored in the globalInstances map making them singletons
   *   for the whole application lifetime.
   */
  get<T>(token: string, factory: Factory<T>): T {
    const map = this.isServer ? this.scopedInstances : Container.globalInstances

    if (!map.has(token)) {
      map.set(token, factory())
    }

    return map.get(token) as T
  }

  /**
   * Clear all scoped instances for this Container.
   * This is intended for server usage to release per-request resources.
   * No-op on client-side containers since they use the global store.
   */
  dispose() {
    if (this.isServer) this.scopedInstances.clear()
  }
}
