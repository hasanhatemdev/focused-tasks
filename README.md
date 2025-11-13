# TaskFlow - A Focused Task Manager

> Built out of frustration with cluttered task management tools that have so many features you lose focus on what matters: getting things done.

## About the Creator

**Hasan Hatem** - Computer Engineer & Software Developer

I build tools that solve real problems without the bloat. Check out my other projects:

- [**GetNextKit**](https://getnextkit.com) - The most complete production-ready Next.js starter kit. Stop wasting time on boilerplate.
- [**SaaSGrowth**](https://saasgrowth.net) - Get 4,000+ Backlinks From 100+ Directories in Just 10 Days
- [**hasanhatem.com**](https://hasanhatem.com) - My personal website

---

## Why TaskFlow?

Most task management apps today are overwhelming. They promise to do everything, but end up doing nothing well. TaskFlow is different - it's a lightweight, distraction-free task manager that gives you exactly what you need:

✅ **Clean, minimal interface** - No clutter, just your tasks
✅ **Multiple projects** - Organize work without complexity
✅ **Smart recurring tasks** - Set tasks for specific days (every Friday, etc.)
✅ **Drag & drop** - Intuitive task reordering
✅ **Quick actions** - Keyboard shortcuts for speed
✅ **Offline-first** - Works entirely in your browser, no account needed

## Features

### Core Functionality
- **Projects**: Create unlimited projects with color-coded headers
- **Tasks**: Add, edit, archive, and delete tasks with ease
- **Task Status**: Todo → In Progress → Done workflow
- **Priority Levels**: High, Medium, Low priority flags
- **Due Dates**: Set deadlines with smart date picker (Today, Tomorrow, Custom)
- **Recurring Tasks**: Daily, Weekly, Monthly - or specific days of the week
- **Drag & Drop**: Reorder tasks within projects
- **Search**: Quick search across all tasks (⌘K)

### Smart Features
- **Analytics Dashboard**: Track completion rates and project stats
- **Auto-sort by Date**: Automatically organize tasks by due date
- **Archive System**: Keep completed tasks out of sight
- **Task Notes**: Add detailed notes to any task
- **Markdown Export**: Export all your tasks to markdown
- **Undo**: Accidentally cleared tasks? Undo it (⌘Z)
- **Keyboard Shortcuts**: Speed up your workflow

### Design Philosophy
- **Light Blue Headers**: All projects use a consistent, calming light blue theme
- **Clean Workspace**: All actions consolidated into a single menu button
- **No Distractions**: Just you and your tasks

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **dnd-kit** - Drag and drop functionality
- **date-fns** - Date manipulation
- **Lucide React** - Beautiful icons
- **LocalStorage** - Data persistence (no backend needed)

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/taskflow.git

# Navigate to the project
cd taskflow

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist` folder.

## Usage

### Creating Projects
Click the "Add Project" card to create a new project. Each project can hold unlimited tasks.

### Adding Tasks
Click "Add task" at the bottom of any project card, or use **⌘N** to quick-add to the first project.

### Setting Due Dates
Click the calendar icon on any task to:
- Choose quick options (Today, Tomorrow, Next Week)
- Select a specific day of the week for recurring tasks (e.g., every Friday)
- Pick a custom date
- Remove the due date

### Keyboard Shortcuts
- **⌘K** - Search tasks
- **⌘N** - Add new task to first project
- **⌘Z** - Undo last action
- **ESC** - Close menus/modals

### Menu Options
Click the menu button (bottom-right) to access:
- Search
- Sort by due date
- Analytics dashboard
- Archived tasks
- Export to Markdown
- Clear completed tasks
- Undo

## Contributing

This is a free, open-source project. Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project however you want!

## Support

If you find this useful, consider:
- ⭐ Starring this repository
- 🐛 Reporting bugs via issues
- 💡 Suggesting new features
- 📢 Sharing with others who value focused productivity

---

**Built with focus, for focus.** 🎯
