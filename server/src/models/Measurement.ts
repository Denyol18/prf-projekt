import { Schema, Document, model } from 'mongoose';

export interface IMeasurement extends Document {
    patientId: Schema.Types.ObjectId;
    date: Date;
    bloodPressure?: number;
    pulse?: number;
    weight?: number;
    bloodSugar?: number;
}

const MeasurementSchema: Schema = new Schema({
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    date: { type: Date, required: [true, "A dátum megadása kötelező."] },
    bloodPressure: { type: Number },
    pulse: { type: Number },
    weight: { type: Number },
    bloodSugar: { type: Number },
});

export default model<IMeasurement>('Measurement', MeasurementSchema);