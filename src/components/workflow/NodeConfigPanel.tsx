import React, { useState } from 'react';
import { X, Save, TestTube, ChevronRight, Play, ArrowRight } from 'lucide-react';
import { WorkflowNode } from '../../types/workflow';
import { useWorkflowStore } from '../../store/workflowStore';

interface NodeConfigPanelProps {
  node: WorkflowNode;
  onClose: () => void;
}

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({ node, onClose }) => {
  const { updateNode } = useWorkflowStore();
  const [config, setConfig] = useState(node.data.config || {});
  const [activeSection, setActiveSection] = useState('config');

  const handleSave = () => {
    updateNode(node.id, {
      data: {
        ...node.data,
        config,
        subtitle: getSubtitle()
      }
    });
    onClose();
  };

  const handleTest = () => {
    console.log('Testing node:', node.id);
  };

  const getSubtitle = () => {
    if (node.type === 'trigger') {
      if (config.triggerType === 'app_event') return 'App Event';
      if (config.triggerType === 'scheduler') return 'Scheduler';
      if (config.triggerType === 'integration_enabled') return 'Integration Enabled';
      if (config.triggerType === 'request') return 'Request';
      if (config.triggerType === 'mailchimp') return 'Mailchimp';
      return 'Choose a Trigger';
    }
    if (node.type === 'action' && config.action) {
      return config.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return node.data.subtitle || node.data.integration || '';
  };

  const renderTriggerConfig = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">How should this Workflow be triggered?</h4>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button 
            onClick={() => setConfig({ ...config, triggerType: 'scheduler' })}
            className={`p-4 border rounded-lg hover:border-indigo-300 transition-colors text-center ${
              config.triggerType === 'scheduler' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
            }`}
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2 mx-auto">
              <span className="text-blue-600">⏰</span>
            </div>
            <div className="text-sm font-medium text-gray-900">Scheduler</div>
            <div className="text-xs text-gray-500 mt-1">Run this Workflow as a scheduled background job</div>
          </button>
          
          <button 
            onClick={() => setConfig({ ...config, triggerType: 'app_event' })}
            className={`p-4 border rounded-lg hover:border-indigo-300 transition-colors text-center ${
              config.triggerType === 'app_event' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
            }`}
          >
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mb-2 mx-auto">
              <span className="text-indigo-600">⚡</span>
            </div>
            <div className="text-sm font-medium text-gray-900">App Event</div>
            <div className="text-xs text-gray-500 mt-1">Trigger on an custom event sent from your app</div>
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button 
            onClick={() => setConfig({ ...config, triggerType: 'integration_enabled' })}
            className={`p-4 border rounded-lg hover:border-indigo-300 transition-colors text-center ${
              config.triggerType === 'integration_enabled' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
            }`}
          >
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-2 mx-auto">
              <span className="text-gray-600">🔗</span>
            </div>
            <div className="text-sm font-medium text-gray-900">Integration enabled</div>
            <div className="text-xs text-gray-500 mt-1">Trigger when a user initially activates their Mailchimp integration</div>
          </button>
          
          <button 
            onClick={() => setConfig({ ...config, triggerType: 'request' })}
            className={`p-4 border rounded-lg hover:border-indigo-300 transition-colors text-center ${
              config.triggerType === 'request' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
            }`}
          >
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2 mx-auto">
              <span className="text-green-600">📨</span>
            </div>
            <div className="text-sm font-medium text-gray-900">Request</div>
            <div className="text-xs text-gray-500 mt-1">Trigger the workflow directly with the SDK or API</div>
          </button>
        </div>

        <button 
          onClick={() => setConfig({ ...config, triggerType: 'mailchimp' })}
          className={`p-4 border rounded-lg hover:border-indigo-300 transition-colors w-full text-center ${
            config.triggerType === 'mailchimp' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
          }`}
        >
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-2 mx-auto">
            <span className="text-purple-600">🐵</span>
          </div>
          <div className="text-sm font-medium text-gray-900">Mailchimp</div>
          <div className="text-xs text-gray-500 mt-1">Trigger when subscribed or unsubscribed events occurs in Mailchimp lists</div>
        </button>
      </div>
    </div>
  );

  const renderActionConfig = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Choose an action
        </label>
        <select 
          value={config.action || ''}
          onChange={(e) => setConfig({ ...config, action: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        >
          <option value="">Select an action...</option>
          <optgroup label="Campaigns">
            <option value="create_campaign">Create Campaign</option>
            <option value="update_campaign">Update Campaign</option>
            <option value="send_campaign">Send Campaign</option>
            <option value="search_campaigns">Search Campaigns</option>
            <option value="get_campaign_by_id">Get Campaign by ID</option>
            <option value="delete_campaign_by_id">Delete Campaign by ID</option>
          </optgroup>
          <optgroup label="Lists/Audiences">
            <option value="create_list">Create List</option>
            <option value="get_list_by_id">Get List by ID</option>
            <option value="search_lists">Search Lists</option>
            <option value="add_contact_to_list">Add Contact to List</option>
            <option value="update_contact_in_list">Update Contact in List</option>
            <option value="get_contacts_from_list">Get Contacts from List</option>
          </optgroup>
        </select>
      </div>

      {config.action && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Name
            </label>
            <input
              type="text"
              value={config.campaignName || ''}
              onChange={(e) => setConfig({ ...config, campaignName: e.target.value })}
              placeholder="Enter campaign name..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Line
            </label>
            <input
              type="text"
              value={config.subject || ''}
              onChange={(e) => setConfig({ ...config, subject: e.target.value })}
              placeholder="Enter subject line..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderConditionalConfig = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Condition Logic
        </label>
        <textarea
          value={config.condition || ''}
          onChange={(e) => setConfig({ ...config, condition: e.target.value })}
          placeholder="{{email}}.includes('@gmail.com')"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
          rows={4}
        />
        <p className="text-xs text-gray-500 mt-2">
          Use JavaScript expressions with variables in double braces. Example: {`{{email}}.includes('@gmail.com')`}
        </p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="text-sm font-medium text-gray-900 mb-2">Available Variables</h5>
        <div className="space-y-1 text-xs text-gray-600">
          <div><code className="bg-white px-1 rounded">{`{{email}}`}</code> - User email address</div>
          <div><code className="bg-white px-1 rounded">{`{{name}}`}</code> - User full name</div>
          <div><code className="bg-white px-1 rounded">{`{{userId}}`}</code> - User ID</div>
        </div>
      </div>
    </div>
  );

  const renderTestSection = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TestTube className="w-8 h-8 text-gray-400" />
        </div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">Test this step</h4>
        <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">
          Run a test to see how this step performs with sample data.
        </p>
        <button
          onClick={handleTest}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 mx-auto"
        >
          <Play className="w-4 h-4" />
          Run Test
        </button>
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <h5 className="text-sm font-medium text-gray-900 mb-3">Test Results</h5>
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          No test results yet. Run a test to see the output.
        </div>
      </div>
    </div>
  );

  const renderConfig = () => {
    switch (node.type) {
      case 'trigger':
        return renderTriggerConfig();
      case 'action':
        return renderActionConfig();
      case 'condition':
        return renderConditionalConfig();
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <p>No configuration available for this node type.</p>
          </div>
        );
    }
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
              {node.data.icon || '⚙️'}
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {node.type === 'trigger' ? 'Edit Step' : 'Add a Step'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{node.type === 'trigger' ? 'Trigger' : node.data.label}</span>
          {node.data.integration && (
            <>
              <ArrowRight className="w-3 h-3" />
              <span className="capitalize">{node.data.integration}</span>
            </>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveSection('config')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeSection === 'config'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {node.type === 'trigger' ? 'Trigger' : 'Configure'}
          </button>
          <button
            onClick={() => setActiveSection('test')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeSection === 'test'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Test Step
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {activeSection === 'config' ? renderConfig() : renderTestSection()}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeConfigPanel;