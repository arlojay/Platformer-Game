const chars = "☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~⌂ÇméâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜¬╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ";

class TextConverter {
    static uint8ToAscii(array) {
        if(!array instanceof Uint8Array) return null;

        let result = "";
        for(let i = 0; i < array.length; i++) {
            result += chars[array[i]];
        }

        return result;
    }
    static asciiToUint8(str) {
        if(typeof str != "string") return null;

        let result = [];
        for(let i = 0; i < str.length; i++) {
            result.push(chars.indexOf(str[i]));
        }

        return new Uint8Array(result);
    }
}

module.exports = TextConverter;