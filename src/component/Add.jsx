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
import image from "../assets/logo.png";

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
      "Are you sure you want to delete complete task?"
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
    <div className="w-full min-h-screen bg-cover bg-center bg-white">
      <div className="flex flex-col items-center justify-center p-4">
        <button
          onClick={handleLogout}
          className="w-12 h-10 ml-auto flex items-center justify-center bg-red-700 text-white py-2 rounded-3xl"
        >
          <IoLogOutSharp />
        </button>

        {editModalOpen ? (
          ""
        ) : (
          <div className="flex bg-purple-100 flex-row border-2 w-full max-w-md md:max-w-2xl shadow-inner shadow-purple-800 rounded-2xl px-4 py-2 mb-7 text-center sticky top-0 z-10">
            <div
              className="bg-cover bg-center w-16 h-16 rounded-2xl md:w-12 md:h-12"
              style={{ backgroundImage: `url(${image})` }}
            ></div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-900 ml-4">
              Multi-ToDo App
            </h1>
          </div>
        )}

        <div className="rounded-lg p-4 sm:w-[10rem] md:w-[20rem] max-w-md md:max-w-lg lg:max-w-2xl shadow-md shadow-purple-400 border-2 bg-purple-100">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter Title"
            className="w-[75%] mb-4 p-3 text-sm md:text-lg rounded-md bg-gray-300 text-purple-950 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-300 transition duration-300"
          />
          {tasks.map((task, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2 mb-4">
              <input
                type="text"
                value={task}
                onChange={(e) => handleTaskChange(index, e.target.value)}
                placeholder="Enter task"
                className="w-[75%] md:w-3/4 mb-2 p-2 text-sm md:text-lg rounded-md bg-gray-300 text-purple-950 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-300 transition duration-300"
              />
              <div className="flex gap-2">
                {tasks.length === 1 ? (
                  <button
                    onClick={() => addNewTask(index)}
                    className="bg-purple-800 hover:bg-purple-900 text-white text-lg p-2 rounded-xl"
                  >
                    <IoMdAdd />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => removeTask(index)}
                      className="bg-purple-800 hover:bg-purple-900 text-white text-lg p-2 rounded-xl"
                    >
                      <FaMinus />
                    </button>
                    {index === tasks.length - 1 && (
                      <button
                        onClick={() => addNewTask(index)}
                        className="bg-purple-800 hover:bg-purple-900 text-white text-lg p-2 rounded-xl"
                      >
                        <IoMdAdd />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={addListInArray}
            disabled={loading}
            className={`w-full md:w-3/4 p-2 rounded-lg text-white font-bold text-base md:text-lg  
          ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-purple-800 hover:bg-purple-900"
          } transition duration-300`}
          >
            {loading ? "Adding..." : "Add Todo"}
          </button>
        </div>

        <div className="mt-8 sm:w-[10rem] md:w-[20rem] max-w-md md:max-w-lg lg:max-w-2xl">
          {storeLists?.length ? (
            storeLists.map((list, listIndex) => (
              <div
                key={list.id || listIndex}
                className="mb-6 p-4 bg-purple-100 rounded-lg shadow-md border-2 shadow-purple-400"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-bold text-purple-950">
                    {list.title}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(list, listIndex)}
                      disabled={loading}
                      className={`p-2 h-8 rounded-xl text-white text-sm md:text-base 
                    ${
                      loading
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-purple-800 hover:bg-purple-900"
                    } transition duration-300`}
                    >
                      <FiEdit />
                    </button>
                    <button
                      disabled={loading}
                      onClick={() => handleDeleteList(list.id)}
                      className={`p-2 h-8 rounded-xl text-white text-sm md:text-base 
                    ${
                      loading
                        ? "bg-red-300 cursor-not-allowed"
                        : "bg-red-700 hover:bg-red-600"
                    } transition duration-300`}
                    >
                      <RiDeleteBin6Fill />
                    </button>
                  </div>
                </div>
                {list.todos?.map((todo, todoIndex) => (
                  <div
                    key={todo.id || todoIndex}
                    className="flex flex-wrap items-center mt-4 gap-2"
                  >
                    <input
                      type="text"
                      value={todo.text}
                      readOnly
                      className="w-full md:w-3/4 p-2 text-sm md:text-lg rounded-md bg-white text-purple-950"
                    />
                    <button
                      onClick={() => handleDeleteTodo(list.id, todo.id)}
                      disabled={loading}
                      className={`p-2 rounded-xl text-white text-sm md:text-base 
                    ${
                      loading
                        ? "bg-red-300 cursor-not-allowed"
                        : "bg-red-700 hover:bg-red-600"
                    } transition duration-300`}
                    >
                      <MdOutlineCancel />
                    </button>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p className="text-center font-bold text-purple-900">
              No data available
            </p>
          )}
        </div>

        {editModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-purple-200 bg-opacity-50 px-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-sm md:max-w-lg lg:max-w-2xl max-h-screen overflow-y-auto shadow-lg">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-950 shadow-inner shadow-purple-800 bg-purple-200 rounded-xl px-4 py-2 md:px-6 md:py-3 text-center">
                  Update Your Tasks
                </p>
                <button
                  onClick={closeEdit}
                  className="bg-red-700 text-white text-sm md:text-base p-2 rounded-2xl hover:bg-red-600 transition"
                >
                  <GiCancel />
                </button>
              </div>

              {/* Edit Title Input */}
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Edit list title"
                className="w-[75%] mb-4 p-3 text-sm md:text-lg rounded-md bg-purple-200 text-purple-950 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-300 transition"
              />

              {/* Tasks Section */}
              <div className="space-y-4">
                {editTasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-center gap-3"
                  >
                    <input
                      type="text"
                      value={task.text}
                      onChange={(e) =>
                        handleEditTaskChange(index, e.target.value)
                      }
                      placeholder="Edit task"
                      className="w-[75%] md:w-3/4 p-3 text-sm md:text-lg rounded-md bg-purple-100 text-purple-950 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-300 transition"
                    />
                    <div className="flex gap-2">
                      {editTasks.length === 1 ? (
                        <button
                          onClick={() => addNewTaskToEdit(index)}
                          className="bg-purple-800 hover:bg-purple-900 text-white text-sm md:text-lg p-2 rounded-xl transition"
                        >
                          <IoMdAdd />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => removeTaskFromEdit(index)}
                            className="bg-purple-800 hover:bg-purple-900 text-white text-sm md:text-lg p-2 rounded-xl transition"
                          >
                            <FaMinus />
                          </button>
                          {index === editTasks.length - 1 && (
                            <button
                              onClick={() => addNewTaskToEdit(index)}
                              className="bg-purple-800 hover:bg-purple-900 text-white text-sm md:text-lg p-2 rounded-xl transition"
                            >
                              <IoMdAdd />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Changes Button */}
              <button
                onClick={saveEditChanges}
                disabled={loading}
                className={`w-full md:w-1/2 p-3 rounded-xl mt-6 text-white font-bold text-sm md:text-lg lg:text-xl 
        ${
          loading
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-purple-800 hover:bg-purple-900"
        } transition duration-300`}
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Add;
