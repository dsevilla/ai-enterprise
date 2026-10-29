# Diseño de la presentación · IA + empresa

## Idea narrativa

La cámara se mueve siempre hacia la derecha. Cada parada muestra un pequeño espacio de trabajo diferente: oficina, sistemas aislados, puente de integración, consulta documental, catálogo, sala de dirección y operaciones. Un hombre y una mujer se alternan entre escenas, a la izquierda y en tres cuartos, con ropa, rostro y zapatos diferenciados. Una mesa de trabajo con pantalla, próxima a la mano del personaje, ocupa el primer plano; la escena comercial utiliza una tableta. Detrás se extiende una oficina abierta con puestos, mesa central, ventanales y luminarias lineales. En las escenas del comercial y de operaciones aparece una nave de almacén algo más oscura, con estanterías, mercancía y una carretilla; ambas se inspiran en las imágenes aportadas. Un fundido acompaña los cambios entre oficina y almacén, y el cierre vuelve a la oficina. Los objetos y rótulos mantienen un estilo ilustrado para que se entienda la función de cada entorno sin competir con la explicación.

Las escenas no afirman que exista una aplicación terminada ni representan arquitectura productiva detallada. El puente es una metáfora: la integración real necesitaría diseñar conectores, permisos, recuperación, controles y observabilidad para cada empresa. Los ejemplos de preguntas son ilustrativos.

## Pautas extraídas de `teoria/cassandra-3d/DISEÑO.md` de BDGE

- **Una parada, una idea.** La persona que presenta decide cuándo avanzar; el movimiento de cámara deja tiempo para explicar oralmente cada caso.
- **Continuidad espacial.** Se interpolan la posición y el punto de mira de la cámara juntos para que el cambio de escena sea un desplazamiento lateral visible. Los bordes y la niebla se funden con el fondo pastel y ayudan a que cada diorama aparezca progresivamente.
- **Fichas legibles para proyección.** El contenido se divide en ocho fichas con títulos grandes, frases breves y un flujo visual. El panel admite desplazamiento en pantallas bajas. Un cambio de ficha apaga la anterior y enciende la siguiente con la animación de monitor del ejemplo de Cassandra.
- **Metáforas visuales explícitas.** Los rótulos y el texto explican qué representan los objetos; las preguntas, sistemas y fuentes aparecen en el orden lógico del caso de uso.
- **HTML autónomo.** El mismo esquema Three.js + esbuild produce un archivo final con código, estilos y fuentes incorporados, útil para mostrarlo sin red.
- **Movimiento accesible.** El ajuste de movimiento reducido elimina el desplazamiento largo y la animación ambiental.

## Dirección visual

Luz ambiental suave, cálida desde una ventana imaginaria y fría de relleno. Paredes y mobiliario de poco detalle en verde grisáceo, azul claro, crema y coral apagado. El panel ocupa alrededor de tres quintos del ancho en la zona superior derecha y conserva transparencia para dejar percibir la oficina detrás. El área inferior y la figura izquierda mantienen la presencia del escenario.

## Límites y posibles siguientes mejoras

Los rótulos de los objetos se generan con canvas y son secundarios respecto al texto HTML. Conviene revisar la composición y el rendimiento en el navegador y proyector concretos antes de usarla ante público. La presentación no se publica automáticamente en ningún servicio.
