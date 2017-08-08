
/* global currentMap */
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
    currentMap.draw();
    framecount++;
    Bullet.update();
    Upgrade.update();
    Enemy.update();
   // updatePlayerPosition(player);
   player.update();
   //drawPlayer(player);
   ctx.fillText("HP: " + player.hp,10,30);
   ctx.fillText("boss spawn: " + time,150,30);
   ctx.fillText("Score: " + player.score ,350,30);
};

//creating a new game or reset the whole game
startNewGame = function(){
    time = 1000;
    player.hp = 20;
    timeWhenGameStarted = Date.now();
    framecount = 0;
    score = 0;
    enemyList = {};
    upgradeList = {};
    bulletList = {};
    for(var i =0; i < 3 ; i++){
    randomlyGenerateEnemy();
    }
};
//everything that is related to creating a map
Maps = function(id,imgSrc,width,height){
    var self = {
        id : id,
        image : new Image(),
        width : width,
        height : height
    };
    self.image.src = imgSrc;
    self.draw = function(){
         var x = WIDTH/2 - player.x;
        var y = HEIGHT/2 - player.y;
        ctx.drawImage(self.image,0,0,self.image.width,self.image.height,x,y,self.image.width*2,self.image.height*2);   
    };
    return self;
};
currentMap = Maps('field','img/map3.png',1846,1460);


player = play;
startNewGame();
// frame update
setInterval(update,40);
