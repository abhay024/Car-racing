class Game {
  constructor() {
    this.resetTitle = createElement("h2")
    this.resetButton = createButton('')
    
    this.leaderboardTitle = createElement('h2')
    this.leader1 = createElement("h2")
    this.leader2 = createElement("h2")
    this.playerMoving = false;
    this.leftKeyActive = false;
    this.blast = false;
  }
  
  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height-100);
    car1.addImage("car1", car1_img);
    car1.scale = 0.07;

    car1.addImage('blast', blast_img);

    car2 = createSprite(width / 2 + 100, height-100);
    car2.addImage("car2", car2_img);
    car2.scale = 0.07;

    car2.addImage('blast', blast_img);

    cars = [car1, car2];

    fuels = new Group();
    goldCoins = new Group();
    obstacles = new Group();

    // Adding fuel sprite in the game
    this.addSprites(fuels, 4, fuel_img, 0.02);
    
    // Adding coin sprite in the game
    this.addSprites(goldCoins, 12 , goldCoin_img, 0.09)

    // Adding obstacle sprite in the game
    this.addSprites(obstacles, 4, obstacle1_img, 0.04);
    this.addSprites(obstacles, 4, obstacle2_img, 0.04);
  }

  addSprites(spriteGroup, numberOfSprites, spriteImage, scale) {
    for (var i=1; i<=numberOfSprites; i++) {
        var x,y;
        x = random(width/2 - 150, width/2 + 150);
        y = random(-height*11, height-500);

        var sprite = createSprite(x,y);
        sprite.addImage(spriteImage);
        sprite.scale = scale;
        spriteGroup.add(sprite);   
    } 
  }

  handleElements() {
    form.hide();
    form.titleImg.position(8, 10);
    form.titleImg.class("gameTitleAfterEffect");

    this.resetTitle.html("Reset Game")
    this.resetTitle.class("h2Text")
    this.resetTitle.position(1115,5)
    
    this.resetButton.class("resetButton")
    this.resetButton.position(1150,60)

    this.leaderboardTitle.html("Leaderboard")
    this.leaderboardTitle.class("h2Text")
    this.leaderboardTitle.position(80,130)

    //this.leader1.html("leader1")
    this.leader1.class("leadersText")
    this.leader1.position(110,180)

    //this.leader2.html("leader2")
    this.leader2.class("leadersText")
    this.leader2.position(110,210)
  }

  play() {
    this.handleElements();
    this.handleResetButton();

    Player.getPlayersInfo();
    player.getCarsAtEnd();

    if (allPlayers !== undefined) {
      //image(track, 0, -height *5, width, height * 6);
      image(track, 0, -height * 11, width, height * 9.2);

      this.showLife()
      this.showFuelBar()
      this.showLeaderboard()

      //index of the array
      var index = 0;
      for (var plr in allPlayers) {
        //add 1 to the index for every loop
        index = index + 1;

        //use data form the database to display the cars in x and y direction
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        var current_life = allPlayers[plr].life;

        if(current_life <= 0) {
          cars[index-1].changeImage('blast');
          cars[index-1].scale = 0.5;
        }

        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;

        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          this.handleFuel(index-1);
          this.handlGoldCoins(index-1);
          this.handleCarACollisionWithCarB(index);
          this.handleObstacleCollision(index);

          if(player.life <= 0 ){
            this.blast = true;
            this.playerMoving = false;
          
          }

          // Changing camera position in y direction
          camera.position.y = cars[index - 1].position.y - 100;
        }
      }

      this.handlePlayerControls();

      
      const finishLine = height*11 + 400
      //console.log(player.positionY) // 6870 | height=585
      if (player.positionY > finishLine) {
          gameState = 2;
          player.rank += 1;
          Player.updateCarsAtEnd(player.rank);
          player.update();
          this.showRank()
      }
      drawSprites();
    }
  }

  showLeaderboard() {
    var leader1, leader2;
    var players = Object.values(allPlayers)

    if( (players[0].rank == 0 && players[1].rank == 0) || players[0].rank==1   ) {
      // &emsp; This tag is used for displaying 4 spaces
      leader1 = players[0].rank + "&emsp;" + players[0].name + "&emsp;" + players[0].score
      leader2 = players[1].rank + "&emsp;" + players[1].name + "&emsp;" + players[1].score
    }

    if(players[1].rank==1 ) {
      // &emsp; This tag is used for displaying 4 spaces
      leader1 = players[1].rank + "&emsp;" + players[1].name + "&emsp;" + players[1].score
      leader2 = players[0].rank + "&emsp;" + players[0].name + "&emsp;" + players[0].score
    }

    this.leader1.html(leader1);
    this.leader2.html(leader2);

  }

  handlePlayerControls() {
    if(!this.blast) {
        // handling keyboard events
        if (keyIsDown(UP_ARROW)) {
          this.playerMoving = true;
          player.positionY += 10;
          player.update();
        }

        if(keyIsDown(LEFT_ARROW) && player.positionX > width/3 - 30)  {
          this.leftKeyActive = true;
          player.positionX -= 5;
          player.update();
        }

        if(keyIsDown(RIGHT_ARROW) && player.positionX < width/2 + 200)  {
          this.leftKeyActive = false;
          player.positionX += 5;
          player.update();
        }
    }
  }


  showRank() {
    swal({
        title: `Awesome!${"\n"}Rank: ${player.rank}`,
        text: "You have reached the finish line sucessfully!",
        imageUrl: '../assets/cup.png',
        imageSize: "100x100",
        confirmButton: "Ok"
    });
  }


  handleResetButton() {
    this.resetButton.mousePressed( () => {
        database.ref('/').set({
          playerCount: 0,
          gameState: 0,
          players: {},
          carsAtEnd: 0
        });
        window.location.reload()
    });
  }

  showLife() {
    push()
    image(life_img, width/2 - 130, height - player.positionY - 375, 20, 20)
    fill("white")
    rect(width/2 - 100, height - player.positionY - 375, 185, 20)
    fill("#f50057")
    rect(width/2 - 100, height - player.positionY - 375, player.life, 20)
    noStroke();
    pop()
  }

  showFuelBar() {
    push()
    image(fuel_img, width/2 - 130, height - player.positionY - 350, 20, 20)
    fill("white")
    rect(width/2 - 100, height - player.positionY - 350, 185, 20)
    fill("#ffc400")
    rect(width/2 - 100, height - player.positionY - 350, player.fuel, 20)
    noStroke();
    pop()
  }

  handleFuel(index) {
      cars[index].overlap(fuels, function(collector, collected) {
          player.fuel = 185;
          //collected is the sprite in the group collectibles that triggered the event
          collected.remove();
      });

      // Reducing Player car fuel
      if (player.fuel > 0 && this.playerMoving) {
          player.fuel -= 0.3;
      }

      //if(player.fuel <= 0 || player.life <= 0) {
      if(player.fuel <= 0) {
        gameState = 2;
        this.gameOver();
      }
  }

  handlGoldCoins(index) {
    cars[index].overlap(goldCoins, function(collector, collected) {
        player.score += 20 ;
        player.update();
        //collected is the sprite in the group collectibles that triggered the event
        collected.remove();
    });
}

handleObstacleCollision(index){
  if(cars[index-1].collide(obstacles)) {

      if(this.leftKeyActive) {
        player.positionX += 100;
      } else {
        player.positionX -= 100;
      }

      if(player.life > 0) {
        player.life -= 185/4
      } 

      player.update();
  }
}

handleCarACollisionWithCarB(index) {
  if (index === 1) {
    if (cars[index - 1].collide(cars[1])) {
      if (this.leftKeyActive) {
        player.positionX += 100;
      } else {
        player.positionX -= 100;
      }

      //Reducing Player Life
      if (player.life > 0) {
        player.life -= 185 / 4;
      }

      player.update();
    }
  }
  if (index === 2) {
    if (cars[index - 1].collide(cars[0])) {
      if (this.leftKeyActive) {
        player.positionX += 100;
      } else {
        player.positionX -= 100;
      }

      //Reducing Player Life
      if (player.life > 0) {
        player.life -= 185 / 4;
      }

      player.update();
    }
  }
}

  gameOver() {
    swal({
      title: `GameOver`,
      text: "Oops! You lost the race...!!",
      imageUrl: 'https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png',
      imageSize: "100x100",
      confirmButtonText: "Thanks for Playing"
    });
  }

}