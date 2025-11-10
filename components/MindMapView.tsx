"use client"

import { useCallback, useState } from "react"
import ReactFlow, {
  type Node,
  type Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  MarkerType,
  Panel,
} from "reactflow"
import "reactflow/dist/style.css"
import { motion } from "framer-motion"
import { Download, Share2, CheckCircle, Circle } from "lucide-react"

interface MindMapNode {
  id: string
  title: string
  children?: MindMapNode[]
  icon?: string
  status?: "completed" | "in-progress" | "pending"
  notes?: string
}

interface MindMapViewProps {
  data: MindMapNode
  title?: string
}

export default function MindMapView({ data, title = "知识图谱" }: MindMapViewProps) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  // 将树形数据转换为 ReactFlow 节点和边
  const convertToFlowElements = (node: MindMapNode, level = 0, parentId?: string) => {
    const nodes: Node[] = []
    const edges: Edge[] = []

    const nodeId = node.id
    const xOffset = level * 250
    const yOffset = nodes.length * 100

    // 创建节点
    nodes.push({
      id: nodeId,
      type: "default",
      data: {
        label: (
          <div className="flex items-center gap-2">
            {node.icon && <span>{node.icon}</span>}
            <span>{node.title}</span>
            {node.status === "completed" && <CheckCircle className="h-4 w-4 text-green-500" />}
            {node.status === "in-progress" && <Circle className="h-4 w-4 text-blue-500 animate-pulse" />}
          </div>
        ),
        node: node,
      },
      position: { x: xOffset, y: yOffset },
      style: {
        background: node.status === "completed" ? "#dcfce7" : node.status === "in-progress" ? "#dbeafe" : "#fff",
        border: "2px solid",
        borderColor: node.status === "completed" ? "#22c55e" : node.status === "in-progress" ? "#3b82f6" : "#d4d4d8",
        borderRadius: "8px",
        padding: "10px",
        fontSize: "14px",
        fontWeight: 500,
      },
    })

    // 如果有父节点，创建边
    if (parentId) {
      edges.push({
        id: `${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: "smoothstep",
        animated: node.status === "in-progress",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#3b82f6",
        },
        style: {
          stroke: node.status === "completed" ? "#22c55e" : "#3b82f6",
          strokeWidth: 2,
        },
      })
    }

    // 递归处理子节点
    if (node.children) {
      node.children.forEach((child, index) => {
        const [childNodes, childEdges] = convertToFlowElements(child, level + 1, nodeId)
        nodes.push(...childNodes)
        edges.push(...childEdges)
      })
    }

    return [nodes, edges] as const
  }

  const [initialNodes, initialEdges] = convertToFlowElements(data)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const onNodeClick = useCallback((_event: any, node: Node) => {
    setSelectedNode(node)
  }, [])

  const handleExport = () => {
    // 导出为 JSON
    const dataStr = JSON.stringify({ nodes, edges }, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "mindmap.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background />
        <Controls />

        <Panel
          position="top-left"
          className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-3 border border-zinc-200 dark:border-zinc-800"
        >
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{title}</h3>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <Download className="h-3 w-3" />
              导出
            </button>
            <button className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-purple-500 text-white hover:bg-purple-600 transition-colors">
              <Share2 className="h-3 w-3" />
              分享
            </button>
          </div>
        </Panel>

        {/* 节点详情面板 */}
        {selectedNode && (
          <Panel position="top-right">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-4 border border-zinc-200 dark:border-zinc-800 w-64"
            >
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">节点详情</h4>
              <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <div>
                  <span className="font-medium">标题: </span>
                  {selectedNode.data.node.title}
                </div>
                {selectedNode.data.node.status && (
                  <div>
                    <span className="font-medium">状态: </span>
                    {selectedNode.data.node.status === "completed" && "已完成"}
                    {selectedNode.data.node.status === "in-progress" && "进行中"}
                    {selectedNode.data.node.status === "pending" && "待开始"}
                  </div>
                )}
                {selectedNode.data.node.notes && (
                  <div>
                    <span className="font-medium">备注: </span>
                    {selectedNode.data.node.notes}
                  </div>
                )}
              </div>
            </motion.div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}
