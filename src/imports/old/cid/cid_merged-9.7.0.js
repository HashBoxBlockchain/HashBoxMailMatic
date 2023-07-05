//todo https://cdn.jsdelivr.net/npm/multiformats@9.7.0/

//todo base.js
//import basex from '../../vendor/base-x.js'
//import { coerce } from '../bytes.js'

/**
 * @typedef {import('./interface').BaseEncoder} BaseEncoder
 * @typedef {import('./interface').BaseDecoder} BaseDecoder
 * @typedef {import('./interface').BaseCodec} BaseCodec
 */

/**
 * @template {string} T
 * @typedef {import('./interface').Multibase<T>} Multibase
 */
/**
 * @template {string} T
 * @typedef {import('./interface').MultibaseEncoder<T>} MultibaseEncoder
 */

/**
 * Class represents both BaseEncoder and MultibaseEncoder meaning it
 * can be used to encode to multibase or base encode without multibase
 * prefix.
 * @class
 * @template {string} Base
 * @template {string} Prefix
 * @implements {MultibaseEncoder<Prefix>}
 * @implements {BaseEncoder}
 */
class Encoder {
    /**
     * @param {Base} name
     * @param {Prefix} prefix
     * @param {(bytes:Uint8Array) => string} baseEncode
     */
    constructor (name, prefix, baseEncode) {
        this.name = name
        this.prefix = prefix
        this.baseEncode = baseEncode
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {Multibase<Prefix>}
     */
    encode (bytes) {
        if (bytes instanceof Uint8Array) {
            return `${this.prefix}${this.baseEncode(bytes)}`
        } else {
            throw Error('Unknown type, must be binary type')
        }
    }
}

/**
 * @template {string} Prefix
 * @typedef {import('./interface').MultibaseDecoder<Prefix>} MultibaseDecoder
 */

/**
 * @template {string} Prefix
 * @typedef {import('./interface').UnibaseDecoder<Prefix>} UnibaseDecoder
 */

/**
 * @template {string} Prefix
 */
/**
 * Class represents both BaseDecoder and MultibaseDecoder so it could be used
 * to decode multibases (with matching prefix) or just base decode strings
 * with corresponding base encoding.
 * @class
 * @template {string} Base
 * @template {string} Prefix
 * @implements {MultibaseDecoder<Prefix>}
 * @implements {UnibaseDecoder<Prefix>}
 * @implements {BaseDecoder}
 */
class Decoder {
    /**
     * @param {Base} name
     * @param {Prefix} prefix
     * @param {(text:string) => Uint8Array} baseDecode
     */
    constructor (name, prefix, baseDecode) {
        this.name = name
        this.prefix = prefix
        /* c8 ignore next 3 */
        if (prefix.codePointAt(0) === undefined) {
            throw new Error('Invalid prefix character')
        }
        /** @private */
        this.prefixCodePoint = /** @type {number} */ (prefix.codePointAt(0))
        this.baseDecode = baseDecode
    }

    /**
     * @param {string} text
     */
    decode (text) {
        if (typeof text === 'string') {
            if (text.codePointAt(0) !== this.prefixCodePoint) {
                throw Error(`Unable to decode multibase string ${JSON.stringify(text)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`)
            }
            return this.baseDecode(text.slice(this.prefix.length))
        } else {
            throw Error('Can only multibase decode strings')
        }
    }

    /**
     * @template {string} OtherPrefix
     * @param {UnibaseDecoder<OtherPrefix>|ComposedDecoder<OtherPrefix>} decoder
     * @returns {ComposedDecoder<Prefix|OtherPrefix>}
     */
    or (decoder) {
        return or(this, decoder)
    }
}

/**
 * @template {string} Prefix
 * @typedef {import('./interface').CombobaseDecoder<Prefix>} CombobaseDecoder
 */

/**
 * @template {string} Prefix
 * @typedef {Record<Prefix, UnibaseDecoder<Prefix>>} Decoders
 */

/**
 * @template {string} Prefix
 * @implements {MultibaseDecoder<Prefix>}
 * @implements {CombobaseDecoder<Prefix>}
 */
class ComposedDecoder {
    /**
     * @param {Record<Prefix, UnibaseDecoder<Prefix>>} decoders
     */
    constructor (decoders) {
        this.decoders = decoders
    }

    /**
     * @template {string} OtherPrefix
     * @param {UnibaseDecoder<OtherPrefix>|ComposedDecoder<OtherPrefix>} decoder
     * @returns {ComposedDecoder<Prefix|OtherPrefix>}
     */
    or (decoder) {
        return or(this, decoder)
    }

