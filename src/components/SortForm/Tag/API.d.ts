declare namespace SortFormTag {

  type Props = {

    sources?: Data[];

    onChange?: (data: SortFormTag.Data[]) => void;
  }

  type DraggableTagProps = {
    tag: SortFormTag.Data;
  };

  type Data = {
    id: number;
    name: string;
  }

}
