'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Clock, List, Plus, X, CircleDot, Bell } from 'lucide-react'
import { format, parse, isValid } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

type TaskType = 'routine' | 'important' | 'basic'

type Task = {
  id: number
  text: string
  completed: boolean
  type: TaskType
  dueTime?: Date
}

type TaskListProps = {
  tasks: Task[]
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

const TaskItem = ({ task, onToggle, onDelete }: { task: Task, onToggle: () => void, onDelete: () => void }) => (
  <div className="flex items-center space-x-2 p-2 border-b">
    <Checkbox checked={task.completed} onCheckedChange={onToggle} />
    <span className={`flex-grow ${task.completed ? 'line-through text-gray-500' : ''}`}>
      {task.text}
      {task.dueTime && (
        <span className="ml-2 text-sm text-gray-500">
          Due: {format(task.dueTime, 'h:mm a')}
        </span>
      )}
    </span>
    {task.type === 'important' && <Star className="text-yellow-500" />}
    {task.type === 'routine' && <Clock className="text-blue-500" />}
    {task.type === 'basic' && <CircleDot className="text-gray-500" />}
    <Button variant="ghost" size="sm" onClick={onDelete}><X className="h-4 w-4" /></Button>
  </div>
)

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggle, onDelete }) => (
  <div className="space-y-2">
    {tasks.map(task => (
      <TaskItem 
        key={task.id} 
        task={task} 
        onToggle={() => onToggle(task.id)} 
        onDelete={() => onDelete(task.id)} 
      />
    ))}
  </div>
)

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [taskType, setTaskType] = useState<TaskType>('basic')
  const [activeList, setActiveList] = useState<'all' | 'important' | 'routine' | 'basic'>('all')
  const [dueTime, setDueTime] = useState<string>('')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [currentDueTask, setCurrentDueTask] = useState<Task | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      tasks.forEach(task => {
        if (task.dueTime && !task.completed && task.dueTime <= now) {
          playAlarm(task)
          setCurrentDueTask(task)
          setIsPopupOpen(true)
        }
      })
    }, 1000) // Check every second

    return () => clearInterval(timer)
  }, [tasks])

  useEffect(() => {
    audioRef.current = new Audio('/alarm-sound.mp3') // Replace with your actual alarm sound file
  }, [])

  const addTask = () => {
    if (newTask.trim()) {
      const newTaskType = activeList === 'all' ? taskType : activeList as TaskType
      const newTaskObj: Task = { 
        id: Date.now(), 
        text: newTask, 
        completed: false, 
        type: newTaskType
      }
      if (dueTime) {
        const parsedTime = parse(dueTime, 'HH:mm', new Date())
        if (isValid(parsedTime)) {
          const dueDate = new Date()
          dueDate.setHours(parsedTime.getHours(), parsedTime.getMinutes(), 0, 0)
          newTaskObj.dueTime = dueDate
        }
      }
      setTasks([...tasks, newTaskObj])
      setNewTask('')
      setDueTime('')
      playRingtone()
    }
  }

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
    playRingtone()
  }

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id))
    playRingtone()
  }

  const playRingtone = () => {
    console.log('Playing ringtone') // Simulating ringtone
  }

  const playAlarm = (task: Task) => {
    console.log(`ALARM: Task "${task.text}" is due!`)
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error('Error playing alarm:', e))
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (activeList === 'all') return true
    return task.type === activeList
  })

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">To-Do App</h1>
          <nav>
            <Button 
              variant={activeList === 'all' ? 'default' : 'ghost'} 
              className="w-full justify-start mb-2"
              onClick={() => setActiveList('all')}
            >
              <List className="mr-2 h-4 w-4" /> All Tasks
            </Button>
            <Button 
              variant={activeList === 'important' ? 'default' : 'ghost'} 
              className="w-full justify-start mb-2"
              onClick={() => setActiveList('important')}
            >
              <Star className="mr-2 h-4 w-4" /> Important
            </Button>
            <Button 
              variant={activeList === 'routine' ? 'default' : 'ghost'} 
              className="w-full justify-start mb-2"
              onClick={() => setActiveList('routine')}
            >
              <Clock className="mr-2 h-4 w-4" /> Routine
            </Button>
            <Button 
              variant={activeList === 'basic' ? 'default' : 'ghost'} 
              className="w-full justify-start mb-2"
              onClick={() => setActiveList('basic')}
            >
              <CircleDot className="mr-2 h-4 w-4" /> Basic
            </Button>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-auto">
        <h2 className="text-2xl font-semibold mb-4">
          {activeList === 'all' ? 'All Tasks' : 
           activeList === 'important' ? 'Important Tasks' : 
           activeList === 'routine' ? 'Routine Tasks' : 'Basic Tasks'}
        </h2>

        {/* Add task form */}
        <div className="mb-6 space-y-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task"
              className="flex-grow"
            />
            {activeList === 'all' && (
              <Select value={taskType} onValueChange={(value: TaskType) => setTaskType(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-[120px]"
            />
            <Button onClick={addTask}><Plus className="mr-2 h-4 w-4" /> Add Task</Button>
          </div>
          {newTask && (
            <div className="text-sm text-gray-600">
              Preview: {newTask}
            </div>
          )}
        </div>

        {/* Task list */}
        <TaskList tasks={filteredTasks} onToggle={toggleTask} onDelete={deleteTask} />

        {/* Popup for due tasks */}
        <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Task Due!</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              {currentDueTask && (
                <div>
                  <p>The following task is now due:</p>
                  <p className="font-bold">{currentDueTask.text}</p>
                  <p>Due time: {currentDueTask.dueTime && format(currentDueTask.dueTime, 'h:mm a')}</p>
                </div>
              )}
            </DialogDescription>
            <Button onClick={() => setIsPopupOpen(false)}>Close</Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}