import React from 'react';
import Button from '../../../components/ui/Button';

const ActionButtons = ({ 
  selectedEvents, 
  onAddNew, 
  onEdit, 
  onDelete, 
  onCreditSelected, 
  onCreditAll, 
  onClearLog,
  loading 
}) => {
  const hasSelectedEvents = selectedEvents?.length > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Button
          variant="default"
          iconName="Plus"
          iconPosition="left"
          onClick={onAddNew}
          disabled={loading}
          className="w-full"
        >
          Add New Event
        </Button>
        
        <Button
          variant="outline"
          iconName="Edit"
          iconPosition="left"
          onClick={onEdit}
          disabled={!hasSelectedEvents || selectedEvents?.length > 1 || loading}
          className="w-full"
        >
          Edit Selected
        </Button>
        
        <Button
          variant="destructive"
          iconName="Trash2"
          iconPosition="left"
          onClick={onDelete}
          disabled={!hasSelectedEvents || loading}
          className="w-full"
        >
          Delete Selected
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          variant="default"
          iconName="CreditCard"
          iconPosition="left"
          onClick={onCreditSelected}
          disabled={!hasSelectedEvents || loading}
          loading={loading}
          className="w-full"
        >
          Credit Selected Events
        </Button>
        
        <Button
          variant="outline"
          iconName="Zap"
          iconPosition="left"
          onClick={onCreditAll}
          disabled={loading}
          loading={loading}
          className="w-full"
        >
          Credit ALL Events
        </Button>
      </div>
      <Button
        variant="ghost"
        iconName="RotateCcw"
        iconPosition="left"
        onClick={onClearLog}
        disabled={loading}
        className="w-full"
      >
        Clear Log
      </Button>
    </div>
  );
};

export default ActionButtons;