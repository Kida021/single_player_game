
/* global currentMap */
/* global Img, Maps.current, player, WIDTH, HEIGHT, Maps */
var ctx = document.getElementById("ctx").getContext("2d"); 
ctx.font = '18px Arial';
 var player;
var paused = false;
counter = 0;
time = 500;
timeWhenGameStarted = Date.now();

//loading images
var Img = new Image();
Img.player = new Image();
Img.player.src = 'img/player_sprite3.png';
Img.enemy = new Image();
Img.enemy.src = 'img/mush_sprite.png';
Img.enemy1 = new Image();
Img.enemy1.src = 'img/wolfman_sprite.png';
Img.enemy2 = new Image();
Img.enemy2.src = 'img/eyeball_sprite.png';
Img.enemy3 = new Image();
Img.enemy3.src = 'img/snake_boss.png';
Img.bullet = new Image();
Img.bullet.src = 'img/bulletB.png';
Img.bullet2 = new Image();
Img.bullet2.src = 'img/shadowball.png';
Img.upgrade1 = new Image();
Img.upgrade1.src = 'img/health.png';
Img.upgrade2 = new Image();
Img.upgrade2.src = 'img/atkspd.png';
Img.upgrade3 = new Image();
Img.upgrade3.src = 'img/spAtk.png';
//constants
var framecount = 0;

