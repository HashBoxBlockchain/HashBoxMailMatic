"use strict";

class RSA {
    async generateKey(length){
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: length ? length : 4096,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: "SHA-256"
            },
            true,
            ["encrypt", "decrypt"]
        );

        const jwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
        const publicKey = await rsa.importPublicKey(jwk.n, jwk.e);
        const privateKey = await rsa.importPrivateKey(jwk);

        return {publicKey: publicKey, privateKey: privateKey, jwk: jwk};
    }

    async encrypt(text, publicKey, jwk){
        if(jwk){
            publicKey = await rsa.importPublicKey(jwk.n, jwk.e);
        }
        const encrypted = await rsa.encryptRSA(publicKey, (new TextEncoder()).encode(text));
        return btoa(rsa.ab2str(encrypted));
    }

    async decrypt(encrypted, privateKey, jwk){
        if(jwk){
            privateKey = await rsa.importPrivateKey(jwk);
        }
        return await rsa.decryptRSA(privateKey, rsa.str2ab(window.atob(encrypted)));
    }

    async encryptRSA(key, plaintext) {
        return await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP"
            },
            key,
            plaintext
        );
    }

    async decryptRSA(key, ciphertext) {
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP"
            },
            key,
            ciphertext
        );
        return (new TextDecoder()).decode(decrypted);
    }

    async importPublicKey(n, e) {
        return await window.crypto.subtle.importKey(
            "jwk",
            {
                kty: "RSA",
                e: e,
                n: n,
                alg: "RSA-OAEP-256",
                ext: true,
            },
            {
                name: "RSA-OAEP",
                hash: {name: "SHA-256"},
            },
            true,
            ["encrypt"]
        );
    }

    async importPrivateKey(jwk) {
        return await window.crypto.subtle.importKey(
            "jwk",
            jwk,
            {
                name: "RSA-OAEP",
                hash: "SHA-256",
            },
            true,
            ["decrypt"]
        );
    }

    str2ab(str) {
        const buf = new ArrayBuffer(str.length);
        const bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    ab2str(buf) {
        return String.fromCharCode.apply(null, new Uint8Array(buf));
    }
}
const rsa = new RSA();
export {rsa};