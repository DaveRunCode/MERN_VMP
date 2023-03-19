import express from 'express'
import { 
    registrar, 
    perfil, 
    confirmar, 
    autenticar, 
    olvidePassword, 
    comprobarToken, 
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword
} from "../controllers/veterinarioController.js";
import checkAuth from '../middleware/authMiddleware.js';

const router = express.Router();

/*  FORMA BASICA Y NORMAL DE USAR UN ROUTER */
/* router.get('/', (req, res) => {
 res.send('Desde API/Veterinarios')
}) */

/* FORMA ABREVIADA DE ROUTER USANDO CONTROLLERS */

//Area publica
router.post('/', registrar);
//Routing dinamico
router.get('/confirmar/:token', confirmar); // Si uso : hace que la variable sea dinamica
router.post('/login', autenticar);
router.post('/olvide-password', olvidePassword);
router.route("/olvide-password/:token").get(comprobarToken).post(nuevoPassword)
//Este "route" esta simplificando lo siguiente:
/*  router.get('/olvide-password/:token', comprobarToken);
    router.post('/olvide-password/:token', nuevoPassword);   */

//Area privada
router.get('/perfil',checkAuth, perfil);
router.put('/perfil/:id',checkAuth, actualizarPerfil);
router.put('/actualizar-password',checkAuth, actualizarPassword);


export default router; 