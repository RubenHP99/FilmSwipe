import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Input, Spin, List, Card, message } from 'antd';
import { CheckOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import './swipeCard.css';

// --- DATOS FICTICIOS (MOCK) PARA PRUEBAS SIN API ---
// Se han eliminado las referencias a la clave API y la URL de OMDb.
// Esta lista simula los datos que vendrían de una API real.
const MOCK_MOVIE_DATA = [
    {
        id: "tt0816692",
        title: "Interstellar",
        year: "2014",
        genre: "Adventure, Drama, Sci-Fi",
        description: "Un equipo de exploradores utiliza un agujero de gusano recién descubierto para superar las limitaciones del viaje espacial humano. La gravedad es el verdadero enemigo.",
        imageUrl: "https://placehold.co/400x600/374151/FFFFFF?text=Interstellar"
    },
    {
        id: "tt0111161",
        title: "The Shawshank Redemption",
        year: "1994",
        genre: "Drama",
        description: "Dos hombres encarcelados se unen a lo largo de varios años, encontrando consuelo y eventual redención a través de actos de decencia común.",
        imageUrl: "https://placehold.co/400x600/374151/FFFFFF?text=Shawshank+Redemption"
    },
    {
        id: "tt0068646",
        title: "The Godfather",
        year: "1972",
        genre: "Crime, Drama",
        description: "El patriarca envejecido de una dinastía de crimen organizado transfiere el control de su imperio clandestino a su reacio hijo.",
        imageUrl: "https://placehold.co/400x600/374151/FFFFFF?text=The+Godfather"
    },
    {
        id: "tt0133093",
        title: "The Matrix",
        year: "1999",
        genre: "Action, Sci-Fi",
        description: "Un programador informático descubre que toda su vida es una elaborada simulación y se une a una rebelión contra sus creadores robóticos.",
        imageUrl: "https://placehold.co/400x600/374151/FFFFFF?text=The+Matrix"
    },
    {
        id: "tt0468569",
        title: "The Dark Knight",
        year: "2008",
        genre: "Action, Crime, Drama",
        description: "Cuando la amenaza conocida como el Guasón comienza a causar estragos, Batman debe aceptar una de las pruebas psicológicas y físicas más grandes para luchar contra la injusticia.",
        imageUrl: "https://placehold.co/400x600/374151/FFFFFF?text=The+Dark+Knight"
    },
].reverse(); // Invertir para que 'Interstellar' sea la primera tarjeta en el tope de la pila.


// --- CONSTANTES DE SWIPE ---
const THRESHOLD = 100; // Distancia mínima de arrastre para confirmar el swipe
const ROTATION_FACTOR = 0.05; // Factor para la rotación de la tarjeta durante el arrastre
const SWIPE_OUT_DURATION = 500; // Duración de la animación de salida (en ms)



// Componente principal de la aplicación de swipe
const SwipeCard = () => {
    // --- ESTADO ---
    const [movieData, setMovieData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDragging, setIsDragging] = useState(false);

    // Referencias para el control del DOM
    const topCardRef = useRef(null);
    const dragState = useRef({ startX: 0, currentX: 0 });

    // --- LÓGICA DE CARGA (MOCK) ---

    /**
     * Carga la lista inicial de películas usando DATOS FICTICIOS (MOCK).
     * Simula la carga de una API sin realizar una llamada de red.
     */
    const fetchInitialMovies = useCallback(async () => {
        setLoading(true);

        try {
            // Simular un tiempo de carga de la API para que el indicador de carga sea visible
            await new Promise(resolve => setTimeout(resolve, 500));

            // Usar la lista de datos ficticios
            const validMovies = MOCK_MOVIE_DATA;

            if (validMovies.length > 0) {
                // Se utiliza una copia fresca de los datos mock para permitir recargar
                setMovieData([...MOCK_MOVIE_DATA]);
                message.success('Lista de películas MOCK cargada. ¡Empieza a deslizar!');
            } else {
                message.error('No se pudieron cargar las películas MOCK.');
            }
        } catch (error) {
            console.error("Error al cargar la lista inicial de mock data:", error);
            message.error('Ocurrió un error al iniciar la aplicación.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Cargar películas al montar el componente
    useEffect(() => {
        fetchInitialMovies();
    }, [fetchInitialMovies]);


    // --- LÓGICA DE SWIPE ---

    /**
     * Realiza la acción de swipe de una tarjeta (like o nope) con animación.
     */
    const swipeCard = useCallback((direction) => {
        const card = topCardRef.current;
        if (!card) return;

        setLoading(true); // Bloquea los eventos mientras la tarjeta sale

        // 1. Aplicar animación de salida
        card.style.transition = 'transform 0.5s ease-out, opacity 0.4s ease-out';

        // Calcular la traslación y rotación para que salga de la pantalla
        const xTranslation = direction === 'right' ? window.innerWidth * 1.5 : window.innerWidth * -1.5;
        const rotation = direction === 'right' ? 30 : -30;

        card.style.transform = `translate(${xTranslation}px, 0) rotate(${rotation}deg)`;
        card.style.opacity = '0';

        // 2. Transicionar a la siguiente tarjeta
        setTimeout(() => {
            // Actualizar el estado: eliminar la tarjeta superior (última del array)
            setMovieData(prevData => prevData.slice(0, prevData.length - 1));
            setLoading(false);

            if (direction === 'right') {
                message.success(`¡Me gusta!`);
            } else {
                message.info(`No pasa nada.`);
            }

        }, SWIPE_OUT_DURATION);
    }, []);

    // Manejador de botones para swipe (LIKE/NOPE)
    const handleButtonClick = useCallback((direction) => {
        if (!topCardRef.current || loading) return;
        swipeCard(direction);
    }, [loading, swipeCard]);

    // --- LÓGICA DE ARRASTRE (DRAG) ---

    // Función auxiliar para obtener coordenadas de mouse o toque
    const getCoords = (e) => {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    };

    // 1. INICIO DEL ARRASTRE
    const handleDragStart = useCallback((e) => {
        if (loading) return;
        if (e.type === 'touchstart') e.preventDefault();
        if (e.type === 'mousedown' && e.button !== 0) return;

        const coords = getCoords(e);
        dragState.current.startX = coords.x;
        dragState.current.currentX = 0;

        const card = topCardRef.current;
        if (card) {
            card.style.transition = 'none'; // Desactivar la transición CSS
            setIsDragging(true);
        }
    }, [loading]);

    // 2. ARRASTRE ACTIVO
    const handleDragMove = useCallback((e) => {
        if (!isDragging) return;

        const coords = getCoords(e);
        dragState.current.currentX = coords.x - dragState.current.startX;
        const currentX = dragState.current.currentX;
        const card = topCardRef.current;

        if (card) {
            const rotation = currentX * ROTATION_FACTOR;
            const labelOpacity = Math.min(Math.abs(currentX) / (THRESHOLD / 2), 1);

            card.style.transform = `translate(${currentX}px, 0) rotate(${rotation}deg)`;

            // Mostrar etiquetas LIKE/NOPE
            const likeLabel = card.querySelector('.label.like');
            const nopeLabel = card.querySelector('.label.nope');

            if (currentX > 0) {
                likeLabel.style.opacity = labelOpacity;
                nopeLabel.style.opacity = 0;
            } else if (currentX < 0) {
                nopeLabel.style.opacity = labelOpacity;
                likeLabel.style.opacity = 0;
            }
        }
    }, [isDragging]);

    // 3. FIN DEL ARRASTRE
    const handleDragEnd = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);

        const currentX = dragState.current.currentX;
        const card = topCardRef.current;

        if (card) {
            // Re-activar la transición para el snap-back
            card.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

            // Ocultar etiquetas
            card.querySelector('.label.like').style.opacity = 0;
            card.querySelector('.label.nope').style.opacity = 0;

            if (currentX > THRESHOLD) {
                swipeCard('right'); // Swipe a la derecha confirmado
            } else if (currentX < -THRESHOLD) {
                swipeCard('left'); // Swipe a la izquierda confirmado
            } else {
                // Snap back a la posición central
                card.style.transform = 'translate(0, 0) rotate(0deg)';
            }
        }
    }, [isDragging, swipeCard]);

    // Configuración de listeners globales para el arrastre
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('mouseup', handleDragEnd);
            document.addEventListener('touchmove', handleDragMove, { passive: false });
            document.addEventListener('touchend', handleDragEnd);
        } else {
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchmove', handleDragMove, { passive: false });
            document.removeEventListener('touchend', handleDragEnd);
        }
        return () => {
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchmove', handleDragMove, { passive: false });
            document.removeEventListener('touchend', handleDragEnd);
        };
    }, [isDragging, handleDragMove, handleDragEnd]);


    // --- RENDERIZADO DE COMPONENTES ---

    const renderMovieCard = (movie, index) => {
        // La tarjeta superior es la última del array (mayor índice)
        const isTopCard = index === movieData.length - 1;

        // Asignar eventos de arrastre y la referencia solo a la tarjeta superior
        const cardProps = isTopCard ? {
            ref: topCardRef,
            onMouseDown: handleDragStart,
            onTouchStart: handleDragStart
        } : {};

        return (
            <div
                key={movie.id + index}
                className="movie-card"
                data-movie-id={movie.id}
                style={{
                    // Efecto de stack: la tarjeta inferior es más pequeña y se mueve ligeramente
                    transform: `scale(${0.9 + (index * 0.1 / MOCK_MOVIE_DATA.length)}) translate(0, ${index * -5}px)`,
                    zIndex: index + 1,
                    // Pequeña opacidad para las tarjetas inferiores
                    opacity: isTopCard ? 1 : 0.8,
                    // Posicionamiento de la pila
                    top: index * 5 + 'px',
                }}
                {...cardProps}
            >
                {/* Etiquetas LIKE/NOPE visibles solo en la tarjeta superior */}
                {isTopCard && (
                    <>
                        <div className="label nope">NOPE</div>
                        <div className="label like">¡ME GUSTA!</div>
                    </>
                )}

                {/* Imagen del Póster */}
                <img
                    src={movie.imageUrl}
                    alt={movie.title}
                    className="card-image"
                    // Fallback de imagen en caso de error de carga
                    onError={(e) => {e.currentTarget.onerror = null; e.currentTarget.src='https://placehold.co/400x600/1f2937/a0a0a0?text=Imagen+No+Disp.';}}
                />

                {/* Contenido */}
                <div className="card-content">
                    <h2>{movie.title} ({movie.year})</h2>
                    <p className="genre">{movie.genre}</p>
                    <p>{movie.description}</p>
                </div>
            </div>
        );
    };

    const hasCards = movieData.length > 0;

    return (
        <div className="app-container">
            {/* Insertar estilos globales */}
            <h1 className="title">Cinéfilo GO (Modo MOCK)</h1>

            {/* INDICADOR DE CARGA */}
            {loading && movieData.length === 0 && (
                <div className="loading-indicator">
                    <Spin size="large" style={{ color: '#6366f1' }} />
                    <p className="loading-text">Simulando carga de películas...</p>
                </div>
            )}

            {/* Contenedor de las tarjetas de SWIPE */}
            <div id="card-stack">

                {/* Mensaje de fin de tarjetas */}
                {!hasCards && !loading && (
                    <div className="movie-card" style={{ cursor: 'default', opacity: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                         <div style={{ padding: '24px', textAlign: 'center' }}>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6366f1', margin: '0 0 1rem 0' }}>¡Lista agotada!</p>
                            <p style={{ fontSize: '1rem', color: '#a0a0a0' }}>Has revisado todas las tarjetas MOCK.</p>
                            <Button
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={fetchInitialMovies}
                                style={{ marginTop: '1rem', backgroundColor: '#6366f1', borderColor: '#6366f1' }}
                            >
                                Recargar Cartas MOCK
                            </Button>
                         </div>
                    </div>
                )}

                {/* Renderizar tarjetas */}
                {movieData.map((movie, index) => renderMovieCard(movie, index))}

            </div>

            {/* Contenedor de botones de acción */}
            {hasCards && (
                <div className="action-buttons-container">
                    {/* Botón de NOPE (Izquierda) */}
                    <Button
                        onClick={() => handleButtonClick('left')}
                        disabled={loading}
                        className="action-button nope"
                    >
                        <CloseOutlined />
                    </Button>
                    {/* Botón de LIKE (Derecha) */}
                    <Button
                        onClick={() => handleButtonClick('right')}
                        disabled={loading}
                        className="action-button like"
                    >
                        <CheckOutlined />
                    </Button>
                </div>
            )}
        </div>
    );
};

// Exportar el componente principal
export default SwipeCard;