    /**
     * @param {string} input
     * @returns {Uint8Array}
     */
    decode (input) {
        const prefix = /** @type {Prefix} */ (input[0])
        const decoder = this.decoders[prefix]
        if (decoder) {
            return decoder.decode(input)
        } else {
            throw RangeError(`Unable to decode multibase string ${JSON.stringify(input)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`)
        }
    }
}

/**
 * @template {string} L
 * @template {string} R
 * @param {UnibaseDecoder<L>|CombobaseDecoder<L>} left
 * @param {UnibaseDecoder<R>|CombobaseDecoder<R>} right
 * @returns {ComposedDecoder<L|R>}
 */
export const or = (left, right) => new ComposedDecoder(/** @type {Decoders<L|R>} */({
    ...(left.decoders || { [/** @type UnibaseDecoder<L> */(left).prefix]: left }),
    ...(right.decoders || { [/** @type UnibaseDecoder<R> */(right).prefix]: right })
}))

/**
 * @template T
 * @typedef {import('./interface').MultibaseCodec<T>} MultibaseCodec
 */

/**
 * @class
 * @template {string} Base
 * @template {string} Prefix
 * @implements {MultibaseCodec<Prefix>}
 * @implements {MultibaseEncoder<Prefix>}
 * @implements {MultibaseDecoder<Prefix>}
 * @implements {BaseCodec}
 * @implements {BaseEncoder}
 * @implements {BaseDecoder}
 */
export class Codec {
    /**
     * @param {Base} name
     * @param {Prefix} prefix
     * @param {(bytes:Uint8Array) => string} baseEncode
     * @param {(text:string) => Uint8Array} baseDecode
     */
    constructor (name, prefix, baseEncode, baseDecode) {
        this.name = name
        this.prefix = prefix
        this.baseEncode = baseEncode
        this.baseDecode = baseDecode
        this.encoder = new Encoder(name, prefix, baseEncode)
        this.decoder = new Decoder(name, prefix, baseDecode)
    }

    /**
     * @param {Uint8Array} input
     */
    encode (input) {
        return this.encoder.encode(input)
    }

