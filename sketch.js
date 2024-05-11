var canvas;
var backgroundImage, car1_img, car2_img, track;
var database, gameState;
var form, player, playerCount;
var allPlayers, car1, car2;
var cars = [];
var fuels,goldCoins,obstacles;
var fuel_img, goldCoin_img, obstacle1_img, obstacle2_img, life_img, blast_img;

function preload() {
  backgroundImage = loadImage("../assets/background.png");
  car1_img = loadImage("../assets/car1.png");
  car2_img = loadImage("../assets/car2.png");
  track = loadImage("../assets/track.jpg");
  fuel_img = loadImage('../assets/fuel.png');
  goldCoin_img = loadImage('../assets/goldCoin.png');
  obstacle1_img = loadImage('../assets/obstacle1.png');
  obstacle2_img = loadImage('../assets/obstacle2.png');
  life_img = loadImage('../assets/life.png');
  blast_img = loadImage('../assets/blast.png');
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  database = firebase.database();
  game = new Game();
  game.getState();
  game.start();
  // Reset the playerCount to 0 and gameState to 0
  //player.updateCount(0)
  //game.update(0);
}

function draw() {
  background(backgroundImage);
  if (playerCount === 2) {
    game.update(1);
  }

  if (gameState === 1) {
    game.play();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
