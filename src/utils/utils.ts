import { INotification } from "jupyterlab_toastify"
import { IStateDB } from '@jupyterlab/statedb';
import { getEnvironmentInfo } from "../api/maap_py";
import { DEFAULT_USERNAME } from "../constants";

// export function getUserInfo(callback: any): any;
// export function getToken(): any;
// export function updateKeycloakToken(seconds: any): any;


/**
 * Converts seconds to a human-readable string using this format:
 * HHh MMm SSs
 * 
 * @param seconds - string
 */
export const secondsToReadableString = (seconds: string) => {
    let d = Number(seconds)
    let h = Math.floor(d / 3600)
    let m = Math.floor(d % 3600 / 60)
    let s = Math.floor(d % 3600 % 60)
    var str = h + 'h ' + m + 'm ' + s + 's '
    return str
}


export const getProducts = (products: []) => {

    // if (products.length !> 0) {
    //     return ""
    // }

    const urls = new Set()
    products.forEach((product: any) => {
        product["urls"].forEach((url) => {
            urls.add(url)
        })
    })

    let urls_str = Array.from(urls).join('\r\n')
    return urls_str
}


export var getUserInfo = function (callback) {
    console.log("In getuserinfo")
    console.log(window.parent);
    window.parent._keycloak.loadUserInfo().success(function (profile) {
        console.log(profile);
        // key = profile['public_ssh_keys'];
        callback(profile);

    }).error(function () {
        console.log('Failed to load profile.');
        return "error";
    });
};

// export var getToken = function() {
//     return window.parent._keycloak.idToken;
// };

// export var updateKeycloakToken = function(seconds) {
//     return window.parent._keycloak.updateToken(seconds);
// };


export async function getUsernameToken(state: IStateDB, profileId: string, callback) {
    console.log("In username token")
    let uname: string = DEFAULT_USERNAME
    let ticket: string = '';

    let ade_server = ''
    let response = getEnvironmentInfo()

    response.then((data) => {
        console.log("Test env: ", data["ade_server"])
        ade_server = data["ade_server"]
    }).finally(() => {
        console.log("Test env done.")
        console.log(window.parent);
        console.log(document.location.origin)
        console.log("https://" + ade_server)
        if ("https://" + ade_server === document.location.origin) {
            console.log("first")
            console.log(document.location.origin)
            console.log("https://" + ade_server)
            getUserInfo(function (profile: any) {
                if (profile['cas:username'] === undefined) {
                    INotification.error("Get profile failed.");
                } else {
                    uname = profile['cas:username'];
                    ticket = profile['proxyGrantingTicket'];
                    callback(uname, ticket);
                    INotification.success("Got profile.");
                }
            });
        } else {
            console.log("In the fetch part")
            console.log(state)
            state.fetch(profileId).then((profile) => {
                let profileObj = JSON.parse(JSON.stringify(profile));
                INotification.success("Got profile.");
                uname = profileObj.preferred_username;
                ticket = profileObj.proxyGrantingTicket;
                callback(uname, ticket);
            }).catch((error) => {
                console.log(error)
                callback(uname, ticket);
                INotification.error("Get profile failed. ");
            });
        }
    })


}