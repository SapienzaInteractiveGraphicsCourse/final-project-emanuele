import * as THREE from './libs/three.module.js'
import { DRACOLoader } from "./libs/DRACOLoader.js"
import { GLTFLoader } from "./libs/GLTFLoader.js"
import { OrbitControls } from "./libs/OrbitControls.js"

var canvas, scene, dirLight, renderer, camera, skybox, materialArraySky
var playerObject
var torso, player, upper_chest, leg_left, up_leg_left, leg_right, up_leg_right, arm_left, forearm_left, hand_left, head, arm_right, forearm_right, hand_right, neck, floor, floor1
var step = 160

var defaultSpeed = 0.2
var speed = 0.0

var randBuildingPosLeft
var randBuildingPosRight

var enemiesNumber = 20
var obstaclesNumber = 5

var enemiesArray = []

//Colliders
var collider_system;
var colliders = [];

//UIs
var lifeCount = 5
var lifeLabel
var scoreLabel

//Light poles
var pointLights = []
var isDay = true


//Clock
var clock
const loadingManager = new THREE.LoadingManager()
const loading = document.getElementById("loading")
const loader = new GLTFLoader(loadingManager);
var loaded = false


var keyboard = {}

function init(){
    setUpClock()
    setUpUI()
    setUpColliderSystem()
    setUpCamera()
    setUpSkybox()
    setUpLight()
    setUpScene()
    animate()
}

loadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
    //console.log(itemsLoaded * 100 / itemsTotal)
    loading.innerHTML = Math.floor(itemsLoaded * 100 / itemsTotal) + " %"
};

loadingManager.onLoad = function ( ) {
    loaded = true
	setUpSpeed()
};

function setUpSpeed(){
    var loadedSpeed = window.localStorage.getItem("difficulty")
    speed = loadedSpeed === null ? defaultSpeed : loadedSpeed / 200
}

function getSpeed(){
    var loadedSpeed = window.localStorage.getItem("difficulty")
    var currentSpeed = loadedSpeed === null ? defaultSpeed : loadedSpeed / 200
    return currentSpeed
}

function setUpClock(){
    clock = new THREE.Clock();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('libs/draco/');
    loader.setDRACOLoader(dracoLoader);
}

function setUpUI(){
    var body = document.body;

    //LIFE
    var life = document.createElement('div');
    life.setAttribute('id', "life");
    life.className = "div life";
    body.appendChild(life);
    lifeLabel = document.createElement('label');
    lifeLabel.innerHTML = lifeCount;
    life.appendChild(lifeLabel);
    var logo = document.createElement('img');
    logo.src = "./assets/textures/life.png";
    logo.alt = " ";
    logo.height = "30";
    logo.width = "30";
    life.appendChild(logo);

    //SCORE
    var score = document.createElement('div');
    score.setAttribute('id', "score");
    score.className = "div score";
    body.appendChild(score);
    var scoreName= document.createElement('label');
    scoreName.innerHTML = "SCORE: ";
    score.appendChild(scoreName);
    scoreLabel = document.createElement('label');
    scoreLabel.innerHTML = 0;
    score.appendChild(scoreLabel);

}

function decreaseLife(){
    if(scoreLabel.innerHTML > 3){
        lifeCount -= 1
        lifeLabel.innerHTML = lifeCount

        if(lifeCount <= 0){
            clock.stop()
            player.position.y = -6
            var finalScore = document.getElementById("finalScore")
            finalScore.innerHTML = scoreLabel.innerHTML
            var modal = document.getElementById("modalGameover")
            modal.style.display = "block";
        }
    }
}

function increaseScore(){
    if(loaded) {
        scoreLabel.innerHTML =  Math.floor(clock.getElapsedTime())

        if(scoreLabel.innerHTML < 3) // Countdown
        {
            loading.setAttribute('class', 'countdown')
            loading.innerHTML = 3 - scoreLabel.innerHTML    
        } else // end countdown 
        {
            loading.innerHTML = ""
        }
    }
}

function setUpColliderSystem() {
    collider_system = new THREEx.ColliderSystem()
}

