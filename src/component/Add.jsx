import React, { useState, useEffect } from "react";
import { FiEdit } from "react-icons/fi";
import { GiCancel } from "react-icons/gi";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { IoLogOutSharp } from "react-icons/io5";
import { v4 as uuidv4 } from "uuid";
import { IoMdAdd } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { FaMinus } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { MdOutlineCancel } from "react-icons/md";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import image from "../assets/main-bg.jpeg";
import {
  addListToFirebase,
  fetchListsFromFirebase,
  deleteTaskFromFirebase,
  updateListInFirebase,
  loginUser,
  logoutUser,
  logOut,
  deleteListFromFirebase,
} from "../redux/taskSlices";

const Add = () => {
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState([""]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editTasks, setEditTasks] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editListId, setEditListId] = useState(null);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const user = useSelector((state) => state.lists.user);
  const { error, loading } = useSelector((state) => state.lists.user || {});
  const storeLists = useSelector((state) => state.lists.lists);

  useEffect(() => {
    if (!user?.uid) {
      navigate("/logIn");
    } else {
      dispatch(fetchListsFromFirebase(user.uid));
    }
  }, [user, dispatch, navigate]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(loginUser({ email: user.email, uid: user.uid }));
      } else {
        dispatch(logoutUser());
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  const addNewTask = (index) => {
    const newTasks = [...tasks];
    newTasks.splice(index + 1, 0, "");
    setTasks(newTasks);
  };

  const removeTask = (index) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  const openEditModal = (list, listIndex) => {
    setEditTitle(list.title);
    setEditTasks(
      list.todos.map((todo) => ({ id: todo.id || uuidv4(), text: todo.text }))
    );
    setEditIndex(listIndex);
    setEditListId(list.id);
    setEditModalOpen(true);
  };

  const addNewTaskToEdit = (index) => {
    const newTasks = [...editTasks];
    newTasks.splice(index + 1, 0, { id: uuidv4(), text: "" });
    setEditTasks(newTasks);
  };

  const removeTaskFromEdit = (index) => {
    const newTasks = [...editTasks];
    newTasks.splice(index, 1);
    setEditTasks(newTasks);
  };

  const saveEditChanges = () => {
    const updatedList = {
      title: editTitle,
      todos: editTasks.map((task) => ({ id: task.id, text: task.text })),
      userId: user.uid,
    };

    dispatch(updateListInFirebase({ listId: editListId, updatedList }));
    setEditModalOpen(false);
  };

  const handleEditTaskChange = (index, value) => {
    const newEditTasks = [...editTasks];
    newEditTasks[index] = { ...newEditTasks[index], text: value };
    setEditTasks(newEditTasks);
  };

  const closeEdit = () => {
    setEditModalOpen(false);
  };

  const handleTaskChange = (index, value) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  const addListInArray = () => {
    if (!title.trim() || tasks.some((task) => !task.trim())) return;

    const newList = {
      title,
      todos: tasks.map((task) => ({ text: task })),
      userId: user.uid,
    };

    dispatch(addListToFirebase({ list: newList, userId: user.uid }));
    setTitle("");
    setTasks([""]);
  };

  const handleDeleteList = (listId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (confirmed) {
      try {
        dispatch(deleteListFromFirebase(listId));
        alert("Item deleted successfully!");
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item. Please try again.");
      }
    } else {
      console.log("Delete action canceled by the user.");
    }
  };

  const handleDeleteTodo = (listId, todoId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (confirmed) {
      try {
        if (todoId) {
          dispatch(deleteTaskFromFirebase({ listId, taskId: todoId }));
          alert("Item deleted successfully!");
        }
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item. Please try again.");
      }
    } else {
      console.log("Delete action canceled by the user.");
    }
  };

  const handleLogout = () => {
    dispatch(logOut());
    navigate("/login");
  };

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="flex flex-col items-center justify-center p-4">
        <button
          onClick={handleLogout}
          className="w-10 h-10 ml-auto flex items-center justify-center bg-red-700 text-white py-2 rounded-3xl"
        >
          <IoLogOutSharp />
        </button>

        <h1 className="text-2xl md:text-3xl font-semibold text-white bg-slate-500 rounded-2xl px-4 md:px-6 py-3 mb-10 max-w-full md:w-[50rem] text-center sticky top-0 z-10">
          ToDo App
        </h1>

        <div className="bg-slate-500 rounded-lg p-6 w-full md:w-[36rem]">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter Title"
            className="w-[80%] mb-4 p-3 text-lg rounded-md bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-500 transition duration-300"
          />
          {tasks.map((task, index) => (
            <div key={index} className="flex items-center mb-4">
              <input
                type="text"
                value={task}
                onChange={(e) => handleTaskChange(index, e.target.value)}
                placeholder="Enter task"
                className="w-[80%] md:w-[70%] mb-4 p-3 text-lg rounded-md bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-500 transition duration-300"
              />
              {tasks.length === 1 ? (
                <button
                  onClick={() => addNewTask(index)}
                  className="bg-gray-900 text-white text-xl ml-4 p-2 rounded-2xl"
                >
                  <IoMdAdd />
                </button>
              ) : index === tasks.length - 1 ? (
                <>
                  <button
                    onClick={() => removeTask(index)}
                    className="bg-gray-900 text-white text-xl ml-4 p-2 rounded-2xl"
                  >
                    <FaMinus />
                  </button>
                  <button
                    onClick={() => addNewTask(index)}
                    className="bg-gray-900 text-white text-xl ml-2 p-2 rounded-2xl"
                  >
                    <IoMdAdd />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => removeTask(index)}
                  className="bg-gray-900 text-white text-xl ml-4 p-2 rounded-2xl"
                >
                  <FaMinus />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={addListInArray}
            disabled={loading}
            className={`w-full md:w-[80%] p-3 rounded-md text-white font-bold text-xl md:text-2xl 
  ${
    loading ? "bg-blue-300 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-800"
  } 
  transition duration-300`}
          >
            {loading ? "Logging in..." : "Add Todo"}
          </button>
        </div>

        <div className="mt-8 w-[100%] md:w-[36rem]">
          {storeLists?.length ? (
            storeLists.map((list, listIndex) => (
              <div
                key={list.id || listIndex}
                className="mb-6 p-4 bg-slate-500 rounded-lg shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl md:text-3xl font-bold text-white">
                    {list.title}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(list, listIndex)}
                      disabled={loading}
                      className={`p-2 h-10 rounded-xl text-white font-bold text-sm md:text-xl 
                ${
                  loading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gray-900 hover:bg-gray-600"
                } 
                transition duration-300`}
                    >
                      <FiEdit />
                    </button>
                    <button
                      disabled={loading}
                      onClick={() => handleDeleteList(list.id)}
                      className={`p-2 h-10 rounded-xl text-white font-bold text-sm md:text-xl 
                ${
                  loading
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-700 hover:bg-red-600"
                } 
                transition duration-300`}
                    >
                      <RiDeleteBin6Fill />
                    </button>
                  </div>
                </div>
                {list.todos?.map((todo, todoIndex) => (
                  <div
                    key={todo.id || todoIndex}
                    className="flex flex-wrap items-center mt-4 justify-between mb-2 gap-2"
                  >
                    <input
                      type="text"
                      value={todo.text}
                      className="flex-grow p-3 text-base md:text-lg rounded-md bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-500 transition duration-300"
                    />
                    <button
                      onClick={() => handleDeleteTodo(list.id, todo.id)}
                      disabled={loading}
                      className={`p-2 rounded-xl text-white font-bold text-sm md:text-xl 
              ${
                loading
                  ? "bg-red-300 cursor-not-allowed"
                  : "bg-red-700 hover:bg-red-600"
              } 
              transition duration-300`}
                    >
                      <MdOutlineCancel />
                    </button>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p className="font-extrabold text-white text-center">
              No Data Available
            </p>
          )}
        </div>

        {editModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-[36rem] max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <p className="text-xl md:text-2xl font-semibold text-white bg-slate-500 rounded-xl px-4 py-2 md:px-6 md:py-3 text-center">
                  Update Your Tasks
                </p>
                <button
                  onClick={closeEdit}
                  className="bg-red-700 text-white text-base md:text-xl p-2 rounded-3xl hover:bg-red-600 transition"
                >
                  <GiCancel />
                </button>
              </div>

              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Edit list title"
                className="w-full mb-4 p-3 text-base md:text-lg font-bold rounded-md bg-gray-400 text-white placeholder-gray-100 focus:outline-none focus:bg-gray-500 focus:ring-2 focus:ring-gray-500 transition"
              />

              <div className="space-y-4">
                {editTasks.map((task, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <input
                      type="text"
                      value={task.text}
                      onChange={(e) =>
                        handleEditTaskChange(index, e.target.value)
                      }
                      placeholder="Edit task"
                      className="flex-grow p-3 text-base md:text-lg rounded-md bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-500 transition"
                    />
                    {editTasks.length === 1 ? (
                      <button
                        onClick={() => addNewTaskToEdit(index)}
                        className="bg-gray-900 text-white text-base md:text-xl p-2 rounded-2xl hover:bg-gray-700 transition"
                      >
                        <IoMdAdd />
                      </button>
                    ) : index === editTasks.length - 1 ? (
                      <>
                        <button
                          onClick={() => removeTaskFromEdit(index)}
                          className="bg-gray-900 text-white text-base md:text-xl p-2 rounded-2xl hover:bg-gray-700 transition"
                        >
                          <FaMinus />
                        </button>
                        <button
                          onClick={() => addNewTaskToEdit(index)}
                          className="bg-gray-900 text-white text-base md:text-xl p-2 rounded-2xl hover:bg-gray-700 transition"
                        >
                          <IoMdAdd />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => removeTaskFromEdit(index)}
                        className="bg-gray-900 text-white text-base md:text-xl p-2 rounded-2xl hover:bg-gray-700 transition"
                      >
                        <FaMinus />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={saveEditChanges}
                className={`w-full md:w-[60%] p-3 rounded-3xl mt-6 text-white font-bold text-lg md:text-2xl 
          ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-gray-900 hover:bg-gray-600"
          } 
          transition duration-300`}
              >
                {loading ? "Logging in..." : "Update"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Add;
