import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import 'dotenv/config';


const app = express();
const server = createServer(app);

const likedFilmesByRoom = {};

const io = new SocketIOServer(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado:', socket.id);

    // Evento para que un usuario se una a una sala (crear o unirse)
    socket.on('joinRoom', (data, callback) => {

        const {hostFlag, roomId, username} = data;

        const roomExists = io.sockets.adapter.rooms.has(data.roomId);

        // Validacion del host
        if(hostFlag){
            if(!roomExists){
                console.log(`El host ${username} está creando la sala: ${roomId}`);
                likedFilmesByRoom[roomId] = {}; // Crear la sala vacía para guardar las peliculas gustadas por cada jugador
            }else{
                return callback({
                    status: "ERROR",
                    message: "La sala ya existe"
                });
            }
        }else{

            // Validacion del cliente
            if(roomExists){
                console.log(`El usuario ${username} se está uniendo a la sala: ${roomId}`);
            }else{
                return callback({
                    status: "ERROR",
                    message: "La sala no existe"
                });
            }
        }

        // Inicializar la lista de peliculas gustadas por el usuario en la sala
        likedFilmesByRoom[roomId][socket.id] = new Set();

        // Si entra aqui es host y la sala no existe o no es host y existe la sala
        socket.join(roomId);
        socket.roomId = roomId;
        socket.username = username;

        // Obtener información de una sala por ID
        const socketsID = Array.from(io.sockets.adapter.rooms.get(roomId));
        const currentPlayers = socketsID.map(id => {
            const socketData = io.sockets.sockets.get(id);
            return socketData?.username;
        });

        // Enviar a TODOS los jugadores de la sala la lista actualizada.
        io.to(roomId).emit('updatePlayerList', currentPlayers);

        return callback({status: "OK", message: `Conexión a "${roomId}" exitosa!`, usernames: currentPlayers});
    });
    

    // Evento para que todos los jugadores vayan a la pantalla de selección de géneros
    socket.on('selectGenres', (data) => {
        io.to(data.roomId).emit('selectGenres');
    });

    // Evento para recibir las peliculas gustadas por un usuario
    socket.on('filmSelected', (data) => {

        const { movieId, roomId } = data;

        likedFilmesByRoom[roomId][socket.id].add(movieId);

        const totalUsers = Object.keys(likedFilmesByRoom[roomId]).length;

        let matchCount = 0;
        for (const userSocketId in likedFilmesByRoom[roomId]) {
            if (likedFilmesByRoom[roomId][userSocketId].has(movieId)) {
                matchCount++;
            }
        }

        if (matchCount === totalUsers) {
            // Evento para notificar a TODOS los jugadores que ya se ha seleccionado una pelicula en común
            io.to(data.roomId).emit('filmMatched', { movieId });
        }
    });


    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
    });
});


const IP =process.env.VITE_SOCKETIO_SERVER_IP;
const PORT = process.env.VITE_SOCKETIO_SERVER_PORT ||3000;
server.listen(PORT, () => console.log(`🚀 Servidor corriendo en ${IP}:${PORT}`));