function setUpSkybox(){
    materialArraySky = []
    var texture_down = new THREE.TextureLoader().load("./assets/skybox/day_down.png")
    var texture_left = new THREE.TextureLoader().load("./assets/skybox/day_left.png")
    var texture_front = new THREE.TextureLoader().load("./assets/skybox/day_front.png")
    var texture_back = new THREE.TextureLoader().load("./assets/skybox/day_back.png")
    var texture_up = new THREE.TextureLoader().load("./assets/skybox/day_up.png")
    var texture_right = new THREE.TextureLoader().load("./assets/skybox/day_right.png")

    materialArraySky.push(new THREE.MeshBasicMaterial({map: texture_front}))
    materialArraySky.push(new THREE.MeshBasicMaterial({map: texture_back}))
    materialArraySky.push(new THREE.MeshBasicMaterial({map: texture_up}))
    materialArraySky.push(new THREE.MeshBasicMaterial({map: texture_down}))
    materialArraySky.push(new THREE.MeshBasicMaterial({map: texture_right}))
    materialArraySky.push(new THREE.MeshBasicMaterial({map: texture_left}))

    for(let i=0; i<6; i++)
        materialArraySky[i].side = THREE.BackSide

    var skyboxGeo = new THREE.BoxGeometry(100, 100, 160)
    skybox = new THREE.Mesh(skyboxGeo, materialArraySky)

}

function animatePlayerJump(){

    // JUMP
    createjs.Tween.get(up_leg_right.rotation).to({ x: 90 * Math.PI/180 }, 300, createjs.Ease.linear).to({ x: 180 * Math.PI/180 }, 300, createjs.Ease.linear);
    createjs.Tween.get(up_leg_left.rotation).to({ x: 90 * Math.PI/180 }, 300, createjs.Ease.linear).to({ x: 180 *Math.PI/180 }, 300, createjs.Ease.linear);

    //legs
    createjs.Tween.get(leg_right.rotation).to({ x: 90 * Math.PI/180 }, 300, createjs.Ease.linear).to({ x:  30 * Math.PI/180 }, 300, createjs.Ease.linear);
    createjs.Tween.get(leg_left.rotation).to({ x: 60 * Math.PI/180 }, 300, createjs.Ease.linear).to({ x: Math.PI/180 }, 300, createjs.Ease.linear);

    //arms
    createjs.Tween.get(arm_right.rotation, ).to({ y: -30 * Math.PI/180 }, 300, createjs.Ease.linear).to({ y: Math.PI/180 }, 300, createjs.Ease.linear);
    
    //Upper chest
    createjs.Tween.get(upper_chest.rotation).to({ x: 60 * Math.PI/180 }, 300, createjs.Ease.linear).to({ x: Math.PI/180 }, 300, createjs.Ease.linear);

    createjs.Tween.get(player.position).to({ y: 3 }, 300, createjs.Ease.linear).to({ y: 1.3 }, 300, createjs.Ease.linear);

}

