import React from "react";
import { Article } from "gql/graphql";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Button, Divider } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

type Props = {
  title: string;
  articles: Article[];
  setArticles: (articles: Article[]) => void;
};

const DragAndDropArticles = ({ title, articles, setArticles }: Props) => {
  const handleDragDrop = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const items = Array.from(articles);
    const [movedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, movedItem);

    setArticles(items);
  };

  return (
    <div className="flex flex-col gap-3">
      <Divider>{title}</Divider>

      <DragDropContext onDragEnd={handleDragDrop}>
        <Droppable droppableId="footer-sections-items">
          {(provided) => (
            <div
              className="flex flex-col gap-3"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {articles.map((item, index) => (
                <Draggable
                  draggableId={String(item.id)}
                  key={item.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      {...provided.dragHandleProps}
                      {...provided.draggableProps}
                      ref={provided.innerRef}
                      className="grid grid-cols-[auto_30px] gap-2 rounded bg-accent_100 p-2 shadow-md"
                    >
                      <p>{item.title}</p>
                      <Button
                        icon={<DeleteOutlined />}
                        size="middle"
                        type="dashed"
                        onClick={() => {
                          setArticles(articles.filter((a) => a.id !== item.id));
                        }}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default DragAndDropArticles;
