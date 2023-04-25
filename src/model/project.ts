import { Schema, model } from 'mongoose';

type Project = {
    name: string;
    type: string;
    description: string;
    status: string;
    targetAudience: string;
    targetAge: string;
    targetGender: string;
    goals: Array<string>;
    keywords: Array<string>;
    brandIdentity: string;
    brandVoice: string;
    toneOfVoice: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema = new Schema<Project>({
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String },
    targetAudience: { type: String },
    targetAge: { type: String },
    targetGender: { type: String },
    goals: { type: [String] },
    keywords: { type: [String] },
    brandIdentity: { type: String },
    brandVoice: { type: String },
    toneOfVoice: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export default model<Project>('Project', ProjectSchema);

