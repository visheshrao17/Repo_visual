import type { Edge, Node } from 'reactflow'
import type { JobGraphResponse } from '@/types/domain'
import { normalizeStatus } from '@/constants/status'

interface DagNode {
  id: string
  depth: number
}

export function toReactFlowGraph(graph: JobGraphResponse): { nodes: Node[]; edges: Edge[] } {
  const incoming = new Map<string, number>()
  const adjacency = new Map<string, string[]>()

  for (const node of graph.nodes) {
    incoming.set(node.id, 0)
    adjacency.set(node.id, [])
  }

  for (const edge of graph.edges) {
    incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1)
    adjacency.get(edge.source)?.push(edge.target)
  }

  const queue: DagNode[] = []
  for (const [id, degree] of incoming.entries()) {
    if (degree === 0) queue.push({ id, depth: 0 })
  }

  const depthMap = new Map<string, number>()
  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) break
    const currentDepth = depthMap.get(current.id)
    if (currentDepth === undefined || current.depth > currentDepth) {
      depthMap.set(current.id, current.depth)
    }

    for (const neighbor of adjacency.get(current.id) ?? []) {
      incoming.set(neighbor, (incoming.get(neighbor) ?? 1) - 1)
      queue.push({ id: neighbor, depth: current.depth + 1 })
    }
  }

  const grouped = new Map<number, string[]>()
  for (const node of graph.nodes) {
    const depth = depthMap.get(node.id) ?? 0
    if (!grouped.has(depth)) grouped.set(depth, [])
    grouped.get(depth)?.push(node.id)
  }

  const nodes: Node[] = []
  const xGap = 280
  const yGap = 150

  for (const [depth, ids] of grouped.entries()) {
    ids.forEach((id, index) => {
      const source = graph.nodes.find((n) => n.id === id)
      nodes.push({
        id,
        type: 'pipelineNode',
        data: {
          label: id,
          status: normalizeStatus(source?.status),
        },
        position: {
          x: depth * xGap,
          y: index * yGap,
        },
      })
    })
  }

  const edges: Edge[] = graph.edges.map((edge) => ({
    id: `${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
    animated: false,
    style: { stroke: '#38bdf8', strokeWidth: 2 },
  }))

  return { nodes, edges }
}
