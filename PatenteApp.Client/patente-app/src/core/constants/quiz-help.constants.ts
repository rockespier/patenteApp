/**
 * Datos estáticos para el popup de ayuda del Quiz.
 * Fuente: análisis de indicios lingüísticos en las preguntas del examen de la patente
 * y estadísticas de las preguntas con mayor porcentaje de error.
 */

export interface HelpWordFrequency {
  word: string;
  count: number;
}

export interface CommonErrorQuestion {
  rank: number;
  text: string;
  correctAnswer: boolean; // true = VERO, false = FALSO
  errorRate: number; // porcentaje de error
}

/** Consejos generales para reconocer la respuesta por el lenguaje de la pregunta */
export const HELP_TIPS: { title: string; text: string }[] = [
  {
    title: 'Parole che suggeriscono FALSO',
    text: 'Le parole come "mai", "sempre", "solo", "comunque" e "in ogni caso" spesso indicano una generalizzazione e, nella maggior parte dei casi, suggeriscono che la risposta potrebbe essere falsa.'
  },
  {
    title: 'Parole che suggeriscono VERO',
    text: 'La presenza di parole come "reato", "sostituisce" e "segnale complementare" tende ad indicare che la risposta sarà vera.'
  },
  {
    title: 'Doppia negazione',
    text: 'La presenza di due negazioni in una domanda tende a invertire il significato, quindi la risposta corretta potrebbe essere quella apparentemente contraria.'
  },
  {
    title: 'False piste tecniche',
    text: 'Alcune parole specifiche, come "spinterogeno", "luci d\'ingombro", "cerchi", "cerchioni", "provincia", "albero di trasmissione", "coppa", "denso" e "fluido", spesso indicano concetti tecnici o dettagli non essenziali e possono suggerire una falsa pista.'
  }
];

/** Parole che compaiono SOLO nelle domande FALSE (n° volte) */
export const FALSE_ONLY_WORDS: HelpWordFrequency[] = [
  { word: 'mai', count: 11 },
  { word: 'chiusa', count: 10 },
  { word: 'frizione', count: 10 },
  { word: 'unicamente', count: 7 },
  { word: 'vanno', count: 7 },
  { word: 'diurne', count: 6 },
  { word: 'interrotta', count: 6 },
  { word: 'obbligatoriamente', count: 6 },
  { word: 'quanti', count: 6 },
  { word: 'affiancati', count: 5 },
  { word: 'alternato', count: 5 },
  { word: 'avvisatore', count: 5 },
  { word: 'facoltativo', count: 5 },
  { word: 'infrazione', count: 5 },
  { word: 'parco', count: 5 },
  { word: 'richiamare', count: 5 },
  { word: 'tutta', count: 5 },
  { word: 'acceleratore', count: 4 },
  { word: 'allontanare', count: 4 },
  { word: 'bere', count: 4 },
  { word: 'chilometro', count: 4 },
  { word: 'mezzeria', count: 4 },
  { word: 'nastro', count: 4 },
  { word: 'necessitano', count: 4 },
  { word: 'ognuna', count: 4 },
  { word: 'prosegue', count: 4 },
  { word: 'smontare', count: 4 },
  { word: 'spazzatura', count: 4 },
  { word: 'tenuti', count: 4 },
  { word: 'veda', count: 4 },
  { word: 'accelerando', count: 3 },
  { word: 'acciaio', count: 3 },
  { word: 'adesivo', count: 3 },
  { word: 'alcuna', count: 3 },
  { word: 'apporre', count: 3 },
  { word: 'assolutamente', count: 3 }
];

