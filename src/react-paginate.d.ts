declare module 'react-paginate' {
  import React from 'react';
  
  interface ReactPaginateProps {
    pageCount: number;
    pageRangeDisplayed?: number;
    marginPagesDisplayed?: number;
    previousLabel?: React.ReactNode;
    nextLabel?: React.ReactNode;
    breakLabel?: React.ReactNode;
    containerClassName?: string;
    pageClassName?: string;
    pageLinkClassName?: string;
    activeClassName?: string;
    activeLinkClassName?: string;
    previousClassName?: string;
    nextClassName?: string;
    previousLinkClassName?: string;
    nextLinkClassName?: string;
    disabledClassName?: string;
    breakClassName?: string;
    breakLinkClassName?: string;
    onPageChange?: (selectedItem: { selected: number }) => void;
    initialPage?: number;
    forcePage?: number;
    disableInitialCallback?: boolean;
    hrefBuilder?: (pageIndex: number) => string;
    extraAriaContext?: string;
    ariaLabelBuilder?: (pageIndex: number) => string;
  }
  
  const ReactPaginate: React.ComponentType<ReactPaginateProps>;
  
  export default ReactPaginate;
} 