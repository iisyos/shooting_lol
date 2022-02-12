const canvas =document.querySelector("canvas");
const c=canvas.getContext("2d");

canvas.width=innerWidth;
canvas.height=innerHeight;

const scoreEl=document.querySelector("#scoreEl");
const startGamebtn=document.querySelector("#startGameBtn");
const modalEl=document.querySelector("#modalEl");
const bigscoreEl=document.querySelector("#bigscoreEl")



class Player {
    constructor(x,y,radius,color){
        this.x=x;
        this.y=y;
        this.color=color;
        this.radius=radius;
    }
    draw(){
        c.beginPath();
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        c.fillStyle=this.color;
        c.fill();
    }

}

class Projectile{
    constructor(x,y,radius,color,velocity){
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.color=color;
        this.velocity=velocity;
    }
    draw(){
        c.beginPath();
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        c.fillStyle=this.color;
        c.fill();
    }
    update(){
        this.draw();
        this.x=this.x+this.velocity.x;
        this.y=this.y+this.velocity.y;

    }
}

class Enemy{
    constructor(x,y,radius,color,velocity){
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.color=color;
        this.velocity=velocity;
    }
    draw(){
        c.beginPath();
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        c.fillStyle=this.color;
        c.fill();
    }
    update(){
        this.draw();
        this.x=this.x+this.velocity.x;
        this.y=this.y+this.velocity.y;

    }
}

const friction =0.99;
class Particle{
    constructor(x,y,radius,color,velocity){
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.color=color;
        this.velocity=velocity;
        this.alpha=1;
    }
    draw(){
        c.save()
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        c.fillStyle=this.color;
        c.fill();
        c.restore();
    }
    update(){
        this.draw();
        this.velocity.x*=friction;
        this.velocity.y*=friction;

        this.x=this.x+this.velocity.x;
        this.y=this.y+this.velocity.y;
        this.alpha-=0.01

    }
}


const x= canvas.width/2;
const y= canvas.height/2;

let player= new Player(x,y,10,"white");
player.draw();
console.log(player);


const projectile = new Projectile(x,y,5,"red",{x:1,y:1});

let projectiles=[];
let enemies=[];
let particles=[];

function init(){
    player= new Player(x,y,10,"white");
    projectiles=[];
    enemies=[];
    particles=[];
    score=0;
    scoreEl.innerHTML=score;
    scoreEl.innerHTML=score;
};

function spawnEnemies(){
    setInterval(()=>{
        const radius=Math.random()*(30-4)+4;

        let xlocal;
        let ylocal;
        if(Math.random()<0.5){
            xlocal=Math.random()<0.5?0-radius:x*2+radius;
            ylocal=Math.random()*y*2;
        }else{
            xlocal=Math.random()*x*2;
            ylocal=Math.random()<0.5?0-radius:y*2+radius;

        }

        
        // const xlocal=Math.random()<0.5?0-radius:canvas.width+radius;
        // const ylocal=Math.random()<0.5?0-radius:canvas.height+radius;
        const color=`hsl(${Math.random()*360},50%,50%)`;
        const angle=Math.atan2(y-ylocal,x-xlocal);
    const velocity={x:Math.cos(angle),y:Math.sin(angle)};

        enemies.push(new Enemy(
            xlocal,ylocal,radius,color,velocity

        ));
    },1000);

};

let animationID;
let score=0;
function animate(){

    animationID=requestAnimationFrame(animate);
    // console.log("go");
    c.fillStyle="rgba(0,0,0,0.1)";

    c.fillRect(0,0,x*2,y*2);
    player.draw();
    particles.forEach((particle,index)=>{
        if(particle.alpha<=0){
            particles.splice(index,1);
        }else{
            particle.update();

        }

    })

    projectiles.forEach((projectile,index)=>{
        projectile.update();
        if(projectile.x + projectile.radius< 0 || 
            projectile.x-projectile.radius>canvas.width ||
            projectile.y+projectile.radius<0 ||
            projectile.y-projectile.radius>canvas.height){
            setTimeout(()=>{
            projectiles.splice(index,1);
            },0);
            
        }

    })
    enemies.forEach((enemy,index)=>{
        enemy.update();
        const dist=Math.hypot(player.x-enemy.x,player.y-enemy.y);
        if(dist-enemy.radius-player.radius<1){
            cancelAnimationFrame(animationID);
            modalEl.style.display="flex";
            bigscoreEl.innerHTML=score;

        }

        projectiles.forEach((projectile,projectileIndex)=>{
        const dist=Math.hypot(projectile.x-enemy.x,projectile.y-enemy.y);
        if(dist-enemy.radius-projectile.radius<1){

            

            for(let i=0;i<enemy.radius*2;i++){
            particles.push(new Particle(projectile.x,projectile.y,Math.random()*2,enemy.color,{
                x:(Math.random()-0.5)*(Math.random()*6),y:(Math.random()-0.5)*(Math.random()*6)
            }))
        };
            if(enemy.radius-10>5){
                score+=100;
            scoreEl.innerHTML=score;
                gsap.to(enemy,{
                    radius:enemy.radius-10
                });
                enemy.radius-=10;

                setTimeout(()=>{
                projectiles.splice(projectileIndex,1);
                },0);

            }else{
                score+=250;
            scoreEl.innerHTML=score;
                setTimeout(()=>{
                    enemies.splice(index,1);
                projectiles.splice(projectileIndex,1);
                },0);
            };
         
            
        }

    
        })

    })

}

startGamebtn.addEventListener("click",()=>{
    init();
    animate();
    spawnEnemies();
    modalEl.style.display="none";

})

window.addEventListener("click",(event)=>{
    const angle=Math.atan2(event.clientY-y,event.clientX-x);
    const velocity={x:Math.cos(angle)*6,y:Math.sin(angle)*6};
    projectiles.push(new Projectile(x,y,5,"white",velocity))
    
})

