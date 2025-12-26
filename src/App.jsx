import { useState, useEffect } from 'react'
import './App.css'
import io from 'socket.io-client';
import RoomJoiner from './RoomJoiner';


// const SOCKET_SERVER_URL = `${import.meta.env.VITE_SOCKETIO_SERVER_IP}:${import.meta.env.VITE_SOCKETIO_SERVER_PORT}`; 
const SOCKET_SERVER_URL = `${import.meta.env.VITE_SOCKETIO_SERVER_IP}`; 

function App() {

    const [socket, setSocket] = useState(null);
  
    // UseEffect para la conexion general al server de SocketIO y la suscripcion a los eventos 
    useEffect(() => {
      const socket = io(SOCKET_SERVER_URL);
      setSocket(socket);
  
      // Evento que se suscribe para conectarse al servidor
      socket.on('connect', () => {
          console.log(`Cliente Socket.io conectado: ${socket.id}`);
      });
  
      return () => {
        // Desuscribirse de todos los eventos
        socket.off();
        // Cierra la conexión cuando el componente se desmonta (al salir de la app)
        socket.disconnect();
      };
  
    },[])

  return (
    <>
      <RoomJoiner socket={socket}/>
    </>
  )
}

export default App
