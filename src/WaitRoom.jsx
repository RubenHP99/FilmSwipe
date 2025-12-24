import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, Card, Space, Badge } from 'antd';
import { UserOutlined, CrownOutlined } from '@ant-design/icons';
const { Title, Text } = Typography;
import GenreSelection from './genreSelection';

export default function WaitRoom({ socket, usernames, isHost, roomId }) {
  const [players, setPlayers] = useState(usernames);
  const [goSelectGenresRoom, setGoSelectGenresRoom] = useState(false);

  useEffect(() => {
    socket.on('updatePlayerList', (currentPlayers) => {
      setPlayers(currentPlayers);
    });

    socket.on('selectGenres', () => {
      setGoSelectGenresRoom(true);
    });

    return () => {
      socket.off('updatePlayerList');
      socket.off('selectGenres');
    };
  }, [socket]);


  if (goSelectGenresRoom) return (<GenreSelection socket={socket} roomId={roomId} />);
  

  const dataSource = players.map((name, index) => ({
    key: index,
    name: name,
  }));

  // 1. Renderizado con justify-content center
  const renderPlayerCell = (playerName) => {
    return (
      <div style={{ 
        padding: '4px 0', 
        display: 'flex', 
        justifyContent: 'center', // CENTRA EL CONTENIDO HORIZONTALMENTE
        alignItems: 'center' 
      }}>
        <Space size="small">
          <UserOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
          <Text strong style={{ fontSize: '16px' }}>{playerName}</Text>
          {players[0] === playerName && (
            <CrownOutlined style={{ color: '#faad14', fontSize: '16px' }} />
          )}
        </Space>
      </div>
    );
  };

  const columns = [
    {
      dataIndex: 'name',
      key: 'name',
      align: 'center', // CENTRA LA CELDA EN LA TABLA
      render: (text) => renderPlayerCell(text),
    },
  ];

  return (
    <div style={{
      padding: '20px',
      maxWidth: '500px',
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Card
        hoverable
        style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      >
        <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
            paddingBottom: '10px'
          }}>
            <Title level={3} style={{ margin: 0 }}>Sala de Espera</Title>
            <Badge
              count={`${players.length} Jugadores`}
              style={{ backgroundColor: '#52c41a' }}
            />
          </div>

          <Table
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            showHeader={false}
            bordered={false}
            size="small"
            locale={{ emptyText: 'Esperando jugadores...' }}
            style={{ width: '100%' }}
          />

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            {isHost ? (
              <Button
                type="primary"
                size="large"
                icon={<CrownOutlined />}
                onClick={() => socket.emit('selectGenres', { roomId })}
                disabled={players.length < 1}
                shape="round"
                style={{ height: '50px', padding: '0 40px', fontSize: '18px' }}
              >
                EMPEZAR PARTIDA
              </Button>
            ) : (
              <div style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px' }}>
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