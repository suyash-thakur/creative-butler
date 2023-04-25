import { Schema, model, Document } from 'mongoose';

const isLink = function isLink(val: string) {
    const regex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return regex.test(val);
}

const isEmail = function isEmail(val: string) {
    const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return regex.test(val);
}

export type User = {
    name: string;
    email: string;
    password: string;
    avatar: string;
}

export type UserDocument = Document & User;

const UserSchema = new Schema<User>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, validate: [isEmail, 'Please enter a valid email']},
    password: { type: String, required: true },
    avatar: { type: String, required: true, validate: [isLink, 'Please enter a valid link'] },
});

export default model<UserDocument>('User', UserSchema);
