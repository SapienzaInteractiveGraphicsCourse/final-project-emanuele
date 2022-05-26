import * as THREE from './libs/three.module.js'
import {GLTFLoader} from  './libs/GLTFLoader.js'
import {DRACOLoader} from "./libs/DRACOLoader.js";

var canvas, scene, dirLight, renderer, camera
var playerObject
var torso, player, leg_left, up_leg_left, leg_right, up_leg_right, arm_left, forearm_left, hand_left, head, arm_right, forearm_right, hand_right, neck, floor, floor1
var step = 160
var speed = 0.2

var randBuildingPosLeft
var randBuildingPosRight

var enemiesArray = []

var keyboard = {}

function init(){
    setUpCamera()
    setUpLight()
    setUpScene()
    setUpSkybox()
    animate()
}

function setUpSkybox(){
    var materialArray = []
    var texture_down = new THREE.TextureLoader().load("/assets/skybox/day_down.png")
    var texture_left = new THREE.TextureLoader().load("/assets/skybox/day_left.png")
    var texture_front = new THREE.TextureLoader().load("/assets/skybox/day_front.png")
    var texture_back = new THREE.TextureLoader().load("/assets/skybox/day_back.png")
    var texture_up = new THREE.TextureLoader().load("/assets/skybox/day_up.png")
    var texture_right = new THREE.TextureLoader().load("/assets/skybox/day_right.png")

    materialArray.push(new THREE.MeshBasicMaterial({map: texture_front}))
    materialArray.push(new THREE.MeshBasicMaterial({map: texture_back}))
    materialArray.push(new THREE.MeshBasicMaterial({map: texture_up}))
    materialArray.push(new THREE.MeshBasicMaterial({map: texture_down}))
    materialArray.push(new THREE.MeshBasicMaterial({map: texture_right}))
    materialArray.push(new THREE.MeshBasicMaterial({map: texture_left}))

    for(let i=0; i<6; i++)
        materialArray[i].side = THREE.BackSide

    var skyboxGeo = new THREE.BoxGeometry(100, 100, 100)
    var skybox = new THREE.Mesh(skyboxGeo, materialArray)
    scene.add(skybox)

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
    dirLight = new THREE.DirectionalLight('white', 2)
    dirLight.position.set(0, 10, 4)
}

function setUpCamera() {
    canvas = document.querySelector('.webgl')
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(0, 10, 10) // 0, 10, 5
    camera.rotation.x = (-40)*  Math.PI / 180

    renderer = new THREE.WebGLRenderer({
        antialias: false,
        canvas: canvas
    })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio * 0.8) // resolution
    renderer.shadowMap.enabled = true
    renderer.gammaOutput = true
}

function setUpScene() {
    scene = new THREE.Scene()

    loadPlayer()
    scene.add(dirLight)
    scene.add(camera)
    loadFloor()
    loadProps()
    loadEnemies()
}

function loadFloor(){
    const floorLenght = step

    const textureLoader = new THREE.TextureLoader();
    const grassNormalMap = textureLoader.load("./assets/textures/sand.jpg");
    floor = new THREE.Mesh(new THREE.BoxGeometry(floorLenght, floorLenght, 1), new THREE.MeshToonMaterial({ color: 0x00ff00, normalMap: grassNormalMap }));
    floor.rotation.x = ( 90)*  Math.PI / 180
    floor.material.normalMap.wrapS = floor.material.normalMap.wrapT = THREE.RepeatWrapping
    floor.material.normalMap.repeat.x = floor.material.normalMap.repeat.y = 4
    floor.position.set(0, -1, 0);

    floor1 = new THREE.Mesh(new THREE.BoxGeometry(floorLenght, floorLenght, 1), new THREE.MeshToonMaterial({ color: 0x00ff00, normalMap: grassNormalMap }));
    floor1.rotation.x = ( 90)*  Math.PI / 180
    floor1.material.normalMap.wrapS = floor1.material.normalMap.wrapT = THREE.RepeatWrapping
    floor1.material.normalMap.repeat.x = floor1.material.normalMap.repeat.y = 3
    floor1.position.set(0, -1, -floorLenght);

    scene.add(floor);
    scene.add(floor1);
}

