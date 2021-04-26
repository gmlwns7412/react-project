const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    Nick_name: {
        type: String,
        maxlength : 12
    },
    id:{
        type: String,
        trim: true,
        unique: 1,
        minlength: 4,
        maxlength: 16
    },
    password:{
        type: String,
        minlength: 4,
        maxlength: 16
    },
    email:{
        type: String,
        trim : true,
        unique: 1
    },
    sex:{
        type: String,
        require: true,
    },
    tall:{
        type: Number,
        require: true
    },
    weight:{
        type: Number,
        require: true
    },
    point:{
        type: Number,
        default: 0
    },
    token: {
        type: String
    },
    tokenExp:{
        type: Number
    }
})

const User = mongoose.model('User',userSchema);
module.exports = { User }