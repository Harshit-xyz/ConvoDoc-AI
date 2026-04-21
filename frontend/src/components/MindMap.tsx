"use client";

import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  Handle,
  Position,
  Panel,
  type ReactFlowInstance,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ChevronRight, ChevronLeft, Moon, Sun } from 'lucide-react';

// Types
type MindTree = { name: string; children?: MindTree[] };

// Normalize arbitrary JSON to a proper MindTree structure
function normalizeMindTree(raw: any, defaultName = "Concept Map"): MindTree {
  if (!raw) return { name: defaultName };
  
  if (typeof raw === 'string') {
    return { name: raw };
  }
  
  if (Array.isArray(raw)) {
    return {
      name: defaultName,
      children: raw
        .map(item => normalizeMindTree(item))
        .filter(child => child.name !== '[object Object]')
    };
  }
  
  if (typeof raw === 'object' && raw !== null) {
    // If it has expected keys
    if (raw.name || raw.label || raw.title) {
      const name = String(raw.name || raw.label || raw.title);
      let children: MindTree[] = [];
      if (raw.children && Array.isArray(raw.children)) {
        children = raw.children.map((c: any) => normalizeMindTree(c));
      } else if (raw.subtopics && Array.isArray(raw.subtopics)) {
        children = raw.subtopics.map((c: any) => normalizeMindTree(c));
      } else if (raw.children && typeof raw.children === 'object') {
         const inner = normalizeMindTree(raw.children);
         if (inner.name === defaultName && inner.children) {
           children = inner.children;
         } else if (Object.keys(raw.children).length > 0) {
           children = [inner];
         }
      }
      return { name, children: children.length > 0 ? children : undefined };
    }
    
    const keys = Object.keys(raw);
    if (keys.length === 0) {
       // Stop the recursion here for empty objects
       return { name: defaultName };
    }

    if (keys.length === 1) {
      const key = keys[0];
      const val = raw[key];
      
      if (key === 'children' && (Array.isArray(val) || typeof val === 'object')) {
        return normalizeMindTree(val, defaultName);
      }

      let children: MindTree[] = [];
      if (Array.isArray(val)) {
        children = val.map(c => normalizeMindTree(c));
      } else if (typeof val === 'object' && val !== null && Object.keys(val).length > 0) {
         const inner = normalizeMindTree(val);
         if (inner.name === defaultName && inner.children) {
             children = inner.children;
         } else {
             children = [inner];
         }
      } else if (typeof val === 'string') {
         children = [{ name: val }];
      }
      return { name: key, children: children.length > 0 ? children : undefined };
    } else {
      const childrenList = keys.map(key => {
        const val = raw[key];
        if (key === 'children' && Array.isArray(val)) {
           return val.map(c => normalizeMindTree(c));
        }
        if (Array.isArray(val)) {
            return { name: key, children: val.map(c => normalizeMindTree(c)) };
        } else if (typeof val === 'object' && val !== null && Object.keys(val).length > 0) {
            return normalizeMindTree({ [key]: val });
        } else if (typeof val === 'string' || typeof val === 'number') {
            return { name: key, children: [{ name: String(val) }] };
        }
        return { name: key };
      }).flat() as MindTree[];
      
      return { name: defaultName, children: childrenList.length > 0 ? childrenList : undefined };
    }
  }
  
  const finalName = String(raw);
  return { name: finalName === '[object Object]' ? defaultName : finalName };
}

// Layout calculation for horizontal tree
function getSubtreeHeight(node: MindTree, id: string, expandedNodes: Set<string>): number {
  if (!node.children || node.children.length === 0 || !expandedNodes.has(id)) {
    return 180; // Increased base height per node area for more vertical breathing room
  }
  let height = 0;
  node.children.forEach((child, index) => {
    const childId = `${id}-${index}`;
    height += getSubtreeHeight(child, childId, expandedNodes);
  });
  return height;
}

const CustomNode = ({ data }: any) => {
  const isDark = data.isDark;

  return (
    <div
      style={{
        background: isDark ? '#3d414e' : '#ffffff',
        border: 'none',
        borderRadius: '12px',
        padding: '16px 28px',
        color: isDark ? '#e3e3e6' : '#1e293b',
        maxWidth: 350,
        minWidth: 120,
        textAlign: 'left',
        position: 'relative',
        animation: 'nodeAppear 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        boxShadow: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: '500',
        fontFamily: 'Inter, system-ui, sans-serif',
        lineHeight: '1.4',
        whiteSpace: 'normal',
      }}
      className="group"
    >
      {/* Target handle for incoming edges */}
      {data.id !== 'root' && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ opacity: 0, left: '-4px' }}
        />
      )}

      {/* Main Label */}
      <div style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
        {data.label}
      </div>

      {/* Expand/Collapse Button - Positioned OUTSIDE the node */}
      {data.hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onToggle(data.id);
          }}
          className={`absolute flex items-center justify-center rounded-full transition-colors duration-200 z-10 ${isDark
              ? 'bg-[#4b5060] text-[#aeb3c9] hover:bg-[#5b6173] hover:text-white'
              : 'bg-[#e2e8f0] text-[#64748b] hover:bg-[#cbd5e1] hover:text-[#0f172a]'
            }`}
          style={{
            right: '-28px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '20px',
            cursor: 'pointer',
            border: 'none',
            outline: 'none',
          }}
        >
          {data.isExpanded ? <ChevronLeft size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} />}
        </button>
      )}

      {/* Source handle for outgoing edges - placed precisely at the button center */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ opacity: 0, right: '-18px' }}
      />
    </div>
  );
};

