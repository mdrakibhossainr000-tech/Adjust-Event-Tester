import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const GameModal = ({ isOpen, onClose, onSave, game, mode }) => {
  const [formData, setFormData] = useState({
    name: '',
    app_token: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedEventIds, setSelectedEventIds] = useState([]);
  // Add this block - declare events state variable
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (game && mode === 'edit') {
      setFormData({
        name: game?.name || '',
        app_token: game?.app_token || '',
        description: game?.description || ''
      });
      setSelectedEventIds(game?.events?.map(e => e?.id) || []);
      // Add this block - set events from game data
      setEvents(game?.events || []);
    } else {
      setFormData({
        name: '',
        app_token: '',
        description: ''
      });
      setSelectedEventIds([]);
      // Add this block - reset events for new game
      setEvents([]);
    }
    setErrors({});
  }, [game, mode, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleEventSelection = (eventId, checked) => {
    if (checked) {
      setSelectedEventIds(prev => [...prev, eventId]);
    } else {
      setSelectedEventIds(prev => prev?.filter(id => id !== eventId));
    }
  };

  const handleAddEvent = () => {
    // This could open another modal or inline form for adding new events
    // For now, we'll just show a placeholder alert('Add Event functionality would open here');
  };

  const handleRemoveSelectedEvents = () => {
    setSelectedEventIds([]);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.name?.trim()) {
      newErrors.name = 'Game name is required';
    }
    
    if (!formData?.app_token?.trim()) {
      newErrors.app_token = 'App token is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    const gameData = {
      name: formData?.name?.trim(),
      app_token: formData?.app_token?.trim(),
      description: formData?.description?.trim()
    };

    if (mode === 'edit' && game?.id) {
      gameData.id = game?.id;
    }

    await onSave(gameData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#374151] border border-gray-600 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto text-white">
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <h2 className="text-xl font-semibold text-white">
            Game Editor
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Game Name */}
          <div>
            <Input
              label="Game Name:"
              type="text"
              placeholder="Enter game name"
              value={formData?.name}
              onChange={(e) => handleInputChange('name', e?.target?.value)}
              error={errors?.name}
              required
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          
          {/* App Token */}
          <div>
            <Input
              label="App Token:"
              type="text"
              placeholder="Enter app token"
              value={formData?.app_token}
              onChange={(e) => handleInputChange('app_token', e?.target?.value)}
              error={errors?.app_token}
              required
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          
          {/* Events Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-white">Events:</label>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddEvent}
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                >
                  Add Event
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveSelectedEvents}
                  disabled={selectedEventIds?.length === 0}
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 disabled:opacity-50"
                >
                  Remove Selected Event(s)
                </Button>
              </div>
            </div>
            
            {/* Events Table */}
            <div className="border border-gray-600 rounded-lg overflow-hidden">
              <div className="bg-gray-800 grid grid-cols-3 gap-4 p-3 text-sm font-medium text-gray-300">
                <div>Select</div>
                <div>Event Name</div>
                <div>Event Token</div>
              </div>
              
              <div className="max-h-48 overflow-y-auto">
                {events?.length > 0 ? (
                  events?.map((event, index) => (
                    <div
                      key={event?.id}
                      className={`grid grid-cols-3 gap-4 p-3 text-sm border-t border-gray-600 ${
                        index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-750'
                      }`}
                    >
                      <div className="flex items-center">
                        <Checkbox
                          checked={selectedEventIds?.includes(event?.id)}
                          onChange={(checked) => handleEventSelection(event?.id, checked)}
                          className="text-blue-500"
                        />
                      </div>
                      <div className="text-white">{event?.name}</div>
                      <div className="text-gray-300">{event?.id}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-400 border-t border-gray-600">
                    No events available
                  </div>
                )}
              </div>
            </div>
            
            {selectedEventIds?.length > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                {selectedEventIds?.length} event(s) selected
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-600">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            loading={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Game
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameModal;