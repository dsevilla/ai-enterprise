# IA + empresa · presentación 3D local

Presentación navegable en ocho escenas sobre la integración de IA con sistemas empresariales. Las oficinas, personas, estanterías, paneles y conexiones se construyen con Three.js; son metáforas visuales de casos de uso, no pantallas de una solución ya instalada.

## Abrir el HTML final

El archivo [dist/index.html](dist/index.html) es autónomo: incorpora Three.js, estilos y tipografía. Se puede abrir directamente en un navegador compatible con WebGL 2 o servir como página estática. No necesita conexión ni archivos vecinos. Para regenerarlo:

```sh
npm ci --no-audit --no-fund
npm run build
```

## GitHub Pages

El workflow [.github/workflows/pages.yml](.github/workflows/pages.yml) publica la carpeta `dist/` en GitHub Pages en cada push a `main` que la modifique. El HTML de `dist/` se versiona en el repo, así que hay que ejecutar `npm run build` y commitearlo antes de hacer push. La primera vez, en el repositorio: **Settings → Pages → Build and deployment → Source: GitHub Actions**. La página queda en `https://dsevilla.github.io/ai-enterprise/`.

En desarrollo, `npm start` sirve esta carpeta en `http://localhost:8006/`. Esa versión necesita `node_modules/`; el HTML de `dist/` no.

Avanza con **Siguiente**, `Espacio`, `→` o `PageDown`; retrocede con **Anterior**, `←` o `PageUp`. Los enlaces `#vision`, `#desconexion`, `#puente`, `#conocimiento`, `#comercial`, `#direccion`, `#operaciones` y `#cierre` abren cada escena. Al cambiar entre oficina y almacén se aplica un fundido. El movimiento reducido del sistema elimina el fundido, la transición larga de cámara y el movimiento ambiental.

## Recorrido

1. **Propuesta:** adaptar sistemas existentes para integrar IA en el trabajo diario.
2. **Desconexión:** la IA genérica no conoce el catálogo, los datos ni las políticas internas.
3. **Puente:** una capa de integración une lenguaje natural, fuentes autorizadas y modelos.
4. **Conocimiento:** consultar legislación vigente y políticas internas mediante recuperación de documentos con fuentes.
5. **Comercial:** combinar características requeridas y excluidas sobre el catálogo real.
6. **Dirección:** pedir informes de estado con cifras definidas y trazables desde BD y ERP.
7. **Otros usos:** OCR para preparar formularios, análisis de logs, acceso gobernado a LLM y control del consumo de tokens.
8. **Cierre:** integrar personas, modelos y sistemas para resolver necesidades concretas.

La secuencia y los textos están en `STOPS` de [main.js](main.js). Cada diorama se crea en el bloque numerado que le corresponde. El movimiento horizontal usa `SPACING` y las funciones `cameraAt()` y `targetAt()`. La pantalla y su encendido tipo monitor se definen en [style.css](style.css). [DISEÑO.md](DISEÑO.md) recoge las pautas tomadas de la presentación de Cassandra y su adaptación a este proyecto.

La tipografía Atkinson Hyperlegible se distribuye bajo la licencia incluida en [assets/OFL.txt](assets/OFL.txt).
