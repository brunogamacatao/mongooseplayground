const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Email = require('mongoose-type-email');
const uuidv4 = require('uuid/v4');

const BCRYPT_SALT_ROUNDS = 2;

// abrir uma conexão com o bd
mongoose.connect('mongodb://localhost/playground');

const usuarioSchema = new mongoose.Schema({
  email: {type: Email, required: true, unique: true},
  senha: {type: String, required: true},
  validado: {type: Boolean, default: false},
  token_validacao: {type: String, default: uuidv4()},
  data_geracao_token: {type: Date, default: Date.now}
}, { 
  timestamps: true 
});

usuarioSchema.pre('save', function (next) {
  let usuario = this;

  if (usuario.isModified('senha')) {
    bcrypt.hash(usuario.senha, BCRYPT_SALT_ROUNDS).then(senhaEncriptada => {
      usuario.senha = senhaEncriptada;
      next();
    });
  }
});

usuarioSchema.plugin(uniqueValidator);
const Usuario = mongoose.model('Usuario', usuarioSchema);

const db = mongoose.connection;
db.once('open', async () => {
  console.log('Conexão aberta');

  // Vamos inserir um post sem texto
  try {
    let u = await new Usuario({
      email: 'admin@email.com',
      senha: 'admin'
    }).save();
  } catch (erro) {
    console.log('Erros de validação:');
    for (let chave in erro.errors) {
      let tipo = erro.errors[chave].kind;
      console.log(`\tCampo: ${chave} - ${tipo}`);
      if ('properties' in erro.errors[chave]) {
        console.log(`\t\tMensagem: ${erro.errors[chave].properties.message}`);
      }
    }
  }
  
  console.log('Vou buscar os usuários no db');
  let usuarios = await Usuario.find({});
  console.log(usuarios);
});