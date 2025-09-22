import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import ADIDInput from './components/ADIDInput';
import GameSelector from './components/GameSelector';
import EventSelector from './components/EventSelector';
import ActionButtons from './components/ActionButtons';
import ResponseLog from './components/ResponseLog';
import EventModal from './components/EventModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import Icon from '../../components/AppIcon';
import GameModal from './components/GameModal';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../lib/supabase';

const GameEventManager = () => {
  const { user } = useAuth();
  const [adid, setAdid] = useState('');
  const [adidError, setAdidError] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  const [events, setEvents] = useState([]); // Events for current game
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'add', // 'add' or 'edit'
    event: null
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [games, setGames] = useState([]);
  const [gameModalState, setGameModalState] = useState({
    isOpen: false,
    mode: 'add', // 'add' or 'edit'
    game: null
  });

  // Load initial data
  useEffect(() => {
    loadGames();
    loadUserLogs();
  }, []);

  // Filter events when selected game changes
  useEffect(() => {
    if (selectedGame) {
      loadEventsByGame(selectedGame);
      setSelectedEvents([]); // Clear selected events when switching games
    } else {
      setEvents([]);
      setSelectedEvents([]);
    }
  }, [selectedGame]);

  const loadGames = async () => {
    try {
      const { data, error } = await dbHelpers?.getGames();
      if (!error && data) {
        setGames(data);
      }
    } catch (error) {
      console.error('Error loading games:', error);
      addLog('Load Games', 'error', 'Failed to load games', { error: error?.message });
    }
  };

  const loadEventsByGame = async (gameId) => {
    try {
      const { data, error } = await dbHelpers?.getEventsByGameId(gameId);
      if (!error && data) {
        setEvents(data);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      addLog('Load Events', 'error', 'Failed to load events', { error: error?.message });
    }
  };

  const loadUserLogs = async () => {
    try {
      const { data, error } = await dbHelpers?.getUserEventLogs(50);
      if (!error && data) {
        setLogs(data?.map(log => ({
          timestamp: log?.created_at,
          operation: log?.operation,
          status: log?.status,
          message: log?.message,
          details: log?.details,
          events: log?.event_ids || []
        })));
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const validateAdid = (value) => {
    if (!value?.trim()) {
      return 'ADID is required';
    }
    if (value?.length < 10) {
      return 'ADID must be at least 10 characters long';
    }
    return '';
  };

  const handleAdidChange = (value) => {
    setAdid(value);
    const error = validateAdid(value);
    setAdidError(error);
  };

  const addLog = async (operation, status, message, details = null, eventIds = []) => {
    const eventNames = events?.filter(event => eventIds?.includes(event?.id))?.map(event => event?.name);

    const newLog = {
      timestamp: new Date()?.toISOString(),
      operation,
      status,
      message,
      details,
      events: eventNames
    };

    // Add to local state immediately for UI responsiveness
    setLogs(prev => [newLog, ...prev]);

    // Save to database
    try {
      await dbHelpers?.createEventLog({
        adid: adid || 'test-adid',
        game_id: selectedGame,
        event_ids: eventIds,
        operation,
        status,
        message,
        details: details || {}
      });
    } catch (error) {
      console.error('Error saving log:', error);
    }
  };

  const handleAddNew = () => {
    setModalState({
      isOpen: true,
      mode: 'add',
      event: null
    });
  };

  const handleEdit = () => {
    if (selectedEvents?.length === 1) {
      const event = events?.find(e => e?.id === selectedEvents?.[0]);
      setModalState({
        isOpen: true,
        mode: 'edit',
        event
      });
    }
  };

  const handleDelete = () => {
    if (selectedEvents?.length > 0) {
      setDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const { error } = await dbHelpers?.deleteEvents(selectedEvents);
      
      if (!error) {
        const deletedEvents = events?.filter(event => selectedEvents?.includes(event?.id));
        setEvents(prev => prev?.filter(event => !selectedEvents?.includes(event?.id)));
        setSelectedEvents([]);
        
        addLog(
          'Delete Events',
          'success',
          `Successfully deleted ${deletedEvents?.length} event(s)`,
          {
            deletedCount: deletedEvents?.length,
            deletedEvents: deletedEvents?.map(e => ({ id: e?.id, name: e?.name }))
          },
          selectedEvents
        );
      } else {
        addLog('Delete Events', 'error', 'Failed to delete events', { error: error?.message });
      }
      
      setDeleteModalOpen(false);
    } catch (error) {
      addLog('Delete Events', 'error', 'Failed to delete events', { error: error?.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvent = async (eventData) => {
    try {
      if (modalState?.mode === 'edit') {
        const { data, error } = await dbHelpers?.updateEvent(eventData?.id, eventData);
        if (!error) {
          setEvents(prev => prev?.map(event => 
            event?.id === eventData?.id ? data : event
          ));
          addLog('Edit Event', 'success', `Successfully updated event: ${eventData?.name}`, data);
        } else {
          addLog('Edit Event', 'error', 'Failed to update event', { error: error?.message });
        }
      } else {
        const { data, error } = await dbHelpers?.createEvent({
          ...eventData,
          game_id: selectedGame
        });
        if (!error) {
          setEvents(prev => [...prev, data]);
          addLog('Add Event', 'success', `Successfully created event: ${eventData?.name}`, data);
        } else {
          addLog('Add Event', 'error', 'Failed to create event', { error: error?.message });
        }
      }
    } catch (error) {
      addLog(
        modalState?.mode === 'edit' ? 'Edit Event' : 'Add Event',
        'error',
        'Failed to save event',
        { error: error?.message }
      );
    }
  };

  const handleCreditSelected = async () => {
    const adidValidationError = validateAdid(adid);
    if (adidValidationError) {
      setAdidError(adidValidationError);
      return;
    }

    if (!selectedGame) {
      addLog('Credit Events', 'error', 'Please select a game before crediting events');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call for crediting events
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedEventData = events?.filter(event => selectedEvents?.includes(event?.id));
      const totalCredits = selectedEventData?.reduce((sum, event) => sum + (event?.credits || 0), 0);
      
      addLog(
        'Credit Selected Events',
        'success',
        `Successfully credited ${selectedEvents?.length} event(s) with ${totalCredits} total credits`,
        {
          adid,
          game: selectedGame,
          eventsProcessed: selectedEvents?.length,
          totalCredits,
          timestamp: new Date()?.toISOString()
        },
        selectedEvents
      );
    } catch (error) {
      addLog('Credit Selected Events', 'error', 'Failed to credit events', { error: error?.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreditAll = async () => {
    const adidValidationError = validateAdid(adid);
    if (adidValidationError) {
      setAdidError(adidValidationError);
      return;
    }

    if (!selectedGame) {
      addLog('Credit All Events', 'error', 'Please select a game before crediting events');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call for crediting all events
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const activeEvents = events?.filter(event => event?.status === 'active');
      const totalCredits = activeEvents?.reduce((sum, event) => sum + (event?.credits || 0), 0);
      
      addLog(
        'Credit All Events',
        'success',
        `Successfully credited all ${activeEvents?.length} active event(s) with ${totalCredits} total credits`,
        {
          adid,
          game: selectedGame,
          eventsProcessed: activeEvents?.length,
          totalCredits,
          timestamp: new Date()?.toISOString()
        },
        activeEvents?.map(e => e?.id)
      );
    } catch (error) {
      addLog('Credit All Events', 'error', 'Failed to credit all events', { error: error?.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClearLog = () => {
    setLogs([]);
    addLog('Clear Log', 'success', 'Response log cleared successfully');
  };

  const handleExportLog = () => {
    const logData = JSON.stringify(logs, null, 2);
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-manager-logs-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
    document.body?.appendChild(a);
    a?.click();
    document.body?.removeChild(a);
    URL.revokeObjectURL(url);
    
    addLog('Export Log', 'success', 'Log data exported successfully');
  };

  const handleAddNewGame = () => {
    setGameModalState({
      isOpen: true,
      mode: 'add',
      game: null
    });
  };

  const handleSaveGame = async (gameData) => {
    try {
      if (gameModalState?.mode === 'edit') {
        const { data, error } = await dbHelpers?.updateGame(gameData?.id, gameData);
        if (!error) {
          setGames(prev => prev?.map(game => 
            game?.id === gameData?.id ? data : game
          ));
          addLog('Edit Game', 'success', `Successfully updated game: ${gameData?.name}`, data);
        } else {
          addLog('Edit Game', 'error', 'Failed to update game', { error: error?.message });
        }
      } else {
        const { data, error } = await dbHelpers?.createGame(gameData);
        if (!error) {
          setGames(prev => [...prev, data]);
          addLog('Add Game', 'success', `Successfully created game: ${gameData?.name}`, data);
        } else {
          addLog('Add Game', 'error', 'Failed to create game', { error: error?.message });
        }
      }
    } catch (error) {
      addLog(
        gameModalState?.mode === 'edit' ? 'Edit Game' : 'Add Game',
        'error',
        'Failed to save game',
        { error: error?.message }
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/20 rounded-lg">
                <Icon name="Gamepad2" size={24} className="text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Game Event Manager</h1>
                <p className="text-muted-foreground">Test, manage, and credit game events across multiple platforms</p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Left Panel - ADID & Game Selection */}
            <div className="space-y-6">
              {/* ADID Section */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
                  <Icon name="Fingerprint" size={20} />
                  <span>Device Identifier</span>
                </h2>
                <ADIDInput 
                  adid={adid} 
                  setAdid={handleAdidChange} 
                  error={adidError} 
                />
              </div>
              
              {/* Game Configuration Section */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
                  <Icon name="Gamepad2" size={20} />
                  <span>Game Configuration</span>
                </h2>
                <GameSelector 
                  selectedGame={selectedGame} 
                  setSelectedGame={setSelectedGame}
                  games={games}
                  onAddNewGame={handleAddNewGame}
                />
              </div>
            </div>

            {/* Right Panel - Event Selection */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                {selectedGame ? (
                  <EventSelector
                    events={events}
                    selectedEvents={selectedEvents}
                    setSelectedEvents={setSelectedEvents}
                    selectedGameName={games?.find(g => g?.id === selectedGame)?.name}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Icon name="MousePointerClick" size={48} className="text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Select a Game</h3>
                    <p className="text-muted-foreground">
                      Choose a game from the dropdown to view and manage its saved events
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Only show when game is selected */}
          {selectedGame && (
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Icon name="Zap" size={20} />
                <span>Event Actions</span>
              </h2>
              <ActionButtons
                selectedEvents={selectedEvents}
                onAddNew={handleAddNew}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCreditSelected={handleCreditSelected}
                onCreditAll={handleCreditAll}
                onClearLog={handleClearLog}
                loading={loading}
              />
            </div>
          )}

          {/* Response Log */}
          <div className="bg-card border border-border rounded-lg p-6">
            <ResponseLog
              logs={logs}
              onExport={handleExportLog}
              onClear={handleClearLog}
            />
          </div>
        </div>
      </main>
      {/* Modals */}
      <EventModal
        isOpen={modalState?.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: 'add', event: null })}
        onSave={handleSaveEvent}
        event={modalState?.event}
        mode={modalState?.mode}
      />
      <GameModal
        isOpen={gameModalState?.isOpen}
        onClose={() => setGameModalState({ isOpen: false, mode: 'add', game: null })}
        onSave={handleSaveGame}
        game={gameModalState?.game}
        mode={gameModalState?.mode}
      />
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        selectedEvents={selectedEvents}
        events={events}
        loading={loading}
      />
    </div>
  );
};

export default GameEventManager;