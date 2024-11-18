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
      className="w-full h-max-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="flex flex-col items-center justify-center">
        <button
          onClick={handleLogout}
          className="w-10 h-10 ml-[90%] flex items-center justify-center bg-red-700 text-white py-2 rounded-3xl"
        >
          <IoLogOutSharp />
        </button>

        <h1 className="text-3xl font-semibold text-white bg-slate-500 rounded-2xl px-6 py-3 mb-10 w-[50rem] text-center sticky top-0 z-10">
          ToDo App
        </h1>

        <div className="bg-slate-500 rounded-lg p-6 w-[36rem] h-[50%]">
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
                className="w-[80%] mb-4 p-3 text-lg rounded-md bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-500 transition duration-300"
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
            className={`w-[80%] p-3 rounded-md text-white font-bold text-2xl 
            ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-gray-900 hover:bg-gray-800"
            } 
            transition duration-300`}
          >
            {loading ? "Logging in..." : "Add Todo"}
          </button>
        </div>

        <div className="mt-8 w-[36rem]">
          {storeLists?.length ? (
            storeLists.map((list, listIndex) => (
              <div
                key={list.id || listIndex}
                className="mb-6 p-4 bg-slate-500 rounded-lg shadow-md"
              >
                <div className="flex flex-row">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    {list.title}
                  </h2>
                  <button
                    onClick={() => openEditModal(list, listIndex)}
                    disabled={loading}
                    className={` ml-[20rem] p-2 h-10 rounded-xl text-white font-bold text-xl 
                      ${
                        loading
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-gray-900 hover:bg-gray-600"
                      } 
                      transition duration-300`}
                  >
                    {loading ? "Logging in..." : ""}
                    <FiEdit />
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => handleDeleteList(list.id)}
                    className={` ml-[1rem] p-2 h-10 rounded-xl text-white font-bold text-xl 
                      ${
                        loading
                          ? "bg-red-300 cursor-not-allowed"
                          : "bg-red-700 hover:bg-red-600"
                      } 
                      transition duration-300`}
                  >
                    {loading ? "Logging in..." : ""}
                    <RiDeleteBin6Fill />
                  </button>
                </div>
                {list.todos?.map((todo, todoIndex) => (
                  <div
                    key={todo.id || todoIndex}
                    className="flex items-center mb-2"
                  >
                    <input
                      type="text"
                      value={todo.text}
                      className="w-[70%] mb-2 p-3 text-lg rounded-md bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-500 transition duration-300"
                    />

                    <button
                      onClick={() => handleDeleteTodo(list.id, todo.id)}
                      disabled={loading}
                      className={` ml-[4rem] p-2 rounded-xl text-white font-bold text-xl 
                      ${
                        loading
                          ? "bg-red-300 cursor-not-allowed"
                          : "bg-red-700 hover:bg-red-600"
                      } 
                      transition duration-300`}
                    >
                      {loading ? "Logging in..." : ""}
                      <MdOutlineCancel />
                    </button>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p className="font-extrabold text-white">No Data Avaliable</p>
          )}
        </div>

        {editModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-[36rem] max-h-screen">
              <div className="flex flex-row">
                <p className="text-2xl font-semibold text-white bg-slate-500 rounded-xl px-6 py-3 mb-10 w-[80%] text-center">
                  Update Your Tasks
                </p>
                <button
                  onClick={closeEdit}
                  className="bg-red-700 text-white text-xl mb-4 p-2 ml-[40%] w-8.5 h-9 rounded-3xl"
                >
                  <GiCancel />
                </button>
              </div>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Edit list title"
                className="w-[70%] mb-2 p-3 text-lg font-bold rounded-md bg-gray-400 text-white placeholder-gray-100 focus:outline-none focus:bg-gray-500 focus:ring-2 focus:ring-gray-500 transition duration-300"
              />
              <div className="space-y-2">
                {editTasks.map((task, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <input
                      type="text"
                      value={task.text}
                      onChange={(e) =>
                        handleEditTaskChange(index, e.target.value)
                      }
                      placeholder="Edit task"
                      className="w-[70%] mb-2 p-3 text-lg rounded-md bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-500 transition duration-300"
                    />
                    {editTasks.length === 1 ? (
                      <button
                        onClick={() => addNewTaskToEdit(index)}
                        className="bg-gray-900 text-white text-xl ml-2 p-2 rounded-2xl"
                      >
                        <IoMdAdd />
                      </button>
                    ) : index === editTasks.length - 1 ? (
                      <>
                        <button
                          onClick={() => removeTaskFromEdit(index)}
                          className="bg-gray-900 text-white text-xl ml-4  hover:bg-gray-600 p-2 rounded-2xl"
                        >
                          <FaMinus />
                        </button>
                        <button
                          onClick={() => addNewTaskToEdit(index)}
                          className="bg-gray-900 text-white text-xl ml-2 hover:bg-gray-600 p-2 rounded-2xl"
                        >
                          <IoMdAdd />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => removeTaskFromEdit(index)}
                        className="bg-gray-900 text-white text-xl ml-2  hover:bg-gray-600 p-2 rounded-2xl"
                      >
                        <FaMinus />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={saveEditChanges}
                className={`w-[40%] p-3 rounded-3xl ml-[10%] text-white font-bold text-2xl 
                  ${
                    loading
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-gray-900  hover:bg-gray-600"
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
