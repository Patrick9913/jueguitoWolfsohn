'use client'

import { useEffect, useRef, useState } from "react";
import { MagicMotion } from "react-magic-motion";

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

const questions = [
  {
    question: "Algo que nunca falta en la mochila/cartera de un docente",
    answers: [
      { text: "Lápices / biromes", points: 18 },
      { text: "Mate y termo", points: 5 },
      { text: "Celular con 3 % de batería", points: 4 },
      { text: "Planificaciones", points: 1 },
      { text: "Marcadores", points: 1 },
      { text: "Lentes - parlante - birome", points: 1 },
      { text: "Útiles extras para prestarle a los chicos", points: 1 }
    ]
  },
  {
    question: "Una frase típica que dice un docente en clase/sala",
    answers: [
      { text: "¡Silencio!", points: 7 },
      { text: "¿Quién falta hoy?", points: 3 },
      { text: "Si siguen hablando, no hay recreo/patio", points: 6 },
      { text: "¡Después lo charlamos en el recreo/patio!", points: 4 },
      { text: "Manos arriba para contestar", points: 4 },
      { text: "Muy bien, excelente", points: 3 },
      { text: "A guardar que ya viene..... - te ayudo con la campera?", points: 1 }
    ]
  },
  {
    question: "Un objeto que desaparece misteriosamente en la escuela",
    answers: [
      { text: "Lápices / Marcadores", points: 12 },
      { text: "Control remoto del AA", points: 4 },
      { text: "Alumnos", points: 4 },
      { text: "Tijeras", points: 4 },
      { text: "Pelotas", points: 2 },
      { text: "Borrador del pizarrón", points: 1 },
      { text: "Cargador / Notebook", points: 1 },
      { text: "Sacapuntas", points: 1 },
      { text: "Cintas adhesivas - tijeras - fruta", points: 1 },
      { text: "Borradores de pizarra", points: 1 }
    ]
  },
  {
    question: "Algo que los chicos siempre preguntan",
    answers: [
      { text: "¿Puedo ir al baño?", points: 17 },
      { text: "¿Cuenta para la nota?", points: 4 },
      { text: "¿Cuánto falta para ir a casa?", points: 3 },
      { text: "¿Puedo ser el primero?", points: 2 },
      { text: "¿Cuándo vamos al recreo/patio?", points: 2 },
      { text: "Corregiste las pruebas?", points: 1 },
      { text: "¿Me peinas?", points: 1 },
      { text: "Todas!", points: 1 },
      { text: "Cuándo desayunamos? - Puedo sacar mis juguetes?-", points: 1 }
    ]
  },
  {
    question: "Una actividad que te salva el día",
    answers: [
      { text: "Tener Ed. Física", points: 15 },
      { text: "Que se corte la luz y se suspendan las clases", points: 8 },
      { text: "Otros", points: 4 },
      { text: "Ver una pelicula en clase", points: 4 },
      { text: "Que un colega te cubra la clase", points: 4 }
    ]
  },
  {
    question: "Un material que nunca falta en el jardín",
    answers: [
      { text: "Masa", points: 30 },
      { text: "Cuentos", points: 25 },
      { text: "Crayones", points: 20 },
      { text: "Bloques", points: 15 },
      { text: "Témperas", points: 10 },
    ],
  },
  {
    question: "El momento del día que más disfrutan los docentes",
    answers: [
      { text: "El saludo cariñoso de los alumnos", points: 10 },
      { text: "La hora libre", points: 9 },
      { text: "Cuando termina el día y se apaga la luz", points: 7 },
      { text: "La salida anticipada de Shabat", points: 5 },
      { text: "El recreo / patio", points: 1 },
      { text: "Las primeras dos", points: 1 },
      { text: "La clase de educación física 😁", points: 1 }
    ]
  },
];


