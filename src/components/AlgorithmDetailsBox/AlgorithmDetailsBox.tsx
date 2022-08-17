import React from 'react'

export const AlgorithmDetailsBox = () => {

    var text = 'Gravida pharetra mauris, augue velit, quis faucibus nulla et quam. Faucibus accumsan turpis molestie est eleifend aliquam.'
    var repoUrl = 'https://google.com'
    var runCommand = '/bin/bash python test.py'

    return (
        <div className="algorithm-details">
            <h5>Algorithm Details</h5>
            <hr />
            <h6>Description</h6>
            <div>{text}</div>
            <h6>Repo URL</h6>
            <a href={repoUrl}>{repoUrl}</a>
            <h6>Version</h6>
            <h6>Run Command</h6>
            <div className="run-command">{runCommand}</div>
            <h6>Disc Space</h6>
        </div>
    )
}