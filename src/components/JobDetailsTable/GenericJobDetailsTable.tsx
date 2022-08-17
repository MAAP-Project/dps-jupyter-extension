import React from 'react'

export const GenericJobDetailsTable = (props): JSX.Element => {

    return (
        <>
        {props.data ? <table className='table'>
            <tbody>
                {props.data.map(item => {
                    return <tr>
                        <td>{item.header}</td>
                        <td>{item.value ? item.value : '-'}</td>
                    </tr>;
                })}
            </tbody>
        </table> : 'No data'}
        </>
    )
}