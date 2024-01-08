import React from "react";
import {Button, Col, message, Row, Upload, UploadFile, UploadProps} from "antd";
import {closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import {CSS} from '@dnd-kit/utilities';
import {HolderOutlined, UploadOutlined} from "@ant-design/icons";
import Constants from "@/utils/Constants";
import {SortFormPicture} from "./API";

import styles from './index.less';

const Tag = (props: SortFormPicture.Props) => {

  const sensors = useSensors(useSensor(PointerSensor));

  const onDragEnd = (event: DragEndEvent) => {

    const {active, over} = event;

    if (!over) return;

    if (active.id !== over?.id) {

      const handler = (data: UploadFile[]) => {

        const oldIndex = data.findIndex((item) => item.uid === active.id);
        const newIndex = data.findIndex((item) => item.uid === over?.id);

        return arrayMove(data, oldIndex, newIndex);
      }

      if (props.sources && props.onChange) {
        props.onChange(handler(props.sources))
      }
    }
  };

  const onChange: UploadProps['onChange'] = ({file, fileList: newFileList}) => {

    let files = newFileList;

    if (file.status == "done") {
      files = newFileList.map(item => {
        if (item.uid == file.uid) {

          if (file.response?.code != Constants.Success) {
            item.status = "error";
            message.error(file.response?.message)
          } else {
            item.thumbUrl = file.response?.data?.url;
          }
        }

        return item;
      })
    }

    props.onChange?.(files);
  };

  const DraggableUploadListItem = ({originNode, file}: SortFormPicture.DraggableUploadItemProps) => {

    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
      id: file.uid,
    });

    const style: React.CSSProperties = {
      transform: CSS.Transform?.toString(transform),
      transition,
      display: 'flex',
      width: '100%',
    };

    return (
      <Row
        ref={setNodeRef}
        style={style}
        className={`${styles.item} ${isDragging ? 'is-dragging' : ''}`}
        {...attributes}
      >
        <Col flex='30px' className={styles.handler}>
          <HolderOutlined {...listeners} style={{cursor: 'move'}}/>
        </Col>
        <Col flex='auto'>
          {file.status === 'error' && isDragging ? originNode.props.children : originNode}
        </Col>
      </Row>
    );
  };


  return (
    <>
      <DndContext sensors={sensors} onDragEnd={onDragEnd} collisionDetection={closestCenter}>
        <SortableContext items={props.sources?.map(item => item.uid) || []} strategy={verticalListSortingStrategy}>
          <Upload
            listType='picture'
            action={Constants.Upload}
            fileList={props.sources}
            onChange={onChange}
            headers={{
              Authorization: localStorage.getItem(Constants.Authorization) as string,
            }}
            className={styles.upload}
            data={{dir: props.dir}}
            maxCount={8}
            itemRender={(originNode, file) => (
              <DraggableUploadListItem originNode={originNode} file={file}/>
            )}
          >
            <Button icon={<UploadOutlined/>}>{props.title ? props.title : '点击上传'}</Button>
          </Upload>
        </SortableContext>
      </DndContext>
    </>
  )
}

export default Tag;
