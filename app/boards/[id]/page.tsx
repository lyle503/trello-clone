"use client";

import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBoard } from "@/lib/hooks/useBoards";
import { BoardColumnWithTasks, Task } from "@/lib/supabase/models";
import { SelectIcon } from "@radix-ui/react-select";
import {
  Calendar,
  ClipboardList,
  Columns,
  Edit,
  MoreHorizontal,
  Plus,
  Trash,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useState } from "react";

type ColumnWrapper = {
  column: BoardColumnWithTasks;
  children: ReactNode;
  onCreateTask: (e: any, sortOrder?: number) => Promise<void>; // Promise because it edits DB, any because it can be createTask or handleCreateTask
  onEditColumn: (e: any, column: BoardColumnWithTasks) => void;
  onDeleteColumn: (column: BoardColumnWithTasks) => Promise<void>;
};

// extra component to make drag and drop logic easy (update: probably removing)
function Column({
  column,
  children,
  onCreateTask,
  onEditColumn,
  onDeleteColumn,
}: ColumnWrapper) {
  const [newTitle, setNewTitle] = useState(column.title);

  function resetEditColumnDialog() {
    setNewTitle(column.title);
  }

  return (
    <div className="w-full lg:shrink-0 lg:w-80">
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Column Header */}
        <div className="p-3 sm:p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                {column.title}
              </h3>
              <Badge variant="secondary" className="text-xs shrink-0">
                {column.tasks.length}
              </Badge>
            </div>
            <div className="flex">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 cursor-pointer"
                    onClick={resetEditColumnDialog}
                  >
                    <Edit />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
                  <DialogHeader>
                    <DialogTitle>Update Column</DialogTitle>
                  </DialogHeader>
                  <form
                    className="space-y-4"
                    onSubmit={(e) => onEditColumn(e, column)}
                  >
                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Enter column title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="submit" className="cursor-pointer">
                        Update Column
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 cursor-pointer"
                  >
                    <Trash />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-center">
                      Are you sure you want to delete this column?
                    </DialogTitle>
                    <p className="flex justify-center gap-4 my-5 bg-gray-50 rounded-sm py-2">
                      <Columns />
                      <span className="font-bold">{column.title}</span>
                    </p>
                    <p className="text-center">
                      This will delete ALL tasks currently in the column
                    </p>
                  </DialogHeader>
                  <div className="flex justify-center space-x-2 pt-4">
                    <Button
                      type="submit"
                      variant="secondary"
                      className="cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => onDeleteColumn(column)}
                    >
                      Delete Column
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* COLUMN CONTENT */}
        <div className="p-2">
          {children}
          {/* the following section is the same as the ADD TASK section */}
          {/* please refactor to turn it into a reusable component */}
          {/* i've labelled where things are different */}
          <Dialog>
            <DialogTrigger asChild>
              {/* added variant ghost and changed class name */}
              <Button
                variant="ghost"
                className="w-full mt-3 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <Plus />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <p className="text-sm text-gray-600">Add a task to the board</p>
                <form
                  className="space-y-4"
                  onSubmit={(e) => onCreateTask(e, column.sort_order)}
                >
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter task title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Enter description"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Assignee</Label>
                    <Input
                      id="assignee"
                      name="assignee"
                      placeholder="Who should do this?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select name="priority" defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["low", "medium", "high"].map((priority, key) => (
                          <SelectItem key={key} value={priority}>
                            {priority.charAt(0).toUpperCase() +
                              priority.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input id="dueDate" name="dueDate" type="date" />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="submit" className="cursor-pointer">
                      Create Task
                    </Button>
                  </div>
                </form>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

type TaskWrapper = {
  task: Task;
  column: BoardColumnWithTasks;
  columns: BoardColumnWithTasks[];
  updateTaskColumn: (
    taskId: string,
    columnId: string,
    previousColumnId: string
  ) => Promise<Task | undefined>;
  updateTask: (
    taskId: string,
    columnId: string,
    updates: Partial<Task>
  ) => Promise<Task | undefined>;
  deleteTask: (columnId: string, taskId: string) => Promise<Task | undefined>;
};

function TaskComponent({
  task,
  column,
  columns,
  updateTaskColumn,
  updateTask,
  deleteTask,
}: TaskWrapper) {
  const [movingTask, setMovingTask] = useState(false);
  const [columnValue, setColumnValue] = useState("");

  const [newTitle, setNewTitle] = useState(task.title);
  const [newDescription, setNewDescription] = useState(task.description || "");
  const [newAssignee, setNewAssignee] = useState(task.assignee || "");
  const [newDueDate, setNewDueDate] = useState(task.due_date || "");
  const [newPriority, setNewPriority] = useState<
    string | "low" | "medium" | "high"
  >(task.priority);

  useEffect(() => {
    if (columnValue !== "") {
      const otherColumn = columns.find((otherColumn) => {
        if (otherColumn.id === columnValue) {
          return otherColumn;
        }
      });
      moveTask(task, otherColumn);
    }
  }, [columnValue]);

  function getPriorityColour(priority: "low" | "medium" | "high") {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  }

  async function moveTask(
    taskToMove: Task,
    newColumn: BoardColumnWithTasks | undefined
  ) {
    if (newColumn) {
      setMovingTask(true);
      await updateTaskColumn(taskToMove.id, newColumn.id, column.id);
      setMovingTask(false);
    }
  }

  function resetEditTaskDialog() {
    setNewTitle(task.title);
    setNewDescription(task.description || "");
    setNewAssignee(task.assignee || "");
    setNewDueDate(task.due_date || "");
    setNewPriority(task.priority);
  }

  async function handleUpdateTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const taskData = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      assignee: (formData.get("assignee") as string) || undefined,
      due_date: (formData.get("dueDate") as string) || undefined,
      priority: formData.get("priority") as "low" | "medium" | "high",
    };

    if (taskData.title.trim()) {
      await updateTask(task.id, column.id, taskData);

      // for closing the dialog after creating a task
      // i don't like this though, want a better solution
      const trigger = document.querySelector(
        '[data-state="open"'
      ) as HTMLElement;
      if (trigger) trigger.click();
    }
  }

  async function handleDeleteTask() {
    await deleteTask(column.id, task.id);

    // for closing the dialog after creating a task
    // i don't like this though, want a better solution
    const trigger = document.querySelector('[data-state="open"') as HTMLElement;
    if (trigger) trigger.click();
  }

  return (
    <div>
      <Card
        className={`cursor-pointer hover:shadow-md transition-shadow ${
          movingTask ? "opacity-25" : ""
        }`}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 min-w-0 pr-2">
                {task.title}
              </h4>

              <Select
                value={columnValue}
                name="task"
                onValueChange={setColumnValue}
              >
                <SelectTrigger className="cursor-pointer border-none shadow-none hover:bg-gray-100">
                  <SelectIcon asChild>
                    <MoreHorizontal />
                  </SelectIcon>
                </SelectTrigger>

                <SelectContent>
                  {columns
                    .filter((otherColumn) => {
                      if (column.sort_order !== otherColumn.sort_order) {
                        return otherColumn;
                      }
                    })
                    .map((otherColumn, key) => (
                      <SelectItem
                        className="cursor-pointer"
                        value={otherColumn.id}
                        key={key}
                      >
                        {otherColumn.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer"
                    onClick={resetEditTaskDialog}
                  >
                    <Edit />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                  </DialogHeader>
                  <form className="space-y-4" onSubmit={handleUpdateTask}>
                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Enter task title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Enter task description"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Assignee</Label>
                      <Input
                        id="assignee"
                        name="assignee"
                        placeholder="Who should do this?"
                        value={newAssignee}
                        onChange={(e) => setNewAssignee(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select name="priority" defaultValue={newPriority}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["low", "medium", "high"].map((priority, key) => (
                            <SelectItem
                              key={key}
                              value={priority}
                              onClick={() => setNewPriority(priority)}
                            >
                              {priority.charAt(0).toUpperCase() +
                                priority.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input
                        id="dueDate"
                        name="dueDate"
                        type="date"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="submit" className="cursor-pointer">
                        Update Task
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <p className="text-xs text-gray-600 line-clamp-2">
              {task.description || "No description"}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                {task.assignee && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <User className="h-3 w-3" />
                    <span className="truncate">{task.assignee}</span>
                  </div>
                )}
                {task.due_date && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span className="truncate">{task.due_date}</span>
                  </div>
                )}
              </div>
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${getPriorityColour(
                  task.priority
                )}`}
              />
            </div>

            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer"
                    onClick={resetEditTaskDialog}
                  >
                    <Trash />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-center">
                      Are you sure you want to delete this task?
                    </DialogTitle>
                    <p className="flex justify-center gap-4 mt-5 bg-gray-50 rounded-sm py-2">
                      <ClipboardList /> <span>{task.title}</span>
                    </p>
                  </DialogHeader>
                  <div className="flex justify-center space-x-2 pt-4">
                    <Button
                      type="submit"
                      variant="secondary"
                      className="cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={handleDeleteTask}
                    >
                      Delete
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// for some reason, the page is re-rendering a lot
// e.g. when you click on a different window and click back on this one
export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const {
    board,
    updateBoard,
    deleteBoard,
    columns,
    createRealTask,
    createRealColumn,
    updateTaskColumn,
    updateTask,
    updateColumn,
    deleteColumn,
    deleteTask,
  } = useBoard(id);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newColour, setNewColour] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const router = useRouter();

  async function handleUpdateBoard(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !board) return;
    try {
      await updateBoard(board.id, {
        title: newTitle.trim(),
        description: newDescription.trim(),
        colour: newColour || board.colour,
      });
      setIsEditingTitle(false);
    } catch (e) {}
  }

  async function handleDeleteBoard() {
    await deleteBoard(board!.id);
    router.push("/dashboard");
  }

  function getTotalTasks() {
    return columns.reduce(
      (totalSoFar, column) => totalSoFar + column.tasks.length,
      0
    );
  }

  async function createTask(
    taskData: {
      title: string;
      description?: string;
      assignee?: string;
      dueDate?: string;
      priority: "low" | "medium" | "high";
    },
    sortOrder: number = 0
  ) {
    const targetColumn = columns[sortOrder]; // always adding to first column - needs changed for relevant add task button
    if (!targetColumn) {
      throw new Error("No column available");
    }
    await createRealTask(targetColumn.id, taskData);
  }

  //   might need to use any for now
  async function handleCreateTask(
    e: FormEvent<HTMLFormElement>,
    sortOrder?: number
  ) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const taskData = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      assignee: (formData.get("assignee") as string) || undefined,
      dueDate: (formData.get("dueDate") as string) || undefined,
      priority: formData.get("priority") as "low" | "medium" | "high",
      //   priority: (formData.get("priority") as "low" | "medium" | "high") || "medium",
    };

    if (taskData.title.trim()) {
      await createTask(taskData, sortOrder);

      // for closing the dialog after creating a task
      // i don't like this though, want a better solution
      const trigger = document.querySelector(
        '[data-state="open"'
      ) as HTMLElement;
      if (trigger) trigger.click();
    }
  }

  async function createColumn(columnTitle: string, boardId: string) {
    await createRealColumn(columnTitle, boardId);
  }

  async function handleCreateColumn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const columnTitle = formData.get("title") as string;

    if (columnTitle.trim() && board) {
      await createColumn(columnTitle, board.id);

      // for closing the dialog after creating a task
      // i don't like this though, want a better solution
      const trigger = document.querySelector(
        '[data-state="open"'
      ) as HTMLElement;
      if (trigger) trigger.click();
    }
  }

  async function handleUpdateColumn(
    e: FormEvent<HTMLFormElement>,
    column: BoardColumnWithTasks
  ) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const columnData = {
      title: formData.get("title") as string,
    };

    if (columnData.title.trim()) {
      await updateColumn(column.id, columnData);

      // for closing the dialog after creating a task
      // i don't like this though, want a better solution
      const trigger = document.querySelector(
        '[data-state="open"'
      ) as HTMLElement;
      if (trigger) trigger.click();
    }
  }

  async function handleDeleteColumn(column: BoardColumnWithTasks) {
    await deleteColumn(column.id);

    // for closing the dialog after creating a task
    // i don't like this though, want a better solution
    const trigger = document.querySelector('[data-state="open"') as HTMLElement;
    if (trigger) trigger.click();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        boardTitle={board?.title}
        onEditBoard={() => {
          setNewTitle(board?.title ?? "");
          setNewDescription(board?.description ?? "");
          setNewColour(board?.colour ?? "");
          setIsEditingTitle(true);
        }}
        onFilterClick={() => {
          setIsFilterOpen(true);
        }}
        filterCount={2}
      />

      <Dialog open={isEditingTitle} onOpenChange={setIsEditingTitle}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Board</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleUpdateBoard}>
            <div className="space-y-2">
              <Label htmlFor="boardTitle">Board Title</Label>
              <Input
                id="boardTitle"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter board title..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="boardDescription">Board Description</Label>
              <Input
                id="boardDescription"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Enter description..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Board Colour</Label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {[
                  "bg-blue-500",
                  "bg-green-500",
                  "bg-yellow-500",
                  "bg-red-500",
                  "bg-purple-500",
                  "bg-pink-500",
                  "bg-indigo-500",
                  "bg-gray-500",
                  "bg-orange-500",
                  "bg-teal-500",
                  "bg-cyan-500",
                  "bg-emerald-500",
                ].map((colour, key) => (
                  <button
                    key={key}
                    className={`w-8 h-8 cursor-pointer rounded-full ${colour} ${
                      colour === newColour
                        ? "ring-2 ring-offset-2 ring-gray-900"
                        : ""
                    }`}
                    onClick={() => setNewColour(colour)}
                    type="button"
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditingTitle(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>Filter Tasks</DialogTitle>
            <p className="text-sm text-gray-600">
              Filter tasks by priority, assignee, or due date
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <div className="flex flex-wrap gap-2">
                {["low", "medium", "high"].map((priority, key) => (
                  <Button key={key} variant={"outline"} size="sm">
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            {/* <div className="space-y-2">
              <Label>Assignee</Label>
              <div className="flex flex-wrap gap-2">
                {["low", "medium", "high"].map((priority, key) => (
                  <Button key={key} variant={"outline"} size="sm">
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Button>
                ))}
              </div>
            </div> */}
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" />
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant={"outline"}>
                Clear Filters
              </Button>
              <Button type="button" onClick={() => setIsFilterOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* BOARD CONTENT */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Total Tasks: </span>
              {getTotalTasks()}
            </div>
          </div>

          {/* ADD TASK */}
          {/* Using a Dialog Trigger as this sits on the page, not within Navbar (need to use asChild) */}
          <div className="flex items-center space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-4 sm:w-auto cursor-pointer">
                  <Plus />
                  Add Column
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
                <DialogHeader>
                  <DialogTitle>Add column</DialogTitle>
                  <p className="text-sm text-gray-600">
                    Add a column to the board. By default, this will add to the
                    end of the column list.
                  </p>
                </DialogHeader>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    handleCreateColumn(e);
                  }}
                >
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter task title"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="submit" className="cursor-pointer">
                      Create Column
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-4 sm:w-auto cursor-pointer">
                  <Plus />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <p className="text-sm text-gray-600">
                    Add a task to the board
                  </p>
                  <form
                    className="space-y-4"
                    onSubmit={(e) => handleCreateTask(e, 0)}
                  >
                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Enter task title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Enter description"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Assignee</Label>
                      <Input
                        id="assignee"
                        name="assignee"
                        placeholder="Who should do this?"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select name="priority" defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["low", "medium", "high"].map((priority, key) => (
                            <SelectItem key={key} value={priority}>
                              {priority.charAt(0).toUpperCase() +
                                priority.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input id="dueDate" name="dueDate" type="date" />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="submit" className="cursor-pointer">
                        Create Task
                      </Button>
                    </div>
                  </form>
                </DialogHeader>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-4 sm:w-auto cursor-pointer"
                >
                  Delete Board
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
                <DialogHeader>
                  <DialogTitle>Delete Board?</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete this board? This will delete
                  all associated columns and tasks.
                </p>
                <Button
                  variant="destructive"
                  className="w-4 sm:w-auto cursor-pointer"
                  onClick={handleDeleteBoard}
                >
                  Delete Board
                </Button>
                <Button
                  variant="secondary"
                  className="w-4 sm:w-auto cursor-pointer"
                >
                  Cancel
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Description */}
        {board?.description && (
          <p className="mb-4 text-sm">{board?.description}</p>
        )}

        {/* BOARD COLUMNS */}
        <div className="flex flex-col lg:flex-row lg:space-x-6 lg:overflow-x-auto lg:pb-6 lg:px-2 lg:-mx-2 lg:[&::-webkit-scrollbar]:h-2 lg:[&::-webkit-scrollbar-track]:bg-gray-100 lg:[&::-webkit-scrollbar-thumb]:bg-gray-300 lg:[&::-webkit-scrollbar-thumb]:rounded-full space-y-4 lg:space-y-0">
          {columns.map((column, key) => (
            <Column
              key={key}
              column={column}
              onCreateTask={handleCreateTask}
              onEditColumn={handleUpdateColumn}
              onDeleteColumn={handleDeleteColumn}
            >
              <div className="space-y-3">
                {column.tasks.map((task, key) => (
                  <TaskComponent
                    task={task}
                    column={column}
                    columns={columns}
                    updateTaskColumn={updateTaskColumn}
                    updateTask={updateTask}
                    deleteTask={deleteTask}
                    key={key}
                  />
                  //   <div key={key}>{task.title}</div>
                ))}
              </div>
            </Column>
          ))}
        </div>
      </main>
    </div>
  );
}
