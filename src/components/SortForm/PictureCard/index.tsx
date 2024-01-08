import React from "react";
import {message, Upload, UploadFile, UploadProps} from "antd";
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
import {SortFormPictureCard} from "./API";

import styles from './index.less';

const PictureCard = (props: SortFormPictureCard.Props) => {

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

  const DraggableUploadListItem = ({originNode, file}: SortFormPictureCard.DraggableUploadItemProps) => {

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
      <div
        ref={setNodeRef}
        style={style}
        className={`${styles.item} ${isDragging ? 'is-dragging' : ''}`}
        {...attributes}
      >
        <div {...listeners} className={styles.handler}>
          <HolderOutlined {...listeners} className={styles.icon} style={{cursor: 'move'}}/>
        </div>
        <div>
          {file.status === 'error' && isDragging ? originNode.props.children : originNode}
        </div>
      </div>
    );
  };


  return (
    <>
      <DndContext sensors={sensors} onDragEnd={onDragEnd} collisionDetection={closestCenter}>
        <SortableContext items={props.sources?.map(item => item.uid) || []} strategy={verticalListSortingStrategy}>
          <Upload
            listType='picture-card'
            action={Constants.Upload}
            fileList={props.sources}
            onChange={onChange}
            headers={{
              Authorization: localStorage.getItem(Constants.Authorization) as string,
            }}
            showUploadList={{showPreviewIcon: false}}
            className={styles.upload}
            data={{dir: props.dir}}
            maxCount={!props.maxCount || props.maxCount <= 0 ? 8 : props.maxCount}
            itemRender={(originNode, file) => (
              <DraggableUploadListItem originNode={originNode} file={file}/>
            )}
          >
            {
              (!props.sources || props.sources.length <= 8) && (
                <div className={styles.button}>
                  <UploadOutlined style={{fontSize: 24}}/>
                  {
                    (props.simple == undefined || !props.simple) &&
                    <div style={{marginTop: 8}}>
                      {props.title ? props.title : '点击上传'}
                    </div>
                  }
                </div>
              )
            }
          </Upload>
        </SortableContext>
      </DndContext>
    </>
  )
}

export default PictureCard;
