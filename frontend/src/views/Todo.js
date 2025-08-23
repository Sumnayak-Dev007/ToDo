import {useState, useEffect,useContext} from 'react'
import useAxios from "../utils/useAxios"
import { jwtDecode } from 'jwt-decode'; 
import Swal from 'sweetalert2'


const Todo = () => {
  const api = useAxios()
  const token = localStorage.getItem("authTokens")

  let user_id = null
  let username = null
  try {
    const decoded = jwtDecode(JSON.parse(token).access) // parse correctly
    user_id = decoded.user_id
    console.log(decoded)
    username = decoded.username
  } catch (err) {
    console.error("Invalid or missing token:", err)
  }

  const [todo, setTodos] = useState([])

  useEffect(() => {
    if (user_id) {
      fetchTodos()
    }
  }, [user_id])

  const fetchTodos = async () => {
    try {
      const res = await api.get(`/todo/${user_id}/`) // no need baseUrl, useAxios adds it
      console.log("Fetched todos:", res.data)
      setTodos(res.data)
    } catch (err) {
      console.error("API error:", err.response?.status, err.response?.data)
    }
  }

    const [createTodo, setCreateTodo] = useState({title: "", completed: ""})
    const handleNewTodoTitle = (event) => {
        setCreateTodo({
            ...createTodo,
            [event.target.name]: event.target.value
        })
    }
    
    console.log(createTodo.title);  

    const formSubmit = async () => {
  const formdata = new FormData()
  formdata.append("user", user_id)
  formdata.append("title", createTodo.title)
  formdata.append("completed", false)

  try {
    await api.post(`/todo/${user_id}/`, formdata)
    Swal.fire({
      title: "Todo Added",
      icon: "success",
      toast: true,
      timer: 2000,
      position: "top-right",
      timerProgressBar: true,
    })
    setCreateTodo({ title: "", completed: "" })   // reset input properly

    // instead of relying immediately on fetchTodos (which may 401), 
    // optimistically update UI:
    setTodos((prev) => [...prev, { title: createTodo.title, completed: false, id: Date.now() }])

    // then fetch from API in background (after token refresh if needed)
    setTimeout(() => fetchTodos(), 500)
  } catch (error) {
    console.log(error)
  }
}

    const deleteTodo = async (todo_id) => {
  try {
    await api.delete(`/todo-details/${user_id}/${todo_id}/`)

    Swal.fire({
      title: "Todo Deleted",
      icon: "success",
      toast: true,
      timer: 2000,
      position: "top-right",
      timerProgressBar: true,
    })

    // Optimistic UI update
    setTodos((prev) => prev.filter((t) => t.id !== todo_id))

    // Background fetch after small delay (token refresh safe)
    setTimeout(() => fetchTodos(), 500)
  } catch (err) {
    console.error(err)
  }
}



    const markTodoAsComplete = async (todo_id) => {
  try {
    await api.patch(`/todo-mark-as-completed/${user_id}/${todo_id}/`)

    Swal.fire({
      title: "Todo Completed",
      icon: "success",
      toast: true,
      timer: 2000,
      position: "top-right",
      timerProgressBar: true,
    })

    // Optimistic UI update
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo_id ? { ...t, completed: true } : t
      )
    )

    // Background fetch after small delay
    setTimeout(() => fetchTodos(), 500)
  } catch (err) {
    console.error(err)
  }
}

  return (
    <div>
            <div>
                <div className="container" style={{marginTop:"150px", padding:"10px"}}>
                    <div className="row justify-content-center align-items-center main-row">
                        <div className="col shadow main-col bg-white">
                            <div className="row bg-primary text-white">
                                <div className="col p-2">
                                    <h4>{username.charAt(0).toUpperCase() + username.slice(1)}'s Todo List</h4>
                                </div>
                            </div>
                            <div className="row justify-content-between text-white p-2">
                                <div className="form-group flex-fill mb-2">
                                    <input id="todo-input" name='title' onChange={handleNewTodoTitle} value={createTodo.title} type="text" className="form-control" placeholder='Write a todo...'  />
                                </div>
                                <button type="button" onClick={formSubmit}  className="btn btn-primary mb-2 ml-2"> Add todo </button>
                            </div>
                            <div className="row" id="todo-container">
                                {todo.map((todo) => 
                                
                                <div className="col col-12 p-2 todo-item" key={todo.id}>
                                    <div className="input-group">
                                        {todo.completed.toString() === "true" && 
                                            <p className="form-control"><strike>{todo.title}</strike></p>
                                        }
                                        {todo.completed.toString() === "false" && 
                                            <p className="form-control">{todo.title}</p>
                                        }
                                        <div className="input-group-append">
                                             {todo.completed.toString() === "false" && 
                                            <button className="btn bg-success text-white ml-2" type="button" id="button-addon2 " onClick={() => markTodoAsComplete(todo.id)}><i className='fas fa-check' ></i></button>
                                             }
                                            <button className="btn bg-danger text-white me-2 ms-2 ml-2" type="button" id="button-addon2 " onClick={() => deleteTodo(todo.id)}><i className='fas fa-trash' ></i></button>
                                        </div>
                                    </div>
                                </div>
                                )}
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
  )
}

export default Todo