//creating an entity
Entity = function(type,id,x,y,width,height,img){
    var self = {
        type : type,
        id : id , 
        x : x ,
        y : y,
        width : width,
        height : height,
        img : img
    };
    self.update =  function(){
        self.draw();
        self.updatePostion();
    };
    self.updatePostion = function(){
        
    };
    // getting the distance between the player and the enemy
    self.getDistance = function(entity2){
        var vx = self.x - entity2.x;
        var vy = self.y - entity2.y;
        return Math.sqrt((vx * vx) + (vy * vy));
    };

//testing if the player and enemy is colliding.
    self.testCollision = function(entity2){
        var rect1 = {
            x : self.x - self.width/2,
            y : self.y - self.height/2,
            width : self.width,
            height : self.height
        };
        var rect2 = {
            x : entity2.x - entity2.width/2,
            y : entity2.y - entity2.height/2,
            width : entity2.width,
            height : entity2.height
        };
        return testCollisionRect(rect1,rect2);
    };   
    self.draw = function(){
        ctx.save();
        var x = self.x - player.x;
        var y = self.y - player.y;
        x += WIDTH/2;
        y += HEIGHT/2;
        x -= self.width/2;
        y -= self.height/2;
        
        //ctx.drawImage(self.img, x, y);
        ctx.drawImage(self.img,0,0, self.img.width,self.img.height,x,y,self.width,self.height);
        ctx.restore();
    };
    return self;
    
};
Actor = function(type,id,x,y,width,height,img,hp,attkspd){
    var self = Entity(type,id,x,y,width,height,img);
    self.hp = hp;
    self.hpMax = hp;
    self.attkspd = attkspd;
    self.atkCounter = 0;
    self.spAtk = 1;
    self.aimAngle = 0;
    self.spriteAnimCounter = 0;
    self.directionMod = 3;
    self.maxMoveSpd =3;
    //player movement
    self.pressingDown = false;
    self.pressingUp = false;
    self.pressingLeft = false;
    self.pressingRight = false;
    var super_update = self.update;
    self.update= function(){
        super_update();
        self.atkCounter += self.attkspd;
        if(self.hp <= 0){
            self.onDeath();
        }
    };
    self.onDeath = function(){};
    self.performAttack = function(){
        if(self.atkCounter > 25){
            self.atkCounter = 0;
            generateBullet(self);
        }
    };
    self.performSpAttack = function(){
        if(self.spAtk !== 0){
            for(var i = 0; i < 360 ; i = i + 36){
                generateBullet(self, i);
            }
            self.spAtk -= 1;
        }
    };
    self.draw = function(){
        ctx.save();
        var x = self.x - player.x;
        var y = self.y - player.y;
        x += WIDTH/2;
        y += HEIGHT/2;
        x -= self.width/2;
        y -= self.height/2;
        var frameWidth = self.img.width/3;
        var frameHeight= self.img.height/4;
        var aimAngle = self.aimAngle;
        if(aimAngle < 0){
            aimAngle = 360 + aimAngle;
        }
        var directionMod = self.directionMod;
        if(aimAngle >=45 && aimAngle < 135){
            directionMod = 2;
        }else if(aimAngle >=135 && aimAngle < 225){
            directionMod = 1;
        }else if(aimAngle >=225 && aimAngle < 315){
            directionMod = 0;
        } 
        var walkingMOd = Math.floor(self.spriteAnimCounter) % 3;
        ctx.drawImage(self.img,walkingMOd * frameWidth,directionMod * frameHeight,frameWidth ,frameHeight,x,y,self.width,self.height);
        ctx.restore();
    };
    self.updatePostion = function(){
        var rightBumper = {x:self.x + 30, y:self.y}; 
        var leftBumper = {x:self.x - 30, y:self.y};
        var upBumper = {x:self.x , y:self.y - 16}; 
        var downBumper = {x:self.x , y:self.y + 40}; 
        if(Maps.current.isPositionWall(rightBumper)){
            self.x -= 1;
            
        }else{
            if(self.pressingRight){
                self.x +=self.maxMoveSpd;
                self.directionMod  = 3 ;
            }
        }
        if(Maps.current.isPositionWall(leftBumper)){
            self.x +=1;
        }else{
            if(self.pressingLeft){
                self.x -=self.maxMoveSpd;
                self.directionMod  = 1 ;
            }
        }
        if(Maps.current.isPositionWall(downBumper)){
            self.y -= 1;
        }else{
            if(self.pressingDown){
                self.y +=self.maxMoveSpd;
                self.directionMod  = 2 ;
            }
        }
        if(Maps.current.isPositionWall(upBumper)){
            self.y +=1;
        }else{
            if(self.pressingUp){
                self.directionMod  = 0 ;
                self.y -=self.maxMoveSpd;
            }
        }
        //check if the new position is in the frame
        if(self.x < self.width/2){
            self.x = self.width/2;
        }
        if(self.x > Maps.current.width - self.width/2 ){
            self.x = Maps.current.width - self.width/2;
        }
        if(self.y < self.height/2 ){
            self.y = self.height/2;
        }
        if(self.y > Maps.current.height - self.height/2 ){
            self.y = Maps.current.height - self.height/2;
        }
          
    };
    return self;

};
//player entity
Player = function(){
  var self = Actor('player','id',40,30,60,60,Img.player,20,1);
    //player update position
    self.maxMoveSpd = 10;
    var super_update = self.update;
    self.update = function(){
        super_update();
        if(self.pressingRight || self.pressingLeft || self.pressingDown || self.pressingUp)
        {
        self.spriteAnimCounter += 0.2;
        }
        if(self.pressingMouseLeft){
            self.performAttack();
        }
    };
    
    self.score = 0;
    
    //drawing HP bar on enemy
    var super_draw = self.draw;
    self.draw = function(){
      super_draw();
      var x = self.x - player.x + WIDTH/2;
        var y = self.y - player.y + HEIGHT/2 - self.height/2 - 20;
        ctx.save();
        ctx.fillStyle = 'red';
        var width = 100 * self.hp/self.hpMax;
        if(width <= 0){
            width = 0;
        }
        ctx.fillRect(x-50,y,width,10);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(x-50,y,100,10);
        ctx.restore();
        
    };
    //on death of the player do this.
    self.onDeath = function(){
        var timeSurvived = Date.now() - timeWhenGameStarted;
        window.alert("You lost! You survived for " + timeSurvived + "ms" + "\n Your Score is "+ score);
        startNewGame();               
    };
    
    //mouse attacks
    self.pressingMouseLeft = false;
    return self;
};
//creating the enemy entity
Enemy = function(id,x,y,height,width,img,hp,atkSpd,etype){
    var self = Actor('enemy',id,x,y,width,height,img,hp,atkSpd);
    self.etype = etype;
    Enemy.List[id] = self;
    self.toRemove = false;
    var super_update = self.update;
    self.update = function(){
        super_update();
        self.updateAim();
        self.updatekeyPress();
        self.spriteAnimCounter += 0.2;
    };
    self.updateAim = function(){
        var diffX =   player.x - self.x;
        var diffY =   player.y - self.y; 
        self.aimAngle = Math.atan2(diffY,diffX) / Math.PI * 180;
    };
    self.updatekeyPress = function(){
        var diffX =   player.x - self.x;
        var diffY =   player.y - self.y; 
        self.pressingRight = diffX > 3;
        self.pressingLeft = diffX < -3;
        self.pressingDown = diffY > 3;
        self.pressingUp = diffY < -3;
    };
    //drawing HP bar on enemy
    var super_draw = self.draw;
    self.draw = function(){
      super_draw();
      var x = self.x - player.x + WIDTH/2;
        var y = self.y - player.y + HEIGHT/2 - self.height/2 - 10;
        ctx.save();
        ctx.fillStyle = 'red';
        var width = 100 * self.hp/self.hpMax;
        if(width <= 0){
            width = 0;
        }
        ctx.fillRect(x-50,y,width,10);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(x-50,y,100,10);
        ctx.restore();
        
    };
    self.onDeath = function(){
        self.toRemove = true;
        
    };
};
Enemy.List = {};

