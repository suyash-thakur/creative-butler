import { Schema, model } from "mongoose";

export type AuthToken = {
    userId: Schema.Types.ObjectId;
    timeToLive: number;
    createdAt: Date;
    updatedAt: Date;
    key: string;
}

const AuthTokenSchema = new Schema<AuthToken>({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    timeToLive: { type: Number, required: true, default: 1000 * 60 * 60 * 24 * 7 },
    key: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});


export default model<AuthToken>('AuthToken', AuthTokenSchema);

