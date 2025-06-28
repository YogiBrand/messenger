import React, { useCallback, useState, useRef, useEffect } from 'react';
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
  ConnectionMode,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  ChevronLeft, 
  Play, 
  Save, 
  MoreHorizontal, 
  TestTube, 
  Share, 
  Plus,
  Clock,
  Zap,
  Settings,
  GitBranch,
  Calendar,
  Globe,
  Code,
  Database,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Pause,
  RotateCcw,
  Lock,
  Unlock,
  Sparkles
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import CustomNode from './CustomNode';
import NodeConfigPanel from './NodeConfigPanel';
import NodeLibrary from './NodeLibrary';
import WorkflowSidebar from './WorkflowSidebar';

const nodeTypes = {
  custom: CustomNode,
};

const edgeOptions = {
  animated: false,
  style: {
    stroke: '#6366f1',
    strokeWidth: 2,
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#6366f1',
  },
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
    updateNode,
    deleteNode,
    addEdge: addWorkflowEdge,
    setSelectedNode,
    setConfigPanelOpen,
    workflows
  } = useWorkflowStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showNodeLibrary, setShowNodeLibrary] = useState(false);
  const [workflowName, setWorkflowName] = useState(currentWorkflow?.name || 'New Workflow');
  const [isEditingName, setIsEditingName] = useState(false);
  const [addNodeAfter, setAddNodeAfter] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [workflowStatus, setWorkflowStatus] = useState<'draft' | 'published' | 'testing'>('draft');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLocked, setIsLocked] = useState(true); // Default to locked (static positioning)
  const [savedViewport, setSavedViewport] = useState<{ x: number; y: number; zoom: number } | null>(null);

  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Constants for perfect spacing (matching Paragon screenshot)
  const NODE_WIDTH = 320;
  const NODE_HEIGHT = 120;
  const VERTICAL_SPACING = 200; // Much larger spacing to match Paragon
  const CANVAS_CENTER_X = 400;
  const INITIAL_Y = 100;

  // Calculate perfect vertical positions
  const calculateNodePosition = (index: number) => ({
    x: CANVAS_CENTER_X - NODE_WIDTH / 2,
    y: INITIAL_Y + index * (NODE_HEIGHT + VERTICAL_SPACING)
  });

  // Auto-fit view to show all nodes with proper spacing
  const autoFitView = useCallback(() => {
    if (reactFlowInstance && nodes.length > 0) {
      setTimeout(() => {
        reactFlowInstance.fitView({
          padding: 0.2,
          minZoom: 0.4,
          maxZoom: 1.2,
          duration: 800
        });
      }, 100);
    }
  }, [reactFlowInstance, nodes.length]);

  // Initialize nodes and edges from current workflow
  useEffect(() => {
    if (currentWorkflow) {
      const flowNodes = currentWorkflow.nodes.map((node, index) => {
        // Use calculated positions for perfect vertical alignment
        const position = calculateNodePosition(index);
        
        return {
          id: node.id,
          type: 'custom',
          position,
          data: {
            ...node.data,
            onConfigClick: () => {
              setSelectedNode(node);
              setConfigPanelOpen(true);
            },
            onAddNodeBelow: (nodeId: string) => {
              setAddNodeAfter(nodeId);
              setShowNodeLibrary(true);
            },
            onDeleteNode: (nodeId: string) => {
              handleDeleteNode(nodeId);
            }
          },
          draggable: !isLocked // Only draggable when unlocked
        };
      });
      
      // Create edges connecting nodes vertically
      const flowEdges: Edge[] = [];
      for (let i = 0; i < flowNodes.length - 1; i++) {
        const sourceNode = flowNodes[i];
        const targetNode = flowNodes[i + 1];
        
        flowEdges.push({
          id: `edge-${sourceNode.id}-${targetNode.id}`,
          source: sourceNode.id,
          target: targetNode.id,
          type: 'default',
          ...edgeOptions
        });
      }

      setNodes(flowNodes);
      setEdges(flowEdges);
      setWorkflowName(currentWorkflow.name);
      setWorkflowStatus(currentWorkflow.status as any);

      // Auto-fit view when nodes are loaded
      if (flowNodes.length > 0) {
        autoFitView();
      }
    }
  }, [currentWorkflow, isLocked, setNodes, setEdges, setSelectedNode, setConfigPanelOpen, autoFitView]);

  // Update node draggability when lock state changes
  useEffect(() => {
    if (isLocked && savedViewport) {
      // Restore saved viewport when locking
      reactFlowInstance.setViewport(savedViewport, { duration: 300 });
    }
    
    setNodes(prevNodes => 
      prevNodes.map(node => ({
        ...node,
        draggable: !isLocked
      }))
    );
  }, [isLocked, setNodes, reactFlowInstance, savedViewport]);

  const handleDeleteNode = (nodeId: string) => {
    if (!currentWorkflow) return;

    // Find the index of the node being deleted
    const nodeIndex = currentWorkflow.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) return;

    // Delete the node from the store
    deleteNode(nodeId);

    // Recalculate positions for remaining nodes
    const remainingNodes = currentWorkflow.nodes.filter(n => n.id !== nodeId);
    remainingNodes.forEach((node, index) => {
      const newPosition = calculateNodePosition(index);
      updateNode(node.id, {
        position: newPosition
      });
    });

    // Auto-fit view after deletion
    setTimeout(() => {
      autoFitView();
    }, 100);
  };

  const onConnect = useCallback(
    (params: Connection) => {
      // Prevent manual connections in locked mode
      if (isLocked) return;
      
      const newEdge = {
        ...params,
        ...edgeOptions
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
    [setEdges, addWorkflowEdge, isLocked]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const workflowNode = currentWorkflow?.nodes.find(n => n.id === node.id);
    if (workflowNode) {
      setSelectedNode(workflowNode);
      setConfigPanelOpen(true);
    }
  }, [currentWorkflow, setSelectedNode, setConfigPanelOpen]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setConfigPanelOpen(false);
  }, [setSelectedNode, setConfigPanelOpen]);

  const handleAddNode = (nodeTemplate: any) => {
    if (!currentWorkflow) return;

    let insertIndex = currentWorkflow.nodes.length; // Default to end
    
    if (addNodeAfter) {
      // Find the index of the node we're adding after
      const afterNodeIndex = currentWorkflow.nodes.findIndex(n => n.id === addNodeAfter);
      if (afterNodeIndex !== -1) {
        insertIndex = afterNodeIndex + 1;
      }
    }

    // Calculate position for the new node
    const newPosition = calculateNodePosition(insertIndex);

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
        status: 'idle' as const,
        nodeType: nodeTemplate.type
      }
    };

    // Add the new node
    addNode(newNode);

    // If inserting in the middle, update positions of nodes that come after
    if (insertIndex < currentWorkflow.nodes.length) {
      currentWorkflow.nodes.slice(insertIndex).forEach((node, relativeIndex) => {
        const newPos = calculateNodePosition(insertIndex + 1 + relativeIndex);
        updateNode(node.id, {
          position: newPos
        });
      });
    }

    setShowNodeLibrary(false);
    setAddNodeAfter(null);

    // Auto-fit view after adding node
    setTimeout(() => {
      autoFitView();
    }, 100);
  };

  const handleSave = () => {
    if (currentWorkflow) {
      updateWorkflow(currentWorkflow.id, {
        name: workflowName,
        status: workflowStatus
      });
      setLastSaved(new Date());
    }
  };

  const handleTest = () => {
    setWorkflowStatus('testing');
    // Simulate test execution
    setTimeout(() => {
      setWorkflowStatus('draft');
    }, 3000);
  };

  const handleDeploy = () => {
    if (currentWorkflow) {
      updateWorkflow(currentWorkflow.id, {
        status: 'published'
      });
      setWorkflowStatus('published');
      setLastSaved(new Date());
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

  const toggleLock = () => {
    if (!isLocked) {
      // Save current viewport before locking
      const viewport = reactFlowInstance.getViewport();
      setSavedViewport(viewport);
    }
    setIsLocked(!isLocked);
  };

  const handleCleanup = () => {
    if (!currentWorkflow) return;

    // Reposition all nodes with perfect spacing
    currentWorkflow.nodes.forEach((node, index) => {
      const newPosition = calculateNodePosition(index);
      updateNode(node.id, {
        position: newPosition
      });
    });

    // Auto-fit view after cleanup
    setTimeout(() => {
      autoFitView();
    }, 100);
  };

  const getStatusColor = () => {
    switch (workflowStatus) {
      case 'published':
        return 'text-green-600';
      case 'testing':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (workflowStatus) {
      case 'published':
        return <CheckCircle className="w-4 h-4" />;
      case 'testing':
        return <Clock className="w-4 h-4 animate-spin" />;
      default:
        return <Pause className="w-4 h-4" />;
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
    <div className="h-screen flex bg-gray-50">
      {/* Left Sidebar - Workflows List */}
      {showSidebar && (
        <WorkflowSidebar 
          workflows={workflows}
          currentWorkflow={currentWorkflow}
          onWorkflowSelect={(workflow) => {
            // Handle workflow selection
          }}
          onCreateWorkflow={() => setShowNodeLibrary(true)}
          onToggleSidebar={() => setShowSidebar(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!showSidebar && (
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <GitBranch className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Integrations</span>
            </button>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 capitalize">{currentWorkflow.integration || 'Mailchimp'}</span>
          </div>

          <div className="flex items-center gap-4">
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

            <div className={`flex items-center gap-2 text-sm ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="capitalize">{workflowStatus}</span>
            </div>

            {lastSaved && (
              <span className="text-xs text-gray-500">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Lock/Unlock Toggle */}
            <button
              onClick={toggleLock}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                isLocked 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
              title={isLocked ? 'Unlock to move nodes' : 'Lock nodes in place'}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              {isLocked ? 'Locked' : 'Unlocked'}
            </button>

            {/* Cleanup Button */}
            <button
              onClick={handleCleanup}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
              title="Clean up and organize workflow"
            >
              <Sparkles className="w-4 h-4" />
              Clean Up
            </button>
            
            <button 
              onClick={handleTest}
              disabled={workflowStatus === 'testing'}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
            >
              <TestTube className="w-4 h-4" />
              {workflowStatus === 'testing' ? 'Testing...' : 'Test Workflow'}
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button 
              onClick={handleDeploy}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              {workflowStatus === 'published' ? 'Published' : 'Publish'}
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex">
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
              fitView={false}
              className="bg-gray-50"
              defaultViewport={{ x: 0, y: 0, zoom: 0.6 }} // Better initial zoom
              minZoom={0.2}
              maxZoom={1.5}
              snapToGrid={true}
              snapGrid={[20, 20]}
              deleteKeyCode={['Backspace', 'Delete']}
              nodesDraggable={!isLocked}
              nodesConnectable={!isLocked} // Only allow connections when unlocked
              elementsSelectable={true}
              panOnDrag={true}
              zoomOnScroll={true}
              zoomOnPinch={true}
              zoomOnDoubleClick={false}
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
                position="bottom-left"
              />
              
              {/* Empty State */}
              {nodes.length === 0 && (
                <Panel position="top-center" className="mt-20">
                  <div className="text-center bg-white rounded-lg border border-gray-200 p-8 shadow-sm max-w-md">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Start building your workflow</h3>
                    <p className="text-gray-600 text-sm mb-6">
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

              {/* Add Node Button at Bottom */}
              {nodes.length > 0 && (
                <Panel position="bottom-center" className="mb-20">
                  <button
                    onClick={() => {
                      setAddNodeAfter(null);
                      setShowNodeLibrary(true);
                    }}
                    className="w-8 h-8 bg-white border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center hover:border-indigo-500 hover:bg-indigo-50 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </Panel>
              )}

              {/* Lock Status Indicator */}
              {!isLocked && (
                <Panel position="top-left" className="mt-4 ml-4">
                  <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-2 flex items-center gap-2 text-yellow-800 text-sm">
                    <Unlock className="w-4 h-4" />
                    <span>Nodes unlocked - you can move them around</span>
                  </div>
                </Panel>
              )}
            </ReactFlow>
          </div>

          {/* Right Panel - Node Configuration */}
          {isConfigPanelOpen && selectedNode && (
            <NodeConfigPanel 
              node={selectedNode}
              onClose={() => setConfigPanelOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Node Library Modal */}
      {showNodeLibrary && (
        <NodeLibrary
          onSelectNode={(template) => handleAddNode(template)}
          onClose={() => {
            setShowNodeLibrary(false);
            setAddNodeAfter(null);
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