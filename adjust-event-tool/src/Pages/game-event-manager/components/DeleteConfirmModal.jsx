import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, selectedEvents, events, loading }) => {
  if (!isOpen) return null;

  const selectedEventNames = events?.filter(event => selectedEvents?.includes(event?.id))?.map(event => event?.name);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-error/20 rounded-lg">
              <Icon name="AlertTriangle" size={20} className="text-error" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Delete Events</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-smooth"
            disabled={loading}
          >
            <Icon name="X" size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-foreground">
            Are you sure you want to delete the following event{selectedEvents?.length > 1 ? 's' : ''}?
          </p>
          
          <div className="bg-muted rounded-lg p-4 max-h-32 overflow-y-auto">
            <ul className="space-y-1">
              {selectedEventNames?.map((name, index) => (
                <li key={index} className="text-sm text-foreground flex items-center space-x-2">
                  <Icon name="Minus" size={12} className="text-muted-foreground" />
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-error/10 border border-error/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Icon name="AlertTriangle" size={16} className="text-error mt-0.5" />
              <div className="text-sm">
                <p className="text-error font-medium">Warning</p>
                <p className="text-error/80">
                  This action cannot be undone. The selected events will be permanently removed from the system.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            loading={loading}
            iconName="Trash2"
            iconPosition="left"
          >
            Delete {selectedEvents?.length > 1 ? 'Events' : 'Event'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;