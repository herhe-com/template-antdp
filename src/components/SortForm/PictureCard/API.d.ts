import React from "react";
import {UploadFile} from "antd";

declare namespace SortFormPictureCard {

  type Props = {

    title?: string;

    maxCount?: number;

    dir?: string;

    simple?: boolean;

    sources?: UploadFile[];

    onChange?: (data: UploadFile[]) => void;
  }

  interface DraggableUploadItemProps {
    originNode: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
    file: UploadFile<any>;
  }

}
