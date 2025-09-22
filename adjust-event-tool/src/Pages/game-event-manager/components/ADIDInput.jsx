import React from 'react';
import Input from '../../../components/ui/Input';

const ADIDInput = ({ adid, setAdid, error }) => {
  const handleAdidChange = (e) => {
    const value = e?.target?.value;
    setAdid(value);
  };

  return (
    <div className="space-y-2">
      <Input
        label="Android Advertising ID (ADID)"
        type="text"
        placeholder="Enter ADID (e.g., 12345678-1234-1234-1234-123456789012)"
        value={adid}
        onChange={handleAdidChange}
        error={error}
        required
        description="Required for game event testing and crediting"
        className="font-mono text-sm"
      />
    </div>
  );
};

export default ADIDInput;