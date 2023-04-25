import { customAlphabet } from "nanoid";

const generateKey = (len = 11, onlyDigits = false) => {
    let alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (onlyDigits) {
        alphabet = '0123456789';
    }
    const nanoid = customAlphabet(alphabet, len);
    return nanoid();
}

export default generateKey;