//function for generating enemy
randomlyGenerateEnemy = function (){
   var id = Math.random();
   var x = Math.random() * Maps.current.width;
   var y = Math.random() * Maps.current.height;
   var height = 64 * 1.5;
   var width = 64 * 1.5;
   var img;
   var hp;
   var atkspd;
   var timeCounter = 1000;
   counter = 0;
   var etype = "";
   var repawn = {x:x, y:y};
   if(time === counter){
       etype = "boss";
       height = 64 * 2; 
       width = 64 * 2;
       timeCounter = timeCounter + 500;
       time = time + timeCounter;
       x = 250;
       y = 350;
       if(Math.random() < 0.95)
       {
            hp = 50;
            atkspd = 3;
            img = Img.enemy1;
        }
       else{
            etype = "snake_boss";
            hp = 100;
            atkspd = 5;
            img = Img.enemy3;
       }
       
   }else{
       
       etype ="minion";
       
       if(Math.random() < 0.5)
       {
            img = Img.enemy;
        }
       else{
           
           img = Img.enemy2;
       }
       hp = 3;
       atkspd = 1;
       if(Maps.current.isPositionWall(repawn)){
            x = Math.random() * Maps.current.width;
            y = Math.random() * Maps.current.height;
        }
   }
       
   Enemy(id,x,y,height,width,img,hp,atkspd,etype);
};
Enemy.update = function(){
    //generate enemy
    if(framecount % 100 === 0 )//generate enemy every 4 sec
    {
             randomlyGenerateEnemy();
    }
    //colliding with the enemy
   for(var i in Enemy.List){
    Enemy.List[i].update();
    Enemy.List[i].performAttack();
   }
   //deleting the enemy and increasing the score
   for(var key in Enemy.List){
       if(Enemy.List[key].toRemove){
            if(Enemy.List[key].etype === "boss"){
                player.score +=50;
                delete Enemy.List[key];
            }else if(Enemy.List[key].etype === "snake_boss"){
                player.score +=100;
                delete Enemy.List[key];
            }else{
                player.score += 1;
                delete Enemy.List[key];
            }
       }
   }
};
//creating upgrades
Upgrade = function(id,x,y,height,width,category,img){
    var self = Entity('upgrade',id,x,y,width,height,img);
    self.category = category;
    Upgrade.List[id] = self;
};
Upgrade.List = {};
//random Generate Upgrades
randomlyGenerateUpgrade = function (){
   var id = Math.random();
   var x = Math.random() * Maps.current.width;
   var y = Math.random() * Maps.current.height;
   var height = 30;
   var width = 30;
   var category = '';
   var repawn = {x:x, y:y};
   if(Math.random() < 0.5){
       category = 'score';
       img = Img.upgrade1;
        if(Maps.current.isPositionWall(repawn)){
            var x = Math.random() * Maps.current.width;
            var y = Math.random() * Maps.current.height;
        }
   }else{
       category = 'atkspd';
       img = Img.upgrade2;
       if(Maps.current.isPositionWall(repawn)){
            var x = Math.random() * Maps.current.width;
            var y = Math.random() * Maps.current.height;
        }
   }
   if(framecount % 200 === 0){
       category = 'spAtk';
       img = Img.upgrade3;
       if(Maps.current.isPositionWall(repawn)){
          x = Math.random() * Maps.current.width;
          y = Math.random() * Maps.current.height;
        }
   }
   
   Upgrade(id,x,y,height,width,category,img);
};
Upgrade.update = function(){
    //generate upgrade
    if(framecount % 75 === 0 )//generate upgrades every 3 sec
    {
        randomlyGenerateUpgrade();    
    }
      //drawing and checking the collision with the upgrade
    for(var i in Upgrade.List){
        Upgrade.List[i].update();
        var isColliding = player.testCollision(Upgrade.List[i]);
        if(isColliding){
            if(Upgrade.List[i].category === 'score'){
               player.hp += 5;
               if(player.hp >20){
                   player.hp = 20;
               }
            }
            if(Upgrade.List[i].category === 'atkspd'){
                player.attkspd++;
            }
            if(Upgrade.List[i].category === 'spAtk'){
                player.spAtk += 1;
            }
            delete Upgrade.List[i];
        }
    }  
};

