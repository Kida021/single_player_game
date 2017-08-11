
/* global currentMap */
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
