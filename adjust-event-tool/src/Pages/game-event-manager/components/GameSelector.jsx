import React from 'react';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/ui/Icon';


const GameSelector = ({ selectedGame, setSelectedGame, games, onAddNewGame }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <Select
            value={selectedGame}
            onValueChange={setSelectedGame}
            placeholder="Select a game..."
          >
            {games?.map((game) => (
              <option key={game?.id} value={game?.id}>
                {game?.name}
              </option>
            ))}
          </Select>
        </div>
        
        <Button
          onClick={onAddNewGame}
          variant="outline"
          size="sm"
          className="whitespace-nowrap"
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Add Game
        </Button>
      </div>
      
      {selectedGame && (
        <div className="text-sm text-muted-foreground">
          <Icon name="Info" size={14} className="inline mr-1" />
          Selected: {games?.find(g => g?.id === selectedGame)?.name}
        </div>
      )}
    </div>
  );
};

export default GameSelector;