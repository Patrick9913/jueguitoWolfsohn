'use client'

import { useState } from "react";
import { MagicMotion } from "react-magic-motion";

const questions = [
  {
    question: "¿Qué cosa llevás siempre en la mochila?",
    answers: [
      { text: "Celular", points: 35 },
      { text: "Botella de agua", points: 25 },
      { text: "Llaves", points: 15 },
      { text: "Cuadernos", points: 12 },
      { text: "Auriculares", points: 8 },
      { text: "Lapicera", points: 5 },
    ],
  },
  {
    question: "¿Qué cosa no puede faltar en un asado?",
    answers: [
      { text: "Carne", points: 40 },
      { text: "Parrilla", points: 20 },
      { text: "Chimichurri", points: 15 },
      { text: "Ensalada", points: 10 },
      { text: "Pan", points: 10 },
      { text: "Vino", points: 5 },
    ],
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
  const [strikes, setStrikes] = useState(0);

  const current = questions[currentIndex];

  const toggleReveal = (index: number) => {
    if (revealed[index]) return;
    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);
    setTeamScores({
      ...teamScores,
      [teamTurn]: teamScores[teamTurn as keyof typeof teamScores] + current.answers[index].points,
    });
  };

  const wrongAnswer = () => {
    if (strikes + 1 >= 1) {
      setStrikes(0);
      setTeamTurn(teamTurn === 6 ? 1 : teamTurn + 1);
    } else {
      setStrikes(strikes + 1);
    }
  };

  const nextQuestion = () => {
    const nextIndex = (currentIndex + 1) % questions.length;
    setCurrentIndex(nextIndex);
    setRevealed(Array(questions[nextIndex].answers.length).fill(false));
    setStrikes(0);
  };

  return (
    <MagicMotion>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
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
          {Object.entries(teamScores).map(([team, score]) => (
            <div key={team}>
              <p className="text-lg font-medium">Equipo {team}</p>
              <p className="text-3xl font-bold">{score}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-lg">Turno del equipo: <span className="font-bold">{teamTurn}</span></p>
          <p className="text-red-600 text-2xl">{"❌".repeat(strikes)}</p>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={wrongAnswer}
            className="px-6 py-3 bg-red-600 text-white rounded-xl shadow hover:bg-red-700 transition"
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