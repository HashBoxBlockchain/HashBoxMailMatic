"use strict";
//https://bradyjoslin.com/blog/encryption-webcrypto/

import {base64utils} from "./base64utils.js";

class AES {
    getPasswordKey(password){
        return window.crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(password),
            "PBKDF2",
            false,
            ["deriveKey"]
        );
    }

    deriveKey(passwordKey, salt, keyUsage){
        return window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 250000,
                hash: "SHA-256",
            },
            passwordKey,
            {name: "AES-GCM", length: 256},
            false,
            keyUsage
        );
    }

    async encryptData(message, password) {
        return new Promise(async function (resolve, reject) {
            try {
                const salt = window.crypto.getRandomValues(new Uint8Array(16));
                const iv = window.crypto.getRandomValues(new Uint8Array(12));
                const passwordKey = await aes.getPasswordKey(password);
                const aesKey = await aes.deriveKey(passwordKey, salt, ["encrypt"]);
                const encryptedContent = await window.crypto.subtle.encrypt(
                    {
                        name: "AES-GCM",
                        iv: iv,
                    },
                    aesKey,
                    new TextEncoder().encode(message)
                );

                const encryptedContentArr = new Uint8Array(encryptedContent);
                let buff = new Uint8Array(
                    salt.byteLength + iv.byteLength + encryptedContentArr.byteLength
                );
                buff.set(salt, 0);
                buff.set(iv, salt.byteLength);
                buff.set(encryptedContentArr, salt.byteLength + iv.byteLength);
                resolve(await aes.base64ArrayBuffer(buff));
            }
            catch (e) {
                reject(e);
            }
        });
    }

    async decryptData(encryptedMessage, password) {
        return new Promise(async function (resolve, reject) {
            try {
                const encryptedDataBuff = base64utils.base64DecToArr(encryptedMessage);
                const salt = encryptedDataBuff.slice(0, 16);
                const iv = encryptedDataBuff.slice(16, 16 + 12);
                const data = encryptedDataBuff.slice(16 + 12);
                const passwordKey = await aes.getPasswordKey(password);
                const aesKey = await aes.deriveKey(passwordKey, salt, ["decrypt"]);
                const decryptedContent = await window.crypto.subtle.decrypt(
                    {
                        name: "AES-GCM",
                        iv: iv,
                    },
                    aesKey,
                    data
                );
                resolve(new TextDecoder().decode(decryptedContent));
            } catch (e) {
                reject(e);
            }
        });
    }

    async base64ArrayBuffer(data) {
        // Use a FileReader to generate a base64 data URI
        const base64url = await new Promise((r) => {
            const reader = new FileReader();
            reader.onload = () => r(reader.result);
            reader.readAsDataURL(new Blob([data]));
        })

        /*
        The result looks like
        "data:application/octet-stream;base64,<your base64 data>",
        so we split off the beginning:
        */
        return base64url.split(",", 2)[1];
    }
}
const aes = new AES();
export {aes};