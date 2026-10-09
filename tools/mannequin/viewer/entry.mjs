import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createCatalogScene} from '../../../src/volume/scene.mjs';
import {angles} from '../../biomech/validator2.js';
/* Просмотрщик для ревью: настоящая сцена атласа + свободная камера */
window.MannequinViewer={THREE,OrbitControls,createCatalogScene,angles};
