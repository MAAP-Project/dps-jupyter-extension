import { IAlgorithmsSlice, ICMRSwitchSlice, IJobsSlice, IJobsContainerSlice } from "./slices"

export interface IStore {
  Algorithms: IAlgorithmsSlice,
  CMRSwitch: ICMRSwitchSlice,
  JobsContainer: IJobsContainerSlice,
  Jobs: IJobsSlice
}
