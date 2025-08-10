import mongoose, { Document, Schema, Model } from "mongoose";
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        // default: "user",
        // enum: ["user", "admin"],
    },
    playlist: {
        type: [String],
        required: true,
        default: [],
    },
}, {
    timestamps: true,
});
const User = mongoose.model("User", userSchema);
export default User;
//# sourceMappingURL=model.js.map