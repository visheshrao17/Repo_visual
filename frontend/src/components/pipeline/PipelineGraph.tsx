import { memo, useMemo } from 'react'
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow'
import 'reactflow/dist/style.css'
import { PipelineNode } from '@/components/pipeline/PipelineNode'
import { toReactFlowGraph } from '@/utils/graph'
import type { JobGraphResponse } from '@/types/domain'

interface PipelineGraphProps {
  graph: JobGraphResponse
}

const nodeTypes = {
  pipelineNode: PipelineNode,
}

export const PipelineGraph = memo(function PipelineGraph({ graph }: PipelineGraphProps) {
  const { nodes, edges } = useMemo(() => toReactFlowGraph(graph), [graph])

  return (
    <div className="h-[560px] rounded-xl border border-white/10 bg-slate-950/40">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => {
          console.log('Node clicked', node.id)
        }}
      >
        <Background color="#1e293b" gap={24} />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  )
})
