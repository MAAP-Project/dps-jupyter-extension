// import React, { useEffect, useState} from 'react'
// import ReactPaginate from 'react-paginate'
// import '../../../style/JobDetailsContainer.css'

// // Example items, to simulate fetching from another resources.
// // Job items
// const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

// function Items({ currentItems }) {
//   return (
//     <> {currentItems &&
//         currentItems.map((item) => (
//           <div>
//             <h4>Item #{item}</h4>
//           </div>
//         ))}
//     </>
//   );
// }

// export function PaginationContainer({ itemsPerPage }) {
//   // We start with an empty list of items.
//   const [currentItems, setCurrentItems] = useState<any>(null);
//   const [pageCount, setPageCount] = useState(0);
//   // Here we use item offsets; we could also use page offsets
//   // following the API or data you're working with.
//   const [itemOffset, setItemOffset] = useState(0);

//   useEffect(() => {
//     // Fetch items from another resources.
//     const endOffset = itemOffset + itemsPerPage;
//     console.log(`Loading items from ${itemOffset} to ${endOffset}`);
//     setCurrentItems(items.slice(itemOffset, endOffset));
//     setPageCount(Math.ceil(items.length / itemsPerPage));
//   }, [itemOffset, itemsPerPage]);

//   // Invoke when user click to request another page.
//   const handlePageClick = (event) => {
//     const newOffset = (event.selected * itemsPerPage) % items.length;
//     console.log(
//       `User requested page number ${event.selected}, which is offset ${newOffset}`
//     );
//     setItemOffset(newOffset);
    
//   };

//   return (
//     <>
//       <div>table<Items currentItems={currentItems} /></div>
//       <ReactPaginate
//         className="pagination"
//         activeClassName="active"
//         breakLabel="..."
//         nextLabel=">"
//         onPageChange={handlePageClick}
//         pageRangeDisplayed={3}
//         pageCount={pageCount}
//         previousLabel="<"
//         pageClassName="page-item"
//         pageLinkClassName="page-link"
//         previousClassName="page-item"
//         previousLinkClassName="page-link"
//         nextClassName="page-item"
//         nextLinkClassName="page-link"
//         breakClassName="page-item"
//         breakLinkClassName="page-link"
//         marginPagesDisplayed={2}
//         // renderOnZeroPageCount={null}
//       />
//     </>
//   );
// }