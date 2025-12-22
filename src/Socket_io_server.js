import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';


const app = express();
const server = createServer(app);

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


        // Si entra aqui es host y la sala no existe o no es host y existe la sala
        socket.join(roomId);
        socket.roomId = roomId;
        socket.username = username;

        // Obtener información de una sala por ID
        const socketsID = Array.from(io.sockets.adapter.rooms.get(roomId));
        // console.log(`***JUGADORES DE LA SALA ${roomId}***`);
        // for (const id of socketsID) {
        //     const socketData = io.sockets.sockets.get(id);
        //     console.log("Socket username: ", socketData.username);
        // }

        const currentPlayers = socketsID.map(id => {
            const socketData = io.sockets.sockets.get(id);
            return socketData?.username;
        });

        // Enviar a TODOS los jugadores de la sala la lista actualizada.
        io.to(roomId).emit('updatePlayerList', currentPlayers);

        return callback({status: "OK", message: `Conexión a "${roomId}" exitosa!`, usernames: currentPlayers});
    });
    

    // Evento para que todos los jugadores cambien la pantalla y comience la eleccion de la pelicula
    socket.on('startGame', (data) => {
        io.to(data.roomId).emit('startGame');
    });


    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
    });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));