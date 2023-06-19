const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d"); //canvas context

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;
//velocity = brzina, stavljamo parametre u objekat kako kasnije ne bi bilo bitno kojim redosledom ih ubacujemo

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/background.png",
});
const shop = new Sprite({
  position: {
    x: 600,
    y: 128,
  },
  imageSrc: "./img/shop.png",
  scale: 2.75,
  framesMax: 6,
});

//u glvni objekat koji je parametar, smestamo nove objekte i dodeljujemo ih zasebnim parametrima
const player = new Fighter({
  color: "blue",
  position: {
    x: 0,
    y: 0,
  },
  //velociti za levo desno i gore dole - je nula jer ne zelimo da se automatski krecu
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/player/Idle.png",
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 157,
  },
  sprites: {
    idle: {
      imageSrc: "./img/player/Idle.png",
      framesMax: 8,
    },
    run: {
      imageSrc: "./img/player/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/player/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./img/player/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./img/player/Attack1.png",
      framesMax: 6,
    },
    takeHit: {
      imageSrc: "./img/player/Take Hit - white silhouette.png",
      framesMax: 4,
    },
    death: {
      imageSrc: './img/player/Death.png',
      framesMax: 6
    }
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50,
    },
    width: 160,
    height: 50,
  },
});

const enemy = new Fighter({
  color: "red",
  position: {
    x: 400,
    y: 100,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: -50,
    y: 0,
  },
  imageSrc: "./img/enemy/Idle.png",
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 169,
  },
  sprites: {
    idle: {
      imageSrc: "./img/enemy/Idle.png",
      framesMax: 4,
    },
    run: {
      imageSrc: "./img/enemy/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/enemy/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./img/enemy/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./img/enemy/Attack1.png",
      framesMax: 4,
    },
    takeHit: {
      imageSrc: "./img/enemy/Take hit.png",
      framesMax: 3,
    },
    death: {
      imageSrc: './img/enemy/Death.png',
      framesMax: 7
    }
  },
  attackBox: {
    offset: {
      x: -170,
      y: 50,
    },
    width: 170,
    height: 50,
  },
});

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  w: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
};

decreaseTimer();

function animate() {
  window.requestAnimationFrame(animate); //loop
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;
  //player movement

  if (keys.a.pressed === true && player.lastKey === "a") {
    player.velocity.x = -5;
    player.switchSprite("run");
  } else if (keys.d.pressed && player.lastKey === "d") {
    player.velocity.x = 5;
    player.switchSprite("run");
  } else {
    player.switchSprite("idle");
  }

  //jumping
  if (player.velocity.y < 0) {
    player.switchSprite("jump");
  } else if (player.velocity.y > 0) {
    player.switchSprite("fall");
  }

  //enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
    enemy.velocity.x = -5;
    enemy.switchSprite("run");
  } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
    enemy.velocity.x = 5;
    enemy.switchSprite("run");
  } else {
    enemy.switchSprite("idle");
  }

  //jumping
  if (enemy.velocity.y < 0) {
    enemy.switchSprite("jump");
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite("fall");
  }

  // detect for collision & enemy gets hit
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy,
    }) &&
    player.isAttacking &&
    player.frameCurrent === 4
  ) {
    enemy.takeHit();
    player.isAttacking = false;
    document.querySelector("#enemyHealth").style.width = enemy.health + "%";
  }

  // if player misses
  if (player.isAttacking && player.frameCurrent === 4) {
    player.isAttacking = false;
  }
  // when player gets hit
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player,
    }) &&
    enemy.isAttacking &&
    enemy.frameCurrent === 2
  ) {
    player.takeHit();
    enemy.isAttacking = false;
    document.querySelector("#playerHealth").style.width = player.health + "%";
  }

  // if player misses
  if (enemy.isAttacking && enemy.frameCurrent === 2) {
    enemy.isAttacking = false;
  }

  //end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}
animate();

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "d":
      keys.d.pressed = true;
      player.lastKey = "d";
      break;
    case "a":
      keys.a.pressed = true;
      player.lastKey = "a";
      break;
    case "w":
      player.velocity.y = -20;
      break;
    //attack
    case " ":
      player.attack();
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = true;
      enemy.lastKey = "ArrowLeft";
      break;
    case "ArrowRight":
      keys.ArrowRight.pressed = true;
      enemy.lastKey = "ArrowRight";
      break;
    case "ArrowUp":
      enemy.velocity.y = -20;
      break;
    case "ArrowDown":
      enemy.attack();
      break;
  }
});
window.addEventListener("keyup", (event) => {
  //player keys
  switch (event.key) {
    case "d":
      keys.d.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
  }

  //enemy keys
  switch (event.key) {
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
  }
});