const nodeTypes = {
  customNode: CustomNode,
};

export default function MindMap({ data }: { data: any }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const normalizedData: MindTree = useMemo(() => normalizeMindTree(data), [data]);

  // Theme State
  const [isDark, setIsDark] = useState<boolean>(true); // Default to NotebookLM dark look

  // State to track expanded and dragged nodes
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  const [draggedNodes, setDraggedNodes] = useState<Record<string, { x: number; y: number }>>({});

  const onNodeDragStop = useCallback((_: any, node: Node) => {
    setDraggedNodes((prev) => ({ ...prev, [node.id]: node.position }));
  }, []);

  // On mount, auto-expand tree to 3 levels
  useEffect(() => {
    if (!normalizedData) return;
    const initialExpanded = new Set<string>();

    const preTraverse = (node: MindTree, id: string, level: number) => {
      if (level < 2) {
        initialExpanded.add(id);
      }
      if (node.children) {
        node.children.forEach((child, idx) => {
          preTraverse(child, `${id}-${idx}`, level + 1);
        });
      }
    };
    preTraverse(normalizedData, 'root', 0);
    setExpandedNodes(initialExpanded);
  }, [normalizedData]);

  const toggleNode = useCallback((id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Recalculate layout
  useEffect(() => {
    if (!normalizedData || expandedNodes.size === 0) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    const traverse = (node: MindTree, parentId: string | null, id: string, x: number, y: number, level: number) => {
      const isExpanded = expandedNodes.has(id);
      const hasChildren = node.children && node.children.length > 0;

      const manualPos = draggedNodes[id];
      const finalX = manualPos ? manualPos.x : x;
      const finalY = manualPos ? manualPos.y : y;

      const devX = finalX - x;
      const devY = finalY - y;

      newNodes.push({
        id: id,
        type: 'customNode',
        position: { x: finalX, y: finalY },
        data: {
          label: node.name,
          id: id,
          hasChildren: hasChildren,
          isExpanded: isExpanded,
          onToggle: toggleNode,
          isDark: isDark,
        },
      });

      if (parentId) {
        newEdges.push({
          id: `e-${parentId}-${id}`,
          source: parentId,
          target: id,
          type: 'default', // Use default (bezier) instead of smoothstep to eliminate origin overlap chaos
          animated: false,
          style: {
            stroke: isDark ? '#9da4d1' : '#737ab5',
            strokeWidth: 1.5,
            opacity: 0.9,
          },
        });
      }

      if (hasChildren && isExpanded) {
        const totalHeight = getSubtreeHeight(node, id, expandedNodes);
        let startY = y - totalHeight / 2;

        node.children!.forEach((child, index) => {
          const childId = `${id}-${index}`;
          const childHeight = getSubtreeHeight(child, childId, expandedNodes);
          const childY = startY + childHeight / 2;

          // Horizontal spacing: parentX + 600px (increased for larger nodes)
          traverse(child, id, childId, (x + 600) + devX, childY + devY, level + 1);
          startY += childHeight;
        });
      }
    };

    traverse(normalizedData, null, 'root', 0, 0, 0);

    setNodes(newNodes);
    setEdges(newEdges);
  }, [normalizedData, expandedNodes, draggedNodes, setNodes, setEdges, toggleNode, isDark]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div style={{ width: '100%', height: '100%', background: isDark ? '#1a1b1e' : '#f8fafc' }} className="transition-colors duration-500">
      <style>{`
        .react-flow__node {
          transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1) !important;
        }
        @keyframes nodeAppear {
          from { opacity: 0; transform: scale(0.95); margin-left: -10px; }
          to { opacity: 1; transform: scale(1); margin-left: 0; }
        }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRfInstance}
        onNodeDragStop={onNodeDragStop}
        fitView
        colorMode={isDark ? "dark" : "light"}
      >
        <Controls
          className={isDark ? "bg-[#1e1e20] border-[#3f3f46] fill-[#e4e4e7]" : "bg-white border-[#e2e8f0] fill-[#1e293b]"}
          style={{
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.5)' : '0 1px 3px rgba(0,0,0,0.1)'
          }}
        />

        {/* NotebookLM Theme Toggle */}
        <Panel position="bottom-right" className="m-6 mb-8">
          <button
            onClick={() => setIsDark(!isDark)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all shadow-md ${isDark
                ? 'bg-[#1e1e20] text-[#e4e4e7] border border-[#3f3f46] hover:bg-[#27272a]'
                : 'bg-white text-[#1e293b] border border-[#e2e8f0] hover:bg-[#f8fafc]'
              }`}
          >
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
            {isDark ? 'Dark Mode' : 'App Theme'}
          </button>
        </Panel>

        {/* Remove background dots to match NotebookLM solid dark canvas */}
      </ReactFlow>
    </div>
  );
}
