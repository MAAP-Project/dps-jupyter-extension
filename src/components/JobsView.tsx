import React from 'react'
import SplitPane, { Pane } from 'react-split-pane'
import { JobDetailsContainer } from './JobDetailsContainer'
import { JobsOverviewContainer } from './JobsOverviewContainer'
import { JobsContainerActions } from '../redux/slices/JobsContainerSlice'
import { useDispatch } from 'react-redux'

export const JobsView = (): JSX.Element => {

    const dispatch = useDispatch()
    const { updateSize } = JobsContainerActions

    const handleDragFinish = (size:any) => {
        console.log("The size is: ", size)
        let newSize = Math.floor(size/40) - 1
        dispatch(updateSize(newSize))
    }

    return (
        <SplitPane defaultSize={"60%"} split="horizontal" className="split-pane" onDragFinished={(size) => handleDragFinish(size)}>
            <Pane>
                <JobsOverviewContainer />
            </Pane>
            <Pane>
                <JobDetailsContainer />
            </Pane>
        </SplitPane>
    )
}