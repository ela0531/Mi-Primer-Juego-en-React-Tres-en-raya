import { useState, useEffect } from "react";
import "./App.css";

//Las 8 combinaciones ganadoras
const LINEAS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function calcularGanador(tablero) {
  for (let [a, b, c] of LINEAS) {
    if (tablero[a] && tablero[a] === tablero[b] && tablero[a] === tablero[c]) {
      return tablero[a];
    }
  }
  return null;
}

function mejorMovida(tablero) {
  //Intentar ganar
  for (let [a, b, c] of LINEAS) {
    if (tablero[a] === "O" && tablero[b] === "O" && !tablero[c]) return c;
    if (tablero[a] === "O" && !tablero[b] && tablero[c] === "O") return b;
    if (!tablero[a] && tablero[b] === "O" && tablero[c] === "O") return a;
  }
  // 2. Bloquear al jugador
  for (let [a, b, c] of LINEAS) {
    if (tablero[a] === "X" && tablero[b] === "X" && !tablero[c]) return c;
    if (tablero[a] === "X" && !tablero[b] && tablero[c] === "X") return b;
    if (!tablero[a] && tablero[b] === "X" && tablero[c] === "X") return a;
  }
  //Centro
  if (!tablero[4]) return 4;
  // 4. Esquina libre
  for (let e of [0, 2, 6, 8]) if (!tablero[e]) return e;
  // 5. Cualquier casilla libre
  return tablero.findIndex((v) => !v);
}

export default function App() {
  const [tablero, setTablero] = useState(Array(9).fill(null));
  const [turnoX, setTurnoX] = useState(true);
  const [modo, setModo] = useState("pvp");

  //Puntaje guardado en localStorage
  const [puntaje, setPuntaje] = useState(() => {
    const guardado = localStorage.getItem("puntaje-rd");
    return guardado ? JSON.parse(guardado) : { X: 0, O: 0 };
  });

  //Guardar puntaje cuando cambie
  useEffect(() => {
    localStorage.setItem("puntaje-rd", JSON.stringify(puntaje));
  }, [puntaje]);

  //Turno de la maquina
  useEffect(() => {
    if (modo !== "cpu" || turnoX) return;
    const ganador = calcularGanador(tablero);
    const empate = !ganador && tablero.every((c) => c);
    if (ganador || empate) return;

    const timer = setTimeout(() => {
      const mov = mejorMovida(tablero);
      if (mov === -1 || mov === undefined) return;
      const nuevoTablero = [...tablero];
      nuevoTablero[mov] = "O";
      setTablero(nuevoTablero);

      const nuevoGanador = calcularGanador(nuevoTablero);
      if (nuevoGanador) {
        setPuntaje((prev) => ({ ...prev, O: prev.O + 1 }));
      }
      setTurnoX(true);
    }, 450);

    return () => clearTimeout(timer);
  }, [tablero, turnoX, modo]);

  const ganador = calcularGanador(tablero);
  const empate = !ganador && tablero.every((c) => c);

  function manejarClick(index) {
    if (ganador || empate || tablero[index]) return;
    if (modo === "cpu" && !turnoX) return;

    const nuevoTablero = [...tablero];
    nuevoTablero[index] = turnoX ? "X" : "O";
    setTablero(nuevoTablero);

    const nuevoGanador = calcularGanador(nuevoTablero);
    if (nuevoGanador) {
      setPuntaje((prev) => ({ ...prev, [nuevoGanador]: prev[nuevoGanador] + 1 }));
    }
    setTurnoX(!turnoX);
  }

  //Reiniciar solo borra el tablero, el puntaje se mantiene
  function reiniciar() {
    setTablero(Array(9).fill(null));
    if (modo === "cpu") {
      setTurnoX(Math.random() >= 0.5);
    } else {
      setTurnoX(true);
    }
  }

  function borrarPuntaje() {
    setPuntaje({ X: 0, O: 0 });
    reiniciar();
  }

  function cambiarModo(nuevoModo) {
    setModo(nuevoModo);
    reiniciar();
  }

  let mensaje;
  if (ganador) {
    const nombre = ganador === "X" ? "Jugador Quisqueya ❌" : modo === "cpu" ? "Maquina ⭕" : "Jugador Caribe ⭕";
    mensaje = `Gano ${nombre}`;
  } else if (empate) {
    mensaje = "Empate Los dos son fuertes 💪";
  } else {
    const turno = turnoX ? "Quisqueya ❌" : modo === "cpu" ? "Maquina⭕" : "Caribe ⭕";
    mensaje = `Turno de ${turno}`;
  }

  return (
    <div className="container">
      <h1>🇩🇴 Taino vs Caribe</h1>

      {/* Selector de modo */}
      <div className="modo">
        <button className={modo === "pvp" ? "activo" : ""} onClick={() => cambiarModo("pvp")}>
          2 Jugadores
        </button>
        <button className={modo === "cpu" ? "activo" : ""} onClick={() => cambiarModo("cpu")}>
          vs Maquina
        </button>
      </div>

      {/* Puntaje */}
      <div className="puntaje">
        <div className="jugador">
          <span>Quisqueya ❌</span>
          <strong>{puntaje.X}</strong>
        </div>
        <span className="separador">VS</span>
        <div className="jugador">
          <span>{modo === "cpu" ? "Maquina" : "Caribe ⭕"}</span>
          <strong>{puntaje.O}</strong>
        </div>
      </div>

      <h2 className={ganador ? "ganador" : empate ? "empate" : ""}>
        {mensaje}
      </h2>

      <div className="tablero">
        {tablero.map((valor, i) => (
          <button
            key={i}
            className={valor === "X" ? "x" : valor === "O" ? "o" : ""}
            onClick={() => manejarClick(i)}
            disabled={!!valor || !!ganador || empate}
          >
            {valor}
          </button>
        ))}
      </div>

      <div className="botones">
        <button className="reiniciar" onClick={reiniciar}>Reiniciar</button>
        <button className="borrar" onClick={borrarPuntaje}>Borrar Puntaje</button>
      </div>
    </div>
  );
}