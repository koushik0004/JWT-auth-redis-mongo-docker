const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        maxlength: 35,
        minlength: 6
    },
    lastName: {
        type: String,
        maxlength: 35,
        minlength: 6
    },
    phone: {
        type: String,
        minlength: 6
    }
});

UserSchema.pre('save', async function(next) {
    try {
        if(this.isNew) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(this.password, salt);
            this.password = hashedPassword;
        }
    } catch(err) {
        next(err);
    }
});

UserSchema.methods.isValidPassword = async function (password) {
    try{
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw error;
    }
};

const User = mongoose.model('user', UserSchema);

module.exports = User;