function animatePlayer(){

    // JUMP
    // createjs.Tween.get(zombie_leg_right.rotation, { loop: true }).to({ x: Math.PI/180 }, 500, createjs.Ease.linear).to({ x: 190* Math.PI/180 }, 500, createjs.Ease.linear);
    // createjs.Tween.get(zombie_leg_left.rotation, { loop: true }).to({ x:  Math.PI/180 }, 500, createjs.Ease.linear).to({ x: 190 * Math.PI/180 }, 500, createjs.Ease.linear);

    //arms
    createjs.Tween.get(arm_right.rotation, { loop: true }).to({ y: 30 * Math.PI/180 }, 500, createjs.Ease.linear).to({ y: Math.PI/180 }, 500, createjs.Ease.linear);
    createjs.Tween.get(arm_left.rotation, { loop: true }).to({ y: Math.PI/180 }, 500, createjs.Ease.linear).to({ y: 60 * Math.PI/180 }, 500, createjs.Ease.linear);

    //forearms
    createjs.Tween.get(forearm_right.rotation, { loop: true }).to({ z: 120 * Math.PI/180 }, 500, createjs.Ease.linear).to({ z: Math.PI/180 }, 500, createjs.Ease.linear);
    createjs.Tween.get(forearm_left.rotation, { loop: true }).to({ x:  Math.PI/180 }, 500, createjs.Ease.linear).to({ x: 90 * Math.PI/180 }, 500, createjs.Ease.linear);

    //legs
    createjs.Tween.get(leg_right.rotation, { loop: true }).to({ x: 30 * Math.PI/180 }, 500, createjs.Ease.linear).to({ x: Math.PI/180 }, 500, createjs.Ease.linear);
    createjs.Tween.get(leg_left.rotation, { loop: true }).to({ x: Math.PI/180 }, 500, createjs.Ease.linear).to({ x: 60 * Math.PI/180 }, 500, createjs.Ease.linear);

    //uplegs
    createjs.Tween.get(up_leg_right.rotation, { loop: true }).to({ x: 180 * Math.PI/180 }, 500, createjs.Ease.linear).to({ x: 140 * Math.PI/180 }, 500, createjs.Ease.linear);
    createjs.Tween.get(up_leg_left.rotation, { loop: true }).to({ x: 140 * Math.PI/180 }, 500, createjs.Ease.linear).to({ x: 180 * Math.PI/180 }, 500, createjs.Ease.linear);

    //neck 
    createjs.Tween.get(neck.rotation, { loop: true }).to({ z: 5 * Math.PI/180 }, 500, createjs.Ease.linear).to({ z: -5 * Math.PI/180 }, 500, createjs.Ease.linear).to({ z: Math.PI/180 }, 500, createjs.Ease.linear);
}

function setUpLight() {
    var loadedScenario = window.localStorage.getItem("scenario")
    if(loadedScenario == "true" || loadedScenario === null){
        dirLight = new THREE.DirectionalLight('white', 2)
        skybox.material = materialArraySky
        isDay = true
        
    }else {
        dirLight = new THREE.DirectionalLight('skyblue', 0.8)
        skybox.material = new THREE.MeshToonMaterial({color: "violet"})
        isDay = false
    }

    dirLight.position.set(5, 10, 5)
}

function setUpCamera() {
    canvas = document.querySelector('.webgl')
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(0, 10, 10) // 0, 10, 5
    camera.rotation.x = (-40)*  Math.PI / 180

    var loadedAntialias = window.localStorage.getItem("antialias")
    var antialias = true;
    
    if(loadedAntialias == "true" || loadedAntialias === null){
        antialias = true;
    }else {
        antialias = false;
    }

    renderer = new THREE.WebGLRenderer({
        antialias: antialias,
        canvas: canvas
    })

    renderer.setSize(window.innerWidth, window.innerHeight)
    var resolutionFactor = window.localStorage.getItem("resolution")
    resolutionFactor = resolutionFactor === null ? 1.0 : resolutionFactor / 100
    renderer.setPixelRatio(window.devicePixelRatio * resolutionFactor) // resolution
    renderer.shadowMap.enabled = true
    renderer.gammaOutput = true
    window.addEventListener( 'resize', resize, false);

    //const controls = new OrbitControls( camera, renderer.domElement );
}

function resize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }

function setUpScene() {
    scene = new THREE.Scene()
    scene.add(dirLight)
    scene.add(skybox)
    scene.add(camera)

    loadPlayer()
    loadFloor()
    loadProps()
    loadEnemies()
}

function loadFloor(){
    const floorLenght = step

    const textureLoader = new THREE.TextureLoader();
    const grassNormalMap = textureLoader.load("./assets/textures/grass_normal_map.png");
    floor = new THREE.Mesh(new THREE.BoxGeometry(floorLenght, floorLenght, 1), new THREE.MeshPhongMaterial({ color: 0x0a7d15, normalMap: grassNormalMap }));
    floor.rotation.x = ( 90)*  Math.PI / 180
    floor.material.normalMap.wrapS = floor.material.normalMap.wrapT = THREE.RepeatWrapping
    floor.material.normalMap.repeat.x = floor.material.normalMap.repeat.y = 10
    floor.position.set(0, -1, 0);

    floor1 = new THREE.Mesh(new THREE.BoxGeometry(floorLenght, floorLenght, 1), new THREE.MeshPhongMaterial({ color: 0x0a7d15, normalMap: grassNormalMap }));
    floor1.rotation.x = ( 90)*  Math.PI / 180
    floor1.material.normalMap.wrapS = floor1.material.normalMap.wrapT = THREE.RepeatWrapping
    floor1.material.normalMap.repeat.x = floor1.material.normalMap.repeat.y = 10
    floor1.position.set(0, -1, -floorLenght);

    scene.add(floor);
    scene.add(floor1);
}