    /**
     * @param {string} input
     */
    decode (input) {
        return this.decoder.decode(input)
    }
}

/**
 * @template {string} Base
 * @template {string} Prefix
 * @param {Object} options
 * @param {Base} options.name
 * @param {Prefix} options.prefix
 * @param {(bytes:Uint8Array) => string} options.encode
 * @param {(input:string) => Uint8Array} options.decode
 * @returns {Codec<Base, Prefix>}
 */
export const from = ({ name, prefix, encode, decode }) =>
    new Codec(name, prefix, encode, decode)

/**
 * @template {string} Base
 * @template {string} Prefix
 * @param {Object} options
 * @param {Base} options.name
 * @param {Prefix} options.prefix
 * @param {string} options.alphabet
 * @returns {Codec<Base, Prefix>}
 */
export const baseX = ({ prefix, name, alphabet }) => {
    const { encode, decode } = base(alphabet, name)
    return from({
        prefix,
        name,
        encode,
        /**
         * @param {string} text
         */
        decode: text => coerce(decode(text))
    })
}

/**
 * @param {string} string
 * @param {string} alphabet
 * @param {number} bitsPerChar
 * @param {string} name
 * @returns {Uint8Array}
 */
const decode = (string, alphabet, bitsPerChar, name) => {
    // Build the character lookup table:
    /** @type {Record<string, number>} */
    const codes = {}
    for (let i = 0; i < alphabet.length; ++i) {
        codes[alphabet[i]] = i
    }

    // Count the padding bytes:
    let end = string.length
    while (string[end - 1] === '=') {
        --end
    }

    // Allocate the output:
    const out = new Uint8Array((end * bitsPerChar / 8) | 0)

    // Parse the data:
    let bits = 0 // Number of bits currently in the buffer
    let buffer = 0 // Bits waiting to be written out, MSB first
    let written = 0 // Next byte to write
    for (let i = 0; i < end; ++i) {
        // Read one character from the string:
        const value = codes[string[i]]
        if (value === undefined) {
            throw new SyntaxError(`Non-${name} character`)
        }

        // Append the bits to the buffer:
        buffer = (buffer << bitsPerChar) | value
        bits += bitsPerChar

        // Write out some bits if the buffer has a byte's worth:
        if (bits >= 8) {
            bits -= 8
            out[written++] = 0xff & (buffer >> bits)
        }
    }

    // Verify that we have received just enough bits:
    if (bits >= bitsPerChar || 0xff & (buffer << (8 - bits))) {
        throw new SyntaxError('Unexpected end of data')
    }

    return out
}

/**
 * @param {Uint8Array} data
 * @param {string} alphabet
 * @param {number} bitsPerChar
 * @returns {string}
 */
const encode = (data, alphabet, bitsPerChar) => {
    const pad = alphabet[alphabet.length - 1] === '='
    const mask = (1 << bitsPerChar) - 1
    let out = ''

    let bits = 0 // Number of bits currently in the buffer
    let buffer = 0 // Bits waiting to be written out, MSB first
    for (let i = 0; i < data.length; ++i) {
        // Slurp data into the buffer:
        buffer = (buffer << 8) | data[i]
        bits += 8

        // Write out as much as we can:
        while (bits > bitsPerChar) {
            bits -= bitsPerChar
            out += alphabet[mask & (buffer >> bits)]
        }
    }

    // Partial character:
    if (bits) {
        out += alphabet[mask & (buffer << (bitsPerChar - bits))]
    }

    // Add padding characters until we hit a byte boundary:
    if (pad) {
        while ((out.length * bitsPerChar) & 7) {
            out += '='
        }
    }

    return out
}

/**
 * RFC4648 Factory
 *
 * @template {string} Base
 * @template {string} Prefix
 * @param {Object} options
 * @param {Base} options.name
 * @param {Prefix} options.prefix
 * @param {string} options.alphabet
 * @param {number} options.bitsPerChar
 */
export const rfc4648 = ({ name, prefix, bitsPerChar, alphabet }) => {
    return from({
        prefix,
        name,
        encode (input) {
            return encode(input, alphabet, bitsPerChar)
        },
        decode (input) {
            return decode(input, alphabet, bitsPerChar, name)
        }
    })
}

//todo base32.js
//import { rfc4648 } from './base.js'

export const base32 = rfc4648({
    prefix: 'b',
    name: 'base32',
    alphabet: 'abcdefghijklmnopqrstuvwxyz234567',
    bitsPerChar: 5
})

export const base32upper = rfc4648({
    prefix: 'B',
    name: 'base32upper',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
    bitsPerChar: 5
})

export const base32pad = rfc4648({
    prefix: 'c',
    name: 'base32pad',
    alphabet: 'abcdefghijklmnopqrstuvwxyz234567=',
    bitsPerChar: 5
})

export const base32padupper = rfc4648({
    prefix: 'C',
    name: 'base32padupper',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=',
    bitsPerChar: 5
})

export const base32hex = rfc4648({
    prefix: 'v',
    name: 'base32hex',
    alphabet: '0123456789abcdefghijklmnopqrstuv',
    bitsPerChar: 5
})

export const base32hexupper = rfc4648({
    prefix: 'V',
    name: 'base32hexupper',
    alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUV',
    bitsPerChar: 5
})

export const base32hexpad = rfc4648({
    prefix: 't',
    name: 'base32hexpad',
    alphabet: '0123456789abcdefghijklmnopqrstuv=',
    bitsPerChar: 5
})

export const base32hexpadupper = rfc4648({
    prefix: 'T',
    name: 'base32hexpadupper',
    alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUV=',
    bitsPerChar: 5
})

export const base32z = rfc4648({
    prefix: 'h',
    name: 'base32z',
    alphabet: 'ybndrfg8ejkmcpqxot1uwisza345h769',
    bitsPerChar: 5
})

//todo base58.js
//import { baseX } from './base.js'

export const base58btc = baseX({
    name: 'base58btc',
    prefix: 'z',
    alphabet: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
})

export const base58flickr = baseX({
    name: 'base58flickr',
    prefix: 'Z',
    alphabet: '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
})

//todo base-x.js

// base-x encoding / decoding
// Copyright (c) 2018 base-x contributors
// Copyright (c) 2014-2018 The Bitcoin Core developers (base58.cpp)
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.
function base (ALPHABET, name) {
    if (ALPHABET.length >= 255) { throw new TypeError('Alphabet too long') }
    var BASE_MAP = new Uint8Array(256);
    for (var j = 0; j < BASE_MAP.length; j++) {
        BASE_MAP[j] = 255;
    }
    for (var i = 0; i < ALPHABET.length; i++) {
        var x = ALPHABET.charAt(i);
        var xc = x.charCodeAt(0);
        if (BASE_MAP[xc] !== 255) { throw new TypeError(x + ' is ambiguous') }
        BASE_MAP[xc] = i;
    }
    var BASE = ALPHABET.length;
    var LEADER = ALPHABET.charAt(0);
    var FACTOR = Math.log(BASE) / Math.log(256); // log(BASE) / log(256), rounded up
    var iFACTOR = Math.log(256) / Math.log(BASE); // log(256) / log(BASE), rounded up
    function encode (source) {
        if (source instanceof Uint8Array) ; else if (ArrayBuffer.isView(source)) {
            source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
        } else if (Array.isArray(source)) {
            source = Uint8Array.from(source);
        }
        if (!(source instanceof Uint8Array)) { throw new TypeError('Expected Uint8Array') }
        if (source.length === 0) { return '' }
        // Skip & count leading zeroes.
        var zeroes = 0;
        var length = 0;
        var pbegin = 0;
        var pend = source.length;
        while (pbegin !== pend && source[pbegin] === 0) {
            pbegin++;
            zeroes++;
        }
        // Allocate enough space in big-endian base58 representation.
        var size = ((pend - pbegin) * iFACTOR + 1) >>> 0;
        var b58 = new Uint8Array(size);
        // Process the bytes.
        while (pbegin !== pend) {
            var carry = source[pbegin];
            // Apply "b58 = b58 * 256 + ch".
            var i = 0;
            for (var it1 = size - 1; (carry !== 0 || i < length) && (it1 !== -1); it1--, i++) {
                carry += (256 * b58[it1]) >>> 0;
                b58[it1] = (carry % BASE) >>> 0;
                carry = (carry / BASE) >>> 0;
            }
            if (carry !== 0) { throw new Error('Non-zero carry') }
            length = i;
            pbegin++;
        }
        // Skip leading zeroes in base58 result.
        var it2 = size - length;
        while (it2 !== size && b58[it2] === 0) {
            it2++;
        }
        // Translate the result into a string.
        var str = LEADER.repeat(zeroes);
        for (; it2 < size; ++it2) { str += ALPHABET.charAt(b58[it2]); }
        return str
    }
    function decodeUnsafe (source) {
        if (typeof source !== 'string') { throw new TypeError('Expected String') }
        if (source.length === 0) { return new Uint8Array() }
        var psz = 0;
        // Skip leading spaces.
        if (source[psz] === ' ') { return }
        // Skip and count leading '1's.
        var zeroes = 0;
        var length = 0;
        while (source[psz] === LEADER) {
            zeroes++;
            psz++;
        }
        // Allocate enough space in big-endian base256 representation.
        var size = (((source.length - psz) * FACTOR) + 1) >>> 0; // log(58) / log(256), rounded up.
        var b256 = new Uint8Array(size);
        // Process the characters.
        while (source[psz]) {
            // Decode character
            var carry = BASE_MAP[source.charCodeAt(psz)];
            // Invalid character
            if (carry === 255) { return }
            var i = 0;
            for (var it3 = size - 1; (carry !== 0 || i < length) && (it3 !== -1); it3--, i++) {
                carry += (BASE * b256[it3]) >>> 0;
                b256[it3] = (carry % 256) >>> 0;
                carry = (carry / 256) >>> 0;
            }
            if (carry !== 0) { throw new Error('Non-zero carry') }
            length = i;
            psz++;
        }
        // Skip trailing spaces.
        if (source[psz] === ' ') { return }
        // Skip leading zeroes in b256.
        var it4 = size - length;
        while (it4 !== size && b256[it4] === 0) {
            it4++;
        }
        var vch = new Uint8Array(zeroes + (size - it4));
        var j = zeroes;
        while (it4 !== size) {
            vch[j++] = b256[it4++];
        }
        return vch
    }
    function decode (string) {
        var buffer = decodeUnsafe(string);
        if (buffer) { return buffer }
        throw new Error(`Non-${name} character`)
    }
    return {
        encode: encode,
        decodeUnsafe: decodeUnsafe,
        decode: decode
    }
}
var src = base;

var _brrp__multiformats_scope_baseX = src;

//export default _brrp__multiformats_scope_baseX;

//todo bytes.js

const empty = new Uint8Array(0)

/**
 * @param {Uint8Array} d
 */
const toHex = d => d.reduce((hex, byte) => hex + byte.toString(16).padStart(2, '0'), '')

/**
 * @param {string} hex
 */
const fromHex = hex => {
    const hexes = hex.match(/../g)
    return hexes ? new Uint8Array(hexes.map(b => parseInt(b, 16))) : empty
}

/**
 * @param {Uint8Array} aa
 * @param {Uint8Array} bb
 */
const equalBytes = (aa, bb) => {
    if (aa === bb) return true
    if (aa.byteLength !== bb.byteLength) {
        return false
    }

    for (let ii = 0; ii < aa.byteLength; ii++) {
        if (aa[ii] !== bb[ii]) {
            return false
        }
    }

    return true
}

/**
 * @param {ArrayBufferView|ArrayBuffer|Uint8Array} o
 * @returns {Uint8Array}
 */
const coerce = o => {
    if (o instanceof Uint8Array && o.constructor.name === 'Uint8Array') return o
    if (o instanceof ArrayBuffer) return new Uint8Array(o)
    if (ArrayBuffer.isView(o)) {
        return new Uint8Array(o.buffer, o.byteOffset, o.byteLength)
    }
    throw new Error('Unknown type, must be binary type')
}

/**
 * @param {any} o
 * @returns {o is ArrayBuffer|ArrayBufferView}
 */
const isBinary = o =>
    o instanceof ArrayBuffer || ArrayBuffer.isView(o)

/**
 * @param {string} str
 * @returns {Uint8Array}
 */
const fromString = str => (new TextEncoder()).encode(str)

/**
 * @param {Uint8Array} b
 * @returns {string}
 */
const toString = b => (new TextDecoder()).decode(b)

export { equalBytes, coerce, isBinary, fromHex, toHex, fromString, toString, empty }

//todo cid.js
//import * as varint from './varint.js'
//import * as Digest from './hashes/digest.js'
//import { base58btc } from './bases/base58.js'
//import { base32 } from './bases/base32.js'
//import { coerce } from './bytes.js'

/**
 * @typedef {import('./hashes/interface').MultihashDigest} MultihashDigest
 * @typedef {0 | 1} CIDVersion
 */

/**
 * @template Prefix
 * @typedef {import('./bases/interface').MultibaseEncoder<Prefix>} MultibaseEncoder
 */

/**
 * @template Prefix
 * @typedef {import('./bases/interface').MultibaseDecoder<Prefix>} MultibaseDecoder
 */

export class CID {
    /**
     * @param {CIDVersion} version
     * @param {number} code - multicodec code, see https://github.com/multiformats/multicodec/blob/master/table.csv
     * @param {MultihashDigest} multihash
     * @param {Uint8Array} bytes
     *
     */
    constructor (version, code, multihash, bytes) {
        this.code = code
        this.version = version
        this.multihash = multihash
        this.bytes = bytes

        // ArrayBufferView
        this.byteOffset = bytes.byteOffset
        this.byteLength = bytes.byteLength

        // Circular reference
        /** @private */
        this.asCID = this
        /**
         * @type {Map<string, string>}
         * @private
         */
        this._baseCache = new Map()

        // Configure private properties
        Object.defineProperties(this, {
            byteOffset: hidden,
            byteLength: hidden,

            code: readonly,
            version: readonly,
            multihash: readonly,
            bytes: readonly,

            _baseCache: hidden,
            asCID: hidden
        })
    }

