import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Calendar, 
  FileText, 
  Grid3X3, 
  Clock, 
  Users, 
  Package, 
  Settings,
  Plus,
  Search,
  AlertTriangle,
  ChevronRight,
  X,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Building2,
  MoreHorizontal,
  Eye,
  Pencil,
  Play,
  Pause,
  RotateCcw,
  Save,
  Trash2,
  GitBranch,
  Workflow,
  Zap as ZapIcon,
  Database,
  Code,
  Timer,
  ArrowRight,
  ArrowDown,
  Circle,
  Square,
  Diamond,
  Triangle
} from 'lucide-react';
import { User, Workspace } from '../types/auth';
import { providerConfig, getProviderByKey } from '../lib/providerConfig';
import { useIntegrationStore } from '../store/integrationStore';

interface ParagonLayoutProps {
  currentUser: User;
  onSignOut: () => void;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  onWorkspaceSwitch: (workspaceId: string) => void;
}

const ParagonLayout: React.FC<ParagonLayoutProps> = ({ 
  currentUser, 
  onSignOut, 
  workspaces, 
  currentWorkspace, 
  onWorkspaceSwitch 
}) => {
  const [activeTab, setActiveTab] = useState('integrations');
  const [showIntegrationDrawer, setShowIntegrationDrawer] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showIntegrationDetail, setShowIntegrationDetail] = useState(false);
  const [currentIntegrationId, setCurrentIntegrationId] = useState<string | null>(null);

  const { isConnected, connectPlatform } = useIntegrationStore();

  const sidebarItems = [
    { id: 'integrations', label: 'Integrations', icon: Zap, active: true },
    { id: 'app-events', label: 'App Events', icon: Calendar },
    { id: 'resources', label: 'Resources', icon: FileText, badge: 'BETA' },
    { id: 'catalog', label: 'Catalog', icon: Grid3X3 },
    { id: 'task-history', label: 'Task History', icon: Clock },
    { id: 'connected-users', label: 'Connected Users', icon: Users },
    { id: 'releases', label: 'Releases', icon: Package },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleIntegrationClick = (integration: any) => {
    setSelectedIntegration(integration);
    setCurrentIntegrationId(integration.key);
    setShowIntegrationDetail(true);
  };

  const handleConnectClick = (integration: any) => {
    // For Pinterest, automatically "connect" it for demo purposes
    if (integration.key === 'pinterest') {
      connectPlatform('pinterest', {
        accessToken: 'demo_pinterest_token',
        connectedAt: new Date().toISOString(),
        credentialType: 'oauth'
      });
    }
    
    setSelectedIntegration(integration);
    setCurrentIntegrationId(integration.key);
    setShowIntegrationDetail(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Exact Paragon styling */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <button
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className="flex items-center gap-3 w-full hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {currentWorkspace?.name?.charAt(0) || 'D'}
                </span>
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900 text-sm">
                  {currentWorkspace?.name || 'Development'}
                </div>
                <div className="text-xs text-gray-500">Project</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* Workspace Dropdown */}
            {showWorkspaceMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  {workspaces.map((workspace) => (
                    <button
                      key={workspace.id}
                      onClick={() => {
                        onWorkspaceSwitch(workspace.id);
                        setShowWorkspaceMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                        currentWorkspace?.id === workspace.id ? 'bg-indigo-50 text-indigo-700' : ''
                      }`}
                    >
                      <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {workspace.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium">{workspace.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>What's New</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header - Exact Paragon styling */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {activeTab === 'integrations' && 'Integrations'}
                {activeTab === 'catalog' && 'Integrations Catalog'}
                {activeTab === 'task-history' && 'Task History'}
                {activeTab === 'settings' && 'Settings'}
                {activeTab === 'app-events' && 'App Events'}
                {activeTab === 'resources' && 'Resources'}
                {activeTab === 'connected-users' && 'Connected Users'}
                {activeTab === 'releases' && 'Releases'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-gray-600 hover:text-gray-900 text-sm">
                Sync git branch
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                New Release
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  <span className="text-sm text-gray-600">{currentUser.full_name || currentUser.email}</span>
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {(currentUser.full_name || currentUser.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-2">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-900">
                          {currentUser.full_name || 'User'}
                        </div>
                        <div className="text-xs text-gray-500">{currentUser.email}</div>
                        <div className="text-xs text-purple-600 font-medium mt-1 capitalize">
                          {currentUser.role}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab('settings');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      <button
                        onClick={() => {
                          onSignOut();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 bg-gray-50">
          {activeTab === 'integrations' && !showIntegrationDetail && (
            <IntegrationsView 
              onNewIntegration={() => setActiveTab('catalog')}
              onIntegrationClick={handleIntegrationClick}
            />
          )}
          {activeTab === 'catalog' && !showIntegrationDetail && (
            <CatalogView 
              onSelectIntegration={(integration) => {
                setSelectedIntegration(integration);
                setShowIntegrationDrawer(true);
              }} 
            />
          )}
          {activeTab === 'task-history' && !showIntegrationDetail && <TaskHistoryView />}
          {activeTab === 'settings' && !showIntegrationDetail && <SettingsView currentUser={currentUser} />}
          {activeTab === 'app-events' && !showIntegrationDetail && <AppEventsView />}
          {activeTab === 'resources' && !showIntegrationDetail && <ResourcesView />}
          {activeTab === 'connected-users' && !showIntegrationDetail && <ConnectedUsersView />}
          {activeTab === 'releases' && !showIntegrationDetail && <ReleasesView />}
          
          {/* Integration Detail View - Full Page */}
          {showIntegrationDetail && selectedIntegration && (
            <IntegrationDetailView
              integration={selectedIntegration}
              onClose={() => {
                setShowIntegrationDetail(false);
                setSelectedIntegration(null);
                setCurrentIntegrationId(null);
              }}
              onCreateWorkflow={(integrationKey) => {
                setShowIntegrationDetail(false);
                setActiveTab('workflow-builder');
                setCurrentIntegrationId(integrationKey);
              }}
            />
          )}

          {/* Workflow Builder */}
          {activeTab === 'workflow-builder' && (
            <WorkflowBuilderView 
              integrationId={currentIntegrationId}
              onBack={() => {
                setActiveTab('integrations');
                setCurrentIntegrationId(null);
              }}
            />
          )}
        </div>
      </div>

      {/* Integration Drawer - Exact Paragon styling */}
      <AnimatePresence>
        {showIntegrationDrawer && selectedIntegration && (
          <IntegrationDrawer
            integration={selectedIntegration}
            onClose={() => {
              setShowIntegrationDrawer(false);
              setSelectedIntegration(null);
            }}
            onConnect={() => {
              handleConnectClick(selectedIntegration);
              setShowIntegrationDrawer(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Integrations View Component - Exact Paragon styling
const IntegrationsView: React.FC<{ 
  onNewIntegration: () => void;
  onIntegrationClick: (integration: any) => void;
}> = ({ onNewIntegration, onIntegrationClick }) => {
  const { isConnected } = useIntegrationStore();
  
  const connectedIntegrations = [
    {
      name: 'Pinterest',
      description: 'Connect to your users\' Pinterest accounts',
      icon: '📌',
      users: isConnected('pinterest') ? 1 : 0,
      status: isConnected('pinterest') ? 'active' : 'inactive',
      hasWarning: !isConnected('pinterest'),
      key: 'pinterest'
    },
    {
      name: 'Google Analytics',
      description: 'Manage goals and segments in Google Analytics',
      icon: '📊',
      users: 0,
      status: 'inactive',
      hasWarning: true,
      key: 'google-analytics'
    },
    {
      name: 'Mailchimp',
      description: 'Manage campaigns and contacts in Mailchimp',
      icon: '🐵',
      users: 0,
      status: 'inactive',
      hasWarning: true,
      key: 'mailchimp'
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Connected Integrations</h2>
        <button
          onClick={onNewIntegration}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Integration
        </button>
      </div>

      <div className="space-y-4">
        {connectedIntegrations.map((integration, index) => (
          <div 
            key={index} 
            className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-sm transition-shadow"
            onClick={() => onIntegrationClick(integration)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                  {integration.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                    {integration.hasWarning && (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{integration.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{integration.users} connected users</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${integration.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    {integration.status === 'active' ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Integration Detail View - Full Page Implementation
const IntegrationDetailView: React.FC<{ 
  integration: any; 
  onClose: () => void;
  onCreateWorkflow: (integrationKey: string) => void;
}> = ({ integration, onClose, onCreateWorkflow }) => {
  const { isConnected } = useIntegrationStore();
  const connected = isConnected(integration.key);
  
  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-sm">📌</span>
              </div>
              <h1 className="text-lg font-semibold text-gray-900">{integration.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              {connected ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-6xl mx-auto">
        {/* NEW Badge */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            NEW
            <span className="text-blue-600">This page has a new look!</span>
            <a href="#" className="text-blue-600 underline">Learn more</a>
          </div>
        </div>

        {/* App Configuration Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">App Configuration</h2>
              <p className="text-gray-600 text-sm">Set up the {integration.name} OAuth app that will be used to authorize your users.</p>
            </div>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Add your own keys
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-lg">📌</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm font-medium text-gray-900">
                  {connected ? 'Connected' : 'Configure'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`bg-purple-600 h-2 rounded-full ${connected ? 'w-full' : 'w-1/3'}`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Connect Portal Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Connect Portal</h3>
              <p className="text-gray-600 text-sm">Customize the embedded view that appears to your end user to integrate {integration.name}.</p>
            </div>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Connect a test account
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-20 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <div className="w-16 h-8 bg-purple-700 rounded flex items-center justify-center">
                <span className="text-white text-xs">📌</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                Test Connect Portal
              </button>
              <button className="px-4 py-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                Customize
              </button>
            </div>
          </div>
        </div>

        {/* ActionKit Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded flex items-center justify-center">
              <span className="text-white text-xs">✨</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">ActionKit</h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">NEW</span>
              </div>
              <p className="text-gray-600 text-sm">Equip your AI agent to autonomously use {integration.name} Actions on behalf of your users.</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">ActionKit for {integration.name}</h4>
            <p className="text-gray-600 text-sm mb-3">Create pin, Get boards, Search pins and 3 more actions available</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Eye className="w-4 h-4" />
                <span>Create Pin</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Pencil className="w-4 h-4" />
                <span>Get Boards</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Search Pins</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Get User Profile</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                Open Docs
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Not Enabled</span>
                <div className="w-8 h-4 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflows Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Workflows</h3>
              <p className="text-gray-600 text-sm">Build asynchronous, event-based automations for your {integration.name} users.</p>
            </div>
            <button 
              onClick={() => onCreateWorkflow(integration.key)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              + Create Workflow
            </button>
          </div>

          <div className="text-center py-12">
            <h4 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h4>
            <p className="text-gray-600 text-sm mb-4">Click Create Workflow to start building your first workflow.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Integration Drawer Component - Fixed button text
const IntegrationDrawer: React.FC<{ 
  integration: any; 
  onClose: () => void;
  onConnect: () => void;
}> = ({ integration, onClose, onConnect }) => {
  const { isConnected } = useIntegrationStore();
  const connected = isConnected(integration.key);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📌</span>
                </div>
                <h2 className="text-lg font-semibold">{integration.name}</h2>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-purple-100 text-sm">
              Connect to your users' {integration.name} accounts
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 space-y-6">
            <button 
              onClick={onConnect}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              {connected ? 'Manage' : 'Connect'}
            </button>

            <div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Connect to your users' {integration.name} accounts to create pins and manage boards on their behalf.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Paragon enables you to increase customer engagement by creating pins from your app to your users' {integration.name} boards, for example:
              </p>
              <ul className="mt-3 space-y-1 text-gray-600 text-sm">
                <li>• Create pins automatically from your app's content</li>
                <li>• Manage boards and organize pins programmatically</li>
                <li>• Search and discover relevant pins for your users</li>
              </ul>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-medium">
                Social Media
              </span>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Resources</h4>
              <a
                href="#"
                className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
              >
                Documentation
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Supports</h4>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs">✨</span>
                </div>
                <span className="text-sm text-gray-700">Action Kit</span>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>You can use the Paragon SDK to access the full {integration.name} API on behalf of your users. Check out the <a href="#" className="text-indigo-600 hover:underline">{integration.name} API documentation</a> for their full API reference.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Workflow Builder Component - Complete Paragon Implementation
const WorkflowBuilderView: React.FC<{
  integrationId: string | null;
  onBack: () => void;
}> = ({ integrationId, onBack }) => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [isRunning, setIsRunning] = useState(false);
  const [nodes, setNodes] = useState([
    {
      id: '1',
      type: 'trigger',
      position: { x: 100, y: 100 },
      data: { 
        label: 'Trigger',
        config: {
          type: 'webhook',
          name: 'Webhook Received'
        }
      }
    }
  ]);
  const [edges, setEdges] = useState([]);

  const nodeTypes = [
    { type: 'trigger', label: 'Trigger', icon: Zap, color: 'bg-green-500' },
    { type: 'action', label: 'Action', icon: Play, color: 'bg-blue-500' },
    { type: 'condition', label: 'Condition', icon: GitBranch, color: 'bg-yellow-500' },
    { type: 'delay', label: 'Delay', icon: Timer, color: 'bg-purple-500' },
    { type: 'fanout', label: 'Fan Out', icon: ArrowRight, color: 'bg-indigo-500' },
    { type: 'response', label: 'Response', icon: ArrowDown, color: 'bg-gray-500' }
  ];

  const recentRuns = [
    { id: '1', status: 'success', timestamp: '2 minutes ago', duration: '1.2s' },
    { id: '2', status: 'failed', timestamp: '5 minutes ago', duration: '0.8s' },
    { id: '3', status: 'success', timestamp: '10 minutes ago', duration: '2.1s' }
  ];

  const addNode = (type: string) => {
    const newNode = {
      id: Date.now().toString(),
      type,
      position: { x: Math.random() * 400 + 200, y: Math.random() * 300 + 200 },
      data: {
        label: type.charAt(0).toUpperCase() + type.slice(1),
        config: {}
      }
    };
    setNodes([...nodes, newNode]);
  };

  const runWorkflow = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 3000);
  };

  return (
    <div className="h-full bg-white flex">
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Workflow Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={runWorkflow}
                disabled={isRunning}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isRunning 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block mr-2" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 inline-block mr-2" />
                    Test Run
                  </>
                )}
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                <Save className="w-4 h-4 inline-block mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-gray-50 overflow-hidden">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute bg-white border-2 rounded-lg p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow ${
                selectedNode?.id === node.id ? 'border-indigo-500' : 'border-gray-200'
              }`}
              style={{
                left: node.position.x,
                top: node.position.y,
                width: '200px'
              }}
              onClick={() => setSelectedNode(node)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                  nodeTypes.find(t => t.type === node.type)?.color || 'bg-gray-500'
                }`}>
                  {React.createElement(nodeTypes.find(t => t.type === node.type)?.icon || Circle, { className: 'w-4 h-4' })}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{node.data.label}</div>
                  <div className="text-xs text-gray-500">{node.type}</div>
                </div>
              </div>
              {node.data.config?.name && (
                <div className="mt-2 text-sm text-gray-600">{node.data.config.name}</div>
              )}
            </div>
          ))}

          {/* Add Node Floating Button */}
          <div className="absolute bottom-6 left-6">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
              <div className="grid grid-cols-3 gap-2">
                {nodeTypes.map((nodeType) => (
                  <button
                    key={nodeType.type}
                    onClick={() => addNode(nodeType.type)}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-white hover:scale-105 transition-transform ${nodeType.color}`}
                    title={nodeType.label}
                  >
                    <nodeType.icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button className="flex-1 px-4 py-3 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600">
              Configure
            </button>
            <button className="flex-1 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
              Recent Runs
            </button>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="flex-1 p-4 overflow-y-auto">
          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {selectedNode.data.label} Configuration
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Configure the settings for this {selectedNode.type} node.
                </p>
              </div>

              {selectedNode.type === 'trigger' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trigger Type
                    </label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <option>Webhook</option>
                      <option>Schedule</option>
                      <option>Integration Event</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter trigger name"
                    />
                  </div>
                </div>
              )}

              {selectedNode.type === 'action' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Integration
                    </label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <option>Pinterest</option>
                      <option>Google Analytics</option>
                      <option>Mailchimp</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Action
                    </label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <option>Create Pin</option>
                      <option>Get Boards</option>
                      <option>Search Pins</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedNode.type === 'condition' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., data.status === 'active'"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                  Update Configuration
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">No node selected</h3>
              <p className="text-sm text-gray-600">
                Click on a node to configure its settings.
              </p>
            </div>
          )}
        </div>

        {/* Recent Runs */}
        <div className="border-t border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-3">Recent Runs</h4>
          <div className="space-y-2">
            {recentRuns.map((run) => (
              <div key={run.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    run.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-600">{run.timestamp}</span>
                </div>
                <span className="text-xs text-gray-500">{run.duration}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Catalog View Component - Exact Paragon styling
const CatalogView: React.FC<{ onSelectIntegration: (integration: any) => void }> = ({ onSelectIntegration }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'FEATURED',
    'Popular',
    'Action Kit',
    'CATEGORIES',
    'All',
    'CRM',
    'Sales',
    'Marketing Automation',
    'Analytics',
    'Advertising',
    'E-Commerce',
    'Team Communication',
    'Office Suite',
    'Project Management',
    'Support Ticketing',
    'Accounting / ERP',
    'Payments',
    'HR'
  ];

  const popularIntegrations = [
    { name: 'Salesforce', icon: '☁️', category: 'CRM' },
    { name: 'HubSpot', icon: '🧡', category: 'CRM' },
    { name: 'Slack', icon: '💬', category: 'Communication' },
    { name: 'Shopify', icon: '🛍️', category: 'E-Commerce' }
  ];

  const actionKitIntegrations = [
    { name: 'Asana', icon: '🔴', tag: 'Added' },
    { name: 'Azure DevOps', icon: '🔷', tag: null },
    { name: 'BambooHR', icon: '🎋', tag: null },
    { name: 'Box', icon: '📦', tag: null },
    { name: 'ClickUp', icon: '⬆️', tag: null },
    { name: 'Confluence', icon: '🌊', tag: null },
    { name: 'Facebook Ads', icon: '📘', tag: null },
    { name: 'GitHub', icon: '🐙', tag: null },
    { name: 'Gmail', icon: '📧', tag: null },
    { name: 'Google Calendar', icon: '📅', tag: null },
    { name: 'Google Drive', icon: '💾', tag: null },
    { name: 'Google Sheets', icon: '📊', tag: null },
    { name: 'HubSpot', icon: '🧡', tag: null },
    { name: 'Intercom', icon: '💬', tag: null }
  ];

  return (
    <div className="flex gap-6">
      {/* Left Sidebar */}
      <div className="w-64 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Connect an integration</h2>
          <p className="text-sm text-gray-600 mb-4">
            Add new integrations on Paragon to connect with your users' accounts in other apps - all in just minutes.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search integrations"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>

        <div className="space-y-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                category === 'FEATURED' || category === 'CATEGORIES'
                  ? 'text-gray-500 font-medium text-xs uppercase tracking-wide cursor-default'
                  : selectedCategory === category
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              disabled={category === 'FEATURED' || category === 'CATEGORIES'}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600">💡</div>
            <div>
              <p className="text-sm font-medium text-yellow-800">Don't see the integration you're looking for?</p>
              <button className="text-sm text-indigo-600 hover:text-indigo-700 mt-1">
                Build your own custom integration
                <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">NEW</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular</h3>
          <div className="grid grid-cols-4 gap-4">
            {popularIntegrations.map((integration, index) => (
              <button
                key={index}
                onClick={() => onSelectIntegration(integration)}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-indigo-300 hover:shadow-sm transition-all text-center"
              >
                <div className="text-3xl mb-3">{integration.icon}</div>
                <div className="font-medium text-gray-900 text-sm">{integration.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded flex items-center justify-center">
              <span className="text-white text-xs">✨</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Action Kit</h3>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Equip your AI agent with tool calls from our prebuilt Actions, optimized for LLMs.
          </p>
          
          <div className="grid grid-cols-7 gap-4">
            {actionKitIntegrations.map((integration, index) => (
              <button
                key={index}
                onClick={() => onSelectIntegration(integration)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-sm transition-all text-center relative"
              >
                {integration.tag && (
                  <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    {integration.tag}
                  </div>
                )}
                <div className="text-2xl mb-2">{integration.icon}</div>
                <div className="text-xs font-medium text-gray-900">{integration.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Additional View Components
const TaskHistoryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('workflows');

  return (
    <div>
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('workflows')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'workflows'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Workflows
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'actions'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Actions
          </button>
        </nav>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by User ID"
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
        <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm">
          <option>All Statuses</option>
        </select>
        <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm">
          <option>All Workflows</option>
        </select>
        <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm">
          <option>All Integrations</option>
        </select>
        <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm">
          <option>All time</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-500">
            <div>Status</div>
            <div>{activeTab === 'workflows' ? 'Workflow' : 'Action'}</div>
            <div>Integration</div>
            <div>User</div>
            <div>Timestamp</div>
          </div>
        </div>
        
        <div className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            {activeTab === 'workflows' ? 'No executions found' : 'No Action Logs found'}
          </div>
          {activeTab === 'workflows' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Unlock task history prior to May 29th</p>
              <p className="text-xs text-gray-500">
                To view and search your Task History from over 30 days ago, upgrade your plan.
              </p>
              <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                Upgrade Plan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Settings View Component
const SettingsView: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [activeSection, setActiveSection] = useState('account-details');

  const settingsSections = [
    { id: 'organization', label: 'Organization' },
    { id: 'account-details', label: 'Account Details' },
    { id: 'cli-keys', label: 'CLI Keys' },
    { id: 'team-members', label: 'Team Members' },
    { id: 'billing', label: 'Billing' },
    { id: 'project', label: 'Project' },
    { id: 'sdk-setup', label: 'SDK Setup' },
    { id: 'environment-secrets', label: 'Environment Secrets' },
    { id: 'monitoring', label: 'Monitoring' },
    { id: 'api-keys', label: 'API Keys' }
  ];

  return (
    <div className="flex gap-8">
      {/* Settings Sidebar */}
      <div className="w-64">
        <nav className="space-y-1">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === section.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1">
        {activeSection === 'account-details' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Details</h2>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Account</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-medium text-gray-900">Name</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600">{currentUser.full_name || 'Not set'}</span>
                      <button className="text-indigo-600 hover:text-indigo-700 text-sm">Update</button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-t border-gray-200">
                    <div>
                      <div className="font-medium text-gray-900">Email</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600">{currentUser.email}</span>
                      <button className="text-indigo-600 hover:text-indigo-700 text-sm">Update</button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-t border-gray-200">
                    <div>
                      <div className="font-medium text-gray-900">Role</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600 capitalize">{currentUser.role}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-t border-gray-200">
                    <div>
                      <div className="font-medium text-gray-900">Two-Step verification</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1">
                        <Plus className="w-4 h-4" />
                        Setup authenticator app
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Additional View Components
const AppEventsView: React.FC = () => (
  <div className="text-center py-12">
    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">App Events</h3>
    <p className="text-gray-600">Track and monitor application events and webhooks.</p>
  </div>
);

const ResourcesView: React.FC = () => (
  <div className="text-center py-12">
    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">Resources</h3>
    <p className="text-gray-600">Documentation, guides, and helpful resources.</p>
    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">BETA</span>
  </div>
);

const ConnectedUsersView: React.FC = () => (
  <div className="text-center py-12">
    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">Connected Users</h3>
    <p className="text-gray-600">View and manage users connected to your integrations.</p>
  </div>
);

const ReleasesView: React.FC = () => (
  <div className="text-center py-12">
    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">Releases</h3>
    <p className="text-gray-600">Manage and deploy your integration releases.</p>
  </div>
);

export default ParagonLayout;