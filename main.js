var game = new Phaser.Game(480, 320, Phaser.AUTO, null, {preload: preload, create: create, update: update});

var ball;
var paddle;
var bricks;
var newBrick;
var brickInfo;
var scoreText;
var score = 0;
var lives = 3;
var livesText;
var lifeLostText;
var playing = false;
var startButton;


// 预加载资源函数，在游戏开始前加载所需的图像和精灵表等资源
function preload() {

     // 加载名为'paddle.png'的图像作为球拍的图像资源，键名为'paddle'
     // 加载名为'brick.png'的图像作为砖块的图像资源，键名为'brick'
     // 加载名为'ball.png'的图像作为球的精灵表资源，每个帧的大小为20x20像素，键名为'ball'
     // 加载名为'button.png'的图像作为按钮的精灵表资源，每个帧的大小为120x40像素，键名为'button'
    
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;    // 设置游戏缩放模式为显示全部
    game.scale.pageAlignHorizontally = true;    // 设置水平方向页面对齐
    game.scale.pageAlignVertically = true;  // 设置垂直方向页面对齐
    game.stage.backgroundColor = '#eee';    // 设置游戏舞台的背景颜色为浅灰色
    game.load.image('paddle', 'paddle.png');    // 加载球拍的图像资源
    game.load.image('brick', 'brick.png');  // 加载砖块的图像资源
    game.load.spritesheet('ball', 'ball.png', 20, 20);  // 加载球的精灵表资源
    game.load.spritesheet('button', 'button.png', 120, 40); // 加载按钮的精灵表资源
}

// 创建游戏对象和设置初始状态的函数
function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);    // 启动物理引擎
    game.physics.arcade.checkCollision.down = false;    // 设置球与底部的碰撞检测为false
    ball = game.add.sprite(game.world.width*0.5, game.world.height-25, 'ball'); // 创建球精灵对象
    ball.animations.add('wobble', [0,1,0,2,0,1,0,2,0], 24); // 添加球的动画
    ball.anchor.set(0.5);   // 设置球的锚点在中心
    game.physics.enable(ball, Phaser.Physics.ARCADE);       // 启用球的物理引擎
    ball.body.collideWorldBounds = true;    // 设置球与世界边界碰撞
    ball.body.bounce.set(1);    //  设置球的弹性
    ball.checkWorldBounds = true;// 设置球检测世界边界
    ball.events.onOutOfBounds.add(ballLeaveScreen, this);

    paddle = game.add.sprite(game.world.width*0.5, game.world.height-5, 'paddle');
    paddle.anchor.set(0.5,1);
    game.physics.enable(paddle, Phaser.Physics.ARCADE);     // 启用球拍的物理引擎
    paddle.body.immovable = true;

    initBricks();       // 初始化砖块的函数调用

    textStyle = { font: '18px Arial', fill: '#0095DD' };
    scoreText = game.add.text(5, 5, 'Points: 0', textStyle);
    livesText = game.add.text(game.world.width-5, 5, 'Lives: '+lives, textStyle);
    livesText.anchor.set(1,0);
    // 创建生命值减少的提示文本，初始位置在游戏世界中心，使用textStyle样式
    lifeLostText = game.add.text(game.world.width*0.5, game.world.height*0.5, 'Life lost, tap to continue', textStyle);
    lifeLostText.anchor.set(0.5);   // 设置生命值减少的提示的锚点在中心
    lifeLostText.visible = false;   // 设置生命值减少的提示不可见


     // 创建开始游戏的按钮精灵对象，初始位置在游戏世界中心，使用'button'作为图像资源，
    // 点击按钮时调用startGame函数，传入当前作用域（this），按钮的不同状态对应精灵表中的不同帧（1, 0, 2）           
    startButton = game.add.button(game.world.width*0.5, game.world.height*0.5, 'button', startGame, this, 1, 0, 2);
    startButton.anchor.set(0.5);        // 设置开始游戏按钮的锚点在中心
}

// 游戏每一帧更新时调用的函数，用于处理游戏逻辑和物理碰撞等
function update() {
    // 处理球与球拍之间的物理碰撞，当碰撞发生时调用ballHitPaddle函数
    //下面同理，处理球与砖块之间的物理碰撞，当碰撞发生时调用ballHitBrick函数
    game.physics.arcade.collide(ball, paddle, ballHitPaddle);
    game.physics.arcade.collide(ball, bricks, ballHitBrick);
    if(playing) {
        // 控制球拍的水平位置跟随鼠标移动
        paddle.x = game.input.x || game.world.width*0.5;
    }
}

// 初始化砖块的函数
function initBricks() {
    brickInfo = {
        width: 50,
        height: 20,
        count: {
            row: 7,
            col: 3
        },
        offset: {
            top: 50,
            left: 60
        },
        padding: 10
    }
    bricks = game.add.group();  // 创建砖块组
    for(c=0; c<brickInfo.count.col; c++) {
        for(r=0; r<brickInfo.count.row; r++) {
            var brickX = (r*(brickInfo.width+brickInfo.padding))+brickInfo.offset.left;
            var brickY = (c*(brickInfo.height+brickInfo.padding))+brickInfo.offset.top;
            newBrick = game.add.sprite(brickX, brickY, 'brick');
            game.physics.enable(newBrick, Phaser.Physics.ARCADE);   // 启用砖块的物理引擎
            newBrick.body.immovable = true; // 设置砖块为不可移动
            newBrick.anchor.set(0.5);   // 设置砖块的锚点在中心
            bricks.add(newBrick);   // 将砖块添加到砖块组中
        }
    }
}

// 球碰撞到砖块时调用的函数
function ballHitBrick(ball, brick) {
    var killTween = game.add.tween(brick.scale);    // 创建一个缩小动画
    killTween.to({x:0,y:0}, 200, Phaser.Easing.Linear.None);
    // 砖块缩小动画结束后调用的函数
    killTween.onComplete.addOnce(function(){
        brick.kill();
    }, this);
    killTween.start();  // 开始执行缩小动画
    score += 10;
    scoreText.setText('Points: '+score);
    if(score === brickInfo.count.row*brickInfo.count.col*10) {
        alert('You won the game, congratulations!');
        location.reload();  // 重新加载页面，重新开始游戏
    }
}

// 球离开屏幕时调用的函数
function ballLeaveScreen() {
    lives--;
    if(lives) {
        livesText.setText('Lives: '+lives); // 更新生命值的显示
        lifeLostText.visible = true;    // 显示生命值减少的提示
        ball.reset(game.world.width*0.5, game.world.height-25); // 重置球的位置
        paddle.reset(game.world.width*0.5, game.world.height-5);    // 重置球拍的位置
        // 点击屏幕继续游戏
        game.input.onDown.addOnce(function(){
            lifeLostText.visible = false;
            ball.body.velocity.set(150, -150);
        }, this);
    }
    else {
        alert('You lost, game over!');
        location.reload();  // 重新加载页面，重新开始游戏
    }
}

// 球碰撞到球拍时调用的函数
function ballHitPaddle(ball, paddle) {
    ball.animations.play('wobble'); // 播放球的动画
    ball.body.velocity.x = -1*5*(paddle.x-ball.x);  // 设置球的水平速度
}

// 开始游戏的函数
function startGame() {
    startButton.destroy();  // 销毁开始游戏按钮
    ball.body.velocity.set(150, -150);  // 设置球的初始速度
    playing = true; // 设置游戏状态为正在游戏中
}