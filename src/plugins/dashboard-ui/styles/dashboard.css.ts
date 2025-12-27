/**
 * Dashboard CSS styles.
 * These are injected into the Shadow DOM for complete isolation.
 */
export const DASHBOARD_CSS = `
  :host {
    --bg-primary: #0a0a0a;
    --bg-secondary: #141414;
    --bg-tertiary: #1f1f1f;
    --text-primary: #fafafa;
    --text-secondary: #a1a1aa;
    --accent: #3b82f6;
    --success: #22c55e;
    --warning: #eab308;
    --error: #ef4444;
    --border: #27272a;
    --fast: #22c55e;
    --medium: #eab308;
    --slow: #ef4444;
    --wasted: #f97316;

    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
    font-size: 12px;
    line-height: 1.5;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .dashboard {
    position: fixed;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
    color: var(--text-primary);
    z-index: 99999;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .dashboard.collapsed {
    width: auto !important;
    height: auto !important;
  }

  .dashboard.collapsed .dashboard-content {
    display: none;
  }

  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    cursor: move;
    user-select: none;
  }

  .dashboard-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 13px;
  }

  .dashboard-title-icon {
    font-size: 14px;
  }

  .dashboard-controls {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .dashboard-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 14px;
  }

  .dashboard-btn:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }

  .dashboard-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .dashboard-tabs {
    display: flex;
    border-bottom: 1px solid var(--border);
    background: var(--bg-secondary);
  }

  .dashboard-tab {
    padding: 8px 16px;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 12px;
    border-bottom: 2px solid transparent;
  }

  .dashboard-tab:hover {
    color: var(--text-primary);
  }

  .dashboard-tab.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
  }

  .dashboard-panel {
    flex: 1;
    padding: 12px;
    overflow: auto;
  }

  .search-input {
    width: 100%;
    padding: 8px 12px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--text-primary);
    font-size: 12px;
    margin-bottom: 12px;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .tree-view {
    font-family: inherit;
  }

  .tree-node {
    display: flex;
    flex-direction: column;
  }

  .tree-node-content {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
  }

  .tree-node-content:hover {
    background: var(--bg-tertiary);
  }

  .tree-node-content.selected {
    background: var(--accent);
    background-opacity: 0.2;
  }

  .tree-node-toggle {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 4px;
    color: var(--text-secondary);
    cursor: pointer;
  }

  .tree-node-toggle:hover {
    color: var(--text-primary);
  }

  .tree-node-name {
    flex: 1;
    margin-right: 8px;
  }

  .tree-node-metrics {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--text-secondary);
  }

  .tree-node-children {
    padding-left: 20px;
  }

  .metric-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 500;
  }

  .metric-badge.renders {
    background: rgba(59, 130, 246, 0.2);
    color: var(--accent);
  }

  .metric-badge.time {
    background: rgba(34, 197, 94, 0.2);
    color: var(--success);
  }

  .metric-badge.time.slow {
    background: rgba(239, 68, 68, 0.2);
    color: var(--error);
  }

  .metric-badge.wasted {
    background: rgba(249, 115, 22, 0.2);
    color: var(--wasted);
  }

  .alert-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px;
    background: var(--bg-tertiary);
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .alert-icon {
    font-size: 14px;
  }

  .alert-icon.warning {
    color: var(--warning);
  }

  .alert-icon.error {
    color: var(--error);
  }

  .alert-content {
    flex: 1;
  }

  .alert-title {
    font-weight: 500;
    margin-bottom: 2px;
  }

  .alert-description {
    font-size: 11px;
    color: var(--text-secondary);
  }

  .details-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .details-section {
    background: var(--bg-tertiary);
    border-radius: 4px;
    padding: 12px;
  }

  .details-section-title {
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-secondary);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .details-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
  }

  .details-label {
    color: var(--text-secondary);
  }

  .details-value {
    font-weight: 500;
  }

  .timeline-chart {
    height: 100px;
    background: var(--bg-tertiary);
    border-radius: 4px;
    position: relative;
    overflow: hidden;
  }

  .timeline-bar {
    position: absolute;
    bottom: 0;
    width: 2px;
    background: var(--accent);
    border-radius: 1px 1px 0 0;
  }

  .memory-chart {
    height: 100px;
    background: var(--bg-tertiary);
    border-radius: 4px;
    position: relative;
    padding: 8px;
  }

  .memory-chart-line {
    stroke: var(--accent);
    stroke-width: 2;
    fill: none;
  }

  .memory-chart-area {
    fill: rgba(59, 130, 246, 0.1);
  }

  .network-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: var(--bg-tertiary);
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .network-method {
    font-weight: 600;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--accent);
    color: white;
  }

  .network-url {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-secondary);
  }

  .network-time {
    font-size: 11px;
    color: var(--text-secondary);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    color: var(--text-secondary);
    text-align: center;
  }

  .empty-state-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .resize-handle {
    position: absolute;
    background: transparent;
  }

  .resize-handle-se {
    right: 0;
    bottom: 0;
    width: 16px;
    height: 16px;
    cursor: nwse-resize;
  }

  .resize-handle-e {
    right: 0;
    top: 16px;
    bottom: 16px;
    width: 4px;
    cursor: ew-resize;
  }

  .resize-handle-s {
    left: 16px;
    right: 16px;
    bottom: 0;
    height: 4px;
    cursor: ns-resize;
  }
`
