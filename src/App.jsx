import { useState, useEffect, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Archive, Calendar, Flag, Search, FolderOpen, CheckCircle2, Circle, Clock, Trash2, Edit2, X, Check, BarChart3, Link2, Command, Download, Undo, CheckSquare, Menu } from 'lucide-react';
import { format, isToday, isTomorrow, isPast, addDays, differenceInDays, parseISO } from 'date-fns';
import TaskItem from './components/TaskItem';
import ProjectCard from './components/ProjectCard';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';

function App() {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [autoSortByDate, setAutoSortByDate] = useState(false);
  const [quickAddProject, setQuickAddProject] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [actionHistory, setActionHistory] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const searchInputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      keys: 'cmd+k',
      callback: () => {
        setSearchQuery(searchQuery ? '' : ' ');
        setTimeout(() => searchInputRef.current?.focus(), 100);
      },
    },
    {
      keys: 'cmd+n',
      callback: () => {
        const firstProject = projects[0];
        if (firstProject) {
          setQuickAddProject(firstProject.id);
        }
      },
    },
    {
      keys: 'escape',
      callback: () => {
        setSearchQuery('');
        setShowAnalytics(false);
        setQuickAddProject(null);
        setSelectedTasks([]);
        setShowMenu(false);
      },
    },
    {
      keys: 'cmd+z',
      callback: () => {
        if (actionHistory.length > 0) {
          const lastAction = actionHistory[actionHistory.length - 1];
          setProjects(lastAction);
          setActionHistory(prev => prev.slice(0, -1));
        }
      },
    },
  ]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('taskManagerData');
    if (savedData) {
      setProjects(JSON.parse(savedData));
    } else {
      // Initial demo data
      setProjects([
        {
          id: '1',
          name: 'Real Estate Dubai',
          color: 'bg-blue-500',
          tasks: []
        },
        {
          id: '2',
          name: 'Real Estate Germany',
          color: 'bg-green-500',
          tasks: []
        }
      ]);
    }
  }, []);

  // Save to localStorage whenever projects change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('taskManagerData', JSON.stringify(projects));
    }
  }, [projects]);

  const addProject = () => {
    if (newProjectName.trim()) {
      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'];
      const newProject = {
        id: Date.now().toString(),
        name: newProjectName,
        color: colors[Math.floor(Math.random() * colors.length)],
        tasks: []
      };
      setProjects([...projects, newProject]);
      setNewProjectName('');
      setShowAddProject(false);
    }
  };

  const deleteProject = (projectId) => {
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const updateProject = (projectId, updates) => {
    setProjects(projects.map(project =>
      project.id === projectId ? { ...project, ...updates } : project
    ));
  };

  const addTask = (projectId, taskText, dependencies = [], recurring = null) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        const newTask = {
          id: Date.now().toString(),
          text: taskText,
          status: 'todo',
          priority: 'medium',
          dueDate: null,
          createdAt: new Date().toISOString(),
          archived: false,
          dependencies: dependencies,
          recurring: recurring,
          lastRecurredAt: null
        };
        return { ...project, tasks: [...project.tasks, newTask] };
      }
      return project;
    }));
    setQuickAddProject(null);
  };

  // Check for recurring tasks that need to be created
  useEffect(() => {
    const checkRecurringTasks = () => {
      const now = new Date();

      projects.forEach(project => {
        project.tasks.forEach(task => {
          if (task.recurring && task.status === 'done') {
            const lastRecurred = task.lastRecurredAt ? new Date(task.lastRecurredAt) : new Date(task.createdAt);
            let shouldCreate = false;
            let newDueDate = null;

            switch (task.recurring) {
              case 'daily':
                shouldCreate = differenceInDays(now, lastRecurred) >= 1;
                if (shouldCreate) {
                  newDueDate = new Date(now);
                  newDueDate.setDate(now.getDate() + 1);
                }
                break;
              case 'weekly':
                shouldCreate = differenceInDays(now, lastRecurred) >= 7;
                if (shouldCreate && task.recurringDay !== undefined) {
                  // Set to next occurrence of the specific day
                  const currentDay = now.getDay();
                  const daysUntilTarget = (task.recurringDay - currentDay + 7) % 7;
                  newDueDate = new Date(now);
                  newDueDate.setDate(now.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
                } else if (shouldCreate) {
                  newDueDate = new Date(now);
                  newDueDate.setDate(now.getDate() + 7);
                }
                break;
              case 'monthly':
                shouldCreate = differenceInDays(now, lastRecurred) >= 30;
                if (shouldCreate) {
                  newDueDate = new Date(now);
                  newDueDate.setDate(now.getDate() + 30);
                }
                break;
            }

            if (shouldCreate) {
              // Create new instance of recurring task
              const newTask = {
                ...task,
                id: Date.now().toString() + '-recurring',
                status: 'todo',
                createdAt: now.toISOString(),
                lastRecurredAt: now.toISOString(),
                dueDate: newDueDate ? newDueDate.toISOString() : task.dueDate
              };

              setProjects(prev => prev.map(p =>
                p.id === project.id
                  ? { ...p, tasks: [...p.tasks, newTask] }
                  : p
              ));

              // Update original task's lastRecurredAt
              updateTask(project.id, task.id, { lastRecurredAt: now.toISOString() });
            }
          }
        });
      });
    };

    const interval = setInterval(checkRecurringTasks, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [projects]);

  const updateTask = (projectId, taskId, updates) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.map(task =>
            task.id === taskId ? { ...task, ...updates } : task
          )
        };
      }
      return project;
    }));
  };

  const deleteTask = (projectId, taskId) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.filter(task => task.id !== taskId)
        };
      }
      return project;
    }));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const activeProject = projects.find(p =>
        p.tasks.some(t => t.id === active.id)
      );
      const overProject = projects.find(p =>
        p.tasks.some(t => t.id === over.id)
      );

      if (activeProject.id === overProject.id) {
        setProjects(projects.map(project => {
          if (project.id === activeProject.id) {
            const oldIndex = project.tasks.findIndex(t => t.id === active.id);
            const newIndex = project.tasks.findIndex(t => t.id === over.id);
            return {
              ...project,
              tasks: arrayMove(project.tasks, oldIndex, newIndex)
            };
          }
          return project;
        }));
      }
    }
  };

  // Sort tasks by due date if enabled
  const sortTasksByDueDate = (tasks) => {
    if (!autoSortByDate) return tasks;

    return [...tasks].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;

      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);

      // Put overdue tasks first
      const isOverdueA = isPast(dateA) && a.status !== 'done';
      const isOverdueB = isPast(dateB) && b.status !== 'done';

      if (isOverdueA && !isOverdueB) return -1;
      if (!isOverdueA && isOverdueB) return 1;

      return dateA - dateB;
    });
  };

  const filteredProjects = projects.map(project => ({
    ...project,
    tasks: sortTasksByDueDate(
      project.tasks.filter(task => {
        const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesArchive = showArchived ? task.archived : !task.archived;
        return matchesSearch && matchesArchive;
      }).map(task => ({
        ...task,
        isToday: task.dueDate && isToday(new Date(task.dueDate))
      }))
    )
  }));

  const activeTaskCount = projects.reduce((total, project) =>
    total + project.tasks.filter(t => !t.archived && t.status !== 'done').length, 0
  );

  // Calculate analytics
  const getAnalytics = () => {
    const allTasks = projects.flatMap(p => p.tasks);
    const activeTasks = allTasks.filter(t => !t.archived);

    const totalTasks = activeTasks.length;
    const completedTasks = activeTasks.filter(t => t.status === 'done').length;
    const inProgressTasks = activeTasks.filter(t => t.status === 'progress').length;
    const todoTasks = activeTasks.filter(t => t.status === 'todo').length;
    const overdueTasks = activeTasks.filter(t => {
      if (!t.dueDate || t.status === 'done') return false;
      return isPast(new Date(t.dueDate));
    }).length;

    // Tasks completed this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const completedThisWeek = allTasks.filter(t => {
      if (t.status !== 'done' || !t.createdAt) return false;
      const taskDate = new Date(t.createdAt);
      return taskDate >= weekAgo;
    }).length;

    // Project with most tasks
    const projectStats = projects.map(p => ({
      name: p.name,
      taskCount: p.tasks.filter(t => !t.archived).length,
      completionRate: p.tasks.filter(t => !t.archived).length > 0
        ? Math.round((p.tasks.filter(t => !t.archived && t.status === 'done').length / p.tasks.filter(t => !t.archived).length) * 100)
        : 0
    })).sort((a, b) => b.taskCount - a.taskCount);

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      completedThisWeek,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      projectStats
    };
  };

  // Export to markdown
  const exportToMarkdown = () => {
    let markdown = '# TaskFlow Export\n\n';
    markdown += `Generated on: ${new Date().toLocaleDateString()}\n\n`;

    projects.forEach(project => {
      markdown += `## ${project.name}\n\n`;
      const activeTasks = project.tasks.filter(t => !t.archived);

      if (activeTasks.length === 0) {
        markdown += '*No active tasks*\n\n';
      } else {
        activeTasks.forEach(task => {
          const status = task.status === 'done' ? '✅' : task.status === 'progress' ? '🔄' : '⭕';
          const priority = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
          const dueDate = task.dueDate ? ` (Due: ${format(new Date(task.dueDate), 'MMM d')})` : '';
          const recurring = task.recurring ? ` [${task.recurring}]` : '';

          markdown += `- ${status} ${task.text} ${priority}${dueDate}${recurring}\n`;
          if (task.notes) {
            markdown += `  *Note: ${task.notes}*\n`;
          }
        });
        markdown += '\n';
      }
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-export-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear completed tasks
  const clearCompleted = () => {
    setActionHistory(prev => [...prev, projects]);
    setProjects(projects.map(project => ({
      ...project,
      tasks: project.tasks.filter(t => t.status !== 'done' || t.archived)
    })));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Main Content - Full Width */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onAddTask={addTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onDeleteProject={deleteProject}
              onUpdateProject={updateProject}
              quickAdd={quickAddProject === project.id}
              onQuickAddComplete={() => setQuickAddProject(null)}
              allTasks={projects.flatMap(p => p.tasks)}
            />
          ))}

          {/* Add Project Card */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 hover:border-indigo-300 transition-colors">
            {showAddProject ? (
              <div className="p-4">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addProject()}
                  placeholder="Project name..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={addProject}
                    className="flex-1 bg-indigo-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddProject(false);
                      setNewProjectName('');
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddProject(true)}
                className="w-full h-full min-h-[300px] flex flex-col items-center justify-center space-y-3 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <Plus className="w-8 h-8" />
                <span className="text-sm font-medium">Add Project</span>
              </button>
            )}
          </div>
        </div>
      </DndContext>

      {/* Floating Menu Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Menu Dropdown */}
        {showMenu && (
          <div className="absolute bottom-16 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 w-56 overflow-hidden">
            {/* Search */}
            <div className="border-b border-gray-200 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={() => {
                  setAutoSortByDate(!autoSortByDate);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center space-x-3"
              >
                <Calendar className={`w-4 h-4 ${autoSortByDate ? 'text-orange-500' : 'text-gray-600'}`} />
                <span className="flex-1">Sort by Due Date</span>
                {autoSortByDate && <Check className="w-4 h-4 text-orange-500" />}
              </button>

              <button
                onClick={() => {
                  setShowAnalytics(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center space-x-3"
              >
                <BarChart3 className="w-4 h-4 text-gray-600" />
                <span>Analytics</span>
              </button>

              <button
                onClick={() => {
                  setShowArchived(!showArchived);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center space-x-3"
              >
                <Archive className={`w-4 h-4 ${showArchived ? 'text-gray-800' : 'text-gray-600'}`} />
                <span className="flex-1">Archived Tasks</span>
                {showArchived && <Check className="w-4 h-4 text-gray-800" />}
              </button>

              <button
                onClick={() => {
                  exportToMarkdown();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center space-x-3"
              >
                <Download className="w-4 h-4 text-gray-600" />
                <span>Export to Markdown</span>
              </button>

              <button
                onClick={() => {
                  clearCompleted();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center space-x-3"
              >
                <CheckSquare className="w-4 h-4 text-gray-600" />
                <span>Clear Completed</span>
              </button>

              {actionHistory.length > 0 && (
                <button
                  onClick={() => {
                    if (actionHistory.length > 0) {
                      const lastAction = actionHistory[actionHistory.length - 1];
                      setProjects(lastAction);
                      setActionHistory(prev => prev.slice(0, -1));
                    }
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center space-x-3"
                >
                  <Undo className="w-4 h-4 text-gray-600" />
                  <span>Undo</span>
                  <span className="text-xs text-gray-400">⌘Z</span>
                </button>
              )}
            </div>

            {/* Keyboard Shortcuts */}
            <div className="border-t border-gray-200 p-3 bg-gray-50">
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Search</span>
                  <span className="text-gray-400">⌘K</span>
                </div>
                <div className="flex justify-between">
                  <span>New Task</span>
                  <span className="text-gray-400">⌘N</span>
                </div>
                <div className="flex justify-between">
                  <span>Close</span>
                  <span className="text-gray-400">ESC</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Menu Button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`w-14 h-14 rounded-full shadow-lg transition-all ${
            showMenu
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-indigo-600 hover:text-white'
          }`}
          title="Menu"
        >
          <Menu className="w-6 h-6 mx-auto" />
        </button>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-6" onClick={() => setShowAnalytics(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
              <button onClick={() => setShowAnalytics(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            {(() => {
              const analytics = getAnalytics();
              return (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Total Tasks</div>
                      <div className="text-2xl font-bold text-gray-900">{analytics.totalTasks}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-sm text-green-600">Completed</div>
                      <div className="text-2xl font-bold text-green-900">{analytics.completedTasks}</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm text-blue-600">In Progress</div>
                      <div className="text-2xl font-bold text-blue-900">{analytics.inProgressTasks}</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="text-sm text-yellow-600">Todo</div>
                      <div className="text-2xl font-bold text-yellow-900">{analytics.todoTasks}</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="text-sm text-red-600">Overdue</div>
                      <div className="text-2xl font-bold text-red-900">{analytics.overdueTasks}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-sm text-purple-600">Completion Rate</div>
                      <div className="text-2xl font-bold text-purple-900">{analytics.completionRate}%</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Projects Overview</h3>
                    <div className="space-y-2">
                      {analytics.projectStats.map(project => (
                        <div key={project.name} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <span className="font-medium">{project.name}</span>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">{project.taskCount} tasks</span>
                            <div className="flex items-center space-x-1">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${project.completionRate}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600">{project.completionRate}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-500 text-center">
                    Completed {analytics.completedThisWeek} tasks this week
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default App