    /**
     * @returns {CID}
     */
    toV0 () {
        switch (this.version) {
            case 0: {
                return this
            }
            default: {
                const { code, multihash } = this

                if (code !== DAG_PB_CODE) {
                    throw new Error('Cannot convert a non dag-pb CID to CIDv0')
                }

                // sha2-256
                if (multihash.code !== SHA_256_CODE) {
                    throw new Error('Cannot convert non sha2-256 multihash CID to CIDv0')
                }

                return CID.createV0(multihash)
            }
        }
    }

    /**
     * @returns {CID}
     */
    toV1 () {
        switch (this.version) {
            case 0: {
                const { code, digest } = this.multihash
                const multihash = digest_create(code, digest)
                return CID.createV1(this.code, multihash)
            }
            case 1: {
                return this
            }
            /* c8 ignore next 3 */
            default: {
                throw Error(`Can not convert CID version ${this.version} to version 0. This is a bug please report`)
            }
        }
    }

    /**
     * @param {any} other
     */
    equals (other) {
        return other &&
            this.code === other.code &&
            this.version === other.version &&
            digest_equals(this.multihash, other.multihash)
    }

    /**
     * @param {MultibaseEncoder<any>} [base]
     * @returns {string}
     */
    toString (base) {
        const { bytes, version, _baseCache } = this
        switch (version) {
            case 0:
                return toStringV0(bytes, _baseCache, base || base58btc.encoder)
            default:
                return toStringV1(bytes, _baseCache, base || base32.encoder)
        }
    }

