import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { app } from "../firebase";

const db = getFirestore(app);
const auth = getAuth(app);

export const addListToFirebase = createAsyncThunk(
  "Todos/addListToFirebase",
  async ({ list, userId }, { rejectWithValue }) => {
    try {
      const listWithUserId = { ...list, userId };
      if (!listWithUserId.title || !listWithUserId.todos) {
        throw new Error("Title and todos are required.");
      }

      const docRef = await addDoc(collection(db, "Todos"), listWithUserId);
      return { ...listWithUserId, id: docRef.id };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const deleteListFromFirebase = createAsyncThunk(
  "Todos/deleteListFromFirebase",
  async (listId, { rejectWithValue }) => {
    try {
      const docRef = doc(db, "Todos", listId);
      await deleteDoc(docRef); 
      return { listId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const fetchListsFromFirebase = createAsyncThunk(
  "Todos/fetchListsFromFirebase",
  async (userId, { rejectWithValue }) => {
    try {
      const userQuery = query(
        collection(db, "Todos"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(userQuery);
      const lists = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      return { lists }; 
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const deleteTaskFromFirebase = createAsyncThunk(
  "Todos/deleteTaskFromFirebase",
  async ({ listId, taskId }, { rejectWithValue }) => {
    try {
      const docRef = doc(db, "Todos", listId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentTodos = docSnap.data().todos || [];

        const updatedTodos = currentTodos.filter((todo) => todo.id !== taskId);

        await updateDoc(docRef, { todos: updatedTodos });
        return { listId, taskId };
      } else {
        throw new Error("List document does not exist.");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);



export const updateListInFirebase = createAsyncThunk(
  "Todos/updateListInFirebase",
  async ({ listId, updatedList }, { rejectWithValue }) => {
    try {
      const docRef = doc(db, "Todos", listId);
      await updateDoc(docRef, updatedList);

      return { listId, updatedList };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      if (!email || !password) {
        throw new Error("Email and password are required.");
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      return { uid: user.uid, email: user.email };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// User Logout
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          lastLogout: Timestamp.now(),
        });
      }

      await signOut(auth);
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  lists: [],
  user: null, 
  error: null,
};

const listsSlice = createSlice({
  name: "lists",
  initialState,
  reducers: {
    addList: (state, actions) => {
      state.lists.push(actions.payload);
    },
    setUser: (state, action) => {
      state.user = action.payload; 
    },
    logOut: (state) => {
      state.user = null;
      localStorage.removeItem("uid"); 
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        console.log("action:::", action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteListFromFirebase.fulfilled, (state, action) => {
        const { listId } = action.payload;
        state.lists = state.lists.filter((list) => list.id !== listId); 
      })
      .addCase(deleteListFromFirebase.rejected, (state, action) => {
        state.error = action.payload; 
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null; 
        state.lists = [];
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(addListToFirebase.fulfilled, (state, action) => {
        state.lists.push(action.payload);
        state.error = null;
      })
      .addCase(addListToFirebase.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchListsFromFirebase.fulfilled, (state, action) => {
        state.lists = action.payload.lists;
        state.error = null;
      })
      .addCase(fetchListsFromFirebase.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteTaskFromFirebase.fulfilled, (state, action) => {
        const { listId, taskId } = action.payload;
        const list = state.lists.find((list) => list.id === listId);
        if (list && list.todos) {
          list.todos = list.todos.filter((todo) => todo.id !== taskId);
        }
      })
      .addCase(deleteTaskFromFirebase.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateListInFirebase.fulfilled, (state, action) => {
        const { listId, updatedList } = action.payload;
        const listIndex = state.lists.findIndex((list) => list.id === listId);
        if (listIndex !== -1) {
          state.lists[listIndex] = {
            ...state.lists[listIndex],
            ...updatedList,
          };
        }
      })
      .addCase(updateListInFirebase.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { addList, logOut, setUser } = listsSlice.actions;

export default listsSlice.reducer;
