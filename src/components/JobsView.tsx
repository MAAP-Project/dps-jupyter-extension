import React from 'react'
import SplitPane from 'react-split-pane'
import Pane from 'react-split-pane'
import { JobDetailsContainer } from './JobDetailsContainer'
import { JobsOverviewContainer } from './JobsOverviewContainer'
import { JobsContainerActions } from '../redux/slices/JobsContainerSlice'
import { useDispatch } from 'react-redux'

export const JobsView = (): JSX.Element => {

    const dispatch = useDispatch()
    const { updateSize } = JobsContainerActions

    const handleDragFinish = (size:any) => {
        let newSize = Math.floor(size/40) - 1
        if (newSize < 1) { newSize = 1}
        dispatch(updateSize(newSize))
    }

    return (
        <SplitPane defaultSize={"60%"} split="horizontal" className="split-pane" onChange={(size) => handleDragFinish(size)}>
            <Pane defaultSize={"100%"}>
                <JobsOverviewContainer />
            </Pane>
            <Pane defaultSize={"100%"}>
                <JobDetailsContainer />
            </Pane>
        </SplitPane>
    )
}