//creating upgrades
Bullet = function(id,x,spdX,y,spdY,height,width,combatType,img){
    
    var self = Entity('bullet',id,x,y,width,height,img);
    self.timer = 0;
    self.combatType = combatType;
    self.spdX = spdX;
    self.spdY = spdY;
    self.toRemove = false;
    self.updatePostion =  function(){
        self.x += self.spdX;
        self.y += self.spdY;

        if(self.x < 0 || self.x > Maps.current.width){
            self.spdX = -self.spdX;
        }
        else if(self.y < 0 || self.y > Maps.current.height ){
            self.spdY = -self.spdY;
        }
    };
    var super_update = self.update;
    self.update = function(){
        super_update();
        if(self.timer >=50){
            self.toRemove = true;
        }
        if (self.combatType === 'player'){
            for(var key in Enemy.List){
                if(self.testCollision(Enemy.List[key])){
                    self.toRemove = true;
                    Enemy.List[key].hp -= 1;
                }
            }
        } else if(self.combatType === 'enemy'){
            if(self.testCollision(player)){
                player.hp -= 1;
                self.toRemove = true;
            }
        }
        if(Maps.current.isPositionWall(self)){
            self.toRemove = true;
        }
    };
    Bullet.List[id] = self;
};
Bullet.List = {};
//random Generate Upgrades
generateBullet = function (actor,overwriteAngle){
   var id = Math.random();
   var x = actor.x;
   var y = actor.y;
   var height = 20;
   var width = 20;
   var angle = actor.aimAngle;
   if(overwriteAngle !== undefined){
       angle = overwriteAngle;
   }
   var spdX = Math.cos((angle/180) * Math.PI) * 5;
   var spdY = Math.sin((angle/180) * Math.PI) * 5;
   var img;
    if(actor.type === 'player'){
       img = Img.bullet;
   }
   else if(actor.type === 'enemy'){
       height = 20;
       width = 20;
       img = Img.bullet2;
   }
   Bullet(id,x,spdX,y,spdY,height,width,actor.type,img);
};
Bullet.update = function(){
        //draw the bullet
    for(var i in Bullet.List){
        var b =  Bullet.List[i];
        b.update();
        b.timer++;
        
        if(b.toRemove){
            delete Bullet.List[i];
        }
    }
};
var TILE_SIZE = 16*3;
var WIDTH = 500;
var HEIGHT = 500;
play = new Player();
//collision between two rectangle    
testCollisionRect = function(rect1,rect2){
    return rect1.x <= rect2.x + rect2.width
        && rect2.x <= rect1.x + rect1.width
        && rect1.y <= rect2.y + rect2.height
        && rect2.y <= rect1.y + rect1.height ;   

};
//movement of the player
document.onkeydown = function(event){
    if((event.keyCode === 68) || (event.keyCode === 39) ){ //d or right arrow
        player.pressingRight = true;
    }
    else if((event.keyCode === 83) || (event.keyCode === 40) ){ //s or down arrow
        player.pressingDown = true;
    }
    else if((event.keyCode === 65) || (event.keyCode === 37) ){ //a or down arrow
        player.pressingLeft = true;
    }
    else if((event.keyCode === 87) || (event.keyCode === 38) ){ //W or down arrow
        player.pressingUp = true;
    }
    else if (event.keyCode === 80){
        paused = !paused;
    }
};
document.onkeyup = function(event){
    if((event.keyCode === 68) || (event.keyCode === 39) ){ //d or right arrow
        player.pressingRight = false;
    }
    else if((event.keyCode === 83) || (event.keyCode === 40) ){ //s or left arrow
        player.pressingDown = false;
    }
    else if((event.keyCode === 65) || (event.keyCode === 37) ){ //a or down arrow
        player.pressingLeft = false;
    }
    else if((event.keyCode === 87) || (event.keyCode === 38) ){ //W or down arrow
        player.pressingUp = false;
    }
};    
//attack functionality of boath player and enemy
document.onmousemove =function(mouse){
    var mouseX  = mouse.clientX - document.getElementById('ctx').getBoundingClientRect().left;
    var mouseY  = mouse.clientY - document.getElementById('ctx').getBoundingClientRect().top;
    mouseX -=  WIDTH/2;
    mouseY -= HEIGHT/2 ;
    player.aimAngle = Math.atan2(mouseY,mouseX) / Math.PI * 180;
};
//shoot bullets when mouse is clicked.
document.onmousedown = function(mouse){
    if(mouse.which === 1){
        player.pressingMouseLeft = true;
    }else{
        player.pressingMouseRight = true;
    }   
};
document.onmouseup = function(mouse){
    if(mouse.which === 1){
        player.pressingMouseLeft = false;
    }else{
        player.pressingMouseRight = false;
    }   
}; 
//right click function
document.oncontextmenu = function(mouse){
    player.performSpAttack();
    mouse.preventDefault();
};

