import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const EventModal = ({ isOpen, onClose, onSave, event, mode }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    credits: 0,
    status: 'active',
    category: 'gameplay'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'testing', label: 'Testing' }
  ];

  const categoryOptions = [
    { value: 'gameplay', label: 'Gameplay' },
    { value: 'achievement', label: 'Achievement' },
    { value: 'reward', label: 'Reward' },
    { value: 'social', label: 'Social' },
    { value: 'monetization', label: 'Monetization' }
  ];

  useEffect(() => {
    if (event && mode === 'edit') {
      setFormData({
        name: event?.name || '',
        description: event?.description || '',
        credits: event?.credits?.toString() || '',
        status: event?.status || 'active',
        category: event?.category || 'gameplay'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        credits: '',
        status: 'active',
        category: 'gameplay'
      });
    }
    setErrors({});
  }, [event, mode, isOpen]);

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.name?.trim()) {
      newErrors.name = 'Event name is required';
    }
    
    if (!formData?.description?.trim()) {
      newErrors.description = 'Event description is required';
    }
    
    if (!formData?.credits || isNaN(formData?.credits) || parseInt(formData?.credits) < 0) {
      newErrors.credits = 'Credits must be a valid positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    const eventData = {
      name: formData?.name?.trim(),
      description: formData?.description?.trim(),
      credits: parseInt(formData?.credits) || 0,
      status: formData?.status,
      category: formData?.category
    };

    if (mode === 'edit' && event?.id) {
      eventData.id = event?.id;
    }

    await onSave(eventData);
    onClose();
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const eventData = {
        ...formData,
        credits: parseInt(formData?.credits),
        id: event?.id || `event_${Date.now()}`
      };
      
      await onSave(eventData);
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {mode === 'edit' ? 'Edit Event' : 'Add New Event'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-smooth"
          >
            <Icon name="X" size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <Input
            label="Event Name"
            type="text"
            placeholder="Enter event name"
            value={formData?.name}
            onChange={(e) => handleInputChange('name', e?.target?.value)}
            error={errors?.name}
            required
          />
          
          <Input
            label="Description"
            type="text"
            placeholder="Enter event description"
            value={formData?.description}
            onChange={(e) => handleInputChange('description', e?.target?.value)}
            error={errors?.description}
            required
          />
          
          <Input
            label="Credits"
            type="number"
            placeholder="Enter credit amount"
            value={formData?.credits}
            onChange={(e) => handleInputChange('credits', e?.target?.value)}
            error={errors?.credits}
            required
            min="0"
          />
          
          <Select
            label="Status"
            options={statusOptions}
            value={formData?.status}
            onChange={(value) => handleInputChange('status', value)}
            required
          />
          
          <Select
            label="Category"
            options={categoryOptions}
            value={formData?.category}
            onChange={(value) => handleInputChange('category', value)}
            required
          />
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
            variant="default"
            onClick={handleSubmit}
            loading={loading}
            iconName="Save"
            iconPosition="left"
          >
            {mode === 'edit' ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;