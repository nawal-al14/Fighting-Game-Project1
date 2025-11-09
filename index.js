
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

// create img function
function createImage(imageSrc) {
    const image = new Image();
    image.src = imageSrc;
    return image;
}

        

class Sprite {
    constructor({ position, imageSrc, scale = 1, framesMax = 1, offset = { x: 0, y: 0 }, isBackground = false }) {
        this.position = position;
        this.width = 50;
        this.height = 150;
        this.image = createImage(imageSrc);
        this.scale = scale;
        this.framesMax = framesMax; 
        this.framesCurrent = 0;
        this.framesElapsed = 0;
        this.framesHold = 5; 
        this.offset = offset;
        this.isBackground = isBackground; 
    }

    draw() {
        let drawWidth = (this.image.width / this.framesMax) * this.scale;
        let drawHeight = this.image.height * this.scale;

        
        if (this.isBackground) {
            drawWidth = canvas.width;
            drawHeight = canvas.height;
        }

        c.drawImage(
            this.image,
            this.framesCurrent * (this.image.width / this.framesMax), 
            0, 
            this.image.width / this.framesMax, 
            this.image.height, 
            this.position.x - this.offset.x,
            this.position.y - this.offset.y,
            drawWidth,
            drawHeight
        );
    }

    animateFrames() {
        this.framesElapsed++;

        if (this.framesElapsed % this.framesHold === 0) {
            if (this.framesCurrent < this.framesMax - 1) {
                this.framesCurrent++;
            } else {
                this.framesCurrent = 0; 
            }
        }
    }

    update() {
        this.draw();
        this.animateFrames();
    }
}



class Fighter extends Sprite {
    constructor({ 
        position, 
        velocity, 
        imageSrc, 
        scale = 1, 
        framesMax = 1, 
        offset = { x: 0, y: 0 },
        sprites, 
        attackBox = { offset: {}, width: undefined, height: undefined } 
    }) {
        super({ position, imageSrc, scale, framesMax, offset });
        
        this.velocity = velocity;
        this.width = 50;
        this.height = 150;
        this.lastkey;
        this.attackBox = {
            position: { x: this.position.x, y: this.position.y },
            offset: attackBox.offset,
            width: attackBox.width,
            height: attackBox.height
        };
        this.isAttacking;
        this.health = 100;
        this.framesCurrent = 0;
        this.framesElapsed = 0;
        this.framesHold = 5;
        this.sprites = sprites;
        this.dead = false; 
        this.isFlipped = false;

        for (const key in this.sprites) {
            this.sprites[key].image = createImage(this.sprites[key].imageSrc);
        }
    }
    
    update() {
        this.draw();
        
        if (!this.dead) this.animateFrames();
        
        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // 96px هو ارتفاع الأرضية
        if (this.position.y + this.height + this.velocity.y >= canvas.height - 96) { 
            this.velocity.y = 0;
            this.position.y = canvas.height - this.height - 96; 
        } else {
            this.velocity.y += gravity;
        }
    }

    attack(type = 'attack1') { 
        if (this.dead) return;
        this.switchSprite(type); 
        this.isAttacking = true;
    }

    takeHit() {
        if (this.dead) return;
        this.health -= 20;

        if (this.health <= 0) {
            this.switchSprite('death');
        } else {
            this.switchSprite('takeHit'); 
        }
    }
    
    switchSprite(sprite) {
        // إدارة حالة الموت
        if (this.image === this.sprites.death.image) {
            if (this.framesCurrent === this.sprites.death.framesMax - 1) {
                this.dead = true;
            }
            return;
        }

        
        if (this.image === this.sprites.attack1.image && 
            this.framesCurrent < this.sprites.attack1.framesMax - 1) return;

        
        if (this.sprites.attack2 && this.image === this.sprites.attack2.image && 
            this.framesCurrent < this.sprites.attack2.framesMax - 1) return;

        
        if (this.image === this.sprites.takeHit.image && 
            this.framesCurrent < this.sprites.takeHit.framesMax - 1) return;

        
        if (this.image !== this.sprites[sprite].image) {
            this.image = this.sprites[sprite].image;
            this.framesMax = this.sprites[sprite].framesMax;
            this.framesCurrent = 0; 
        }
    }
}

// the backgrounds
const backgroundLayer1 = new Sprite({
    position: { x: 0, y: 0 },
    imageSrc: './img/backgrounds/background_layer_1.png', 
    isBackground: true 
});

const backgroundLayer2 = new Sprite({
    position: { x: 0, y: 0 },
    imageSrc: './img/backgrounds/background_layer_2.png',
    isBackground: true
});

const backgroundLayer3 = new Sprite({
    position: { x: 0, y: 0 },
    imageSrc: './img/backgrounds/background_layer_3.png',
    isBackground: true
});


const shop = new Sprite({
  position: {
    x: 600,
    y: 128
  },
  imageSrc: './img/ui/shop.png',
  scale: 2.75,
  framesMax: 6
})

//  create players 