update = function(){
    if(paused){
        ctx.fillText('PAUSED',WIDTH/2,HEIGHT/2);
        return;
    }
    time--;
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    Maps.current.draw();
    framecount++;
    Bullet.update();
    Upgrade.update();
    Enemy.update();
   // updatePlayerPosition(player);
   player.update();
   //drawPlayer(player);
   ctx.save();
   ctx.fillStyle = "white";
   ctx.strokeStyle = 'black';
   ctx.lineWidth = 2;
   ctx.strokeText("HP: " + player.hp,10,30);
   ctx.strokeText("boss spawn: " + time,80,30);
   ctx.strokeText("SP.ATK: " + player.spAtk,240,30);
   ctx.strokeText("Score: " + player.score ,380,30);
   ctx.fillText("HP: " + player.hp,10,30);
   ctx.fillText("boss spawn: " + time,80,30);
   ctx.fillText("SP.ATK: " + player.spAtk,240,30);
   ctx.fillText("Score: " + player.score ,380,30);
   ctx.restore();
};

//creating a new game or reset the whole game
startNewGame = function(){
    time = 1000;
    player.hp = 20;
    timeWhenGameStarted = Date.now();
    framecount = 0;
    score = 0;
    Enemy.List = {};
    Upgrade.List = {};
    Bullet.List = {};
};
//everything that is related to creating a map
Maps = function(id,imgSrc,grid){
    var self = {
        id : id,
        image : new Image(),
        width : grid[0].length * TILE_SIZE,
        height : grid.length * TILE_SIZE,
        grid : grid
    };
    self.isPositionWall = function(pt){
        var gridX = Math.floor(pt.x / TILE_SIZE);
        var gridY = Math.floor(pt.y / TILE_SIZE);
        if(gridX < 0 || gridX >= self.grid[0].length){
            return true;
        }
        if(gridY < 0 || gridY >= self.grid.length){
            return true;
        }
        return self.grid[gridY][gridX];
        
    };
    self.image.src = imgSrc;
    self.draw = function(){
        var x = WIDTH/2 - player.x;
        var y = HEIGHT/2 - player.y;
        ctx.drawImage(self.image,0,0,self.image.width,self.image.height,x,y,self.image.width*3,self.image.height*3);   
    };
    return self;
};
var array = [
0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,0,0,
0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,
0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,
0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,0,0,
0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,
0,0,0,0,1,1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,
0,0,0,0,1,1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,
0,0,0,0,1,1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,
0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,
1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,
0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,
0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,
0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var array2d = [];
for(var i =0; i < 24; i++){
    array2d[i] = [];
    for(var j = 0; j < 32; j++){
        array2d[i][j] =array[i * 32 + j];
    }
}
Maps.current = Maps('field','img/map_sprite.png',array2d);
player = play;
startNewGame();
// frame update
setInterval(update,40);
