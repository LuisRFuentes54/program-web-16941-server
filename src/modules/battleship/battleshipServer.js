const shipsData = require("./ships");
const coordinates = require("./coordinates");
const logger = require("../../utils/logger");

function getShipSpaces(shipId) {
  for (ship of shipsData) if (shipId == ship.shipID) return ship.spaces;
  return 0;
}

function shipExists(shipId) {
  for (ship of shipsData) if (shipId === ship.shipID) return true;
  return false;
}

function shipUsed(shipId, shipsU) {
  for (usedShip of shipsU) if (shipId === usedShip) return true;
  return false;
}

function getHorizontalCoordinate(coordinate) {
  for (let hCoordinate of coordinates.hCoordinates) {
    if (coordinate === hCoordinate.character) return hCoordinate.value;
  }
  throw new Error("Wrong Coordinate");
}

function getVerticalCoordinate(coordinate) {
  for (let vCoordinate of coordinates.vCoordinates) {
    if (coordinate === vCoordinate.character) return vCoordinate.value;
  }
  throw new Error("Wrong Coordinate");
}

function verifyDrownAndEnd(idShip, board) {
  let drown = true;
  let finish = true;
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if (board[i][j] !== 0 && board[i][j] !== "x") finish = false;
      if (board[i][j] === idShip) drown = false;
      if (!finish && !drown) break;
    }
    if (!finish && !drown) break;
  }
  return {
    drown,
    finish,
  };
}

class gameBoard {
  #players;
  #turn;
  #maximumPlayers;
  #inPlay;
  #roomName;

  constructor() {
    this.#players = [];
    this.#turn = 0;
    this.#maximumPlayers = 2;
    this.#inPlay = false;
    this.#roomName = "";
  }

  /* GETTERS & SETTERS */
  getPlayers() {
    return this.#players;
  }

  getTurn() {
    return this.#turn;
  }

  nextTurn() {
    this.#turn = this.#turn ? 0 : 1;
  }

  maximumPlayers() {
    if (this.#players.length === this.#maximumPlayers) return true;
    return false;
  }

  gameInPlay() {
    return this.#inPlay;
  }
  getGameName() {
    return this.#roomName;
  }
  setGameName(name) {
    this.#roomName = name;
  }

  begin() {
    if (this.#players.length < 2)
      throw new Error("There are not enough players");

    this.#turn = 0;
    this.#inPlay = true;
  }

  addPlayer(username, ships) {
    // Si ya hay 2 jugadores, no se agrega nada y manda error
    if (this.#players.length === this.#maximumPlayers)
      throw new Error("Full Game");

    // Si la partida ya empezo, no hace nada y manda error
    if (this.#inPlay) throw new Error("Game in progress");

    // Valida que lleguen bien los barcos
    if (ships.length !== 5) throw new Error("Ships sended mistake");

    // Inicializa el tablero del jugador nuevo
    //let board = new Array(10).fill(new Array(10).fill(0));
    let board = Array.from({ length: 10 }, () => Array(10).fill(0));

    let shipsUsed = [];
    for (let ship of ships) {
      let hCoordinate = getHorizontalCoordinate(ship.position.charAt(0));
      let vCoordinate = getVerticalCoordinate(ship.position.slice(1));
      for (let i = 0; i < getShipSpaces(ship.id); i++) {
        if (hCoordinate >= 10 || vCoordinate >= 10)
          throw new Error("Ships in invalid position");
        // Marca las casillas ocupadas con el id de cada barco
        board[hCoordinate][vCoordinate] = ship.id;
        if (ship.vertical) {
          hCoordinate++;
        } else {
          vCoordinate++;
        }
      }
      shipsUsed.push(ship.id);
    }
    // Metemos el cliente y su tablero con sus barcos como objeto "players"

    this.#players.push({
      username,
      board,
    });
    if (this.#players.length === this.#maximumPlayers) return true;
    return false;
  }

  /* Metodo cuando se hace un disparo en la partida */
  makePlay(username, position) {
    const indexOponnent = this.#players[0].username === username ? 1 : 0;
    //if (indexOponnent == turno)
    //    throw new Error("Invalid turn");
    const hCoordinate = getHorizontalCoordinate(position.charAt(0));
    const vCoordinate = getVerticalCoordinate(position.slice(1));
    // en fieldOriginalValue, si == 5 Portaaviones, si es ==  4 es es Crucero, ...
    const fieldOriginalValue =
      this.#players[indexOponnent].board[hCoordinate][vCoordinate];
    let playStatus = {};
    playStatus.username = this.#players[indexOponnent].username;
    playStatus.position = position;
    playStatus.hit = fieldOriginalValue != 0;
    if ((fieldOriginalValue) => 0 && fieldOriginalValue <= 5)
      this.#players[indexOponnent].board[hCoordinate][vCoordinate] = "x";
    /* else {
            for (let i = 0; i < 10; i++) {
                for (let j = 0; j < 10; j++) {
                    if (this.#players[indexOponnent].board[i][j] !== "x"){
                        this.#players[indexOponnent].board[i][j] = "x";
                        playStatus.position = coordinates.hCoordinates[i].character + coordinates.vCoordinates[j].character;
                    }
                }
            }
        } */
    //    throw new Error("Invalid play");
    const boardStatus = verifyDrownAndEnd(
      fieldOriginalValue,
      this.#players[indexOponnent].board
    );
    return {
      ...playStatus,
      ...boardStatus,
    };
  }
}

module.exports = gameBoard;
