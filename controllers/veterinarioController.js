import Veterinario from "../models/Veterinario.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";

const registrar = async(req, res) => {
    const {email, name} = req.body
    
    //Prevenir usuarios duplicados
    const existeUsuario = await Veterinario.findOne({email})

    if( existeUsuario){
        const error = new Error("User already registered")
        return res.status(400).json({msg: error.message})
    }

    try {
        //Guardar nuevo Veterinario
        const veterinario = new Veterinario(req.body);
        const veterinarioGuardado = await veterinario.save();

        // Enviar Email //

        emailRegistro({
            email,
            name,
            token: veterinarioGuardado.token,
        });

        res.json( veterinarioGuardado );
    } catch (error) {
        console.log(error);
    }

   };

const perfil = (req, res) =>{
    const { veterinario } = req
    res.json(veterinario)
};

const confirmar = async (req, res) => {
    const {token} = req.params // Para leer la variable dinamica :token
    const usuarioConfirmar = await Veterinario.findOne({token})

    if (!usuarioConfirmar){
        const error = new Error('Invalid Token')
        return res.status(404).json({msg: error.message});
    }

    try {
        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        await usuarioConfirmar.save();

        res.json({msg:'Your account has been confirmed'})
    } catch (error) {
        console.log(error);
    }

}

const autenticar = async (req, res) => {
    const { email, password } = req.body

    //Comprobar si usuario existe
    const usuario = await Veterinario.findOne({email})

    if (!usuario){
        const error = new Error("User doesn't exist")
        return res.status(404).json({msg: error.message});
    }

    // Comprobar usuario confirmado
    if(!usuario.confirmado){
        const error = new Error('Your account has not been confirmed')
        return res.status(403).json({msg: error.message});
    }

    //Revisar el password
    if (await usuario.comprobarPassword(password)) {
        //Autenticar al usuario
        res.json({
            _id: usuario._id,
            name: usuario.name,
            email: usuario.email,
            token: generarJWT(usuario.id),
        });
    } else {
        const error = new Error('Incorrect password')
        return res.status(404).json({msg: error.message});
    }
    
}

const olvidePassword = async (req, res) => {
    const { email } = req.body;
    
    const existeVeterinario = await Veterinario.findOne({email})
    if(!existeVeterinario){
        const error = new Error("User doesn't exist")
        return res.status(400).json({msg: error.message});
    }

    try {
        existeVeterinario.token = generarId();
        await existeVeterinario.save()
        //Enviar email con instrucciones
        emailOlvidePassword({
            email,
            name: existeVeterinario.name,
            token: existeVeterinario.token
        })

        res.json({msg: 'We have sent an email with the instructions'});
    } catch (error) {
        console.log(error);
    }

};

const comprobarToken = async (req, res) => {
    const {token} = req.params

    const tokenValido = await Veterinario.findOne({token})

    if(tokenValido){
        // El token es valido el usuario existe
        res.json({msg:'Token valido y el usuario existe'})
    } else {
        const error = new Error('Token no valido')
        return res.status(400).json({msg: error.message});
    }
}

const nuevoPassword = async (req, res) => {
    const {token} = req.params
    const {password} = req.body

    const veterinario = await Veterinario.findOne({token})
    if (!veterinario) {
        const error = new Error('There was an error')
        return res.status(400).json({msg: error.message});
    }

    try {
        veterinario.token = null
        veterinario.password = password
        await veterinario.save()
        res.json({msg:'Password changed successfully'})
    } catch (error) {
        console.log(error);
    }

}

const actualizarPerfil = async (req, res) => {
    const veterinario = await Veterinario.findById(req.params.id);
    if(!veterinario){
        const error = new Error('Error')
        return res.status(400).json({msg: error.message})
    }

    const {email} = req.body
    if(veterinario.email !== req.body.email){
        const existeEmail= await Veterinario.findOne({email})
        if(existeEmail){
            const error = new Error('Email already exists')
            return res.status(400).json({msg: error.message})
        }
    }

    try {
        veterinario.name = req.body.name
        veterinario.email = req.body.email
        veterinario.web = req.body.web
        veterinario.telefono = req.body.telefono

        const veterinarioActualizado = await veterinario.save()
        res.json(veterinarioActualizado);
    } catch (error) {
        console.log(error);
    }
}

const actualizarPassword = async (req, res) =>{
    //Leer los datos
    const {id} = req.veterinario
    const {pwd_actual, pwd_nuevo} = req.body

    //Comprobar veterinario existe
    const veterinario = await Veterinario.findById(id)
    if (!veterinario) {
        const error = new Error('There was an error')
        return res.status(400).json({msg: error.message});
    }

    //comprobar password
    if( await veterinario.comprobarPassword(pwd_actual)) {
        //Almacenar nuevo password
        veterinario.password = pwd_nuevo
        await veterinario.save();
        res.json({msg:'Password udpated successfully'})
    } else {
        const error = new Error('The current password is incorrect')
        return res.status(400).json({msg: error.message});
    }

    

}

export {
    registrar,
    perfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword
}
