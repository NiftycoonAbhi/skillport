import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { FiCheck, FiTrash2, FiEdit2, FiCalendar, FiClock, FiPlus, FiBell, FiBook } from 'react-icons/fi';
import { format, addDays, isBefore, isToday, isTomorrow } from 'date-fns';

function StudyPlanner() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [subject, setSubject] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [reminder, setReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'today', 'week', 'subject'
  const [filterSubject, setFilterSubject] = useState('');

  // Fetch tasks from Firestore
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'studyTasks'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate() || null,
        createdAt: doc.data().createdAt?.toDate() || null,
        completedAt: doc.data().completedAt?.toDate() || null
      }));
      setTasks(tasksData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter tasks based on view mode
  const filteredTasks = tasks.filter(task => {
    if (viewMode === 'today') {
      return isToday(task.dueDate);
    } else if (viewMode === 'week') {
      return isBefore(task.dueDate, addDays(new Date(), 7)) && !task.completed;
    } else if (viewMode === 'subject' && filterSubject) {
      return task.subject === filterSubject;
    }
    return true;
  });

  // Group tasks by status and date
  const pendingTasks = filteredTasks.filter(task => !task.completed);
  const completedTasks = filteredTasks.filter(task => task.completed);

  // Get unique subjects for filtering
  const subjects = [...new Set(tasks.map(task => task.subject).filter(Boolean))];

  const addTask = async () => {
    if (!newTask.trim()) return;

    try {
      const taskData = {
        uid: auth.currentUser.uid,
        title: newTask,
        subject,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        estimatedTime,
        reminder,
        reminderTime: reminder ? new Date(`${dueDate}T${reminderTime}`) : null,
        completed: false,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'studyTasks'), taskData);
      resetForm();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleComplete = async (task) => {
    try {
      await updateDoc(doc(db, 'studyTasks', task.id), {
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : null
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteDoc(doc(db, 'studyTasks', id));
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setNewTask(task.title);
    setSubject(task.subject);
    setDueDate(task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : '');
    setPriority(task.priority || 'medium');
    setEstimatedTime(task.estimatedTime || '');
    setReminder(!!task.reminderTime);
    setReminderTime(task.reminderTime ? format(task.reminderTime, 'HH:mm') : '');
  };

  const saveEdit = async () => {
    try {
      await updateDoc(doc(db, 'studyTasks', editingTaskId), {
        title: newTask,
        subject,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        estimatedTime,
        reminderTime: reminder ? new Date(`${dueDate}T${reminderTime}`) : null
      });
      resetForm();
      setEditingTaskId(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const resetForm = () => {
    setNewTask('');
    setDueDate('');
    setPriority('medium');
    setSubject('');
    setEstimatedTime('');
    setReminder(false);
    setReminderTime('');
  };

  const cancelEdit = () => {
    resetForm();
    setEditingTaskId(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDueDateLabel = (date) => {
    if (!date) return 'No due date';
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <FiBook className="text-2xl text-blue-600 mr-2" />
        <h1 className="text-2xl font-bold text-gray-800">Study Planner</h1>
      </div>

      {/* View Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setViewMode('all')}
          className={`px-4 py-2 rounded-lg ${viewMode === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          All Tasks
        </button>
        <button
          onClick={() => setViewMode('today')}
          className={`px-4 py-2 rounded-lg ${viewMode === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          Today
        </button>
        <button
          onClick={() => setViewMode('week')}
          className={`px-4 py-2 rounded-lg ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          This Week
        </button>
        {subjects.length > 0 && (
          <select
            value={filterSubject}
            onChange={(e) => {
              setFilterSubject(e.target.value);
              setViewMode(e.target.value ? 'subject' : 'all');
            }}
            className="px-4 py-2 rounded-lg border border-gray-300"
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        )}
      </div>

      {/* Add/Edit Task Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {editingTaskId ? 'Edit Task' : 'Add New Task'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Read chapter 5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Mathematics"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <div className="relative">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <FiCalendar className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time</label>
            <div className="relative">
              <input
                type="text"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="2 hours"
              />
              <FiClock className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={reminder}
                onChange={(e) => setReminder(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Set Reminder</span>
            </label>
            {reminder && (
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="ml-2 px-2 py-1 border border-gray-300 rounded"
              />
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-3">
          {editingTaskId && (
            <button
              onClick={cancelEdit}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            onClick={editingTaskId ? saveEdit : addTask}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <FiPlus className="mr-2" />
            {editingTaskId ? 'Update Task' : 'Add Task'}
          </button>
        </div>
      </div>

      {/* Task Lists */}
      <div className="space-y-6">
        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Pending Tasks ({pendingTasks.length})</h2>
            <div className="space-y-3">
              {pendingTasks.map(task => (
                <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <button
                        onClick={() => toggleComplete(task)}
                        className={`w-6 h-6 rounded-full border mr-3 mt-1 flex-shrink-0 ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
                      >
                        {task.completed && <FiCheck className="text-white m-auto" />}
                      </button>
                      <div>
                        <h3 className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {task.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {task.subject && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              {task.subject}
                            </span>
                          )}
                          {task.priority && (
                            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full flex items-center">
                              <FiCalendar className="mr-1" size={12} />
                              {getDueDateLabel(task.dueDate)}
                            </span>
                          )}
                          {task.estimatedTime && (
                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full flex items-center">
                              <FiClock className="mr-1" size={12} />
                              {task.estimatedTime}
                            </span>
                          )}
                          {task.reminderTime && (
                            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full flex items-center">
                              <FiBell className="mr-1" size={12} />
                              {format(task.reminderTime, 'h:mm a')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(task)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                        title="Edit"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                        title="Delete"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Completed Tasks ({completedTasks.length})</h2>
            <div className="space-y-3">
              {completedTasks.map(task => (
                <div key={task.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <button
                        onClick={() => toggleComplete(task)}
                        className={`w-6 h-6 rounded-full border mr-3 mt-1 flex-shrink-0 ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
                      >
                        {task.completed && <FiCheck className="text-white m-auto" />}
                      </button>
                      <div>
                        <h3 className="font-medium line-through text-gray-400">
                          {task.title}
                        </h3>
                        <div className="text-xs text-gray-500 mt-1">
                          Completed on {task.completedAt ? format(task.completedAt, 'MMM d, yyyy') : 'Unknown date'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                      title="Delete"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">You don't have any tasks yet. Add your first task above!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudyPlanner;