
/**
 * Converts seconds to a human-readable string using this format:
 * HH:MM:SS
 * 
 * @param seconds - string
 */
export const secondsToReadableString = (seconds : string) => {
    let d = Number(seconds)
    let h = Math.floor(d / 3600)
    let m = Math.floor(d % 3600 / 60)
    let s = Math.floor(d % 3600 % 60)
    var str = h + 'h ' + m + 'm ' + s + 's '
    return str
}