"use client";

import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBoard } from "@/lib/hooks/useBoards";
import { useParams } from "next/navigation";
import { FormEvent, useState } from "react";

// for some reason, the page is re-rendering a lot
// e.g. when you click on a different window and click back on this one
export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const { board, updateBoard, columns } = useBoard(id);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColour, setNewColour] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  async function handleUpdateBoard(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !board) return;
    try {
      await updateBoard(board.id, {
        title: newTitle.trim(),
        colour: newColour || board.colour,
      });
      setIsEditingTitle(false);
    } catch (e) {}
  }

  function getTotalTasks() {
    return columns.reduce(
      (totalSoFar, column) => totalSoFar + column.tasks.length,
      0
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        boardTitle={board?.title}
        onEditBoard={() => {
          setNewTitle(board?.title ?? "");
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
                    className={`w-8 h-8 rounded-full ${colour} ${
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
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
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
              <span className="font-medium">Total Tasks:</span>
              {getTotalTasks()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
