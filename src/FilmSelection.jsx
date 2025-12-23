import React, { useEffect, useState } from 'react';
import TinderCard from 'react-tinder-card';
import { Card, Typography, Select } from 'antd';

export default function FilmSelection({ socket, selectedGenres }) {
    const [filmsList, setFilmsList] = useState([]);
    const [actualPage, setActualPage] = useState(1);

    // Filtro para ordenar las peliculas
    const [filter, setFilter] = useState("vote_count.desc");

    function getFilmsResults(actualPage_, filter_) {
        const date = new Date();
        const url = `https://api.themoviedb.org/3/discover/movie?include_adult=true&include_video=false&language=es-ES&page=${actualPage_}&sort_by=${filter_}&with_genres=${selectedGenres.join("%20OR%20")}&with_original_language=en&primary_release_date.lte=${date.toISOString().split("T")[0]}`;

        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`
            }
        };
    
        fetch(url, options)
            .then(res => res.json())
            .then(json => {
                setFilmsList(json.results);
                console.log(json.results);
            })
            .catch(err => console.error(err));
    }

    // Si hay menos de 2 peliculas en la lista, se cargan nuevas
    useEffect(() => {
        if (filmsList.length < 2){
            console.log("POCAS");
            // Pasarlo a una variable local primero para incrementar la variable (ya que no se actualiza al momento)
            const updatedActualPage = actualPage + 1;
            getFilmsResults(updatedActualPage, filter);
            setActualPage(updatedActualPage);
        }
    }, [filmsList.length]);

    const onSwipe = (direction, movieTitle) => {
        console.log('Has deslizado: ' + direction + " " + movieTitle);
        // Eliminamos la primera pelicula de la lista para que la siguiente suba
        setFilmsList(prev => prev.slice(1));
    };

    const onCardLeftScreen = (myIdentifier) => {
        console.log(myIdentifier + ' ha salido de la pantalla');
    };

    // Cuando cambia el select, busca nuevas peliculas con la configuracion,
    // Se pasa por parametro porque el set no es inmediato
    const handleSelectChange = (value) => {
        setFilter(value);
        getFilmsResults(actualPage, value);
    };


    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
        }}>


        <Select
            defaultValue={filter}
            style={{
                width: "70%",
                color: "white",
                fontWeight: "bold",  
                backgroundColor: "#1a1a1a",
                // marginBottom: "10%",
                // marginTop: "-20%"
            }}


            onChange={handleSelectChange}
            options={[
                { value: "original_title.asc", label: "original_title.asc" },
                { value: "original_title.desc", label: "original_title.desc" },

                { value: "popularity.asc", label: "popularity.asc" },
                { value: "popularity.desc", label: "popularity.desc" },

                { value: "revenue.asc", label: "revenue.asc" },
                { value: "revenue.desc", label: "revenue.desc" },

                { value: "primary_release_date.asc", label: "primary_release_date.asc" },
                { value: "primary_release_date.desc", label: "primary_release_date.desc" },

                { value: "title.asc", label: "title.asc" },
                { value: "title.desc", label: "title.desc" },

                { value: "vote_average.asc", label: "vote_average.asc" },
                { value: "vote_average.desc", label: "vote_average.desc" },

                { value: "vote_count.asc", label: "vote_count.asc" },
                { value: "vote_count.desc", label: "vote_count.desc" },
            ]}
            size="large"
        />



            {/* CONTENEDOR DE LA PILA: Debe ser relativo y tener el tamaño de la carta */}
            <div style={{ position: 'relative', width: 300, height: 450 }}>
                
                {/* Mapear el array al revés para que la primera película quede arriba visualmente */}
                {filmsList.map((film, index) => {
                    // Solo renderizamos las 3 o 4 primeras para no saturar el navegador
                    const actualIndex = filmsList.indexOf(film);
                    if (actualIndex > 3) return null;

                    return (
                        <TinderCard 
                            key={film.id} 
                            onSwipe={(dir) => onSwipe(dir, film.title)} 
                            onCardLeftScreen={() => onCardLeftScreen(film.title)} 
                            preventSwipe={['up', 'down']}

                        >
                            <Card
                                hoverable
                                style={{
                                    width: 300,
                                    height: 450,
                                    borderRadius: '15px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                    border: '1px solid #333',
                                    backgroundColor: '#1f1f1f',
                                    userSelect: 'none' // Evita seleccionar texto al arrastrar
                                }}
                            >
                                <div style={{ textAlign: 'center', width: '100%' }}>
                                    <img
                                        src={film.poster_path
                                            ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
                                            : "imageNotFound.png"
                                        }
                                        alt={film.title}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            borderRadius: "20px",
                                            padding: "5%",
                                            boxSizing: "border-box",
                                            pointerEvents: 'none' // Evita que la imagen interfiera con el swipe
                                        }}
                                    />
                                    <Typography.Title level={4} style={{ color: 'white', marginTop: 'auto' }}>
                                        {film.title}
                                    </Typography.Title>
                                </div>
                            </Card>
                        </TinderCard>
                    );
                })}
            </div>
        </div>
    );
}