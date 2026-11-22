# Memoria Libre · Historia del Perú

Juego educativo web para aprender la historia del Perú. El jugador recorre un mundo ilustrado, avanza por momentos históricos y responde preguntas para "recuperar la memoria".

Proyecto del equipo **3for** (hackathon HackFlow, categoría Educación).

## Contenido

El juego se organiza en bloques temáticos de 10 momentos cada uno:

1. La Independencia del Perú (1780 – 1826)
2. Los Incas y el Tahuantinsuyo (siglos XIII – XVI)
3. Conquista y Virreinato (1532 – 1821)
4. República

## Cómo ejecutarlo

Es un sitio estático (HTML, CSS y JavaScript puro), sin dependencias ni build.

- Abre `index.html` directamente en el navegador, o
- sirve la carpeta con cualquier servidor estático:

```bash
npx serve .
```

## Estructura

```
index.html        Página principal y pantallas del juego
css/style.css     Estilos
js/app.js         Lógica del juego y navegación
js/data.js        Contenido histórico (bloques, momentos, preguntas)
js/scene.js       Escena y mundo animado
js/sprites.js     Sprites y personajes
```

## Despliegue

Compatible con Vercel u otro hosting estático: no requiere configuración, solo publicar la carpeta raíz.
