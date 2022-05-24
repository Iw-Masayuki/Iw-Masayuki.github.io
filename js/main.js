'use strict';

const WIDTH = 720;
const HEIGHT = 540;
const MESH = 24;
const MAG = 6;
const TIMER_INTERVAL = 24;

let gStyle = '#00ffff';
let gX = WIDTH / 2;
let gY = HEIGHT - MESH * 3;
let gScore = 0;
let gLife = 5;
let gKey = new Uint8Array( 0x100 );
let gTimer;
let gBall = [];

let gColor = ["#ff0000", "#ff00ff", "#00ff00", "#ffff00", "#00d0ff", "#ff8400", "#00d0ff", "#00ff88"];

//敵ボールクラス
class Ball {
  constructor( c ) {
    this.mX = WIDTH / 2;
    this.mY = MESH;
    let a = Math.random() * 2.5 + (Math.PI - 2.5) / 2;
    this.mDX = Math.cos(a);
    this.mDY = Math.sin(a);
    this.mStyle = gColor[ c ];
  }
  draw(g) {
    g.fillStyle = this.mStyle;
    g.fillRect(this.mX - MAG, this.mY - MAG, MAG * 2, MAG * 2);
  }
  //敵の移動メソッド
  tick() {
    if (IsInRect(this.mX, this.mY, gX, gY, MESH, MESH )) {
      return(true);
    }

    this.mX += this.mDX;
    this.mY += this.mDY;

    if (this.mX < MESH || this.mX > WIDTH - MESH) {
      this.mDX = -this.mDX;
      this.mX += this.mDX;
      gScore += 1;
    }
    if (this.mY < MESH || this.mY > HEIGHT - MESH) {
      this.mDY = -this.mDY;
      this.mY += this.mDY;
      gScore += 1;
    }

    return(false);
  }
}
//当たり判定関数
function IsInRect(x, y, rx, ry, rw, rh) {
  return(rx < x && x < rx + rw &&
         ry < y && y < ry + rh);
}

//描画関数
function draw() {
  let g = document.getElementById("main").getContext("2d");

  g.fillStyle = "#ffffff";
  g.fillRect(0,0,WIDTH,HEIGHT);
  g.fillStyle = "#000000";
  g.fillRect(MESH, MESH, WIDTH - MESH * 2, HEIGHT - MESH * 2);

  g.fillStyle = gStyle;
  g.fillRect(gX,gY,MESH,MESH);

  for (let b of gBall) {
    b.draw(g);
  }

  g.font = "36px monospace";
  g.fillStyle = "#ffffff";
  g.fillText("SCORE " + gScore, MESH * 2, MESH * 2.5);
  g.fillText("HP " + gLife, MESH * 23, MESH * 2.5);

  //ゲームオーバー
  if (gLife <= 0) {
    g.fillStyle = "#ffffff";
    g.fillRect(200,200,WIDTH / 2,HEIGHT / 3);

    g.fillStyle = "#ff0000";
    g.font = "60px monospace";
    g.fillText("GAME OVER", WIDTH / 2 - MESH * 5, HEIGHT / 2 + MESH);
    g.font = "30px monospace";
    g.fillText("F5キーで再スタート", WIDTH / 2 - MESH * 5, HEIGHT / 2 + MESH * 3);
  }

}

//敵ボールインスタンス
function start() {
  for (let i = 0; i < 8; i++) {
    gBall.push(new Ball( i % 8 ));
  }
}


//ボールの移動操作
function tick() {
  if (gLife <= 0) {
    return;
  }

  gX = Math.max(MESH              ,gX - gKey[37] * MAG);
  gX = Math.min(WIDTH - MESH * 2  ,gX + gKey[39] * MAG);
  gY = Math.max(MESH              ,gY - gKey[38] * MAG);
  gY = Math.min(HEIGHT - MESH * 2 ,gY + gKey[40] * MAG);

  // for (let i = 0; i < 4 + gScore / 40; i++) {
  for (let i = 0; i < 4; i++) {
    for (let i = gBall.length - 1; i >= 0 ; i--) {
      if (gBall[ i ].tick()) {
        gLife--;
        gStyle = gBall[ i ].mStyle;
        gBall.splice(i, 1);
      }
    }
  }
  if (gScore % 100 === 0 && gScore !== 0) {
    for (let i = 1; i < 1.5; i++) {
      gBall.push(new Ball( i * (Math.floor(Math.random() * 8))));
    }
  }
}

//設定したTIMER_INTERVAL内のFPS制御
function onPaint() {
  if (!gTimer) {
    gTimer = performance.now();
  }
  if (gTimer + TIMER_INTERVAL < performance.now()) {
    gTimer += TIMER_INTERVAL;
    tick();
    draw();
  }

  requestAnimationFrame( onPaint );
}

//キー入力ON/OFF
window.onkeydown = function( ev ) {
  gKey[ ev.keyCode ] = 1;
}
window.onkeyup = function( ev ) {
  gKey[ ev.keyCode ] = 0;
}

window.onload = function() {
  start();
  requestAnimationFrame( onPaint );
}
