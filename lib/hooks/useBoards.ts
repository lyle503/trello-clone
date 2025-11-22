"use client";

import { useUser } from "@clerk/nextjs";
import { boardDataService, boardService, taskService } from "../services";
import { useEffect, useState } from "react";
import { Board, BoardColumnWithTasks, Task } from "../supabase/models";
import { useSupabase } from "../supabase/SupabaseProvider";

export function useBoards() {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // do i need this if statement?
    if (user) {
      loadBoards();
    }
  }, [user, supabase]);

  async function loadBoards() {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await boardService.getBoards(supabase!, user.id);
      setBoards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load boards");
    } finally {
      setLoading(false);
    }
  }

  async function createBoard(boardData: {
    title: string;
    description?: string;
    colour?: string;
  }) {
    if (!user) {
      throw new Error("User not authenticated");
    }
    try {
      const newBoard = await boardDataService.createBoardWithDefaultColumns(
        supabase!,
        {
          ...boardData,
          userId: user.id,
        }
      );
      setBoards((prev) => [newBoard, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board");
    }
  }

  return { boards, loading, error, createBoard };
}

export function useBoard(boardId: string) {
  const { supabase } = useSupabase();
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<BoardColumnWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (boardId) {
      loadBoard();
    }
  }, [supabase]);

  async function loadBoard() {
    if (!boardId || !supabase) return;

    try {
      setLoading(true);
      setError(null);
      // seems to be accessing this too early, not sure why
      const data = await boardDataService.getBoardWithColumns(
        supabase!,
        boardId
      );
      setBoard(data.board);
      setColumns(data.columnsWithTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load board");
    } finally {
      setLoading(false);
    }
  }

  async function updateBoard(boardId: string, updates: Partial<Board>) {
    try {
      const updatedBoard = await boardService.updateBoard(
        supabase!,
        boardId,
        updates
      );
      setBoard(updatedBoard);
      return updatedBoard;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update board");
    }
  }

  async function createRealTask(
    columnId: string,
    taskData: {
      title: string;
      description?: string;
      assignee?: string;
      dueDate?: string;
      priority: "low" | "medium" | "high";
    }
  ) {
    try {
      const newTask = await taskService.createTask(supabase!, {
        title: taskData.title,
        description: taskData.description || null,
        assignee: taskData.assignee || null,
        due_date: taskData.dueDate || null,
        priority: taskData.priority || "medium",
        column_id: columnId,
        sort_order:
          columns.find((col) => col.id === columnId)?.tasks.length || 0, // either adding to the end of the tasks or at the start (0)
      });
      setColumns((prev) =>
        prev.map((column) =>
          column.id === columnId
            ? { ...column, tasks: [...column.tasks, newTask] }
            : column
        )
      );
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    }
  }

  async function updateTask(
    taskId: string,
    columnId: string,
    updates: Partial<Task>
  ) {
    try {
      const updatedTask = await taskService.updateTask(
        supabase!,
        taskId,
        updates
      );
      setColumns((prev) =>
        prev.map((column) =>
          column.id === columnId
            ? {
                ...column,
                tasks: column.tasks.map((task) =>
                  task.id === taskId ? updatedTask : task
                ),
              }
            : column
        )
      );
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  }

  async function updateTaskColumn(
    taskId: string,
    columnId: string,
    previousColumnId: string
  ) {
    try {
      const movedTask = await taskService.updateTaskColumn(
        supabase!,
        taskId,
        columnId
      );
      setColumns((prev) =>
        prev.map((column) =>
          column.id === columnId
            ? { ...column, tasks: [...column.tasks, movedTask] }
            : column.id === previousColumnId
            ? {
                ...column,
                tasks: [
                  ...column.tasks.filter((task) => {
                    if (task.id !== taskId) return task;
                  }),
                ],
              }
            : column
        )
      );
      return movedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move task");
    }
  }

  return {
    board,
    columns,
    loading,
    error,
    updateBoard,
    createRealTask,
    updateTask,
    updateTaskColumn,
  };
}
