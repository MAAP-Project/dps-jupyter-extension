/**
 * Describes the fields to be displayed in the AlgorithmDetailsBox component.
 * The accessors are relative to the IJob type.
 */

export const ALGORITHM_DETAILS_BOX = [
    {
        header: "Description",
        accessor: "description",
        type: "text"
    },
    {
       header: "Repo URL",
       accessor: "url",
       type: "url"
   },
   {
       header: "Version",
       accessor: "version",
       type: "text"
   },
   {
       header: "Run Command",
       accessor: "command",
       type: "code"
   }
]