    toJSON () {
        return {
            code: this.code,
            version: this.version,
            hash: this.multihash.bytes
        }
    }

    get [Symbol.toStringTag] () {
        return 'CID'
    }

    // Legacy

    [Symbol.for('nodejs.util.inspect.custom')] () {
        return 'CID(' + this.toString() + ')'
    }

    // Deprecated

    /**
     * @param {any} value
     * @returns {value is CID}
     */
    static isCID (value) {
        deprecate(/^0\.0/, IS_CID_DEPRECATION)
        return !!(value && (value[cidSymbol] || value.asCID === value))
    }

    get toBaseEncodedString () {
        throw new Error('Deprecated, use .toString()')
    }

    get codec () {
        throw new Error('"codec" property is deprecated, use integer "code" property instead')
    }

    get buffer () {
        throw new Error('Deprecated .buffer property, use .bytes to get Uint8Array instead')
    }

    get multibaseName () {
        throw new Error('"multibaseName" property is deprecated')
    }

    get prefix () {
        throw new Error('"prefix" property is deprecated')
    }

    /**
     * Takes any input `value` and returns a `CID` instance if it was
     * a `CID` otherwise returns `null`. If `value` is instanceof `CID`
     * it will return value back. If `value` is not instance of this CID
     * class, but is compatible CID it will return new instance of this
     * `CID` class. Otherwise returs null.
     *
     * This allows two different incompatible versions of CID library to
     * co-exist and interop as long as binary interface is compatible.
     * @param {any} value
     * @returns {CID|null}
     */
    static asCID (value) {
        if (value instanceof CID) {
            // If value is instance of CID then we're all set.
            return value
        } else if (value != null && value.asCID === value) {
            // If value isn't instance of this CID class but `this.asCID === this` is
            // true it is CID instance coming from a different implementation (diff
            // version or duplicate). In that case we rebase it to this `CID`
            // implementation so caller is guaranteed to get instance with expected
            // API.
            const { version, code, multihash, bytes } = value
            return new CID(version, code, multihash, bytes || encodeCID(version, code, multihash.bytes))
        } else if (value != null && value[cidSymbol] === true) {
            // If value is a CID from older implementation that used to be tagged via
            // symbol we still rebase it to this `CID` implementation by
            // delegating that to a constructor.
            const { version, multihash, code } = value
            const digest = digest_decode(multihash)
            return CID.create(version, code, digest)
        } else {
            // Otherwise value is not a CID (or an incompatible version of it) in
            // which case we return `null`.
            return null
        }
    }

