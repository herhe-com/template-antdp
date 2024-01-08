import React, {useEffect, useRef, useState} from "react";
import {Input, InputRef, Tag as Tags, theme} from "antd";
import {closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {arrayMove, horizontalListSortingStrategy, SortableContext, useSortable} from "@dnd-kit/sortable";
import {CloseOutlined, HolderOutlined, PlusOutlined} from "@ant-design/icons";

const Tag = (props: SortFormTag.Props) => {

  const {token} = theme.useToken();
  const inputRef = useRef<InputRef>(null);
  const [inputVisible, setInputVisible] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  const [inputValue, setInputValue] = useState('');


  const onDragEnd = (event: DragEndEvent) => {

    const {active, over} = event;

    if (!over) return;

    if (active.id !== over.id) {

      const handler = (data: SortFormTag.Data[]) => {
        const oldIndex = data.findIndex((item) => item.id === active.id);
        const newIndex = data.findIndex((item) => item.id === over.id);

        return arrayMove(data, oldIndex, newIndex);
      }

      if (props.sources && props.onChange) {
        props.onChange(handler(props.sources))
      }
    }
  };


  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const onInputConfirm = () => {

    const data = props.sources || [];

    if (inputValue && data.findIndex(item => item.name == inputValue) < 0) {

      const keys = data.map(item => item.id);

      const idx = Math.max(...keys);

      props.onChange?.([...data, {id: idx + 5, name: inputValue}])
    }

    setInputVisible(false);
    setInputValue('');
  };

  const onInput = () => {
    setInputVisible(true);
  }

  const onClosed = (id: number) => {

    const newTags = props.sources?.filter(item => item.id != id) || [];

    props.onChange?.(newTags);
  }

  const DraggableTag = (props: SortFormTag.DraggableTagProps) => {

    const {tag} = props;
    const {listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: tag.id});

    const commonStyle = {
      transition: 'unset', // Prevent element from shaking after drag
    };

    const style = transform
      ? {
        ...commonStyle,
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition: isDragging ? 'unset' : transition, // Improve performance/visual effect when dragging
      }
      : commonStyle;

    return (
      <Tags style={style} ref={setNodeRef}
            icon={<HolderOutlined style={{cursor: "move"}} {...listeners}/>}
            closeIcon={<CloseOutlined onMouseDown={e => e.stopPropagation()} onClick={() => onClosed(tag.id)}/>}>
        {tag.name}
      </Tags>
    );
  };


  const tagInputStyle: React.CSSProperties = {
    width: 64,
    height: 22,
    marginInlineEnd: 8,
    verticalAlign: 'top',
  };

  const tagPlusStyle: React.CSSProperties = {
    height: 22,
    background: token.colorBgContainer,
    borderStyle: 'dashed',
  };

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible])

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={onDragEnd} collisionDetection={closestCenter}>
        <SortableContext items={props.sources || []} strategy={horizontalListSortingStrategy}>
          {props.sources?.map(item => (
            <DraggableTag tag={item} key={item.id}/>
          ))}
        </SortableContext>
      </DndContext>
      {inputVisible ? (
        <Input
          ref={inputRef}
          type="text"
          size="small"
          style={tagInputStyle}
          value={inputValue}
          onChange={onInputChange}
          onBlur={onInputConfirm}
          onPressEnter={onInputConfirm}
        />
      ) : (
        <Tags style={tagPlusStyle} icon={<PlusOutlined/>} onClick={onInput}>
          创建
        </Tags>
      )}
    </>
  )
}

export default Tag;