const player = new Fighter({
    position: { x: 0, y: 0 }, 
    velocity: { x: 0, y: 0 },
    offset: {x: 0,  y: 0 },
    
    imageSrc: './img/characters/samuraiMack/Idle.png', 
    framesMax: 8, 
    scale: 2.5,
    offset: { x: 215, y: 157 }, 
    sprites: {
        idle: { imageSrc: './img/characters/samuraiMack/Idle.png', framesMax: 8 }, 
        run: { imageSrc: './img/characters/samuraiMack/Run.png', framesMax: 8 },
        jump: { imageSrc: './img/characters/samuraiMack/Jump.png', framesMax: 2 },
        fall: { imageSrc: './img/characters/samuraiMack/Fall.png', framesMax: 2 }, 
        attack1: { imageSrc: './img/characters/samuraiMack/Attack1.png', framesMax: 6 },
        takeHit: { imageSrc: './img/characters/samuraiMack/Take Hit - white silhouette.png', framesMax: 4 }, 
        death: { imageSrc: './img/characters/samuraiMack/Death.png', framesMax: 6 }, 
    },
    attackBox: {
        offset: { x: 100, y: 50 }, 
        width: 160,
        height: 50
    }
});

const enemy = new Fighter({
    position: { x: 400, y: 100 },
    velocity: { x: 0, y: 0 },
    color: 'blue',
   offset: { x: 50,y: 0},
    imageSrc: './img/characters/kenji/Idle.png', 
    framesMax: 4, 
    scale: 2.5,
    offset: { x: 215, y: 167 },
    sprites: {
        idle: { imageSrc: './img/characters/kenji/Idle.png', framesMax: 4 }, 
        run: { imageSrc: './img/characters/kenji/Run.png', framesMax: 8 },
        jump: { imageSrc: './img/characters/kenji/Jump.png', framesMax: 2 },
        fall: { imageSrc: './img/characters/kenji/Fall.png', framesMax: 2 }, 
        attack1: { imageSrc: './img/characters/kenji/Attack1.png', framesMax: 4 }, 
        attack2: { imageSrc: './img/characters/kenji/Attack2.png', framesMax: 4 }, 
        takeHit: { imageSrc: './img/characters/kenji/Take Hit.png', framesMax: 3 }, 
        death: { imageSrc: './img/characters/kenji/Death.png', framesMax: 7 }, 
    },
    attackBox: {
        offset: { x: -170, y: 50 }, 
        width: 170,
        height: 50
    }
});


//Game State Variables
console.log(player)
const keys = {
    a: { pressed: false },
    d: { pressed: false },
    ArrowRight: { pressed: false },
    ArrowLeft: { pressed: false }
};

let timer = 60;
let timerId;

function decreaseTimer() {
    if (timer > 0) {
        timerId = setTimeout(decreaseTimer, 1000);
        timer--;
        document.querySelector('#timer').innerHTML = timer;
    }
    
    if (timer === 0) {
        determineWinner({ player, enemy, timerId });
    }
}

function determineWinner({ player, enemy, timerId }) {
    clearTimeout(timerId); 
    document.querySelector('#displayText').style.display = 'flex'; 

    if (player.health === enemy.health) {
        document.querySelector('#displayText').innerHTML = 'Tie';
    } else if (player.health > enemy.health) {
        document.querySelector('#displayText').innerHTML = 'Player 1 Wins';
    } else if (player.health < enemy.health) {
        document.querySelector('#displayText').innerHTML = 'Player 2 Wins';
    }
}


function rectangularCollision({ rectangle1, rectangle2 }) {
    return (
        rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
        rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
        rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
    );
}


function animate() {
    window.requestAnimationFrame(animate);

    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);

    // update backgrounds
    backgroundLayer1.update();
    backgroundLayer2.update();
    backgroundLayer3.update(); 

    shop.update();

    player.update();
    enemy.update();



    player.velocity.x = 0; 
    enemy.velocity.x = 0;
 // player movement

  if (keys.a.pressed && player.lastKey === 'a') {
    player.velocity.x = -8
    player.switchSprite('run')
  } else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = 8
    player.switchSprite('run')
  } else {
    player.switchSprite('idle')
  }

  
  if (player.velocity.y < 0) {
    player.switchSprite('jump')
  } else if (player.velocity.y > 0) {
    player.switchSprite('fall')
  }

  // player2 movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
    enemy.velocity.x = -8
    enemy.switchSprite('run')
  } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
    enemy.velocity.x = 8
    enemy.switchSprite('run')
  } else {
    enemy.switchSprite('idle')
  }


  if (enemy.velocity.y < 0) {
    enemy.switchSprite('jump')
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite('fall')
  }

 
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit()
    player.isAttacking = false

    gsap.to('#enemyHealth', {
      width: enemy.health + '%'
    })
  }

  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false
  }

  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit()
    enemy.isAttacking = false

    gsap.to('#playerHealth', {
      width: player.health + '%'
    })
  }

  
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false
  }

  
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId })
  }
}

animate()
decreaseTimer();


window.addEventListener('keydown', (event) => {
  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true
        player.lastKey = 'd'
        break
      case 'a':
        keys.a.pressed = true
        player.lastKey = 'a'
        break
      case 'w':
        player.velocity.y = -20
        break
      case ' ':
        player.attack()
        break
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = true
        enemy.lastKey = 'ArrowRight'
        break
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true
        enemy.lastKey = 'ArrowLeft'
        break
      case 'ArrowUp':
        enemy.velocity.y = -20
        break
      case 'ArrowDown':
        enemy.attack()

        break
    }
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
  }


  switch (event.key) {
    case 'ArrowRight':
      keys.ArrowRight.pressed = false
      break
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false
      break
  }
})