    /**
     *
     * @param {CIDVersion} version - Version of the CID
     * @param {number} code - Code of the codec content is encoded in.
     * @param {MultihashDigest} digest - (Multi)hash of the of the content.
     * @returns {CID}
     */
    static create (version, code, digest) {
        if (typeof code !== 'number') {
            throw new Error('String codecs are no longer supported')
        }

        switch (version) {
            case 0: {
                if (code !== DAG_PB_CODE) {
                    throw new Error(`Version 0 CID must use dag-pb (code: ${DAG_PB_CODE}) block encoding`)
                } else {
                    return new CID(version, code, digest, digest.bytes)
                }
            }
            case 1: {
                const bytes = encodeCID(version, code, digest.bytes)
                return new CID(version, code, digest, bytes)
            }
            default: {
                throw new Error('Invalid version')
            }
        }
    }

    /**
     * Simplified version of `create` for CIDv0.
     * @param {MultihashDigest} digest - Multihash.
     */
    static createV0 (digest) {
        return CID.create(0, DAG_PB_CODE, digest)
    }

    /**
     * Simplified version of `create` for CIDv1.
     * @template {number} Code
     * @param {Code} code - Content encoding format code.
     * @param {MultihashDigest} digest - Miltihash of the content.
     * @returns {CID}
     */
    static createV1 (code, digest) {
        return CID.create(1, code, digest)
    }

    /**
     * Decoded a CID from its binary representation. The byte array must contain
     * only the CID with no additional bytes.
     *
     * An error will be thrown if the bytes provided do not contain a valid
     * binary representation of a CID.
     *
     * @param {Uint8Array} bytes
     * @returns {CID}
     */
    static decode (bytes) {
        const [cid, remainder] = CID.decodeFirst(bytes)
        if (remainder.length) {
            throw new Error('Incorrect length')
        }
        return cid
    }

    /**
     * Decoded a CID from its binary representation at the beginning of a byte
     * array.
     *
     * Returns an array with the first element containing the CID and the second
     * element containing the remainder of the original byte array. The remainder
     * will be a zero-length byte array if the provided bytes only contained a
     * binary CID representation.
     *
     * @param {Uint8Array} bytes
     * @returns {[CID, Uint8Array]}
     */
    static decodeFirst (bytes) {
        const specs = CID.inspectBytes(bytes)
        const prefixSize = specs.size - specs.multihashSize
        const multihashBytes = coerce(bytes.subarray(prefixSize, prefixSize + specs.multihashSize))
        if (multihashBytes.byteLength !== specs.multihashSize) {
            throw new Error('Incorrect length')
        }
        const digestBytes = multihashBytes.subarray(specs.multihashSize - specs.digestSize)
        const digest = new Digest(specs.multihashCode, specs.digestSize, digestBytes, multihashBytes)
        const cid = specs.version === 0 ? CID.createV0(digest) : CID.createV1(specs.codec, digest)
        return [cid, bytes.subarray(specs.size)]
    }

    /**
     * Inspect the initial bytes of a CID to determine its properties.
     *
     * Involves decoding up to 4 varints. Typically this will require only 4 to 6
     * bytes but for larger multicodec code values and larger multihash digest
     * lengths these varints can be quite large. It is recommended that at least
     * 10 bytes be made available in the `initialBytes` argument for a complete
     * inspection.
     *
     * @param {Uint8Array} initialBytes
     * @returns {{ version:CIDVersion, codec:number, multihashCode:number, digestSize:number, multihashSize:number, size:number }}
     */
    static inspectBytes (initialBytes) {
        let offset = 0
        const next = () => {
            const [i, length] = varint_decode(initialBytes.subarray(offset))
            offset += length
            return i
        }

        let version = next()
        let codec = DAG_PB_CODE
        if (version === 18) { // CIDv0
            version = 0
            offset = 0
        } else if (version === 1) {
            codec = next()
        }

        if (version !== 0 && version !== 1) {
            throw new RangeError(`Invalid CID version ${version}`)
        }

        const prefixSize = offset
        const multihashCode = next() // multihash code
        const digestSize = next() // multihash length
        const size = offset + digestSize
        const multihashSize = size - prefixSize

        return { version, codec, multihashCode, digestSize, multihashSize, size }
    }

