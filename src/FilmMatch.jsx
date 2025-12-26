import React, { useEffect, useState } from 'react';
import { Button, Typography, Card } from 'antd';
const { Title } = Typography;
import './GenreSelection.css';

export default function FilmMatch({ movieId }) {
    const [filmMatched, setFilmMatched] = useState(null);

    useEffect(() => {
        const url = `https://api.themoviedb.org/3/movie/${movieId}?language=es-ES`;
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`
            }
        };

        fetch(url, options)
            .then(res => res.json())
            .then(json => setFilmMatched(json))
            .catch(err => console.error(err));
    }, [movieId]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            backgroundImage: 'url("selectedFilmBkg.svg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            gap: '20px'
        }}>
            {filmMatched && (
                <>
                    <Card
                        hoverable
                        style={{
                            width: 300,
                            height: 450,
                            borderRadius: '15px',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                            border: '1px solid #444',
                            backgroundColor: '#1f1f1f',
                            overflow: 'hidden',
                            marginTop: '-10vh'
                        }}
                        styles={{ body: { padding: 0, height: '100%' } }}
                    >
                        <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <img
                                src={filmMatched.poster_path
                                    ? `https://image.tmdb.org/t/p/w500${filmMatched.poster_path}`
                                    : "imageNotFound.png"
                                }
                                alt={filmMatched.title}
                                style={{
                                    width: "100%",
                                    height: "370px",
                                    objectFit: "cover",
                                }}
                            />
                            <div style={{ padding: '15px', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography.Title level={4} style={{ color: 'white', margin: 0 }}>
                                    {filmMatched.title}
                                </Typography.Title>
                            </div>
                        </div>
                    </Card>

                    <Button 
                        type="primary" 
                        size="large"
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px',
                            height: '50px',
                            padding: '0 30px',
                            borderRadius: '12px',
                            background: 'var(--main-gradient)',
                            border: 'none',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                        }}
                        onClick={() => window.location.reload()}
                    >
                        <img src="exitHand.svg" alt="exit" style={{ width: '1.5rem' }} />
                        Salir
                    </Button>
                </>
            )}
        </div>
    );
}