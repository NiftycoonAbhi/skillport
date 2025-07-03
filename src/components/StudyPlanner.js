import React, { useState, useEffect, Fragment, useRef } from 'react';
import { db, auth } from '../firebase'; // Adjust path if firebase.js is in another folder
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  orderBy,
} from 'firebase/firestore';
import {
  FiCheck, FiTrash2, FiEdit2, FiCalendar, FiClock, FiPlus, FiBell, FiBook,
  FiTarget, FiCheckCircle, FiSearch, FiPlay, FiPause, FiRefreshCw, FiVolume2, FiVolumeX
} from 'react-icons/fi';
import { format, addDays, isBefore, isToday, isTomorrow, isAfter } from 'date-fns';
import { Dialog, Transition } from '@headlessui/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, // CORRECTED IMPORT PATH
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'; // THIS IS THE CRUCIAL CHANGE
import { CSS } from '@dnd-kit/utilities';
import { arrayMoveImmutable } from 'array-move';

// --- Helper Components (Nested for Single File) ---

function Modal({ isOpen, onClose, title, children }) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {title}
                </Dialog.Title>
                <div className="mt-4">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function TaskForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  subjects
}) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [subject, setSubject] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [reminder, setReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('');

  useEffect(() => {
    if (initialData) {
      setNewTaskTitle(initialData.title || '');
      setSubject(initialData.subject || '');
      setDueDate(initialData.dueDate instanceof Date && !isNaN(initialData.dueDate.getTime())
        ? format(initialData.dueDate, 'yyyy-MM-dd')
        : ''
      );
      setPriority(initialData.priority || 'medium');
      setEstimatedTime(initialData.estimatedTime || '');
      const hasValidReminderTime = initialData.reminderTime instanceof Date && !isNaN(initialData.reminderTime.getTime());
      setReminder(hasValidReminderTime);
      setReminderTime(hasValidReminderTime
        ? format(initialData.reminderTime, 'HH:mm')
        : ''
      );
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setNewTaskTitle('');
    setDueDate('');
    setPriority('medium');
    setSubject('');
    setEstimatedTime('');
    setReminder(false);
    setReminderTime('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      alert('Task title cannot be empty!');
      return;
    }

    onSubmit({
      title: newTaskTitle,
      subject,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority,
      estimatedTime,
      reminder,
      reminderTime: reminder && dueDate && reminderTime
        ? new Date(`${dueDate}T${reminderTime}`)
        : null,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Task' : 'Add New Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="taskTitle"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Read chapter 5"
            required
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Mathematics"
            list="subject-suggestions"
          />
          <datalist id="subject-suggestions">
            {subjects.map((sub) => (
              <option key={sub} value={sub} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <div className="relative">
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-blue-500 focus:border-blue-500"
            />
            <FiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Time (e.g., "2h", "30m", "1h 30m")
          </label>
          <div className="relative">
            <input
              type="text"
              id="estimatedTime"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-blue-500 focus:border-blue-500"
              placeholder="2 hours"
            />
            <FiClock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="setReminder"
            checked={reminder}
            onChange={(e) => setReminder(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="setReminder" className="text-sm text-gray-700">Set Reminder</label>
          {reminder && (
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required={reminder && !!dueDate}
            />
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-150 ease-in-out"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition duration-150 ease-in-out"
          >
            <FiPlus className="mr-2" />
            {initialData ? 'Update Task' : 'Add Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function TaskItem({ task, onToggleComplete, onStartEdit, onDelete }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 ring-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 ring-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 ring-green-200';
      default: return 'bg-gray-100 text-gray-800 ring-gray-200';
    }
  };

  const getDueDateLabel = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return 'No due date';
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all duration-200 ease-in-out
                  ${task.completed ? 'opacity-70 border-dashed bg-gray-50' : 'hover:shadow-md'}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <button
            onClick={() => onToggleComplete(task)}
            className={`w-6 h-6 rounded-full border mr-3 mt-1 flex-shrink-0 flex items-center justify-center
                        ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent hover:border-blue-500 hover:text-blue-500'}`}
            title={task.completed ? "Mark as Incomplete" : "Mark as Complete"}
          >
            {task.completed && <FiCheck size={16} />}
          </button>
          <div>
            <h3 className={`font-medium text-lg ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {task.title}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2 text-sm">
              {task.subject && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium ring-1 ring-blue-200">
                  {task.subject}
                </span>
              )}
              {task.priority && (
                <span className={`px-2 py-1 rounded-full font-medium ring-1 ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              )}
              {task.dueDate && (task.dueDate instanceof Date) && !isNaN(task.dueDate.getTime()) && (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full flex items-center ring-1 ring-gray-200">
                  <FiCalendar className="mr-1" size={14} />
                  {getDueDateLabel(task.dueDate)}
                </span>
              )}
              {task.estimatedTime && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full flex items-center ring-1 ring-purple-200">
                  <FiClock className="mr-1" size={14} />
                  {task.estimatedTime}
                </span>
              )}
              {task.reminderTime && (task.reminderTime instanceof Date) && !isNaN(task.reminderTime.getTime()) && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full flex items-center ring-1 ring-yellow-200">
                  <FiBell className="mr-1" size={14} />
                  {format(task.reminderTime, 'h:mm a')}
                </span>
              )}
            </div>
            {task.completed && (task.completedAt instanceof Date) && !isNaN(task.completedAt.getTime()) && (
              <div className="text-xs text-gray-500 mt-2">
                Completed on {format(task.completedAt, 'MMM d, yyyy @ h:mm a')}
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-2 flex-shrink-0">
          {!task.completed && (
            <button
              onClick={() => onStartEdit(task)}
              className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition duration-150 ease-in-out"
              title="Edit Task"
            >
              <FiEdit2 size={18} />
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition duration-150 ease-in-out"
            title="Delete Task"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SortableTaskItem({ task, onToggleComplete, onStartEdit, onDelete }) {
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
    zIndex: isDragging ? 10 : 0,
    boxShadow: isDragging ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : '',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskItem
        task={task}
        onToggleComplete={onToggleComplete}
        onStartEdit={onStartEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

function TaskList({ title, tasks, onToggleComplete, onStartEdit, onDelete, onDragEnd, allowDrag = true }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-800">
        {title} ({tasks.length})
      </h2>
      {tasks.length === 0 ? (
        <p className="text-gray-500 italic">No {title.toLowerCase()} yet.</p>
      ) : (
        allowDrag ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={tasks.map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {tasks.map(task => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onStartEdit={onStartEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onStartEdit={onStartEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}

function DashboardStats({ tasks }) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;

  const parseTime = (timeString) => {
    let totalMinutes = 0;
    if (!timeString) return 0;
    const hoursMatch = timeString.match(/(\d+)\s*h/);
    const minutesMatch = timeString.match(/(\d+)\s*m/);

    if (hoursMatch) {
      totalMinutes += parseInt(hoursMatch[1]) * 60;
    }
    if (minutesMatch) {
      totalMinutes += parseInt(minutesMatch[1]);
    }
    return totalMinutes;
  };

  const totalEstimatedMinutesPending = tasks
    .filter(task => !task.completed && task.estimatedTime)
    .reduce((sum, task) => sum + parseTime(task.estimatedTime), 0);

  const formatMinutesToHoursMinutes = (minutes) => {
    if (minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${remainingMinutes > 0 ? `${remainingMinutes}m` : ''}`.trim();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-3">
        <FiTarget className="text-blue-500 text-3xl" />
        <div>
          <p className="text-gray-500 text-sm">Total Tasks</p>
          <p className="text-2xl font-bold text-gray-800">{totalTasks}</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-3">
        <FiCheckCircle className="text-green-500 text-3xl" />
        <div>
          <p className="text-gray-500 text-sm">Tasks Completed</p>
          <p className="text-2xl font-bold text-gray-800">{completedTasks}</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-3">
        <FiClock className="text-purple-500 text-3xl" />
        <div>
          <p className="text-gray-500 text-sm">Est. Time Remaining</p>
          <p className="text-2xl font-bold text-gray-800">{formatMinutesToHoursMinutes(totalEstimatedMinutesPending)}</p>
        </div>
      </div>
    </div>
  );
}

function PomodoroTimer() {
  const [minutes, setMinutes] = useState(40);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('pomodoro');
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const intervalRef = useRef(null);
  const audioRef = useRef(new Audio('/alarm.mp3'));

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(intervalRef.current);
            setIsActive(false);
            playAlarm();
            handleModeChange();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, minutes, seconds]);

  useEffect(() => {
    if (mode === 'pomodoro') {
      setMinutes(40);
    } else if (mode === 'shortBreak') {
      setMinutes(5);
    } else if (mode === 'longBreak') {
      setMinutes(15);
    }
    setSeconds(0);
    setIsActive(false);
  }, [mode]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'pomodoro') {
      setMinutes(40);
    } else if (mode === 'shortBreak') {
      setMinutes(5);
    } else if (mode === 'longBreak') {
      setMinutes(15);
    }
    setSeconds(0);
    clearInterval(intervalRef.current);
  };

  const handleModeChange = () => {
    if (mode === 'pomodoro') {
      setPomodorosCompleted(prev => prev + 1);
      if ((pomodorosCompleted + 1) % 4 === 0) {
        setMode('longBreak');
      } else {
        setMode('shortBreak');
      }
    } else {
      setMode('pomodoro');
    }
  };

  const playAlarm = () => {
    if (!isMuted) {
      audioRef.current.play();
    }
  };

  const formatTime = (time) => {
    return time < 10 ? `0${time}` : time;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Pomodoro Timer</h2>

      <div className="flex justify-center mb-4 space-x-2 flex-wrap">
        <button
          onClick={() => setMode('pomodoro')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 mt-2
            ${mode === 'pomodoro' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Pomodoro (40m)
        </button>
        <button
          onClick={() => setMode('shortBreak')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 mt-2
            ${mode === 'shortBreak' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Short Break (5m)
        </button>
        <button
          onClick={() => setMode('longBreak')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 mt-2
            ${mode === 'longBreak' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Long Break (15m)
        </button>
      </div>

      <div className="text-6xl font-extrabold text-gray-900 mb-6 flex justify-center items-center">
        <span className="w-24 text-right">{formatTime(minutes)}</span>
        <span className="mx-2">:</span>
        <span className="w-24 text-left">{formatTime(seconds)}</span>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={toggleTimer}
          className={`p-3 rounded-full text-white transition-all duration-200 ease-in-out
            ${isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}`}
          title={isActive ? "Pause Timer" : "Start Timer"}
        >
          {isActive ? <FiPause size={24} /> : <FiPlay size={24} />}
        </button>
        <button
          onClick={resetTimer}
          className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
          title="Reset Timer"
        >
          <FiRefreshCw size={24} />
        </button>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 rounded-full bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors duration-200"
          title={isMuted ? "Unmute Alarm" : "Mute Alarm"}
        >
          {isMuted ? <FiVolumeX size={24} /> : <FiVolume2 size={24} />}
        </button>
      </div>

      <p className="mt-4 text-sm text-gray-600">Pomodoros Completed: {pomodorosCompleted}</p>
      {/* <p className="text-xs text-gray-500 mt-2">
        <a href="https://en.wikipedia.org/wiki/Pomodoro_Technique" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">
          Learn about Pomodoro Technique
        </a>
      </p> */}
    </div>
  );
}

// --- Main StudyPlanner Component ---

function StudyPlanner() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('all');
  const [filterSubject, setFilterSubject] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskData, setEditingTaskData] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      setTasks([]);
      return;
    }

    const tasksCollectionRef = collection(db, 'studyTasks');
    const q = query(
      tasksCollectionRef,
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate() || null,
        createdAt: doc.data().createdAt?.toDate() || null,
        completedAt: doc.data().completedAt?.toDate() || null,
        reminderTime: doc.data().reminderTime?.toDate() || null
      }));
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const applyFiltersAndSort = (tasksToFilter) => {
    let filtered = tasksToFilter.filter(task => {
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (!task.subject || !task.subject.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }

      if (viewMode === 'today') {
        return task.dueDate && isToday(task.dueDate) && !task.completed;
      } else if (viewMode === 'week') {
        const today = new Date();
        const oneWeekFromToday = addDays(today, 7);
        return (
          task.dueDate &&
          task.dueDate instanceof Date &&
          !isNaN(task.dueDate.getTime()) &&
          isAfter(task.dueDate, today) &&
          isBefore(task.dueDate, oneWeekFromToday) &&
          !task.completed
        );
      } else if (viewMode === 'subject' && filterSubject) {
        return task.subject === filterSubject && !task.completed;
      } else if (viewMode === 'completed') {
        return task.completed;
      }
      return !task.completed;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'dueDate') {
        const dateA = (a.dueDate instanceof Date && !isNaN(a.dueDate.getTime())) ? a.dueDate.getTime() : Infinity;
        const dateB = (b.dueDate instanceof Date && !isNaN(b.dueDate.getTime())) ? b.dueDate.getTime() : Infinity;
        comparison = dateA - dateB;
      } else if (sortBy === 'createdAt') {
        const dateA = (a.createdAt instanceof Date && !isNaN(a.createdAt.getTime())) ? a.createdAt.getTime() : Infinity;
        const dateB = (b.createdAt instanceof Date && !isNaN(b.createdAt.getTime())) ? b.createdAt.getTime() : Infinity;
        comparison = dateA - dateB;
      } else if (sortBy === 'priority') {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  // These derivations must happen *after* tasks state is set and before rendering
  const filteredAndSortedTasks = applyFiltersAndSort(tasks);
  const pendingTasks = filteredAndSortedTasks.filter(task => !task.completed);
  const completedTasks = filteredAndSortedTasks.filter(task => task.completed);


  const subjects = [...new Set(tasks.map(task => task.subject).filter(Boolean))];

  const handleAddTask = async (taskData) => {
    try {
      await addDoc(collection(db, 'studyTasks'), {
        ...taskData,
        uid: auth.currentUser.uid,
        completed: false,
        createdAt: new Date(),
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task. Please try again.');
    }
  };

  const handleUpdateTask = async (taskData) => {
    if (!editingTaskData?.id) return;
    try {
      await updateDoc(doc(db, 'studyTasks', editingTaskData.id), taskData);
      setEditingTaskData(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const toggleComplete = async (task) => {
    try {
      await updateDoc(doc(db, 'studyTasks', task.id), {
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : null
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status. Please try again.');
    }
  };

  const deleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'studyTasks', id));
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  const startEdit = (task) => {
    setEditingTaskData(task);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTaskData(null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeTask = tasks.find(t => t.id === active.id);
    const overTask = tasks.find(t => t.id === over.id);

    if (activeTask && overTask && !activeTask.completed && !overTask.completed) {
      // Create a temporary array of *only the pending tasks* for accurate indexing
      const reorderablePendingTasks = tasks.filter(t => !t.completed);

      const oldIndexInPending = reorderablePendingTasks.findIndex(t => t.id === active.id);
      const newIndexInPending = reorderablePendingTasks.findIndex(t => t.id === over.id);

      if (oldIndexInPending !== -1 && newIndexInPending !== -1) {
        const reorderedSegment = arrayMoveImmutable(reorderablePendingTasks, oldIndexInPending, newIndexInPending);

        // Reconstruct the full tasks array by combining reordered pending with original completed
        // This assumes completed tasks always stay at the bottom.
        const updatedTasks = [
          ...reorderedSegment,
          ...tasks.filter(t => t.completed)
        ];
        setTasks(updatedTasks);
        // IMPORTANT: For persistent reordering, you would need to update an 'order'
        // field in Firestore for the affected tasks here.
        // E.g., You'd iterate `reorderedSegment` and update the 'order' field for each task in Firestore.
      }
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-700">Loading your study tasks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-8 justify-between">
          <div className="flex items-center">
            <FiBook className="text-3xl text-blue-600 mr-3" />
            <h1 className="text-3xl font-extrabold text-gray-800">Study Planner</h1>
          </div>
          <button
            onClick={() => {
              setEditingTaskData(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-150 ease-in-out flex items-center"
          >
            <FiPlus className="mr-2" size={20} />
            Add New Task
          </button>
        </div>

        <DashboardStats tasks={tasks} />
        <PomodoroTimer />

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { setViewMode('all'); setFilterSubject(''); setSearchTerm(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${viewMode === 'all' && !filterSubject && !searchTerm ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              All Tasks
            </button>
            <button
              onClick={() => { setViewMode('today'); setFilterSubject(''); setSearchTerm(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${viewMode === 'today' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Today
            </button>
            <button
              onClick={() => { setViewMode('week'); setFilterSubject(''); setSearchTerm(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${viewMode === 'week' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              This Week
            </button>
            <button
              onClick={() => { setViewMode('completed'); setFilterSubject(''); setSearchTerm(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${viewMode === 'completed' ? 'bg-green-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Completed
            </button>

            {subjects.length > 0 && (
              <select
                value={filterSubject}
                onChange={(e) => {
                  setFilterSubject(e.target.value);
                  setViewMode(e.target.value ? 'subject' : 'all');
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            )}
          </div>

          <div className="relative w-full sm:w-auto min-w-[200px]">
            <input
              type="text"
              placeholder="Search tasks or subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="flex gap-2 items-center sm:ml-auto w-full sm:w-auto justify-end">
            <label htmlFor="sort-by" className="text-sm text-gray-700">Sort By:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="createdAt">Created Date</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? (
                <svg className="w-5 h-5 transform rotate-180" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Task Lists */}
        <div className="space-y-6">
          <TaskList
            title="Pending Tasks"
            tasks={pendingTasks}
            onToggleComplete={toggleComplete}
            onStartEdit={startEdit}
            onDelete={deleteTask}
            onDragEnd={handleDragEnd}
            allowDrag={false}
          />

          <TaskList
            title="Completed Tasks"
            tasks={completedTasks}
            onToggleComplete={toggleComplete}
            onStartEdit={startEdit}
            onDelete={deleteTask}
            onDragEnd={() => {}}
            allowDrag={false}
          />

          {tasks.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
              <p className="text-gray-600 text-lg">No tasks found. Click "Add New Task" to get started!</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-150 ease-in-out text-base font-medium"
              >
                Add Your First Task
              </button>
            </div>
          )}
        </div>

        <TaskForm
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={editingTaskData ? handleUpdateTask : handleAddTask}
          initialData={editingTaskData}
          subjects={subjects}
        />
      </div>
    </div>
  );
}

export default StudyPlanner;