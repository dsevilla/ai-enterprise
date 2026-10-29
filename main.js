import * as THREE from 'three';

// Cada parada es un diorama independiente. La cámara viaja a la derecha entre ellos.
const STOPS = [
  { id:'vision', kicker:'01 / PROPUESTA', name:'Una empresa, muchos sistemas', title:'La IA que <em>conoce la empresa</em>', lead:'Integración de capacidades de IA en los sistemas y procesos de la empresa.', bullets:['Se parte de los procesos, datos y herramientas que la empresa ya utiliza.','Las personas pueden consultar información y trabajar con los sistemas existentes.'], flow:['Sistemas de empresa','IA aplicada','Personas con más control'], flowSymbols:['+','→'] },
  { id:'desconexion', kicker:'02 / PROBLEMA', name:'La IA genérica está aislada', title:'Una respuesta sin <em>contexto</em>', lead:'Un modelo general puede redactar bien, pero desconoce los datos internos y las reglas vigentes de la organización.', bullets:['No sabe qué productos hay disponibles ni qué política interna se aplica.','Una respuesta plausible no sustituye a una consulta fiable y autorizada.'], flow:['Pregunta','IA genérica','Respuesta incompleta'] },
  { id:'puente', kicker:'03 / INTEGRACIÓN', name:'El puente entre ambos mundos', title:'Un puente <em>entre sistemas</em>', lead:'Una capa de integración conecta la petición con las fuentes de la empresa.', bullets:['Se identifica la intención, se recupera el contexto pertinente y se consultan BD, ERP o documentos.','La integración contempla permisos, trazabilidad y una respuesta comprensible.'], flow:['Lenguaje natural','Integración','BD · ERP · documentos · informes · dashboards · análisis'] },
  { id:'conocimiento', kicker:'04 / CONOCIMIENTO', name:'Normativa y políticas internas', title:'Preguntar y obtener <em>fuentes</em>', lead:'Una persona pregunta en lenguaje natural por legislación actual y políticas de la empresa.', quote:'«¿Qué procedimiento debe seguirse según la norma vigente y la política interna?»', bullets:['La búsqueda recupera documentos autorizados y sus versiones pertinentes.','La respuesta resume lo encontrado y cita las fuentes que la respaldan.'], flow:['Pregunta','RAG corporativo','Documentos vigentes'] },
  { id:'comercial', kicker:'05 / CATÁLOGO', name:'Un comercial ante el catálogo', title:'Encontrar el producto <em>adecuado</em>', lead:'El equipo comercial combina requisitos positivos y exclusiones en una sola pregunta.', quote:'«¿Qué producto cumple estas características, pero no incluye estas otras?»', bullets:['La integración transforma la intención en filtros sobre el catálogo real.','La IA explica las coincidencias y muestra los atributos usados en la selección.'], flow:['Comercial','Catálogo / ERP','Opciones verificadas'] },
  { id:'direccion', kicker:'06 / DECISIONES', name:'Informes para dirección', title:'Del dato al <em>informe</em>', lead:'Un directivo solicita un estado de la empresa sin escribir consultas ni reunir hojas manualmente.', quote:'«Resume ventas, incidencias y evolución del trimestre por región.»', bullets:['La capa de integración consulta las fuentes autorizadas y calcula indicadores definidos.','El informe conserva el periodo, el origen y la definición de cada cifra.'], flow:['Solicitud','BD · ERP','Informe trazable'] },
  { id:'operaciones', kicker:'07 / AUTOMATIZACIÓN', name:'Más trabajo útil para la IA', title:'Más casos de <em>uso</em>', lead:'La misma arquitectura permite sumar procesos sin perder el contexto empresarial.', bullets:['OCR inteligente: extraer datos de documentos y preparar formularios para revisión.','Análisis de logs: detectar patrones y facilitar el diagnóstico.','Acceso gobernado a LLM y optimización del consumo de tokens.'], flow:['Documentos','Operaciones','Modelos'] },
  { id:'cierre', kicker:'08 / RESULTADO', name:'La IA dentro del flujo de trabajo', title:'Resultado: <em>integración efectiva</em>', lead:'La aportación está en unir personas, modelos y sistemas con una integración diseñada para cada empresa.', bullets:['Casos concretos, datos propios y respuestas comprobables.','Una base común para ampliar capacidades con control y utilidad.'], flow:['Necesidad','Integración','Valor diario'] },
];
const SPACING = 20;
const WAREHOUSE_STEPS = new Set([4, 6]);
const rooms = [];
// El fondo se desplaza a la izquierda; personaje y mesa conservan su posición.
const BACKDROP_OFFSET = 2.7;
const colors = { floor:0xd4e2dd, wall:0xe9f0eb, ink:0x355963, teal:0x78aaa7, coral:0xc98e7e, gold:0xd4b98d, blue:0x9cbeca, cream:0xf3e8d8, plant:0x829e89, white:0xfaf8ef };
const mat = (color, extra={}) => new THREE.MeshStandardMaterial({color, roughness:.82, metalness:.04, ...extra});
const materials = Object.fromEntries(Object.entries(colors).map(([key,value])=>[key,mat(value)]));
const scene = new THREE.Scene(); scene.background = new THREE.Color(0xdfe9e7); scene.fog = new THREE.Fog(0xdfe9e7,19,42);
const camera = new THREE.PerspectiveCamera(47,1,.1,140);
let renderer;
try { renderer = new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); }
catch { document.querySelector('#fallback').hidden=false; throw new Error('WebGL no disponible'); }
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6)); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.4;
document.querySelector('#scene').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xf9f8ef,0xb5c8c4,2.25));
const daylight=new THREE.DirectionalLight(0xfff1d9,2.1); daylight.position.set(-9,15,12); scene.add(daylight);
const fill=new THREE.DirectionalLight(0xb8d8dc,.72); fill.position.set(7,7,-7); scene.add(fill);

