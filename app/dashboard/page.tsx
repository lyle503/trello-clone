"use client";

import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useBoards } from "@/lib/hooks/useBoards";
import { useUser } from "@clerk/nextjs";
import {
  Filter,
  Grid3x3,
  List,
  Loader2,
  Plus,
  Rocket,
  Search,
  Trello,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function DashboardPage() {
  const { user } = useUser();
  const { createBoard, boards, loading, error } = useBoards();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [newColour, setNewColour] = useState("bg-blue-500");
  const [addBoardError, setAddBoardError] = useState("");
  const [creatingQuickBoard, setCreatingQuickBoard] = useState(false);

  async function handleCreateBoard(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const boardData = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      colour: (newColour as string) || "bg-blue-500",
    };

    if (boardData.title.trim()) {
      await createBoard(boardData);

      const trigger = document.querySelector(
        '[data-state="open"'
      ) as HTMLElement;
      if (trigger) trigger.click();
    } else {
      setAddBoardError("Please enter a title");
    }
  }

  async function handleCreateQuickBoard() {
    if (creatingQuickBoard) return;
    setCreatingQuickBoard(true);
    await createBoard({ title: "New Board" });
    setCreatingQuickBoard(false);
  }

  // if (loading) {
  //   return (
  //     <div>
  //       <Loader2 />
  //       <span>Loading your boards...</span>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div>
        <h2>Error loading boards</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back,{" "}
            {user?.firstName ?? user?.emailAddresses[0].emailAddress}! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your boards today
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Create Board
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
              <DialogHeader>
                <DialogTitle>Create New Board</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleCreateBoard}>
                {addBoardError && (
                  <p className="text-red-400">{addBoardError}</p>
                )}
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter task title"
                    onChange={() => setAddBoardError("")}
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
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="submit" className="cursor-pointer">
                    Create Board
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Total boards
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {boards.length}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Trello className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Active projects
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {boards.length}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Recent Activity
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {
                      boards.filter((board) => {
                        const updatedAt = new Date(board.updated_at);
                        const oneWeekAgo = new Date();
                        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                        return updatedAt > oneWeekAgo;
                      }).length
                    }
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <div>📊</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* BOARDS */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Your boards
            </h2>
            <p className="text-gray-600">Manage your projects and tasks</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 space-x-2">
            <div className="flex items-center space-x-2 bg-white border p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="cursor-pointer"
              >
                <Grid3x3 />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="cursor-pointer"
              >
                <List />
              </Button>
            </div>

            {/* FIND A WAY TO MAKE THIS A REUSABLE COMPONENT */}
            {/* Biggest hurdle is the newColour state */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Board
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
                <DialogHeader>
                  <DialogTitle>Create New Board</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleCreateBoard}>
                  {addBoardError && (
                    <p className="text-red-400">{addBoardError}</p>
                  )}
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter task title"
                      onChange={() => setAddBoardError("")}
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
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="submit">Create Task</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* SEARCH BAR */}
        {/* <div className="relative mb-4 sm:mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input id="search" placeholder="Search boards..." className="pl-10" />
        </div> */}

        {/* BOARDS GRID/LIST */}
        {boards.length === 0 ? (
          <div>No boards yet!</div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {boards.map((board, key) => (
              <Link href={`/boards/${board.id}`} key={key}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-4 h-4 ${board.colour} rounded`} />
                      <Badge className="text-xs" variant="secondary">
                        New
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {board.title}
                    </CardTitle>
                    <CardDescription className="text-sm mb-4">
                      {board.description || "No description"}
                    </CardDescription>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 space-y-1 sm:space-y-0">
                      <span>
                        Created{" "}
                        {new Date(board.created_at).toLocaleDateString()}
                      </span>
                      <span>
                        Updated{" "}
                        {new Date(board.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            <Card
              onClick={handleCreateQuickBoard}
              className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer group"
            >
              <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                {!creatingQuickBoard ? (
                  <div className="flex flex-col items-center justify-center">
                    <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 group-hover:text-blue-600 mb-2" />
                    <p className="text-sm sm:text-base text-gray-600 group-hover:text-blue-600 font-medium">
                      Create quick board
                    </p>
                  </div>
                ) : (
                  <p className="text-sm sm:text-base text-gray-600 group-hover:text-blue-600 font-medium">
                    Creating new board...
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div>
            {boards.map((board, key) => (
              <div key={key} className={key > 0 ? "mt-4" : ""}>
                <Link href={`/boards/${board.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`w-4 h-4 ${board.colour} rounded`} />
                        <Badge className="text-xs" variant="secondary">
                          New
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p4 sm:p-6">
                      <CardTitle className="text-base sm:text-lg mb-2 group-hover:text-blue-600 transition-colors">
                        {board.title}
                      </CardTitle>
                      <CardDescription className="text-sm mb-4">
                        {board.description}
                      </CardDescription>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 space-y-1 sm:space-y-0">
                        <span>
                          Created{" "}
                          {new Date(board.created_at).toLocaleDateString()}
                        </span>
                        <span>
                          Updated{" "}
                          {new Date(board.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}

            <Card
              onClick={handleCreateQuickBoard}
              className="mt-4 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer group"
            >
              <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 group-hover:text-blue-600 mb-2" />
                <p className="text-sm sm:text-base text-gray-600 group-hover:text-blue-600 font-medium">
                  Create new board
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
