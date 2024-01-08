import React from "react";
import {UploadFile} from "antd";

declare namespace SortFormPicture {

  type Props = {

    title?: string;

    dir?: string;

    sources?: UploadFile[];

    onChange?: (data: UploadFile[]) => void;
  }

  interface DraggableUploadItemProps {
    originNode: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
    file: UploadFile<any>;
  }

}
