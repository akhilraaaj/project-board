import { useMemo, useState } from "react";
import DeleteIcon from "../icons/DeleteIcon";
import { Status, Id, Task } from "../types"
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities"
import AddIcon from "../icons/AddIcon";
import TaskCard from "./TaskCard";

interface Props {
    status: Status;
    createNewStatus: (id: Id) => void;
    deleteStatus: (id: Id) => void;
    updateStatus: (id: Id, title: string) => void; 

    createTask: (statusId: Id) => void;
    updateTask: (id: Id, content: string) => void;
    deleteTask: (id: Id) => void;
    tasks: Task[];
    taskCount: number;
    backgroundColor: string;
}

function StatusContainer(props: Props) {

  const { status, createNewStatus, deleteStatus, updateStatus, createTask, deleteTask, updateTask, tasks, taskCount } =  props;

  const [editMode, setEditMode] = useState(false);

  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);
  
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: status.id, data: {type: "Status", status}, disabled: editMode});
  
  const style = { transition, transform: CSS.Transform.toString(transform)};

  //When Dragging
  if (isDragging) {
    return (
      <div ref={setNodeRef} style={style} className="bg-gray-400 opacity-40 border-2 border-gray-900 w-[350px] h-[400px] max-h-[400px] rounded-md flex flex-col">
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-gray-400 border-black w-[350px] h-[400px] max-h-[400px] rounded-md flex flex-col text-white">
      <div {...attributes} {...listeners} 
        onClick={() => {setEditMode(true);}} 
        className="bg-gray-800 text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-gray-600 border-4 flex items-center justify-between"
      > 
       <div className="flex gap-2">
        <div style={{ backgroundColor: status.backgroundColor }}>
        {!editMode && status.title}
        </div>
        {editMode && (
          <input className="bg-gray-500 focus:border-gray-800 border rounded outline-none px-2"
            value={status.title}
            onChange={(e) => updateStatus(status.id, e.target.value)} 
            autoFocus onBlur={() => {
              setEditMode(false);}} 
              onKeyDown={(e) => {
                if(e.key !== "Enter")
                  return;
                setEditMode(false);
              }} />)}

        <div className="flex justify-center items-center rounded-xl bg-gray-400 px-2 py-1 text-sm">
          {taskCount}
        </div>

       </div>
       <div className="flex">
       <button onClick={() => { createNewStatus(status.id);}} className="stroke-blue-700 hover:stroke-white hover:bg-blue-900 rounded px-1 py-2">
        <AddIcon />
       </button>
       <button onClick={() => { deleteStatus(status.id);}} className="stroke-red-500 hover:stroke-white hover:bg-red-500 rounded px-1 py-2">
        <DeleteIcon />
       </button>
       </div>
      </div>

      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksIds}>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} deleteTask={deleteTask} updateTask={updateTask} />
        ))}
        </SortableContext>
      </div>

      <button className="flex gap-2 items-center bg-gray-500 border-gray-800 border-2 rounded-md p-4 font-bold   border-x-blue-800 hover:bg-gray-400  hover:text-blue-700 active:bg-blue-700" onClick={() => {createTask(status.id);}}>
        <AddIcon /> New
      </button>
    </div>
  );
}

export default StatusContainer