function animate() {
    requestAnimationFrame(animate)

    enemiesArray.forEach(enemy => {
        if(enemy.position.z <= step/2){
            enemy.position.z += speed
        } else {
            enemy.position.z = -step/2
            enemy.position.x = getRandomValue(-3, 3)
        }
    });

    if(floor.position.z <= step){
        floor.position.z += speed
        floor1.position.z += speed
    }
    
    if(floor.position.z > step){
        floor.position.set(0, -1, -step)
    }

    if(floor1.position.z > step){
        floor1.position.set(0, -1, -step)
    }

    if(keyboard[39] && player.position.x <= 3){ // left arrow
        player.position.x += 0.2
    }

    if(keyboard[37] && player.position.x >= -2){ // right arrow
        player.position.x -= 0.2
    }

    renderer.render(scene, camera)
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
    const loader = new GLTFLoader()

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('libs/draco/');
    loader.setDRACOLoader(dracoLoader);


    loader.load('assets/player/zombie.gltf', function (gltf) {
        for (var i = 0; i < 20; i++) {
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
            zombie.position.set(getRandomValue(-3, 3), 1.6, (i * 160/20) - 80)
            enemiesArray.push(zombie)
        }
    })

}

function loadProps() {
    const loader = new GLTFLoader()
    randBuildingPosLeft =  getPropPositions()
    randBuildingPosRight =  getPropPositions()

    loader.load('assets/models/palm_long.gltf', function (gltf) {

        for(var i = 0; i < 30; i++){

            //RIGHT
            var prop = gltf.scene.clone()
            prop.scale.set(3, 3, 3)
            prop.position.set( -10 + getRandomValue(-1, 1), (i * 5.3) -80, 0)
            scene.add(prop)
            prop.rotation.x = ( -90)*  Math.PI / 180
            floor.add(prop)
            floor1.add(prop.clone())

            //LEFT
            var prop = gltf.scene.clone()
            prop.scale.set(3, 3, 3)
            prop.position.set(-23 + getRandomValue(-1, 1), (i * 5.3) -80, 0)
            scene.add(prop)
            prop.rotation.x = ( -90)*  Math.PI / 180
            floor.add(prop)
            floor1.add(prop.clone())
        }
    })

    loader.load('assets/models/road_straight.glb', function (glb) {
            var prop = glb.scene.clone()
            prop.scale.set(100, 10, 10)
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
    const loader = new GLTFLoader()
    loader.load('assets/models/' + buildingFilename, function (glb) {

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
    const loader = new GLTFLoader()

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('libs/draco/');
    loader.setDRACOLoader(dracoLoader);

    loader.load('assets/player/player.gltf', function (gltf) {
        //console.log(gltf)
        playerObject = gltf.scene
        scene.add(playerObject)
        loadPlayerHierarchy()
    })
}

function loadPlayerHierarchy() {
    if (playerObject)  {
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

      arm_right.rotation.z = 180 * Math.PI/180;
      arm_right.rotation.x = 230 * Math.PI/180;

      arm_left.rotation.z = 180 * Math.PI/180;
      arm_left.rotation.x = 140 * Math.PI/180;

      player.scale.set(1.2, 1.2, 1.2)
      player.position.y = 1.3
      
      player.rotation.y = 180 * Math.PI/180;
      player.rotation.x = 0 * Math.PI/180;

      up_leg_right.rotation.x = 140 * Math.PI/180;
      forearm_left.rotation.x = 90 * Math.PI/180;

      animatePlayer()
    }
  }

  function keyDown(event){
    keyboard[event.keyCode] = true
    console.log(event.keyCode)
  }

  function keyUp(event){
    keyboard[event.keyCode] = false
  }

  window.onload = init;
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

