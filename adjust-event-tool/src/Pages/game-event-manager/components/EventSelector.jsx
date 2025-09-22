import React from 'react';
import { Checkbox, CheckboxGroup } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const EventSelector = ({ events, selectedEvents, setSelectedEvents, selectedGameName }) => {
  const handleEventToggle = (eventId) => {
    setSelectedEvents(prev => {
      if (prev?.includes(eventId)) {
        return prev?.filter(id => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedEvents?.length === events?.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(events?.map(event => event?.id));
    }
  };

  const isAllSelected = selectedEvents?.length === events?.length && events?.length > 0;
  const isPartiallySelected = selectedEvents?.length > 0 && selectedEvents?.length < events?.length;

  if (!events || events?.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {selectedGameName ? `${selectedGameName} Events` : 'Available Events'}
          </h3>
        </div>
        
        <div className="text-center py-8">
          <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">No Events Found</h4>
          <p className="text-muted-foreground mb-4">
            {selectedGameName ? `No saved events found for ${selectedGameName}` : 'No events available'}
          </p>
          <p className="text-sm text-muted-foreground">
            Click "Add New Event" to create your first event for this game
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {selectedGameName ? `${selectedGameName} Events` : 'Available Events'}
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({events?.length} saved)
          </span>
        </h3>
        <button
          onClick={handleSelectAll}
          className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 transition-smooth"
        >
          <Icon 
            name={isAllSelected ? "CheckSquare" : isPartiallySelected ? "MinusSquare" : "Square"} 
            size={16} 
          />
          <span>{isAllSelected ? "Deselect All" : "Select All"}</span>
        </button>
      </div>
      
      <CheckboxGroup>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {events?.map((event) => (
            <div key={event?.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedEvents?.includes(event?.id)}
                  onChange={() => handleEventToggle(event?.id)}
                />
                <div>
                  <div className="font-medium text-foreground">{event?.name}</div>
                  <div className="text-sm text-muted-foreground">{event?.description}</div>
                  {event?.category && (
                    <div className="text-xs text-muted-foreground capitalize mt-1">
                      Category: {event?.category}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  event?.status === 'active' ? 'bg-success/20 text-success' :
                  event?.status === 'testing'? 'bg-warning/20 text-warning' : 'bg-muted-foreground/20 text-muted-foreground'
                }`}>
                  {event?.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  Credits: {event?.credits}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CheckboxGroup>
      
      {selectedEvents?.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {selectedEvents?.length} of {events?.length} events selected
        </div>
      )}
    </div>
  );
};

export default EventSelector;