//import * as THREE from 'three';

class BubbleGame {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.bubbles = [];
        this.score = 0;
        this.maxBubbles = 20;
        this.gameOver = false;
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();



        this.init();
    }

    init() {
        // 设置渲染器
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000);
        document.body.appendChild(this.renderer.domElement);

        // 设置相机位置
        this.camera.position.z = 15;

        // 添加环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // 添加点光源
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(10, 10, 10);
        this.scene.add(pointLight);

        // 事件监听
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('pointerdown', (event) => this.onPointerDown(event));

        // 开始游戏循环
        this.animate();
        this.spawnBubble();
    }

    createBubble() {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const glowColor = new THREE.Color(Math.random(), Math.random(), Math.random());
        
        // 增强发光效果的材质
        const material = new THREE.MeshPhongMaterial({
            color: glowColor,
            transparent: true,
            opacity: 0.7,
            shininess: 200,
            specular: new THREE.Color(1, 1, 1),
            emissive: glowColor,
            emissiveIntensity: 0.8
        });
        const bubble = new THREE.Mesh(geometry, material);

        // 随机位置和速度
        bubble.position.set(
            (Math.random() - 0.5) * 20,
            -10,
            (Math.random() - 0.5) * 10
        );
        bubble.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            Math.random() * 0.1 + 0.05,
            (Math.random() - 0.5) * 0.1
        );

        return bubble;
    }

    spawnBubble() {
        if (this.gameOver) return;

        const bubble = this.createBubble();
        this.bubbles.push(bubble);
        this.scene.add(bubble);

        // 定时生成新泡泡
        setTimeout(() => this.spawnBubble(), 1000 + Math.random() * 1000);
    }

    updateBubbles() {
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];

            // 更新位置
            bubble.position.add(bubble.velocity);

            // 添加随机运动
            bubble.velocity.x += (Math.random() - 0.5) * 0.01;
            bubble.velocity.z += (Math.random() - 0.5) * 0.01;

            // 边界检查
            if (bubble.position.y > 10) {
                this.scene.remove(bubble);
                this.bubbles.splice(i, 1);
            }
        }

        // 检查游戏结束条件
        if (this.bubbles.length >= this.maxBubbles) {
            this.endGame();
        }
    }

    onPointerDown(event) {
        if (this.gameOver) return;

        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersects = this.raycaster.intersectObjects(this.bubbles);

        if (intersects.length > 0) {
            const bubble = intersects[0].object;
            const index = this.bubbles.indexOf(bubble);
            if (index > -1) {
                this.scene.remove(bubble);
                this.bubbles.splice(index, 1);
                this.updateScore(1);
            }
        }
    }

    updateScore(points) {
        this.score += points;
        document.getElementById('score').textContent = `分数: ${this.score}`;
    }

    endGame() {
        this.gameOver = true;
        document.getElementById('gameOver').style.display = 'block';
        document.getElementById('finalScore').textContent = this.score;
    }

    restartGame() {
        this.score = 0;
        this.gameOver = false;
        this.updateScore(0);

        // 清除所有泡泡
        for (const bubble of this.bubbles) {
            this.scene.remove(bubble);
        }
        this.bubbles = [];

        document.getElementById('gameOver').style.display = 'none';
        this.spawnBubble();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.updateBubbles();
        this.renderer.render(this.scene, this.camera);
    }
}

// 创建游戏实例
const game = new BubbleGame();

// 添加重新开始按钮事件监听
document.getElementById('restartButton').addEventListener('click', () => {
    game.restartGame();
});