function animate() {
    //score
    increaseScore()

    //collisions
    for (var i = 0; i < colliders.length ; i++) {
        colliders[i].update();
    }

    collider_system.computeAndNotify(colliders);


    //movements
    for(var i=0; i < enemiesArray.length; i++){ //enemies
        var enemy = enemiesArray[i]

        if(enemy.position.z <= step/2){
            enemy.position.z += speed
        } else {
            enemy.position.z = -step/2
            enemy.position.x = getRandomValue(-3, 3)
        }
    }

    for(var i=0; i < pointLights.length; i++){ //light poles
        var light = pointLights[i]

        if(light.position.z <= step/2){
            light.position.z += speed
        } else {
            light.position.z = -step/2
        }
    }

    if(floor.position.z <= step){ // floors
        floor.position.z += speed
        floor1.position.z += speed
    }
    
    if(floor.position.z > step){
        floor.position.set(0, -1, -step + speed)
    }

    if(floor1.position.z > step){
        floor1.position.set(0, -1, -step + speed)
    }

    if(keyboard[39] && player.position.x <= 3){ // left arrow
        player.position.x += 0.2
    }

    if(keyboard[37] && player.position.x >= -2){ // right arrow
        player.position.x -= 0.2
    }

    if(keyboard[32] && player.position.y == 1.3){ // space key
        animatePlayerJump()
    }

    renderer.render(scene, camera)

    requestAnimationFrame(animate)
}

function getPropPositions(){
    var array = []
    for(var i = 0; i < 15; i++){
        array.push((i * 10.6) -80);
    }
    return array;
}

function popPropPosition(array){
    var randIndex = getRandomValue(0, array.length)
    var randPos = array.splice(randIndex, 1)[0];
    //console.log(randPos)
    //console.log(array)
    return randPos;
}

