import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ResponseLog = ({ logs, onExport, onClear }) => {
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp)?.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-success';
      case 'error':
        return 'text-error';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return 'CheckCircle';
      case 'error':
        return 'XCircle';
      case 'warning':
        return 'AlertTriangle';
      default:
        return 'Info';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Response Log</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="Download"
            iconPosition="left"
            onClick={onExport}
            disabled={logs?.length === 0}
          >
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="Trash2"
            iconPosition="left"
            onClick={onClear}
            disabled={logs?.length === 0}
          >
            Clear
          </Button>
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg">
        {logs?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-50" />
            <p>No API responses yet. Start testing events to see logs here.</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {logs?.map((log, index) => (
              <div key={index} className={`p-4 ${index !== logs?.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name={getStatusIcon(log?.status)} 
                      size={16} 
                      className={getStatusColor(log?.status)} 
                    />
                    <span className="font-medium text-foreground">{log?.operation}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log?.status === 'success' ?'bg-success/20 text-success'
                        : log?.status === 'error' ?'bg-error/20 text-error' :'bg-warning/20 text-warning'
                    }`}>
                      {log?.status?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(log?.timestamp)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {log?.message && (
                    <p className="text-sm text-foreground">{log?.message}</p>
                  )}
                  
                  {log?.details && (
                    <div className="bg-muted rounded p-3">
                      <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap overflow-x-auto">
                        {typeof log?.details === 'object' 
                          ? JSON.stringify(log?.details, null, 2)
                          : log?.details
                        }
                      </pre>
                    </div>
                  )}
                  
                  {log?.events && log?.events?.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Events processed: {log?.events?.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseLog;