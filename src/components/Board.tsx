/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo, useEffect } from "react";
import AddIcon from "../icons/AddIcon"
import { Status, Id, Task } from "../types";
import StatusContainer from "./StatusContainer";
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

const defaultStatus: Status[] = [
  {
    id: "todo",
    title: "Not Started",
    backgroundColor: "coral",
  },
  {
    id: "doing",
    title: "In Progress",
    backgroundColor: "darkgoldenrod",
  },
  {
    id: "completed",
    title: "Completed",
    backgroundColor: "green",
  },
];

const defaultTasks: Task[] = [
  {
    id: "1",
    statusId: "todo",
    content: "Card 4",
  },
  {
    id: "2",
    statusId: "todo",
    content: "Card 1",
  },
  {
    id: "3",
    statusId: "todo",
    content: "Card 5",
  },
  {
    id: "4",
    statusId: "doing",
    content: "Card 2",
  },
  {
    id: "5",
    statusId: "completed",
    content: "Card 3",
  },
];

function Board() { 
  
  const [status, setStatus] = useState<Status[]>(defaultStatus);
  const statusId = useMemo(() => status.map((stat) => stat.id), [status]);

  const [tasks, setTasks] = useState<Task[]>(defaultTasks);

  const [activeStatus, setActiveStatus] = useState<Status | null>(null);
  
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const localStatus = localStorage.getItem('status');
  
  const localTasks = localStorage.getItem('tasks'); // Load tasks from local storage

  useEffect(() => {
    // Check if `status` is already in local storage
    if (localStatus) {
      setStatus(JSON.parse(localStatus));
    } 
    else {
      setStatus(defaultStatus);
    }

    // Check if `tasks` is already in local storage
    if (localTasks) {
      setTasks(JSON.parse(localTasks));
    }
    else {
      setTasks(defaultTasks);
    }
  }, []);

  // Whenever `status` changes, store it in local storage
  useEffect(() => {
    localStorage.setItem('status', JSON.stringify(status));
  }, [status]);

  // Whenever `tasks` changes, store it in local storage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  //To get Count of Tasks in a Status
  const getStatusTaskCounts = () => {
    const statusTaskCounts: { [key: string]: number } = {};
    for (const stat of status) {
      const count = tasks.filter((task) => task.statusId === stat.id).length;
      statusTaskCounts[stat.id] = count;
    }
    return statusTaskCounts;
  };
  

  const statusTaskCounts = getStatusTaskCounts();

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 10,
        },
    })
  );

  return (
    <>
    <h1 className="text-4xl font-extrabold leading-none tracking-tight text-center mt-4 text-gray-900 md:text-5xl lg:text-6xl dark:text-gray-800">Project Board</h1>
    <div className="flex justify-center">
  <hr className="mt-4 w-80  " />
</div>
    <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px]">
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
      <div className="m-auto flex gap-4">
        <div className="flex gap-4">
            <SortableContext items={statusId}>
              {status.map((stat) => (
                <StatusContainer key={stat.id} status={stat} createNewStatus={createNewStatus} deleteStatus={deleteStatus} updateStatus={updateStatus} createTask={createTask}      
                 deleteTask={deleteTask} updateTask={updateTask} 
                  tasks={tasks.filter((task) => task.statusId === stat.id)} 
                  taskCount={statusTaskCounts[stat.id]}
                  backgroundColor={stat.backgroundColor}
                 />
              ))}
            </SortableContext>
        </div>
        <button  onClick={() => {createNewStatus();}} className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg font-bold border-2 border-black p-4 ring-gray-500 hover:text-blue-700 hover:ring-2 flex gap-2">
            <AddIcon /> Add Status
        </button>
      </div>

      {createPortal(
        <DragOverlay> 
          {activeStatus && (<StatusContainer status={activeStatus} createNewStatus={createNewStatus} deleteStatus={deleteStatus} updateStatus={updateStatus} createTask={createTask}  
           deleteTask={deleteTask} updateTask={updateTask} 
          tasks={tasks.filter(
             (task) => task.statusId === activeStatus.id 
          )} 
          taskCount={statusTaskCounts[activeStatus.id]}
          backgroundColor={activeStatus.backgroundColor}
          />)}
          {activeTask && (<TaskCard task={activeTask} deleteTask={deleteTask} updateTask={updateTask} />)}
        </DragOverlay>, document.body
      )}
      </DndContext>
    </div>
    </>
  )
      
  //To Create Task
  function createTask(statusId: Id) {
    const newTask: Task = {
      id: Math.floor(Math.random()*10001),
      statusId,
      content: `Card ${tasks.length+1}`,
    };

    setTasks([...tasks, newTask]);
  }

  //To Delete Task
  function deleteTask(id: Id) {
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks); 
  }

  //To Update Task
  function updateTask(id: Id, content: string) {
    const newTasks = tasks.map((task) => {
      if(task.id !== id)
        return task;
      return {...task, content};
    });

    setTasks(newTasks);
  }

  //To Create New Status
  function createNewStatus() {
    const statusToAdd: Status = {
        id: Math.floor(Math.random()*10001),
        title: `Status ${status.length+1}`,
        backgroundColor: "",
    };

    setStatus([...status, statusToAdd]);
  }

  //To Delete Status
  function deleteStatus(id: Id) {
    const filteredStatus = status.filter((stat) => stat.id !== id);
    setStatus(filteredStatus);

    const newTasks = tasks.filter((t) => t.statusId !== id);
    setTasks(newTasks);
  }

  //To Update Status
  function updateStatus(id: Id, title: string) {
    const newStatus = status.map((stat) => {
      if(stat.id !== id)
        return stat;
      return {...stat, title};
    });

    setStatus(newStatus);
  }

  //Drag at Start
  function onDragStart(event: DragStartEvent) {
    if(event.active.data.current?.type === "Status") {
        setActiveStatus(event.active.data.current.status);
        return;
    }
    if(event.active.data.current?.type === "Task") {
        setActiveTask(event.active.data.current.task);
        return;
    }
  }

  //Drag at End
  function onDragEnd(event: DragEndEvent) {

    setActiveStatus(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) 
      return;

    setStatus((status) => {
      const activeStatusIndex = status.findIndex((stat) => stat.id === activeId);

      const overStatusIndex = status.findIndex((stat) => stat.id === overId);

      return arrayMove(status, activeStatusIndex, overStatusIndex);
    });
  }

  //Drag Over
  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) 
      return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if(!isActiveTask)
      return;

    if(isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        tasks[activeIndex].statusId = tasks[overIndex].statusId;

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverStatus = over.data.current?.type === "Status";

    if(isActiveTask && isOverStatus) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].statusId = overId;

        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }
}

export default Board
