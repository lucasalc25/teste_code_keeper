import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

const PhaserGame = () => {
  const gameRef = useRef(null);

  useEffect(() => {

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      scene: {
        preload,
        create,
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      pixelArt: true,
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  const tileWidth = 128 * 0.8; // Largura do tile
  const tileHeight = 64 * 0.8; // Altura do tile
  const mapSize = 5; // Mapa 5x5 tiles

  let player;
  let playerTileX = 2;
  let playerTileY = 2;
  let selectedTileX = 2;
  let selectedTileY = 2;

  const mapState = Array.from({ length: mapSize }, () =>
    Array(mapSize).fill({ isPlayer: false, isMoveOption: false })
  );

  // Define a posição inicial do jogador e as opções de movimento
  function updateMapState() {
    for (let y = 0; y < mapSize; y++) {
      for (let x = 0; x < mapSize; x++) {
        const distance = Math.abs(playerTileX - x) + Math.abs(playerTileY - y);
        mapState[y][x] = {
          isPlayer: x === playerTileX && y === playerTileY,
          isMoveOption: distance > 0 && distance <= 2,
        };
      }
    }
  }

  updateMapState();

  const preload = function () {
    this.load.tilemapTiledJSON("map", "/src/assets/maps/grassMap.json"); // Tileset do mapa
    this.load.image("tiles", "/src/assets/tiles/grass.png"); // Mapa JSON
    this.load.image("player", "/src/assets/sprites/ab_5000_front_view.png"); // Sprite do personagem
  };

  const create = function () {
    // Define a cor de fundo como "céu"
    this.cameras.main.setBackgroundColor("#87CEEB"); // Azul claro (cor do céu)

    // Criação do mapa isométrico
    for (let y = 1; y < mapSize+1; y++) {
      for (let x = 1; x < mapSize+1; x++) {
        const isoX = (x - y) * tileWidth / 2 + 270; // Ajuste centralizado no eixo X
        const isoY = (x + y) * tileHeight / 2 + 200; // Ajuste centralizado no eixo Y
        this.add.image(isoX, isoY, 'tiles').setOrigin(0.5, 0.5).setScale(0.8);
      }
    }

    // Adiciona o sprite do jogador
    player = this.add.image(0, 0, 'player').setOrigin(0.5, 0.5);
    player.setScale(-1, 1); // Inverte horizontalmente (escala negativa no eixo X)

    // Atualiza a posição inicial do jogador
    updatePlayerPosition();

    // Teclado para movimentação
    this.input.keyboard.on('keydown', (event) => {
      handleMovement(event.key);
    });
  };

  const handleMovement = function (direction) {
    let newTileX = playerTileX;
    let newTileY = playerTileY;

    if (direction === 'ArrowUp') {
      newTileY -= 1;
    } else if (direction === 'ArrowDown') {
      newTileY += 1;
    } else if (direction === 'ArrowLeft') {
      newTileX -= 1;
    } else if (direction === 'ArrowRight') {
      newTileX += 1;
    }

    // Verifica se o novo tile está dentro dos limites do mapa
    if (newTileX >= 0 && newTileX < mapSize && newTileY >= 0 && newTileY < mapSize) {
      playerTileX = newTileX;
      playerTileY = newTileY;
      updatePlayerPosition();
    }
  }

  const updatePlayerPosition = function () { {
    const isoX = (playerTileX - playerTileY) * tileWidth / 2 + 270;
    const isoY = (playerTileX + playerTileY) * tileHeight / 2 + 180;

    player.setPosition(isoX, isoY);
  }
};

  return <div ref={gameRef} style={{ width: "100%", height: "100%" }} />;
};

export default PhaserGame;
