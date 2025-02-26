import React, { Fragment } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "@/components/_layout/navbar";

export default function MainLayout(): React.JSX.Element {
  return (
    <Fragment>
      <Navbar />
      <Outlet />
    </Fragment>
  );
}