    /**
     * Takes cid in a string representation and creates an instance. If `base`
     * decoder is not provided will use a default from the configuration. It will
     * throw an error if encoding of the CID is not compatible with supplied (or
     * a default decoder).
     *
     * @template {string} Prefix
     * @param {string} source
     * @param {MultibaseDecoder<Prefix>} [base]
     */
    static parse (source, base) {
        const [prefix, bytes] = parseCIDtoBytes(source, base)

        const cid = CID.decode(bytes)
        // Cache string representation to avoid computing it on `this.toString()`
        // @ts-ignore - Can't access private
        cid._baseCache.set(prefix, source)

        return cid
    }
}

/**
 * @template {string} Prefix
 * @param {string} source
 * @param {MultibaseDecoder<Prefix>} [base]
 * @returns {[string, Uint8Array]}
 */
const parseCIDtoBytes = (source, base) => {
    switch (source[0]) {
        // CIDv0 is parsed differently
        case 'Q': {
            const decoder = base || base58btc
            return [base58btc.prefix, decoder.decode(`${base58btc.prefix}${source}`)]
        }
        case base58btc.prefix: {
            const decoder = base || base58btc
            return [base58btc.prefix, decoder.decode(source)]
        }
        case base32.prefix: {
            const decoder = base || base32
            return [base32.prefix, decoder.decode(source)]
        }
        default: {
            if (base == null) {
                throw Error('To parse non base32 or base58btc encoded CID multibase decoder must be provided')
            }
            return [source[0], base.decode(source)]
        }
    }
}

/**
 *
 * @param {Uint8Array} bytes
 * @param {Map<string, string>} cache
 * @param {MultibaseEncoder<'z'>} base
 */
const toStringV0 = (bytes, cache, base) => {
    const { prefix } = base
    if (prefix !== base58btc.prefix) {
        throw Error(`Cannot string encode V0 in ${base.name} encoding`)
    }

    const cid = cache.get(prefix)
    if (cid == null) {
        const cid = base.encode(bytes).slice(1)
        cache.set(prefix, cid)
        return cid
    } else {
        return cid
    }
}

/**
 * @template {string} Prefix
 * @param {Uint8Array} bytes
 * @param {Map<string, string>} cache
 * @param {MultibaseEncoder<Prefix>} base
 */
const toStringV1 = (bytes, cache, base) => {
    const { prefix } = base
    const cid = cache.get(prefix)
    if (cid == null) {
        const cid = base.encode(bytes)
        cache.set(prefix, cid)
        return cid
    } else {
        return cid
    }
}

const DAG_PB_CODE = 0x70
const SHA_256_CODE = 0x12

/**
 * @param {CIDVersion} version
 * @param {number} code
 * @param {Uint8Array} multihash
 * @returns {Uint8Array}
 */
const encodeCID = (version, code, multihash) => {
    const codeOffset = varint_encodingLength(version)
    const hashOffset = codeOffset + varint_encodingLength(code)
    const bytes = new Uint8Array(hashOffset + multihash.byteLength)
    varint_encodeTo(version, bytes, 0)
    varint_encodeTo(code, bytes, codeOffset)
    bytes.set(multihash, hashOffset)
    return bytes
}

const cidSymbol = Symbol.for('@ipld/js-cid/CID')
const readonly = { writable: false, configurable: false, enumerable: true }
const hidden = { writable: false, enumerable: false, configurable: false }

// ESM does not support importing package.json where this version info
// should come from. To workaround it version is copied here.
const version = '0.0.0-dev'
// Start throwing exceptions on major version bump
/**
 *
 * @param {RegExp} range
 * @param {string} message
 */
const deprecate = (range, message) => {
    if (range.test(version)) {
        console.warn(message)
        /* c8 ignore next 3 */
    } else {
        throw new Error(message)
    }
}

const IS_CID_DEPRECATION =
    `CID.isCID(v) is deprecated and will be removed in the next major release.
Following code pattern:

if (CID.isCID(value)) {
  doSomethingWithCID(value)
}

Is replaced with:

const cid = CID.asCID(value)
if (cid) {
  // Make sure to use cid instead of value
  doSomethingWithCID(cid)
}
`
//todo digest.js
//import { coerce, equals as equalBytes } from '../bytes.js'
//import * as varint from '../varint.js'

/**
 * Creates a multihash digest.
 * @template {number} Code
 * @param {Code} code
 * @param {Uint8Array} digest
 */
export const digest_create = (code, digest) => {
    const size = digest.byteLength
    const sizeOffset = varint_encodingLength(code)
    const digestOffset = sizeOffset + varint_encodingLength(size)

    const bytes = new Uint8Array(digestOffset + size)
    varint_encodeTo(code, bytes, 0)
    varint_encodeTo(size, bytes, sizeOffset)
    bytes.set(digest, digestOffset)

    return new Digest(code, size, digest, bytes)
}

/**
 * Turns bytes representation of multihash digest into an instance.
 * @param {Uint8Array} multihash
 * @returns {MultihashDigest}
 */
export const digest_decode = (multihash) => {
    const bytes = coerce(multihash)
    const [code, sizeOffset] = varint_decode(bytes)
    const [size, digestOffset] = varint_decode(bytes.subarray(sizeOffset))
    const digest = bytes.subarray(sizeOffset + digestOffset)

    if (digest.byteLength !== size) {
        throw new Error('Incorrect length')
    }

    return new Digest(code, size, digest, bytes)
}

/**
 * @param {MultihashDigest} a
 * @param {MultihashDigest} b
 * @returns {boolean}
 */
export const digest_equals = (a, b) => {
    if (a === b) {
        return true
    } else {
        return a.code === b.code && a.size === b.size && equalBytes(a.bytes, b.bytes)
    }
}

/**
 * @typedef {import('./interface').MultihashDigest} MultihashDigest
 */

/**
 * Represents a multihash digest which carries information about the
 * hashing alogrithm and an actual hash digest.
 * @template {number} Code
 * @template {number} Size
 * @class
 * @implements {MultihashDigest}
 */
export class Digest {
    /**
     * Creates a multihash digest.
     * @param {Code} code
     * @param {Size} size
     * @param {Uint8Array} digest
     * @param {Uint8Array} bytes
     */
    constructor (code, size, digest, bytes) {
        this.code = code
        this.size = size
        this.digest = digest
        this.bytes = bytes
    }
}

//todo varint.js
//import varint from '../vendor/varint.js'

/**
 * @param {Uint8Array} data
 * @returns {[number, number]}
 */
export const varint_decode = (data) => {
    const code = vendor_varint.decode(data)
    return [code, vendor_varint.decode.bytes]
}

/**
 * @param {number} int
 * @param {Uint8Array} target
 * @param {number} [offset=0]
 */
export const varint_encodeTo = (int, target, offset = 0) => {
    vendor_varint.encode(int, target, offset)
    return target
}

/**
 * @param {number} int
 * @returns {number}
 */
export const varint_encodingLength = (int) => {
    return vendor_varint.encodingLength(int)
}

//todo vendor_varint.js

var encode_1 = vendor_varint_encode;

var MSB = 0x80
    , REST = 0x7F
    , MSBALL = ~REST
    , INT = Math.pow(2, 31);

function vendor_varint_encode(num, out, offset) {
    out = out || [];
    offset = offset || 0;
    var oldOffset = offset;

    while(num >= INT) {
        out[offset++] = (num & 0xFF) | MSB;
        num /= 128;
    }
    while(num & MSBALL) {
        out[offset++] = (num & 0xFF) | MSB;
        num >>>= 7;
    }
    out[offset] = num | 0;

    encode.bytes = offset - oldOffset + 1;

    return out
}

var vendor_varint_decode = read;

var MSB$1 = 0x80
    , REST$1 = 0x7F;

function read(buf, offset) {
    var res    = 0
        , offset = offset || 0
        , shift  = 0
        , counter = offset
        , b
        , l = buf.length;

    do {
        if (counter >= l) {
            read.bytes = 0;
            throw new RangeError('Could not decode varint')
        }
        b = buf[counter++];
        res += shift < 28
            ? (b & REST$1) << shift
            : (b & REST$1) * Math.pow(2, shift);
        shift += 7;
    } while (b >= MSB$1)

    read.bytes = counter - offset;

    return res
}

var N1 = Math.pow(2,  7);
var N2 = Math.pow(2, 14);
var N3 = Math.pow(2, 21);
var N4 = Math.pow(2, 28);
var N5 = Math.pow(2, 35);
var N6 = Math.pow(2, 42);
var N7 = Math.pow(2, 49);
var N8 = Math.pow(2, 56);
var N9 = Math.pow(2, 63);

var length = function (value) {
    return (
        value < N1 ? 1
            : value < N2 ? 2
                : value < N3 ? 3
                    : value < N4 ? 4
                        : value < N5 ? 5
                            : value < N6 ? 6
                                : value < N7 ? 7
                                    : value < N8 ? 8
                                        : value < N9 ? 9
                                            :              10
    )
};

var vendor_varint = {
    encode: encode_1
    , decode: vendor_varint_decode
    , encodingLength: length
};

var _brrp_varint = vendor_varint;

//export default _brrp_varint;