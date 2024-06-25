//archivo para manejar las rutas de usuarios

import { Router } from "express";
import {
  getMateriaByID,
  addMateria,
  cursar,
  auth,
  createUsers,
  logIn,
} from "../controller/users";

//objeto para manejo de url
const routerUsers = Router();

//Enpoint para loguear usuario
/**
 * @swagger
 * /user/login:
 *  post:
 *      sumary: loguear usuario
 */
routerUsers.post("/user/login", logIn);

/**
 * @swagger
 * /usersp:
 *  post:
 *      sumary: crea usuarios
 */
routerUsers.post("/user/usersp", createUsers);

//cada vez que agrego una nueva funcion debo crear una nueva ruta

routerUsers.post("/user/cursar", cursar);

routerUsers.post("/user/addMateria", addMateria);

//nueva ruta, para lista productos
routerUsers.get("/user/getMateriaByid", getMateriaByID);


export default routerUsers;
