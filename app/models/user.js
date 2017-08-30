const mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

const userSchema = mongoose.Schema({
    local : {
        email: String,
        password: String,
        apps: [{
            app_id: Number,
            app_des: String,
            app_uri: String
        }]
    }
});

//generate hash
userSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//check if password is valid
userSchema.methods.validPassword =  function(password){
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