function loadEnemies(){
    loader.load('assets/models/spikes.glb', function (glb) {
        

        for (var i = 0; i < obstaclesNumber; i++) {
            var spikes = glb.scene.clone()
            scene.add(spikes)

            spikes.scale.set(3, 3, 4 * getSpeed())
            spikes.position.set(getRandomValue(-3, 3), -0.1, (i * step/obstaclesNumber) - 80)
            enemiesArray.push(spikes)


            //Collisions
            var spikes_box = new THREE.BoxGeometry(0.8, 0.5, 0.8); 
            var spikes_material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1, color:0x00ff00});
            var spikes_hitBox = new THREE.Mesh(spikes_box, spikes_material);
            spikes_hitBox.visible = false;
            spikes_hitBox.name= "spikes"
            scene.add(spikes_hitBox)
            spikes.add(spikes_hitBox)

            var colliderspikes = THREEx.Collider.createFromObject3d(spikes_hitBox)
            colliders.push(colliderspikes)
        }
    })

    loader.load('assets/player/zombie.gltf', function (gltf) {
        

        for (var i = 0; i < enemiesNumber; i++) {
            var zombieObject = cloneGltf(gltf).scene
            scene.add(zombieObject)

            var zombie = zombieObject.getObjectByName("HipsCtrl");
            var zombie_torso = zombieObject.getObjectByName("Chest");
            var zombie_head = zombieObject.getObjectByName("Head");
            var zombie_neck = zombieObject.getObjectByName("Neck");
            var zombie_leg_left = zombieObject.getObjectByName("LeftLeg");
            var zombie_up_leg_left = zombieObject.getObjectByName("LeftUpLeg");
            var zombie_leg_right = zombieObject.getObjectByName("RightLeg");
            var zombie_up_leg_right = zombieObject.getObjectByName("RightUpLeg");
            var zombie_arm_left = zombieObject.getObjectByName("LeftArm");
            var zombie_forearm_left = zombieObject.getObjectByName("LeftForeArm");
            var zombie_hand_left = zombieObject.getObjectByName("LeftHand");
            var zombie_arm_right = zombieObject.getObjectByName("RightArm");
            var zombie_forearm_right = zombieObject.getObjectByName("RightForeArm");
            var zombie_hand_right = zombieObject.getObjectByName("RightHand");


            zombie_forearm_right.rotation.z = (90) * Math.PI / 180
            zombie_forearm_left.rotation.x = (90) * Math.PI / 180

            //ANIMATIONS

            //forearms
            createjs.Tween.get(zombie_forearm_right.rotation, { loop: true }).to({ y: 20 * Math.PI / 180 }, 500, createjs.Ease.linear).to({ y: Math.PI / 180 }, 500, createjs.Ease.linear).to({ y: -20 * Math.PI / 180 }, 500, createjs.Ease.linear);
            createjs.Tween.get(zombie_forearm_left.rotation, { loop: true }).to({ z: -20 * Math.PI / 180 }, 500, createjs.Ease.linear).to({ z: 20 * Math.PI / 180 }, 500, createjs.Ease.linear).to({ z: Math.PI / 180 }, 500, createjs.Ease.linear);

            //legs
            createjs.Tween.get(zombie_leg_right.rotation, { loop: true }).to({ x: Math.PI / 180 }, 500, createjs.Ease.linear).to({ x: 10 * Math.PI / 180 }, 500, createjs.Ease.linear);
            createjs.Tween.get(zombie_leg_left.rotation, { loop: true }).to({ x: Math.PI / 180 }, 500, createjs.Ease.linear).to({ x: 10 * Math.PI / 180 }, 500, createjs.Ease.linear);

            //neck 
            createjs.Tween.get(zombie_neck.rotation, { loop: true }).to({ y: -20 * Math.PI / 180 }, 500, createjs.Ease.linear).to({ y: Math.PI / 180 }, 500, createjs.Ease.linear);
            createjs.Tween.get(zombie_neck.rotation, { loop: true }).to({ x: -20 * Math.PI / 180 }, 500, createjs.Ease.linear).to({ x: Math.PI / 180 }, 500, createjs.Ease.linear);

            zombie.scale.set(1.5, 1.5, 1.5)
            zombie.position.set(getRandomValue(-3, 3), 1.6, (i * step/enemiesNumber) - 80)
            enemiesArray.push(zombie)


            //Collisions
            var zombie_box = new THREE.BoxGeometry(1, 3, 1); 
            var zombie_material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1, color:0x00ff00});
            var zombie_hitBox = new THREE.Mesh(zombie_box, zombie_material);
            zombie_hitBox.visible = false;
            zombie_hitBox.name= "zombie"
            scene.add(zombie_hitBox)
            zombie.add(zombie_hitBox)

            var colliderZombie = THREEx.Collider.createFromObject3d(zombie_hitBox)
            colliders.push(colliderZombie)
        }
    })

}

