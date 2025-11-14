import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Flag, Trash2, Archive, Circle, CheckCircle2, Clock, Edit2, X, Check, GripVertical, Link2, Repeat, MoreVertical } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

function TaskItem({ task, projectId, onUpdate, onDelete, allTasks }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(task.notes || '');
  const [showActionMenu, setShowActionMenu] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(projectId, task.id, { text: editText });
      setIsEditing(false);
    }
  };

  const handleStatusToggle = () => {
    const statusFlow = {
      'todo': 'progress',
      'progress': 'done',
      'done': 'todo'
    };
    const newStatus = statusFlow[task.status];

    // Add celebration animation for completing tasks
    if (newStatus === 'done') {
      // Create a temporary celebration element
      const celebration = document.createElement('div');
      celebration.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl pointer-events-none z-50';
      celebration.innerHTML = '🎉';
      celebration.style.animation = 'bounce 0.6s ease-out';
      document.body.appendChild(celebration);

      setTimeout(() => {
        document.body.removeChild(celebration);
      }, 600);
    }

    onUpdate(projectId, task.id, { status: newStatus });
  };

  const handlePriorityChange = () => {
    const priorityFlow = {
      'low': 'medium',
      'medium': 'high',
      'high': 'low'
    };
    onUpdate(projectId, task.id, { priority: priorityFlow[task.priority] });
  };

  const handleArchive = () => {
    onUpdate(projectId, task.id, { archived: !task.archived });
    setShowContextMenu(false);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleSaveNotes = () => {
    onUpdate(projectId, task.id, { notes });
    setShowNotes(false);
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDueDate = () => {
    if (!task.dueDate) return null;
    const date = new Date(task.dueDate);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) return `Overdue`;
    return format(date, 'MMM d');
  };

  const dueDateColor = () => {
    if (!task.dueDate) return '';
    const date = new Date(task.dueDate);
    if (isPast(date) && task.status !== 'done') return 'text-red-600 bg-red-50';
    if (isToday(date)) return 'text-orange-600 bg-orange-50';
    return 'text-gray-600 bg-gray-50';
  };

  if (task.archived) {
    return null;
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`task-animation group bg-gray-50 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-lg p-2 hover:shadow-sm transition-all ${
          task.status === 'done' ? 'opacity-60 bg-green-50' : ''
        } ${
          task.isToday ? 'ring-2 ring-blue-400 ring-opacity-50 bg-blue-50' : ''
        }`}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
      >
        <div className="flex items-start space-x-2">
        <button
          onClick={handleStatusToggle}
          className="mt-0.5 hover:scale-110 transition-transform flex-shrink-0"
        >
          {getStatusIcon()}
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <button onClick={handleSave} className="text-green-600 hover:text-green-700 flex-shrink-0">
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditText(task.text);
                }}
                className="text-gray-600 hover:text-gray-700 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <p
                className={`text-sm leading-tight ${
                  task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'
                }`}
              >
                {task.text}
              </p>

              {/* Tags */}
              <div className="flex items-center flex-wrap gap-1 mt-2">
                {/* Priority */}
                <button
                  onClick={handlePriorityChange}
                  className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs ${getPriorityColor()}`}
                >
                  <Flag className="w-3 h-3" />
                  <span>{task.priority}</span>
                </button>

                {/* Due Date */}
                {task.dueDate ? (
                  <button
                    onClick={() => setShowDatePicker(true)}
                    className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs ${dueDateColor()}`}
                  >
                    <Calendar className="w-3 h-3" />
                    <span>{formatDueDate()}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowDatePicker(true)}
                    className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs text-gray-500 bg-gray-200/50 hover:bg-gray-300/50 transition-colors"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>+</span>
                  </button>
                )}

                {/* Dependencies */}
                {task.dependencies && task.dependencies.length > 0 && (
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700" title="Has dependencies">
                    <Link2 className="w-3 h-3" />
                    <span>{task.dependencies.length}</span>
                  </span>
                )}

                {/* Notes indicator */}
                {task.notes && (
                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-700"
                  >
                    <span>📝</span>
                  </button>
                )}

                {/* Recurring indicator */}
                {task.recurring && (
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700" title={`Repeats ${task.recurring}${task.recurringDay !== undefined ? ' on ' + ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][task.recurringDay] : ''}`}>
                    <Repeat className="w-3 h-3" />
                    <span className="capitalize">
                      {task.recurring === 'weekly' && task.recurringDay !== undefined
                        ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][task.recurringDay]
                        : task.recurring}
                    </span>
                  </span>
                )}
              </div>

              {/* Notes display */}
              {showNotes && task.notes && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700">
                  <div className="flex justify-between items-start">
                    <p className="flex-1">{task.notes}</p>
                    <button onClick={() => setShowNotes(false)} className="ml-2 text-gray-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <div
              {...attributes}
              {...listeners}
              className="cursor-move p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <GripVertical className="w-3 h-3 text-gray-400" />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowActionMenu(!showActionMenu)}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                <MoreVertical className="w-3 h-3" />
              </button>
              {showActionMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowActionMenu(false)}
                  />
                  <div className="absolute right-0 top-6 z-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-28">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowActionMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        handleArchive();
                        setShowActionMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Archive className="w-3 h-3" />
                      <span>Archive</span>
                    </button>
                    <button
                      onClick={() => {
                        onDelete(projectId, task.id);
                        setShowActionMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowContextMenu(false)}
          />
          <div
            className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-32"
            style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
          >
            <button
              onClick={() => {
                setIsEditing(true);
                setShowContextMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => {
                setShowNotes(true);
                setShowContextMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
            >
              <span>📝</span>
              <span>Add Note</span>
            </button>
            <div className="relative">
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Repeat className="w-3 h-3" />
                  <span>Make Recurring</span>
                </div>
                <span>›</span>
              </button>
              <div className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-24">
                <button
                  onClick={() => {
                    onUpdate(projectId, task.id, { recurring: 'daily' });
                    setShowContextMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Daily
                </button>
                <button
                  onClick={() => {
                    onUpdate(projectId, task.id, { recurring: 'weekly' });
                    setShowContextMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Weekly
                </button>
                <button
                  onClick={() => {
                    onUpdate(projectId, task.id, { recurring: 'monthly' });
                    setShowContextMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Monthly
                </button>
                <button
                  onClick={() => {
                    onUpdate(projectId, task.id, { recurring: null });
                    setShowContextMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>
            <button
              onClick={handleArchive}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
            >
              <Archive className="w-3 h-3" />
              <span>Archive</span>
            </button>
            <button
              onClick={() => {
                onDelete(projectId, task.id);
                setShowContextMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}

      {/* Notes Editor */}
      {showNotes && !task.notes && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-6" onClick={() => setShowNotes(false)}>
          <div className="bg-white rounded-lg p-4 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Add Note</h3>
              <button onClick={() => setShowNotes(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note..."
              className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowNotes(false)}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Picker */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-6" onClick={() => setShowDatePicker(false)}>
          <div className="bg-white rounded-lg p-4 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Set Due Date</h3>
              <button onClick={() => setShowDatePicker(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Options */}
            <div className="space-y-2 mb-4">
              <button
                onClick={() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  onUpdate(projectId, task.id, { dueDate: today.toISOString() });
                  setShowDatePicker(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  tomorrow.setHours(0, 0, 0, 0);
                  onUpdate(projectId, task.id, { dueDate: tomorrow.toISOString() });
                  setShowDatePicker(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
              >
                Tomorrow
              </button>
              <button
                onClick={() => {
                  const nextWeek = new Date();
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  nextWeek.setHours(0, 0, 0, 0);
                  onUpdate(projectId, task.id, { dueDate: nextWeek.toISOString() });
                  setShowDatePicker(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
              >
                Next Week
              </button>
            </div>

            {/* Recurring Day of Week */}
            <div className="border-t pt-4 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Every Week On
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: 'Mon', day: 1 },
                  { name: 'Tue', day: 2 },
                  { name: 'Wed', day: 3 },
                  { name: 'Thu', day: 4 },
                  { name: 'Fri', day: 5 },
                  { name: 'Sat', day: 6 },
                  { name: 'Sun', day: 0 }
                ].map((dayInfo) => (
                  <button
                    key={dayInfo.day}
                    onClick={() => {
                      const today = new Date();
                      const currentDay = today.getDay();
                      const daysUntilTarget = (dayInfo.day - currentDay + 7) % 7;
                      const targetDate = new Date();
                      targetDate.setDate(today.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
                      targetDate.setHours(0, 0, 0, 0);
                      onUpdate(projectId, task.id, {
                        dueDate: targetDate.toISOString(),
                        recurring: 'weekly',
                        recurringDay: dayInfo.day
                      });
                      setShowDatePicker(false);
                    }}
                    className="px-3 py-2 text-sm hover:bg-indigo-50 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
                  >
                    {dayInfo.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Sets task to recur every week on selected day</p>
            </div>

            {/* Custom Date Picker */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Date
              </label>
              <input
                type="date"
                defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const date = new Date(e.target.value + 'T00:00:00');
                    onUpdate(projectId, task.id, { dueDate: date.toISOString() });
                    setShowDatePicker(false);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Remove Date */}
            {task.dueDate && (
              <div className="border-t mt-4 pt-4">
                <button
                  onClick={() => {
                    onUpdate(projectId, task.id, { dueDate: null, recurring: null, recurringDay: null });
                    setShowDatePicker(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Remove Due Date
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default TaskItem;