export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(
    Array(questions[0].answers.length).fill(false)
  );
  const [teamTurn, setTeamTurn] = useState(1); // equipos del 1 al 6
  const [teamScores, setTeamScores] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  });
  
  const [feedback, setFeedback] = useState<null | "win" | "lose">(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const loseAudioRef = useRef<HTMLAudioElement | null>(null);
  

  const ensureAudioContext = async () => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioCtxRef.current = new Ctx();
    }
    const ctx = audioCtxRef.current;
    if (ctx && ctx.state === "suspended") {
      try { await ctx.resume(); } catch {}
    }
    return audioCtxRef.current ?? ctx;
  };

  const playTone = async (freq: number, durationMs: number, type: OscillatorType = "sine", volume = 0.1) => {
    const ctx = await ensureAudioContext();
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = freq;
    gain.gain.value = volume;
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
    // pequeña envolvente para evitar clicks
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
    oscillator.stop(ctx.currentTime + durationMs / 1000 + 0.01);
  };

  const playWinSound = async () => {
    // dos tonos ascendentes cortos
    await playTone(660, 120, "sine", 0.15);
    await playTone(880, 160, "sine", 0.15);
  };

  const playLoseSound = async () => {
    // buzzer grave breve con diente de sierra
    const ctx = await ensureAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  };

  const current = questions[currentIndex];

  const advanceTurn = () => {
    setTeamTurn((prev) => (prev === 6 ? 1 : prev + 1));
  };

  useEffect(() => {
    // Pre-cargar audios desde /public
    if (typeof window === "undefined") return;
    if (!winAudioRef.current) {
      const a = new Audio("/wowa.mp3");
      a.preload = "auto";
      a.volume = 0.7;
      winAudioRef.current = a;
    }
    if (!loseAudioRef.current) {
      const a = new Audio("/ducka.mp3");
      a.preload = "auto";
      a.volume = 0.7;
      loseAudioRef.current = a;
    }
  }, []);

  const playWinFile = async () => {
    try {
      const a = winAudioRef.current;
      if (!a) return;
      a.currentTime = 0;
      await a.play();
    } catch {
      // Fallback a tono generado si el navegador bloquea la reproducción
      await playWinSound();
    }
  };

  const playLoseFile = async () => {
    try {
      const a = loseAudioRef.current;
      if (!a) return;
      a.currentTime = 0;
      await a.play();
    } catch {
      await playLoseSound();
    }
  };

  const endPlayWith = (type: "win" | "lose") => {
    setFeedback(type);
    setIsTransitioning(true);
    if (type === "win") void playWinFile(); else void playLoseFile();
    // breve animación y luego pasar turno
    setTimeout(() => {
      setFeedback(null);
      setIsTransitioning(false);
      advanceTurn();
    }, 900);
  };

  const toggleReveal = (index: number) => {
    if (isTransitioning) return;
    if (revealed[index]) return;
    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);
    setTeamScores((prev) => ({
      ...prev,
      [teamTurn]: prev[teamTurn as keyof typeof prev] + current.answers[index].points,
    }));
    endPlayWith("win");
  };

  const wrongAnswer = () => {
    if (isTransitioning) return;
    endPlayWith("lose");
  };

  const nextQuestion = () => {
    const nextIndex = (currentIndex + 1) % questions.length;
    setCurrentIndex(nextIndex);
    setRevealed(Array(questions[nextIndex].answers.length).fill(false));
  };

  return (
    <MagicMotion>
        <div className={`flex flex-col items-center justify-center min-h-screen p-6 ${feedback === "win" ? "bg-blink-green" : feedback === "lose" ? "bg-blink-red" : "bg-gray-100"}`}>
        <h1 className="text-2xl font-bold mb-4 text-center">{current.question}</h1>

        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
          {current.answers.map((answer, i) => (
            <div
              key={i}
              className="bg-blue-600 text-white rounded-2xl shadow-md h-20 flex items-center justify-between px-6 cursor-pointer select-none"
              onClick={() => toggleReveal(i)}
            >
              {revealed[i] ? (
                <>
                  <span className="font-semibold text-lg">{answer.text}</span>
                  <span className="font-bold text-xl">{answer.points}</span>
                </>
              ) : (
                <span className="w-full text-center font-bold text-xl">???</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-6 text-center">
          {Object.entries(teamScores).map(([team, score]) => {
            const isCurrent = Number(team) === teamTurn;
            return (
              <div key={team} className={`rounded-xl p-3 ${isCurrent ? "ring-4 ring-blue-500 bg-white" : ""}`}>
                <p className={`text-lg font-medium ${isCurrent ? "text-blue-700" : ""}`}>Equipo {team}</p>
                <p className="text-3xl font-bold">{score}</p>
                {isCurrent && <p className="text-xs uppercase tracking-wide mt-1">En juego</p>}
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <p className="text-lg">Turno del equipo: <span className="font-bold">{teamTurn}</span></p>
          {feedback === "lose" && <p className="text-red-600 text-2xl">❌</p>}
          {feedback === "win" && <p className="text-green-600 text-2xl">✅</p>}
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={wrongAnswer}
            className="px-6 py-3 bg-red-600 text-white rounded-xl shadow hover:bg-red-700 transition disabled:opacity-50"
            disabled={isTransitioning}
          >
            Respuesta incorrecta
          </button>
          <button
            onClick={nextQuestion}
            className="px-6 py-3 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition"
          >
            Siguiente pregunta
          </button>
        </div>
      </div>
    </MagicMotion>
  );
}