function box(parent,w,h,d,x,y,z,material){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
function cylinder(parent,rTop,rBottom,h,x,y,z,material,segments=16){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(rTop,rBottom,h,segments),material);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
function sphere(parent,r,x,y,z,material){const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,20,14),material);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
function line(parent,a,b,color,r=.035){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b);const direction=end.clone().sub(start);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,direction.length(),8),mat(color,{emissive:color,emissiveIntensity:.18}));mesh.position.copy(start.add(end).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());parent.add(mesh);return mesh;}
function label(parent,text,x,y,z,w=2.5,color='#355963'){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='rgba(248,251,246,.92)';ctx.fillRect(0,0,512,128);ctx.strokeStyle='#9abfba';ctx.lineWidth=6;ctx.strokeRect(3,3,506,122);ctx.fillStyle=color;ctx.font='bold 44px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,67,490);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,w/4),new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide,depthWrite:false}));mesh.position.set(x,y,z);parent.add(mesh);return mesh;
}
// Volúmenes redondeados, con articulaciones unidas y dos zapatos separados.
// El eje local +z es el frente; al girar el grupo se ve la cara de tres cuartos.
function person(group,x,z,accent=materials.coral,pose='point'){
 const p=new THREE.Group();p.position.set(x+.2+BACKDROP_OFFSET,0,z+1.35);p.rotation.y=1.12;p.scale.setScalar(1.4);group.add(p);
 const woman=group.userData.personVariant==='woman';
 const skin=mat(0xe6bd9e), hair=mat(woman?0x765447:0x574f4b), trousers=mat(0x52646a), shoe=mat(0x344b50);
 const shirt=mat(0xf5eee2), detail=mat(0xd0a18b);
 function oval(radius,x0,y0,z0,sx,sy,sz,material){const o=sphere(p,radius,x0,y0,z0,material);o.scale.set(sx,sy,sz);return o;}
 function limb(a,b,r,material){
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
  const shape=new THREE.Mesh(new THREE.CapsuleGeometry(r,Math.max(.01,delta.length()-2*r),6,12),material);
  shape.position.copy(start.add(end).multiplyScalar(.5));shape.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());p.add(shape);
 }
 // Piernas y zapatos con punta: cada pie apoya en el suelo por separado.
 for(const side of [-1,1]){
  limb([side*.19,1.38,0],[side*.20,.25,.015],.145,trousers);
  oval(1,side*.2,.16,.13,.18,.15,.33,shoe);
  oval(1,side*.2,.23,-.02,.16,.14,.19,shoe);
  oval(1,side*.2,.07,.14,.18,.045,.33,materials.ink);
 }
 // Chaqueta entallada y camisa visible en la abertura.
 const jacket=cylinder(p,.48,.38,1.17,0,1.94,0,accent,24);jacket.scale.z=.60;
 box(p,.29,.81,.035,0,2.04,.294,shirt);
 const lapelShape=(points)=>{const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geometry.computeVertexNormals();const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:accent.color,roughness:.88,side:THREE.DoubleSide}));p.add(mesh);};
 lapelShape([-.38,2.46,.28,-.04,2.04,.32,-.17,2.45,.32]);
 lapelShape([.38,2.46,.28,.04,2.04,.32,.17,2.45,.32]);
 for(const y of [1.87,1.65])oval(.035,.05,y,.315,1,1,1,detail);
 cylinder(p,.12,.13,.22,0,2.6,0,skin);
 // Cabeza, cabello, nariz, orejas y ojos visibles de perfil parcial.
 if(woman){
  // El cabello cae detrás de la cabeza y sobre un hombro.
  oval(1,0,2.87,-.19,.37,.59,.23,hair);
  oval(1,-.29,2.82,-.07,.10,.42,.16,hair);
 }
 oval(1,0,2.98,0,.34,.43,.29,skin);
 oval(1,0,3.28,-.035,.35,.18,.30,hair);
 oval(1,-.21,3.19,-.09,.15,.22,.22,hair);
 oval(1,-.33,2.99,0,.075,.12,.06,skin);
 oval(1,.33,2.99,0,.075,.12,.06,skin);
 oval(1,0,2.99,.30,.065,.075,.10,skin);
 for(const side of [-1,1])oval(.026,side*.14,3.07,.267,1,1,1,hair);
 oval(1,.015,2.83,.284,.095,.018,.016,detail);
 // Un gesto orientado al escenario, con codos y manos conectados.
 if(pose==='tablet'){
  // El codo queda delante de la chaqueta y une los dos tramos de la manga.
  limb([-.40,2.36,.04],[-.30,1.93,.40],.13,accent);
  oval(.13,-.30,1.93,.40,1,1,1,accent);
  limb([-.30,1.93,.40],[.94,1.65,.19],.105,accent);
  oval(.12,1.01,1.65,.19,1.2,.7,.8,skin);
 }else{
  limb([-.40,2.36,0],[-.55,1.83,.05],.13,accent);
  limb([-.55,1.83,.05],[-.48,1.48,.18],.115,accent);
  oval(.12,-.48,1.43,.19,.85,1.2,.8,skin);
 }
 if(pose==='point'||pose==='tablet'){
  limb([.40,2.36,0],[.64,2.05,.05],.13,accent);
  limb([.64,2.05,.05],[.99,2.20,.16],.105,accent);
  oval(.12,1.04,2.22,.17,1.2,.75,.75,skin);
 }else{
  limb([.40,2.36,0],[.53,1.85,.06],.13,accent);
  limb([.53,1.85,.06],[.43,1.52,.22],.115,accent);
  oval(.12,.42,1.47,.23,.85,1.2,.8,skin);
 }
 return p;
}
function plant(group,x,z){cylinder(group,.28,.2,.6,x,.3,z,materials.cream);for(let i=0;i<5;i++){const leaf=sphere(group,.25,x+Math.sin(i*2.4)*.3,1.05+((i%2)*.2),z+Math.cos(i*2.4)*.22,materials.plant);leaf.scale.set(.5,1.35,.55);}line(group,[x,.55,z],[x,1.55,z],colors.plant,.04);}
function desk(group,x,z){box(group,3,.17,1.25,x,1.15,z,materials.cream);for(const s of [-1,1])for(const t of [-1,1])box(group,.12,1.12,.12,x+s*1.3,.56,z+t*.45,materials.ink);box(group,1.1,.65,.06,x,1.56,z-.24,materials.ink);box(group,.92,.48,.02,x,1.58,z-.2,mat(0xb6d7d3,{emissive:0x7faeac,emissiveIntensity:.12}));box(group,.7,.04,.31,x,1.23,z+.32,materials.ink);}
function shelf(group,x,z){for(const y of [.25,1.35,2.45])box(group,3.6,.13,.72,x,y,z,materials.ink);for(const side of [-1,1])box(group,.12,2.7,.78,x+side*1.75,1.35,z,materials.ink);}
function workstation(group,x,z){
 const wood=mat(0xcdb9a6), divider=mat(0xbacbc8), dark=mat(0x60787a);
 box(group,2,.12,1.2,x,1.05,z,wood);
 for(const side of [-1,1])box(group,.09,1,.09,x+side*.85,.5,z,materials.ink);
 // Separador bajo, monitor y silla: siluetas repetidas como en una oficina abierta.
 box(group,2,.95,.06,x,1.52,z-.57,divider);
 box(group,.75,.48,.06,x,1.5,z-.2,dark);
 box(group,.62,.35,.025,x,1.52,z-.16,materials.blue);
 box(group,.08,.24,.08,x,1.19,z-.2,dark);
 box(group,.7,.09,.65,x,.67,z+.76,dark);
 box(group,.7,.8,.09,x,1.04,z+1.06,dark);
 box(group,.08,.63,.08,x,.33,z+.76,dark);
}
function foregroundWorkspace(group,tablet=false){
 const wood=mat(0xd2beab),dark=mat(0x4e686d),screen=mat(0xd9ebe8,{emissive:0xaccfca,emissiveIntensity:.12});
 // Esta mesa está junto a la mano, delante de los puestos de la oficina.
 box(group,3.4,.17,1.6,-3.05,1.17,.65,wood);
 for(const x of [-4.55,-1.55])for(const z of [.04,1.25])box(group,.11,1.14,.11,x,.57,z,dark);
 if(tablet){
  const pad=new THREE.Group();pad.position.set(-4.0,2.86,1.2);pad.rotation.set(-.16,-.16,-.12);group.add(pad);
  box(pad,.86,1.05,.11,0,0,0,dark);box(pad,.73,.9,.025,0,.03,.07,screen);
  for(let i=0;i<4;i++){box(pad,.12,.12,.012,-.24,.27-i*.16,.09,i===1?materials.coral:materials.teal);box(pad,.39,.035,.012,.07,.27-i*.16,.09,materials.blue);}
 }else{
  box(group,1.42,1.03,.12,-3.65,2.35,.45,dark);
  box(group,1.26,.86,.025,-3.65,2.35,.52,screen);
  box(group,.1,.59,.1,-3.65,1.61,.45,dark);
  box(group,.62,.055,.38,-3.65,1.28,.6,dark);
  for(let i=0;i<4;i++)box(group,.12,.2+i*.12,.018,-4.05+i*.23,2.1+i*.06,.54,i===3?materials.coral:materials.teal);
 }
 box(group,1,.045,.36,-2.6,1.28,1.06,materials.ink);
 cylinder(group,.11,.09,.22,-1.9,1.39,.25,materials.white);
}
// Nave de almacenaje: pasillo central, estanterías, palés y una carretilla.
// Los objetos siguen siendo ilustrados, con una paleta más oscura que la oficina.
function warehouseBackdrop(group){
 const floor=mat(0x9a9e99), wall=mat(0xa4aeaa), frame=mat(0x566e75);
 const beam=mat(0xa77357), crate=mat(0xc4ad91), paleCrate=mat(0xd7c7ae);
 const roof=mat(0x697b7a), lamp=mat(0xe5dfc9,{emissive:0xcbbf9b,emissiveIntensity:.32});
 box(group,22,.2,18,0,-.13,-4,floor);
 box(group,22,5.5,.16,0,2.65,-12.9,wall);
 for(const x of [-10,-6,-2,2,6,10]){
  box(group,.18,5.3,.2,x,2.65,-12.75,frame);
  box(group,.16,.19,14,x,5.2,-6.1,roof);
 }
 for(const z of [-2,-5,-8,-11]){
  box(group,21,.18,.18,0,5.12,z,roof);
  box(group,3,.06,.08,0,5,z,lamp);
 }
 for(const x of [-7.8,-4.15,4.15,7.8]){
  for(const z of [-2.6,-5.3,-8,-10.7,-12.3]){
   for(const dx of [-1,1])box(group,.15,4.9,.15,x+dx,2.45,z,frame);
  }
  for(const y of [.38,1.62,2.86,4.1]){
   for(const dx of [-1,1])box(group,.12,.13,10,x+dx,y,-7.45,beam);
   for(const z of [-3.8,-6.45,-9.1,-11.5]){
    box(group,2.08,.12,.95,x,y,z,beam);
    for(const dx of [-.5,.5]){
     box(group,.88,.67,.76,x+dx,y+.40,z,((y+z+dx)>-5)?paleCrate:crate);
     box(group,.56,.035,.015,x+dx,y+.45,z+.39,paleCrate);
    }
   }
  }
 }
 // Carretilla en un plano intermedio y dos horquillas al nivel del suelo.
 const lift=new THREE.Group();lift.position.set(-.8,0,-5.4);group.add(lift);
 const orange=mat(0xb98563), rubber=mat(0x4c5b5d), glass=mat(0xa8c3c0);
 box(lift,1.15,.6,1.5,0,.68,0,orange);
 box(lift,.95,.75,.8,0,1.28,-.18,glass);
 box(lift,1.1,.1,1.1,0,1.75,-.15,roof);
 for(const x of [-.49,.49]){
  box(lift,.09,1.3,.1,x,1.2,-.5,frame);
  for(const z of [-.5,.5]){const wheel=cylinder(lift,.22,.22,.14,x,.22,z,rubber);wheel.rotation.z=Math.PI/2;}
  box(lift,.09,1.9,.11,x,1.15,.8,frame);
  box(lift,.12,.08,1.05,x,.17,1.35,frame);
 }
}
function room(index,accent=materials.teal){
 const group=new THREE.Group();group.position.x=index*SPACING-BACKDROP_OFFSET;
 group.userData.personVariant=index%2===0?'man':'woman';group.userData.stop=index;scene.add(group);rooms.push(group);
 if(WAREHOUSE_STEPS.has(index)){
  warehouseBackdrop(group);
  const foreground=new THREE.Group();foreground.position.x=BACKDROP_OFFSET;group.add(foreground);
  foregroundWorkspace(foreground,index===4);
  return group;
 }
 box(group,14,.2,18,0,-.13,-4,materials.floor);
 box(group,14,5.4,.16,0,2.6,-12.9,materials.wall);
 const glass=mat(0xc3dad7,{emissive:0xb7d2d0,emissiveIntensity:.10});
 const trim=mat(0x91aaa9), ceiling=mat(0xaebfbc), light=mat(0xf5f2df,{emissive:0xf4e5bf,emissiveIntensity:.5});
 // Ventanales laterales y columnas dibujan una oficina que se prolonga al fondo.
 for(const side of [-1,1]){
  for(const z of [-3,-6,-9,-12]){
   box(group,.10,4.7,.2,side*6.55,2.35,z,materials.cream);
   box(group,.045,2.75,2.7,side*6.53,3.05,z-1.4,glass);
   box(group,.10,.09,2.8,side*6.45,1.68,z-1.4,trim);
   box(group,.10,.09,2.8,side*6.45,4.45,z-1.4,trim);
  }
 }
 for(let x=-6;x<=6;x+=3){
  box(group,2.7,2.8,.06,x+1.4,3.05,-12.78,glass);
  box(group,.12,4.7,.15,x,2.35,-12.65,materials.cream);
 }
 box(group,14,.16,.18,0,.1,-12.65,accent);
 // Vigas y luminarias lineales producen la perspectiva del techo de la referencia.
 for(const x of [-5,-2.5,0,2.5,5]){
  box(group,.18,.18,13,x,5.15,-6.1,ceiling);
  box(group,.065,.05,10.6,x,5.02,-6.1,light);
 }
 for(const z of [-2,-5,-8,-11])box(group,13,.12,.12,0,5.12,z,ceiling);
 // Dos filas de puestos dejan un pasillo y una mesa común en el centro.
 for(const z of [-4.4,-7.1,-9.8])for(const x of [-4.5,4.5])workstation(group,x,z);
 const common=mat(0xd8c5ad);
 box(group,1.85,.13,5.4,0,1.08,-7.7,common);
 for(const z of [-9.8,-5.6])for(const x of [-.7,.7])box(group,.11,1,.11,x,.5,z,materials.ink);
 for(const z of [-9,-7.2,-5.4])for(const side of [-1,1]){
  box(group,.55,.08,.55,side*1.42,.65,z,trim);
  box(group,.55,.7,.08,side*1.42,.96,z-.24,trim);
  box(group,.07,.6,.07,side*1.42,.31,z,trim);
 }
 const foreground=new THREE.Group();foreground.position.x=BACKDROP_OFFSET;group.add(foreground);
 foregroundWorkspace(foreground,index===4);
 return group;
}
function building(group,x,z){box(group,3,3.2,1.8,x,1.6,z,materials.cream);box(group,3.3,.25,2.1,x,3.3,z,materials.ink);for(const side of [-1,0,1])box(group,.45,.65,.04,x+side*.7,2.15,z+.93,materials.blue);label(group,'EMPRESA',x,3.85,z+1,2.3);}
function server(group,x,z){box(group,1.55,3,1.3,x,1.5,z,materials.ink);for(const y of [.55,1.1,1.65,2.2,2.75]){box(group,1.23,.32,.035,x,y,z+.67,materials.blue);sphere(group,.045,x-.45,y,z+.72,materials.teal);}label(group,'BD / ERP',x,3.48,z+.75,1.8);}
function aiOrb(group,x,y,z){const orb=sphere(group,.75,x,y,z,mat(0xa8d7d1,{emissive:0x72bbb3,emissiveIntensity:.42,transparent:true,opacity:.82}));const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.035,8,60),materials.teal);ring.position.set(x,y,z);ring.rotation.x=.35;group.add(ring);label(group,'IA',x,y-1.2,z,1.15);return {orb,ring};}
function paper(group,x,y,z,color=materials.cream){box(group,.72,1,.06,x,y,z,color);for(const dy of [.19,0,-.19])box(group,.48,.035,.015,x,y+dy,z+.04,materials.blue);}
function chart(group,x,y,z){box(group,3.1,2.1,.1,x,y,z,materials.cream);for(let i=0;i<4;i++){box(group,.32,.42+i*.29,.04,x-1.03+i*.67,y-.61+(i*.29)/2,z+.07,i===3?materials.coral:materials.teal);}label(group,'INDICADORES',x,y+1.36,z+.1,2.45);}
const animated=[];
// 01. Oficina y empresa al fondo.
{const g=room(0);person(g,-5.1,1.1,materials.coral,'point');plant(g,5.2,1);}
// 02. IA desconectada: la línea interrumpida tiene un hueco visible.
{const g=room(1,materials.blue);person(g,-5,1,materials.blue);server(g,-2,-3.5);const ai=aiOrb(g,3,2.8,-2.9);animated.push(ai);line(g,[-1.1,2.4,-3.2],[.15,2.4,-3.2],colors.coral,.055);line(g,[1.35,2.4,-3.2],[2,2.4,-3.2],colors.coral,.055);sphere(g,.2,.75,2.4,-3.2,materials.coral);label(g,'SIN CONTEXTO',.75,3.6,-3.1,2.9,'#aa7062');}
// 03. Puente: una pasarela física enlaza los sistemas con el núcleo IA.
{const g=room(2);person(g,-5,1.2,materials.coral,'point');server(g,-2.8,-3.5);const ai=aiOrb(g,4,2.7,-3.2);animated.push(ai);box(g,4.7,.18,.75,.6,1.55,-3.1,materials.teal);for(const x of [-1.65,2.85])box(g,.12,1.15,.1,x,.98,-3.1,materials.ink);for(let x=-1.5;x<2.7;x+=.6)line(g,[x,1.7,-3.1],[x+.42,1.7,-3.1],colors.gold,.08);label(g,'INTEGRACIÓN',.6,2.28,-2.6,3);}
// 04. Documentos y consulta interna.
{const g=room(3,materials.gold);person(g,-5,1,materials.blue);desk(g,-3,-1.2);shelf(g,2.7,-3.2);for(let i=0;i<9;i++)paper(g,1.45+i*.31,.9+(i%3)*.8,-2.65,i%3?materials.cream:materials.blue);label(g,'NORMATIVA',2.7,3.78,-2.5,2.8);label(g,'POLÍTICAS',-2.5,3.4,-5.5,2.5);}
// 05. Catálogo de productos.
{const g=room(4,materials.coral);person(g,-5,1.1,materials.coral,'tablet');}
// 06. Dirección e informe.
{const g=room(5,materials.blue);person(g,-5,1.2,materials.ink);box(g,4.8,.22,1.75,-1.2,1.1,-1.3,materials.cream);for(const x of [-3,-1,1])box(g,.12,1,.12,x,.52,-1.3,materials.ink);chart(g,3.2,2.8,-5.5);paper(g,-1.1,1.26,-1.1);label(g,'DIRECCIÓN',-3.1,3.8,-5.5,2.4);}
// 07. Un entorno de operaciones con documentos, logs y modelos.
{const g=room(6,materials.gold);person(g,-5,1.1,materials.blue);desk(g,-3,-1.8);for(let i=0;i<3;i++){box(g,1.2,1.15,.12,-.1+i*1.75,2.2,-5.62,materials.ink);for(let j=0;j<4;j++)box(g,.75,.045,.02,-.1+i*1.75,2.55-j*.19,-5.53,j===1?materials.coral:materials.teal);}for(let i=0;i<4;i++)paper(g,1+i*.35,.58,-1.9);label(g,'DOCUMENTOS',1.1,3.4,-5.5,2.7);label(g,'LOGS',3.5,3.45,-2.4,1.5);}
// 08. Reunión final y sistemas conectados.
{const g=room(7);person(g,-5,1,materials.coral,'point');building(g,-1.5,-4.15);server(g,3,-3.6);const ai=aiOrb(g,5,3,-2.8);animated.push(ai);line(g,[-.1,2.2,-3.1],[2,2.2,-3.1],colors.teal,.08);line(g,[3.9,2.2,-3.1],[4.3,2.6,-2.9],colors.teal,.08);plant(g,-4,-3);}

