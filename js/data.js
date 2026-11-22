/* =====================================================================
   CRONIVERSO — Contenido histórico
   Bloque 1: La Independencia del Perú (1780 – 1826)
   ===================================================================== */
window.GAME_DATA = (function () {
  'use strict';

  const BLOCKS = [
    {
      id: 'independencia',
      n: 1,
      title: 'La Independencia del Perú',
      years: '1780 – 1826',
      desc: 'Viaja por la selva del recuerdo y revive los 10 momentos que hicieron libre al Perú.',
      icon: '🇵🇪',
      fruit: 'tuna',
      total: 10
    },
    {
      id: 'incas',
      n: 2,
      title: 'Los Incas y el Tahuantinsuyo',
      years: 'Siglos XIII – XVI',
      desc: 'Descubre cómo nació y creció el gran imperio de los Andes.',
      icon: '🏔️',
      fruit: 'lucuma',
      total: 10
    },
    {
      id: 'conquista',
      n: 3,
      title: 'Conquista y Virreinato',
      years: '1532 – 1821',
      desc: 'El encuentro, el choque y tres siglos de vida colonial.',
      icon: '⚓',
      fruit: 'cacao',
      total: 10
    },
    {
      id: 'republica',
      n: 4,
      title: 'La República y sus héroes',
      years: '1826 – 1900',
      desc: 'Los primeros años del Perú libre y las personas que lo construyeron.',
      icon: '🎖️',
      fruit: 'maracuya',
      total: 10
    },
    {
      id: 'diversidad',
      n: 5,
      title: 'Perú diverso y moderno',
      years: '1900 – hoy',
      desc: 'Regiones, culturas, lenguas y logros del Perú de hoy.',
      icon: '🌎',
      fruit: 'granadilla',
      total: 10
    }
  ];

  /* ------------------------------------------------------------------
     Los 10 recuerdos, en orden cronológico.
     La respuesta correcta SIEMPRE se escribe primero: el juego mezcla
     las opciones en cada partida y guarda el índice real.
     ------------------------------------------------------------------ */
  const QUESTIONS = [
    {
      id: 'q01',
      year: '1780',
      name: 'La gran rebelión',
      icon: '🔥',
      character: 'Túpac Amaru II',
      characterKey: 'tupac',
      scene: 'Tinta, Cusco',
      action: 'Alza el estandarte en Tinta y llama al pueblo a levantarse.',
      actionKey: 'rally',
      actionLabel: 'SE REBELA',
      actionProp: '🔥',
      landmarks: ['🏘️', '🔥', '⛰️'],
      hint: 'Pista: adoptó el nombre del último Inca rebelde de Vilcabamba.',
      question: 'José Gabriel Condorcanqui se presenta ante el pueblo. ¿Qué nombre adopta?',
      options: ['Túpac Amaru II', 'Manco Cápac', 'San Martín de Porres'],
      fact: 'Túpac Amaru II fue un cacique de Tinta, en el Cusco. Su rebelión de 1780 fue el primer gran grito contra el dominio español. Fue capturado y ejecutado en 1781.',
      learn: 'Túpac Amaru II lideró la gran rebelión de 1780.',
      fruit: 'tuna'
    },
    {
      id: 'q02',
      year: '1820',
      name: 'Expedición Libertadora',
      icon: '⛵',
      character: 'José de San Martín',
      characterKey: 'san-martin',
      scene: 'La bahía de Paracas',
      action: 'Baja de los barcos con la Expedición Libertadora.',
      actionKey: 'landing',
      actionLabel: 'DESEMBARCA',
      actionProp: '⛵',
      landmarks: ['⛵', '🌊', '🏝️'],
      hint: 'Pista: la expedición llegó por mar desde Chile, al sur de Lima.',
      question: 'San Martín y sus tropas desembarcan desde los barcos. ¿En qué bahía llegan?',
      options: ['En la bahía de Paracas', 'En la isla de San Lorenzo', 'En el puerto del Callao'],
      fact: 'El 8 de setiembre de 1820, San Martín desembarcó en Paracas con la Expedición Libertadora, que llegó desde Chile para liberar al Perú.',
      learn: 'San Martín desembarcó en Paracas en 1820.',
      fruit: 'mango'
    },
    {
      id: 'q03',
      year: '1821',
      name: '¡El Perú es libre!',
      icon: '🎺',
      character: 'José de San Martín',
      characterKey: 'san-martin',
      scene: 'Plaza Mayor de Lima',
      action: 'Levanta la bandera y proclama que el Perú es libre.',
      actionKey: 'proclaim',
      actionLabel: 'PROCLAMA',
      actionProp: '🇵🇪',
      landmarks: ['🏛️', '🇵🇪', '🎺'],
      hint: 'Pista: la ceremonia ocurrió el 28 de julio de 1821.',
      question: 'Desde la Plaza Mayor, ¿qué declara San Martín el 28 de julio de 1821?',
      options: ['La independencia del Perú', 'La llegada de la expedición a Paracas', 'La coronación de un nuevo virrey'],
      fact: 'Frente a la multitud, San Martín dijo: «El Perú es desde este momento libre e independiente por la voluntad general de los pueblos».',
      learn: 'El 28 de julio de 1821 se proclamó la independencia en Lima.',
      fruit: 'lucuma'
    },
    {
      id: 'q04',
      year: '1821',
      name: 'El virrey huye',
      icon: '👑',
      character: 'José de la Serna',
      characterKey: 'la-serna',
      scene: 'Camino al Cusco',
      action: 'Sale de Lima con su gobierno y marcha hacia la sierra.',
      actionKey: 'retreat',
      actionLabel: 'SE RETIRA',
      actionProp: '🐎',
      landmarks: ['⛰️', '🐎', '🌄'],
      hint: 'Pista: trasladó su gobierno a la antigua capital inca.',
      question: 'Cuando Lima se declaró independiente, el virrey José de la Serna...',
      options: ['Huyó y llevó su gobierno a la sierra del Cusco', 'Firmó la paz y se quedó en Lima', 'Se unió al ejército de San Martín'],
      fact: 'La Serna abandonó Lima en julio de 1821 y trasladó su gobierno al Cusco. Por eso la guerra continuó en la sierra.',
      learn: 'El virrey La Serna huyó de Lima hacia el Cusco.',
      fruit: 'cacao'
    },
    {
      id: 'q05',
      year: '1822',
      name: 'El Primer Congreso',
      icon: '📜',
      character: 'José Faustino Sánchez Carrión',
      characterKey: 'sanchez-carrion',
      scene: 'Primer Congreso Constituyente',
      action: 'Presenta sus ideas republicanas durante los debates del Congreso.',
      actionKey: 'congress',
      actionLabel: 'DEBATE EN EL CONGRESO',
      actionProp: '📜',
      landmarks: ['🏛️', '🕯️', '📜'],
      hint: 'Pista: no era un rey ni un virrey; era una asamblea de representantes.',
      question: 'Después de proclamar la independencia, San Martín dejó el mando del Perú a...',
      options: ['El Primer Congreso Constituyente', 'El rey de España', 'El virrey de Lima'],
      fact: 'El 20 de setiembre de 1822 se instaló el Primer Congreso Constituyente y San Martín se retiró del Perú. Así el país empezó a gobernarse sin virrey.',
      learn: 'En 1822 el Primer Congreso Constituyente tomó el mando.',
      fruit: 'maracuya'
    },
    {
      id: 'q06',
      year: '1823',
      name: 'Llega Bolívar',
      icon: '🐎',
      character: 'Simón Bolívar',
      characterKey: 'bolivar',
      scene: 'Lima, 1823',
      action: 'Llega a Lima para organizar la campaña final contra los realistas.',
      actionKey: 'arrive',
      actionLabel: 'LLEGA A LIMA',
      actionProp: '🗺️',
      landmarks: ['🏔️', '🏛️', '🗺️'],
      hint: 'Pista: fue el libertador venezolano que llegó en 1823.',
      question: '¿Qué libertador llegó al Perú en 1823 para continuar la lucha por la independencia?',
      options: ['Simón Bolívar', 'Bernardo O’Higgins', 'José de San Martín'],
      fact: 'Simón Bolívar llegó a Lima en setiembre de 1823. Organizó el ejército y preparó la campaña final contra los realistas.',
      learn: 'Simón Bolívar llegó al Perú en 1823.',
      fruit: 'granadilla'
    },
    {
      id: 'q07',
      year: '1824',
      name: 'Batalla de Junín',
      icon: '⚔️',
      character: 'José Andrés Rázuri',
      characterKey: 'razuri',
      scene: 'Pampa de Junín',
      action: 'Cabalga con el ejército patriota durante la batalla de Junín.',
      actionKey: 'charge',
      actionLabel: 'CARGA EN JUNÍN',
      actionProp: '⚔️',
      landmarks: ['🐎', '⛰️', '⚔️'],
      hint: 'Pista: la batalla fue una rápida victoria de la caballería patriota.',
      question: 'El 6 de agosto de 1824, en la batalla de Junín...',
      options: ['Los patriotas vencieron a los realistas', 'Los realistas recuperaron Lima', 'Se firmó la independencia'],
      fact: 'En Junín, Bolívar venció a los realistas en una batalla muy rápida de caballería. Fue la primera gran victoria de la campaña final.',
      learn: 'En la batalla de Junín (1824) vencieron los patriotas.',
      fruit: 'mango'
    },
    {
      id: 'q08',
      year: '1824',
      name: 'Batalla de Ayacucho',
      icon: '🏔️',
      character: 'Antonio José de Sucre',
      characterKey: 'sucre',
      scene: 'Pampa de Ayacucho',
      action: 'Dirige al ejército patriota en la batalla decisiva de Ayacucho.',
      actionKey: 'victory',
      actionLabel: 'DIRIGE LA VICTORIA',
      actionProp: '⚔️',
      landmarks: ['⛰️', '⚔️', '🇵🇪'],
      hint: 'Pista: ocurrió en diciembre de 1824, en la pampa de Ayacucho.',
      question: '¿Qué batalla dirige Sucre para sellar la independencia en 1824?',
      options: ['La batalla de Ayacucho', 'La batalla de Junín', 'La batalla de Tarapacá'],
      fact: 'En Ayacucho, el general Antonio José de Sucre venció al virrey La Serna. Esa victoria selló la independencia del Perú.',
      learn: 'La batalla de Ayacucho (1824) selló la independencia.',
      fruit: 'lucuma'
    },
    {
      id: 'q09',
      year: '1826',
      name: 'El último bastión',
      icon: '🕊️',
      character: 'José Ramón Rodil',
      characterKey: 'rodil',
      scene: 'Fortaleza del Callao',
      action: 'Defiende el Real Felipe hasta que la guarnición capitula.',
      actionKey: 'surrender',
      actionLabel: 'ÚLTIMO BASTIÓN',
      actionProp: '🏰',
      landmarks: ['🏰', '🌊', '🕊️'],
      hint: 'Pista: el último bastión estaba junto al mar, en el Callao.',
      question: 'Tras el largo sitio al Callao, ¿qué hace la guarnición realista en 1826?',
      options: ['Se rinde en la Fortaleza del Real Felipe', 'Avanza hacia Lima', 'Se une al ejército patriota'],
      fact: 'El 23 de enero de 1826, los últimos realistas se rindieron en el Callao. Así terminó la guerra por la independencia del Perú.',
      learn: 'El Callao se rindió en 1826: fin de la guerra.',
      fruit: 'cacao'
    },
    {
      id: 'q10',
      year: 'HOY',
      name: 'Fiestas Patrias',
      icon: '🎉',
      character: 'Lucía, niña peruana',
      characterKey: 'peruvian-child',
      scene: 'El Perú de hoy',
      action: 'Iza la bandera y celebra las Fiestas Patrias con su comunidad.',
      actionKey: 'celebrate',
      actionLabel: 'CELEBRA',
      actionProp: '🇵🇪',
      landmarks: ['🏘️', '🇵🇪', '🎉'],
      hint: 'Pista: recuerda la proclamación de la independencia de 1821.',
      question: 'Lucía celebra el 28 de julio. ¿Qué fecha patria recuerda?',
      options: ['El Día de la Independencia', 'El Día de la Bandera', 'El Día del Imperio Inca'],
      fact: 'El 28 de julio celebramos las Fiestas Patrias: recordamos la proclamación de la independencia de 1821. ¡La historia sigue viva en nosotros!',
      learn: 'Cada 28 de julio celebramos las Fiestas Patrias.',
      fruit: 'tuna'
    }
  ];

  /* ------------------------------------------------------------------
     Ronda de rescate: 5 segundos, datos concretos y fáciles.
     Se eligen 3 al azar cada vez.
     ------------------------------------------------------------------ */
  const RESCUE = [
    { id: 'r01', q: '¿En qué año se proclamó la independencia del Perú?', options: ['1821', '1780', '1826'], fact: 'Fue el 28 de julio de 1821.' },
    { id: 'r02', q: '¿Quién proclamó la independencia del Perú?', options: ['José de San Martín', 'Simón Bolívar', 'Túpac Amaru II'], fact: 'San Martín la proclamó en Lima, en 1821.' },
    { id: 'r03', q: '¿En qué ciudad se proclamó la independencia?', options: ['Lima', 'Cusco', 'Arequipa'], fact: 'Fue en la Plaza Mayor de Lima.' },
    { id: 'r04', q: '¿Qué batalla selló la independencia en 1824?', options: ['Ayacucho', 'Junín', 'Paracas'], fact: 'La batalla de Ayacucho, el 9 de diciembre de 1824.' },
    { id: 'r05', q: '¿Quién venció en la batalla de Ayacucho?', options: ['Antonio José de Sucre', 'El virrey La Serna', 'El rey de España'], fact: 'Sucre venció al virrey La Serna.' },
    { id: 'r06', q: '¿En qué mes se proclama la independencia?', options: ['Julio', 'Enero', 'Diciembre'], fact: 'El 28 de julio de 1821.' },
    { id: 'r07', q: '¿Quién lideró la gran rebelión de 1780?', options: ['Túpac Amaru II', 'San Martín', 'Bolívar'], fact: 'Túpac Amaru II, en el Cusco.' },
    { id: 'r08', q: '¿Dónde desembarcó San Martín en 1820?', options: ['Paracas', 'El Callao', 'Trujillo'], fact: 'En la bahía de Paracas.' },
    { id: 'r09', q: '¿Qué virrey huyó de Lima en 1821?', options: ['José de la Serna', 'Simón Bolívar', 'Túpac Amaru II'], fact: 'El virrey José de la Serna.' },
    { id: 'r10', q: '¿Qué libertador llegó al Perú en 1823?', options: ['Simón Bolívar', 'San Martín', 'Sucre'], fact: 'Bolívar llegó a Lima en 1823.' }
  ];

  return { BLOCKS, QUESTIONS, RESCUE };
})();
