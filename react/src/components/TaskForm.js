import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.css';

function TaskForm() {
  const [states, setStates] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    state: '',
    creator: '',
  });

  useEffect(() => {
    getStates();
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
            text: 'Error al obtener la lista de estados'
        });
        console.error('Error al obtener la lista de estados: ', error);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(`${process.env.REACT_APP_BACKEND_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (response.status === 201) {
          setFormData({
            title: '',
            description: '',
            date: '',
            state: '',
            creator: '',
          });
          Swal.fire({
            icon: 'success',
            title: 'Tarea creada exitosamente.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 5000,
          });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: 'Error al crear la tarea'
            });
          console.error('Error al crear la tarea.');
        }
      })
      .catch((error) => {
        Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: 'Error al crear la tarea'
        });
        console.error('Error al crear la tarea: ', error);
      });
  };

  return (
    <Container>
      <div class="mt-3 mb-3">
        <Link to="/" className="">Lista de Tareas</Link>
      </div>
      <h2 className="mt-3">Crear Nueva Tarea</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Título:</Form.Label>
          <Form.Control
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Descripción:</Form.Label>
          <Form.Control
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Fecha:</Form.Label>
          <Form.Control
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Estado:</Form.Label>
          <Form.Control
            as="select"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          >
            <option value="">Selecciona un estado</option>
            {states.map((state) => (
              <option key={state.id} value={state.name}>
                {state.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Creador:</Form.Label>
          <Form.Control
            type="text"
            value={formData.creator}
            onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Crear Tarea
        </Button>
      </Form>
    </Container>
  );
}

export default TaskForm;
