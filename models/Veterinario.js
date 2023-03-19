import mongoose, { mongo } from "mongoose";
import bcrypt from "bcrypt"
import generarId from "../helpers/generarId.js";

const veterinarioSchema = mongoose.Schema({
    name: {
        type:String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type:String,
        required: true,
        unique: true,
        trim: true
    },
    telefono: {
        type:String,
        trim: true,
        default: null
    },
    web: {
        type:String,
        default: null
    },
    token:{
        type: String,
        default: generarId(),
    },
    confirmado:{
        type:Boolean,
        default: false
    }
})

//Middleware de Mongoose
veterinarioSchema.pre('save', async function (next) { // usamos function y no arrow function para tomar el scope local y no global

    if (!this.isModified("password")) { //Si el password ya esta hasheado no volver a hashear
        next();
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
});

//Comparamos la contrasena y el hash
veterinarioSchema.methods.comprobarPassword = async function (passwordFormulario) {
    return await bcrypt.compare(passwordFormulario, this.password )
}

const Veterinario = mongoose.model('Veterinario', veterinarioSchema)

export default Veterinario;

