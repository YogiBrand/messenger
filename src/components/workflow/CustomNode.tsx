import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { MoreHorizontal, Copy, Trash2, Play, Settings } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

const CustomNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { setSelectedNode, deleteNode, currentWorkflow } = useWorkflowStore();
  const [showMenu, setShowMenu] = React.useState(false);

  const handleClick = () => {
    const node = currentWorkflow?.nodes.find(n => n.id === id);
    if (node) {
      setSelectedNode(node);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
    setShowMenu(false);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement copy functionality
    setShowMenu(false);
  };

  const getNodeIcon = () => {
    if (data.integration === 'mailchimp') return '🐵';
    if (data.type === 'trigger') return '⚡';
    if (data.type === 'function') return '⚙️';
    if (data.type === 'request') return '🌐';
    if (data.type === 'response') return '✅';
    if (data.type === 'condition') return '🔀';
    if (data.type === 'fanout') return '📤';
    if (data.type === 'delay') return '⏰';
    return data.icon || '⚙️';
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'running':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const isConditionalNode = data.type === 'condition' || data.type === 'conditional';
  const isTriggerNode = data.type === 'trigger';

  return (
    <div className="relative group">
      {/* Input Handle - Only for non-trigger nodes */}
      {!isTriggerNode && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 bg-gray-300 border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ top: -6 }}
        />
      )}

      {/* Node Body */}
      <div
        onClick={handleClick}
        className={`
          bg-white border-2 rounded-lg shadow-sm min-w-[240px] cursor-pointer transition-all
          ${selected ? 'border-indigo-500 shadow-lg ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}
        `}
      >
        {/* Node Header */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                {getNodeIcon()}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm leading-tight">
                  {isTriggerNode ? 'Trigger' : data.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {isTriggerNode ? 'Choose a Trigger' : data.subtitle || data.integration}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Status Indicator */}
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
              
              {/* Menu Button */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]">
                    <button
                      onClick={handleCopy}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                    >
                      <Copy className="w-3 h-3" />
                      Duplicate
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Configuration Summary */}
          {data.config && Object.keys(data.config).length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-600">
                {data.config.action && (
                  <div>Action: {data.config.action}</div>
                )}
                {data.config.condition && (
                  <div>Condition: {data.config.condition}</div>
                )}
                {data.config.campaignName && (
                  <div>Campaign: {data.config.campaignName}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Output Handles */}
      {isConditionalNode ? (
        <>
          {/* Yes Handle */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            className="w-3 h-3 bg-green-500 border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ bottom: -6, left: '30%' }}
          />
          {/* No Handle */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="no"
            className="w-3 h-3 bg-red-500 border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ bottom: -6, right: '30%' }}
          />
          
          {/* Branch Labels */}
          <div className="absolute -bottom-8 left-[30%] transform -translate-x-1/2 text-xs text-green-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Yes
          </div>
          <div className="absolute -bottom-8 right-[30%] transform translate-x-1/2 text-xs text-red-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            No
          </div>
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 bg-gray-300 border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ bottom: -6 }}
        />
      )}
    </div>
  );
};

export default CustomNode;