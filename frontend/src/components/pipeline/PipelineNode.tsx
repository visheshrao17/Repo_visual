import type { NodeProps } from 'reactflow'
import { Handle, Position } from 'reactflow'
import { normalizeStatus, statusColorClass } from '@/constants/status'
import { cn } from '@/utils/cn'

interface PipelineNodeData {
  label: string
  status?: string | null
}

export function PipelineNode({ data }: NodeProps<PipelineNodeData>) {
  const normalized = normalizeStatus(data.status)

  return (
    <div className={cn('min-w-44 rounded-xl border bg-slate-900/80 p-3 text-white shadow-soft', statusColorClass(normalized))}>
      <Handle type="target" position={Position.Left} className="!bg-cyan-400" />
      <p className="text-sm font-semibold">{data.label}</p>
      <p className="mt-1 text-xs uppercase">{normalized}</p>
      <Handle type="source" position={Position.Right} className="!bg-cyan-400" />
    </div>
  )
}
