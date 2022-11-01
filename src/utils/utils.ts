import { INotification } from "jupyterlab_toastify"

/**
 * Converts seconds to a human-readable string using this format:
 * HHh MMm SSs
 * 
 * @param seconds - string
 */
export const secondsToReadableString = (seconds : string) => {
    let d = Number(seconds)

    if (!d) {
        return "-"
    }

    let h = Math.floor(d / 3600)
    let m = Math.floor(d % 3600 / 60)
    let s = Math.floor(d % 3600 % 60)
    var str = h + 'h ' + m + 'm ' + s + 's '
    return str
}


export const getProducts = (products : []) => {
    const urls = new Set()
    products.forEach((product: any) => {
        product["urls"].forEach((url) => {
            urls.add(url)
        })
    })
    
    var urls_str = Array.from(urls).join('\r\n')
    return urls_str
}



// export async function getUsernameToken(state: any, profileId:string, callback) {
//     let uname:string = 'anonymous';
//     let ticket:string = '';
  
//     if ("https://" + ade_server === document.location.origin) {
//       getUserInfo(function(profile: any) {
//         if (profile['cas:username'] === undefined) {
//           INotification.error("Get profile failed.");
//         } else {
//           uname = profile['cas:username'];
//           ticket = profile['proxyGrantingTicket'];
//           callback(uname,ticket);
//           INotification.success("Got profile.");
//         }
//       });
//     } else {
//       state.fetch(profileId).then((profile) => {
//         let profileObj = JSON.parse(JSON.stringify(profile));
//         INotification.success("Got profile.");
//         uname = profileObj.preferred_username;
//         ticket = profileObj.proxyGrantingTicket;
//         callback(uname,ticket);
//       }).catch((error) => {
//         INotification.error("Get profile failed.");
//       });
//     }
//   }