import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import * as Blockly from 'blockly'

const PhaserGame = () => {
  const gameRef = useRef(null);
  const blocklyRef = useRef(null);
  let player;
  let playerTileX = 2;
  let playerTileY = 2;
  const mapSize = 5;
  const tileWidth = 128 * 0.7; // Largura do tile
  const tileHeight = 64 * 0.7; // Altura do tile

  useEffect(() => {
    // Defina os blocos aqui
    defineBlocks();

    // Configuração do Phaser
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      scene: {
        preload,
        create,
        update,
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      pixelArt: true,
    };

    const game = new Phaser.Game(config);

    // Inicializa o Blockly
    initBlockly();

    return () => {
      game.destroy(true);
    };
  }, []);

  const defineBlocks = () => {
    // Definição dos blocos
    Blockly.Blocks['andar'] = {
      init: function() {
          this.appendDummyInput()
              .appendField("Andar")
              .appendField(new Blockly.FieldDropdown([
                  ["para frente", "FORWARD"],
                  ["para trás", "BACKWARD"],
                  ["para esquerda", "LEFT"],
                  ["para direita", "RIGHT"]
              ]), "DIRECTION");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour('#4CAF50');
      }
    };
    Blockly.Blocks['atacar'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Atacar");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#f44336');
        }
    };
    Blockly.Blocks['defender'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Defender");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#2196F3');
        }
    };
    Blockly.Blocks['repetir'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Repetir")
                .appendField(new Blockly.FieldNumber(10, 1, 100), "TIMES")
                .appendField("vezes");
            this.appendStatementInput("DO")
                .setCheck(null);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#FF9800');
        }
    };
    Blockly.Blocks['se'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Se");
            this.appendValueInput("CONDITION")
                .setCheck("Boolean");
            this.appendStatementInput("DO")
                .setCheck(null)
                .appendField("então");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#9C27B0');
        }
    };

    // Adicione outros blocos conforme necessário
  };

  const preload = function () {
    this.load.image("tiles", "/src/assets/tiles/grass.png");
    this.load.image("player", "/src/assets/sprites/ab_5000_front_view.png");
  };

  const create = function () {
    this.cameras.main.setBackgroundColor("#0E1419");

    // Criação do mapa isométrico
    for (let y = 1; y < mapSize + 1; y++) {
      for (let x = 1; x < mapSize + 1; x++) {
        const isoX = (x - y) * tileWidth / 2 + 550;
        const isoY = (x + y) * tileHeight / 2 + 200;
        this.add.image(isoX, isoY, 'tiles').setOrigin(0.5, 0.5).setScale(0.7);
      }
    }

    // Adiciona o sprite do jogador
    player = this.add.image(0, 0, 'player').setOrigin(0.5, 0.5);
    player.setScale(-1, 1);
    updatePlayerPosition();

    // Executa o código do Blockly quando o jogador clicar em um botão
    const executeButton = document.getElementById('execute-button');
    executeButton.addEventListener('click', () => {
      executeBlocklyCode();
    });
  };

  const update = function () {
    // Atualizações do jogo podem ser feitas aqui
  };

  const updatePlayerPosition = function () {
    const isoX = (playerTileX - playerTileY) * tileWidth / 2 + 550;
    const isoY = (playerTileX + playerTileY) * tileHeight / 2 + 180;
    player.setPosition(isoX, isoY);
  };

  const initBlockly = () => {
    const toolbox = {
        kind: 'categoryToolbox',
        contents: [{
            kind: 'category',
            name: 'Ações',
            colour: '#4CAF50',
            contents: [{
                kind: 'block',
                type: 'andar'
            }, {
                kind: 'block',
                type: 'atacar'
            }, {
                kind: 'block',
                type: 'defender'
            }]
        }, {
            kind: 'category',
            name: 'Controle',
            colour: '#FF9800',
            contents: [{
                kind: 'block',
                type: 'repetir'
            }, {
                kind: 'block',
                type: 'se'
            }]
        }],
        "css": {
            "selector": ".blocklyTreeRoot",
            "rules": {
                "padding": "5px"
            }
        }
    };
    
    const workspace = Blockly.inject(blocklyRef.current, {
      toolbox: toolbox,
      scrollbars: true,
      horizontalLayout: false,
      trashcan: true,
      zoom: {
          controls: true,
          wheel: true,
          startScale: 0.8,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2
      },
      theme: {
          startHats: true
      }
    });
  };

  const executeBlocklyCode = () => {
    const code = Blockly.JavaScript.workspaceToCode(Blockly.getMainWorkspace());
    eval(code);
  };

  // Funções de movimento e ataque
  const moveForward = () => {
    if (playerTileY > 0) {
      playerTileY -= 1;
      updatePlayerPosition();
    }
  };

  const moveLeft = () => {
    if (playerTileX > 0) {
      playerTileX -= 1;
      updatePlayerPosition();
    }
  };

  const moveRight = () => {
    if (playerTileX < mapSize - 1) {
      playerTileX += 1;
      updatePlayerPosition();
    }
  };

  const moveBack = () => {
    if (playerTileY < mapSize - 1) {
      playerTileY += 1;
      updatePlayerPosition();
    }
  };

  const attackRight = () => {
    alert("Atacando à direita!");
  };

  const attackLeft = () => {
    alert("Atacando à esquerda!");
  };

  const attackForward = () => {
    alert("Atacando à frente!");
  };

  Blockly.CodeGenerator['andar'] = function(block) {
    var direction = block.getFieldValue('DIRECTION');
    return 'andar("' + direction + '");\n';
  };
  Blockly.CodeGenerator['atacar'] = function(block) {
      return 'atacar();\n';
  };
  Blockly.CodeGenerator['defender'] = function(block) {
      return 'defender();\n';
  };
  Blockly.CodeGenerator['repetir'] = function(block) {
      var times = block.getFieldValue('TIMES');
      var branch = Blockly.JavaScript.statementToCode(block, 'DO');
      return 'for (var i = 0; i < ' + times + '; i++) {\n' + branch + '}\n';
  };
  Blockly.CodeGenerator['se'] = function(block) {
      var condition = Blockly.JavaScript.valueToCode(block, 'CONDITION',
          Blockly.JavaScript.ORDER_NONE) || 'false';
      var branch = Blockly.JavaScript.statementToCode(block, 'DO');
      return 'if (' + condition + ') {\n' + branch + '}\n';
  };


  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div ref={blocklyRef} style={{ width: "25%", height: "100%" }} />
      <div ref={gameRef} style={{ width: "75%", height: "100%" }} />
      <button
        id="execute-button"
        style={{
          position: "absolute",
          top: "600px",
          left: "150px",
          padding: "10px 20px",
          backgroundColor: "#4CAF50", // Cor de fundo verde
          color: "white", // Cor do texto
          border: "none", // Sem borda
          borderRadius: "10px", // Bordas arredondadas
          cursor: "pointer", // Cursor de ponteiro ao passar o mouse
          fontSize: "16px", // Tamanho da fonte
          transition: "background-color 0.3s", // Transição suave para a cor de fundo
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#45a049")} // Cor ao passar o mouse
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#4CAF50")} // Cor original
      >
        Executar
      </button>
    </div>
  );
};

export default PhaserGame;