const panel=document.querySelector('#holo-screen');const content=document.querySelector('#holo-content');
const sceneTransition=document.querySelector('#scene-transition');
const labelStep=document.querySelector('#step-label'),panelStep=document.querySelector('#panel-step'),progress=document.querySelector('#progress-bar');
const previous=document.querySelector('#previous'),next=document.querySelector('#next');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let index=0,move=null,changing=false,timer=null;
function showSettingFor(stop){const warehouse=WAREHOUSE_STEPS.has(stop);for(const room of rooms)room.visible=WAREHOUSE_STEPS.has(room.userData.stop)===warehouse;}
const cameraAt=(i)=>new THREE.Vector3(i*SPACING+3.7,4.8,15.5);
const targetAt=(i)=>new THREE.Vector3(i*SPACING+2.2,2.05,-2.3);
let cameraTarget=targetAt(0);camera.position.copy(cameraAt(0));camera.lookAt(cameraTarget);
function panelMarkup(stop){return `<div class="holo-kicker">${stop.kicker}</div><h1>${stop.title}</h1><p class="lead">${stop.lead}</p>${stop.quote?`<p class="quote">${stop.quote}</p>`:''}<ul>${stop.bullets.map(item=>`<li>${item}</li>`).join('')}</ul><div class="flow">${stop.flow.map((item,i)=>`${i?`<i>${stop.flowSymbols?.[i-1] ?? '→'}</i>`:''}<span>${item}</span>`).join('')}</div>`;}
function showPanel(i){content.innerHTML=panelMarkup(STOPS[i]);panelStep.textContent=`${String(i+1).padStart(2,'0')} / ${String(STOPS.length).padStart(2,'0')}`;panel.classList.remove('is-closing');void panel.offsetWidth;panel.classList.add('is-open');}
function updateLabels(i){const stop=STOPS[i];labelStep.textContent=`${String(i+1).padStart(2,'0')} / ${String(STOPS.length).padStart(2,'0')}`;progress.style.width=`${(i+1)/STOPS.length*100}%`;document.querySelector('#scene-kicker').textContent=stop.kicker;document.querySelector('#scene-name').textContent=stop.name;previous.disabled=i===0;next.disabled=i===STOPS.length-1;}
function go(to,initial=false){if(to<0||to>=STOPS.length||changing&&!initial)return;clearTimeout(timer);const changesSetting=WAREHOUSE_STEPS.has(index)!==WAREHOUSE_STEPS.has(to);index=to;updateLabels(to);history.replaceState(null,'',`#${STOPS[to].id}`);if(initial){showSettingFor(to);showPanel(to);return;}changing=true;previous.disabled=true;next.disabled=true;panel.classList.remove('is-open');panel.classList.add('is-closing');const duration=reduced.matches?0:2200;const now=performance.now();move={from:camera.position.clone(),targetFrom:cameraTarget.clone(),to:cameraAt(to),targetTo:targetAt(to),start:now,duration,fade:changesSetting&&!reduced.matches,settingChanged:false};if(changesSetting&&reduced.matches)showSettingFor(to);timer=setTimeout(()=>showPanel(to),reduced.matches?0:1100);setTimeout(()=>{changing=false;updateLabels(index);},duration+80);}
previous.addEventListener('click',()=>go(index-1));next.addEventListener('click',()=>go(index+1));
document.addEventListener('keydown',(event)=>{if(['ArrowRight','PageDown',' '].includes(event.key)){event.preventDefault();go(index+1);}if(['ArrowLeft','PageUp'].includes(event.key)){event.preventDefault();go(index-1);}});
window.addEventListener('hashchange',()=>{const found=STOPS.findIndex(s=>`#${s.id}`===location.hash);if(found>=0&&found!==index)go(found);});
function resize(){const w=innerWidth,h=innerHeight;camera.aspect=w/h;
 // En pantallas estrechas conservamos el ancho del encuadre para no cortar a la persona.
 camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(47)/2)*Math.max(1,1.6/camera.aspect)));
 camera.updateProjectionMatrix();renderer.setSize(w,h);}
window.addEventListener('resize',resize);resize();const first=STOPS.findIndex(s=>`#${s.id}`===location.hash);if(first>=0){index=first;camera.position.copy(cameraAt(index));cameraTarget=targetAt(index);camera.lookAt(cameraTarget);}go(index,true);
function frame(time){requestAnimationFrame(frame);if(move){const t=move.duration?Math.min((time-move.start)/move.duration,1):1;const smooth=t*t*(3-2*t);camera.position.lerpVectors(move.from,move.to,smooth);cameraTarget=move.targetFrom.clone().lerp(move.targetTo,smooth);camera.lookAt(cameraTarget);if(move.fade){sceneTransition.style.opacity=String(Math.min(1,t/.25,(1-t)/.28));if(t>=.5&&!move.settingChanged){showSettingFor(index);move.settingChanged=true;}}if(t>=1){sceneTransition.style.opacity='0';move=null;}}if(!reduced.matches){for(const item of animated){item.orb.position.y+=Math.sin(time*.0016)*.00035;item.ring.rotation.z=time*.0003;}}renderer.render(scene,camera);}requestAnimationFrame(frame);