function loadProps() {
    randBuildingPosLeft =  getPropPositions()
    randBuildingPosRight =  getPropPositions()


    loader.load('assets/models/light_curved.glb', function (glb) {
        

        for(var i = 0; i < 10; i++){
            if (i%2 == 0)
            {
                //RIGHT
                var prop = glb.scene.clone()
                prop.scale.set(10, 10, 10)
                prop.position.set( 14 , (i * step/10) -80, 0)
                scene.add(prop)
                prop.rotation.x = ( -90)*  Math.PI / 180
                prop.rotation.y = ( -90)*  Math.PI / 180
                floor.add(prop)
                floor1.add(prop.clone())

                if(!isDay){
                    //Light
                    var pointLight = new THREE.PointLight("yellow", 3, 10, 1)
                    pointLight.position.set(4.5, 5, (i * step/10) -80)
                    pointLights.push(pointLight)
                    scene.add(pointLight)
                }

            } else
            {
                //LEFT
                var prop = glb.scene.clone()
                prop.scale.set(10, 10, 10)
                prop.position.set( -13 , (i * step/10) -80, 0)
                scene.add(prop)
                prop.rotation.x = ( -90)*  Math.PI / 180
                prop.rotation.y = ( 90)*  Math.PI / 180
                floor.add(prop)
                floor1.add(prop.clone())

                if(!isDay){
                    //Light
                    var pointLight = new THREE.PointLight("yellow", 3, 10, 1)
                    pointLight.position.set(-3.5, 5, (i * step/10) -80)
                    pointLights.push(pointLight)
                    scene.add(pointLight)
                }
            }
        }
        
    })

    loader.load('assets/models/treeLarge.glb', function (glb) {
        loader.load('assets/models/treeFallLarge.glb', function (glb2) {
            

            for(var i = 0; i < 30; i++){

                //RIGHT
                var randGlb = Math.random() > 0.5 ? glb : glb2;
                var prop = randGlb.scene.clone()
                prop.scale.set(4, 4, 4)
                prop.position.set( -8 + getRandomValue(-1, 1),  (i * step/30) - 80, 0)
                scene.add(prop)
                prop.rotation.x = ( -90)*  Math.PI / 180
                floor.add(prop)
                floor1.add(prop.clone())

                //LEFT
                var randGlb = Math.random() > 0.5 ? glb : glb2;
                var prop = randGlb.scene.clone()
                prop.scale.set(4, 4, 4)
                prop.position.set( 8 + getRandomValue(-1, 1),  (i * step/30) - 80, 0)
                scene.add(prop)
                prop.rotation.x = ( -90)*  Math.PI / 180
                floor.add(prop)
                floor1.add(prop.clone())
            }
        })
    })

    loader.load('assets/models/road_straight.glb', function (glb) {
        

        var prop = glb.scene.clone()
        prop.scale.set(180, 10, 10)
        prop.position.set( 8, 0, -20)
        scene.add(prop)
        prop.rotation.y = ( -90)*  Math.PI / 180
    })

    loadBuilding('house_type01.glb', 2)
    loadBuilding('house_type04.glb', 2)
    loadBuilding('house_type07.glb', 2)
    loadBuilding('house_type10.glb', 2)
    loadBuilding('house_type13.glb', 2)
    loadBuilding('house_type17.glb', 2)
    loadBuilding('house_type21.glb', 3)

}

function loadBuilding(buildingFilename, count){
    loader.load('assets/models/' + buildingFilename, function (glb) {
         // it adds overall 7 buildings

        for(var i = 0; i < count; i++){

            //RIGHT
            var prop = glb.scene.clone()
            prop.scale.set(10, 10, 10)
            prop.position.set( 20, popPropPosition(randBuildingPosRight), 0)
            scene.add(prop)
            prop.rotation.x = ( -90 )*  Math.PI / 180
            prop.rotation.y = (90 )*  Math.PI / 180
            floor.add(prop)
            floor1.add(prop.clone())

            //LEFT
            var prop = glb.scene.clone()
            prop.scale.set(10, 10, 10)
            prop.position.set(-20, popPropPosition(randBuildingPosLeft), 0)
            prop.rotation.y = (90 )*  Math.PI / 180
            scene.add(prop)
            prop.rotation.x = ( -90)*  Math.PI / 180
            floor.add(prop)
            floor1.add(prop.clone())
        }
    })

}

function getRandomValue(min, max) {
    return Math.random() * (max - min) + min;
  }

