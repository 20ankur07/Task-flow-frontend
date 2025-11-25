"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { setAuthToken } from "../../utils/api";
import TaskModal from "../../components/TaskModal";
import ProfileModal from "../../components/ProfileModal";

export default function DashboardPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [profile, setProfile] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // -----------------------------------------
  // CREATE NEW TASK
  // -----------------------------------------
  async function createTask(data) {
    try {
      const res = await api.post("/tasks", data);
      setTasks([res.data, ...tasks]);
      setShowModal(false);
    } catch (err) {
      console.log(err);
      alert("Failed to create task");
    }
  }

  // -----------------------------------------
  // EDIT TASK
  // -----------------------------------------
  async function updateTask(data) {
    try {
      const res = await api.put(`/tasks/${editingTask._id}`, data);
      setTasks(tasks.map(t => (t._id === editingTask._id ? res.data : t)));
      setEditingTask(null);
      setShowModal(false);
    } catch (err) {
      console.log(err);
      alert("Failed to update task");
    }
  }

  // -----------------------------------------
  // DELETE TASK
  // -----------------------------------------
  async function deleteTask(id) {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
    } catch (err) {
      console.log(err);
      alert("Failed to delete");
    }
  }

  // -----------------------------------------
  // FETCH PROFILE
  // -----------------------------------------
  async function fetchProfile() {
    try {
      const res = await api.get("/profile");
      setProfile(res.data);
    } catch (err) {
      console.log("Profile load error", err);
    }
  }

  async function updateProfile(data) {
    try {
      const res = await api.put("/profile", data);
      setProfile(res.data);
      setProfileOpen(false);
    } catch (err) {
      alert("Failed to update profile");
      console.log(err);
    }
  }

  // -----------------------------------------
  // PROTECT ROUTE + LOAD TASKS + LOAD PROFILE
  // -----------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setAuthToken(token);
    fetchTasks();
    fetchProfile();
  }, []);

  async function fetchTasks() {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 p-4 relative z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Logo icon */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Task-flow
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search with icon */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl w-64 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-gray-700 transition-all"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Pending badge with gradient */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-red-50 to-pink-50 px-4 py-2 rounded-xl border border-red-200/50 shadow-sm">
              <div className="text-sm font-medium text-gray-700">Pending</div>
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                {tasks.filter(t => !t.completed).length}
              </div>
            </div>

            {/* Profile button with gradient */}
            <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-200 px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shadow-lg">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-gray-800">{profile?.name || "User"}</div>
                <div className="text-xs text-gray-500">{profile?.email || ""}</div>
              </div>
            </button>

            {/* Logout button with gradient */}
            <button
              onClick={() => {
                localStorage.removeItem("token");
                router.push("/login");
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto mt-10 p-6 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Your Tasks
          </h2>

          <button
            onClick={() => {
              setEditingTask(null);
              setShowModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>

        {/* TASK CARDS */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg font-medium">No tasks found</p>
              <p className="text-gray-400 text-sm mt-2">Create your first task to get started!</p>
            </div>
          ) : (
            filteredTasks.map((task, index) => (
              <div
                key={task._id}
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                      <h3 className="font-bold text-xl text-gray-800">{task.title}</h3>
                    </div>
                    <p className="text-gray-600 ml-5">{task.description}</p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setShowModal(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-blue-700 font-medium hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 hover:scale-105"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        setTaskToDelete(task);
                        setDeleteConfirmOpen(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl text-red-600 font-medium hover:from-red-100 hover:to-pink-100 transition-all duration-300 hover:scale-105"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* TASK MODAL */}
      <TaskModal
        open={showModal}
        onClose={() => setShowModal(false)}
        initialData={editingTask}
        onSubmit={(data) =>
          editingTask ? updateTask(data) : createTask(data)
        }
      />

      {/* PROFILE MODAL */}
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={profile}
        onSubmit={updateProfile}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                Delete Task
              </h2>
            </div>

            <p className="text-gray-700 text-lg mb-2">
              Are you sure you want to delete this task?
            </p>
            {taskToDelete && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="font-semibold text-gray-800">{taskToDelete.title}</p>
                {taskToDelete.description && (
                  <p className="text-sm text-gray-600 mt-1">{taskToDelete.description}</p>
                )}
              </div>
            )}
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setTaskToDelete(null);
                }}
                className="px-6 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-sm"
              >
                Cancel
              </button>

              <button
                onClick={() => deleteTask(taskToDelete._id)}
                className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
