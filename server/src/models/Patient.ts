import { Schema, Document, model } from 'mongoose';

export interface IPatient extends Document {
    userId: Schema.Types.ObjectId;
    fullName: string;
    birthDate: Date;
    birthPlace: string;
    phone: string;
    doctorId: Schema.Types.ObjectId;
}

const PatientSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: {
        type: String,
        required: [true, 'A név megadása kötelező.'],
        minlength: [3, 'A név legalább 3 karakter hosszú kell legyen.']
    },
    birthDate: { type: Date, required: [true, 'A születési dátum megadása kötelező.'] },
    birthPlace: { type: String, required: [true, 'A születési hely megadása kötelező.'] },
    phone: {
        type: String,
        required: [true, 'A telefonszám megadása kötelező.'],
        match: [/^[0-9]{9,15}$/, 'Adj meg egy érvényes telefonszámot (9-15 számjegy).']
    },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: [true, 'Az orvos kiválasztása kötelező.'] },
});

export default model<IPatient>('Patient', PatientSchema);