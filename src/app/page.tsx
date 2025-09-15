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
      { text: "Lapices y Biromes", points: 24 },
      { text: "Cargador de celular", points: 18 },
      { text: "Marcadores", points: 14 },
      { text: "Pañuelos descartables", points: 12 },
      { text: "Útiles extras para prestarle a los chicos", points: 10 },
      { text: "Alcohol en Gel", points: 9 }
    ]
  },
  {
    question: "Una frase típica que dice un docente en clase/sala",
    answers: [
      { text: "¡Silencio!", points: 23 },
      { text: "Si siguen hablando, no hay recreo/patio", points: 21 },
      { text: "¿Quién falta hoy?", points: 17 },
      { text: "Muy bien, excelente", points: 12 },
      { text: "Ordenen las mochilas/los bancos.", points: 8 },
      { text: "¿Entendieron o lo explico de nuevo?", points: 5 }
    ]
  },
  {
    question: "Un objeto que desaparece misteriosamente en la escuela",
    answers: [
      { text: "Cargador / Notebook", points: 30 },
      { text: "Lápices / Marcadores", points: 23 },
      { text: "Fotocopias", points: 14 },
      { text: "Control remoto del AA", points: 10 },
      { text: "Alumnos", points: 8 },
      { text: "Pelotas", points: 6 }
    ]
  },
  {
    question: "Algo que los chicos siempre preguntan",
    answers: [
      { text: "¿Puedo ir al baño?", points: 30 },
      { text: "¿Cuándo vamos al recreo/patio?", points: 23 },
      { text: "¿Cuenta para la nota?", points: 15 },
      { text: "Hoy hay educación física", points: 12 },
      { text: "¿Corregiste las pruebas?", points: 9 },
      { text: "¿Me peinas?", points: 4 }
    ]
  },
  {
    question: "Un momento del año escolar que nos agobia",
    answers: [
      { text: "Reuniones de familias", points: 30 },
      { text: "Entrega de informes / boletines", points: 22 },
      { text: "Acto de fin de año", points: 17 },
      { text: "CTM/DTH", points: 13 },
      { text: "Graduación", points: 8 },
      { text: "Primer día de clases", points: 5 }
    ]
  },
  {
    question: "Una actividad que te salva el día",
    answers: [
      { text: "Tener Ed. Física", points: 20 },
      { text: "Tener TIC", points: 18 },
      { text: "Que un colega te cubra la clase", points: 17 },
      { text: "Que no haya internet", points: 15 },
      { text: "Ver una película en clase", points: 10 },
      { text: "La hora del almuerzo", points: 4 }
    ]
  },
  {
    question: "Un material que nunca falta en el jardín",
    answers: [
      { text: "Cuentos", points: 30 },
      { text: "Masa", points: 20 },
      { text: "Crayones", points: 19 },
      { text: "Temperas", points: 11 },
      { text: "Musica", points: 8 },
      { text: "Bloques", points: 6 }
    ]
  },
  {
    question: "El momento del día que más disfrutan los docentes",
    answers: [
      { text: "El saludo cariñoso de los alumnos", points: 23 },
      { text: "La hora libre", points: 20 },
      { text: "La salida anticipada de Shabat", points: 18 },
      { text: "Cuando termina el día y se apaga la luz", points: 17 },
      { text: "El recreo / patio", points: 6 },
      { text: "El almuerzo", points: 5 }
    ]
  }
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(Array(questions[0].answers.length).fill(false));
  const [teamTurn, setTeamTurn] = useState(1);
  const [teamScores, setTeamScores] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
  const [feedback, setFeedback] = useState<null | "win" | "lose">(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [winner, setWinner] = useState<{team: number, points: number} | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const loseAudioRef = useRef<HTMLAudioElement | null>(null);
  const applauseAudioRef = useRef<HTMLAudioElement | null>(null);

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

  const playWinSound = async () => {
    const ctx = await ensureAudioContext();
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 660;
    gain.gain.value = 0.15;
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
  };

  useEffect(() => {
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
    if (!applauseAudioRef.current) {
      const a = new Audio("/apla.mp3"); // <-- tu sonido de aplausos
      a.preload = "auto";
      a.volume = 0.9;
      applauseAudioRef.current = a;
    }
  }, []);

  const playWinFile = async () => {
    try {
      const a = winAudioRef.current;
      if (!a) return;
      a.currentTime = 0;
      await a.play();
    } catch { await playWinSound(); }
  };

  const playLoseFile = async () => {
    try {
      const a = loseAudioRef.current;
      if (!a) return;
      a.currentTime = 0;
      await a.play();
    } catch {}
  };

  const playApplause = async () => {
    const a = applauseAudioRef.current;
    if (!a) return;
    a.currentTime = 0;
    await a.play();
  };

  const endPlayWith = (type: "win" | "lose") => {
    setFeedback(type);
    setIsTransitioning(true);
    if (type === "win") void playWinFile(); else void playLoseFile();
    setTimeout(() => {
      setFeedback(null);
      setIsTransitioning(false);
      setTeamTurn((prev) => (prev === 6 ? 1 : prev + 1));
    }, 900);
  };

  const toggleReveal = (index: number) => {
    if (isTransitioning || revealed[index]) return;
    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);
    setTeamScores(prev => ({
      ...prev,
      [teamTurn]: prev[teamTurn as keyof typeof prev] + questions[currentIndex].answers[index].points
    }));
    endPlayWith("win");
  };

  const wrongAnswer = () => {
    if (!isTransitioning) endPlayWith("lose");
  };

  const nextQuestion = () => {
    if (currentIndex === questions.length - 1) {
      // ULTIMA PREGUNTA => ANUNCIAR GANADOR
      const entries = Object.entries(teamScores) as [string, number][];
      const [winnerTeam, maxPoints] = entries.reduce((max, curr) => curr[1] > max[1] ? curr : max);
      setWinner({ team: Number(winnerTeam), points: maxPoints });
      playApplause();
      return;
    }
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setRevealed(Array(questions[nextIndex].answers.length).fill(false));
  };

  if (winner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-100 p-8 text-center">
        <h1 className="text-4xl font-bold mb-6">🏆 ¡Ganó el equipo {winner.team}!</h1>
        <p className="text-2xl mb-4">Con {winner.points} puntos 🎉</p>
      </div>
    );
  }

  return (
    <MagicMotion>
      <div className={`flex flex-col items-center justify-center min-h-screen p-6 ${feedback === "win" ? "bg-blink-green" : feedback === "lose" ? "bg-blink-red" : "bg-gray-100"}`}>
        <h1 className="text-2xl font-bold mb-4 text-center">{questions[currentIndex].question}</h1>

        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
          {questions[currentIndex].answers.map((answer, i) => (
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
            {currentIndex === questions.length - 1 ? "Terminar juego" : "Siguiente pregunta"}
          </button>
        </div>
      </div>
    </MagicMotion>
  );
}
