import React, { useState, useEffect, useEffectEvent } from 'react';
import { Table, Button, Typography, Card, Space, Badge } from 'antd';
import { UserOutlined, CrownOutlined } from '@ant-design/icons';
const { Title, Text } = Typography;
import SwipeCard from './SwipeCard';


export default function WaitRoom({socket, usernames, isHost, roomId }) {

  // Cargar lista inicial de jugadores
  const [players, setPlayers] = useState(usernames);

  const [goMatchRoom, setGoMatchRoom] = useState(false);


  useEffect(() => {
    // Suscribirse al evento que envía el servidor para obtener la lista actualizada de jugadores
    socket.on('updatePlayerList', (currentPlayers) => {
      console.log("Lista de jugadores actualizada:", currentPlayers);
      setPlayers(currentPlayers); 
    });

    // Suscripción del evento para comenzar la partida
    socket.on('startGame', () => {
      console.log("PARTIDA EMPEZADA");
      setGoMatchRoom(true);
    });

    return () => { 
      socket.off('updatePlayerList');
      socket.off('startGame'); 
    };
  }, []);


  if(goMatchRoom) return(<SwipeCard/>)


  
  // 1. Construimos el dataSource dinámicamente basado en la cantidad de jugadores
  // Agrupamos de 2 en 2 para mantener las 2 columnas pero sin filas vacías extra
  const dataSource = [];
  for (let i = 0; i < players.length; i += 2) {
    dataSource.push({
      key: i,
      col1: players[i],              // Jugador N
      col2: players[i + 1] || null,  // Jugador N+1 (o null si es impar)
    });
  }

  // 2. Función para renderizar el contenido de cada celda
  const renderPlayerCell = (playerName) => {
    if (!playerName) return null; // Si no hay nombre, no renderizamos nada (quita el hueco)

    return (
      <div style={{ padding: '8px 16px', minHeight: '45px', display: 'flex', alignItems: 'center' }}>
        <Space size="middle">
          <UserOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
          <Text strong style={{ fontSize: '16px' }}>{playerName}</Text>
          {/* Marcamos al host (asumiendo que es el primero de la lista) */}
          {players[0] === playerName && (
            <Badge 
              count={<CrownOutlined style={{ color: '#faad14', fontSize: '16px' }} />} 
              title="Anfitrión"
            />
          )}
        </Space>
      </div>
    );
  };

  // 3. Configuración de columnas (sin títulos)
  const columns = [
    {
      dataIndex: 'col1',
      key: 'col1',
      render: (text) => renderPlayerCell(text),
    },
    {
      dataIndex: 'col2',
      key: 'col2',
      render: (text) => renderPlayerCell(text),
    },
  ];


  return (
    <div style={{ 
      padding: '40px 20px', 
      maxWidth: '700px', 
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center' 
    }}>
      <Card 
        hoverable 
        style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          
          {/* Cabecera de la Sala */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
            paddingBottom: '15px'
          }}>
            <Title level={3} style={{ margin: 0 }}>Sala de Espera</Title>
            <Badge 
              count={`${players.length} Jugadores`} 
              style={{ backgroundColor: '#52c41a', padding: '0 10px' }} 
            />
          </div>

          {/* Tabla de Jugadores dinámica */}
          <Table 
            dataSource={dataSource} 
            columns={columns} 
            pagination={false} 
            showHeader={false} // Quita "Slot A / Slot B"
            bordered={false}   // Quita bordes innecesarios
            locale={{ emptyText: 'Esperando a que entren jugadores...' }}
          />

          {/* Botón de acción */}
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            {isHost ? (
              <Button 
                type="primary" 
                size="large" 
                icon={<CrownOutlined />} 
                onClick={() => socket.emit('startGame', { roomId })}
                disabled={players.length < 2}
                shape="round"
                style={{ height: '50px', padding: '0 40px', fontSize: '18px' }}
              >
                EMPEZAR PARTIDA
              </Button>
            ) : (
              <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                <Text italic type="secondary">
                  Esperando a que el anfitrión inicie la partida...
                </Text>
              </div>
            )}
          </div>

        </Space>
      </Card>
    </div>
  );
}