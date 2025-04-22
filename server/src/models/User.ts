import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password: string;
    role: 'patient' | 'doctor';
}

const UserSchema: Schema = new Schema({
    email: {
        type: String,
        required: [true, 'Az email megadása kötelező.'],
        unique: true,
        match: [/\S+@\S+\.\S+/, 'Érvényes email címet adj meg.']
    },
    password: {
        type: String,
        required: [true, 'A jelszó megadása kötelező.'],
        minlength: [6, 'A jelszónak legalább 6 karakterből kell állnia.']
    },
    role: { type: String, enum: ['patient', 'doctor'], required: true },
});

export default mongoose.model<IUser>('User', UserSchema);