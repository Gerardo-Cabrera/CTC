import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Container, InputGroup, FormControl, Button, ListGroup, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.css';
import io from 'socket.io-client';

const socket = io.connect(process.env.REACT_APP_BACKEND_URL); 

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [states, setStates] = useState([]);
  const [likes, setLikes] = useState(0);
  const [likeButtonDisabled, setLikeButtonDisabled] = useState(false);
  const [disabledLikeButtons, setDisabledLikeButtons] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);

  useEffect(() => {
    getStates();
    tasksList();

    socket.on('likeUpdated', (data) => {
        const { taskId, count } = data;
        // Actualizar el estado local con los likes actualizados
        setLikes(data.count);
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, likes: count } : task
          )
        );
      });
  
      // Limpieza del efecto al desmontar el componente
      return () => {
        socket.disconnect();
      };
  }, []);

  const getStates = () => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/states`)
    .then((response) => response.json())
    .then((data) => {
        setStates(data);
    })
    .catch((error) => {
        Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: 'Error al obtener los estados'
        });
        console.error('Error al obtener la lista de estados: ', error);
    });
  };

  const tasksList = () => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/tasks`)
    .then((response) => response.json())
    .then((data) => {
        // Para cada tarea, obtener los likes y añadirlos como una propiedad "likes"
        const tasksWithLikes = data.map(async (task) => {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/tasks/${task.id}/likes`);
            const { likes } = await response.json();
            return { ...task, likes };
        });

        // Esperar a que se resuelvan todas las promesas y establecer el estado
        Promise.all(tasksWithLikes).then((tasksWithLikesData) => {
            setTasks(tasksWithLikesData);
            setFilteredTasks(tasksWithLikesData);
        });
    })
    .catch((error) => {
        Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: 'Error al obtener las tareas'
        });
        console.error('Error al obtener las tareas: ', error);
    });
  };

  const handleLike = (taskId) => {
    if (!disabledLikeButtons.has(taskId)) {
        setDisabledLikeButtons((prevSet) => new Set(prevSet.add(taskId)));

        fetch(`${process.env.REACT_APP_BACKEND_URL}/tasks/${taskId}/likes`, {
            method: 'POST',
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Emitir el evento al servidor para notificar sobre el like actualizado
                socket.emit('likeUpdated', { taskId, count: data.count });
                setLikes((prevLikes) => ({...prevLikes, [taskId]: data.count,}));
                const updatedTasks = tasks.map((task) =>
                    task.id === taskId ? { ...task, likes: task.likes + 1 } : task
                );
                setTasks(updatedTasks);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'ERROR',
                    text: 'Error al dar like a la tarea'
                });
                setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                        task.id === taskId ? { ...task, likes: task.likes - 1 } : task
                    )
                );
                setTasks(tasks);
                likeButtonDisabled = false;
                setLikeButtonDisabled(likeButtonDisabled);
            }
        })
        .catch((error) => {
            Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: 'Error al dar like a la tarea'
            });
            console.error('Error al dar like a la tarea: ', error);
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId ? { ...task, likes: task.likes - 1 } : task
                )
            );
            setTasks(tasks);
            likeButtonDisabled = false;
            setLikeButtonDisabled(likeButtonDisabled);
        });
    }
  };

  const handleEdit = (taskId) => {
    Swal.fire({
        title: 'Editar Likes',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off',
        },
        inputValue: tasks.find(task => task.id === taskId).likes.toString(),
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        showLoaderOnConfirm: true,
        preConfirm: (newLikes) => {
            if (/^\d+$/.test(newLikes)) {
                const newLikesInt = parseInt(newLikes, 10);

                return fetch(`${process.env.REACT_APP_BACKEND_URL}/tasks/${taskId}/likes`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ count: newLikesInt }),
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        const updatedTasks = tasks.map((task) =>
                            task.id === taskId ? { ...task, likes: newLikesInt } : task
                        );
                        setTasks(updatedTasks);
                        Swal.fire('¡Actualizado!', 'El número de likes ha sido modificado.', 'success');
                        tasksList();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'ERROR',
                            text: 'Error al editar el conteo de likes'
                        });
                    }
                })
                .catch(error => {
                    console.error('Error al editar el conteo de likes: ', error);
                    Swal.showValidationMessage('Ocurrió un error al actualizar los likes.');
                });
            } else {
                return 'Por favor, ingrese un número entero válido.';
            }
        },
        allowOutsideClick: () => !Swal.isLoading(),
    });
  };

  const handleDelete = (taskId) => {
    const taskToDelete = tasks.find((task) => task.id === taskId);

    if (taskToDelete.likes == 0 || taskToDelete.likes == null) {
        Swal.fire({
            title: '¿Estás seguro de eliminar esta tarea?',
            text: 'Esta acción no se puede revertir.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.REACT_APP_BACKEND_URL}/tasks/${taskId}`, {
                    method: 'DELETE',
                })
                .then((response) => {
                if (response.status === 200) {
                    const updatedTasks = tasks.filter((task) => task.id !== taskId);
                    setTasks(updatedTasks);
                    Swal.fire({
                        icon: 'success',
                        title: 'MENSAJE',
                        text: response.message
                    });
                    tasksList();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'ERROR',
                        text: 'Error al eliminar la tarea'
                    });
                }
                })
                .catch((error) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'ERROR',
                        text: 'Error al eliminar la tarea'
                    });
                    console.error('Error al eliminar la tarea: ', error);
                });
            }
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: 'No se puede eliminar una tarea con likes'
        });
    }
  };

  const handleSearch = async () => {    
    let taskName = searchTerm;

    try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/tasks/by-name?title=${taskName}`);

        if (response.ok) {
            const tasks = await response.json();
            // Actualizar el estado con las tareas filtradas por el término de búsqueda
            const tasksWithLikes = await Promise.all(tasks.map(async (task) => {
                const likesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/tasks/${task.id}/likes`);
                const { likes } = await likesResponse.json();
                return { ...task, likes };
            }));
            setFilteredTasks(tasksWithLikes);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: 'Error al eliminar la tarea'
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: 'Error al buscar la tarea'
        });
        console.error('Error al buscar la tarea: ', error);
    }
  };

  const handleFilter = async (state) => {
    try {
        let endpoint = `${process.env.REACT_APP_BACKEND_URL}/tasks`;

        if (state !== 'todos') {
            endpoint += `/by-state?state=${state}`;
        }

        const response = await fetch(endpoint);

        if (response.ok) {
            const tasks = await response.json();
            const tasksWithLikes = await Promise.all(tasks.map(async (task) => {
                const likesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/tasks/${task.id}/likes`);
                const { likes } = await likesResponse.json();
                return { ...task, likes };
            }));
            setFilteredTasks(tasksWithLikes);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: 'Error al obtener las tareas'
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: 'Error al obtener las tareas'
        });
        console.error('Error al obtener las tareas: ', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === 'Backspace') {
      if (searchTerm === '' || searchTerm.trim() === '') {
        setFilteredTasks(tasks);
      }
    }
  };

  return (
    <Container className="mt-3">
      <div class="mb-3">
        <Link to="/crear-tarea" className="btn btn-success">Crear Tarea</Link>
      </div>
      <h1>Lista de Tareas</h1>
      <InputGroup className="mb-3">
        <FormControl 
          id="buscar"
          ref={searchInputRef}
          placeholder="Buscar por título" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
        />
        <Button variant="outline-secondary" onClick={handleSearch}>Buscar</Button>
      </InputGroup>
      <div className="mb-3">
        <Dropdown>
          <Dropdown.Toggle variant="primary">
            Filtrar por Estado
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleFilter('todos')}>Mostrar Todos</Dropdown.Item>
                {states.map((state) => (
                    <Dropdown.Item key={state.id} onClick={() => handleFilter(state.name)}>
                        {state.name}
                    </Dropdown.Item>
                ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <ListGroup>
        {filteredTasks.map((task) => (
          <ListGroup.Item key={task.id} class="mt-3">
            <h3>{task.title}</h3>
            <p><b>Descripción:</b> {task.description}</p>
            <p><b>Fecha:</b> {task.date}</p>
            <p><b>Estado:</b> {task.state}</p>
            <p><b>Creador:</b> {task.creator}</p>
            {likes[task.id] !== undefined ? (
                <p><b>Likes:</b> {likes[task.id]}</p>
            ) : (
                <p><b>Likes:</b> {task.likes}</p>
            )}
            <Button variant="success" className="me-2" onClick={() => handleLike(task.id)} disabled={disabledLikeButtons.has(task.id)}>Like</Button>
            <Button variant="warning" className="me-2" onClick={() => handleEdit(task.id)}>Editar</Button>
            <Button variant="danger" onClick={() => handleDelete(task.id)}>Eliminar</Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
}

export default TaskList;
