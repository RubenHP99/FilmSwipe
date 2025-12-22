
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';


const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKETIO_SERVER_URL; 

const Prueba = ({ roomId, userId }) => {
    // Usamos el estado para guardar mensajes y mostrarlos en la UI
    const [statusMessages, setStatusMessages] = useState([]);
    
    // Función para añadir mensajes al estado
    const addMessage = (msg) => {
        setStatusMessages(prev => [...prev, msg]);
    };

    useEffect(() => {

        const socket = io(SOCKET_SERVER_URL);
        
        socket.on('connect', () => {
            const connectMsg = `Cliente Socket.io conectado: ${socket.id}`;
            console.log(connectMsg);
            addMessage(connectMsg);
            
            socket.emit('joinRoom', roomId, userId); 
        });

        // 3. Escuchar la confirmación del servidor (solo para este usuario)
        socket.on('message', (msg) => {
            console.log('Mensaje del servidor:', msg);
            addMessage(`Servidor: ${msg}`);
        });

        // 4. Escuchar el anuncio de un nuevo miembro (para todos en la sala)
        socket.on('memberJoined', (data) => {
            console.log('Alerta de la sala:', data.message);
            addMessage(`Sala: ${data.message}`);
        });

        // 5. Manejar la desconexión y errores (¡fundamental!)
        socket.on('disconnect', () => {
            console.log('Cliente desconectado.');
            addMessage('Cliente desconectado.');
        });
        
        socket.on('connect_error', (err) => {
            console.error('Error de conexión:', err.message);
            addMessage(`Error de conexión: ${err.message}`);
        });


        return () => {
            socket.disconnect();
        };

    }, [roomId, userId]);

    return (
        <div>
            <h2>🎬 Movie Matcher - Sala de Pruebas</h2>
            <p>Intentando conectar a sala **{roomId}** como **{userId}**...</p>
            
            <hr />
            
            <h3>Logs de Conexión y Sala:</h3>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {statusMessages.map((msg, index) => (
                    <li key={index} style={{ margin: '5px 0', borderBottom: '1px dotted #ccc', paddingBottom: '5px' }}>
                        {msg}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Prueba;