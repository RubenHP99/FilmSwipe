import React, { useEffect, useState } from 'react';
import { Button, Input, Card, message, Space, Radio } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import './RoomJoiner.css';
import WaitRoom from './WaitRoom';


export default function RoomJoiner({socket}) {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [hostFlag, setHostFlag] = useState(false);

  // Lista con los usuarios de la partida. Si hay alguno carga la sala de espera
  const [waitRoomPlayers, setWaitRoomPlayers] = useState([]);

  const handleJoinRoom = async() => {
    if (roomId.trim() === '') {
      message.error('Introduce un ID para la sala.');
      return;
    }

    try{
      const response = await socket.emitWithAck('joinRoom', {hostFlag: hostFlag, roomId: roomId, username: username});

      response.status == "OK" ? setWaitRoomPlayers(response.usernames) : message.error(response.message);

    }catch(e){
      console.error(e);
    }

  };

  // Navegar a la pantalla de espera
  if(waitRoomPlayers.length > 0) return(<WaitRoom socket={socket} usernames={waitRoomPlayers} isHost={hostFlag} roomId={roomId}/>);


  return (
    // Contenedor principal para el fondo gris y centrado con Flexbox
    <div className="room-joiner-container"> 
      
      {/* 1. LOGO: Elemento separado arriba */}
      <div className="logo-container-top">
        <img src="/logo.png" alt="Logo de la aplicación" className="app-logo-normal" />
      </div>

      <img src="/logoName.gif" alt="Logo de la aplicación" className="logoName"/>

      {/* 2. TARJETA: Elemento apilado debajo */}
      <Card 
        className="room-card"
      >

        <Space direction="vertical" size="large" style={{ width: '100%' }}> 
          <h2>Introducir nombre de usuario</h2>
          <Input
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            size="large"
          />
        </Space>
        
        <Space direction="vertical" size="large" style={{ width: '100%' }}> 
          <h2>Identificador de la sala</h2>
          <Input
            placeholder="ID de la sala"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            size="large"
          />
        </Space>

        <Radio.Group
          style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px'               
          }}
          value={hostFlag}
          onChange={(e) => setHostFlag(e.target.value)}
          options={[
            { value: true, label: <span style={{ fontSize: '1.5rem', fontWeight: "bold" }}>Crear una sala</span>},
            { value: false, label: <span style={{ fontSize: '1.5rem', fontWeight: "bold" }}>Unirse a una sala</span>},
          ]}
        />

        <Button
          onClick={handleJoinRoom}
          className="gradient-button"
        >
          <img src='okIcon.png' width={"35vw"}/>

          CONFIRMAR
        </Button>

      </Card>
    </div>
  );
}