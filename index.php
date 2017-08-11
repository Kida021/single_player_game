<html lang="en">
    <head>
        <title>
           Hello 
        </title>
        <link href="css/style.css" type="text/css" rel="stylesheet">
    </head>
    <body>
        <div class="container">
            <div class="instructions">
                <h3>Instruction</h3>
                <p>Use W,A,S,D for movement</p>
                <p>Press P For Pausing the Game</p>
                <p>Left Mouse Button For Attack</p>
                <p>Right Mouse Button For <br>Special Attack</p><br>
                <h3>Upgrades</h3>
                <img id="health" src="img/health.png" width="30" height="30"/>
                <p class="desc"> Recovers 5 HP</p><br>
                <img id="atkspd" src="img/atkspd.png" width="30" height="30"/>
                <p class="desc"> Increase Attack Speed  by 1</p><br>
                <img id="spAtk" src="img/spAtk.png" width="30" height="30"/>
                <p class="desc">Give the Player To Use <br>Special Attack</p>  
            </div>
            
            <div class="game">
                <canvas id="ctx" width="500" height="500" style="border:1px solid #000000;"></canvas>
            </div>
            
        </div>
        <script src="js/function.js"></script>
                
    </body>
</html>
