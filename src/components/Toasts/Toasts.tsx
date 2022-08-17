import { INotification } from 'jupyterlab_toastify'
import React from 'react'

export const JupyterToast = ({toastType}) => {
    var notification = null
    console.log("In jupyter toast")
    switch (toastType) {
        case "error":
            notification = INotification.error('Error')
        case "success":
            notification = INotification.success('Success');
        default:
            notification = INotification.info('Info');
    }

    return (<div>{notification}</div>
    )
}