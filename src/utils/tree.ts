import type { ComponentTree, TreeNode, ComponentMetrics } from '../types'

/**
 * Create an empty component tree.
 */
export function createTree(): ComponentTree {
  return {
    root: null,
    nodeMap: new Map(),
  }
}

/**
 * Create a new tree node.
 */
export function createNode(
  id: string,
  name: string,
  metrics: ComponentMetrics | null = null,
  depth = 0
): TreeNode {
  return {
    id,
    name,
    children: [],
    metrics,
    depth,
    isExpanded: true,
  }
}

/**
 * Add a child node to a parent node.
 */
export function addChild(parent: TreeNode, child: TreeNode): void {
  // Check if child already exists
  const existingIndex = parent.children.findIndex((c) => c.id === child.id)
  if (existingIndex !== -1) {
    // Replace existing
    parent.children[existingIndex] = child
  } else {
    parent.children.push(child)
  }
  child.depth = parent.depth + 1
}

/**
 * Remove a node from the tree.
 */
export function removeNode(tree: ComponentTree, nodeId: string): boolean {
  const node = tree.nodeMap.get(nodeId)
  if (!node) {
    return false
  }

  // Remove from parent's children
  for (const potentialParent of tree.nodeMap.values()) {
    const childIndex = potentialParent.children.findIndex((c) => c.id === nodeId)
    if (childIndex !== -1) {
      potentialParent.children.splice(childIndex, 1)
      break
    }
  }

  // If this was the root, clear it
  if (tree.root?.id === nodeId) {
    tree.root = null
  }

  // Remove all descendants from nodeMap
  const removeDescendants = (n: TreeNode) => {
    tree.nodeMap.delete(n.id)
    for (const child of n.children) {
      removeDescendants(child)
    }
  }
  removeDescendants(node)

  return true
}

/**
 * Find a node by ID.
 */
export function findNode(tree: ComponentTree, nodeId: string): TreeNode | undefined {
  return tree.nodeMap.get(nodeId)
}

/**
 * Update a node's metrics.
 */
export function updateNodeMetrics(tree: ComponentTree, nodeId: string, metrics: ComponentMetrics): boolean {
  const node = tree.nodeMap.get(nodeId)
  if (!node) {
    return false
  }
  node.metrics = metrics
  return true
}

/**
 * Traverse the tree depth-first (pre-order).
 */
export function traverseDepthFirst(
  tree: ComponentTree,
  callback: (node: TreeNode, depth: number) => void | boolean
): void {
  if (!tree.root) {
    return
  }

  const traverse = (node: TreeNode, depth: number): boolean => {
    const result = callback(node, depth)
    if (result === false) {
      return false
    }

    for (const child of node.children) {
      if (traverse(child, depth + 1) === false) {
        return false
      }
    }
    return true
  }

  traverse(tree.root, 0)
}

/**
 * Traverse the tree breadth-first.
 */
export function traverseBreadthFirst(
  tree: ComponentTree,
  callback: (node: TreeNode, depth: number) => void | boolean
): void {
  if (!tree.root) {
    return
  }

  const queue: Array<{ node: TreeNode; depth: number }> = [{ node: tree.root, depth: 0 }]

  while (queue.length > 0) {
    const item = queue.shift()!
    const result = callback(item.node, item.depth)

    if (result === false) {
      break
    }

    for (const child of item.node.children) {
      queue.push({ node: child, depth: item.depth + 1 })
    }
  }
}

/**
 * Get all ancestors of a node (from parent to root).
 */
export function getAncestors(tree: ComponentTree, nodeId: string): TreeNode[] {
  const ancestors: TreeNode[] = []
  const targetNode = tree.nodeMap.get(nodeId)

  if (!targetNode) {
    return ancestors
  }

  // Find parent by searching all nodes
  const findParent = (targetId: string): TreeNode | null => {
    for (const node of tree.nodeMap.values()) {
      if (node.children.some((c) => c.id === targetId)) {
        return node
      }
    }
    return null
  }

  let currentId = nodeId
  let parent = findParent(currentId)

  while (parent) {
    ancestors.push(parent)
    currentId = parent.id
    parent = findParent(currentId)
  }

  return ancestors
}

/**
 * Get all descendants of a node.
 */
export function getDescendants(tree: ComponentTree, nodeId: string): TreeNode[] {
  const descendants: TreeNode[] = []
  const node = tree.nodeMap.get(nodeId)

  if (!node) {
    return descendants
  }

  const collect = (n: TreeNode) => {
    for (const child of n.children) {
      descendants.push(child)
      collect(child)
    }
  }

  collect(node)
  return descendants
}

/**
 * Flatten the tree into an array (depth-first order).
 */
export function flattenTree(tree: ComponentTree): TreeNode[] {
  const nodes: TreeNode[] = []

  traverseDepthFirst(tree, (node) => {
    nodes.push(node)
  })

  return nodes
}

/**
 * Get the depth of a node.
 */
export function getNodeDepth(tree: ComponentTree, nodeId: string): number {
  const node = tree.nodeMap.get(nodeId)
  if (!node) {
    return -1
  }
  return node.depth
}

/**
 * Check if a node is an ancestor of another node.
 */
export function isAncestor(tree: ComponentTree, ancestorId: string, descendantId: string): boolean {
  const ancestors = getAncestors(tree, descendantId)
  return ancestors.some((a) => a.id === ancestorId)
}

/**
 * Get the path from root to a node.
 */
export function getPath(tree: ComponentTree, nodeId: string): TreeNode[] {
  const ancestors = getAncestors(tree, nodeId)
  const node = tree.nodeMap.get(nodeId)

  if (!node) {
    return []
  }

  return [...ancestors.reverse(), node]
}

/**
 * Count total nodes in the tree.
 */
export function countNodes(tree: ComponentTree): number {
  return tree.nodeMap.size
}

/**
 * Get maximum depth of the tree.
 */
export function getMaxDepth(tree: ComponentTree): number {
  let maxDepth = -1

  traverseDepthFirst(tree, (_node, depth) => {
    if (depth > maxDepth) {
      maxDepth = depth
    }
  })

  return maxDepth
}

/**
 * Toggle node expansion state.
 */
export function toggleNode(tree: ComponentTree, nodeId: string): boolean {
  const node = tree.nodeMap.get(nodeId)
  if (!node) {
    return false
  }
  node.isExpanded = !node.isExpanded
  return true
}

/**
 * Expand all nodes.
 */
export function expandAll(tree: ComponentTree): void {
  for (const node of tree.nodeMap.values()) {
    node.isExpanded = true
  }
}

/**
 * Collapse all nodes.
 */
export function collapseAll(tree: ComponentTree): void {
  for (const node of tree.nodeMap.values()) {
    node.isExpanded = false
  }
}

/**
 * Filter tree nodes by a predicate.
 */
export function filterTree(
  tree: ComponentTree,
  predicate: (node: TreeNode) => boolean
): TreeNode[] {
  const matching: TreeNode[] = []

  for (const node of tree.nodeMap.values()) {
    if (predicate(node)) {
      matching.push(node)
    }
  }

  return matching
}

/**
 * Search tree nodes by name (case-insensitive).
 */
export function searchTree(tree: ComponentTree, query: string): TreeNode[] {
  const lowerQuery = query.toLowerCase()

  return filterTree(tree, (node) => node.name.toLowerCase().includes(lowerQuery))
}