/** Parole che compaiono SOLO nelle domande VERE (n° volte) */
export const TRUE_ONLY_WORDS: HelpWordFrequency[] = [
  { word: 'richiede', count: 16 },
  { word: 'brusche', count: 13 },
  { word: 'improvvisamente', count: 12 },
  { word: 'potrebbe', count: 11 },
  { word: 'alcune', count: 10 },
  { word: 'impedire', count: 9 },
  { word: 'ordinariamente', count: 9 },
  { word: 'aprire', count: 8 },
  { word: 'effettiva', count: 8 },
  { word: 'esterno', count: 8 },
  { word: 'sedile', count: 8 },
  { word: 'abbagliare', count: 7 },
  { word: 'ben', count: 7 },
  { word: 'difficoltoso', count: 7 },
  { word: 'diminuzione', count: 7 },
  { word: 'frenate', count: 7 },
  { word: 'rendere', count: 7 },
  { word: 'ripetuto', count: 7 },
  { word: 'accinge', count: 6 },
  { word: 'causare', count: 6 },
  { word: 'comportare', count: 6 },
  { word: 'dovuto', count: 6 },
  { word: 'incorrere', count: 6 },
  { word: 'inefficienti', count: 6 },
  { word: 'intralciare', count: 6 },
  { word: 'limitare', count: 6 },
  { word: 'luoghi', count: 6 },
  { word: 'movimenti', count: 6 },
  { word: 'periodo', count: 6 },
  { word: 'potersi', count: 6 },
  { word: 'ridotto', count: 6 },
  { word: 'rimuovere', count: 6 },
  { word: 'sopraggiungano', count: 6 },
  { word: 'sporgente', count: 6 },
  { word: 'tamponare', count: 6 },
  { word: 'tornanti', count: 6 }
];

/** Le 10 domande con la maggior percentuale di errore */
export const COMMON_ERROR_QUESTIONS: CommonErrorQuestion[] = [
  {
    rank: 1,
    text: 'Il segnale raffigurato (triangolo di dare precedenza con pannello "320 m") è un preavviso di fermarsi e dare precedenza',
    correctAnswer: false,
    errorRate: 36
  },
  {
    rank: 2,
    text: 'Dopo un incidente stradale, è obbligatorio segnalare il veicolo fermo con il segnale mobile di pericolo anche nei centri abitati',
    correctAnswer: false,
    errorRate: 34
  },
  {
    rank: 3,
    text: 'Il segnale raffigurato (confluenza) preannuncia che non si ha diritto di precedenza nella confluenza',
    correctAnswer: false,
    errorRate: 33
  },
  {
    rank: 4,
    text: 'La sosta, ma non la fermata, è vietata in prossimità e in corrispondenza di segnali semaforici in modo da occultarne la vista',
    correctAnswer: false,
    errorRate: 33
  },
  {
    rank: 5,
    text: 'Il segnale raffigurato (percorso pedonale e ciclabile separati) è posto in corrispondenza di un viale misto, riservato sia ai pedoni che ai ciclisti',
    correctAnswer: false,
    errorRate: 32
  },
  {
    rank: 6,
    text: 'Le strisce di guida in figura (incrocio) debbono essere lasciate alla sinistra del veicolo quando si svolta a sinistra',
    correctAnswer: true,
    errorRate: 32
  },
  {
    rank: 7,
    text: "Sulla distanza di sicurezza influisce l'efficienza del freno di servizio",
    correctAnswer: true,
    errorRate: 32
  },
  {
    rank: 8,
    text: 'Nelle aree di parcheggio a tempo limitato, i veicoli al servizio di persone diversamente abili non sono obbligati a rispettare il limite di tempo stabilito per la sosta',
    correctAnswer: true,
    errorRate: 32
  },
  {
    rank: 9,
    text: 'In caso di sinistro con danni al veicolo, la richiesta di risarcimento diretto deve essere obbligatoriamente corredata di fotografie',
    correctAnswer: false,
    errorRate: 32
  },
  {
    rank: 10,
    text: 'Il segnale raffigurato (incrocio) precede il segnale DARE PRECEDENZA',
    correctAnswer: false,
    errorRate: 31
  }
];
