import React, { ReactNode } from "react";

interface IPageSizeWrapperProps {
  children: ReactNode;
}

const PageSizeWrapper: React.FC<IPageSizeWrapperProps> = ({ children }) => {
  return <div className="page-wrapper">{children}</div>;
};

export default PageSizeWrapper;
