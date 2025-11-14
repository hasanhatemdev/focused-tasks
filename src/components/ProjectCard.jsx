import { useState, useEffect } from 'react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, FolderOpen, MoreVertical, Edit2, Check, X, Link2, Palette, GripVertical } from 'lucide-react';
import TaskItem from './TaskItem';

function ProjectCard({ project, onAddTask, onUpdateTask, onDeleteTask, onDeleteProject, onUpdateProject, quickAdd, onQuickAddComplete, allTasks }) {
  const [newTaskText, setNewTaskText] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(project.name);
  const [selectedDependencies, setSelectedDependencies] = useState([]);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const colors = [
    { name: 'Blue', class: 'bg-blue-500', gradient: 'from-blue-50 to-blue-100' },
    { name: 'Green', class: 'bg-green-500', gradient: 'from-green-50 to-green-100' },
    { name: 'Purple', class: 'bg-purple-500', gradient: 'from-purple-50 to-purple-100' },
    { name: 'Red', class: 'bg-red-500', gradient: 'from-red-50 to-red-100' },
    { name: 'Yellow', class: 'bg-yellow-500', gradient: 'from-yellow-50 to-yellow-100' },
    { name: 'Pink', class: 'bg-pink-500', gradient: 'from-pink-50 to-pink-100' },
    { name: 'Indigo', class: 'bg-indigo-500', gradient: 'from-indigo-50 to-indigo-100' },
    { name: 'Teal', class: 'bg-teal-500', gradient: 'from-teal-50 to-teal-100' },
    { name: 'Orange', class: 'bg-orange-500', gradient: 'from-orange-50 to-orange-100' },
  ];

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      onAddTask(project.id, newTaskText, selectedDependencies);
      setNewTaskText('');
      setShowAddTask(false);
      setSelectedDependencies([]);
      if (quickAdd) onQuickAddComplete();
    }
  };

  // Open quick add when triggered by keyboard shortcut
  useEffect(() => {
    if (quickAdd) {
      setShowAddTask(true);
    }
  }, [quickAdd]);

  const handleSaveName = () => {
    if (editingName.trim()) {
      onUpdateProject(project.id, { name: editingName });
      setIsEditingName(false);
    }
  };

  const activeTasks = project.tasks.filter(t => !t.archived);
  const todoTasks = activeTasks.filter(t => t.status === 'todo').length;
  const inProgressTasks = activeTasks.filter(t => t.status === 'progress').length;
  const doneTasks = activeTasks.filter(t => t.status === 'done').length;

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      {/* Project Header */}
      <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-move p-1 hover:bg-white/50 rounded transition-colors"
              title="Drag to reorder project"
            >
              <GripVertical className="w-4 h-4 text-gray-600" />
            </div>
            <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
            {isEditingName ? (
              <div className="flex items-center space-x-2 flex-1">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                  className="flex-1 px-2 py-1 text-sm font-semibold bg-white/80 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <button onClick={handleSaveName} className="text-green-600 hover:text-green-700">
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsEditingName(false);
                    setEditingName(project.name);
                  }}
                  className="text-gray-600 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <h3
                className="font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => setIsEditingName(true)}
              >
                {project.name}
              </h3>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-white/50 rounded transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-700" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => {
                    setIsEditingName(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Rename</span>
                </button>
                <button
                  onClick={() => {
                    setShowColorPicker(!showColorPicker);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <Palette className="w-3 h-3" />
                  <span>Change Color</span>
                </button>
                <button
                  onClick={() => {
                    onDeleteProject(project.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Task Stats */}
        <div className="flex items-center space-x-4 mt-2 text-xs font-medium">
          <span className="text-gray-700">Todo: <span className="font-bold">{todoTasks}</span></span>
          <span className="text-blue-700">In Progress: <span className="font-bold">{inProgressTasks}</span></span>
          <span className="text-green-700">Done: <span className="font-bold">{doneTasks}</span></span>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[300px] min-h-[150px]">
        <SortableContext
          items={project.tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {project.tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              projectId={project.id}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
              allTasks={allTasks}
            />
          ))}
        </SortableContext>

        {project.tasks.length === 0 && !showAddTask && (
          <div className="text-center py-8 text-gray-400">
            <FolderOpen className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">No tasks yet</p>
          </div>
        )}
      </div>

      {/* Add Task */}
      <div className="p-2 border-t border-gray-200">
        {showAddTask ? (
          <div className="space-y-1.5">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Task description..."
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                onClick={handleAddTask}
                className="flex-1 bg-indigo-600 text-white px-2 py-1 text-sm rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddTask(false);
                  setNewTaskText('');
                }}
                className="flex-1 bg-gray-100 text-gray-700 px-2 py-1 text-sm rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddTask(true)}
            className="w-full flex items-center justify-center space-x-2 px-2 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add task</span>
          </button>
        )}
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-6" onClick={() => setShowColorPicker(false)}>
          <div className="bg-white rounded-lg p-4 max-w-xs w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Choose Color</h3>
              <button onClick={() => setShowColorPicker(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {colors.map(color => (
                <button
                  key={color.class}
                  onClick={() => {
                    onUpdateProject(project.id, { color: color.class });
                    setShowColorPicker(false);
                  }}
                  className={`w-12 h-12 rounded-lg ${color.class} hover:scale-110 transition-transform ${
                    project.color === color.class ? 'ring-2 ring-gray-400 ring-offset-2' : ''
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectCard;