import React, { Fragment } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "@/components/_layout/navbar";

export default function MainLayout(): React.JSX.Element {
  return (
    <Fragment>
      <div className="flex flex-col h-screen">
        <Navbar />
        <Outlet />
      </div>
    </Fragment>
  );
}
