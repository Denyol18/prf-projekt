import { Schema, Document, model } from 'mongoose';

export interface IDoctor extends Document {
    userId: Schema.Types.ObjectId;
    fullName: string;
}

const DoctorSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: {
        type: String,
        required: [true, 'A név megadása kötelező.'],
        minlength: [3, 'A név legalább 3 karakter hosszú kell legyen.']
    },
});

export default model<IDoctor>('Doctor', DoctorSchema);