function loadPlayer() {

    loader.load('assets/player/player.gltf', function (gltf) {
        loader.load('assets/player/player2.gltf', function (gltf2) {

            

            var loadedPlayer = window.localStorage.getItem("player")
            if(loadedPlayer == "true" || loadedPlayer === null){
                playerObject = gltf.scene
                
            }else {
                playerObject = gltf2.scene
            }

            scene.add(playerObject)

            player = playerObject.getObjectByName("HipsCtrl");
            torso = playerObject.getObjectByName("Chest");
            head = playerObject.getObjectByName("Head");
            neck = playerObject.getObjectByName("Neck");
            leg_left = playerObject.getObjectByName("LeftLeg");
            up_leg_left = playerObject.getObjectByName("LeftUpLeg");
            leg_right = playerObject.getObjectByName("RightLeg");
            up_leg_right = playerObject.getObjectByName("RightUpLeg");
            arm_left = playerObject.getObjectByName("LeftArm");
            forearm_left = playerObject.getObjectByName("LeftForeArm");
            hand_left = playerObject.getObjectByName("LeftHand");
            arm_right = playerObject.getObjectByName("RightArm");
            forearm_right = playerObject.getObjectByName("RightForeArm");
            hand_right = playerObject.getObjectByName("RightHand");
            upper_chest = playerObject.getObjectByName("UpperChest");

            arm_right.rotation.z = 180 * Math.PI / 180;
            arm_right.rotation.x = 230 * Math.PI / 180;

            arm_left.rotation.z = 180 * Math.PI / 180;
            arm_left.rotation.x = 140 * Math.PI / 180;

            player.scale.set(1.2, 1.2, 1.2)
            player.position.y = 1.3

            player.rotation.y = 180 * Math.PI / 180;
            player.rotation.x = 0 * Math.PI / 180;

            up_leg_right.rotation.x = 140 * Math.PI / 180;
            forearm_left.rotation.x = 90 * Math.PI / 180;

            //Collisions
            var player_box = new THREE.BoxGeometry(0.8, 2, 0.5); 
            var player_material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1, color:0xff0000});
            var player_hitBox = new THREE.Mesh(player_box, player_material);
            player_hitBox.visible = false;
            scene.add(player_hitBox)
            player.add(player_hitBox)

            var colliderPlayer = THREEx.Collider.createFromObject3d(player_hitBox)
            colliders.push(colliderPlayer)

            colliderPlayer.addEventListener('contactEnter', function (collider) {
                if(collider.object3d.name == "zombie" || collider.object3d.name == "spikes"){
                    damagePlayer()
                }
            })

            animatePlayer()
        })
    })
  }

  function damagePlayer() {
    decreaseLife()

    playerObject.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.transparent = true;
        var materialChild = child.material;
        createjs.Tween.get(materialChild).to({ opacity: 0}, 200, createjs.Ease.linear).to({ opacity: 1 }, 200, createjs.Ease.linear)
        .to({ opacity: 0}, 200, createjs.Ease.linear).to({ opacity: 1 }, 200, createjs.Ease.linear)
        .to({ opacity: 0}, 200, createjs.Ease.linear).to({ opacity: 1 }, 200, createjs.Ease.linear)
      }
    });
  }
  
  function keyDown(event){
    keyboard[event.keyCode] = true
    //console.log(event.keyCode)
  }

  function keyUp(event){
    keyboard[event.keyCode] = false
  }

  window.addEventListener('load', init)
  window.addEventListener('keydown', keyDown)
  window.addEventListener('keyup', keyUp)


  const cloneGltf = (gltf) => {
    const clone = {
      animations: gltf.animations,
      scene: gltf.scene.clone(true)
    };
  
    const skinnedMeshes = {};
  
    gltf.scene.traverse(node => {
      if (node.isSkinnedMesh) {
        skinnedMeshes[node.name] = node;
      }
    });
  
    const cloneBones = {};
    const cloneSkinnedMeshes = {};
  
    clone.scene.traverse(node => {
      if (node.isBone) {
        cloneBones[node.name] = node;
      }
  
      if (node.isSkinnedMesh) {
        cloneSkinnedMeshes[node.name] = node;
      }
    });
  
    for (let name in skinnedMeshes) {
      const skinnedMesh = skinnedMeshes[name];
      const skeleton = skinnedMesh.skeleton;
      const cloneSkinnedMesh = cloneSkinnedMeshes[name];
  
      const orderedCloneBones = [];
  
      for (let i = 0; i < skeleton.bones.length; ++i) {
        const cloneBone = cloneBones[skeleton.bones[i].name];
        orderedCloneBones.push(cloneBone);
      }
  
      cloneSkinnedMesh.bind(
          new THREE.Skeleton(orderedCloneBones, skeleton.boneInverses),
          cloneSkinnedMesh.matrixWorld);
    }
  
    return clone;
  }

