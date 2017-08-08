/* global Img, currentMap, player, WIDTH, HEIGHT */
var ctx = document.getElementById("ctx").getContext("2d"); 
ctx.font = '20px Arial';
 var player;
var paused = false;
counter = 0;
time = 1000;
timeWhenGameStarted = Date.now();

//loading images
var Img = new Image();
Img.player = new Image();
Img.player.src = 'img/player.png';
Img.enemy = new Image();
Img.enemy.src = 'img/zubat.png';
Img.enemy1 = new Image();
Img.enemy1.src = 'img/oranguru.png';
Img.bullet = new Image();
Img.bullet.src = 'img/bullet3.png';
Img.bullet2 = new Image();
Img.bullet2.src = 'img/shadowball.png';
Img.upgrade1 = new Image();
Img.upgrade1.src = 'img/upgrade1.png';
Img.upgrade2 = new Image();
Img.upgrade2.src = 'img/upgrade2.png';
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
            width : entity2.width/2,
            height : entity2.height/2
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
    self.aimAngle = 0;
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
        if(self.atkCounter > 50){
            for(var i = 0; i < 180 ; i= i+30){
                generateBullet(self,-i);

            }
        }
    };
    return self;

};
//player entity
Player = function(){
  var self = Actor('player','id',40,30,40,50,Img.player,20,1);
    //player update position
    var super_update = self.update;
    self.update = function(){
        super_update();
        if(self.pressingMouseLeft){
            self.performAttack();
        }
    };
    self.score = 0;
    self.updatePostion = function(){
        if(self.pressingRight){
            self.x +=10;
        }
        if(self.pressingLeft){
            self.x -=10;
        }
        if(self.pressingDown){
            self.y +=10;
        }
        if(self.pressingUp){
            self.y -=10;
        }
        //check if the new position is in the frame
        if(self.x < self.width/2){
            self.x = self.width/2;
        }
        if(self.x > currentMap.width - self.width/2 ){
            self.x = currentMap.width - self.width/2;
        }
        if(self.y < self.height/2 ){
            self.y = self.height/2;
        }
        if(self.y > currentMap.height - self.height/2 ){
            self.y = currentMap.height - self.height/2;
        }
          
    };
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
        //var timeSurvived = Date.now() - timeWhenGameStarted;
        //window.alert("You lost! You survived for " + timeSurvived + "ms" + "\n Your Score is "+ score);
        startNewGame();               
    };
    //player movement
    self.pressingDown = false;
    self.pressingUp = false;
    self.pressingLeft = false;
    self.pressingRight = false;
    //mouse attacks
    self.pressingMouseLeft = false;
    self.pressingMouseRight = false;
    return self;
};
//creating the enemy entity
Enemy = function(id,x,y,height,width,img,hp,atkSpd){
    var self = Actor('enemy',id,x,y,width,height,img,hp,atkSpd);
    Enemy.List[id] = self;
    self.toRemove = false;
    var super_update = self.update;
    self.update = function(){
      super_update();
      self.updateAim();
    };
    self.updateAim = function(){
        var diffX =   player.x - self.x;
        var diffY =   player.y - self.y; 
        self.aimAngle = Math.atan2(diffY,diffX) / Math.PI * 180;
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
    self.updatePostion = function(){
      var diffX =   player.x - self.x;
      var diffY =   player.y - self.y;
      if(diffX >0){
          self.x +=3;
      }else{
          self.x -=3;
      }
      if(diffY >0){
          self.y +=3;
      }else{
          self.y -=3;
      }
    };
    self.onDeath = function(){
        self.toRemove = true;
        
    };
};
Enemy.List = {};
//function for generating enemy
randomlyGenerateEnemy = function (){
   var id = Math.random();
   var x = Math.random() * currentMap.width;
   var y = Math.random() * currentMap.height;
   var height = 64;
   var width = 64;
   var img;
   var hp;
   var atkspd;
   counter = 0;
   if(time === counter){
       time = time + 1000;
       img = Img.enemy1;
       hp = 50;
       atkspd = 3;
       console.log(time);
   }else{
       img = Img.enemy;
       hp = 3;
       height = 80;
       width = 80;
       atkspd = 1;
   }
       
   Enemy(id,x,y,height,width,img,hp,atkspd);
};
Enemy.update = function(){
    //generate enemy
    if(framecount % 50 === 0 )//generate enemy every 4 sec
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
            delete Enemy.List[key];
            player.score += 1;
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
   var x = Math.random() * currentMap.width;
   var y = Math.random() * currentMap.height;
   var height = 30;
   var width = 30;
   var category = '';
   if(Math.random() < 0.5){
       category = 'score';
       img = Img.upgrade1;
   }else{
       category = 'atkspd';
       img = Img.upgrade2;
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
    self.updatePostion =  function(){
        self.x += self.spdX;
        self.y += self.spdY;

        if(self.x < 0 || self.x > currentMap.width){
            self.spdX = -self.spdX;
        }
        else if(self.y < 0 || self.y > currentMap.height ){
            self.spdY = -self.spdY;
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
   var height = 30;
   var width = 30;
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
        Bullet.List[i].update();
        Bullet.List[i].timer++;
        var toRemove = false;
        if(Bullet.List[i].timer >=50){
            toRemove = true;
        }
        if (Bullet.List[i].combatType === 'player'){
            for(var key in Enemy.List){
                if(Bullet.List[i].testCollision(Enemy.List[key])){
                    toRemove = true;
                    Enemy.List[key].hp -= 1;
                }
            }
        } else if(Bullet.List[i].combatType === 'enemy'){
            if(Bullet.List[i].testCollision(player)){
                player.hp -= 1;
                toRemove = true;
            }
        }
        if(toRemove){
            delete Bullet.List[i];
        }
    }
};

