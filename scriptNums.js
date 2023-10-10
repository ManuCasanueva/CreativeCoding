//setup
const canvas = document.getElementById("canvas1")
const ctx = canvas.getContext("2d")
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gradient = ctx.createLinearGradient(0,0,canvas.width,canvas.height)
gradient.addColorStop(0, "red")
gradient.addColorStop(0.5, "gold")
gradient.addColorStop(1, "orangered")
ctx.fillStyle=gradient;
ctx.strokeStyle = "white"


console.log(ctx);


//Clase donde se setean las particulas
class Particle {
    constructor(effect) {
        this.effect = effect;
        this.radius = 20;
        this.number = Math.floor(Math.random() * 99 + 1);
        this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
        this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
        this.vx = Math.random() * 0.4 - 0.1;
        this.vy = Math.random() * 0.4 - 0.1;
        this.pushX = 0;
        this.pushY = 0;
        this.friction = 0.95;
    }
    
    draw(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "black";
        context.font = "20px Times New Roman";
        const text = this.number.toString();
        const textWidth = context.measureText(text).width;
        const textX = this.x - textWidth / 2;
        const textY = this.y + 6;
        context.fillText(text, textX, textY);
        context.fillStyle = "white";
    }

    update() {
        if (this.effect.mouse.pressed) {
            const dx = this.x - this.effect.mouse.x;
            const dy = this.y - this.effect.mouse.y;
            const distance = Math.hypot(dx, dy);
            const force = this.effect.mouse.radius / distance;
            if (distance < this.effect.mouse.radius) {
                const angle = Math.atan2(dy, dx);
                this.pushX += Math.cos(angle) * force;
                this.pushY += Math.sin(angle) * force;
            }
        }
        this.x += (this.pushX *= this.friction) + this.vx;
        this.y += (this.pushY *= this.friction) + this.vy;
        if (this.x < this.radius) {
            this.x = this.radius;
            this.vx *= -1;
        } else if (this.x > this.effect.width - this.radius) {
            this.x = this.effect.width - this.radius;
            this.vx *= -1;
        }
        if (this.y < this.radius) {
            this.y = this.radius;
            this.vy *= -1;
        } else if (this.y > this.effect.height - this.radius) {
            this.y = this.effect.height - this.radius;
            this.vy *= -1;
        }
    }

    reset() {
        this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
        this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
    }

    checkCollision(otherParticle) {
        const dx = otherParticle.x - this.x;
        const dy = otherParticle.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.radius + otherParticle.radius) {
            return true;
        }
        return false;
    }
}


//manejo de los efectos de las particular
class Effect {
    constructor(canvas, context){
        this.canvas = canvas;
        this.context = context
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.particles = [];
        this.numberOfParticles = 50;
        this.createParticles();

        this.mouse = {
            x:0,
            y:0,
            pressed:false,
            radius:150
        }

        window.addEventListener("resize", e =>{
            this.resize(e.target.window.innerWidth, e.target.window.innerHeight)
        })
        window.addEventListener("mousemove", e =>{
            if (this.mouse.pressed){
                this.mouse.x = e.x
                this.mouse.y = e.y  
            }
        })
        window.addEventListener("mousedown", e =>{
            this.mouse.pressed =true;
            this.mouse.x = e.x
            this.mouse.y = e.y
        })  
        window.addEventListener("mouseup", e =>{
            this.mouse.pressed=false;
        })

    }
    createParticles() {
        for (let i = 0; i < this.numberOfParticles; i++) {
            let valid = false;
            let particle;
            while (!valid) {
                valid = true;
                particle = new Particle(this);
                for (let j = 0; j < this.particles.length; j++) {
                    const existingParticle = this.particles[j];
                    const dx = existingParticle.x - particle.x;
                    const dy = existingParticle.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
    
                    if (distance < particle.radius + existingParticle.radius) {
                        valid = false;
                        break;
                    }
                }
            }
            this.particles.push(particle);
        }
    }
    handleParticles(context){
        //this.connectParticles(context)
        for (let i = 0; i < this.particles.length; i++) {
            const particleA = this.particles[i];
            for (let j = i + 1; j < this.particles.length; j++) {
                const particleB = this.particles[j];
                if (particleA.checkCollision(particleB)) {
                    // Las partículas colisionan, ajustar velocidades para el rebote
                    const dx = particleB.x - particleA.x;
                    const dy = particleB.y - particleA.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
    
                    const normalX = dx / distance;
                    const normalY = dy / distance;
    
                    const relativeVelocityX = particleB.vx - particleA.vx;
                    const relativeVelocityY = particleB.vy - particleA.vy;
    
                    const dotProduct = relativeVelocityX * normalX + relativeVelocityY * normalY;
    
                    // Calcular nuevas velocidades después del rebote
                    particleA.vx += dotProduct * normalX;
                    particleA.vy += dotProduct * normalY;
                    particleB.vx -= dotProduct * normalX;
                    particleB.vy -= dotProduct * normalY;
                }
            }
        }
        this.particles.forEach(particle =>{
            particle.draw(context)
            particle.update()
        })
    }
    connectParticles(context){
    //    const maxDistance = 100;
    //    for (let a = 0; a < this.particles.length; a++) {
    //         for (let b = a; b < this.particles.length; b++) { 
    //             const dx = this.particles[a].x -this.particles[b].x;
    //             const dy = this.particles[a].y -this.particles[b].y;
    //             const distance = Math.hypot(dx,dy);
    //             if(distance < maxDistance) {
    //                 context.save()
    //                 const opacity = 1 - (distance/maxDistance)
    //                 context.globalAlpha = opacity
    //                 context.beginPath();
    //                 context.moveTo(this.particles[a].x, this.particles[a].y)
    //                 context.lineTo(this.particles[b].x, this.particles[b].y);
    //                 context.stroke()
    //                 context.restore()
    //             }
    //         }
        
    //    } 
    }
    resize(width,height){
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        const gradient = ctx.createLinearGradient(0,0,width,height)
        gradient.addColorStop(0, "red")
        gradient.addColorStop(0.5, "gold")
        gradient.addColorStop(1, "orangered")
        this.context.fillStyle=gradient;
        this.context.strokeStyle = "black"
        this.particles.forEach(particle =>{
            particle.reset()
        } )
    }
}

const effect = new Effect(canvas, ctx);
effect.handleParticles(ctx);

function animate () {
    ctx.clearRect (0,0,canvas.width,canvas.height)
    effect.handleParticles(ctx);
    requestAnimationFrame(animate)
}
animate()