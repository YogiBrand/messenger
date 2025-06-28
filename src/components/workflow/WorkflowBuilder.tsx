import React, { useCallback, useState, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  useReactFlow,
  ConnectionMode
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ChevronLeft, Play, Save, MoreHorizontal, TestTube, Share, Plus } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import CustomNode from './CustomNode';
import NodeConfigPanel from './NodeConfigPanel';
import NodeLibrary from './NodeLibrary';

const nodeTypes = {
  custom: CustomNode,
};

interface WorkflowBuilderProps {
  onBack: () => void;
}

const WorkflowBuilderContent: React.FC<WorkflowBuilderProps> = ({ onBack }) => {
  const { 
    currentWorkflow, 
    selectedNode, 
    isConfigPanelOpen,
    updateWorkflow,
    addNode,
    addEdge: addWorkflowEdge,
    setSelectedNode,
    setConfigPanelOpen
  } = useWorkflowStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showNodeLibrary, setShowNodeLibrary] = useState(false);
  const [workflowName, setWorkflowName] = useState(currentWorkflow?.name || 'New Workflow');
  const [isEditingName, setIsEditingName] = useState(false);
  const [addNodePosition, setAddNodePosition] = useState<{ x: number; y: number } | null>(null);

  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Initialize nodes and edges from current workflow
  React.useEffect(() => {
    if (currentWorkflow) {
      const flowNodes = currentWorkflow.nodes.map(node => ({
        id: node.id,
        type: 'custom',
        position: node.position,
        data: node.data,
        draggable: true
      }));
      
      const flowEdges = currentWorkflow.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'default',
        label: edge.label,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        style: { 
          stroke: '#6366f1', 
          strokeWidth: 2,
          strokeDasharray: edge.type === 'conditional' ? '5,5' : undefined
        },
        animated: false
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
      setWorkflowName(currentWorkflow.name);
    }
  }, [currentWorkflow, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: 'default',
        style: { stroke: '#6366f1', strokeWidth: 2 }
      };
      setEdges((eds) => addEdge(newEdge, eds));
      
      if (params.source && params.target) {
        addWorkflowEdge({
          source: params.source,
          target: params.target,
          type: 'default',
          sourceHandle: params.sourceHandle,
          targetHandle: params.targetHandle
        });
      }
    },
    [setEdges, addWorkflowEdge]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const workflowNode = currentWorkflow?.nodes.find(n => n.id === node.id);
    if (workflowNode) {
      setSelectedNode(workflowNode);
    }
  }, [currentWorkflow, setSelectedNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const handleAddNode = (nodeTemplate: any, position?: { x: number; y: number }) => {
    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    
    let newPosition = position;
    if (!newPosition && reactFlowBounds && reactFlowInstance) {
      // Center the new node in the viewport
      const centerX = reactFlowBounds.width / 2;
      const centerY = reactFlowBounds.height / 2;
      newPosition = reactFlowInstance.project({ x: centerX, y: centerY });
    }
    
    if (!newPosition) {
      newPosition = { x: 250, y: 200 };
    }

    const newNode = {
      type: nodeTemplate.type,
      position: newPosition,
      data: {
        label: nodeTemplate.label,
        subtitle: nodeTemplate.subtitle || nodeTemplate.description,
        description: nodeTemplate.description,
        icon: nodeTemplate.icon,
        integration: nodeTemplate.integration,
        config: nodeTemplate.config || {},
        status: 'idle' as const
      }
    };

    addNode(newNode);
    setShowNodeLibrary(false);
    setAddNodePosition(null);
  };

  const handleAddNodeBetween = (sourceId: string, targetId: string) => {
    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);
    
    if (sourceNode && targetNode) {
      const position = {
        x: (sourceNode.position.x + targetNode.position.x) / 2,
        y: (sourceNode.position.y + targetNode.position.y) / 2 + 50
      };
      setAddNodePosition(position);
      setShowNodeLibrary(true);
    }
  };

  const handleSave = () => {
    if (currentWorkflow) {
      updateWorkflow(currentWorkflow.id, {
        name: workflowName,
        status: 'draft'
      });
    }
  };

  const handleTest = () => {
    console.log('Testing workflow...');
  };

  const handleDeploy = () => {
    if (currentWorkflow) {
      updateWorkflow(currentWorkflow.id, {
        status: 'published'
      });
    }
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    setIsEditingName(false);
    if (currentWorkflow) {
      updateWorkflow(currentWorkflow.id, { name: workflowName });
    }
  };

  if (!currentWorkflow) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No workflow selected</h2>
          <button
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Go back to integrations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Toolbar - Exact Paragon styling */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Integrations / Mailchimp</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {isEditingName ? (
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              className="text-lg font-semibold text-gray-900 bg-transparent border-b border-gray-300 focus:border-indigo-500 focus:outline-none px-2 py-1"
              autoFocus
            />
          ) : (
            <h1 
              className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 px-2 py-1 rounded"
              onClick={handleNameEdit}
            >
              {workflowName}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
            Test Connect Portal
          </button>
          <button 
            onClick={handleTest}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
          >
            <TestTube className="w-4 h-4" />
            Test Workflow
          </button>
          <button 
            onClick={handleDeploy}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            Deploy
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            className="bg-gray-50"
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            minZoom={0.5}
            maxZoom={2}
            snapToGrid={true}
            snapGrid={[20, 20]}
          >
            <Background 
              color="#e5e7eb" 
              gap={20} 
              size={1}
              variant="dots"
            />
            <Controls 
              className="bg-white border border-gray-200 rounded-lg shadow-sm"
              showInteractive={false}
            />
            <MiniMap 
              className="bg-white border border-gray-200 rounded-lg"
              nodeColor="#6366f1"
              maskColor="rgba(0, 0, 0, 0.1)"
              pannable
              zoomable
            />
            
            {/* Empty State */}
            {nodes.length === 0 && (
              <Panel position="top-center" className="mt-20">
                <div className="text-center bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start building your workflow</h3>
                  <p className="text-gray-600 text-sm mb-6 max-w-sm">
                    Add your first trigger to get started. Triggers define when your workflow should run.
                  </p>
                  <button
                    onClick={() => setShowNodeLibrary(true)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Choose a Trigger
                  </button>
                </div>
              </Panel>
            )}

            {/* Add Node Buttons Between Nodes */}
            {edges.map((edge) => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              
              if (!sourceNode || !targetNode) return null;
              
              const midX = (sourceNode.position.x + targetNode.position.x) / 2;
              const midY = (sourceNode.position.y + targetNode.position.y) / 2;
              
              return (
                <Panel key={`add-${edge.id}`} position="top-left" style={{ transform: `translate(${midX}px, ${midY}px)` }}>
                  <button
                    onClick={() => handleAddNodeBetween(edge.source, edge.target)}
                    className="w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-indigo-500 hover:bg-indigo-50 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </Panel>
              );
            })}
          </ReactFlow>

          {/* Floating Add Button */}
          {nodes.length > 0 && (
            <button
              onClick={() => setShowNodeLibrary(true)}
              className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center z-10"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Right Panel - Node Configuration */}
        {isConfigPanelOpen && selectedNode && (
          <NodeConfigPanel 
            node={selectedNode}
            onClose={() => setConfigPanelOpen(false)}
          />
        )}
      </div>

      {/* Node Library Modal */}
      {showNodeLibrary && (
        <NodeLibrary
          onSelectNode={(template) => handleAddNode(template, addNodePosition || undefined)}
          onClose={() => {
            setShowNodeLibrary(false);
            setAddNodePosition(null);
          }}
          integration={currentWorkflow.integration}
        />
      )}
    </div>
  );
};

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderContent {...props} />
    </ReactFlowProvider>
  );
};

export default WorkflowBuilder;