import React, { useEffect, useState } from 'react';
import { Button, Typography, message, Space } from 'antd';
const { Title, Text } = Typography;
import './GenreSelection.css';
import FilmSelection from './FilmSelection.jsx'


const genreIcons = {
    28: "🔥", 12: "🤠", 16: "🎨", 35: "😂", 80: "🕵️", 99: "📹", 
    18: "🎭", 10751: "👪", 14: "🦄", 36: "📜", 27: "👻", 10402: "🎵", 
    9648: "🔍", 10749: "💖", 878: "🚀", 10770: "📺", 53: "🔪", 
    10752: "🪖", 37: "🌵",
};

export default function GenreSelection({ socket }) {
    const [genreList, setGenreList] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [goFilmMatchRoom, setGoFilmMatchRoom] = useState(false);

    useEffect(() => {
        const url = 'https://api.themoviedb.org/3/genre/movie/list?language=es';
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`
            }
        };

        fetch(url, options)
            .then(res => res.json())
            .then(json => setGenreList(json.genres))
            .catch(err => console.error(err));
    }, []);

    const toggleGenre = (genreId) => {
        if (selectedGenres.includes(genreId)) {
            setSelectedGenres(selectedGenres.filter(id => id !== genreId));
        } else {
            if (selectedGenres.length >= 5) {
                message.warning('Solo puedes seleccionar un máximo de 5 géneros');
                return;
            }
            setSelectedGenres([...selectedGenres, genreId]);
        }
    };

    const handleConfirm = async() => {
        if (selectedGenres.length === 0) {
            message.error('Selecciona al menos un género para continuar');
            return;
        }

        setGoFilmMatchRoom(true);
        console.log("Géneros seleccionados:", selectedGenres);
    };

    if(goFilmMatchRoom) return(<FilmSelection socket={socket} selectedGenres={selectedGenres}/>);

    return (
        <div className="genre-selection-container" style={{ padding: '40px 20px', textAlign: 'center' }}>
            
            <Space orientation="vertical" style={{ marginBottom: '30px' }}>
                <Title level={2} style={{ color: 'white', margin: 0 }}>Selecciona tus favoritos</Title>
                <Text style={{ color: '#aaa', fontSize: '1.2rem' }}>
                    Máximo 5 géneros ({selectedGenres.length}/5)
                </Text>
            </Space>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxWidth: '450px',
                margin: '0 auto 40px auto'
            }}>
                {genreList.map((genre) => {
                    const isSelected = selectedGenres.includes(genre.id);
                    const icon = genreIcons[genre.id] || "🎬";

                    return (
                        <button
                            key={genre.id}
                            onClick={() => toggleGenre(genre.id)}
                            className="genre-list-item"
                            style={{
                                // Aplicamos el gradiente al borde usando las variables de CSS
                                backgroundImage: isSelected 
                                    ? `linear-gradient(rgba(255,255,255,0.05), rgba(255,255,255,0.05)), var(--main-gradient)` 
                                    : 'none',
                                opacity: isSelected ? 1 : 0.8
                            }}
                        >
                            <span style={{ fontSize: '1.5rem', marginRight: '15px' }}>{icon}</span>
                            <span style={{ flex: 1, fontSize: '1.1rem', fontWeight: 600 }}>{genre.name}</span>
                            
                            {/* Círculo de selección con tus colores de gradiente */}
                            <div style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '50%',
                                border: isSelected ? 'none' : '2px solid #444',
                                background: isSelected ? 'var(--main-gradient)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}>
                                {isSelected && <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Mantengo tu botón de confirmar original */}
            <div style={{ position: 'sticky', bottom: '20px' }}>
                <Button 
                    className="gradient-button" 
                    onClick={handleConfirm}
                    style={{ 
                        padding: '0 40px', 
                    }}
                >
                    <img src='okIcon.png' style={{ width: '30px' }}/>
                    CONFIRMAR
                </Button>
            </div>
        </div>
    );
}